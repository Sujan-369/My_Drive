import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from './foldersApi';

export function useFolders(parentFolderId: string | null) {
  return useQuery({
    queryKey: ['folders', parentFolderId],
    queryFn: () => foldersApi.getByParent(parentFolderId),
  });
}

export function useCreateFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => foldersApi.create(name, parentFolderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] }),
  });
}