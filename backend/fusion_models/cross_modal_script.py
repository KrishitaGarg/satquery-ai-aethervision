"""Run the trained cross-modal InternVL LoRA adapter on one S2/S1 pair."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import numpy as np
import rasterio
import torch
from PIL import Image
from peft import PeftModel
from torchvision import transforms
from torchvision.transforms import InterpolationMode
from transformers import AutoModel, AutoTokenizer


MODEL_ID = "OpenGVLab/InternVL3-1B-Instruct"
MODEL_REVISION = "f91c6391476dbc8fd07674d2589e8168d3ca667f"
IMAGE_SIZE = 448
TIFF_SUFFIXES = {".tif", ".tiff"}

S2_REFLECTANCE_MIN = 0.0
S2_REFLECTANCE_MAX = 0.30
S1_VV_DB_MIN = -25.0
S1_VV_DB_MAX = 0.0
S1_VH_DB_MIN = -32.5
S1_VH_DB_MAX = -5.0
S1_RATIO_DB_MIN = -5.0
S1_RATIO_DB_MAX = 20.0
SAR_EPSILON = 1e-8

IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Lambda(lambda image: image.convert("RGB")),
        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE),
            interpolation=InterpolationMode.BICUBIC,
        ),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225),
        ),
    ]
)


def fixed_normalize(array: np.ndarray, minimum: float, maximum: float) -> np.ndarray:
    array = np.nan_to_num(array, nan=minimum, posinf=maximum, neginf=minimum)
    array = np.clip(array, minimum, maximum)
    return (array - minimum) / (maximum - minimum)


def get_band(patch: dict[str, np.ndarray], name: str) -> np.ndarray:
    if name not in patch:
        raise KeyError(f"Required band {name!r} is missing; found {sorted(patch)}")
    band = np.asarray(patch[name], dtype=np.float32).squeeze()
    if band.ndim != 2:
        raise ValueError(f"Band {name} must be 2D, received {band.shape}")
    return band


def sentinel2_to_rgb(patch: dict[str, np.ndarray]) -> Image.Image:
    channels = [
        fixed_normalize(
            get_band(patch, name) / 10_000.0,
            S2_REFLECTANCE_MIN,
            S2_REFLECTANCE_MAX,
        )
        for name in ("B04", "B03", "B02")
    ]
    return Image.fromarray(np.round(np.stack(channels, axis=-1) * 255).astype(np.uint8))


def sentinel1_to_pseudorgb(patch: dict[str, np.ndarray]) -> Image.Image:
    vv_db = get_band(patch, "VV")
    vh_db = get_band(patch, "VH")
    vv = fixed_normalize(vv_db, S1_VV_DB_MIN, S1_VV_DB_MAX)
    vh = fixed_normalize(vh_db, S1_VH_DB_MIN, S1_VH_DB_MAX)

    ratio = np.power(10.0, vv_db / 10.0) / (
        np.power(10.0, vh_db / 10.0) + SAR_EPSILON
    )
    ratio = np.nan_to_num(
        ratio,
        nan=SAR_EPSILON,
        posinf=10 ** (S1_RATIO_DB_MAX / 10.0),
        neginf=SAR_EPSILON,
    )
    ratio_db = 10.0 * np.log10(np.maximum(ratio, SAR_EPSILON))
    ratio_channel = fixed_normalize(ratio_db, S1_RATIO_DB_MIN, S1_RATIO_DB_MAX)
    rgb = np.stack((vv, vh, ratio_channel), axis=-1)
    return Image.fromarray(np.round(rgb * 255).astype(np.uint8))


def find_band_file(directory: Path, band_name: str) -> Path:
    matches = []
    for path in directory.rglob("*"):
        tokens = re.split(r"[^A-Z0-9]+", path.stem.upper())
        if path.is_file() and path.suffix.lower() in TIFF_SUFFIXES and band_name in tokens:
            matches.append(path)
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected exactly one {band_name} TIFF under {directory}; found {matches}"
        )
    return matches[0]


def read_single_band(path: Path) -> np.ndarray:
    with rasterio.open(path) as source:
        if source.count != 1:
            raise ValueError(f"{path} must contain exactly one band")
        return source.read(1)


def read_band_directory(directory: Path, band_names: tuple[str, ...]) -> dict[str, np.ndarray]:
    return {name: read_single_band(find_band_file(directory, name)) for name in band_names}


def read_multiband_tiff(path: Path, band_names: tuple[str, ...]) -> dict[str, np.ndarray]:
    def normalize(value: str | None) -> str:
        return re.sub(r"[^A-Z0-9]", "", str(value or "").upper())

    with rasterio.open(path) as source:
        descriptions = [normalize(value) for value in source.descriptions]
        result = {}
        for name in band_names:
            wanted = normalize(name)
            matches = [
                index + 1
                for index, description in enumerate(descriptions)
                if description == wanted or description.endswith(wanted)
            ]
            if len(matches) != 1:
                raise ValueError(
                    f"{path} must identify {name} in its band descriptions; "
                    f"found {source.descriptions}"
                )
            result[name] = source.read(matches[0])
        return result


def prepare_image(source: str, kind: str) -> Image.Image:
    path = Path(source)
    if not path.exists():
        raise FileNotFoundError(path)

    names = ("B04", "B03", "B02") if kind == "optical" else ("VV", "VH")
    convert = sentinel2_to_rgb if kind == "optical" else sentinel1_to_pseudorgb

    if path.is_dir():
        return convert(read_band_directory(path, names))
    if path.suffix.lower() in TIFF_SUFFIXES:
        return convert(read_multiband_tiff(path, names))
    with Image.open(path) as image:
        return image.convert("RGB")


def build_prompt(question: str) -> str:
    return (
        "<image>\n"
        "<image>\n\n"
        "Image 1 is a Sentinel-2 optical observation.\n"
        "Image 2 is a Sentinel-1 SAR observation of the same co-registered "
        "geographic area.\n\n"
        "Use complementary information from both images.\n"
        "Answer with only the concise answer.\n\n"
        f"Question: {question.strip()}"
    )


def load_model(adapter_path: Path, device: torch.device):
    if not (adapter_path / "adapter_model.safetensors").is_file():
        raise FileNotFoundError(f"Adapter weights not found under {adapter_path}")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        revision=MODEL_REVISION,
        trust_remote_code=True,
        use_fast=False,
    )
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token = tokenizer.eos_token

    dtype = torch.float16 if device.type == "cuda" else torch.float32
    model = AutoModel.from_pretrained(
        MODEL_ID,
        revision=MODEL_REVISION,
        trust_remote_code=True,
        low_cpu_mem_usage=True,
        torch_dtype=dtype,
        use_flash_attn=False,
    ).to(device)
    model.img_context_token_id = tokenizer.convert_tokens_to_ids("<IMG_CONTEXT>")
    model.language_model = PeftModel.from_pretrained(
        model.language_model,
        str(adapter_path),
        is_trainable=False,
    )
    model.language_model.config.use_cache = True
    model.eval()
    return model, tokenizer, dtype


@torch.inference_mode()
def query(
    optical_path: str,
    sar_path: str,
    question: str,
    adapter_path: Path,
    device: torch.device,
) -> str:
    model, tokenizer, dtype = load_model(adapter_path, device)
    optical = IMAGE_TRANSFORM(prepare_image(optical_path, "optical"))
    sar = IMAGE_TRANSFORM(prepare_image(sar_path, "sar"))
    pixel_values = torch.stack((optical, sar), dim=0).to(device=device, dtype=dtype)

    answer = model.chat(
        tokenizer,
        pixel_values,
        build_prompt(question),
        {
            "max_new_tokens": 32,
            "do_sample": False,
            "num_beams": 1,
            "pad_token_id": tokenizer.pad_token_id,
            "eos_token_id": tokenizer.eos_token_id,
        },
        num_patches_list=[1, 1],
        history=None,
        return_history=False,
    )
    return str(answer[0] if isinstance(answer, tuple) else answer).strip()


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--optical", required=True, help="Sentinel-2 RGB image or B04/B03/B02 TIFF source")
    parser.add_argument("--sar", required=True, help="Sentinel-1 pseudo-RGB image or VV/VH TIFF source")
    parser.add_argument("--question", required=True)
    parser.add_argument(
        "--adapter",
        type=Path,
        default=script_dir / "cross_modal_adapter",
        help="Extracted adapter directory",
    )
    parser.add_argument("--device", choices=("auto", "cuda", "cpu"), default="auto")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    device_name = "cuda" if args.device == "auto" and torch.cuda.is_available() else args.device
    if device_name == "auto":
        device_name = "cpu"
    if device_name == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA was requested but no CUDA GPU is available")

    answer = query(
        optical_path=args.optical,
        sar_path=args.sar,
        question=args.question,
        adapter_path=args.adapter.resolve(),
        device=torch.device(device_name),
    )
    print(answer)


if __name__ == "__main__":
    main()