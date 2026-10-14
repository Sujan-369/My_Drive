import { UploadCloud } from 'lucide-react';

export function DropOverlay({ hint }: { hint?: string }) {
  return (
    <div className="pointer-events-none fixed inset-3 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <UploadCloud className="mx-auto mb-2 size-8 text-primary" />
        <p className="text-sm font-medium">Drop files to upload</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}