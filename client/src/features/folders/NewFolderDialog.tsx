import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface NewFolderDialogProps {
  onCreate: (name: string, options: { onSuccess: () => void }) => void;
  isPending: boolean;
  error?: string | null;
}

export function NewFolderDialog({ onCreate, isPending, error }: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), { onSuccess: () => { setName(''); setOpen(false); } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Plus className="size-4" />
            New Folder
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 255))}
            placeholder="Untitled folder"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            maxLength={255}
            autoFocus
          />
          <div className="flex items-center justify-between text-xs">
            {error ? <span className="text-destructive">{error}</span> : <span />}
            <span className={name.length >= 255 ? 'font-medium text-destructive' : 'text-muted-foreground'}>{name.length}/255</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>{isPending ? 'Creating...' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}