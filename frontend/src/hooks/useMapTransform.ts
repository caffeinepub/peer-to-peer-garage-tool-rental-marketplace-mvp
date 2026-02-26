import { useState, useCallback, useRef, PointerEvent, WheelEvent } from 'react';

export interface UseMapTransformOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  dragThreshold?: number;
}

export interface UseMapTransformReturn {
  zoom: number;
  panX: number;
  panY: number;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  handleWheel: (e: WheelEvent, containerRect: DOMRect) => void;
  handlePointerDown: (e: PointerEvent) => void;
  handlePointerMove: (e: PointerEvent) => void;
  handlePointerUp: (e: PointerEvent) => void;
  isDragging: boolean;
  hasDragged: boolean;
}

export function useMapTransform(options: UseMapTransformOptions = {}): UseMapTransformReturn {
  const {
    initialZoom = 1,
    minZoom = 0.5,
    maxZoom = 4,
    zoomStep = 0.2,
    dragThreshold = 5,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const dragDistanceRef = useRef(0);
  const pointerCountRef = useRef(0);
  const pinchStartRef = useRef<{ distance: number; zoom: number; midX: number; midY: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Clamp pan values to prevent map from being dragged too far
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number) => {
      // Calculate max pan based on zoom level
      // At zoom 1, allow minimal panning; at higher zoom, allow more
      const maxPanX = Math.max(0, (currentZoom - 1) * 400);
      const maxPanY = Math.max(0, (currentZoom - 1) * 300);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y)),
      };
    },
    []
  );

  const zoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + zoomStep, maxZoom);
      // Adjust pan to keep it within bounds
      const clamped = clampPan(panX, panY, newZoom);
      setPanX(clamped.x);
      setPanY(clamped.y);
      return newZoom;
    });
  }, [zoomStep, maxZoom, panX, panY, clampPan]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - zoomStep, minZoom);
      // Adjust pan to keep it within bounds
      const clamped = clampPan(panX, panY, newZoom);
      setPanX(clamped.x);
      setPanY(clamped.y);
      return newZoom;
    });
  }, [zoomStep, minZoom, panX, panY, clampPan]);

  const reset = useCallback(() => {
    setZoom(initialZoom);
    setPanX(0);
    setPanY(0);
  }, [initialZoom]);

  // Zoom-to-cursor implementation
  const handleWheel = useCallback(
    (e: WheelEvent, containerRect: DOMRect) => {
      e.preventDefault();

      // Calculate cursor position relative to container
      const cursorX = e.clientX - containerRect.left;
      const cursorY = e.clientY - containerRect.top;

      // Normalize cursor position to -0.5 to 0.5 range (center is 0,0)
      const normalizedX = (cursorX / containerRect.width - 0.5);
      const normalizedY = (cursorY / containerRect.height - 0.5);

      setZoom((prevZoom) => {
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, prevZoom + delta));
        const zoomRatio = newZoom / prevZoom;

        // Adjust pan to zoom toward cursor
        setPanX((prevPanX) => {
          const newPanX = prevPanX * zoomRatio - normalizedX * containerRect.width * (zoomRatio - 1);
          const clamped = clampPan(newPanX, panY, newZoom);
          return clamped.x;
        });

        setPanY((prevPanY) => {
          const newPanY = prevPanY * zoomRatio - normalizedY * containerRect.height * (zoomRatio - 1);
          const clamped = clampPan(panX, newPanY, newZoom);
          return clamped.y;
        });

        return newZoom;
      });
    },
    [zoomStep, minZoom, maxZoom, clampPan, panX, panY]
  );

  const handlePointerDown = useCallback((e: PointerEvent) => {
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pointerCountRef.current = activePointersRef.current.size;

    if (pointerCountRef.current === 1) {
      // Single pointer - start drag
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX,
        panY,
      };
      dragDistanceRef.current = 0;
      setIsDragging(true);
      setHasDragged(false);
    } else if (pointerCountRef.current === 2) {
      // Two pointers - start pinch
      const pointers = Array.from(activePointersRef.current.values());
      const dx = pointers[1].x - pointers[0].x;
      const dy = pointers[1].y - pointers[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const midX = (pointers[0].x + pointers[1].x) / 2;
      const midY = (pointers[0].y + pointers[1].y) / 2;

      pinchStartRef.current = {
        distance,
        zoom,
        midX,
        midY,
      };
      dragStartRef.current = null;
      setIsDragging(false);
    }
  }, [panX, panY, zoom]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointerCountRef.current === 1 && dragStartRef.current) {
        // Single pointer drag
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        dragDistanceRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (dragDistanceRef.current > dragThreshold) {
          setHasDragged(true);
        }

        const newPanX = dragStartRef.current.panX + deltaX;
        const newPanY = dragStartRef.current.panY + deltaY;

        const clamped = clampPan(newPanX, newPanY, zoom);
        setPanX(clamped.x);
        setPanY(clamped.y);
      } else if (pointerCountRef.current === 2 && pinchStartRef.current) {
        // Two pointer pinch
        const pointers = Array.from(activePointersRef.current.values());
        const dx = pointers[1].x - pointers[0].x;
        const dy = pointers[1].y - pointers[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scale = distance / pinchStartRef.current.distance;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, pinchStartRef.current.zoom * scale));

        // Keep midpoint stable during pinch
        const midX = (pointers[0].x + pointers[1].x) / 2;
        const midY = (pointers[0].y + pointers[1].y) / 2;
        const midDeltaX = midX - pinchStartRef.current.midX;
        const midDeltaY = midY - pinchStartRef.current.midY;

        setZoom(newZoom);
        setPanX((prev) => {
          const clamped = clampPan(prev + midDeltaX, panY, newZoom);
          return clamped.x;
        });
        setPanY((prev) => {
          const clamped = clampPan(panX, prev + midDeltaY, newZoom);
          return clamped.y;
        });
      }
    },
    [zoom, panX, panY, dragThreshold, clampPan, minZoom, maxZoom]
  );

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const target = e.target as HTMLElement;
    target.releasePointerCapture(e.pointerId);

    activePointersRef.current.delete(e.pointerId);
    pointerCountRef.current = activePointersRef.current.size;

    if (pointerCountRef.current === 0) {
      setIsDragging(false);
      dragStartRef.current = null;
      pinchStartRef.current = null;

      // Reset hasDragged after a short delay to allow click handlers to check it
      setTimeout(() => {
        setHasDragged(false);
      }, 50);
    } else if (pointerCountRef.current === 1) {
      // Transition from pinch back to drag
      const remaining = Array.from(activePointersRef.current.entries())[0];
      dragStartRef.current = {
        x: remaining[1].x,
        y: remaining[1].y,
        panX,
        panY,
      };
      pinchStartRef.current = null;
      setIsDragging(true);
    }
  }, [panX, panY]);

  return {
    zoom,
    panX,
    panY,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    hasDragged,
  };
}
