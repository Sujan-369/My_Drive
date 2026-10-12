import { apiClient } from '@/lib/apiClient';

export type SharePermission = 'Viewer' | 'Editor';

export interface SharedWithMeResponse {
  shareId: string;
  resourceId: string;
  resourceType: 'Folder' | 'File';
  resourceName: string;
  sharedByName: string;
  sharedByEmail: string;
  sharedByPictureUrl: string | null;
  permission: SharePermission;
  sharedAt: string;
}

export interface ShareResult {
  id: string;
  resourceId: string;
  resourceType: 'Folder' | 'File';
  recipientEmail: string;
  permission: SharePermission;
  createdAt: string;
  changed: boolean;
  previousPermission: SharePermission | null;
}

export const sharingApi = {
  share: (resourceType: 'folders' | 'files', resourceId: string, recipientEmail: string, permission: SharePermission) =>
    apiClient.post<ShareResult>(`/api/${resourceType}/${resourceId}/share`, { recipientEmail, permission }),
  getSharedWithMe: () => apiClient.get<SharedWithMeResponse[]>('/api/shares/shared-with-me'),
};