import React from 'react';
import { Moon, Sun, Settings, Link2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-12 px-4 flex items-center justify-between border-b border-light-border dark:border-dark-border bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm select-none shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-light-accent dark:bg-dark-accent flex items-center justify-center text-white shadow-sm">
          <Link2 className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-light-text dark:text-dark-text tracking-tight">
            LinkLite
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-light-accent dark:text-dark-accent border border-blue-100 dark:border-blue-900/50">
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
