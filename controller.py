from fusion_tool import real_fusion_tool
from single_image_tool import real_single_image_tool
from change_detection_tool import real_change_detection_tool

def classify_task(question):
    question = question.lower()

    if "change" in question or "before" in question or "after" in question or "difference" in question:
        return "change_detection"
    elif "sar" in question or "radar" in question or "both images" in question:
        return "fusion"
    elif "highlight" in question or "where is" in question or "point to" in question:
        return "grounding"
    elif "describe" in question or "caption" in question:
        return "captioning"
    else:
        return "vqa"


def fake_change_detection_tool(images, question):
    return {"answer": "Placeholder: built-up area increased", "confidence": 0.82}


tool_registry = {
    "vqa": real_single_image_tool,
    "captioning": real_single_image_tool,
    "grounding": real_single_image_tool,
    "change_detection": real_change_detection_tool,
    "fusion": real_fusion_tool,
}


def run_controller(images, question):
    if not question or not question.strip():
        return {"error": "No question provided"}
    if not images or len(images) == 0:
        return {"error": "No images provided"}

    task = classify_task(question)

    if task == "change_detection" and len(images) < 2:
        return {"error": "Change detection needs 2 images, but only got " + str(len(images))}

    if task == "fusion" and len(images) < 2:
        return {"error": "Fusion needs 2 images (optical + SAR), but only got " + str(len(images))}

    if task in ("vqa", "captioning", "grounding") and len(images) != 1:
        return {"error": f"{task} needs exactly 1 image, but got " + str(len(images))}

    selected_tool = tool_registry[task]
    result = selected_tool(images, question)

    execution_trace = {
        "query": question,
        "task_selected": task,
        "tool_used": selected_tool.__name__,
        "images_provided": len(images),
        "output": result
    }

    return execution_trace