"""Shared defaults for the Kaggle training and inference scripts."""

MODEL_ID = "OpenGVLab/InternVL3-1B-Instruct"
IMAGE_SIZE = 448
MAX_SEQUENCE_LENGTH = 1024
SEED = 42

CAPTION_PROMPT = "Describe this remote-sensing image in detail."

LORA_R = 16
LORA_ALPHA = 32
LORA_DROPOUT = 0.05
ATTENTION_TARGETS = ("q_proj", "k_proj", "v_proj", "o_proj")
MLP_TARGETS = ("gate_proj", "up_proj", "down_proj")

TRAIN_JSON_CANDIDATES = (
    "VRSBench_train.json",
    "RSBench_train.json",
    "vrsbench_train.json",
)
VQA_EVAL_JSON_CANDIDATES = (
    "VRSBench_EVAL_vqa.json",
    "RSBench_EVAL_vqa.json",
    "vrsbench_eval_vqa.json",
)
CAPTION_EVAL_JSON_CANDIDATES = (
    "VRSBench_EVAL_Cap.json",
    "RSBench_EVAL_Cap.json",
    "VRSBench_EVAL_cap.json",
    "vrsbench_eval_cap.json",
)
TRAIN_IMAGE_ARCHIVES = ("Images_train.zip", "VRSBench_Images_train.zip")
EVAL_IMAGE_ARCHIVES = ("Images_val.zip", "VRSBench_Images_val.zip")

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)

IMG_START_TOKEN = "<img>"
IMG_END_TOKEN = "</img>"
IMG_CONTEXT_TOKEN = "<IMG_CONTEXT>"

# InternVL3 uses the internvl2_5 ChatML conversation template.
DEFAULT_SYSTEM_PROMPT = (
    "你是书生·万象，英文名是InternVL，是由上海人工智能实验室、清华大学及多家合作单位"
    "联合开发的多模态大语言模型。"
)
