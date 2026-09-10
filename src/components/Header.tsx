import React, { useEffect, useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { AppTheme } from '../types';

interface HeaderProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  activeTab: 'analyze' | 'history' | 'about';
  setActiveTab: (tab: 'analyze' | 'history' | 'about') => void;
  onOpenSettings: () => void;
  historyCount: number;
}

const NAV_ITEMS: { id: 'about' | 'analyze' | 'history'; label: string }[] = [
  { id: 'about', label: 'Home' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'history', label: 'History' },
];

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeTab,
  setActiveTab,
  onOpenSettings,
  historyCount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on outside click, Escape, or viewport resize past the breakpoint.
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 640) setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  const handleSelectTab = (tab: 'analyze' | 'history' | 'about') => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] transition-colors relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={() => handleSelectTab('about')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded shrink-0"
          aria-label="SatQuery AI, go to home"
        >
          <img
            src="/assets/satquery-logo.png"
            alt=""
            className="w-8 h-8 object-contain shrink-0"
          />

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                SatQuery
              </span>
              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                AI
              </span>
            </div>

            <span className="mt-1 text-[8px] tracking-[0.16em] uppercase text-slate-400 dark:text-slate-500 truncate hidden xs:block">
              Insights from Above · AetherVision
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-4 h-5 flex-1"
          aria-label="Primary"
        >
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              id={`nav-tab-${id}`}
              onClick={() => handleSelectTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeTab === id
                  ? 'text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{label}</span>
              {id === 'history' && historyCount > 0 && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {historyCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            className="sm:hidden p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {menuOpen && (
        <div
          ref={menuRef}
          id="mobile-nav-panel"
          className="sm:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] px-4 py-2 flex flex-col gap-0.5 shadow-lg"
        >
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleSelectTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeTab === id
                  ? 'text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{label}</span>
              {id === 'history' && historyCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {historyCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};