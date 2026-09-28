import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Share2, Star, Trash2, Download } from 'lucide-react';

interface RowActionsProps {
  isStarred: boolean;
  onShare: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}

export function RowActions({ isStarred, onShare, onToggleStar, onDelete, onDownload }: RowActionsProps) {
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
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="size-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleStar}>
          <Star className={`size-4 ${isStarred ? 'fill-primary text-primary' : ''}`} />
          {isStarred ? 'Unstar' : 'Star'}
        </DropdownMenuItem>
        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="size-4" />
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}