import { apiClient } from '@/lib/apiClient';

export interface FolderResponse {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
  isStarred: boolean;
}

export const foldersApi = {
  getByParent: (parentFolderId: string | null) =>
    apiClient.get<FolderResponse[]>(`/api/folders${parentFolderId ? `?parentFolderId=${parentFolderId}` : ''}`),
  getTrash: () => apiClient.get<FolderResponse[]>('/api/folders/trash'),
  getStarred: () => apiClient.get<FolderResponse[]>('/api/folders/starred'),
  create: (name: string, parentFolderId: string | null) =>
    apiClient.post<FolderResponse>('/api/folders', { name, parentFolderId }),
  rename: (id: string, name: string) =>
    apiClient.put<FolderResponse>(`/api/folders/${id}/rename`, { name }),
  move: (id: string, newParentFolderId: string | null) =>
    apiClient.put<FolderResponse>(`/api/folders/${id}/move`, { newParentFolderId }),
  delete: (id: string) => apiClient.delete<void>(`/api/folders/${id}`),
  restore: (id: string) => apiClient.put<FolderResponse>(`/api/folders/${id}/restore`, {}),
  deletePermanent: (id: string) => apiClient.delete<void>(`/api/folders/${id}/permanent`),
  star: (id: string) => apiClient.put<FolderResponse>(`/api/folders/${id}/star`, {}),
  unstar: (id: string) => apiClient.put<FolderResponse>(`/api/folders/${id}/unstar`, {}),
};