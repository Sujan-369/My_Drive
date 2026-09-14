import { useEffect, useRef, useState } from 'react';
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

GlobalWorkerOptions.workerSrc = workerSrc;

interface PdfPreviewProps {
  fileId: string;
}

export function PdfPreview({ fileId }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPageNum(1);
    setPdfLoaded(false);

    async function load() {
      try {
        const blob = await apiClient.getBlob(`/api/files/${fileId}/download`);
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) {
          loadingTask.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setPdfLoaded(true);
      } catch (err) {
        console.error('PDF load failed:', err);
        if (!cancelled) setError('Could not load this PDF.');
      }
    }

    load();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      pdfRef.current = null;
    };
  }, [fileId]);

  useEffect(() => {
    if (!pdfRef.current || !pdfLoaded) return;
    let cancelled = false;
    setLoading(true);

    async function renderPage() {
      try {
        const page = await pdfRef.current!.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTaskRef.current?.cancel();
        const task = page.render({ canvas, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (cancelled) return;
        if ((err as { name?: string })?.name === 'RenderingCancelledException') return;
        console.error('PDF page render failed:', err);
        setError('Could not render this page.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pageNum, pdfLoaded]);

  if (error) return <p className="py-24 text-center text-sm text-muted-foreground">{error}</p>;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {loading && <p className="text-sm text-muted-foreground">Loading page {pageNum}...</p>}
      <canvas ref={canvasRef} className={`max-w-full rounded shadow-sm ${loading ? 'hidden' : ''}`} />
      {pageCount > 1 && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" disabled={pageNum <= 1} onClick={() => setPageNum((n) => n - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {pageNum} of {pageCount}</span>
          <Button variant="outline" size="icon" disabled={pageNum >= pageCount} onClick={() => setPageNum((n) => n + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}