import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi } from './activityApi';
import { authApi } from '../auth/authApi';

export function useRecentActivity(take = 20) {
  return useQuery({ queryKey: ['activity', 'recent', take], queryFn: () => activityApi.getRecent(take) });
}

export function useClearRecentHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.clearRecentHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'recent'] });
    },
  });
}