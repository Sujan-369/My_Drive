import { useQuery } from '@tanstack/react-query';
import { organizationApi } from './organizationApi';

export function useStorageUsage() {
  return useQuery({ queryKey: ['organization', 'storage-usage'], queryFn: organizationApi.getStorageUsage });
}