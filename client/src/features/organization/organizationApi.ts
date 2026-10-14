import { apiClient } from '@/lib/apiClient';

export interface StorageUsageResponse {
  totalBytes: number;
  limitBytes: number;
}

export interface UploadPolicyResponse {
  maxFileBytes: number;
  blockedExtensions: string[];
}

export const organizationApi = {
  getStorageUsage: () => apiClient.get<StorageUsageResponse>('/api/organizations/storage-usage'),
  getUploadPolicy: () => apiClient.get<UploadPolicyResponse>('/api/organizations/upload-policy'),
};