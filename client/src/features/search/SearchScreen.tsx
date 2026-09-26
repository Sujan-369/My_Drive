import { useMemo, useState } from 'react';
import { useSearch } from './useSearch';
import { getCategory, type SearchCategory } from './categorize';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, FileText, SearchX } from 'lucide-react';

interface SearchScreenProps {
  query: string;
  onOpenPreview: (fileId: string) => void;
}

const categories: SearchCategory[] = ['All', 'Documents', 'Folders', 'Images', 'Spreadsheets'];

function formatSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function highlightMatch(name: string, query: string) {
  const index = name.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return name;
  return (
    <>
      {name.slice(0, index)}
      <span className="font-semibold text-primary">{name.slice(index, index + query.length)}</span>
      {name.slice(index + query.length)}
    </>
  );
}

export function SearchScreen({ query, onOpenPreview }: SearchScreenProps) {
  const { data: results, isLoading } = useSearch(query);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('All');

  const filtered = useMemo(() => {
    if (!results) return [];
    if (activeCategory === 'All') return results;
    return results.filter((r) => getCategory(r.name, r.type) === activeCategory);
  }, [results, activeCategory]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
        {!isLoading && results && (
          <span className="ml-auto text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </span>
        )}
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-border px-4 py-16 text-center">
          <SearchX className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No results found.</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {filtered.map((result) => (
              <div key={result.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3">
                {result.type === 'Folder' ? (
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                {result.type === 'File' ? (
                  <button onClick={() => onOpenPreview(result.id)} className="flex-1 truncate text-left text-sm hover:underline">
                    {highlightMatch(result.name, query)}
                  </button>
                ) : (
                  <span className="flex-1 truncate text-sm">{highlightMatch(result.name, query)}</span>
                )}
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(result.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}