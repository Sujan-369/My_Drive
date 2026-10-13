import { apiClient } from '@/lib/apiClient';

export interface StorageUsageResponse {
  totalBytes: number;
  limitBytes: number;
}

export const organizationApi = {
  getStorageUsage: () => apiClient.get<StorageUsageResponse>('/api/organizations/storage-usage'),
};