"""
Wrapper for teammate 4's single-image model (VQA / captioning / grounding).
Loads the model ONCE at import time (not per-request), then exposes a
function matching our standard contract: {"answer": ..., "confidence": ...}
"""

import sys
from pathlib import Path

sys.path.append(str(Path("C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\single_image_model")))

from single_image_model.satquery_backend import SatQueryEngine

# Load once when the server starts, not per-request
print("Loading single-image model, this may take a minute...")
_engine = SatQueryEngine(device="cpu")  # change to device=None to auto-use GPU if available
print("Single-image model loaded.")


def real_single_image_tool(images, question):
    """
    images: list of 1 file path (single-image tasks only need one)
    question: text question
    Returns: dict matching our contract
    """
    image_path = images[0]

    result = _engine.answer(image_path, question)
    # result already looks like {"task": ..., "answer": ...}
    # their script doesn't return a confidence score, so we use a fixed placeholder
    return {"answer": result["answer"], "confidence": 0.85}