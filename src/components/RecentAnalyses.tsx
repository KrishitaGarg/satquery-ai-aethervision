import React from 'react';
import { Trash2, ArrowRight, History } from 'lucide-react';
import { AnalysisHistoryItem } from '../types';

const formatConfidence = (c: number) => `${Math.round(c * 100)}% conf`;
const getTaskLabel = (t: string) => t;

interface RecentAnalysesProps {
  history: AnalysisHistoryItem[];
  onSelectHistoryItem?: (item: AnalysisHistoryItem) => void;
  onClearHistory?: () => void;
  onDeleteItem?: (id: string) => void;
}

export const RecentAnalyses = ({
  history,
  onSelectHistoryItem = () => {},
  onClearHistory = () => {},
  onDeleteItem = () => {},
}: RecentAnalysesProps) => {
  return (
    <div className="sq-history">
      <style>{`
        .sq-history {
          --bg: #070b12;
          --panel: #0c121c;
          --line: rgba(148, 163, 184, 0.14);
          --line-strong: rgba(148, 163, 184, 0.26);
          --ink: #eaeef4;
          --ink-dim: #97a3b6;
          --ink-faint: #5c6b81;
          --accent: #3ddc9b;
          --accent-soft: rgba(61, 220, 155, 0.12);
          --accent-line: rgba(61, 220, 155, 0.35);
          --rose: #fb7185;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          max-width: 56rem;
          width: 100%;
          margin: 0 auto;
        }
        .sq-history * { box-sizing: border-box; }
        .sq-h-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        .sq-h-corner { position: relative; }
        .sq-h-corner::before, .sq-h-corner::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: var(--accent-line);
        }
        .sq-h-corner::before { top: -1px; left: -1px; border-top: 1.5px solid; border-left: 1.5px solid; }
        .sq-h-corner::after { bottom: -1px; right: -1px; border-bottom: 1.5px solid; border-right: 1.5px solid; }
        .sq-h-row { transition: background-color 0.15s ease; }
        .sq-h-row:hover { background: rgba(148, 163, 184, 0.04); }
        .sq-h-restore { transition: background-color 0.15s ease, color 0.15s ease; }
        .sq-h-restore:hover { background: var(--accent); color: #070b12; }
        .sq-h-delete { transition: color 0.15s ease, border-color 0.15s ease; }
        .sq-h-delete:hover { color: var(--rose); border-color: rgba(251, 113, 133, 0.4); }
        .sq-h-clear:hover { color: var(--rose); }
      `}</style>

      {history.length === 0 ? (
        <div
          className="sq-h-corner rounded-md border p-10 text-center"
          style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
        >
          <History className="w-4 h-4 mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            No records logged yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-dim)' }}>
            Analyses you run this session are saved here, locally.
          </p>
        </div>
      ) : (
        <div
          className="sq-h-corner rounded-md border"
          style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Analysis history
              </h2>
              <p className="sq-h-mono text-[11px] mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                {history.length} {history.length === 1 ? 'record' : 'records'} · stored locally
              </p>
            </div>

            <button
              onClick={onClearHistory}
              className="sq-h-clear text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors"
              style={{ color: 'var(--ink-dim)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>

          {/* Rows */}
          <div>
            {history.map((item, i) => {
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
                  className="sq-h-row flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4"
                  style={{ borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--line)' }}
                >
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span
                        className="sq-h-mono text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' }}
                      >
                        {taskLabel}
                      </span>
                      <span className="sq-h-mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                        {formatConfidence(item.confidence)}
                      </span>
                      <span className="sq-h-mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                        {item.imagesProvided} {item.imagesProvided === 1 ? 'image' : 'images'}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                        {dateFormatted} · {timeFormatted}
                      </span>
                    </div>

                    {/* Question */}
                    <p className="text-sm font-medium truncate mb-0.5" style={{ color: 'var(--ink)' }}>
                      &ldquo;{item.query}&rdquo;
                    </p>

                    {/* Answer excerpt */}
                    <p
                      className="text-xs overflow-hidden"
                      style={{
                        color: 'var(--ink-dim)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      className="sq-h-restore flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                      style={{ background: 'var(--ink)', color: '#070b12' }}
                    >
                      <span>Restore</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="sq-h-delete p-1.5 rounded border"
                      style={{ color: 'var(--ink-faint)', borderColor: 'var(--line)' }}
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
      )}
    </div>
  );
};

export default RecentAnalyses;