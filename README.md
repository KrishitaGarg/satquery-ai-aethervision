# SatQuery AI — Agentic Remote Sensing Vision-Language Assistant

SatQuery AI is a modern Earth observation analysis interface designed for domain experts, GIS specialists, and researchers. It bridges high-resolution satellite imagery with multimodal Vision-Language Models (VLMs) and specialized remote-sensing agents.

---

## Highlights & Features

- **Dynamic Multi-Scenario Staging**:
  - **Single Scene Analysis**: Land-cover classification, visual question answering, and spatial object queries.
  - **Bi-temporal Change Detection**: Automatic frame labeling (`Frame A` and `Frame B`) for temporal comparison queries.
  - **Cross-Modal Optical + SAR Fusion**: Joint analysis leveraging optical true color and radar backscatter (VV/VH).
- **Agent Execution Transparency**:
  - Automatically highlights the classified task (`task_selected`), specialist workflow (`tool_used`), image count, and calibrated model confidence without fabricating internal chain-of-thought.
- **GIS-Grade Visual Evidence**:
  - Dual-pane and single-pane imagery canvases with side-by-side inspectable frames and lightbox zoom.
  - Graceful rendering of GeoTIFF (`.tif`, `.tiff`) rasters alongside standard optical imagery (`.png`, `.jpg`, `.jpeg`).
- **Comprehensive Report Generation**:
  - Instant export of analysis results as standalone HTML dossiers, machine-readable JSON, or clean plain-text logs.
- **Zero-Friction Endpoint Integration**:
  - Seamless connection to local or remote FastAPI backends via `POST /ask`.
  - In-browser backend URL switching, live health ping tests, and query history persistence.

---

## Architecture Summary

SatQuery AI operates as a decoupled React single-page application built on Vite and Tailwind CSS. All analytical inference and tool orchestration is delegated to an external backend service over a clean HTTP `multipart/form-data` interface.

For an in-depth breakdown of components, data flow, and error boundaries, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
Browser / SatQuery Frontend
  │
  ├─ Image Staging (Single, Bi-temporal, or Cross-Modal)
  ├─ Natural Language Prompting with Scenario Guidance
  │
  ▼  POST /ask  (multipart/form-data: question + repeated images)
FastAPI / Backend Specialist Service
  │
  ├─ Task Classification (VQA, Captioning, Grounding, Change Detection, Fusion)
  ├─ Specialist Tool Invocation
  │
  ▼  JSON Response (query, task_selected, tool_used, output: { answer, confidence })
Results & Evidence Interface
```

---

## Supported File Formats & Technical Considerations

| Format             | Extensions      | Browser Preview Support              | Backend Processing          |
| :----------------- | :-------------- | :----------------------------------- | :-------------------------- |
| **PNG**            | `.png`          | Native high-res canvas preview       | Passed as binary stream     |
| **JPEG**           | `.jpg`, `.jpeg` | Native high-res canvas preview       | Passed as binary stream     |
| **GeoTIFF / TIFF** | `.tif`, `.tiff` | Stylized GIS raster placeholder card | Passed as raw binary raster |
| **WebP**           | `.webp`         | Native canvas preview                | Passed as binary stream     |

> **Note on GeoTIFF**: Standard web browsers cannot decode uncompressed 16-bit GeoTIFF rasters natively in `<img>` elements. SatQuery AI provides a dedicated fallback card confirming raster readiness while preserving the original binary `File` object for backend transmission.

---

## Getting Started

### Prerequisites

- Node.js 18+ or Node.js 20+
- A compatible SatQuery AI backend server running `POST /ask` (default: `http://127.0.0.1:8000`)

### Installation

```bash
# Clone the repository
git clone https://github.com/KrishitaGarg/satquery-ai-aethervision.git

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# URL of your Python / FastAPI backend service
VITE_API_BASE_URL="http://127.0.0.1:8000"
```

You can also override the API URL at runtime inside the application by clicking the **Settings** gear icon in the top navigation bar.

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### Production Build

```bash
# Typecheck and lint
npm run lint

# Compile optimized static bundle
npm run build
```

The compiled assets will be output to the `dist/` directory, ready to be served by any static web server or CDN.

---

## Backend API Integration (`POST /ask`)

The backend must expose a `POST /ask` endpoint accepting `multipart/form-data`:

### Request Parameters

- `question` (string): The natural language query.
- `images` (File, repeated): One or two binary image files.

### Expected JSON Response

```json
{
  "query": "Has the forest area changed between Frame A and Frame B?",
  "task_selected": "change_detection",
  "tool_used": "change_detection_tool",
  "images_provided": 2,
  "output": {
    "answer": "Significant infrastructure expansion is observed in the eastern sector. Forest cover decreased by approximately 24% between the two capture dates, replaced by paved roadways and commercial structures.",
    "confidence": 0.94
  }
}
```

### FastAPI CORS Setup Example

If running the backend locally or across different domains, ensure CORS is enabled:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SatQuery AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Keyboard Shortcuts

- **`Ctrl + Enter`** or **`Cmd + Enter`**: Run analysis from query input field.
- **`Esc`**: Clear current query text (when focused).

---

## License

Internal proprietary research application by AetherVision. All rights reserved.
