import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useFolders, useCreateFolder, useDeleteFolder, useToggleStarFolder } from '../folders/useFolders';
import { useFiles, useUploadFile, useDeleteFile, useToggleStarFile } from './useFiles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NewFolderDialog } from '../folders/NewFolderDialog';
import { Folder, FileText, Upload, ChevronRight, Trash2, Star } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { ShareDialog } from '../sharing/ShareDialog';

interface BreadcrumbEntry {
  id: string | null;
  name: string;
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

export function FileBrowser() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([{ id: null, name: 'My Drive' }]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders, isLoading: foldersLoading } = useFolders(currentFolderId);
  const { data: files, isLoading: filesLoading } = useFiles(currentFolderId);
  const createFolder = useCreateFolder(currentFolderId);
  const uploadFile = useUploadFile(currentFolderId);
  const deleteFolder = useDeleteFolder(currentFolderId);
  const deleteFile = useDeleteFile(currentFolderId);
  const toggleStarFolder = useToggleStarFolder(currentFolderId);
  const toggleStarFile = useToggleStarFile(currentFolderId);
  
  const [shareTarget, setShareTarget] = useState<{ type: 'folders' | 'files'; id: string; name: string } | null>(null);

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
          <motion.div className="divide-y" variants={listVariants} initial="hidden" animate="visible">
            
            {folders?.map((folder) => (
              <motion.div key={folder.id} variants={itemVariants} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <button onClick={() => navigateInto(folder.id, folder.name)} className="flex flex-1 items-center gap-3 text-left">
                  <Folder className="size-5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{folder.name}</span>
                </button>

                <Button variant="ghost" size="icon" onClick={() => setShareTarget({ type: 'folders', id: folder.id, name: folder.name })} title="Share">
                  <Share2 className="size-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStarFolder.mutate({ id: folder.id, starred: folder.isStarred })}
                  title={folder.isStarred ? 'Unstar' : 'Star'}
                >
                  <Star className={`size-4 ${folder.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteFolder.mutate(folder.id)} title="Delete">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ))}

            {files?.map((file) => (
              <motion.div key={file.id} variants={itemVariants} className="flex items-center gap-3 px-4 py-3">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
                
                <Button variant="ghost" size="icon" onClick={() => setShareTarget({ type: 'files', id: file.id, name: file.name })} title="Share">
                  <Share2 className="size-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStarFile.mutate({ id: file.id, starred: file.isStarred })}
                  title={file.isStarred ? 'Unstar' : 'Star'}
                >
                  <Star className={`size-4 ${file.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteFile.mutate(file.id)} title="Delete">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
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