import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharingApi, type SharePermission } from './sharingApi';

export function useSharedWithMe() {
  return useQuery({ queryKey: ['shares', 'shared-with-me'], queryFn: sharingApi.getSharedWithMe });
}

export function useCreateShare(resourceType: 'folders' | 'files') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, email, permission }: { resourceId: string; email: string; permission: SharePermission }) =>
      sharingApi.share(resourceType, resourceId, email, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      // Refresh listings so the "Shared" badge and the preview's share list update.
      queryClient.invalidateQueries({ queryKey: [resourceType] });
    },
  });
}