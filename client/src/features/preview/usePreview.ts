import { useQuery } from '@tanstack/react-query';
import { previewApi } from './previewApi';

export function useFileDetail(fileId: string) {
  return useQuery({ queryKey: ['files', fileId, 'detail'], queryFn: () => previewApi.getDetail(fileId) });
}

export function useFileShares(fileId: string) {
  return useQuery({ queryKey: ['files', fileId, 'shares'], queryFn: () => previewApi.getShares(fileId) });
}