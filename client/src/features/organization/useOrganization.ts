import { queryOptions, useQuery } from '@tanstack/react-query';
import { organizationApi } from './organizationApi';

export function useStorageUsage() {
  return useQuery({ queryKey: ['organization', 'storage-usage'], queryFn: organizationApi.getStorageUsage });
}

// Deliberately outside the ['organization'] key so storage refreshes don't refetch it.
export const uploadPolicyOptions = queryOptions({
  queryKey: ['upload-policy'],
  queryFn: organizationApi.getUploadPolicy,
  staleTime: Infinity,
});

export function useUploadPolicy() {
  return useQuery(uploadPolicyOptions);
}