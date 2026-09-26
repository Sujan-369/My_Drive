import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateShare } from './useSharing';
import { Eye, Pencil, UserPlus } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: 'folders' | 'files';
  resourceId: string;
  resourceName: string;
}

export function ShareDialog({ open, onOpenChange, resourceType, resourceId, resourceName }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'Viewer' | 'Editor'>('Viewer');
  const createShare = useCreateShare(resourceType);

  const handleSubmit = () => {
    if (!email.trim()) return;
    createShare.mutate(
      { resourceId, email: email.trim(), permission },
      { onSuccess: () => { setEmail(''); onOpenChange(false); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            Share "{resourceName}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Recipient's email"
            type="email"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setPermission('Viewer')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                permission === 'Viewer' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Eye className="size-3.5" />
              Viewer
            </button>
            <button
              type="button"
              onClick={() => setPermission('Editor')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                permission === 'Editor' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Pencil className="size-3.5" />
              Editor
            </button>
          </div>
          {createShare.isError && <p className="text-sm text-destructive">Couldn't share — check the email address and try again.</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createShare.isPending}>
            {createShare.isPending ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}