import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useFolders, useCreateFolder, useDeleteFolder, useToggleStarFolder, useRenameFolder, useMoveFolder } from '../folders/useFolders';
import { useFiles, useUploadFile, useDeleteFile, useToggleStarFile, useRenameFile, useMoveFile } from './useFiles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { NewFolderDialog } from '../folders/NewFolderDialog';
import { RenameDialog } from '../folders/RenameDialog';
import { MoveDialog } from '../folders/MoveDialog';
import { ShareDialog } from '../sharing/ShareDialog';
import { RowActions } from './RowActions';
import { downloadFile } from '@/lib/downloadFile';
import { Folder, FileText, Upload, ChevronRight, Star } from 'lucide-react';

interface BreadcrumbEntry { id: string | null; name: string; }
interface FileBrowserProps { onOpenPreview: (fileId: string) => void; }
type SortKey = 'name' | 'modified' | 'size';
type Target = { type: 'folders' | 'files'; id: string; name: string };

const sortLabels: Record<SortKey, string> = { name: 'Name', modified: 'Last modified', size: 'Size' };
const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } };
const DRAG_HOLD_MS = 150;

export function FileBrowser({ onOpenPreview }: FileBrowserProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([{ id: null, name: 'My Drive' }]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [shareTarget, setShareTarget] = useState<Target | null>(null);
  const [renameTarget, setRenameTarget] = useState<Target | null>(null);
  const [moveTarget, setMoveTarget] = useState<Target | null>(null);
  const [draggedItem, setDraggedItem] = useState<Target | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | 'root' | undefined>(undefined);
  const [draggableId, setDraggableId] = useState<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: folders, isLoading: foldersLoading } = useFolders(currentFolderId);
  const { data: files, isLoading: filesLoading } = useFiles(currentFolderId);
  const createFolder = useCreateFolder(currentFolderId);
  const uploadFile = useUploadFile(currentFolderId);
  const deleteFolder = useDeleteFolder(currentFolderId);
  const deleteFile = useDeleteFile(currentFolderId);
  const toggleStarFolder = useToggleStarFolder(currentFolderId);
  const toggleStarFile = useToggleStarFile(currentFolderId);
  const renameFolder = useRenameFolder(currentFolderId);
  const renameFile = useRenameFile(currentFolderId);
  const moveFolder = useMoveFolder(currentFolderId);
  const moveFile = useMoveFile(currentFolderId);

  const isLoading = foldersLoading || filesLoading;

  const sortedFolders = useMemo(
    () => [...(folders ?? [])].sort((a, b) => (sortKey === 'modified' ? +new Date(b.modifiedAt) - +new Date(a.modifiedAt) : a.name.localeCompare(b.name))),
    [folders, sortKey]
  );
  const sortedFiles = useMemo(
    () => [...(files ?? [])].sort((a, b) => {
      if (sortKey === 'size') return b.size - a.size;
      if (sortKey === 'modified') return +new Date(b.modifiedAt) - +new Date(a.modifiedAt);
      return a.name.localeCompare(b.name);
    }),
    [files, sortKey]
  );
  const hasContent = sortedFolders.length > 0 || sortedFiles.length > 0;

  const navigateInto = (id: string, name: string) => setBreadcrumbs((prev) => [...prev, { id, name }]);
  const navigateToBreadcrumb = (index: number) => setBreadcrumbs((prev) => prev.slice(0, index + 1));
  const startHold = (id: string) => {
    holdTimerRef.current = setTimeout(() => setDraggableId(id), DRAG_HOLD_MS);
  };
  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    setDraggableId(null);
  };

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

  const handleRename = (newName: string) => {
    if (!renameTarget) return;
    if (renameTarget.type === 'folders') {
      renameFolder.mutate({ id: renameTarget.id, name: newName }, { onSuccess: () => setRenameTarget(null) });
    } else {
      renameFile.mutate({ id: renameTarget.id, name: newName }, { onSuccess: () => setRenameTarget(null) });
    }
  };

  const handleMove = (targetFolderId: string | null) => {
    if (!moveTarget) return;
    if (moveTarget.type === 'folders') {
      moveFolder.mutate({ id: moveTarget.id, newParentFolderId: targetFolderId }, { onSuccess: () => setMoveTarget(null) });
    } else {
      moveFile.mutate({ id: moveTarget.id, newFolderId: targetFolderId }, { onSuccess: () => setMoveTarget(null) });
    }
  };

  // Drag-and-drop: dragged item lives in React state rather than relying on
  // DataTransfer.getData(), which browsers only allow reading on drop, not
  // during dragover — state is what lets us highlight the live drop target.
  const handleDrop = (targetFolderId: string | null) => {
    if (!draggedItem) return;
    if (draggedItem.type === 'folders' && draggedItem.id === targetFolderId) {
      setDraggedItem(null);
      setDropTargetId(undefined);
      return;
    }
    if (draggedItem.type === 'folders') {
      moveFolder.mutate({ id: draggedItem.id, newParentFolderId: targetFolderId });
    } else {
      moveFile.mutate({ id: draggedItem.id, newFolderId: targetFolderId });
    }
    setDraggedItem(null);
    setDropTargetId(undefined);
  };

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => {
          const isAncestor = index < breadcrumbs.length - 1;
          const dropKey = crumb.id ?? 'root';
          return (
            <span key={dropKey} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5" />}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                onDragOver={isAncestor ? (e) => { e.preventDefault(); setDropTargetId(dropKey); } : undefined}
                onDragLeave={isAncestor ? () => setDropTargetId((c) => (c === dropKey ? undefined : c)) : undefined}
                onDrop={isAncestor ? (e) => { e.preventDefault(); handleDrop(crumb.id); } : undefined}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  dropTargetId === dropKey ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary' : 'hover:bg-white/5 hover:text-foreground'
                }`}
              >
                {crumb.name}
              </button>
            </span>
          );
        })}
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
          <Upload className="size-4" />
          {uploadFile.isPending ? 'Uploading...' : 'Upload File'}
        </Button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" />
        <NewFolderDialog
          onCreate={(name, options) => createFolder.mutate(name, options)}
          isPending={createFolder.isPending}
          error={createFolder.error?.message}
        />
        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
          <SelectTrigger className="ml-auto w-40"><SelectValue>{sortLabels[sortKey]}</SelectValue></SelectTrigger>
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
            {[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3 px-4 py-3"><Skeleton className="size-5 rounded" /><Skeleton className="h-4 w-40" /></div>)}
          </div>
        )}
        {!isLoading && !hasContent && (
          <div className="px-4 py-16 text-center"><Folder className="mx-auto mb-3 size-8 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">This folder is empty.</p></div>
        )}
        {!isLoading && hasContent && (
          <motion.div className="divide-y divide-border" variants={listVariants} initial="hidden" animate="visible">
            {sortedFolders.map((folder) => (
              <motion.div key={folder.id} variants={itemVariants}>
                <div
                  draggable={draggableId === folder.id}
                  onPointerDown={() => startHold(folder.id)}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  onDragStart={() => setDraggedItem({ type: 'folders', id: folder.id, name: folder.name })}
                  onDragEnd={() => { setDraggedItem(null); setDropTargetId(undefined); cancelHold(); }}
                  onDragOver={(e) => { e.preventDefault(); setDropTargetId(folder.id); }}
                  onDragLeave={() => setDropTargetId((c) => (c === folder.id ? undefined : c))}
                  onDrop={(e) => { e.preventDefault(); handleDrop(folder.id); }}
                  onClick={(e) => { if (e.target === e.currentTarget) navigateInto(folder.id, folder.name); }}
                  className={`group relative flex items-center gap-3 px-4 py-3 transition-colors ${
                    draggableId === folder.id ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${
                    dropTargetId === folder.id ? 'bg-primary/10 ring-1 ring-inset ring-primary' : 'hover:bg-white/3'
                  } ${draggedItem?.id === folder.id ? 'opacity-40' : ''}`}
                >
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  <button onClick={() => navigateInto(folder.id, folder.name)} className={`flex min-w-0 flex-1 items-center gap-3 text-left ${draggableId === folder.id ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                    <Folder className="size-5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  {folder.isShared && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Shared</span>}
                  <Button variant="ghost" size="icon" onClick={() => toggleStarFolder.mutate({ id: folder.id, starred: folder.isStarred })}>
                    <Star className={`size-4 ${folder.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <RowActions
                    onShare={() => setShareTarget({ type: 'folders', id: folder.id, name: folder.name })}
                    onRename={() => setRenameTarget({ type: 'folders', id: folder.id, name: folder.name })}
                    onMove={() => setMoveTarget({ type: 'folders', id: folder.id, name: folder.name })}
                    onDelete={() => deleteFolder.mutate(folder.id)}
                  />
                </div>
              </motion.div>
            ))}
            {sortedFiles.map((file) => (
              <motion.div key={file.id} variants={itemVariants}>
                <div
                  draggable={draggableId === file.id}
                  onPointerDown={() => startHold(file.id)}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  onDragStart={() => setDraggedItem({ type: 'files', id: file.id, name: file.name })}
                  onDragEnd={() => { setDraggedItem(null); setDropTargetId(undefined); cancelHold(); }}
                  onClick={(e) => { if (e.target === e.currentTarget) onOpenPreview(file.id); }}
                  className={`group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3 ${
                    draggableId === file.id ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${draggedItem?.id === file.id ? 'opacity-40' : ''}`}
                >
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                  <button onClick={() => onOpenPreview(file.id)} className={`min-w-0 flex-1 truncate text-left text-sm hover:underline ${draggableId === file.id ? 'cursor-grab active:cursor-grabbing' : ''}`}>{file.name}</button>
                  {file.isShared && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Shared</span>}
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{formatSize(file.size)}</span>
                  <Button variant="ghost" size="icon" onClick={() => toggleStarFile.mutate({ id: file.id, starred: file.isStarred })}>
                    <Star className={`size-4 ${file.isStarred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <RowActions
                    onShare={() => setShareTarget({ type: 'files', id: file.id, name: file.name })}
                    onRename={() => setRenameTarget({ type: 'files', id: file.id, name: file.name })}
                    onMove={() => setMoveTarget({ type: 'files', id: file.id, name: file.name })}
                    onDelete={() => deleteFile.mutate(file.id)}
                    onDownload={() => downloadFile(file.id, file.name)}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {shareTarget && (
        <ShareDialog open onOpenChange={(open) => !open && setShareTarget(null)} resourceType={shareTarget.type} resourceId={shareTarget.id} resourceName={shareTarget.name} />
      )}
      {renameTarget && (
        <RenameDialog
          open
          onOpenChange={(open) => !open && setRenameTarget(null)}
          currentName={renameTarget.name}
          resourceType={renameTarget.type}
          onRename={handleRename}
          isPending={renameFolder.isPending || renameFile.isPending}
          error={renameFolder.error?.message || renameFile.error?.message}
        />
      )}
      {moveTarget && (
        <MoveDialog
          open
          onOpenChange={(open) => !open && setMoveTarget(null)}
          itemName={moveTarget.name}
          onMove={handleMove}
          isPending={moveFolder.isPending || moveFile.isPending}
        />
      )}
    </div>
  );
}