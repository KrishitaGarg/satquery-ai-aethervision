import React from 'react';
import { 
  Layers, 
  Moon, 
  Sun, 
  Settings
} from 'lucide-react';
import { AppTheme } from '../types';

interface HeaderProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  activeTab: 'analyze' | 'history' | 'about';
  setActiveTab: (tab: 'analyze' | 'history' | 'about') => void;
  onOpenSettings: () => void;
  apiBaseUrl: string;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeTab,
  setActiveTab,
  onOpenSettings,
  apiBaseUrl,
  historyCount,
}) => {
  const displayHost = apiBaseUrl.replace(/^https?:\/\//, '');

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('analyze')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="SatQuery AI"
          >
            <img
              src="/assets/satquery-logo.png"
              alt=""
              className="w-8 h-8 object-contain"
            />

            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                  SatQuery
                </span>
                <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                  AI
                </span>
              </div>

              <span className="mt-1 text-[8px] tracking-[0.16em] uppercase text-slate-400 dark:text-slate-500">
                Insights from Above · AetherVision
              </span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-4 h-5">
            <button
              id="nav-tab-analyze"
              onClick={() => setActiveTab('analyze')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === 'analyze'
                  ? 'text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Analyze
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-about"
              onClick={() => setActiveTab('about')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === 'about'
                  ? 'text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-2 py-0.5 text-xs rounded ${
              activeTab === 'analyze' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'text-slate-500'
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2 py-0.5 text-xs rounded ${
              activeTab === 'history' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'text-slate-500'
            }`}
          >
            History {historyCount > 0 ? `(${historyCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-2 py-0.5 text-xs rounded ${
              activeTab === 'about' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'text-slate-500'
            }`}
          >
            About
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            title={`Backend: ${apiBaseUrl}`}
            className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[120px]">{displayHost}</span>
          </button>

          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id="settings-btn"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
