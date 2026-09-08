import { apiClient } from '@/lib/apiClient';

export interface FolderResponse {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  modifiedAt: string;
}

export const foldersApi = {
  getByParent: (parentFolderId: string | null) =>
    apiClient.get<FolderResponse[]>(`/api/folders${parentFolderId ? `?parentFolderId=${parentFolderId}` : ''}`),
  create: (name: string, parentFolderId: string | null) =>
    apiClient.post<FolderResponse>('/api/folders', { name, parentFolderId }),
  rename: (id: string, name: string) =>
    apiClient.put<FolderResponse>(`/api/folders/${id}/rename`, { name }),
  move: (id: string, newParentFolderId: string | null) =>
    apiClient.put<FolderResponse>(`/api/folders/${id}/move`, { newParentFolderId }),
};