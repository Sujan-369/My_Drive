import { TriangleAlert, X } from 'lucide-react';

interface UploadErrorsProps {
  errors: string[];
  onDismiss: () => void;
}

export function UploadErrors({ errors, onDismiss }: UploadErrorsProps) {
  if (errors.length === 0) return null;
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <ul className="min-w-0 flex-1 space-y-1">
        {errors.map((message, i) => (
          <li key={i} className="wrap-break-word">{message}</li>
        ))}
      </ul>
      <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 rounded p-0.5 hover:bg-destructive/20">
        <X className="size-4" />
      </button>
    </div>
  );
}