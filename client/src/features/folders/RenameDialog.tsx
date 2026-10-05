import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  resourceType: 'folders' | 'files';
  onRename: (newName: string) => void;
  isPending: boolean;
  error?: string | null;
}

function splitName(fullName: string): { base: string; ext: string } {
  const lastDot = fullName.lastIndexOf('.');
  if (lastDot <= 0) return { base: fullName, ext: '' };
  return { base: fullName.slice(0, lastDot), ext: fullName.slice(lastDot) };
}

export function RenameDialog({ open, onOpenChange, currentName, resourceType, onRename, isPending, error }: RenameDialogProps) {
  const isFile = resourceType === 'files';
  const { base: nameBase, ext } = splitName(currentName);
  const [value, setValue] = useState(isFile ? nameBase : currentName);
  const maxLength = isFile ? 255 - ext.length : 255; 

  useEffect(() => {
    if (open) {
      const { base } = splitName(currentName);
      setValue(isFile ? base : currentName);
    }
  }, [open, currentName, isFile]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onRename(isFile ? `${value.trim()}${ext}` : value.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Rename</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <div className="flex items-center">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={maxLength}
              autoFocus
              className={ext ? 'rounded-r-none' : ''}
            />
            {ext && (
              <span className="flex h-9 shrink-0 items-center rounded-r-md border border-l-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">
                {ext}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">{ext ? "File type can't be changed" : ''}</span>
            )}
            <span className={(value.length + ext.length) >= 255 ? 'font-medium text-destructive' : 'text-muted-foreground'}>{value.length + ext.length}/255</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>{isPending ? 'Renaming...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}