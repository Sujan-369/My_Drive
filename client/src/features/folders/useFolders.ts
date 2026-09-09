import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from './foldersApi';

export function useFolders(parentFolderId: string | null) {
  return useQuery({
    queryKey: ['folders', parentFolderId],
    queryFn: () => foldersApi.getByParent(parentFolderId),
  });
}

export function useFolderTrash() {
  return useQuery({ queryKey: ['folders', 'trash'], queryFn: foldersApi.getTrash });
}

export function useFolderStarred() {
  return useQuery({ queryKey: ['folders', 'starred'], queryFn: foldersApi.getStarred });
}

export function useCreateFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => foldersApi.create(name, parentFolderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] }),
  });
}

export function useDeleteFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['folders', 'trash'] });
    },
  });
}

export function useRestoreFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function usePermanentDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.deletePermanent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders', 'trash'] }),
  });
}

export function useToggleStarFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      starred ? foldersApi.unstar(id) : foldersApi.star(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['folders', 'starred'] });
    },
  });
}