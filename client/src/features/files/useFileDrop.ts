import { useRef, useState } from 'react';

const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files');

/** Spread `props` on a container and render <DropOverlay /> while `isDragging`. */
export function useFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave fire for every child element, so count them instead of toggling.
  const depth = useRef(0);

  const props = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
  };

  return { props, isDragging };
}