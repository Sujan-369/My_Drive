import { apiClient } from '@/lib/apiClient';

export interface FileResponse {
  id: string;
  name: string;
  folderId: string | null;
  size: number;
  contentHash: string;
  createdAt: string;
  modifiedAt: string;
}

export const filesApi = {
  getByFolder: (folderId: string | null) =>
    apiClient.get<FileResponse[]>(`/api/files${folderId ? `?folderId=${folderId}` : ''}`),
  upload: (file: File, folderId: string | null) => {
    const formData = new FormData();
    formData.append('File', file);
    if (folderId) formData.append('FolderId', folderId);
    return apiClient.post<FileResponse>('/api/files', formData);
  },
  rename: (id: string, name: string) =>
    apiClient.put<FileResponse>(`/api/files/${id}/rename`, { name }),
  move: (id: string, newFolderId: string | null) =>
    apiClient.put<FileResponse>(`/api/files/${id}/move`, { newFolderId }),
};