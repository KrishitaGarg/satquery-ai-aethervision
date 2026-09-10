import React, { useState } from 'react';
import { Trash2, ArrowRight, History, ChevronDown } from 'lucide-react';
import { AnalysisHistoryItem, BackendAskResponse } from '../types';

const formatConfidence = (c: number) => `${Math.round(c * 100)}% conf`;
const getTaskLabel = (t: string) => t;

const EXTRA_FIELDS: Array<{ key: keyof BackendAskResponse; label: string }> = [
  { key: 'bounding_boxes', label: 'Bounding boxes' },
  { key: 'regions', label: 'Regions' },
  { key: 'masks', label: 'Masks' },
  { key: 'change_map', label: 'Change map' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'execution_trace', label: 'Execution trace' },
];

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="sq-history">
      <style>{`
        .sq-history {
          --bg: #ffffff;
          --panel: #f8fafc;
          --line: rgba(15, 23, 42, 0.10);
          --line-strong: rgba(15, 23, 42, 0.18);
          --ink: #0f172a;
          --ink-dim: #64748b;
          --ink-faint: #94a3b8;
          --accent: #159570;
          --accent-soft: rgba(21, 149, 112, 0.10);
          --accent-line: rgba(21, 149, 112, 0.30);
          --rose: #e11d48;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          max-width: 56rem;
          width: 100%;
          margin: 0 auto;
        }
        .dark .sq-history {
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
        .sq-h-restore:hover { background: var(--accent); color: var(--bg); }
        .sq-h-toggle { transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease; }
        .sq-h-toggle:hover { color: var(--accent); border-color: var(--accent-line); }
        .sq-h-toggle.is-active { color: var(--accent); border-color: var(--accent-line); background: var(--accent-soft); }
        .sq-h-chevron { transition: transform 0.15s ease; }
        .sq-h-chevron.is-open { transform: rotate(180deg); }
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
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  style={{ borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--line)' }}
                >
                  <div className="sq-h-row flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4">
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
                        onClick={() => toggleExpand(item.id)}
                        className={`sq-h-toggle flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border ${isExpanded ? 'is-active' : ''}`}
                        style={{ borderColor: 'var(--line)', color: 'var(--ink-dim)' }}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? 'Hide details' : 'Details'}</span>
                        <ChevronDown className={`sq-h-chevron w-3.5 h-3.5 ${isExpanded ? 'is-open' : ''}`} />
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

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div
                      className="px-5 sm:px-6 pb-5 pt-4"
                      style={{ borderTop: '1px dashed var(--line)', background: 'rgba(148, 163, 184, 0.02)' }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                        {item.answer}
                      </p>

                      {/* Quick facts */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="sq-h-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>Task</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>{item.taskSelected}</p>
                        </div>
                        <div>
                          <p className="sq-h-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>Tool used</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>{item.toolUsed}</p>
                        </div>
                        <div>
                          <p className="sq-h-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>Confidence</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>{formatConfidence(item.confidence)}</p>
                        </div>
                        <div>
                          <p className="sq-h-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>Images</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>{item.imagesProvided}</p>
                        </div>
                      </div>

                      {/* Image names */}
                      {item.imageNames && item.imageNames.length > 0 && (
                        <div className="mt-4">
                          <p className="sq-h-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-faint)' }}>
                            Source files
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.imageNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="sq-h-mono text-[10px] px-2 py-1 rounded border truncate max-w-[220px]"
                                style={{ color: 'var(--ink-dim)', borderColor: 'var(--line)' }}
                                title={name}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extra evidence chips, only for fields present on this record */}
                      {(() => {
                        const chips = EXTRA_FIELDS.map((f) => {
                          const val = item.fullResponse?.[f.key];
                          if (val === undefined || val === null) return null;
                          const count = Array.isArray(val) ? val.length : null;
                          return (
                            <span
                              key={f.key}
                              className="sq-h-mono text-[10px] px-2 py-1 rounded-full border"
                              style={{ color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' }}
                            >
                              {f.label}
                              {count !== null ? ` · ${count}` : ''}
                            </span>
                          );
                        }).filter(Boolean);

                        return chips.length > 0 ? (
                          <div className="mt-4">
                            <p className="sq-h-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-faint)' }}>
                              Additional evidence
                            </p>
                            <div className="flex flex-wrap gap-1.5">{chips}</div>
                          </div>
                        ) : null;
                      })()}

                      {/* Continue in workspace */}
                      <button
                        onClick={() => onSelectHistoryItem(item)}
                        className="sq-h-restore inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium mt-5"
                        style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                      >
                        <span>Open in Analyze workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
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