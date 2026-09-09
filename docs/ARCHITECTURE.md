# SatQuery AI — Frontend Architecture Specification

This document details the architectural design, component hierarchy, data flow, API contract, state management, and error handling strategies for the **SatQuery AI** frontend application.

---

## 1. System Overview

SatQuery AI is a specialized Vision-Language model (VLM) workbench for remote sensing and Earth observation imagery. It interfaces with an external agentic FastAPI/Python backend that orchestrates specialist tools (Visual Question Answering, Captioning, Grounding, Change Detection, and Multi-Sensor Fusion) to analyze high-resolution optical, SAR, and multispectral imagery.

### Core Design Principles
- **No Fabricated Agent Details**: All execution details (task classification, tool invocation, image counts, confidence score) strictly reflect the parsed response returned by the backend service.
- **Natural Input Framing**: Transparently handles single-image queries, bi-temporal pairs (Frame A & Frame B), and cross-modal optical/SAR pairs without forcing the user to manually configure pipelines.
- **GIS-Grade Aesthetic**: Clean high-contrast typography, dark/light theme support, responsive raster previews, and graceful handling of raw GeoTIFF / TIFF files.
- **Pure Client State with Resilient Overrides**: Decoupled from proprietary backend frameworks; connects to any conformant endpoint via `POST /ask`.

---

## 2. Component Hierarchy & Module Structure

```
src/
├── main.tsx                      # StrictMode entry point with top-level ErrorBoundary
├── App.tsx                       # Root orchestrator & centralized workspace state
├── types/
│   └── index.ts                  # Shared TypeScript interfaces & TaskType definitions
├── services/
│   └── api.ts                    # HTTP client for POST /ask and connection health check
├── utils/
│   ├── formatters.ts             # File sizing, task labels, confidence formatting, export generators
│   └── sampleData.ts             # Procedural canvas generators for Earth observation presets
└── components/
    ├── Header.tsx                # Status indicator, system telemetry, theme toggle, settings button
    ├── ImageWorkspace.tsx        # Drag-and-drop imagery staging, frame labelling, zoom lightbox
    ├── QueryAssistant.tsx        # Context-aware query input, preset suggestions, submission controls
    ├── ResultsPanel.tsx          # Answer display, confidence metric, execution details, exports
    ├── HistoryDrawer.tsx         # Slide-out session history panel with query reloading
    ├── SettingsModal.tsx         # Backend URL configuration with live connectivity test
    └── ErrorBoundary.tsx         # React Error Boundary for resilient failure recovery
```

### Component Roles & Responsibilities

| Component | Primary Responsibility | Key Inputs / Outputs |
| :--- | :--- | :--- |
| **`ErrorBoundary`** | Traps uncaught React runtime exceptions and renders a recovery view | Children / Fallback UI |
| **`App`** | Owns application state: staged images, active query, current response, query history, active modal states | Top-level state container |
| **`Header`** | Displays branding, active endpoint status, history toggle, theme toggle, and settings modal toggle | Backend URL status, theme state |
| **`ImageWorkspace`** | Staging area for 1–2 satellite images; assigns Frame A / Frame B identifiers; supports TIFF raster fallback | `UploadedImage[]`, upload/replace/remove handlers |
| **`QueryAssistant`** | Natural language query prompt with dynamic scenario guidance and keyboard shortcuts (`Ctrl/Cmd+Enter`) | `question`, `onRunAnalysis`, `isLoading` |
| **`ResultsPanel`** | Focal answer display, confidence badge, specialist metadata, evidence preview, and export actions | `BackendAskResponse`, export handlers |
| **`HistoryDrawer`** | Manages local session history with quick-replay and clearing | Query history collection |
| **`SettingsModal`** | Runtime configuration of backend base URL (`localStorage` persistence) with ping verification | `apiBaseUrl`, ping test handler |

---

## 3. Backend API Contract (`POST /ask`)

The frontend interacts with the backend over HTTP using standard `multipart/form-data`.

### 3.1 Request Specification

- **Endpoint**: `POST ${BASE_URL}/ask`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `question`: UTF-8 string containing the user's natural-language query.
  - `images`: Binary file field. When multiple images are submitted (e.g. bi-temporal or optical+SAR pairs), the `images` field is repeated for each file.

