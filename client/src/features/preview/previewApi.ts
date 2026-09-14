import { apiClient } from '@/lib/apiClient';

export interface FileVersionResponse {
  id: string;
  size: number;
  createdAt: string;
}

export interface FileDetailResponse {
  id: string;
  name: string;
  folderId: string | null;
  size: number;
  createdAt: string;
  modifiedAt: string;
  isStarred: boolean;
  versions: FileVersionResponse[];
}

export interface ShareInfoResponse {
  shareId: string;
  userId: string;
  displayName: string;
  email: string;
  pictureUrl: string | null;
  permission: 'Viewer' | 'Editor';
  sharedAt: string;
}

export const previewApi = {
  getDetail: (fileId: string) => apiClient.get<FileDetailResponse>(`/api/files/${fileId}/detail`),
  getShares: (fileId: string) => apiClient.get<ShareInfoResponse[]>(`/api/files/${fileId}/shares`),
};