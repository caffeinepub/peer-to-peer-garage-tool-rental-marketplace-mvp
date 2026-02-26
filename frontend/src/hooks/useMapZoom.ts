import { useState, useCallback, WheelEvent } from 'react';

export interface UseMapZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  preventDefaultScroll?: boolean;
}

export interface UseMapZoomReturn {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  handleWheel: (e: WheelEvent, containerRect: DOMRect) => void;
}

export function useMapZoom(options: UseMapZoomOptions = {}): UseMapZoomReturn {
  const {
    initialZoom = 1,
    minZoom = 0.5,
    maxZoom = 4,
    zoomStep = 0.2,
    preventDefaultScroll = true,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const reset = useCallback(() => {
    setZoom(initialZoom);
  }, [initialZoom]);

  const handleWheel = useCallback(
    (e: WheelEvent, containerRect: DOMRect) => {
      if (preventDefaultScroll) {
        e.preventDefault();
      }

      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      setZoom((prev) => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
    },
    [zoomStep, minZoom, maxZoom, preventDefaultScroll]
  );

  return {
    zoom,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
  };
}
