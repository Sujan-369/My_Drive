import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from './foldersApi';
import type { FolderResponse } from './foldersApi';

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

export function useRenameFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => foldersApi.rename(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] }),
  });
}

export function useMoveFolder(parentFolderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newParentFolderId }: { id: string; newParentFolderId: string | null }) => foldersApi.move(id, newParentFolderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] }),
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
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) => (starred ? foldersApi.unstar(id) : foldersApi.star(id)),
    onMutate: async ({ id, starred }) => {
      await queryClient.cancelQueries({ queryKey: ['folders', parentFolderId] });
      const previous = queryClient.getQueryData<FolderResponse[]>(['folders', parentFolderId]);
      queryClient.setQueryData<FolderResponse[]>(['folders', parentFolderId], (old) =>
        old?.map((f) => (f.id === id ? { ...f, isStarred: !starred } : f))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['folders', parentFolderId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['folders', 'starred'] });
    },
  });
}