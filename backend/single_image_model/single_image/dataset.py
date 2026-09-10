"""VRSBench discovery, parsing, image access, and InternVL SFT dataset."""

from __future__ import annotations

import io
import os
import random
import re
import zipfile
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

from .config import (
    CAPTION_EVAL_JSON_CANDIDATES,
    CAPTION_PROMPT,
    EVAL_IMAGE_ARCHIVES,
    IMAGE_SIZE,
    IMAGENET_MEAN,
    IMAGENET_STD,
    TRAIN_IMAGE_ARCHIVES,
    TRAIN_JSON_CANDIDATES,
    VQA_EVAL_JSON_CANDIDATES,
)
from .utils import find_file, read_json


@dataclass(frozen=True)
class VRSExample:
    image: str
    prompt: str
    answer: str
    task: str
    example_id: str
    question_type: str = ""

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


def _first_turn(record: dict[str, Any], sender: str) -> str:
    for turn in record.get("conversations", []):
        if str(turn.get("from", "")).lower() == sender:
            return str(turn.get("value", "")).strip()
    return ""


def classify_training_prompt(prompt: str) -> str | None:
    lowered = prompt.lower()
    if "[caption]" in lowered:
        return "caption"
    if "[vqa]" in lowered:
        return "vqa"
    if "[refer]" in lowered or "[ground" in lowered:
        return None
    return None


