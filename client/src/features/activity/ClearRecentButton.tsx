import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClearRecentHistory } from './useActivity';
import { Trash2 } from 'lucide-react';

export function ClearRecentButton() {
  const [open, setOpen] = useState(false);
  const clearRecent = useClearRecentHistory();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Clear recent history"
        aria-label="Clear recent history"
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="size-4 text-destructive" />
              Clear recent history?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This clears both your Recent Files and Recent Activity lists. Your actual files, sharing, stars, and Trash are never affected — this only changes what shows up here.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => clearRecent.mutate(undefined, { onSuccess: () => setOpen(false) })}
              disabled={clearRecent.isPending}
            >
              {clearRecent.isPending ? 'Clearing...' : 'Clear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}