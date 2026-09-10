# SatQuery AI by AetherVision

## 1. Project Information

- **Project Title:** SatQuery AI
- **PS ID:** SIH26167
- **PS Title:** SatQuery AI - An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries
- **Organization:** Indian Space Research Organisation (ISRO)
- **Category:** Software
- **Theme:** Space Technology

## 2. Problem Statement

Existing remote-sensing AI tools are largely task-specific and require significant GIS/satellite-data expertise to operate. A single optical image is often insufficient to answer complex queries, and useful information frequently spans multiple sensors (optical, SAR) and time periods (bi-temporal). Generic Vision-Language Models (VLMs) are not adapted to the domain-specific characteristics of remote-sensing imagery, leaving a gap between raw satellite data and the plain-language questions analysts, GIS teams, and non-expert stakeholders actually want answered.

## 3. Proposed Solution

SatQuery AI is an agentic Vision-Language interface: a user asks a natural-language question and uploads the relevant imagery (a single scene, a bi-temporal pair, or an optical+SAR pair), and an agentic controller understands, validates, and routes the request to the right specialist model — returning a clear, auditable textual answer without requiring any GIS software or manual preprocessing.

The controller follows a fixed six-stage pipeline:

**Understand → Validate → Route → Execute → Respond → Audit**

| Stage      | What it does                                                                       |
| ---------- | ---------------------------------------------------------------------------------- |
| Understand | Identifies user intent and required analysis type from the natural-language query  |
| Validate   | Checks uploaded image count, format, and configuration against what the task needs |
| Route      | Selects the appropriate specialist model/workflow                                  |
| Execute    | Runs the selected specialist workflow                                              |
| Respond    | Converts model output into a clear, structured textual answer                      |
| Audit      | Logs an execution trace for transparency and debugging                             |

## 4. Key Features

- **Specialist workflows, one interface** — the agentic controller routes each query to the matching workflow:
  - Optical / multispectral / SAR **single-image** VQA + captioning
  - **Multi-sensor change detection** / change-VQA across a bi-temporal pair
  - **Optical + SAR cross-modal analysis** (and multispectral + SAR)
- **Agent execution transparency** — surfaces the classified task, the specialist tool invoked, image count, and a calibrated confidence score for every answer, plus a full execution trace (audit stage).
- **Domain-adapted VLM** — the core model is fine-tuned specifically for remote-sensing imagery rather than used off-the-shelf (see Technology Stack).
- **Report generation** — export analysis results as standalone HTML dossiers, machine-readable JSON, or plain-text logs.
- **Zero-friction backend integration** — connects to any compatible backend over `POST /ask`, with in-app backend URL switching, live connectivity checks, and locally persisted query history.

## 5. Technology Stack

**Frontend**

- React 19, TypeScript, Vite 6, Tailwind CSS v4
- lucide-react (icons), Motion (animation)

**Core Model**

- Base VLM: `OpenGVLab/InternVL3-1B-Instruct`
- Fine-tuning method: FP16 LoRA — parameter-efficient fine-tuning for remote-sensing domain adaptation

**Backend / ML Libraries**

- Python, PyTorch + Torchvision
- Hugging Face Transformers, PEFT (LoRA), Accelerate
- Timm, Pillow, Safetensors, Einops, SentencePiece
- FastAPI (serving layer, exposes `POST /ask` over `multipart/form-data`)

## 6. Architecture

See [docs/architecture.md](docs/architecture.md).

```text
Browser / SatQuery Frontend
  │
  ├─ Image Staging (Single, Bi-temporal, or Cross-Modal)
  ├─ Natural Language Prompting with Scenario Guidance
  │
  ▼  POST /ask  (multipart/form-data: question + repeated images)
FastAPI Backend Service
  │
  ▼
Agentic Controller
  01 UNDERSTAND  → intent + task type from the query
  02 VALIDATE    → image count, format, configuration
  03 ROUTE       → select specialist model/workflow
  04 EXECUTE     → run the selected workflow
  05 RESPOND     → structured textual answer
  06 AUDIT       → log execution trace
  │
  ├─ Specialist Model: Optical/Multispectral/SAR single image → VQA + Captioning
  ├─ Specialist Model: Multi-sensor → Change Detection / Change-VQA
  ├─ Specialist Model: Optical + SAR (or Multispectral + SAR) → Cross-Modal Analysis
  │
  ▼  JSON Response (query, task_selected, tool_used, output: { answer, confidence })
Results & Evidence Interface
```

Core model: `OpenGVLab/InternVL3-1B-Instruct`, adapted via FP16 LoRA fine-tuning for remote-sensing imagery.

## 7. Repository Structure

```text
SATQUERY-AI/
├── README.md
├── backend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/
│   └── samples/
│   └── assets/
├── docs/
│   └── architecture.md
├── assets/
│   └── screenshots/
├── package.json
├── .env.example
├── .gitignore
└── LICENSE
```

### What goes where?

| Item                                   | Location              |
| -------------------------------------- | --------------------- |
| Frontend source code                   | `src/`                |
| Architecture / technical documentation | `docs/`               |
| Project screenshots                    | `assets/screenshots/` |
| Project overview                       | `README.md`           |

## 8. Final Presentation

See [submission/PRESENTATION.md](submission/PRESENTATION.md) for the link to the presentation.

## 9. Demo Video

See [submission/DEMO.md](submission/DEMO.md) for the link to the demo.

## 10. Screenshots / Prototype Photos

See [assets/screenshots/](assets/screenshots/) for project screenshots.

## 11. Installation

```bash
# Clone the repository
git clone https://github.com/KrishitaGarg/satquery-ai-aethervision.git
cd satquery-ai-aethervision

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# URL of your Python / FastAPI backend service
VITE_API_BASE_URL="http://127.0.0.1:8000"
```

You can also override the API URL at runtime from the **Settings** gear icon in the app's top navigation bar.

## 12. Run

```bash
npm run dev
```

The application starts on `http://localhost:3000`.

To build for production:

```bash
npm run lint   # typecheck
npm run build  # compiled bundle output to dist/
```

The backend (FastAPI service exposing `POST /ask`) must be run separately — see its own repository/README for setup instructions.

## 13. Future Scope

- **Visual evidence beyond text** — bounding boxes, masks, and change maps for grounding (current specialist workflows return text-only answers).
- **Continued domain adaptation** — further LoRA fine-tuning of the base VLM on additional remote-sensing data as it becomes available.
- **Broader multi-image reasoning** — coordinated processing across more than two frames/sensors at once.
- **Server-side history** — multi-user accounts with persisted history, replacing the current client-only `localStorage` approach.
- **Native GeoTIFF/TIFF preview support** directly in the browser.
- **Scaled GPU inference** — the feasibility analysis notes the prototype is built on a pretrained VLM + modular architecture + GPU-based inference specifically to support future scaling.

## References & Datasets

Public remote-sensing VQA/change-detection datasets referenced for model adaptation and evaluation:

- [BigEarthNet](https://bigearth.net/)
- [CDVQA](https://github.com/YZHJessica/CDVQA)
- [VRSBench](https://vrsbench.github.io/) ([GitHub](https://github.com/lx709/VRSBench))
- [RSVQA](https://rsvqa.sylvainlobry.com/)
- [RSVQA dataset publication (Wageningen University)](https://research.wur.nl/en/publications/rsvqa-visual-question-answering-for-remote-sensing-data/datasets)