def clean_vqa_prompt(prompt: str) -> str:
    prompt = re.sub(r"<image>", "", prompt, flags=re.IGNORECASE)
    prompt = re.sub(r"\[vqa\]", "", prompt, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", prompt).strip()


def load_training_examples(
    dataset_root: str | Path,
    annotation_path: str | Path | None = None,
    max_captions: int | None = None,
    max_vqa: int | None = 40000,
    seed: int = 42,
) -> list[VRSExample]:
    """Load only caption and VQA records from the official LLaVA-format train JSON."""
    path = find_file(dataset_root, TRAIN_JSON_CANDIDATES, annotation_path)
    records = read_json(path)
    if not isinstance(records, list):
        raise ValueError(f"Expected a JSON list in {path}, got {type(records).__name__}")

    captions: list[VRSExample] = []
    vqa: list[VRSExample] = []
    malformed = 0
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            malformed += 1
            continue
        raw_prompt = _first_turn(record, "human")
        answer = _first_turn(record, "gpt")
        image = str(record.get("image", "")).strip()
        task = classify_training_prompt(raw_prompt)
        if not task:
            continue
        if not image or not answer:
            malformed += 1
            continue
        example = VRSExample(
            image=image,
            prompt=CAPTION_PROMPT if task == "caption" else f"Question: {clean_vqa_prompt(raw_prompt)}",
            answer=answer,
            task=task,
            example_id=f"train-{index}",
        )
        (captions if task == "caption" else vqa).append(example)
    if malformed:
        print(f"Warning: skipped {malformed} malformed training records from {path}.")
    if not captions or not vqa:
        raise ValueError(
            f"No usable {'caption' if not captions else 'VQA'} records found in {path}. "
            "Expected prompts tagged [caption] and [vqa]."
        )

    rng = random.Random(seed)
    if max_captions is not None and max_captions > 0 and len(captions) > max_captions:
        captions = rng.sample(captions, max_captions)
    if max_vqa is not None and max_vqa > 0 and len(vqa) > max_vqa:
        vqa = rng.sample(vqa, max_vqa)
    examples = captions + vqa
    rng.shuffle(examples)
    return examples


def load_evaluation_examples(
    dataset_root: str | Path,
    task: str,
    annotation_path: str | Path | None = None,
    limit: int | None = None,
    seed: int = 42,
) -> list[VRSExample]:
    if task not in {"vqa", "caption"}:
        raise ValueError(f"Unsupported evaluation task {task!r}; expected 'vqa' or 'caption'.")
    candidates = VQA_EVAL_JSON_CANDIDATES if task == "vqa" else CAPTION_EVAL_JSON_CANDIDATES
    path = find_file(dataset_root, candidates, annotation_path)
    records = read_json(path)
    if not isinstance(records, list):
        raise ValueError(f"Expected a JSON list in {path}, got {type(records).__name__}")
    examples: list[VRSExample] = []
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            continue
        image = str(record.get("image_id", record.get("image", ""))).strip()
        answer = str(record.get("ground_truth", record.get("answer", ""))).strip()
        question = str(record.get("question", CAPTION_PROMPT)).strip()
        if not image or not answer:
            continue
        prompt = CAPTION_PROMPT if task == "caption" else f"Question: {question}"
        examples.append(
            VRSExample(
                image=image,
                prompt=prompt,
                answer=answer,
                task=task,
                example_id=str(record.get("question_id", f"{task}-{index}")),
                question_type=str(record.get("type", "")),
            )
        )
    if not examples:
        raise ValueError(f"No usable {task} examples found in {path}.")
    if limit is not None and limit > 0 and len(examples) > limit:
        examples = random.Random(seed).sample(examples, limit)
    return examples


class ImageResolver:
    """Resolve images by relative path or basename from directories or VRSBench ZIP files."""

    _EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}

    def __init__(
        self,
        dataset_root: str | Path,
        split: str,
        image_root: str | Path | None = None,
        image_archive: str | Path | None = None,
    ) -> None:
        self.dataset_root = Path(dataset_root)
        self.split = split
        self._zip: zipfile.ZipFile | None = None
        self._zip_pid: int | None = None
        self.archive_path = None if image_root and not image_archive else self._resolve_archive(image_archive)
        self.image_root = self._resolve_image_root(image_root) if self.archive_path is None else None
        self._index = self._build_index()

    def _resolve_archive(self, explicit: str | Path | None) -> Path | None:
        if explicit:
            path = Path(explicit)
            if not path.is_absolute():
                path = self.dataset_root / path
            if not path.is_file():
                raise FileNotFoundError(f"Image archive not found: {path}")
            if not zipfile.is_zipfile(path):
                raise ValueError(f"Image archive is not a readable ZIP file: {path}")
            return path
        candidates = TRAIN_IMAGE_ARCHIVES if self.split == "train" else EVAL_IMAGE_ARCHIVES
        found: list[Path] = []
        for path in self.dataset_root.rglob("*.zip"):
            if path.name.lower() in {name.lower() for name in candidates}:
                found.append(path)
        if not found:
            split_words = ("train",) if self.split == "train" else ("val", "eval", "test")
            plausible = [
                path
                for path in self.dataset_root.rglob("*.zip")
                if "image" in path.name.lower()
                and any(word in path.name.lower() for word in split_words)
            ]
            if len(plausible) == 1:
                found = plausible
        if len(found) > 1:
            raise RuntimeError(
                f"Multiple {self.split} image archives found: {', '.join(str(path) for path in found)}. "
                "Pass --image_archive explicitly."
            )
        return found[0] if found else None

    def _resolve_image_root(self, explicit: str | Path | None) -> Path:
        if explicit:
            root = Path(explicit)
            if not root.is_absolute():
                root = self.dataset_root / root
            if not root.is_dir():
                raise FileNotFoundError(f"Image directory not found: {root}")
            return root
        return self.dataset_root

    @staticmethod
    def _unique_basename_index(paths: Iterable[str]) -> dict[str, str | None]:
        index: dict[str, str | None] = {}
        for path in paths:
            basename = Path(path).name.lower()
            index[basename] = path if basename not in index else None
        return index

    def _build_index(self) -> dict[str, str | None]:
        if self.archive_path:
            with zipfile.ZipFile(self.archive_path) as archive:
                paths = [
                    name for name in archive.namelist()
                    if not name.endswith("/") and Path(name).suffix.lower() in self._EXTENSIONS
                ]
        else:
            assert self.image_root is not None
            paths = [
                str(path.relative_to(self.image_root))
                for path in self.image_root.rglob("*")
                if path.is_file() and path.suffix.lower() in self._EXTENSIONS
            ]
        if not paths:
            location = self.archive_path or self.image_root
            raise FileNotFoundError(
                f"No supported images found in {location}. Extract Images_{self.split}.zip or pass "
                "--image_archive/--image_root explicitly."
            )
        self._exact_paths = set(paths)
        return self._unique_basename_index(paths)

    def resolve(self, image_name: str) -> str:
        normalized = image_name.replace("\\", "/").lstrip("./")
        if self.archive_path:
            if normalized in self._exact_paths:
                return normalized
        else:
            assert self.image_root is not None
            direct = self.image_root / normalized
            if direct.is_file():
                return normalized
        match = self._index.get(Path(normalized).name.lower(), "__missing__")
        if match == "__missing__":
            raise FileNotFoundError(f"Image {image_name!r} was not found in the configured {self.split} images.")
        if match is None:
            raise FileNotFoundError(
                f"Image basename {Path(normalized).name!r} is ambiguous. Use an annotation with a relative path."
            )
        return match

    def _get_zip(self) -> zipfile.ZipFile:
        pid = os.getpid()
        if self._zip is None or self._zip_pid != pid:
            if self._zip is not None:
                self._zip.close()
            assert self.archive_path is not None
            self._zip = zipfile.ZipFile(self.archive_path)
            self._zip_pid = pid
        return self._zip

    def open_image(self, image_name: str):
        """Return a decoded RGB PIL image, with a useful error for corrupt data."""
        try:
            from PIL import Image, UnidentifiedImageError
        except ImportError as exc:
            raise RuntimeError("Pillow is required to load images. Install requirements.txt.") from exc
        resolved = self.resolve(image_name)
        try:
            if self.archive_path:
                payload = self._get_zip().read(resolved)
                with Image.open(io.BytesIO(payload)) as image:
                    return image.convert("RGB")
            assert self.image_root is not None
            with Image.open(self.image_root / resolved) as image:
                return image.convert("RGB")
        except (OSError, UnidentifiedImageError) as exc:
            raise ValueError(f"Could not decode image {image_name!r}: {exc}") from exc

    def __getstate__(self):
        state = self.__dict__.copy()
        state["_zip"] = None
        state["_zip_pid"] = None
        return state

    def close(self) -> None:
        if self._zip is not None:
            self._zip.close()
            self._zip = None


