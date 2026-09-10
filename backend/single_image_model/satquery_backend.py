"""Small, framework-neutral backend wrapper for the SatQuery LoRA adapter."""

from __future__ import annotations

import io
import threading
from pathlib import Path
from typing import BinaryIO

from PIL import Image

from single_image.inference import generate_answer
from single_image.model import load_model
from single_image.utils import infer_task

DEFAULT_ADAPTER_DIR = Path(__file__).resolve().parent / "adapter"


def _decode_rgb_image(source: str | Path | bytes | bytearray | BinaryIO | Image.Image) -> Image.Image:
    if isinstance(source, Image.Image):
        return source.convert("RGB")
    if isinstance(source, (str, Path)):
        with Image.open(source) as image:
            return image.convert("RGB")
    if isinstance(source, (bytes, bytearray)):
        with Image.open(io.BytesIO(source)) as image:
            return image.convert("RGB")
    if hasattr(source, "read"):
        with Image.open(source) as image:
            return image.convert("RGB")
    raise TypeError("image must be a path, bytes, a binary stream, or a PIL image")


class SatQueryEngine:
    """Load the base model and adapter once, then reuse them across requests."""

    def __init__(
        self,
        adapter_dir: str | Path = DEFAULT_ADAPTER_DIR,
        device: str | None = None,
        precision: str | None = None,
        max_new_tokens: int = 128,
    ) -> None:
        import torch

        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.precision = precision or ("fp16" if self.device.startswith("cuda") else "fp32")
        self.max_new_tokens = max_new_tokens
        self.model, self.tokenizer = load_model(
            adapter_path=adapter_dir,
            device=self.device,
            precision=self.precision,
        )
        # Serialize generation on a shared model. Scale with multiple worker processes/GPUs
        # rather than issuing concurrent generate() calls against one model instance.
        self._generation_lock = threading.Lock()

    def answer(
        self,
        image: str | Path | bytes | bytearray | BinaryIO | Image.Image,
        prompt: str,
        max_new_tokens: int | None = None,
    ) -> dict[str, str]:
        decoded = _decode_rgb_image(image)
        with self._generation_lock:
            answer = generate_answer(
                self.model,
                self.tokenizer,
                decoded,
                prompt,
                max_new_tokens=max_new_tokens or self.max_new_tokens,
            )
        return {"task": infer_task(prompt), "answer": answer}


__all__ = ["SatQueryEngine"]
