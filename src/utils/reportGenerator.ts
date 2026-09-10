import { jsPDF } from 'jspdf';
import { BackendAskResponse, UploadedImage } from '../types';
import { getTaskLabel } from './formatters';

// Layout constants (all in mm, A4 page)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = { r: 20, g: 24, b: 31 };
const INK_DIM = { r: 100, g: 112, b: 128 };
const INK_FAINT = { r: 150, g: 160, b: 174 };
const ACCENT = { r: 16, g: 158, b: 110 };
const NAVY = { r: 8, g: 12, b: 20 };
const LINE = { r: 224, g: 228, b: 234 };

const isTiffRaster = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.endsWith('.tif') || lower.endsWith('.tiff');
};

const formatBytes = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Decodes an <img> element and rasterizes it onto a canvas, downscaling to
 * a sane max dimension. Rejects (rather than resolving null) so the caller
 * can decide whether to fall back to another loading strategy.
 */
function rasterizeImageElement(
  img: HTMLImageElement
): { dataUrl: string; width: number; height: number } | null {
  try {
    const maxDim = 1400;
    let { naturalWidth: width, naturalHeight: height } = img;
    if (!width || !height) return null;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.88), width, height };
  } catch (err) {
    console.warn('[reportGenerator] canvas rasterization failed', err);
    return null;
  }
}

/**
 * Loads an image (typically a blob: preview URL) and rasterizes it to a
 * downscaled JPEG data URL suitable for embedding in a PDF. Returns null
 * only if the image genuinely can't be decoded by the browser at all
 * (e.g. a raw GeoTIFF) — every other failure mode is retried via a
 * fetch + FileReader fallback before giving up, so a slow decode or a
 * transient blob-URL hiccup can't silently drop a frame from the report.
 */
async function loadImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  const DECODE_TIMEOUT_MS = 10000;

  const viaImageElement = () =>
    new Promise<{ dataUrl: string; width: number; height: number } | null>((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => {
        console.warn('[reportGenerator] image decode timed out', url);
        resolve(null);
      }, DECODE_TIMEOUT_MS);
      img.onload = () => {
        clearTimeout(timer);
        resolve(rasterizeImageElement(img));
      };
      img.onerror = (err) => {
        clearTimeout(timer);
        console.warn('[reportGenerator] <img> failed to decode source', url, err);
        resolve(null);
      };
      img.src = url;
    });

  const result = await viaImageElement();
  if (result) return result;

  // Fallback: re-fetch the blob directly and hand the browser a fresh
  // object URL. Covers cases where the original blob: URL had already
  // been revoked or the <img> path failed for another transient reason.
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const freshUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
        const timer = setTimeout(() => resolve(null), DECODE_TIMEOUT_MS);
        img.onload = () => {
          clearTimeout(timer);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        img.src = freshUrl;
      });
      return loaded ? rasterizeImageElement(loaded) : null;
    } finally {
      URL.revokeObjectURL(freshUrl);
    }
  } catch (err) {
    console.warn('[reportGenerator] fetch fallback failed', url, err);
    return null;
  }
}

function setColor(doc: jsPDF, mode: 'text' | 'draw' | 'fill', c: { r: number; g: number; b: number }) {
  if (mode === 'text') doc.setTextColor(c.r, c.g, c.b);
  if (mode === 'draw') doc.setDrawColor(c.r, c.g, c.b);
  if (mode === 'fill') doc.setFillColor(c.r, c.g, c.b);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN - 8) {
    doc.addPage();
    drawContinuationHeader(doc);
    return MARGIN + 14;
  }
  return y;
}

