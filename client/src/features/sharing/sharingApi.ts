import { apiClient } from '@/lib/apiClient';

export interface SharedWithMeResponse {
  shareId: string;
  resourceId: string;
  resourceType: 'Folder' | 'File';
  resourceName: string;
  sharedByName: string;
  sharedByEmail: string;
  permission: 'Viewer' | 'Editor';
  sharedAt: string;
}

export const sharingApi = {
  share: (resourceType: 'folders' | 'files', resourceId: string, recipientEmail: string, permission: string) =>
    apiClient.post(`/api/${resourceType}/${resourceId}/share`, { recipientEmail, permission }),
  getSharedWithMe: () => apiClient.get<SharedWithMeResponse[]>('/api/shares/shared-with-me'),
};