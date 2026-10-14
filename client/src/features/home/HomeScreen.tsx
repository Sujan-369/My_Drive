import type { AuthResponse } from '../auth/authApi';
import { useRef } from 'react';
import { useRecentFiles, useUploadFiles } from '../files/useFiles';
import type { FileResponse } from '../files/filesApi';
import { useUploadPolicy } from '../organization/useOrganization';
import { DropOverlay } from '../files/DropOverlay';
import { UploadErrors } from '../files/UploadErrors';
import { useFileDrop } from '../files/useFileDrop';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes } from '@/lib/formatBytes';
import { FileText, UploadCloud } from 'lucide-react';
import { ClearRecentButton } from '../activity/ClearRecentButton';

interface HomeScreenProps {
  auth: AuthResponse;
  onOpenPreview: (fileId: string) => void;
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
  const { data: recentFiles, isLoading: recentLoading } = useRecentFiles(5);
  const { data: policy } = useUploadPolicy();
  const uploader = useUploadFiles(null);
  const drop = useFileDrop((files) => void uploader.uploadAll(files));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limitHint = policy ? `Up to ${formatBytes(policy.maxFileBytes)} per file` : undefined;
  const openPicker = () => fileInputRef.current?.click();

  return (
    <div {...drop.props} className="relative min-h-full">
      {drop.isDragging && <DropOverlay hint={limitHint} />}

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off.</p>
        </div>

        <div
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          className={`flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-white/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-80 ${
            uploader.isPending ? 'pointer-events-none opacity-70' : 'cursor-pointer'
          }`}
        >
          <UploadCloud className="size-6 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {uploader.isPending ? (
                'Uploading...'
              ) : (
                <>
                  <span className="hidden md:inline">Drag and drop files, or click to browse</span>
                  <span className="md:hidden">Tap to upload files</span>
                </>
              )}
            </div>
            {limitHint && <div className="text-xs text-muted-foreground">{limitHint}</div>}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            if (selected.length > 0) void uploader.uploadAll(selected);
            e.target.value = '';
          }}
          className="hidden"
        />
      </header>

      <UploadErrors errors={uploader.errors} onDismiss={uploader.clearErrors} />

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
    </div>
  );
}