import React, { useRef, useState } from 'react';
import { 
  Upload, 
  X, 
  Maximize2,
  Trash2,
  Plus,
  Layers
} from 'lucide-react';
import { UploadedImage } from '../types';
import { formatFileSize } from '../utils/formatters';
import { SAMPLE_DATASETS, SampleDataset, createSampleFiles } from '../utils/sampleData';

interface ImageWorkspaceProps {
  images: UploadedImage[];
  onAddFiles: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onReplaceImage: (id: string, newFile: File) => void;
  onClearAll: () => void;
  onSelectSamplePreset?: (dataset: SampleDataset, files: File[]) => void;
  isLoading?: boolean;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  images,
  onAddFiles,
  onRemoveImage,
  onReplaceImage,
  onClearAll,
  onSelectSamplePreset,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<UploadedImage | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const isTiffRaster = (name: string): boolean => {
    const lower = name.toLowerCase();
    return lower.endsWith('.tif') || lower.endsWith('.tiff');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onAddFiles(filesArray);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onAddFiles(filesArray);
      e.target.value = '';
    }
  };

  const handleReplaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingId && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onReplaceImage(replacingId, file);
      setReplacingId(null);
      e.target.value = '';
    }
  };

  const handleLoadPreset = async (preset: SampleDataset) => {
    try {
      setIsGeneratingSample(true);
      const files = await createSampleFiles(preset);
      if (onSelectSamplePreset) {
        onSelectSamplePreset(preset, files);
      } else {
        onAddFiles(files);
      }
    } finally {
      setIsGeneratingSample(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-lg p-3.5 sm:p-4 flex flex-col h-full transition-colors">
      {/* Workspace Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/60 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Imagery
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {images.length === 0 ? 'None staged' : `${images.length} ${images.length === 1 ? 'frame' : 'frames'}`}
          </span>
        </div>

        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Plus className="w-3 h-3" />
              <span>Add frame</span>
            </button>

            <button
              onClick={onClearAll}
              disabled={isLoading}
              className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Remove all frames"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept=".tif,.tiff,.png,.jpg,.jpeg,image/png,image/jpeg,image/tiff"
        className="hidden"
        id="file-upload-input"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceSelect}
        accept=".tif,.tiff,.png,.jpg,.jpeg,image/png,image/jpeg,image/tiff"
        className="hidden"
        id="file-replace-input"
      />

      {/* When NO Images: Compact Drag & Drop Area */}
      {images.length === 0 ? (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`min-h-[140px] sm:min-h-[160px] rounded border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-slate-400 bg-slate-50 dark:bg-slate-800/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20'
            }`}
          >
            <Upload className="w-4 h-4 text-slate-400 mb-2" />
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">
              Drop remote-sensing imagery here, or <span className="underline font-medium">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              GeoTIFF &bull; TIFF &bull; PNG &bull; JPEG
            </p>
          </div>

          {/* Compact Sample Datasets & Supported Input Scenarios */}
          <div className="pt-1 text-[11px]">
            <div className="flex items-center justify-between mb-1.5 text-slate-400 text-[10px]">
              <span className="font-semibold tracking-wider uppercase font-mono">SUPPORTED INPUT SCENARIOS</span>
              {isGeneratingSample && <span className="text-slate-400">Loading...</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SAMPLE_DATASETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  disabled={isGeneratingSample || isLoading}
                  className="text-left px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus:outline-none"
                >
                  <p className="font-medium text-[11px] text-slate-700 dark:text-slate-300 truncate">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {preset.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* When Images ARE Uploaded: Clean, Large Previews */
        <div className="flex-1 flex flex-col space-y-2.5">
          {/* TWO-IMAGE SIDE-BY-SIDE VIEW */}
          {images.length === 2 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Dual frames staged &bull; Identified as Frame A &amp; Frame B</span>
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Auto-routed by query
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {images.map((img, idx) => {
                  const label = idx === 0 ? 'Frame A' : 'Frame B';
                  return (
                    <div
                      key={img.id}
                      className="group border border-slate-200 dark:border-slate-800 rounded bg-[#060911] overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="px-2 py-1 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]" title={img.name}>
                            {img.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            onClick={() => {
                              setReplacingId(img.id);
                              replaceInputRef.current?.click();
                            }}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => onRemoveImage(img.id)}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-rose-400 p-0.5"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Large Canvas Preview */}
                      <div className="relative aspect-4/3 flex items-center justify-center overflow-hidden bg-black">
                        {loadErrors[img.id] || isTiffRaster(img.name) ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-950 text-slate-300">
                            <Layers className="w-6 h-6 text-emerald-500 mb-1.5" />
                            <span className="text-[11px] font-mono font-medium text-slate-200">
                              {isTiffRaster(img.name) ? 'GeoTIFF / TIFF Raster' : 'Binary Satellite Raster'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Staged for model inference
                            </span>
                          </div>
                        ) : (
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            onError={() => setLoadErrors((prev) => ({ ...prev, [img.id]: true }))}
                            className="w-full h-full object-contain"
                          />
                        )}
                        <button
                          onClick={() => setPreviewZoomImage(img)}
                          className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Expand preview"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Meta info */}
                      <div className="px-2 py-1 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                        <span className="truncate max-w-[120px]" title={img.name}>{img.name}</span>
                        <span>{formatFileSize(img.size)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SINGLE IMAGE VIEW: LARGE IMMERSIVE CANVAS */}
          {images.length === 1 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-[#060911] overflow-hidden group flex flex-col">
              {/* Header */}
              <div className="px-2.5 py-1 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={images[0].name}>
                  {images[0].name}
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => {
                      setReplacingId(images[0].id);
                      replaceInputRef.current?.click();
                    }}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => onRemoveImage(images[0].id)}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* High-res Preview Canvas */}
              <div className="relative aspect-16/10 flex items-center justify-center overflow-hidden bg-black">
                {loadErrors[images[0].id] || isTiffRaster(images[0].name) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950 text-slate-300">
                    <Layers className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-xs font-mono font-medium text-slate-200">
                      {isTiffRaster(images[0].name) ? 'GeoTIFF / TIFF Satellite Raster' : 'Binary Satellite Raster'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Ready for remote-sensing inference
                    </span>
                  </div>
                ) : (
                  <img
                    src={images[0].previewUrl}
                    alt={images[0].name}
                    onError={() => setLoadErrors((prev) => ({ ...prev, [images[0].id]: true }))}
                    className="w-full h-full object-contain"
                  />
                )}
                <button
                  onClick={() => setPreviewZoomImage(images[0])}
                  className="absolute bottom-2 right-2 p-1 rounded bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Expand preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Technical Metadata Strip */}
              <div className="px-2.5 py-1 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>{formatFileSize(images[0].size)}</span>
                {images[0].dimensions && (
                  <span>{images[0].dimensions.width} &times; {images[0].dimensions.height} px</span>
                )}
              </div>
            </div>
          )}

          {/* MORE THAN 2 IMAGES */}
          {images.length > 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="border border-slate-200 dark:border-slate-800 rounded bg-[#060911] overflow-hidden group flex flex-col"
                >
                  <div className="relative aspect-square flex items-center justify-center bg-black">
                    {loadErrors[img.id] || isTiffRaster(img.name) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-950 text-slate-300">
                        <Layers className="w-5 h-5 text-emerald-500 mb-1" />
                        <span className="text-[10px] font-mono font-medium text-slate-200">
                          {isTiffRaster(img.name) ? 'GeoTIFF' : 'Raster'}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        onError={() => setLoadErrors((prev) => ({ ...prev, [img.id]: true }))}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      onClick={() => onRemoveImage(img.id)}
                      disabled={isLoading}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-slate-300 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-1 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 truncate font-mono">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div
            className="bg-[#0c1017] border border-slate-800 rounded-lg overflow-hidden max-w-4xl w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <span className="font-mono text-[11px] truncate">{previewZoomImage.name}</span>
              <button
                onClick={() => setPreviewZoomImage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center p-4 min-h-[300px] max-h-[75vh]">
              {loadErrors[previewZoomImage.id] || isTiffRaster(previewZoomImage.name) ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950 rounded border border-slate-800">
                  <Layers className="w-12 h-12 text-emerald-500 mb-3" />
                  <span className="text-sm font-mono font-medium text-slate-200">
                    {isTiffRaster(previewZoomImage.name) ? 'GeoTIFF / TIFF Satellite Raster' : 'Binary Satellite Raster'}
                  </span>
                  <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
                    Staged binary file ready for SatQuery multi-band inference.
                  </p>
                </div>
              ) : (
                <img
                  src={previewZoomImage.previewUrl}
                  alt={previewZoomImage.name}
                  onError={() => setLoadErrors((prev) => ({ ...prev, [previewZoomImage.id]: true }))}
                  className="max-h-[70vh] object-contain"
                />
              )}
            </div>
            <div className="px-3 py-1.5 bg-[#0c1017] text-slate-400 text-[10px] font-mono flex justify-between">
              <span>{formatFileSize(previewZoomImage.size)}</span>
              {previewZoomImage.dimensions && (
                <span>{previewZoomImage.dimensions.width} &times; {previewZoomImage.dimensions.height} px</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
