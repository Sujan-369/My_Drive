import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { searchApi } from './searchApi';

export function useSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);
  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });
}