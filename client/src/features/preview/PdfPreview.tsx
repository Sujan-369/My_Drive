import { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, Loader2 } from 'lucide-react';
import { useIdle } from '@/lib/useIdle';

GlobalWorkerOptions.workerSrc = workerSrc;

interface PdfPreviewProps {
  fileId: string;
}

export function PdfPreview({ fileId }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isIdle = useIdle(2000, isFullscreen);

  useEffect(() => {
    let cancelled = false;
    setInitialLoading(true);
    setError(null);
    setPageNum(1);

    async function load() {
      try {
        const blob = await apiClient.getBlob(`/api/files/${fileId}/download`);
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
      } catch (err) {
        console.error('PDF load failed:', err);
        if (!cancelled) setError('Could not load this PDF.');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fileId]);

  useEffect(() => {
    if (!pdfRef.current) return;
    let cancelled = false;
    setPageLoading(true);

    async function renderPage() {
      // Cancel whatever render is still in flight before starting a new
      // one. Without this, rapid page changes (holding an arrow key,
      // clicking next quickly) throw mid-render, since pdf.js can't
      // safely draw two pages onto the same canvas concurrently.
      renderTaskRef.current?.cancel();

      try {
        const page = await pdfRef.current!.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const task = page.render({ canvas, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        // A cancelled render throws too — that's expected when a newer
        // page request supersedes this one, not a real failure.
        const isCancellation = err instanceof Error && err.name === 'RenderingCancelledException';
        if (!cancelled && !isCancellation) {
          console.error('PDF page render failed:', err);
          setError('Could not render this page.');
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
          setInitialLoading(false);
        }
      }
    }

    renderPage();
    return () => { cancelled = true; };
  }, [pageNum, pageCount, scale]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const goPrev = useCallback(() => setPageNum((n) => Math.max(1, n - 1)), []);
  const goNext = useCallback(() => setPageNum((n) => Math.min(pageCount, n + 1)), [pageCount]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  const hideControls = isFullscreen && isIdle;

  return (
    <div
      ref={containerRef}
      className={`flex w-full flex-col items-center gap-3 bg-background py-4 ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      <div
        className={
          isFullscreen
            ? `fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-popover px-3 py-2 shadow-lg transition-opacity duration-100 ${
                hideControls ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`
            : 'flex items-center gap-2'
        }
      >
        <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.max(0.6, s - 0.2))} title="Zoom out">
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(scale * 83)}%</span>
        <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.min(3, s + 0.2))} title="Zoom in">
          <ZoomIn className="size-4" />
        </Button>
        <Button variant="outline" size="icon" disabled={pageNum <= 1} onClick={goPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Page {pageNum} of {pageCount}</span>
        <Button variant="outline" size="icon" disabled={pageNum >= pageCount} onClick={goNext}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </Button>
      </div>

      <div className="relative mx-auto">
        {error ? (
          <p className="py-24 text-sm text-muted-foreground">{error}</p>
        ) : (
          <>
            {initialLoading && <p className="py-24 text-sm text-muted-foreground">Loading preview...</p>}
            <canvas ref={canvasRef} className={`max-w-full rounded shadow-sm ${initialLoading ? 'hidden' : ''}`} />
            {pageLoading && !initialLoading && (
              <div className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}