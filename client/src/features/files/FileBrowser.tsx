import { useRef, useState } from 'react';
import { useFolders, useCreateFolder } from '../folders/useFolders';
import { useFiles, useUploadFile } from './useFiles';
import { Button } from '@/components/ui/button';

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

  const navigateInto = (id: string, name: string) => {
    setBreadcrumbs((prev) => [...prev, { id, name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Folder name');
    if (name) createFolder.mutate(name);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile.mutate(file);
    e.target.value = '';
  };

  return (
    <div>
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id ?? 'root'}>
            {index > 0 && ' / '}
            <button onClick={() => navigateToBreadcrumb(index)} style={{ textDecoration: 'underline' }}>
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button onClick={handleCreateFolder}>New Folder</Button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelected} style={{ display: 'none' }} />
        <Button onClick={() => fileInputRef.current?.click()}>Upload File</Button>
      </div>

      {(foldersLoading || filesLoading) && <p>Loading...</p>}

      <ul>
        {folders?.map((folder) => (
          <li key={folder.id}>
            📁 <button onClick={() => navigateInto(folder.id, folder.name)}>{folder.name}</button>
          </li>
        ))}
        {files?.map((file) => (
          <li key={file.id}>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
        ))}
      </ul>
    </div>
  );
}