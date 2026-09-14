import { useFileDetail, useFileShares } from './usePreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Star, FileText } from 'lucide-react';
import { downloadFile } from '@/lib/downloadFile';
import { PdfPreview } from './PdfPreview';

interface PreviewScreenProps {
  fileId: string;
  onBack: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export function PreviewScreen({ fileId, onBack }: PreviewScreenProps) {
  const { data: file, isLoading } = useFileDetail(fileId);
  const { data: shares } = useFileShares(fileId);

  if (isLoading || !file) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <span className="font-medium">{file.name}</span>
          {file.isStarred && <Star className="size-4 fill-primary text-primary" />}
        </div>
        <Button variant="outline" onClick={() => downloadFile(file.id, file.name)}>
          <Download className="size-4" />
          Download
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex items-center justify-center rounded-lg border bg-muted/30 p-6">
        {file.name.toLowerCase().endsWith('.pdf') ? (
            <PdfPreview fileId={file.id} />
        ) : (
            <div className="py-24 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 size-10" />
            <p className="text-sm">Preview not available for this file type</p>
            </div>
        )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Properties</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd>{formatSize(file.size)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd>{formatDate(file.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Modified</dt>
                <dd>{formatDate(file.modifiedAt)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared with</h3>
            {(shares?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">Not shared with anyone yet.</p>}
            <div className="space-y-2">
              {shares?.map((share) => (
                <div key={share.shareId} className="flex items-center gap-2">
                  {share.pictureUrl ? (
                    <img src={share.pictureUrl} alt={share.displayName} className="size-7 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {share.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{share.displayName}</span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{share.permission}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Version History</h3>
            <div className="space-y-2">
              {file.versions.map((version, index) => (
                  <div key={version.id} className="text-sm">
                    <span className="font-medium">v{file.versions.length - index}</span>
                    <div className="text-xs text-muted-foreground">{formatDate(version.createdAt)} · {formatSize(version.size)}</div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}