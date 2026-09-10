import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageWorkspace } from './components/ImageWorkspace';
import { QueryAssistant } from './components/QueryAssistant';
import { LoadingExperience } from './components/LoadingExperience';
import { ResultsPanel } from './components/ResultsPanel';
import { RecentAnalyses } from './components/RecentAnalyses';
import { AboutView } from './components/AboutView';
import { SettingsModal } from './components/SettingsModal';
import { ComingSoonModal } from './components/ComingSoonModal';
import { 
  UploadedImage, 
  BackendAskResponse, 
  AnalysisHistoryItem, 
  AppTheme, 
  ComingSoonFeature 
} from './types';
import { askSatQuery, getApiBaseUrl } from './services/api';
import { SampleDataset } from './utils/sampleData';
import { AlertCircle, RotateCcw } from 'lucide-react';

const STORAGE_KEY_THEME = 'satquery_theme_preference';
const STORAGE_KEY_HISTORY = 'satquery_recent_analyses_v1';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme;
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'dark';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'about'>('about');

  // Staged Images & Query
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [question, setQuestion] = useState<string>('');

  // Processing & Results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<BackendAskResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // History & Settings Modals
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore parse error
      }
    }
    return [];
  });

  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(getApiBaseUrl());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedComingSoon, setSelectedComingSoon] = useState<ComingSoonFeature | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persist history changes
  const saveHistory = (newHistory: AnalysisHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    } catch {
      // Storage quota or error
    }
  };

  // File addition handler
  const handleAddFiles = useCallback((files: File[]) => {
    setValidationError(null);
    setErrorMessage(null);

    const newItems: UploadedImage[] = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      const imgItem: UploadedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type || 'image/png',
      };

      const img = new Image();
      img.onload = () => {
        setUploadedImages((curr) =>
          curr.map((item) =>
            item.id === imgItem.id
              ? { ...item, dimensions: { width: img.naturalWidth, height: img.naturalHeight } }
              : item
          )
        );
      };
      img.src = previewUrl;

      return imgItem;
    });

    setUploadedImages((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleReplaceImage = (id: string, newFile: File) => {
    const previewUrl = URL.createObjectURL(newFile);
    const updated: UploadedImage = {
      id,
      file: newFile,
      previewUrl,
      name: newFile.name,
      size: newFile.size,
      type: newFile.type || 'image/png',
    };

    const img = new Image();
    img.onload = () => {
      setUploadedImages((curr) =>
        curr.map((item) =>
          item.id === id
            ? { ...item, dimensions: { width: img.naturalWidth, height: img.naturalHeight } }
            : item
        )
      );
    };
    img.src = previewUrl;

    setUploadedImages((prev) => {
      const old = prev.find((i) => i.id === id);
      if (old) URL.revokeObjectURL(old.previewUrl);
      return prev.map((i) => (i.id === id ? updated : i));
    });
  };

  const handleClearAllImages = () => {
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setUploadedImages([]);
  };

  const handleSelectSamplePreset = (preset: SampleDataset, files: File[]) => {
    handleClearAllImages();
    handleAddFiles(files);
    setQuestion(preset.suggestedQuery);
  };

  // Main Analysis Trigger
  const handleAnalyze = async () => {
    setValidationError(null);
    setErrorMessage(null);

    if (uploadedImages.length === 0) {
      setValidationError('Please stage at least one satellite image.');
      return;
    }

    if (!question.trim()) {
      setValidationError('Please enter a natural-language query.');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    setTimeout(() => {
      document.getElementById('analysis-loading-state')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 50);

    try {
      const fileObjects = uploadedImages.map((item) => item.file);
      const result = await askSatQuery(question.trim(), fileObjects);

      setResponse(result);

      // Save to client-side history
      const historyRecord: AnalysisHistoryItem = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        query: question.trim(),
        taskSelected: result.task_selected,
        toolUsed: result.tool_used,
        confidence: result.output.confidence,
        answer: result.output.answer,
        imagesProvided: result.images_provided,
        imageNames: uploadedImages.map((i) => i.name),
        fullResponse: result,
      };

      saveHistory([historyRecord, ...history.slice(0, 19)]);

      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during analysis.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setQuestion(item.query);
    setResponse(item.fullResponse);
    setErrorMessage(null);
    setActiveTab('analyze');
    setTimeout(() => {
      document.getElementById('analysis-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    saveHistory(history.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-[#080c13] text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* Top Navigation */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiBaseUrl={apiBaseUrl}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-5 flex flex-col">
        {/* TAB 1: ANALYZE WORKSPACE */}
        {activeTab === 'analyze' && (
          <div className="space-y-3.5">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Analysis Failed</p>
                    <p className="mt-0.5 opacity-90">{errorMessage}</p>
                    <p className="mt-1 font-mono text-[10px] text-slate-500">
                      Target: {apiBaseUrl}/ask
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleAnalyze}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-xs text-rose-500 hover:text-rose-700 px-1.5 py-0.5"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Two-Column GIS Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              {/* Left Column: Image Workspace (7 cols) */}
              <div className="lg:col-span-7">
                <ImageWorkspace
                  images={uploadedImages}
                  onAddFiles={handleAddFiles}
                  onRemoveImage={handleRemoveImage}
                  onReplaceImage={handleReplaceImage}
                  onClearAll={handleClearAllImages}
                  onSelectSamplePreset={handleSelectSamplePreset}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Column: Query Assistant (5 cols) */}
              <div className="lg:col-span-5">
                <QueryAssistant
                  question={question}
                  setQuestion={setQuestion}
                  onSubmit={handleAnalyze}
                  isLoading={isLoading}
                  images={uploadedImages}
                  validationError={validationError}
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <LoadingExperience
                question={question}
                images={uploadedImages}
                imageCount={uploadedImages.length}
              />
            )}

            {/* Analysis Results Display */}
            {response && !isLoading && (
              <ResultsPanel
                response={response}
                uploadedImages={uploadedImages}
                onNewQuery={() => {
                  setQuestion('');
                  document.getElementById('query-input')?.focus();
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: QUERY HISTORY */}
        {activeTab === 'history' && (
          <RecentAnalyses
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {/* TAB 3: ABOUT */}
        {activeTab === 'about' && <AboutView onNavigateToAnalyze={() => setActiveTab('analyze')} />}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-2.5 px-4 sm:px-6 text-[11px] text-slate-400 bg-white dark:bg-[#0c1017] transition-colors mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600 dark:text-slate-400">SatQuery AI</span>
            <span>&bull;</span>
            <span>Team AetherVision</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono"
            >
              API: {apiBaseUrl}
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onClearHistory={handleClearHistory}
        currentApiUrl={apiBaseUrl}
        onApiUrlChange={(newUrl) => setApiBaseUrlState(newUrl)}
      />

      {/* Feature Details Modal */}
      <ComingSoonModal
        feature={selectedComingSoon}
        onClose={() => setSelectedComingSoon(null)}
      />
    </div>
  );
}