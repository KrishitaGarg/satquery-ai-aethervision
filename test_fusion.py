# from fusion_tool import real_fusion_tool

# result = real_fusion_tool(
#     ["path_to_optical_test_image.tif", "path_to_sar_test_image.tif"],
#     "Use optical and SAR to identify built-up areas"
# )
# print(result)



"""
Quick standalone test for fusion_tool.py
Run this BEFORE wiring fusion into controller.py / api.py.

Goal: confirm the pipeline runs end-to-end without crashing,
and returns the expected {"answer": ..., "confidence": ...} shape.

NOTE: Using placeholder images for now since teammate hasn't sent
the exact test images from demo_result.json yet. This only proves
the pipeline WORKS — it does NOT validate correctness (can't compare
against ground truth "no" until we get his real S2/S1 files).
"""

from fusion_tool import real_fusion_tool

# --- Replace these two paths with any 2 images you have on your machine ---
# They don't need to be real satellite images yet — just need to be valid
# image files so we can confirm the script runs without crashing.
optical_image_path = "C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\test_images\\Screenshot (1).png"
sar_image_path = "C:\\Users\\amrit\\OneDrive\\Desktop\\sih\\test_images\\Screenshot (2).png"

question = "Can you observe any moors, heathland, or sclerophyllous vegetation in the satellite image?"

print("Running fusion tool with placeholder images...")
print(f"  Optical: {optical_image_path}")
print(f"  SAR:     {sar_image_path}")
print(f"  Question: {question}")
print("-" * 60)

try:
    result = real_fusion_tool([optical_image_path, sar_image_path], question)
    print("SUCCESS — pipeline ran without crashing.")
    print("Result returned:")
    print(result)

    # Basic shape check
    if "answer" in result and "confidence" in result:
        print("\nOutput shape looks correct (has 'answer' and 'confidence').")
    else:
        print("\nWARNING: Output is missing 'answer' or 'confidence' key — check fusion_tool.py's return format.")

except Exception as e:
    print("FAILED — pipeline crashed.")
    print(f"Error: {e}")
    print("\nCommon causes:")
    print("  - Wrong path to adapter folder inside fusion_tool.py")
    print("  - Model files not found (check fusion_model/cross_modal_adapter/ contents)")
    print("  - Image files don't exist at the paths above (update optical_image_path / sar_image_path)")
    print("  - Missing package (re-check pip install list)")