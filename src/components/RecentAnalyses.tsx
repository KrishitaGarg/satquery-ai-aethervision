import React from 'react';
import { 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import { AnalysisHistoryItem } from '../types';
import { 
  formatConfidence, 
  getTaskLabel 
} from '../utils/formatters';

interface RecentAnalysesProps {
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const RecentAnalyses: React.FC<RecentAnalysesProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
}) => {
  if (history.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#0e131f] p-8 text-center max-w-lg mx-auto">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
          No analysis history yet
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analyses conducted during your session will be saved locally.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#0e131f] p-5 sm:p-6 transition-colors max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Analysis History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {history.length} {history.length === 1 ? 'record' : 'records'} stored locally
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear all</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {history.map((item) => {
          const taskLabel = getTaskLabel(item.taskSelected);
          const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const dateFormatted = new Date(item.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={item.id}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 rounded text-[11px]">
                    {taskLabel}
                  </span>

                  <span className="font-mono text-[11px] text-slate-400">
                    {formatConfidence(item.confidence)}
                  </span>

                  <span className="font-mono text-[11px] text-slate-400">
                    {item.imagesProvided} {item.imagesProvided === 1 ? 'image' : 'images'}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {dateFormatted} {timeFormatted}
                  </span>
                </div>

                {/* Question */}
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate mb-0.5">
                  &ldquo;{item.query}&rdquo;
                </p>

                {/* Answer excerpt */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.answer}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white flex items-center gap-1 transition-colors"
                >
                  <span>Restore</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
