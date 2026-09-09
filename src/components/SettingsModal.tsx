import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertCircle, 
  Moon, 
  Sun
} from 'lucide-react';
import { AppTheme } from '../types';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, testApiConnection } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onClearHistory: () => void;
  currentApiUrl: string;
  onApiUrlChange: (newUrl: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onClearHistory,
  currentApiUrl,
  onApiUrlChange,
}) => {
  const [urlInput, setUrlInput] = useState(currentApiUrl);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    statusText: string;
    durationMs?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testApiConnection(urlInput);
      setTestResult({
        tested: true,
        ok: res.ok,
        statusText: res.statusText,
        durationMs: res.durationMs,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setApiBaseUrl(trimmed);
      onApiUrlChange(trimmed);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleReset = () => {
    resetApiBaseUrl();
    const defaultUrl = getApiBaseUrl();
    setUrlInput(defaultUrl);
    onApiUrlChange(defaultUrl);
    setTestResult(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-lg transition-colors max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              API endpoint & workspace configuration
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 my-4">
          {/* Section 1: Backend API Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Backend Endpoint
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Target URL for <code className="font-mono text-slate-700 dark:text-slate-300">/ask</code> requests
            </p>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-slate-400"
              />
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white flex items-center gap-1 shrink-0 transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedSuccess ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-2.5 py-1 rounded text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                onClick={handleReset}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                title="Reset to default URL"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded border text-xs flex items-start gap-2 ${
                  testResult.ok
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                {testResult.ok ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{testResult.statusText}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {testResult.ok
                      ? `Latency: ${testResult.durationMs}ms.`
                      : 'Ensure backend server is running and CORS headers are configured.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Appearance */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Appearance
            </label>
            <div className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f17]">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-2.5 py-1 rounded text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131f] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Section 3: Storage */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              History Storage
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clear saved analysis history stored in this browser session.
            </p>
            <button
              onClick={() => {
                onClearHistory();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="px-2.5 py-1.5 rounded text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Analysis History</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
