# SatQuery single-image model — backend handoff

This bundle contains the trained LoRA adapter and the minimal Python inference code for
`OpenGVLab/InternVL3-1B-Instruct`. It intentionally does not duplicate the base model weights.
On the first process startup, Transformers downloads the public base model from Hugging Face;
subsequent startups use the Hugging Face cache.

## Contents

```text
adapter/                  Final trained LoRA adapter and tokenizer artifacts
single_image/             InternVL loading and preprocessing implementation
satquery_backend.py       Load-once, framework-neutral backend wrapper
example.py                Command-line smoke test
requirements.txt          Inference-only dependencies
SHA256SUMS                Integrity hashes for every bundled file
```

The adapter was trained for one epoch on the VRSBench caption/VQA mixture. On a deterministic
1,000-VQA/1,000-caption evaluation sample it achieved 64.4% normalized VQA exact match, BLEU-4
0.1338, ROUGE-L 0.3615, and METEOR 0.3578.

## Install

Use Python 3.10+ and preferably an NVIDIA GPU. Install the PyTorch build appropriate for the
deployment host, then install the remaining requirements:

```bash
python -m pip install -r requirements.txt
```

The first startup needs network access to download `OpenGVLab/InternVL3-1B-Instruct`. Set `HF_HOME`
to persistent storage in containers so model files are downloaded only once. CPU inference is
supported but slow. The upstream model uses Hugging Face `trust_remote_code=True`; production
deployments should review and pin the upstream model revision.

## Backend integration

Instantiate one engine when the application starts and reuse it for every request:

```python
from satquery_backend import SatQueryEngine

engine = SatQueryEngine()  # CUDA + FP16 when CUDA is available

result = engine.answer(
    uploaded_image_bytes,
    "How many airplanes are visible?",
)
# {"task": "vqa", "answer": "2"}
```

`answer()` accepts a filesystem path, bytes, a binary file-like object, or a PIL image. It can also
be used for captioning:

```python
result = engine.answer(image_bytes, "Describe this remote-sensing image in detail.")
```

The wrapper serializes calls to `generate()` for safety. For higher throughput, run one worker per
GPU (or separate workers with sufficient GPU memory) rather than sharing one model across concurrent
generation calls.

Smoke-test from the command line:

```bash
python example.py example.png "What objects are visible?"
```

The adapter alone is not a standalone model: keep the `adapter/` directory beside the code, and do
not pass its training-time `base_model_name_or_path` directly. The included loader reads
`single_image_adapter.json` and fetches the correct InternVL base checkpoint automatically.

Review the licenses and redistribution terms for InternVL3, VRSBench, and the original imagery
before public deployment.
