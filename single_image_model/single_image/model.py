"""Reusable InternVL3 model loading and LoRA helpers."""

from __future__ import annotations

import json
from contextlib import contextmanager
from pathlib import Path
from typing import Sequence

from .config import (
    ATTENTION_TARGETS,
    DEFAULT_SYSTEM_PROMPT,
    IMG_CONTEXT_TOKEN,
    LORA_ALPHA,
    LORA_DROPOUT,
    LORA_R,
    MLP_TARGETS,
    MODEL_ID,
)

ADAPTER_METADATA_FILE = "single_image_adapter.json"


@contextmanager
def peft_data_parallel_checkpoint_loading():
    """Disable PEFT's tensor-parallel sharder for this DDP-only pipeline.

    Some PEFT/Transformers version combinations classify Qwen projection layers as
    tensor-parallel during adapter loading, then import TP classes unavailable in the
    installed Transformers release. Each process in this project owns a complete model
    replica, so checkpoint tensors must not be TP-sharded.
    """
    import peft.utils.save_and_load as peft_save_and_load

    name = "_maybe_shard_state_dict_for_tp"
    original = getattr(peft_save_and_load, name, None)
    if original is None:
        yield
        return
    setattr(peft_save_and_load, name, lambda *args, **kwargs: None)
    try:
        yield
    finally:
        setattr(peft_save_and_load, name, original)


def _require_torch_cuda(device: str) -> None:
    import torch

    if device.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError(
            "CUDA is unavailable. InternVL3-1B FP16 training/inference is intended for a Kaggle GPU "
            "session. In Kaggle choose Settings > Accelerator > GPU."
        )


def _read_adapter_base_model(adapter_path: str | Path) -> str:
    path = Path(adapter_path)
    if not path.is_dir():
        raise FileNotFoundError(f"LoRA adapter directory not found: {path}")
    config_path = path / "adapter_config.json"
    if not config_path.is_file():
        raise FileNotFoundError(
            f"Invalid adapter path {path}: adapter_config.json is missing. "
            "Point --adapter at the directory produced by train.py."
        )
    metadata_path = path / ADAPTER_METADATA_FILE
    if metadata_path.is_file():
        try:
            with metadata_path.open("r", encoding="utf-8") as handle:
                return str(json.load(handle).get("base_model_id", MODEL_ID))
        except (json.JSONDecodeError, OSError) as exc:
            raise ValueError(f"Invalid adapter metadata in {metadata_path}: {exc}") from exc
    return MODEL_ID


def load_model(
    adapter_path: str | Path | None = None,
    model_id: str = MODEL_ID,
    device: str = "cuda",
    training: bool = False,
    use_flash_attn: bool = False,
    precision: str = "fp16",
):
    """Load vanilla InternVL3 or the same base model with a local PEFT adapter."""
    try:
        import torch
        from transformers import AutoModel, AutoTokenizer
    except ImportError as exc:
        raise RuntimeError("Install requirements.txt before loading InternVL.") from exc

    _require_torch_cuda(device)
    if adapter_path is not None:
        adapter_base = _read_adapter_base_model(adapter_path)
        if model_id == MODEL_ID:
            model_id = adapter_base
        elif model_id != adapter_base:
            raise ValueError(
                f"Adapter was trained for {adapter_base!r}, but --model_id is {model_id!r}."
            )
    if precision not in {"fp16", "bf16", "fp32"}:
        raise ValueError(f"Unsupported precision {precision!r}; choose fp16, bf16, or fp32.")
    if precision == "bf16" and device.startswith("cuda") and not torch.cuda.is_bf16_supported():
        raise RuntimeError("BF16 was requested, but this CUDA device does not report BF16 support.")
    dtype_by_name = {"fp16": torch.float16, "bf16": torch.bfloat16, "fp32": torch.float32}
    dtype = dtype_by_name[precision] if device.startswith("cuda") else torch.float32
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True, use_fast=False)
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token_id = tokenizer.eos_token_id
    model = AutoModel.from_pretrained(
        model_id,
        torch_dtype=dtype,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
        use_flash_attn=use_flash_attn,
    )
    if not hasattr(model, "language_model") or not hasattr(model, "vision_model"):
        raise TypeError(f"{model_id!r} did not load as an InternVL chat model.")
    context_id = tokenizer.convert_tokens_to_ids(IMG_CONTEXT_TOKEN)
    if context_id is None or context_id == tokenizer.unk_token_id:
        raise ValueError(f"Tokenizer for {model_id!r} does not contain {IMG_CONTEXT_TOKEN}.")
    model.img_context_token_id = context_id

    if adapter_path is not None:
        try:
            from peft import PeftModel
        except ImportError as exc:
            raise RuntimeError("PEFT is required to load the LoRA adapter. Install requirements.txt.") from exc
        with peft_data_parallel_checkpoint_loading():
            model.language_model = PeftModel.from_pretrained(
                model.language_model, str(adapter_path), is_trainable=training
            )
    model.to(device)
    model.train(training)
    return model, tokenizer


