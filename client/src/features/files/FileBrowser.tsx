import { useRef, useState } from 'react';
import { useFolders, useCreateFolder } from '../folders/useFolders';
import { useFiles, useUploadFile } from './useFiles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NewFolderDialog } from '../folders/NewFolderDialog';
import { Folder, FileText, Upload, ChevronRight } from 'lucide-react';

interface BreadcrumbEntry {
  id: string | null;
  name: string;
}

export function FileBrowser() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([{ id: null, name: 'My Drive' }]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders, isLoading: foldersLoading } = useFolders(currentFolderId);
  const { data: files, isLoading: filesLoading } = useFiles(currentFolderId);
  const createFolder = useCreateFolder(currentFolderId);
  const uploadFile = useUploadFile(currentFolderId);

  const isLoading = foldersLoading || filesLoading;
  const hasContent = (folders?.length ?? 0) > 0 || (files?.length ?? 0) > 0;

  const navigateInto = (id: string, name: string) =>
    setBreadcrumbs((prev) => [...prev, { id, name }]);
  const navigateToBreadcrumb = (index: number) =>
    setBreadcrumbs((prev) => prev.slice(0, index + 1));

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile.mutate(file);
    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5" />}
            <button
              onClick={() => navigateToBreadcrumb(index)}
              className="rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      <div className="mb-4 flex gap-2">
        <NewFolderDialog onCreate={(name) => createFolder.mutate(name)} isPending={createFolder.isPending} />
        <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
          <Upload className="size-4" />
          {uploadFile.isPending ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      <div className="rounded-lg border">
        {isLoading && (
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !hasContent && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">This folder is empty.</p>
        )}

        {!isLoading && hasContent && (
          <div className="divide-y">
            {folders?.map((folder) => (
              <button
                key={folder.id}
                onClick={() => navigateInto(folder.id, folder.name)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
              >
                <Folder className="size-5 shrink-0 text-muted-foreground" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
            {files?.map((file) => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}