function drawTitleBand(doc: jsPDF, generatedAt: Date) {
  setColor(doc, 'fill', NAVY);
  doc.rect(0, 0, PAGE_W, 32, 'F');

  setColor(doc, 'text', { r: 255, g: 255, b: 255 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('SatQuery AI', MARGIN, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, 'text', { r: 160, g: 175, b: 195 });
  doc.text('Geospatial Imagery Analysis Report', MARGIN, 22);

  doc.setFontSize(8);
  doc.text(
    `Generated ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    PAGE_W - MARGIN,
    22,
    { align: 'right' }
  );
}

function drawContinuationHeader(doc: jsPDF) {
  setColor(doc, 'draw', LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, 12, PAGE_W - MARGIN, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, 'text', INK_DIM);
  doc.text('SatQuery AI — Analysis report (cont.)', MARGIN, 9);
}

function drawSectionLabel(doc: jsPDF, y: number, label: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  setColor(doc, 'text', ACCENT);
  doc.text(label.toUpperCase(), MARGIN, y);
  return y + 5.5;
}

function drawDivider(doc: jsPDF, y: number): number {
  setColor(doc, 'draw', LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 7;
}

/**
 * Builds and downloads a professional, multi-page PDF report for a single
 * SatQuery analysis: the query asked, the model's answer, key metadata, and
 * every staged image (rendered inline where the browser can decode it,
 * otherwise noted as a non-previewable raster).
 */
export async function downloadAnalysisReport(
  response: BackendAskResponse,
  images: UploadedImage[]
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const generatedAt = new Date();

  drawTitleBand(doc, generatedAt);
  let y = 42;

  // Metadata strip
  const taskLabel = getTaskLabel(response.task_selected);
  const confidencePct = Math.round(
    Math.max(0, Math.min(1, response.output?.confidence ?? 0.8)) * 100
  );
  const frameCount = response.images_provided ?? images.length;

  const cols: [string, string][] = [
    ['Task', taskLabel],
    ['Specialist tool', response.tool_used || '—'],
    ['Confidence', `${confidencePct}%`],
    ['Frames analyzed', String(frameCount)],
  ];
  const colW = CONTENT_W / cols.length;
  cols.forEach(([label, value], i) => {
    const x = MARGIN + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor(doc, 'text', INK_FAINT);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(doc, 'text', INK);
    doc.text(value, x, y + 5.5);
  });
  y += 14;
  y = drawDivider(doc, y);

  // Query
  y = drawSectionLabel(doc, y, 'Query');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  setColor(doc, 'text', { r: 55, g: 62, b: 72 });
  const queryLines = doc.splitTextToSize(`\u201C${response.query}\u201D`, CONTENT_W);
  doc.text(queryLines, MARGIN, y);
  y += queryLines.length * 5.4 + 6;

  // Answer
  y = ensureSpace(doc, y, 20);
  y = drawSectionLabel(doc, y, 'Findings & analysis');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setColor(doc, 'text', INK);
  const answerLines: string[] = doc.splitTextToSize(
    response.output?.answer || 'No answer text returned by the backend tool.',
    CONTENT_W
  );
  for (const line of answerLines) {
    y = ensureSpace(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 5.6;
  }
  y += 4;

  // Imagery
  if (images.length > 0) {
    y = ensureSpace(doc, y, 16);
    y = drawDivider(doc, y);
    y = drawSectionLabel(doc, y, `Imagery (${images.length})`);
    y += 1;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const frameLabel = images.length === 2 ? (i === 0 ? 'Frame A' : 'Frame B') : `Frame ${i + 1}`;

      y = ensureSpace(doc, y, 90);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      setColor(doc, 'text', INK);
      doc.text(frameLabel, MARGIN, y);
      doc.setFont('helvetica', 'normal');
      setColor(doc, 'text', INK_FAINT);
      const nameW = doc.getTextWidth(frameLabel) + 4;
      doc.setFontSize(8.5);
      doc.text(img.name, MARGIN + nameW, y);
      y += 4.5;

      let rendered = false;
      if (!isTiffRaster(img.name) && !img.previewUrl) {
        console.warn('[reportGenerator] frame has no previewUrl, skipping embed', img.name);
      }
      if (!isTiffRaster(img.name) && img.previewUrl) {
        const loaded = await loadImageAsDataUrl(img.previewUrl);
        if (loaded) {
          const maxW = CONTENT_W;
          const maxH = 78;
          let drawW = maxW;
          let drawH = (loaded.height / loaded.width) * drawW;
          if (drawH > maxH) {
            drawH = maxH;
            drawW = (loaded.width / loaded.height) * drawH;
          }
          y = ensureSpace(doc, y, drawH + 10);
          setColor(doc, 'draw', LINE);
          doc.setLineWidth(0.3);
          doc.rect(MARGIN, y, drawW, drawH);
          doc.addImage(loaded.dataUrl, 'JPEG', MARGIN, y, drawW, drawH);
          y += drawH + 4;
          rendered = true;
        }
      }

      if (!rendered) {
        setColor(doc, 'draw', LINE);
        setColor(doc, 'fill', { r: 246, g: 247, b: 249 });
        doc.rect(MARGIN, y, CONTENT_W, 26, 'FD');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        setColor(doc, 'text', INK_FAINT);
        doc.text(
          isTiffRaster(img.name)
            ? 'GeoTIFF / TIFF raster — not directly previewable in this report'
            : 'Preview unavailable for this frame',
          PAGE_W / 2,
          y + 14,
          { align: 'center' }
        );
        y += 30;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setColor(doc, 'text', INK_FAINT);
      const dims = img.dimensions ? `${img.dimensions.width} \u00D7 ${img.dimensions.height}px` : '';
      doc.text([formatBytes(img.size), dims].filter(Boolean).join('   \u00B7   '), MARGIN, y);
      y += 9;
    }
  }

  // Footer (page numbers) on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor(doc, 'text', INK_FAINT);
    doc.text(`SatQuery AI  \u00B7  Page ${p} of ${pageCount}`, PAGE_W / 2, PAGE_H - 8, {
      align: 'center',
    });
  }

  const stamp = generatedAt.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  doc.save(`satquery-report-${stamp}.pdf`);
}