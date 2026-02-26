import { useCallback, useRef, useState } from 'react';

export interface MapTransform {
  centerLat: number;
  centerLng: number;
  zoom: number;
}

export interface UseMapTransformReturn {
  transform: MapTransform;
  setTransform: React.Dispatch<React.SetStateAction<MapTransform>>;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: (lat: number, lng: number, zoom: number) => void;
  isAtMaxZoom: boolean;
  isAtMinZoom: boolean;
}

const MIN_ZOOM = 2;
const MAX_ZOOM = 19;
const TILE_SIZE = 256;

/** Web Mercator: lat → fractional tile Y at given zoom */
function latToTileY(lat: number, zoom: number): number {
  const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
  const latRad = (clamped * Math.PI) / 180;
  const cosVal = Math.cos(latRad);
  if (cosVal === 0) return Math.pow(2, zoom) / 2;
  const logArg = Math.tan(latRad) + 1 / cosVal;
  if (logArg <= 0) return Math.pow(2, zoom) / 2;
  const result = (1 - Math.log(logArg) / Math.PI) / 2 * Math.pow(2, zoom);
  return isFinite(result) ? result : Math.pow(2, zoom) / 2;
}

/** Web Mercator: fractional tile Y → lat at given zoom */
function tileYToLat(y: number, zoom: number): number {
  const maxTile = Math.pow(2, zoom);
  const clampedY = Math.max(0, Math.min(maxTile, y));
  const n = Math.PI - (2 * Math.PI * clampedY) / maxTile;
  const result = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return isFinite(result) ? Math.max(-85.051129, Math.min(85.051129, result)) : 0;
}

/** Clamp (not wrap) longitude to [-180, 180] to avoid discontinuous jumps */
function clampLng(lng: number): number {
  return Math.max(-180, Math.min(180, lng));
}

function sanitizeTransform(t: MapTransform): MapTransform {
  return {
    centerLat: isFinite(t.centerLat) ? Math.max(-85.051129, Math.min(85.051129, t.centerLat)) : 0,
    // Clamp longitude — wrapping causes map jumps near ±180°
    centerLng: isFinite(t.centerLng) ? clampLng(t.centerLng) : 0,
    zoom: isFinite(t.zoom) ? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(t.zoom))) : MIN_ZOOM,
  };
}

export function useMapTransform(initialTransform: MapTransform): UseMapTransformReturn {
  const [transform, setTransformRaw] = useState<MapTransform>(() => sanitizeTransform(initialTransform));
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Store drag start info including the zoom at drag-start time
  const dragStartRef = useRef<{
    x: number;
    y: number;
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const hasDraggedRef = useRef(false);

  // Wrap setTransform to always sanitize output
  const setTransform: React.Dispatch<React.SetStateAction<MapTransform>> = useCallback((action) => {
    setTransformRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      return sanitizeTransform(next);
    });
  }, []);

  const zoomIn = useCallback(() => {
    setTransform(t => ({ ...t, zoom: Math.min(MAX_ZOOM, t.zoom + 1) }));
  }, [setTransform]);

  const zoomOut = useCallback(() => {
    setTransform(t => ({ ...t, zoom: Math.max(MIN_ZOOM, t.zoom - 1) }));
  }, [setTransform]);

  const reset = useCallback((lat: number, lng: number, zoom: number) => {
    setTransform({ centerLat: lat, centerLng: lng, zoom });
  }, [setTransform]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Capture current transform state at drag start — read from the DOM event's
    // currentTarget dataset to avoid stale closure; we use a ref instead.
    // We'll read the latest transform via a ref approach below.
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: (e.currentTarget as HTMLElement).dataset.lat
        ? parseFloat((e.currentTarget as HTMLElement).dataset.lat!)
        : 0,
      lng: (e.currentTarget as HTMLElement).dataset.lng
        ? parseFloat((e.currentTarget as HTMLElement).dataset.lng!)
        : 0,
      zoom: (e.currentTarget as HTMLElement).dataset.zoom
        ? parseFloat((e.currentTarget as HTMLElement).dataset.zoom!)
        : MIN_ZOOM,
    };
    hasDraggedRef.current = false;
    setIsDragging(false);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (!hasDraggedRef.current && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
    hasDraggedRef.current = true;
    setIsDragging(true);

    // Use the zoom at drag-start for consistent pixel-to-coordinate mapping
    const startZoom = dragStartRef.current.zoom;
    const scale = Math.pow(2, startZoom) * TILE_SIZE;
    if (scale === 0 || !isFinite(scale)) return;

    // Longitude: linear in Mercator
    const dLng = -(dx / scale) * 360;

    // Latitude: use Mercator tile-Y space at drag-start zoom
    const startTileY = latToTileY(dragStartRef.current.lat, startZoom);
    const newTileY = startTileY - dy / TILE_SIZE;
    const newLat = tileYToLat(newTileY, startZoom);

    if (!isFinite(newLat) || !isFinite(dLng)) return;

    setTransform(t => ({
      ...t,
      centerLat: Math.max(-85.051129, Math.min(85.051129, newLat)),
      centerLng: clampLng(dragStartRef.current!.lng + dLng),
    }));
  }, [setTransform]);

  const onPointerUp = useCallback((_e: React.PointerEvent) => {
    dragStartRef.current = null;
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  const onPointerLeave = useCallback((_e: React.PointerEvent) => {
    if (dragStartRef.current) {
      dragStartRef.current = null;
      setTimeout(() => setIsDragging(false), 50);
    }
  }, []);

  return {
    transform,
    setTransform,
    isDragging,
    containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    zoomIn,
    zoomOut,
    reset,
    isAtMaxZoom: transform.zoom >= MAX_ZOOM,
    isAtMinZoom: transform.zoom <= MIN_ZOOM,
  };
}
