"""Run one ordered T1/T2 CDVQA inference with the bundled InternVL LoRA adapter.
Modified to support CPU inference when no CUDA GPU is available.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MODEL_ID = "OpenGVLab/InternVL3-1B-Instruct"
MODEL_REVISION = "f91c6391476dbc8fd07674d2589e8168d3ca667f"
CHECKPOINT_DIR = ROOT / "checkpoint"
IMAGE_T1 = ROOT / "pictures" / "im1.png"
IMAGE_T2 = ROOT / "pictures" / "im2.png"
DEFAULT_QUESTION = "Did the regions of non-vegetated ground surface change?"
IMAGE_SIZE = 448
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--question", default=DEFAULT_QUESTION)
    parser.add_argument("--model-name-or-path", default=MODEL_ID)
    parser.add_argument("--cache-dir")
    return parser.parse_args()


def validate_inputs() -> None:
    from PIL import Image

    required = (
        IMAGE_T1,
        IMAGE_T2,
        CHECKPOINT_DIR / "adapter_config.json",
        CHECKPOINT_DIR / "adapter_model.safetensors",
    )
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing required inference files: {missing}")
    for path in (IMAGE_T1, IMAGE_T2):
        with Image.open(path) as image:
            if image.size != (512, 512):
                raise ValueError(f"Expected a 512x512 source image: {path}")
            image.verify()


def preprocess_image(path: Path):
    import torch
    from PIL import Image
    from torchvision.transforms import InterpolationMode
    from torchvision.transforms.functional import normalize, pil_to_tensor, resize

    with Image.open(path) as source:
        image = source.convert("RGB")
    image = resize(image, [IMAGE_SIZE, IMAGE_SIZE], InterpolationMode.BICUBIC, antialias=True)
    tensor = pil_to_tensor(image).to(dtype=torch.float32).div_(255.0)
    return normalize(tensor, IMAGENET_MEAN, IMAGENET_STD)


def build_prompt(question: str) -> str:
    cleaned = " ".join(question.split())
    if not cleaned:
        raise ValueError("Question must not be empty.")
    return (
        "Image-1: <image>\n"
        "Image-2: <image>\n\n"
        "Image 1 is the earlier observation (T1 / before).\n"
        "Image 2 is the later observation (T2 / after).\n\n"
        "Both images show the same spatially corresponding geographic area.\n"
        "Compare the two observations carefully.\n"
        "Answer with only the short dataset answer and no explanation.\n\n"
        f"Question: {cleaned}"
    )


def load_model(model_name_or_path: str, cache_dir: str | None):
    """
    Loads the model on GPU if available, otherwise falls back to CPU.
    Returns (model, tokenizer, device, dtype) so callers know what was used.
    """
    import torch
    from peft import PeftModel
    from transformers import AutoModel, AutoTokenizer

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32

    tokenizer = AutoTokenizer.from_pretrained(
        model_name_or_path,
        revision=MODEL_REVISION,
        trust_remote_code=True,
        use_fast=False,
        cache_dir=cache_dir,
    )
    model = AutoModel.from_pretrained(
        model_name_or_path,
        revision=MODEL_REVISION,
        torch_dtype=dtype,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
        use_flash_attn=False,
        cache_dir=cache_dir,
    ).to(device)
    model.language_model = PeftModel.from_pretrained(
        model.language_model,
        str(CHECKPOINT_DIR),
        is_trainable=False,
    )
    model.eval()
    return model, tokenizer, device, dtype


def infer(question: str, model_name_or_path: str, cache_dir: str | None) -> dict[str, str]:
    import torch

    validate_inputs()
    model, tokenizer, device, dtype = load_model(model_name_or_path, cache_dir)
    pixels = torch.stack([preprocess_image(IMAGE_T1), preprocess_image(IMAGE_T2)])
    if tuple(pixels.shape) != (2, 3, 448, 448):
        raise ValueError(f"Unexpected paired tensor shape: {tuple(pixels.shape)}")
    pixels = pixels.to(device=device, dtype=dtype)
    with torch.inference_mode():
        response = model.chat(
            tokenizer,
            pixels,
            build_prompt(question),
            {"max_new_tokens": 16, "do_sample": False, "num_beams": 1},
            num_patches_list=[1, 1],
        )
    answer = re.sub(r"^answer\s*:\s*", "", str(response).strip().lower(), count=1)
    answer = re.sub(r"\s+", " ", answer.splitlines()[0]).rstrip(".!?").strip()
    return {"task": "bitemporal_vqa", "answer": answer}


def main() -> None:
    args = parse_args()
    result = infer(args.question, args.model_name_or_path, args.cache_dir)
    result.update(
        {
            "image_1": "pictures/im1.png (T1/BEFORE)",
            "image_2": "pictures/im2.png (T2/AFTER)",
            "question": args.question,
        }
    )
    print(json.dumps(result, indent=2), flush=True)


if __name__ == "__main__":
    main()