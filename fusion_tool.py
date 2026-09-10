import sys
from pathlib import Path
import torch

# Point this to wherever you extracted the teammate's zip
sys.path.append(str(Path("C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\fusion_models")))

from cross_modal_script import load_model, prepare_image, build_prompt, IMAGE_TRANSFORM

ADAPTER_PATH = Path("fusion_models")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the model ONCE when the server starts, not per-request
print("Loading fusion model, this may take a minute...")
_model, _tokenizer, _dtype = load_model(ADAPTER_PATH, DEVICE)
print("Fusion model loaded.")


def real_fusion_tool(images, question):
    """
    images: list of 2 file paths — images[0] = optical, images[1] = SAR
    question: text question
    Returns: dict matching our contract
    """
    optical_path, sar_path = images[0], images[1]

    optical = IMAGE_TRANSFORM(prepare_image(optical_path, "optical"))
    sar = IMAGE_TRANSFORM(prepare_image(sar_path, "sar"))
    pixel_values = torch.stack((optical, sar), dim=0).to(device=DEVICE, dtype=_dtype)

    answer = _model.chat(
        _tokenizer,
        pixel_values,
        build_prompt(question),
        {
            "max_new_tokens": 32,
            "do_sample": False,
            "num_beams": 1,
            "pad_token_id": _tokenizer.pad_token_id,
            "eos_token_id": _tokenizer.eos_token_id,
        },
        num_patches_list=[1, 1],
        history=None,
        return_history=False,
    )
    answer_text = str(answer[0] if isinstance(answer, tuple) else answer).strip()

    return {"answer": answer_text, "confidence": 0.9}  # their script doesn't give a real confidence score, so we use a fixed placeholder