def build_image_transform(image_size: int = IMAGE_SIZE):
    try:
        import torchvision.transforms as transforms
        from torchvision.transforms.functional import InterpolationMode
    except ImportError as exc:
        raise RuntimeError("torchvision is required for image preprocessing. Install requirements.txt.") from exc
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size), interpolation=InterpolationMode.BICUBIC),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )


def expand_image_token(prompt: str, num_image_tokens: int) -> str:
    from .config import IMG_CONTEXT_TOKEN, IMG_END_TOKEN, IMG_START_TOKEN

    replacement = IMG_START_TOKEN + IMG_CONTEXT_TOKEN * num_image_tokens + IMG_END_TOKEN
    if "<image>" in prompt:
        return prompt.replace("<image>", replacement, 1)
    return replacement + "\n" + prompt


def encode_conversation(
    tokenizer,
    prompt: str,
    answer: str,
    num_image_tokens: int,
    max_length: int,
    system_prompt: str,
) -> dict[str, Any]:
    """Encode InternVL's internvl2_5 ChatML template and mask non-answer tokens."""
    import torch

    user_text = expand_image_token(f"<image>\n{prompt}", num_image_tokens)
    prefix = (
        f"<|im_start|>system\n{system_prompt}<|im_end|>\n"
        f"<|im_start|>user\n{user_text}<|im_end|>\n"
        "<|im_start|>assistant\n"
    )
    full = prefix + answer.strip() + "<|im_end|>\n"
    prefix_ids = tokenizer(prefix, add_special_tokens=False).input_ids
    encoded = tokenizer(full, add_special_tokens=False, truncation=True, max_length=max_length)
    input_ids = encoded.input_ids
    # Byte-level BPE may merge the boundary newline with the first answer token. Mask the
    # longest identical token prefix so that such a boundary token remains supervised.
    prefix_length = 0
    for prefix_id, full_id in zip(prefix_ids, input_ids):
        if prefix_id != full_id:
            break
        prefix_length += 1
    if prefix_length < len(prefix_ids) - 2:
        raise ValueError("Tokenizer produced an unexpected mismatch inside the InternVL prompt prefix.")
    if len(input_ids) <= prefix_length:
        raise ValueError(
            f"Answer was fully truncated at max_length={max_length}; increase --max_seq_length."
        )
    labels = [-100] * prefix_length + input_ids[prefix_length:]
    context_token_id = tokenizer.convert_tokens_to_ids("<IMG_CONTEXT>")
    if input_ids.count(context_token_id) != num_image_tokens:
        raise ValueError(
            "Image context tokens were not encoded correctly or were truncated; verify the InternVL "
            "tokenizer and increase --max_seq_length."
        )
    return {
        "input_ids": torch.tensor(input_ids, dtype=torch.long),
        "labels": torch.tensor(labels, dtype=torch.long),
        "attention_mask": torch.ones(len(input_ids), dtype=torch.long),
    }


class InternVLSFTDataset:
    """Lazy single-patch dataset accepted by InternVLChatModel.forward."""

    def __init__(
        self,
        examples: Sequence[VRSExample],
        image_resolver: ImageResolver,
        tokenizer,
        num_image_tokens: int,
        max_length: int,
        system_prompt: str,
        image_size: int = IMAGE_SIZE,
    ) -> None:
        self.examples = list(examples)
        self.image_resolver = image_resolver
        self.tokenizer = tokenizer
        self.num_image_tokens = num_image_tokens
        self.max_length = max_length
        self.system_prompt = system_prompt
        self.transform = build_image_transform(image_size)

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, index: int) -> dict[str, Any]:
        import torch

        example = self.examples[index]
        image = self.image_resolver.open_image(example.image)
        item = encode_conversation(
            self.tokenizer,
            example.prompt,
            example.answer,
            self.num_image_tokens,
            self.max_length,
            self.system_prompt,
        )
        item["pixel_values"] = self.transform(image).unsqueeze(0)
        item["image_flags"] = torch.ones(1, dtype=torch.long)
        return item


class InternVLDataCollator:
    def __init__(self, pad_token_id: int) -> None:
        self.pad_token_id = pad_token_id

    def __call__(self, features: Sequence[dict[str, Any]]) -> dict[str, Any]:
        import torch
        from torch.nn.utils.rnn import pad_sequence

        return {
            "input_ids": pad_sequence(
                [item["input_ids"] for item in features], batch_first=True, padding_value=self.pad_token_id
            ),
            "labels": pad_sequence(
                [item["labels"] for item in features], batch_first=True, padding_value=-100
            ),
            "attention_mask": pad_sequence(
                [item["attention_mask"] for item in features], batch_first=True, padding_value=0
            ),
            "pixel_values": torch.cat([item["pixel_values"] for item in features], dim=0),
            "image_flags": torch.cat([item["image_flags"] for item in features], dim=0),
        }
