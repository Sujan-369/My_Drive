import { apiClient } from '@/lib/apiClient';

export interface StorageUsageResponse {
  totalBytes: number;
}

export const organizationApi = {
  getStorageUsage: () => apiClient.get<StorageUsageResponse>('/api/organizations/storage-usage'),
};