#### Example Request Construction (`src/services/api.ts`):
```typescript
const formData = new FormData();
formData.append('question', trimmedQuestion);
for (const imageFile of images) {
  formData.append('images', imageFile, imageFile.name);
}

const response = await fetch(`${baseUrl}/ask`, {
  method: 'POST',
  body: formData,
});
```

### 3.2 Response Specification

The backend responds with a JSON object conforming to `BackendAskResponse`:

```typescript
interface BackendAskResponse {
  query: string;               // Original query analyzed
  task_selected: TaskType;     // "vqa" | "captioning" | "grounding" | "change_detection" | "fusion"
  tool_used: string;           // Internal specialist tool identifier (e.g. "change_detection_tool")
  images_provided: number;     // Number of images processed
  output: {
    answer: string;            // Primary natural-language analytical response
    confidence: number;        // Confidence score between 0.0 and 1.0
  };
  error?: string;              // Optional error message returned by backend
  evidence?: unknown;          // Optional raw visual evidence
  bounding_boxes?: Array<{     // Optional grounding bounding boxes (future/expansion)
    label?: string;
    box: [number, number, number, number];
    confidence?: number;
  }>;
}
```

---

## 4. State Management Approach

SatQuery AI uses focused, predictable React component state with persistence layers for user preferences:

1. **Workspace State (`App.tsx`)**:
   - `uploadedImages: UploadedImage[]`: Current staged imagery files with object URLs and dimension metadata.
   - `question: string`: Natural language query text.
   - `isLoading: boolean`: Active request state to disable conflicting operations.
   - `response: BackendAskResponse | null`: The current active analysis result.
   - `history: AnalysisHistoryItem[]`: Stored in `localStorage` under `satquery_history_v1` (up to 30 recent analyses).

2. **Environment & Preferences**:
   - `apiBaseUrl`: Initialized from `import.meta.env.VITE_API_BASE_URL` (defaults to `http://127.0.0.1:8000`), overridable in UI and cached in `localStorage` under `satquery_api_base_url`.
   - `theme`: Managed in `App.tsx` and persisted under `satquery_theme_preference` ('dark' | 'light'). Adds/removes the `.dark` class on `document.documentElement`.

3. **Memory Safety**:
   - Staged files generate object URLs via `URL.createObjectURL(file)`.
   - When images are removed, replaced, or cleared, object URLs are cleanly released via `URL.revokeObjectURL(url)` to prevent browser memory leaks.

---

## 5. GeoTIFF / TIFF & Format Handling Strategy

Remote sensing workflows frequently utilize multi-band 16-bit GeoTIFF or standard TIFF files. Standard browser `<img>` rendering engines do not decode uncompressed TIFF rasters natively.

### Resilient Raster Preview:
1. When a `.tif` or `.tiff` file is detected, or if browser rendering triggers `onError`:
   - The UI suppresses broken image icons.
   - It displays a stylized GIS raster card indicating `GeoTIFF / TIFF Raster` and confirmation that the binary raster is staged for model inference.
2. The original raw `File` binary object remains intact and is passed directly in the `multipart/form-data` payload to the backend for full numerical processing.
3. Standard web formats (`.png`, `.jpg`, `.jpeg`, `.webp`) render native high-resolution image canvases with interactive zoom inspection.

---

## 6. Error Handling Strategy

1. **Network & Connection Failures**:
   - `checkBackendHealth(baseUrl)`: Tests the endpoint availability and reports `connected`, `offline`, or `error` in the Header status badge.
   - Detailed user-friendly guidance is shown if `Failed to fetch` occurs, explaining FastAPI/Uvicorn CORS configuration:
     ```python
     from fastapi.middleware.cors import CORSMiddleware
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["*"],
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
2. **Backend Validation Errors**:
   - Non-200 HTTP responses parse JSON error payloads (`{ "detail": "..." }` or `{ "error": "..." }`) and present them clearly in an error notification card.
3. **Application-Level Boundaries**:
   - Top-level `ErrorBoundary` in `src/components/ErrorBoundary.tsx` prevents unexpected component crashes from blanking the screen and offers an immediate workspace reset button.
