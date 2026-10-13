import { useCallback, useEffect, useRef } from 'react';

/** Fixed, non-interactive background glow. Styles live in index.css (.ambient-glow). */
export function AmbientBackground() {
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--scroll-y');
    };
  }, []);
  return <div className="ambient-glow" aria-hidden="true" />;
}

/**
 * Returns an onScroll handler for the app's scroll container. It publishes scrollTop to a
 * CSS variable (at most once per frame) which the glow uses for a subtle parallax.
 */
export function useAmbientScroll() {
  const frame = useRef<number | null>(null);
  return useCallback((e: React.UIEvent<HTMLElement>) => {
    const top = e.currentTarget.scrollTop;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--scroll-y', String(top));
      frame.current = null;
    });
  }, []);
}