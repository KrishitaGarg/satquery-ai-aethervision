import { BackendAskResponse } from '../types';

const STORAGE_KEY_API_BASE_URL = 'satquery_api_base_url';

/**
 * Returns the effective API base URL.
 * Priority: LocalStorage override -> VITE_API_BASE_URL -> Default http://127.0.0.1:8000
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_BASE_URL);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
}

/**
 * Persists an API base URL override in localStorage
 */
export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    if (cleanUrl) {
      localStorage.setItem(STORAGE_KEY_API_BASE_URL, cleanUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_API_BASE_URL);
    }
  }
}

/**
 * Resets the API base URL to environment/default setting
 */
export function resetApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_API_BASE_URL);
  }
}

/**
 * Tests connectivity to the configured backend base URL
 */
export async function testApiConnection(customUrl?: string): Promise<{
  ok: boolean;
  statusText: string;
  statusCode?: number;
  durationMs: number;
}> {
  const baseUrl = (customUrl || getApiBaseUrl()).replace(/\/+$/, '');
  const startTime = performance.now();

  try {
    // Try pinging the base URL or /health or OPTIONS on /ask with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/ask`, {
      method: 'OPTIONS',
      signal: controller.signal,
    }).catch(async () => {
      // If OPTIONS fails, try a GET / or /health
      return await fetch(`${baseUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);

    return {
      ok: true,
      statusCode: response.status,
      statusText: `Connected (${response.status} ${response.statusText || 'OK'})`,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : 'Network unreachable';
    return {
      ok: false,
      statusText: message.includes('abort') ? 'Connection timed out' : `Connection failed (${message})`,
      durationMs,
    };
  }
}

/**
 * Main API invocation: POST /ask
 * Expects multipart/form-data with:
 * - 'question': string
 * - 'images': binary file, repeatable with the same key name
 */
export async function askSatQuery(
  question: string,
  images: File[]
): Promise<BackendAskResponse> {
  const trimmedQuestion = question.trim();

  if (!images || images.length === 0) {
    throw new Error('Please upload at least one image before analyzing.');
  }

  if (!trimmedQuestion) {
    throw new Error('Please enter a question about your imagery.');
  }

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/ask`;

  // Construct standard multipart/form-data
  const formData = new FormData();
  formData.append('question', trimmedQuestion);

  // IMPORTANT: Backend specifies repeatable 'images' field name for every file
  for (const imageFile of images) {
    formData.append('images', imageFile, imageFile.name);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // Note: Do NOT set Content-Type header explicitly; fetch handles multipart boundary automatically
    });

    // Check if the server responded with an HTTP error
    if (!response.ok) {
      let errorMessage = `API error (${response.status} ${response.statusText})`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.error || errJson.detail || errJson.message)) {
          errorMessage = errJson.error || errJson.detail || errJson.message;
        }
      } catch {
        // Response wasn't JSON, retain status message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Check if backend returned an error field in the JSON payload
    if (data && data.error) {
      throw new Error(data.error);
    }

    // Validate and sanitize the expected structure
    const sanitizedResponse: BackendAskResponse = {
      query: typeof data.query === 'string' ? data.query : trimmedQuestion,
      task_selected: data.task_selected || 'vqa',
      tool_used: data.tool_used || 'specialist_tool',
      images_provided: typeof data.images_provided === 'number' ? data.images_provided : images.length,
      output: {
        answer: data.output?.answer || 'No answer text returned by backend tool.',
        confidence: typeof data.output?.confidence === 'number' ? data.output.confidence : 0.8,
      },
      evidence: data.evidence,
      bounding_boxes: data.bounding_boxes,
      masks: data.masks,
      change_map: data.change_map,
      regions: data.regions,
      metadata: data.metadata,
      execution_trace: data.execution_trace,
    };

    return sanitizedResponse;
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      throw new Error(
        `Unable to connect to the SatQuery AI backend at ${baseUrl}. Please make sure the API server is running (e.g. uvicorn/fastapi on ${baseUrl}) and CORS is enabled.`
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected network error occurred while contacting the SatQuery backend.');
  }
}
