import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from './filesApi';

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

export function useToggleStarFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      starred ? filesApi.unstar(id) : filesApi.star(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      queryClient.invalidateQueries({ queryKey: ['files', 'starred'] });
    },
  });
}

export function useRecentFiles(take = 10) {
  return useQuery({ queryKey: ['files', 'recent', take], queryFn: () => filesApi.getRecent(take) });
}