export interface ShortenUrlRequest {
  url: string;
  customAlias?: string;
}

export interface ShortenUrlResponse {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface UrlSummary {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UrlListResponse {
  urls: UrlSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface CountryMetric {
  country: string;
  count: number;
}

export interface ReferrerMetric {
  referrer: string;
  count: number;
}

export interface UrlAnalyticsResponse {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  lastClickAt: string | null;
  countries: CountryMetric[];
  referrers: ReferrerMetric[];
  recentClicks: {
    id: string;
    country: string | null;
    referrer: string | null;
    clickedAt: string;
  }[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
