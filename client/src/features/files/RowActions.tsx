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

export function RowActions({ onShare, onRename, onMove, onDelete, onDownload }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}><Pencil className="size-4" />Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onMove}><FolderInput className="size-4" />Move</DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}><Share2 className="size-4" />Share</DropdownMenuItem>
        {onDownload && <DropdownMenuItem onClick={onDownload}><Download className="size-4" />Download</DropdownMenuItem>}
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="size-4" />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}