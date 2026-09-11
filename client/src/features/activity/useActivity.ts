import { useQuery } from '@tanstack/react-query';
import { activityApi } from './activityApi';

export function useRecentActivity(take = 20) {
  return useQuery({ queryKey: ['activity', 'recent', take], queryFn: () => activityApi.getRecent(take) });
}