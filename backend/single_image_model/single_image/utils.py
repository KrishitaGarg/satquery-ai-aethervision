"""Small shared helpers with no heavyweight import side effects."""

from __future__ import annotations

import json
import os
import random
import re
import string
from pathlib import Path
from typing import Any, Iterable


def set_seed(seed: int) -> None:
    """Seed Python, NumPy, and PyTorch when those packages are available."""
    random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import numpy as np

        np.random.seed(seed)
    except ImportError:
        pass
    try:
        import torch

        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
    except ImportError:
        pass


def read_json(path: str | Path) -> Any:
    path = Path(path)
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in annotation file {path}: {exc}") from exc


def write_json(path: str | Path, value: Any) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False)


def find_file(
    root: str | Path,
    candidates: Iterable[str],
    explicit_path: str | Path | None = None,
) -> Path:
    """Resolve an explicit annotation or safely auto-detect a known filename."""
    root = Path(root)
    if explicit_path:
        path = Path(explicit_path)
        if not path.is_absolute():
            path = root / path
        if not path.is_file():
            raise FileNotFoundError(f"Annotation file not found: {path}")
        return path
    if not root.is_dir():
        raise FileNotFoundError(f"Dataset root does not exist or is not a directory: {root}")
    by_lower_name: dict[str, list[Path]] = {}
    for path in root.rglob("*.json"):
        by_lower_name.setdefault(path.name.lower(), []).append(path)
    for candidate in candidates:
        matches = by_lower_name.get(candidate.lower(), [])
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            raise RuntimeError(
                f"Multiple files named {candidate!r} found under {root}. "
                "Pass the exact annotation path explicitly."
            )
    expected = ", ".join(candidates)
    raise FileNotFoundError(
        f"Could not find a supported annotation JSON under {root}. Expected one of: {expected}. "
        "Pass an explicit path if your file has a different name."
    )


def normalize_vqa_answer(text: str) -> str:
    """Conservative exact-match normalization: case, whitespace, punctuation."""
    text = str(text).lower().strip()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return re.sub(r"\s+", " ", text)


def infer_task(prompt: str) -> str:
    normalized = re.sub(r"\s+", " ", prompt.lower()).strip()
    caption_starts = ("describe ", "caption ", "provide a description", "summarize the image")
    return "caption" if normalized.startswith(caption_starts) else "vqa"


def cuda_oom_message() -> str:
    return (
        "CUDA ran out of memory. Try reducing --batch_size (keep it at 1), reducing "
        "--max_seq_length, keeping one image patch, and confirming gradient checkpointing is enabled."
    )
