"""Backend-friendly single-image inference for vanilla and LoRA InternVL."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .config import IMAGE_SIZE, MODEL_ID
from .dataset import build_image_transform
from .model import get_model_image_size, load_model
from .utils import cuda_oom_message, infer_task


def _open_rgb_image(image_path: str | Path):
    path = Path(image_path)
    if not path.is_file():
        raise FileNotFoundError(f"Image does not exist: {path}")
    try:
        from PIL import Image, UnidentifiedImageError

        with Image.open(path) as image:
            return image.convert("RGB")
    except (OSError, UnidentifiedImageError) as exc:
        raise ValueError(f"Could not decode image {path}: {exc}") from exc


def generate_answer(
    model,
    tokenizer,
    image: Any,
    prompt: str,
    image_size: int = IMAGE_SIZE,
    max_new_tokens: int = 128,
) -> str:
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("prompt must be a non-empty string.")
    import torch

    expected_image_size = get_model_image_size(model)
    if image_size != expected_image_size:
        raise ValueError(
            f"Model expects image_size={expected_image_size}, but inference received {image_size}."
        )
    transform = build_image_transform(image_size)
    parameter = next(model.parameters())
    pixel_values = transform(image.convert("RGB")).unsqueeze(0).to(
        device=parameter.device, dtype=parameter.dtype
    )
    generation_config = {
        "max_new_tokens": max_new_tokens,
        "do_sample": False,
        "num_beams": 1,
    }
    question = prompt.strip()
    if "<image>" not in question:
        question = "<image>\n" + question
    try:
        with torch.inference_mode():
            answer = model.chat(tokenizer, pixel_values, question, generation_config)
    except torch.cuda.OutOfMemoryError as exc:
        raise RuntimeError(cuda_oom_message()) from exc
    return str(answer).strip()


def query_single_image(
    image_path,
    prompt,
    adapter_path=None,
):
    """Load the requested model and answer one VQA or caption prompt."""
    image = _open_rgb_image(image_path)
    model, tokenizer = load_model(adapter_path=adapter_path)
    answer = generate_answer(model, tokenizer, image, prompt)
    return {"task": infer_task(prompt), "answer": answer}


def main() -> None:
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Query one remote-sensing image with InternVL3.")
    parser.add_argument("image_path")
    parser.add_argument("prompt")
    parser.add_argument("--adapter", default=None)
    parser.add_argument("--model_id", default=MODEL_ID)
    parser.add_argument("--max_new_tokens", type=int, default=128)
    parser.add_argument("--allow_cpu", action="store_true")
    args = parser.parse_args()

    image = _open_rgb_image(args.image_path)
    model, tokenizer = load_model(
        adapter_path=args.adapter,
        model_id=args.model_id,
        device="cpu" if args.allow_cpu else "cuda",
    )
    answer = generate_answer(model, tokenizer, image, args.prompt, max_new_tokens=args.max_new_tokens)
    print(json.dumps({"task": infer_task(args.prompt), "answer": answer}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
