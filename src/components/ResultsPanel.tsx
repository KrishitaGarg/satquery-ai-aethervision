import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  FileType, 
  FileCode, 
  FileText,
  Maximize2,
  X,
  RotateCcw,
  Layers
} from 'lucide-react';
import { BackendAskResponse, UploadedImage } from '../types';
import { 
  getTaskLabel, 
  downloadReport, 
  formatFileSize 
} from '../utils/formatters';

interface ResultsPanelProps {
  response: BackendAskResponse;
  uploadedImages: UploadedImage[];
  onNewQuery: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  response,
  uploadedImages,
  onNewQuery,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExecutionInfo, setShowExecutionInfo] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState<UploadedImage | null>(null);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  const isTiffRaster = (name: string): boolean => {
    const lower = name.toLowerCase();
    return lower.endsWith('.tif') || lower.endsWith('.tiff');
  };

  const confidencePct = Math.round(
    Math.max(0, Math.min(1, response.output?.confidence || 0.8)) * 100
  );

  const taskLabel = getTaskLabel(response.task_selected);
  const imageNames = uploadedImages.map((img) => img.name);
  const imageCount = response.images_provided || uploadedImages.length;

  const handleCopyAnswer = async () => {
    if (!response.output?.answer) return;
    try {
      await navigator.clipboard.writeText(response.output.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleDownload = (format: 'html' | 'json' | 'txt') => {
    setShowDownloadMenu(false);
    downloadReport(response, imageNames, format);
  };

  return (
    <section 
      id="analysis-results" 
      className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 sm:p-5 transition-colors space-y-4"
      aria-label="Analysis Results"
    >
      {/* 1. Compact Metadata & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
        {/* Compact Metadata Strip: Task, Tool, Confidence, Image Count */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {taskLabel}
          </span>

          <span className="text-slate-300 dark:text-slate-700">&bull;</span>

          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {response.tool_used}
          </span>

          <span className="text-slate-300 dark:text-slate-700">&bull;</span>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{confidencePct}% confidence</span>
          </span>

          <span className="text-slate-300 dark:text-slate-700">&bull;</span>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {imageCount} {imageCount === 1 ? 'frame analyzed' : 'frames analyzed'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 relative text-xs">
          <button
            onClick={onNewQuery}
            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            title="Ask another question"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">New Query</span>
          </button>

          <button
            onClick={handleCopyAnswer}
            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            title="Copy answer text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-30">
                <button
                  onClick={() => handleDownload('html')}
                  className="w-full text-left px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <FileType className="w-3 h-3 text-slate-400" />
                  <span>HTML report</span>
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  className="w-full text-left px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <FileCode className="w-3 h-3 text-slate-400" />
                  <span>JSON payload</span>
                </button>
                <button
                  onClick={() => handleDownload('txt')}
                  className="w-full text-left px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>Plain text</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visual Focal Point: The Generated Answer */}
      <div className="rounded-md bg-slate-50/70 dark:bg-[#070b13] border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            FINDINGS &amp; ANALYSIS
          </span>
          <span className="text-[11px] text-slate-400 italic truncate max-w-md">
            Query: &ldquo;{response.query}&rdquo;
          </span>
        </div>

        {/* Hero Answer Typography */}
        <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-50 leading-relaxed">
          {response.output?.answer || 'No answer text returned.'}
        </div>
      </div>

      {/* 3. Visual Evidence Alongside / Below Findings */}
      {uploadedImages.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              EVIDENCE IMAGERY ({uploadedImages.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Click frame to enlarge
            </span>
          </div>

          <div className={`grid gap-3 ${uploadedImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
            {uploadedImages.map((img, idx) => {
              const frameLabel = uploadedImages.length === 2 
                ? (idx === 0 ? 'Frame A' : 'Frame B') 
                : `Frame ${idx + 1}`;

              return (
                <div
                  key={img.id}
                  onClick={() => setSelectedZoomImage(img)}
                  className="group border border-slate-200 dark:border-slate-800 rounded bg-[#060911] overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col"
                >
                  <div className="px-2.5 py-1 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {frameLabel}
                    </span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[120px]" title={img.name}>
                      {img.name}
                    </span>
                  </div>

                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {loadErrors[img.id] || isTiffRaster(img.name) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-950 text-slate-300">
                        <Layers className="w-6 h-6 text-emerald-500 mb-1" />
                        <span className="text-[11px] font-mono font-medium text-slate-200">
                          {isTiffRaster(img.name) ? 'GeoTIFF / TIFF Raster' : 'Binary Satellite Raster'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Analyzed by {response.tool_used}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        onError={() => setLoadErrors((prev) => ({ ...prev, [img.id]: true }))}
                        className="w-full h-full object-contain group-hover:scale-101 transition-transform"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-[11px] font-mono">
                        <Maximize2 className="w-3 h-3" />
                        <span>Inspect frame</span>
                      </span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{formatFileSize(img.size)}</span>
                    {img.dimensions && (
                      <span>{img.dimensions.width} &times; {img.dimensions.height} px</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Subtle Expandable Agent Activity & Execution Details Section */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => setShowExecutionInfo(!showExecutionInfo)}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors py-1 focus:outline-none"
          aria-expanded={showExecutionInfo}
        >
          {showExecutionInfo ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          <span>Agent Activity &bull; Execution Details</span>
        </button>

        {showExecutionInfo && (
          <div className="mt-2 p-3 rounded bg-slate-50/70 dark:bg-[#080c13] border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2.5">
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              SatQuery automatically routed this query to the appropriate specialist workflow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Task:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{taskLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Specialist:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{response.tool_used}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Images:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{response.images_provided ?? uploadedImages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Query:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]" title={response.query}>
                  &ldquo;{response.query}&rdquo;
                </span>
              </div>
            </div>

            {/* Optional Raw JSON Toggle */}
            <div className="pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
              >
                {showRawJson ? 'Hide raw response JSON' : 'View raw response JSON'}
              </button>
              {showRawJson && (
                <pre className="mt-2 p-2 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-[10px] overflow-x-auto text-slate-700 dark:text-slate-300 leading-tight max-h-48">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal for Detailed Inspection */}
      {selectedZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div
            className="bg-[#0c1017] border border-slate-800 rounded-lg overflow-hidden max-w-4xl w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-white text-xs font-mono">
              <span className="truncate">{selectedZoomImage.name}</span>
              <button
                onClick={() => setSelectedZoomImage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center p-4 min-h-[280px] max-h-[75vh]">
              {loadErrors[selectedZoomImage.id] || isTiffRaster(selectedZoomImage.name) ? (
                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-950 rounded border border-slate-800">
                  <Layers className="w-10 h-10 text-emerald-500 mb-2" />
                  <span className="text-sm font-mono font-medium text-slate-200">
                    {isTiffRaster(selectedZoomImage.name) ? 'GeoTIFF / TIFF Satellite Raster' : 'Binary Satellite Raster'}
                  </span>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Evaluated under task: {taskLabel}
                  </p>
                </div>
              ) : (
                <img
                  src={selectedZoomImage.previewUrl}
                  alt={selectedZoomImage.name}
                  onError={() => setLoadErrors((prev) => ({ ...prev, [selectedZoomImage.id]: true }))}
                  className="max-h-[70vh] object-contain"
                />
              )}
            </div>
            <div className="px-3 py-1.5 bg-[#0c1017] text-slate-400 text-[10px] font-mono flex justify-between">
              <span>{formatFileSize(selectedZoomImage.size)}</span>
              {selectedZoomImage.dimensions && (
                <span>{selectedZoomImage.dimensions.width} &times; {selectedZoomImage.dimensions.height} px</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
