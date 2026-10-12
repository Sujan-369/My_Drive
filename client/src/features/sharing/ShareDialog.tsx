import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/apiClient';
import type { SharePermission, ShareResult } from './sharingApi';
import { useCreateShare } from './useSharing';
import { CheckCircle2, Eye, Pencil, UserPlus } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: 'folders' | 'files';
  resourceId: string;
  resourceName: string;
}

function describeResult(email: string, result: ShareResult): string {
  if (!result.changed) return `${email} already has ${result.permission} access, so nothing changed.`;
  if (result.previousPermission === null) return `Shared with ${email} as ${result.permission}.`;
  if (result.previousPermission !== result.permission) {
    return `${email} changed from ${result.previousPermission} to ${result.permission}.`;
  }
  return `Re-shared with ${email} as ${result.permission}.`;
}

function describeError(error: Error): string {
  if (error instanceof ApiError && error.status === 403) return 'Only the owner of this item can share it.';
  return error.message || "Couldn't share. Check the email address and try again.";
}

export function ShareDialog({ open, onOpenChange, resourceType, resourceId, resourceName }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('Viewer');
  const [feedback, setFeedback] = useState<string | null>(null);
  const createShare = useCreateShare(resourceType);

  const handleSubmit = () => {
    const recipient = email.trim();
    if (!recipient) return;
    setFeedback(null);
    createShare.mutate(
      { resourceId, email: recipient, permission },
      {
        onSuccess: (result) => {
          setFeedback(describeResult(recipient, result));
          setEmail('');
        },
      }
    );
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFeedback(null);
    if (createShare.isError) createShare.reset();
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
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Recipient's email"
            type="email"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            {(['Viewer', 'Editor'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPermission(value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  permission === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {value === 'Viewer' ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
                {value}
              </button>
            ))}
          </div>
          {feedback && (
            <p className="flex items-start gap-2 text-sm text-primary">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {feedback}
            </p>
          )}
          {createShare.isError && <p className="text-sm text-destructive">{describeError(createShare.error)}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {feedback ? 'Done' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={createShare.isPending}>
            {createShare.isPending ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}