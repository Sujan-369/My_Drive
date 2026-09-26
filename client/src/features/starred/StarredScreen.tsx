import { useFolderStarred, useToggleStarFolder } from '../folders/useFolders';
import { useFileStarred, useToggleStarFile } from '../files/useFiles';
import { Button } from '@/components/ui/button';
import { Folder, FileText, Star } from 'lucide-react';

export function StarredScreen() {
  const { data: folders } = useFolderStarred();
  const { data: files } = useFileStarred();
  const toggleFolder = useToggleStarFolder(null);
  const toggleFile = useToggleStarFile(null);

  const hasContent = (folders?.length ?? 0) > 0 || (files?.length ?? 0) > 0;

  return (
    <div>
      {!hasContent && (
        <div className="rounded-xl border border-border px-4 py-16 text-center">
          <Star className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Star important files and folders for quick access.</p>
        </div>
      )}
      {hasContent && (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {folders?.map((folder) => (
              <div key={folder.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3">
                <Folder className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{folder.name}</span>
                <Button variant="ghost" size="icon" onClick={() => toggleFolder.mutate({ id: folder.id, starred: true })}>
                  <Star className="size-4 fill-primary text-primary" />
                </Button>
              </div>
            ))}
            {files?.map((file) => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => toggleFile.mutate({ id: file.id, starred: true })}>
                  <Star className="size-4 fill-primary text-primary" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}