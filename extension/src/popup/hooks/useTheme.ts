import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    async function loadTheme() {
      const settings = await StorageService.getSettings();
      const initialTheme = settings.theme || 'dark';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    }
    loadTheme();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await StorageService.saveSettings({ theme: newTheme });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
