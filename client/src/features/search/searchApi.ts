import { apiClient } from '@/lib/apiClient';

export interface SearchResultResponse {
  id: string;
  name: string;
  type: 'Folder' | 'File';
  parentId: string | null;
  modifiedAt: string;
  size: number | null;
}

export const searchApi = {
  search: (query: string) => apiClient.get<SearchResultResponse[]>(`/api/search?q=${encodeURIComponent(query)}`),
};