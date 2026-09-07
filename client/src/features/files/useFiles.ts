import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from './filesApi';

export function useFiles(folderId: string | null) {
  return useQuery({
    queryKey: ['files', folderId],
    queryFn: () => filesApi.getByFolder(folderId),
  });
}

export function useUploadFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file, folderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', folderId] }),
  });
}