import { ShortUrlRecord, AppSettings } from '../types';

const STORAGE_KEYS = {
  RECENT_LINKS: 'linklite_recent_links',
  SETTINGS: 'linklite_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: 'https://linklite-production-c01c.up.railway.app',
  theme: 'dark',
  autoCopyOnShorten: true,
};

function isChromeStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

export class StorageService {
  /**
   * Retrieves recent links list
   */
  public static async getRecentLinks(): Promise<ShortUrlRecord[]> {
    try {
      if (isChromeStorageAvailable()) {
        const result = await chrome.storage.local.get(STORAGE_KEYS.RECENT_LINKS);
        return result[STORAGE_KEYS.RECENT_LINKS] || [];
      } else {
        const item = localStorage.getItem(STORAGE_KEYS.RECENT_LINKS);
        return item ? JSON.parse(item) : [];
      }
    } catch (e) {
      console.error('Storage get error:', e);
      return [];
    }
  }

  /**
   * Adds or updates a recent link in storage
   */
  public static async saveRecentLink(link: ShortUrlRecord): Promise<void> {
    try {
      const current = await this.getRecentLinks();
      // Remove duplicate if exists
      const filtered = current.filter((item) => item.id !== link.id && item.shortCode !== link.shortCode);
      const updated = [link, ...filtered].slice(0, 100); // Keep last 100 items

      if (isChromeStorageAvailable()) {
        await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_LINKS]: updated });
      } else {
        localStorage.setItem(STORAGE_KEYS.RECENT_LINKS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  /**
   * Deletes a recent link from local storage
   */
  public static async removeRecentLink(id: string): Promise<void> {
    try {
      const current = await this.getRecentLinks();
      const updated = current.filter((item) => item.id !== id);

      if (isChromeStorageAvailable()) {
        await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_LINKS]: updated });
      } else {
        localStorage.setItem(STORAGE_KEYS.RECENT_LINKS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  }

  /**
   * Retrieves application settings
   */
  public static async getSettings(): Promise<AppSettings> {
    try {
      if (isChromeStorageAvailable()) {
        const result = await chrome.storage.sync?.get(STORAGE_KEYS.SETTINGS) || await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
      } else {
        const item = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS;
      }
    } catch (e) {
      console.error('Settings get error:', e);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Saves application settings
   */
  public static async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    try {
      if (isChromeStorageAvailable()) {
        if (chrome.storage.sync) {
          await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updated });
        } else {
          await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Settings save error:', e);
    }

    return updated;
  }
}
