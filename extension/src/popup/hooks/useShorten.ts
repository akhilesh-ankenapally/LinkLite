import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../services/api';
import { StorageService } from '../services/storage';
import { ShortUrlRecord } from '../types';

export function useShorten(onSuccessCallback?: (result: ShortUrlRecord) => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ShortUrlRecord,
    ApiError,
    { url: string; customAlias?: string }
  >({
    mutationFn: async ({ url, customAlias }) => {
      const response = await api.shortenUrl(url, customAlias);
      const record: ShortUrlRecord = {
        id: response.id,
        shortCode: response.shortCode,
        shortUrl: response.shortUrl,
        originalUrl: response.originalUrl,
        clickCount: response.clickCount,
        createdAt: response.createdAt,
      };

      // Persist to local storage history
      await StorageService.saveRecentLink(record);

      return record;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recent-links'] });
      queryClient.invalidateQueries({ queryKey: ['global-stats'] });
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
  });
}