def get_num_image_tokens(model) -> int:
    count = getattr(model, "num_image_token", None)
    if isinstance(count, int) and count > 0:
        return count
    config = model.config
    image_size = int(getattr(config, "force_image_size", None) or config.vision_config.image_size)
    patch_size = int(config.vision_config.patch_size)
    downsample = float(getattr(config, "downsample_ratio", 0.5))
    count = int((image_size // patch_size) ** 2 * downsample**2)
    if count <= 0:
        raise ValueError("Could not determine InternVL image-token count from model configuration.")
    return count


def get_system_prompt(model) -> str:
    return str(getattr(model, "system_message", None) or DEFAULT_SYSTEM_PROMPT)


def get_model_image_size(model) -> int:
    return int(getattr(model.config, "force_image_size", None) or model.config.vision_config.image_size)


def attach_lora_for_training(
    model,
    r: int = LORA_R,
    alpha: int = LORA_ALPHA,
    dropout: float = LORA_DROPOUT,
    include_mlp: bool = True,
    target_modules: Sequence[str] | None = None,
) -> list[str]:
    """Freeze the VLM and put a PEFT LoRA adapter on compatible LLM projections."""
    try:
        from peft import LoraConfig, TaskType, get_peft_model
    except ImportError as exc:
        raise RuntimeError("PEFT is required for training. Install requirements.txt.") from exc

    for parameter in model.parameters():
        parameter.requires_grad = False
    # The vision tower is frozen, so checkpointing it cannot save trainable activations and emits
    # "inputs have requires_grad=False" warnings. Keep checkpointing only in the trainable LLM path.
    if hasattr(model.vision_model, "gradient_checkpointing"):
        model.vision_model.gradient_checkpointing = False
    vision_encoder = getattr(model.vision_model, "encoder", None)
    if vision_encoder is not None and hasattr(vision_encoder, "gradient_checkpointing"):
        vision_encoder.gradient_checkpointing = False
    available_suffixes = {name.rsplit(".", 1)[-1] for name, _ in model.language_model.named_modules()}
    requested = list(target_modules or ATTENTION_TARGETS)
    missing_attention = [name for name in requested if name not in available_suffixes]
    if missing_attention:
        raise ValueError(
            "The language model does not expose required LoRA target modules: "
            + ", ".join(missing_attention)
        )
    selected = requested
    if include_mlp:
        selected += [name for name in MLP_TARGETS if name in available_suffixes]
    config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=r,
        lora_alpha=alpha,
        lora_dropout=dropout,
        target_modules=selected,
        bias="none",
    )
    base_language_model = model.language_model
    if hasattr(base_language_model, "gradient_checkpointing_enable"):
        try:
            base_language_model.gradient_checkpointing_enable(
                gradient_checkpointing_kwargs={"use_reentrant": False}
            )
        except TypeError:
            base_language_model.gradient_checkpointing_enable()
    if hasattr(base_language_model, "enable_input_require_grads"):
        base_language_model.enable_input_require_grads()
    model.language_model = get_peft_model(base_language_model, config)
    model.language_model.config.use_cache = False
    return selected


def trainable_parameter_summary(model) -> tuple[int, int]:
    trainable = sum(parameter.numel() for parameter in model.parameters() if parameter.requires_grad)
    total = sum(parameter.numel() for parameter in model.parameters())
    return trainable, total


def save_adapter(model, tokenizer, output_dir: str | Path, base_model_id: str = MODEL_ID) -> None:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    language_model = model.language_model
    if not hasattr(language_model, "peft_config"):
        raise TypeError("The model has no PEFT language-model adapter to save.")
    language_model.save_pretrained(output, safe_serialization=True)
    tokenizer.save_pretrained(output)
    with (output / ADAPTER_METADATA_FILE).open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "base_model_id": base_model_id,
                "architecture": "InternVLChatModel.language_model",
                "image_size": 448,
            },
            handle,
            indent=2,
        )
