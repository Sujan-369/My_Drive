import type { AuthResponse } from '../auth/authApi';
import { useRef, useState } from 'react';
import { useStorageUsage } from '../organization/useOrganization';
import { useFileStarred, useRecentFiles, useUploadFile } from '../files/useFiles';
import type { FileResponse } from '../files/filesApi';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Star, UploadCloud } from 'lucide-react';
import { ClearRecentButton } from '../activity/ClearRecentButton';

interface HomeScreenProps {
  auth: AuthResponse;
  onOpenPreview: (fileId: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function FileList({ files, onOpen }: { files: FileResponse[]; onOpen: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      {files.map((file, i) => (
        <button
          key={file.id}
          onClick={() => onOpen(file.id)}
          className={`flex min-h-14 w-full min-w-0 items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/3 ${
            i > 0 ? 'border-t border-border' : ''
          }`}
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">{file.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(file.modifiedAt)}</span>
        </button>
      ))}
    </div>
  );
}

export function HomeScreen({ auth, onOpenPreview }: HomeScreenProps) {
  const firstName = auth.displayName?.split(' ')[0] || 'there';
  const { data: usage } = useStorageUsage();
  const { data: recentFiles, isLoading: recentLoading } = useRecentFiles(5);
  const { data: starredFiles } = useFileStarred();
  const uploadFile = useUploadFile(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const used = usage?.totalBytes ?? 0;
  const limit = usage?.limitBytes ?? 0;
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const nearLimit = percent >= 90;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile.mutate(file);
  };

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's an overview of your workspace today.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-last min-w-0 space-y-8 lg:order-first">
          <section aria-labelledby="recent-heading">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="recent-heading" className="text-sm font-semibold text-foreground">Recent files</h2>
              <ClearRecentButton />
            </div>
            {recentLoading ? (
              <div className="space-y-px overflow-hidden rounded-xl border border-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-4">
                    <Skeleton className="size-4 shrink-0 rounded" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (recentFiles?.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <FileText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">No files yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload your first file to see it here.</p>
              </div>
            ) : (
              <FileList files={recentFiles ?? []} onOpen={onOpenPreview} />
            )}
          </section>

          {(starredFiles?.length ?? 0) > 0 && (
            <section aria-labelledby="starred-heading">
              <h2 id="starred-heading" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Star className="size-3.5 fill-primary text-primary" />
                Starred
              </h2>
              <FileList files={(starredFiles ?? []).slice(0, 5)} onOpen={onOpenPreview} />
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="text-xs text-muted-foreground">Includes Trash</span>
            </div>
            {usage ? (
              <>
                <div className="mb-3 text-2xl font-semibold tracking-tight">{formatBytes(used)}</div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percent)}
                  aria-label="Storage used"
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${nearLimit ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${used > 0 ? Math.max(percent, 2) : 0}%` }}
                  />
                </div>
                <p className={`mt-2 text-xs ${nearLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formatBytes(used)} of {formatBytes(limit)} used
                </p>
              </>
            ) : (
              <>
                <Skeleton className="mb-3 h-8 w-24" />
                <Skeleton className="h-1.5 w-full" />
              </>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={openPicker}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
            role="button"
            tabIndex={0}
            className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-white/2'
            }`}
          >
            <UploadCloud className="mb-2 size-6 text-primary" />
            <div className="text-sm font-medium">
              {uploadFile.isPending ? (
                'Uploading...'
              ) : uploadFile.isError ? (
                <span className="text-destructive">{uploadFile.error.message}</span>
              ) : (
                <>
                  <span className="hidden md:inline">Drag and drop a file, or click to browse</span>
                  <span className="md:hidden">Tap to upload a file</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile.mutate(f); e.target.value = ''; }}
              className="hidden"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}