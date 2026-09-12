import { useSharedWithMe } from './useSharing';
import { Folder, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/downloadFile';

export function SharedWithMeScreen() {
  const { data: shares, isLoading } = useSharedWithMe();

  const handleDownload = (fileId: string, fileName: string) => {
    downloadFile(fileId, fileName);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isLoading && (shares?.length ?? 0) === 0 && (
        <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing has been shared with you yet.
        </p>
      )}
      {!isLoading && shares && shares.length > 0 && (
        <div className="rounded-lg border divide-y">
          {shares.map((share) => (
            <div key={share.shareId} className="flex items-center gap-3 px-4 py-3">
              {share.resourceType === 'Folder' ? (
                <Folder className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 truncate text-sm">{share.resourceName}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                Shared by {share.sharedByName}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  share.permission === 'Editor' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {share.permission}
              </span>
              {share.resourceType === 'File' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(share.resourceId, share.resourceName)}
                  title="Download"
                >
                  <Download className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}