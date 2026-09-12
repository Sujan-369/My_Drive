import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateShare } from './useSharing';

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
          <DialogTitle>Share "{resourceName}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Recipient's email"
            type="email"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={permission === 'Viewer' ? 'default' : 'outline'}
              onClick={() => setPermission('Viewer')}
            >
              Viewer
            </Button>
            <Button
              type="button"
              variant={permission === 'Editor' ? 'default' : 'outline'}
              onClick={() => setPermission('Editor')}
            >
              Editor
            </Button>
          </div>
          {createShare.isError && (
            <p className="text-sm text-destructive">Couldn't share — check the email address and try again.</p>
          )}
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