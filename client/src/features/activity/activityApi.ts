import { apiClient } from '@/lib/apiClient';

export interface ActivityLogResponse {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  createdAt: string;
}

export const activityApi = {
  getRecent: (take = 20) => apiClient.get<ActivityLogResponse[]>(`/api/activity/recent?take=${take}`),
};