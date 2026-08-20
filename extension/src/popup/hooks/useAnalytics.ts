import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { UrlAnalytics } from '../types';

export function useUrlAnalytics(urlId: string | null) {
  return useQuery<UrlAnalytics | null>({
    queryKey: ['url-analytics', urlId],
    queryFn: async () => {
      if (!urlId) return null;
      return api.getUrlAnalytics(urlId);
    },
    enabled: Boolean(urlId),
    staleTime: 1000 * 15, // 15s cache
  });
}
