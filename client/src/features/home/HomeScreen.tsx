import { useState } from 'react';
import { useStorageUsage } from '../organization/useOrganization';
import { useRecentFiles, useUploadFile } from '../files/useFiles';
import { useRecentActivity } from '../activity/useActivity';
import { FileText, UploadCloud } from 'lucide-react';

interface HomeScreenProps {
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

const actionLabels: Record<string, string> = {
  Created: 'created', Uploaded: 'uploaded', Renamed: 'renamed', Moved: 'moved',
  Deleted: 'deleted', Restored: 'restored', Shared: 'shared',
};

export function HomeScreen({ onOpenPreview }: HomeScreenProps) {
  const { data: usage } = useStorageUsage();
  const { data: recentFiles } = useRecentFiles(5);
  const { data: activity } = useRecentActivity(8);
  const uploadFile = useUploadFile(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile.mutate(file);
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">Here's an overview of your workspace today.</p>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-1 text-sm text-muted-foreground">Storage used</div>
          <div className="text-2xl font-semibold">{usage ? formatBytes(usage.totalBytes) : '—'}</div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <UploadCloud className="mb-1 size-5 text-primary" />
          <div className="text-sm font-medium">
            {uploadFile.isPending ? 'Uploading...' : 'Drag and drop files to upload'}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Recent Files</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          {(recentFiles?.length ?? 0) === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No files yet.</p>
          )}
          {recentFiles?.map((file, i) => (
            <button
              key={file.id}
              onClick={() => onOpenPreview(file.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
                i > 0 ? 'border-t border-border' : ''
              }`}
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(file.modifiedAt)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          {(activity?.length ?? 0) === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
          )}
          {activity?.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="text-muted-foreground">You {actionLabels[entry.action] ?? entry.action.toLowerCase()}</span>
              <span className="truncate font-medium">{entry.resourceName}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}