import { StorageService } from './storage';
import { ShortenResponse, ShortUrlRecord, UrlAnalytics } from '../types';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const settings = await StorageService.getSettings();
  const baseUrl = settings.apiUrl.replace(/\/+$/, '');
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorMsg, errorCode, response.status, data?.error?.details);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your backend connection.', 'TIMEOUT', 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Network / Offline errors
    if (!navigator.onLine) {
      throw new ApiError('No internet connection. Please check your network.', 'OFFLINE', 0);
    }

    throw new ApiError(
      error.message || 'Unable to connect to LinkLite server.',
      'NETWORK_ERROR',
      0
    );
  }
}

export const api = {
  async shortenUrl(originalUrl: string, customAlias?: string): Promise<ShortenResponse> {
    return request<ShortenResponse>('/api/shorten', {
      method: 'POST',
      body: JSON.stringify({
        url: originalUrl,
        customAlias: customAlias?.trim() || undefined,
      }),
    });
  },

  async getUrls(search?: string, limit = 50): Promise<{ urls: ShortUrlRecord[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());

    return request<{ urls: ShortUrlRecord[]; total: number }>(`/api/urls?${params.toString()}`);
  },

  async getUrlAnalytics(id: string): Promise<UrlAnalytics> {
    return request<UrlAnalytics>(`/api/urls/${id}/analytics`);
  },

  async deleteUrl(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/api/urls/${id}`, {
      method: 'DELETE',
    });
  },

  async checkHealth(): Promise<{ status: string; database: string }> {
    return request<{ status: string; database: string }>('/api/health');
  },
};
