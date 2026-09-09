import { BackendAskResponse } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatConfidence(confidence: number): string {
  if (typeof confidence !== 'number' || isNaN(confidence)) {
    return 'N/A';
  }
  // Clamp between 0 and 1 before converting to percentage
  const clamped = Math.max(0, Math.min(1, confidence));
  return `${Math.round(clamped * 100)}%`;
}

export function getTaskLabel(task: string): string {
  switch (task.toLowerCase()) {
    case 'vqa':
      return 'Visual Question Answering';
    case 'captioning':
      return 'Scene Description';
    case 'grounding':
      return 'Region Grounding';
    case 'change_detection':
      return 'Change Detection';
    case 'fusion':
      return 'Optical + SAR Fusion';
    default:
      // Return formatted capital words
      return task
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}

export function getTaskDescription(task: string): string {
  switch (task.toLowerCase()) {
    case 'vqa':
      return 'Single-image visual question answering targeting spatial and thematic queries.';
    case 'captioning':
      return 'Comprehensive remote-sensing scene description and land-cover characterization.';
    case 'grounding':
      return 'Text-guided localization and spatial grounding of target geographic entities.';
    case 'change_detection':
      return 'Bi-temporal comparative analysis identifying environmental and structural transformations.';
    case 'fusion':
      return 'Synergistic multimodal cross-analysis combining optical spectral fidelity with SAR dielectric penetration.';
    default:
      return 'Automated remote-sensing agent dispatch.';
  }
}

export function getTaskColorClasses(task: string): {
  badge: string;
  dot: string;
  border: string;
  bgLight: string;
} {
  switch (task.toLowerCase()) {
    case 'change_detection':
      return {
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        border: 'border-amber-500/30',
        bgLight: 'bg-amber-50 dark:bg-amber-950/20',
      };
    case 'fusion':
      return {
        badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-500',
        border: 'border-indigo-500/30',
        bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
      };
    case 'grounding':
      return {
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/30',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      };
    case 'captioning':
      return {
        badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
        dot: 'bg-cyan-500',
        border: 'border-cyan-500/30',
        bgLight: 'bg-cyan-50 dark:bg-cyan-950/20',
      };
    case 'vqa':
    default:
      return {
        badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
        dot: 'bg-sky-500',
        border: 'border-sky-500/30',
        bgLight: 'bg-sky-50 dark:bg-sky-950/20',
      };
  }
}

/**
 * Generates and triggers a client-side download of the analysis report
 */
export function downloadReport(
  response: BackendAskResponse,
  imageNames: string[],
  format: 'html' | 'json' | 'txt' = 'html'
): void {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleString();
  const filename = `SatQuery_Report_${response.task_selected}_${Date.now()}`;

  if (format === 'json') {
    const jsonContent = JSON.stringify(
      {
        system: 'SatQuery AI',
        team: 'AetherVision',
        generatedAt: timestamp,
        query: response.query,
        taskSelected: response.task_selected,
        taskLabel: getTaskLabel(response.task_selected),
        specialistTool: response.tool_used,
        imagesProvided: response.images_provided,
        imageFiles: imageNames,
        output: response.output,
        confidencePercentage: formatConfidence(response.output.confidence),
        rawResponse: response,
      },
      null,
      2
    );
    triggerBlobDownload(jsonContent, `${filename}.json`, 'application/json');
    return;
  }

  if (format === 'txt') {
    const txtContent = `=====================================================
SATQUERY AI — REMOTE SENSING ANALYSIS REPORT
Developed by AetherVision
=====================================================

Generated At: ${dateStr}
Query: ${response.query}

Detected Task: ${getTaskLabel(response.task_selected)} (${response.task_selected})
Specialist Tool: ${response.tool_used}
Images Analyzed: ${response.images_provided}
Uploaded Files: ${imageNames.join(', ') || 'N/A'}

RESULT
-----------------------------------------------------
Answer: ${response.output.answer}
Confidence: ${formatConfidence(response.output.confidence)}

EXECUTION SUMMARY
-----------------------------------------------------
Agent Dispatch: Automatic task classification
Workflow: ${getTaskDescription(response.task_selected)}
Tool Identifier: ${response.tool_used}

Visual Evidence Note:
Spatial and bounding box layers will appear in future releases
when supported by the backend specialist models.

=====================================================
Report generated client-side by SatQuery AI.
=====================================================`;
    triggerBlobDownload(txtContent, `${filename}.txt`, 'text/plain');
    return;
  }

  // HTML format
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SatQuery AI Analysis Report - ${response.task_selected}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 800px;
      color: #1e293b;
      background: #f8fafc;
      line-height: 1.6;
      padding: 0 20px;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      background: #e0f2fe;
      color: #0369a1;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .answer-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .answer-title {
      font-weight: 700;
      color: #166534;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .answer-text {
      font-size: 18px;
      color: #14532d;
      font-weight: 500;
    }
    .footer {
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      margin-top: 32px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="logo">SatQuery AI</div>
        <div style="font-size: 13px; color: #64748b;">Autonomous Remote-Sensing Analysis by AetherVision</div>
      </div>
      <div>
        <span class="badge">${getTaskLabel(response.task_selected)}</span>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">User Query</div>
      <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 4px;">&ldquo;${response.query}&rdquo;</div>
    </div>

    <div class="answer-box">
      <div class="answer-title">Analysis Output</div>
      <div class="answer-text">${response.output.answer}</div>
    </div>

    <div class="grid">
      <div class="stat-box">
        <div class="stat-label">Confidence</div>
        <div class="stat-value">${formatConfidence(response.output.confidence)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Specialist Tool</div>
        <div class="stat-value">${response.tool_used}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Images Processed</div>
        <div class="stat-value">${response.images_provided} (${imageNames.join(', ') || 'Remote file'})</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Workflow Type</div>
        <div class="stat-value">${getTaskLabel(response.task_selected)}</div>
      </div>
    </div>

    <div style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
      <strong>Note:</strong> Report generated client-side from SatQuery AI backend response. Spatial bounding boxes and segmentation masks will be included in subsequent model releases.
    </div>

    <div class="footer">
      Generated on ${dateStr} &bull; Team AetherVision &bull; SatQuery AI Vision-Language System
    </div>
  </div>
</body>
</html>`;

  triggerBlobDownload(htmlContent, `${filename}.html`, 'text/html');
}

function triggerBlobDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
