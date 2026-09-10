export type TaskType =
  | 'vqa'
  | 'captioning'
  | 'grounding'
  | 'change_detection'
  | 'fusion'
  | string;

export interface BackendAskOutput {
  answer: string;
  confidence: number;
}

/**
 * Core response structure from the documented POST /ask endpoint.
 * Extensible for future remote-sensing agent capabilities.
 */
export interface BackendAskResponse {
  query: string;
  task_selected: TaskType;
  tool_used: string;
  images_provided: number;
  output: BackendAskOutput;
  // Optional / future expansion fields
  error?: string;
  evidence?: unknown;
  bounding_boxes?: Array<{
    label?: string;
    box: [number, number, number, number];
    confidence?: number;
  }>;
  masks?: Array<{
    label?: string;
    data_url?: string;
  }>;
  change_map?: string;
  regions?: Array<unknown>;
  metadata?: Record<string, unknown>;
  execution_trace?: Array<{
    step: string;
    timestamp?: string;
    details?: string;
  }>;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  query: string;
  taskSelected: string;
  toolUsed: string;
  confidence: number;
  answer: string;
  imagesProvided: number;
  imageNames: string[];
  fullResponse: BackendAskResponse;
}

export type AppTheme = 'light' | 'dark';

export interface ComingSoonFeature {
  id: string;
  title: string;
  description: string;
  category: 'Spatial' | 'Sensors' | 'Workflows' | 'Data';
}
