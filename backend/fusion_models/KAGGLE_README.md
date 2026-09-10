# SatQuery Cross-Modal VQA Adapter

## Model

- Parent model: `OpenGVLab/InternVL3-1B-Instruct`
- Revision: `f91c6391476dbc8fd07674d2589e8168d3ca667f`
- Adapter: PEFT LoRA
- DoRA: disabled
- LoRA targets: q_proj, k_proj, v_proj, o_proj

## Inputs

1. Sentinel-2 optical image using B04/B03/B02
2. Co-registered Sentinel-1 SAR image using VV/VH/VV-divided-by-VH
3. Natural-language VQA question

Optical is always image 1 and SAR is always image 2. The images
are provided separately to InternVL and are not spatially merged.

## Training

- Training VQA rows: 30000
- Unique training pairs: 4008
- Validation rows: 500
- Image size: 448
- Epochs: 1
- Batch size: 1
- Gradient accumulation: 8
- Learning rate: 5e-05
- Precision: FP16
- Seed: 42

Only official training-split image pairs were used for optimization.
Validation patches are disjoint from training patches.

## Usage

```python
result = query_cross_modal(
    optical_image="sentinel2_directory_or_rgb.png",
    sar_image="sentinel1_directory_or_pseudorgb.png",
    question="Is water present?",
    adapter_path="/kaggle/working/cross_modal_adapter_30k",
)

print(result["answer"])
For raw directories, the optical directory must contain B04, B03 and
B02 TIFF files. The SAR directory must contain VV and VH TIFF files.
A multiband TIFF must identify its bands through band descriptions.
