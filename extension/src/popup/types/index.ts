export interface ShortUrlRecord {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ShortenResponse {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface CountryMetric {
  country: string;
  count: number;
}

export interface ReferrerMetric {
  referrer: string;
  count: number;
}

export interface ClickLogItem {
  id: string;
  country: string | null;
  referrer: string | null;
  clickedAt: string;
}

export interface UrlAnalytics {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  lastClickAt: string | null;
  countries: CountryMetric[];
  referrers: ReferrerMetric[];
  recentClicks: ClickLogItem[];
}

export type ActiveTab = 'shorten' | 'recent' | 'analytics';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  apiUrl: string;
  theme: ThemeMode;
  autoCopyOnShorten: boolean;
}
