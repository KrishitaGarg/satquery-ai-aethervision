"""
Standalone test for single_image_tool.py
Run this BEFORE wiring it into controller.py.

This script also PRINTS out the paths it expects, so if something is
misplaced, you'll see exactly what's wrong before hitting a confusing
import error.
"""

import os
from pathlib import Path


CURRENT_DIR = Path(__file__).resolve().parent
print("Running from:", CURRENT_DIR)
print("-" * 60)

expected_files = {
    "single_image_tool.py": CURRENT_DIR / "single_image_tool.py",
    "single_image_model folder": CURRENT_DIR / "single_image_model",
}

for label, path in expected_files.items():
    exists = path.exists()
    print(f"[{'OK' if exists else 'MISSING'}] {label} -> {path}")

single_image_model_dir = CURRENT_DIR / "single_image_model"
if single_image_model_dir.exists():
    print("\nContents of single_image_model/:")
    for item in single_image_model_dir.iterdir():
        print("   -", item.name)
else:
    print("\nsingle_image_model folder not found next to this script.")
    print("Move the 'satquery-backend-handoff' folder contents here and rename")
    print("the folder to 'single_image_model' (or update the path inside")
    print("single_image_tool.py to point to wherever it actually is).")

print("-" * 60)

# ---- Step 2: Try the actual import + inference ----

try:
    from single_image_tool import real_single_image_tool
except Exception as e:
    print("FAILED to import single_image_tool.py")
    print(f"Error: {e}")
    print("\nCheck the sys.path.append(...) line inside single_image_tool.py —")
    print("it must point to the exact folder containing satquery_backend.py")
    raise SystemExit(1)

# --- Replace this with any image you have on your machine ---
test_image_path = "C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\uploaded_images\\Screenshot (1).png"
question = "What is in this image?"

print(f"\nRunning single_image_tool with:")
print(f"  Image: {test_image_path}")
print(f"  Question: {question}")
print("-" * 60)

try:
    result = real_single_image_tool([test_image_path], question)
    print("SUCCESS — pipeline ran without crashing.")
    print("Result returned:")
    print(result)

    if "answer" in result and "confidence" in result:
        print("\nOutput shape looks correct (has 'answer' and 'confidence').")
    else:
        print("\nWARNING: Output missing 'answer' or 'confidence' key — check single_image_tool.py's return format.")

except Exception as e:
    print("FAILED — pipeline crashed during inference.")
    print(f"Error: {e}")
    print("\nCommon causes:")
    print("  - test_image_path doesn't point to a real image on your machine")
    print("  - adapter folder path inside satquery_backend.py / model.py is wrong")
    print("  - Missing package (check requirements.txt was fully installed)")