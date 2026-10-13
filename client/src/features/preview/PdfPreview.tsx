import { useCallback, useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, Loader2 } from 'lucide-react';
import { useIdle } from '@/lib/useIdle';

GlobalWorkerOptions.workerSrc = workerSrc;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
// iOS Safari silently fails to draw canvases above ~16.7M pixels.
const MAX_CANVAS_PIXELS = 16_000_000;

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

interface PdfPreviewProps {
  fileId: string;
}

export function PdfPreview({ fileId }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const pinchScaleRef = useRef(1);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1); // 1 = fit to width
  const [pinchScale, setPinchScale] = useState(1); // live visual scale while pinching
  const [stageWidth, setStageWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pageCount = pdf?.numPages ?? 1;
  const isIdle = useIdle(2000, isFullscreen);

  // Load the document. Keeping it in state (not a ref) is what makes the render
  // effect re-run once it's ready, including for one-page PDFs.
  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof getDocument> | null = null;
    setPdf(null);
    setError(null);
    setHasRendered(false);
    setPageNum(1);
    setZoom(1);

    (async () => {
      try {
        const blob = await apiClient.getBlob(`/api/files/${fileId}/download`);
        const data = await blob.arrayBuffer();
        // Cleanup may have run while we were downloading, before a task existed to destroy.
        if (cancelled) return;
        task = getDocument({
          data,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
        });
        const doc = await task.promise;
        if (cancelled) return;
        setPdf(doc);
      } catch (err) {
        if (!cancelled) {
          console.error('PDF load failed:', err);
          setError('Could not load this PDF.');
        }
      }
    })();

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [fileId]);

  // Track the available width so "zoom 1" always means "fits the screen".
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || stageWidth === 0) return;
    let cancelled = false;
    setPageLoading(true);

    (async () => {
      renderTaskRef.current?.cancel();
      try {
        const page = await pdf.getPage(pageNum);
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const base = page.getViewport({ scale: 1 });
        const cssScale = (stageWidth / base.width) * zoom;
        const cssViewport = page.getViewport({ scale: cssScale });

        // Draw at device resolution, then size the canvas in CSS pixels.
        let outputScale = Math.min(window.devicePixelRatio || 1, 3);
        const pixels = cssViewport.width * cssViewport.height * outputScale * outputScale;
        if (pixels > MAX_CANVAS_PIXELS) outputScale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);

        const viewport = page.getViewport({ scale: cssScale * outputScale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        const task = page.render({ canvas, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) setHasRendered(true);
      } catch (err) {
        // A cancelled render throws too; that's expected when a newer request supersedes it.
        const isCancellation = err instanceof Error && err.name === 'RenderingCancelledException';
        if (!cancelled && !isCancellation) {
          console.error('PDF page render failed:', err);
          setError('Could not render this page.');
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdf, pageNum, zoom, stageWidth]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const goPrev = useCallback(() => setPageNum((n) => Math.max(1, n - 1)), []);
  const goNext = useCallback(() => setPageNum((n) => Math.min(pageCount, n + 1)), [pageCount]);
  const zoomIn = () => setZoom((z) => clampZoom(Math.round((z + ZOOM_STEP) * 100) / 100));
  const zoomOut = () => setZoom((z) => clampZoom(Math.round((z - ZOOM_STEP) * 100) / 100));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
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

  // Pinch-to-zoom: scale the canvas live with a CSS transform, then commit the new
  // zoom (and re-render crisply) when the second finger lifts.
  const pointerDistance = () => {
    const [a, b] = [...pointersRef.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) pinchRef.current = { distance: pointerDistance(), zoom };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pinch = pinchRef.current;
    if (!pinch || pointersRef.current.size !== 2) return;
    const next = clampZoom(pinch.zoom * (pointerDistance() / pinch.distance)) / pinch.zoom;
    pinchScaleRef.current = next;
    setPinchScale(next);
  };

  const endPointer = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size < 2) {
      const committed = clampZoom(pinch.zoom * pinchScaleRef.current);
      pinchRef.current = null;
      pinchScaleRef.current = 1;
      setPinchScale(1);
      setZoom(Math.round(committed * 100) / 100);
    }
  };

  const hideControls = isFullscreen && isIdle;
  const touchButton = 'size-10 sm:size-9';

  return (
    <div
      ref={containerRef}
      className={`flex w-full flex-col items-center gap-3 bg-background py-2 sm:py-4 ${isFullscreen ? 'h-dvh' : ''}`}
    >
      <div
        className={
          isFullscreen
            ? `fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border bg-popover px-3 py-2 shadow-lg transition-opacity duration-100 ${
                hideControls ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`
            : 'flex flex-wrap items-center justify-center gap-1.5 sm:gap-2'
        }
      >
        <Button variant="outline" size="icon" className={touchButton} disabled={pageNum <= 1} onClick={goPrev} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          Page {pageNum} of {pageCount}
        </span>
        <Button variant="outline" size="icon" className={touchButton} disabled={pageNum >= pageCount} onClick={goNext} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className={touchButton} onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
          <ZoomOut className="size-4" />
        </Button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom to fit width"
          className="w-12 rounded text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="ghost" size="icon" className={touchButton} onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
          <ZoomIn className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className={touchButton} onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </Button>
      </div>

      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        style={{ touchAction: 'pan-x pan-y' }}
        className={`relative w-full ${isFullscreen ? 'min-h-0 flex-1 overflow-auto' : 'overflow-x-auto'}`}
      >
        {error ? (
          <p className="py-24 text-center text-sm text-muted-foreground">{error}</p>
        ) : (
          <>
            {!hasRendered && <p className="py-24 text-center text-sm text-muted-foreground">Loading preview...</p>}
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`PDF page ${pageNum} of ${pageCount}`}
              className={`mx-auto block rounded shadow-sm ${hasRendered ? '' : 'hidden'}`}
              style={{
                transform: pinchScale !== 1 ? `scale(${pinchScale})` : undefined,
                transformOrigin: 'top center',
              }}
            />
            {pageLoading && hasRendered && (
              <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-background/80 p-1.5">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}