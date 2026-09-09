import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { UploadedImage } from '../types';

interface QueryAssistantProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  images: UploadedImage[];
  validationError?: string | null;
}

export const QueryAssistant: React.FC<QueryAssistantProps> = ({
  question,
  setQuestion,
  onSubmit,
  isLoading,
  images,
  validationError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageCount = images.length;

  // Dynamic suggestions based on number of images staged
  const suggestions = React.useMemo(() => {
    if (imageCount === 2) {
      return [
        { text: 'Has the forest area changed between Frame A and Frame B?', label: 'Forest change' },
        { text: 'What changed between these two dates, and where did it occur?', label: 'Bi-temporal summary' },
        { text: 'Use the optical and SAR images together to identify built-up and water-covered regions.', label: 'Cross-modal fusion' },
        { text: 'Has the built-up urban area increased between Frame A and Frame B?', label: 'Urban expansion' },
      ];
    }
    return [
      { text: 'Describe the land-cover and major features visible in this scene.', label: 'Land-cover description' },
      { text: 'Identify and highlight the dominant water body in this image.', label: 'Water body detection' },
      { text: 'What is the dominant land-use category visible in this imagery?', label: 'Dominant land-use' },
      { text: 'Identify all commercial infrastructure or transport vessels.', label: 'Infrastructure & vessels' },
    ];
  }, [imageCount]);

  // Contextual placeholder based on imagery staged
  const placeholderText = React.useMemo(() => {
    if (imageCount === 0) {
      return 'Stage satellite imagery on the left, then enter your analytical question...';
    }
    if (imageCount === 2) {
      return 'Ask a question comparing Frame A and Frame B, or fusing optical and SAR data...';
    }
    return 'Ask about this image: e.g. describe land cover, locate features, or ground objects...';
  }, [imageCount]);

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to submit, Esc to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && question.trim() && imageCount > 0) {
          onSubmit();
        }
      }
      if (e.key === 'Escape' && document.activeElement === textareaRef.current) {
        setQuestion('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, question, imageCount, onSubmit, setQuestion]);

  const canSubmit = !isLoading && question.trim().length > 0 && imageCount > 0;

  return (
    <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-lg p-3.5 sm:p-4 flex flex-col h-full transition-colors">
      {/* Query Header with Staging Indicator */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/60 mb-2.5">
        <div className="flex items-center gap-2">
          <label 
            htmlFor="query-input" 
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Analytical Query
          </label>
        </div>

        {/* Clear Staging Status Indicator */}
        <div className="flex items-center gap-2">
          {imageCount === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              0 images staged
            </span>
          )}

          {imageCount === 1 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60">
              <Layers className="w-3 h-3 text-slate-500" />
              <span>1 image &bull; Single Image</span>
            </span>
          )}

          {imageCount === 2 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>2 images &bull; Frame A + Frame B</span>
            </span>
          )}

          {imageCount > 2 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>{imageCount} images staged</span>
            </span>
          )}

          {question && (
            <button
              onClick={() => setQuestion('')}
              disabled={isLoading}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors px-1 py-0.5"
              title="Clear query (Esc)"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Small Contextual Guidance near Query Input */}
      <div className="mb-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
        {imageCount === 0 && (
          <span>Select or upload imagery to begin (supports Single Image, Bi-temporal Pair, or Optical + SAR Pair).</span>
        )}
        {imageCount === 1 && (
          <span>Ask about this image — VQA, scene description, or grounding.</span>
        )}
        {imageCount === 2 && (
          <span>Ask a question comparing or jointly analyzing these frames (Frame A &amp; Frame B).</span>
        )}
        {imageCount > 2 && (
          <span>Ask a question comparing or jointly analyzing these staged frames.</span>
        )}
      </div>

      {/* Main Action: Question Input Area */}
      <div className="flex-1 flex flex-col mb-3">
        <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-700/90 focus-within:border-slate-400 dark:focus-within:border-slate-500 rounded bg-white dark:bg-[#070a10] transition-colors shadow-xs">
          <textarea
            ref={textareaRef}
            id="query-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            placeholder={placeholderText}
            rows={4}
            className="w-full flex-1 p-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
          />

          {/* Hairline status strip below input */}
          <div className="px-3 py-1.5 bg-slate-50/60 dark:bg-[#06080e] border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Shortcut:</span>
              <kbd className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                Ctrl + Enter
              </kbd>
            </div>
            {question.length > 0 && <span>{question.length} chars</span>}
          </div>
        </div>

        {validationError && (
          <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Subtle & Compact Example Queries */}
      <div className="mb-3 pt-1">
        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400">
          <Sparkles className="w-3 h-3" />
          <span>Quick queries</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuestion(sug.text)}
              disabled={isLoading}
              title={sug.text}
              className="text-left text-[11px] px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-full"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Footer: Distinct, Visually Obvious Analyze Button */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400 font-mono">
          {imageCount === 0 ? (
            <span className="text-amber-600 dark:text-amber-400">Upload imagery first</span>
          ) : !question.trim() ? (
            <span>Type a question above</span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">Ready to analyze</span>
          )}
        </div>

        <button
          id="analyze-cta-btn"
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-semibold tracking-tight transition-all focus:outline-none ${
            !canSubmit
              ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
              : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing imagery...</span>
            </>
          ) : (
            <>
              <span>Run Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
