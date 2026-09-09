import { useState } from 'react';
import { useFolderTrash, useRestoreFolder, usePermanentDeleteFolder } from '../folders/useFolders';
import { useFileTrash, useRestoreFile, usePermanentDeleteFile } from '../files/useFiles';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Folder, FileText, RotateCcw, Trash2, TriangleAlert } from 'lucide-react';

interface PendingDelete {
  id: string;
  name: string;
  type: 'folder' | 'file';
}

export function TrashScreen() {
  const { data: folders } = useFolderTrash();
  const { data: files } = useFileTrash();
  const restoreFolder = useRestoreFolder();
  const restoreFile = useRestoreFile();
  const permanentDeleteFolder = usePermanentDeleteFolder();
  const permanentDeleteFile = usePermanentDeleteFile();
  const [pending, setPending] = useState<PendingDelete | null>(null);

  const hasContent = (folders?.length ?? 0) > 0 || (files?.length ?? 0) > 0;

  const confirmDelete = () => {
    if (!pending) return;
    if (pending.type === 'folder') {
      permanentDeleteFolder.mutate(pending.id);
    } else {
      permanentDeleteFile.mutate(pending.id);
    }
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">Items in Trash are automatically deleted forever after 30 days.</span>
      </div>

      {!hasContent && (
        <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">Trash is empty.</p>
      )}

      {hasContent && (
        <div className="rounded-lg border divide-y">
          {folders?.map((folder) => (
            <div key={folder.id} className="flex items-center gap-3 px-4 py-3">
              <Folder className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{folder.name}</span>
              <Button variant="ghost" size="icon" onClick={() => restoreFolder.mutate(folder.id)} title="Restore">
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPending({ id: folder.id, name: folder.name, type: 'folder' })}
                title="Delete forever"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          {files?.map((file) => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-3">
              <FileText className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{file.name}</span>
              <Button variant="ghost" size="icon" onClick={() => restoreFile.mutate(file.id)} title="Restore">
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPending({ id: file.id, name: file.name, type: 'file' })}
                title="Delete forever"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-destructive" />
              Delete item permanently?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Permanently delete <span className="font-medium text-foreground">{pending?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}