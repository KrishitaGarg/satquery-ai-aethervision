"""Single-image VQA and captioning with InternVL3."""

from .inference import query_single_image
from .model import load_model

__all__ = ["load_model", "query_single_image"]
