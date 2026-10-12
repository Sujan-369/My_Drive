import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFolders } from './useFolders';
import { Folder, ChevronRight } from 'lucide-react';

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  /** Where the item lives now; "Move here" is disabled when the picker is on this folder. */
  currentFolderId: string | null;
  /** When moving a folder, its id: hidden from the picker so it (and its subtree) can't be chosen. */
  excludeFolderId?: string;
  onMove: (targetFolderId: string | null) => void;
  isPending: boolean;
  error?: string | null;
}

export function MoveDialog({ open, onOpenChange, itemName, currentFolderId, excludeFolderId, onMove, isPending, error }: MoveDialogProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Drive' }]);
  const pickerFolderId = breadcrumbs[breadcrumbs.length - 1].id;
  const { data: folders } = useFolders(pickerFolderId);

  const visibleFolders = (folders ?? []).filter((f) => f.id !== excludeFolderId);
  const isCurrentLocation = pickerFolderId === currentFolderId;

  const navigateInto = (id: string, name: string) => setBreadcrumbs((prev) => [...prev, { id, name }]);
  const navigateToBreadcrumb = (index: number) => setBreadcrumbs((prev) => prev.slice(0, index + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Move "{itemName}"</DialogTitle></DialogHeader>
        <nav className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5" />}
              <button onClick={() => navigateToBreadcrumb(index)} className="rounded px-1.5 py-0.5 hover:bg-white/5 hover:text-foreground">{crumb.name}</button>
            </span>
          ))}
        </nav>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          {visibleFolders.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No subfolders here.</p>}
          {visibleFolders.map((folder) => (
            <button key={folder.id} onClick={() => navigateInto(folder.id, folder.name)} className="flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-white/3">
              <Folder className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
        {isCurrentLocation && <p className="text-xs text-muted-foreground">It's already in this folder.</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onMove(pickerFolderId)} disabled={isPending || isCurrentLocation}>{isPending ? 'Moving...' : 'Move here'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}