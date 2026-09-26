import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useFolders, useCreateFolder, useDeleteFolder, useToggleStarFolder } from '../folders/useFolders';
import { useFiles, useUploadFile, useDeleteFile, useToggleStarFile } from './useFiles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { NewFolderDialog } from '../folders/NewFolderDialog';
import { ShareDialog } from '../sharing/ShareDialog';
import { downloadFile } from '@/lib/downloadFile';
import { Folder, FileText, Upload, ChevronRight, Trash2, Star, Share2, Download } from 'lucide-react';

interface BreadcrumbEntry {
  id: string | null;
  name: string;
}

interface FileBrowserProps {
  onOpenPreview: (fileId: string) => void;
}

type SortKey = 'name' | 'modified' | 'size';

const sortLabels: Record<SortKey, string> = {
  name: 'Name',
  modified: 'Last modified',
  size: 'Size',
};

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } };

export function FileBrowser({ onOpenPreview }: FileBrowserProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([{ id: null, name: 'My Drive' }]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [shareTarget, setShareTarget] = useState<{ type: 'folders' | 'files'; id: string; name: string } | null>(null);

  const { data: folders, isLoading: foldersLoading } = useFolders(currentFolderId);
  const { data: files, isLoading: filesLoading } = useFiles(currentFolderId);
  const createFolder = useCreateFolder(currentFolderId);
  const uploadFile = useUploadFile(currentFolderId);
  const deleteFolder = useDeleteFolder(currentFolderId);
  const deleteFile = useDeleteFile(currentFolderId);
  const toggleStarFolder = useToggleStarFolder(currentFolderId);
  const toggleStarFile = useToggleStarFile(currentFolderId);

  const isLoading = foldersLoading || filesLoading;

  const sortedFolders = useMemo(
    () => [...(folders ?? [])].sort((a, b) => (sortKey === 'modified' ? +new Date(b.modifiedAt) - +new Date(a.modifiedAt) : a.name.localeCompare(b.name))),
    [folders, sortKey]
  );
  const sortedFiles = useMemo(
    () =>
      [...(files ?? [])].sort((a, b) => {
        if (sortKey === 'size') return b.size - a.size;
        if (sortKey === 'modified') return +new Date(b.modifiedAt) - +new Date(a.modifiedAt);
        return a.name.localeCompare(b.name);
      }),
    [files, sortKey]
  );

  const hasContent = sortedFolders.length > 0 || sortedFiles.length > 0;

  const navigateInto = (id: string, name: string) => setBreadcrumbs((prev) => [...prev, { id, name }]);
  const navigateToBreadcrumb = (index: number) => setBreadcrumbs((prev) => prev.slice(0, index + 1));

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
    <div>
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5" />}
            <button onClick={() => navigateToBreadcrumb(index)} className="rounded px-1.5 py-0.5 hover:bg-white/5 hover:text-foreground">
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      <div className="mb-4 flex items-center gap-2">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
          <Upload className="size-4" />
          {uploadFile.isPending ? 'Uploading...' : 'Upload File'}
        </Button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" />
        <NewFolderDialog onCreate={(name) => createFolder.mutate(name)} isPending={createFolder.isPending} />

        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
          <SelectTrigger className="ml-auto w-40">
            <SelectValue>{sortLabels[sortKey]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="modified">Last modified</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {isLoading && (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !hasContent && (
          <div className="px-4 py-16 text-center">
            <Folder className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">This folder is empty.</p>
          </div>
        )}

        {!isLoading && hasContent && (
          <motion.div className="divide-y divide-border" variants={listVariants} initial="hidden" animate="visible">
            {sortedFolders.map((folder) => (
              <motion.div
                key={folder.id}
                variants={itemVariants}
                className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3"
              >
                <span className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                <button onClick={() => navigateInto(folder.id, folder.name)} className="flex flex-1 items-center gap-3 text-left">
                  <Folder className="size-5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{folder.name}</span>
                </button>
                {folder.isShared && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Shared</span>}

                <div className="relative flex h-8 shrink-0 items-center">
                  <Star
                    className={`absolute right-1 size-4 fill-primary text-primary transition-opacity duration-150 ${
                      folder.isStarred ? 'opacity-100 group-hover:opacity-0' : 'opacity-0'
                    }`}
                  />
                  <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => setShareTarget({ type: 'folders', id: folder.id, name: folder.name })} title="Share">
                      <Share2 className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleStarFolder.mutate({ id: folder.id, starred: folder.isStarred })}>
                      <Star className={`size-4 ${folder.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteFolder.mutate(folder.id)} title="Delete">
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {sortedFiles.map((file) => (
              <motion.div
                key={file.id}
                variants={itemVariants}
                className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3"
              >
                <span className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <button onClick={() => onOpenPreview(file.id)} className="flex-1 truncate text-left text-sm hover:underline">
                  {file.name}
                </button>
                {file.isShared && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Shared</span>}
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>

                <div className="relative flex h-8 shrink-0 items-center">
                  <Star
                    className={`absolute right-1 size-4 fill-primary text-primary transition-opacity duration-150 ${
                      file.isStarred ? 'opacity-100 group-hover:opacity-0' : 'opacity-0'
                    }`}
                  />
                  <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => setShareTarget({ type: 'files', id: file.id, name: file.name })} title="Share">
                      <Share2 className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleStarFile.mutate({ id: file.id, starred: file.isStarred })}>
                      <Star className={`size-4 ${file.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteFile.mutate(file.id)} title="Delete">
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => downloadFile(file.id, file.name)} title="Download">
                      <Download className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {shareTarget && (
        <ShareDialog
          open={shareTarget !== null}
          onOpenChange={(open) => !open && setShareTarget(null)}
          resourceType={shareTarget.type}
          resourceId={shareTarget.id}
          resourceName={shareTarget.name}
        />
      )}
    </div>
  );
}