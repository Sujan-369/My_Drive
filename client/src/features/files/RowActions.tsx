import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Share2, Pencil, FolderInput, Trash2, Download } from 'lucide-react';

interface RowActionsProps {
  onShare: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}

// Menu items are taller on touch screens so they're easy to hit.
const item = 'py-2.5 sm:py-1.5';

export function RowActions({ onShare, onRename, onMove, onDelete, onDownload }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-11 sm:size-9" aria-label="More actions" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem className={item} onClick={onRename}><Pencil className="size-4" />Rename</DropdownMenuItem>
        <DropdownMenuItem className={item} onClick={onMove}><FolderInput className="size-4" />Move</DropdownMenuItem>
        <DropdownMenuItem className={item} onClick={onShare}><Share2 className="size-4" />Share</DropdownMenuItem>
        {onDownload && <DropdownMenuItem className={item} onClick={onDownload}><Download className="size-4" />Download</DropdownMenuItem>}
        <DropdownMenuItem onClick={onDelete} className={`${item} text-destructive focus:text-destructive`}><Trash2 className="size-4" />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}