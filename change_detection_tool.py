"""
Wrapper for teammate 5's change detection model (bi-temporal VQA).
Loads the model ONCE at import time (not per-request), accepts arbitrary
uploaded image paths (not just the bundled demo pair), and returns output
matching our standard contract: {"answer": ..., "confidence": ...}
"""

import sys
import re
from pathlib import Path

# Point this to wherever change_detection_model folder actually lives
sys.path.append(str(Path("C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\change_detection_model")))

import torch
from peft import PeftModel
from transformers import AutoModel, AutoTokenizer
from PIL import Image
from torchvision.transforms import InterpolationMode
from torchvision.transforms.functional import normalize, pil_to_tensor, resize

from inference import (
    MODEL_ID,
    MODEL_REVISION,
    CHECKPOINT_DIR,
    IMAGE_SIZE,
    IMAGENET_MEAN,
    IMAGENET_STD,
    build_prompt,
)

DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE.startswith("cuda") else torch.float32

print("Loading change detection model, this may take a minute...")
_tokenizer = AutoTokenizer.from_pretrained(
    MODEL_ID,
    revision=MODEL_REVISION,
    trust_remote_code=True,
    use_fast=False,
)
_model = AutoModel.from_pretrained(
    MODEL_ID,
    revision=MODEL_REVISION,
    torch_dtype=DTYPE,
    low_cpu_mem_usage=True,
    trust_remote_code=True,
    use_flash_attn=False,
).to(DEVICE)
_model.language_model = PeftModel.from_pretrained(
    _model.language_model,
    str(CHECKPOINT_DIR),
    is_trainable=False,
)
_model.eval()
print("Change detection model loaded.")


def _preprocess_any_image(path):
    """
    Same preprocessing as teammate 5's script, but auto-resizes any input
    image to IMAGE_SIZE regardless of original dimensions, instead of
    rejecting anything that isn't exactly 512x512.
    """
    with Image.open(path) as source:
        image = source.convert("RGB")
    image = resize(image, [IMAGE_SIZE, IMAGE_SIZE], InterpolationMode.BICUBIC, antialias=True)
    tensor = pil_to_tensor(image).to(dtype=torch.float32).div_(255.0)
    return normalize(tensor, IMAGENET_MEAN, IMAGENET_STD)


def real_change_detection_tool(images, question):
    """
    images: list of 2 file paths — images[0] = before/T1, images[1] = after/T2
    question: text question
    Returns: dict matching our contract
    """
    image_t1_path, image_t2_path = images[0], images[1]

    pixels = torch.stack([
        _preprocess_any_image(image_t1_path),
        _preprocess_any_image(image_t2_path),
    ])
    pixels = pixels.to(device=DEVICE, dtype=DTYPE)

    with torch.inference_mode():
        response = _model.chat(
            _tokenizer,
            pixels,
            build_prompt(question),
            {"max_new_tokens": 16, "do_sample": False, "num_beams": 1},
            num_patches_list=[1, 1],
        )

    answer = re.sub(r"^answer\s*:\s*", "", str(response).strip().lower(), count=1)
    answer = re.sub(r"\s+", " ", answer.splitlines()[0]).rstrip(".!?").strip()

    # Clean up underscore-separated dataset-style labels into readable text
    readable_answer = answer.replace("_", " ").strip()
    return {"answer": readable_answer, "confidence": 0.85} 