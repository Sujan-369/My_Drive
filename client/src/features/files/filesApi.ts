import { apiClient } from '@/lib/apiClient';

export interface FileResponse {
  id: string;
  name: string;
  folderId: string | null;
  size: number;
  contentHash: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
  isStarred: boolean;
}

export const filesApi = {
  getByFolder: (folderId: string | null) =>
    apiClient.get<FileResponse[]>(`/api/files${folderId ? `?folderId=${folderId}` : ''}`),
  
  getTrash: () => apiClient.get<FileResponse[]>('/api/files/trash'),
  
  getStarred: () => apiClient.get<FileResponse[]>('/api/files/starred'),
  
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
  
  delete: (id: string) => apiClient.delete<void>(`/api/files/${id}`),
  
  restore: (id: string) => apiClient.put<FileResponse>(`/api/files/${id}/restore`, {}),
  
  deletePermanent: (id: string) => apiClient.delete<void>(`/api/files/${id}/permanent`),
  
  star: (id: string) => apiClient.put<FileResponse>(`/api/files/${id}/star`, {}),
  
  unstar: (id: string) => apiClient.put<FileResponse>(`/api/files/${id}/unstar`, {}),
  
  getRecent: (take = 10) => apiClient.get<FileResponse[]>(`/api/files/recent?take=${take}`),
};