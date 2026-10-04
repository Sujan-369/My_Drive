import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from './filesApi';
import type { FileResponse } from './filesApi';

export function useFiles(folderId: string | null) {
  return useQuery({
    queryKey: ['files', folderId],
    queryFn: () => filesApi.getByFolder(folderId),
  });
}

export function useFileTrash() {
  return useQuery({ queryKey: ['files', 'trash'], queryFn: filesApi.getTrash });
}

export function useFileStarred() {
  return useQuery({ queryKey: ['files', 'starred'], queryFn: filesApi.getStarred });
}

export function useUploadFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file, folderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', folderId] }),
  });
}

export function useDeleteFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      queryClient.invalidateQueries({ queryKey: ['files', 'trash'] });
    },
  });
}

export function useRenameFile(fileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => filesApi.rename(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', fileId] }),
  });
}

export function useMoveFile(fileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newFolderId }: { id: string; newFolderId: string | null }) => filesApi.move(id, newFolderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function useRestoreFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function usePermanentDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.deletePermanent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', 'trash'] }),
  });
}

export function useToggleStarFile(parentFileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) => (starred ? filesApi.unstar(id) : filesApi.star(id)),
    onMutate: async ({ id, starred }) => {
      await queryClient.cancelQueries({ queryKey: ['files', parentFileId] });
      const previous = queryClient.getQueryData<FileResponse[]>(['files', parentFileId]);
      queryClient.setQueryData<FileResponse[]>(['files', parentFileId], (old) =>
        old?.map((f) => (f.id === id ? { ...f, isStarred: !starred } : f))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['files', parentFileId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files', parentFileId] });
      queryClient.invalidateQueries({ queryKey: ['files', 'starred'] });
    },
  });
}

export function useRecentFiles(take = 10) {
  return useQuery({ queryKey: ['files', 'recent', take], queryFn: () => filesApi.getRecent(take) });
}