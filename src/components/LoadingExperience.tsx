import React from 'react';
import { Layers } from 'lucide-react';
import { UploadedImage } from '../types';

interface LoadingExperienceProps {
  question: string;
  images?: UploadedImage[];
  imageCount: number;
}

export const LoadingExperience: React.FC<LoadingExperienceProps> = ({
  question,
  images = [],
  imageCount,
}) => {
  const actualCount = images.length > 0 ? images.length : imageCount;

  return (
    <div 
      id="analysis-loading-state"
      className="border border-slate-200 dark:border-slate-800/90 rounded-lg bg-white dark:bg-[#0c1017] p-4 sm:p-5 transition-colors"
      role="status"
      aria-live="polite"
    >
      {/* Calm Status Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Calm, quiet radar indicator */}
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-slate-400 dark:bg-slate-500 opacity-25 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-800 dark:bg-slate-200" />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Analyzing Remote-Sensing Imagery
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Processing {actualCount} {actualCount === 1 ? 'frame' : 'frames'} with SatQuery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Inference active</span>
        </div>
      </div>

      {/* Query Being Evaluated */}
      <div className="mb-3 px-3 py-2 rounded bg-slate-50 dark:bg-[#070b12] border border-slate-200/60 dark:border-slate-800/60">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
          ACTIVE QUERY
        </span>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
          &ldquo;{question}&rdquo;
        </p>
      </div>

      {/* Imagery Context (if images provided) */}
      {images.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Inputs: {images.map((img, i) => `${actualCount === 2 ? (i === 0 ? 'Frame A' : 'Frame B') : `Frame ${i + 1}`} (${img.name})`).join(' &bull; ')}
          </span>
        </div>
      )}

      {/* Subtle, Professional Indeterminate Progress Track */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/70 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-slate-900 dark:bg-slate-200 h-full rounded-full w-1/3 animate-[indeterminate_1.8s_ease-in-out_infinite]" 
          style={{
            animation: 'loading-glide 1.6s ease-in-out infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes loading-glide {
          0% { transform: translateX(-100%); width: 25%; }
          50% { width: 55%; }
          100% { transform: translateX(400%); width: 25%; }
        }
      `}</style>
    </div>
  );
};
