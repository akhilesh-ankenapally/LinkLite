import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { StorageService } from '../services/storage';
import { ShortUrlRecord } from '../types';

export function useRecentLinks(searchTerm = '') {
  const queryClient = useQueryClient();

  const query = useQuery<ShortUrlRecord[]>({
    queryKey: ['recent-links', searchTerm],
    queryFn: async () => {
      // First fetch from local storage for instant hydration
      const localLinks = await StorageService.getRecentLinks();

      try {
        // Attempt sync with server
        const serverData = await api.getUrls(searchTerm, 50);
        if (serverData && Array.isArray(serverData.urls)) {
          // Merge local links with server data (server has updated click counts)
          const mergedMap = new Map<string, ShortUrlRecord>();

          // Add server items first
          serverData.urls.forEach((item) => mergedMap.set(item.id, item));

          // Add any local items not yet in server or matching
          localLinks.forEach((item) => {
            if (!mergedMap.has(item.id)) {
              mergedMap.set(item.id, item);
            }
          });

          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          return mergedList;
        }
      } catch (err) {
        console.warn('Backend unavailable, showing local history:', err);
      }

      // Filter local links if search term exists
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        return localLinks.filter(
          (l) => l.originalUrl.toLowerCase().includes(lower) || l.shortCode.toLowerCase().includes(lower)
        );
      }

      return localLinks;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await StorageService.removeRecentLink(id);
      try {
        await api.deleteUrl(id);
      } catch (e) {
        console.warn('Server delete failed or offline:', e);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-links'] });
    },
  });

  return {
    links: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    deleteLink: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
