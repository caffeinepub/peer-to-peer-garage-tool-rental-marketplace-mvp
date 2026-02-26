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

function latToTileY(lat: number, zoom: number): number {
  const clampedLat = Math.max(-85.051129, Math.min(85.051129, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const cosVal = Math.cos(latRad);
  if (cosVal === 0) return Math.pow(2, zoom) / 2;
  const logArg = Math.tan(latRad) + 1 / cosVal;
  if (logArg <= 0) return Math.pow(2, zoom) / 2;
  const result = (1 - Math.log(logArg) / Math.PI) / 2 * Math.pow(2, zoom);
  return isFinite(result) ? result : Math.pow(2, zoom) / 2;
}

function tileYToLat(y: number, zoom: number): number {
  const maxTile = Math.pow(2, zoom);
  const clampedY = Math.max(0, Math.min(maxTile, y));
  const n = Math.PI - (2 * Math.PI * clampedY) / maxTile;
  const result = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return isFinite(result) ? Math.max(-85.051129, Math.min(85.051129, result)) : 0;
}

function sanitizeTransform(t: MapTransform): MapTransform {
  return {
    centerLat: isFinite(t.centerLat) ? Math.max(-85.051129, Math.min(85.051129, t.centerLat)) : 0,
    centerLng: isFinite(t.centerLng) ? ((((t.centerLng + 180) % 360) + 360) % 360) - 180 : 0,
    zoom: isFinite(t.zoom) ? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(t.zoom))) : MIN_ZOOM,
  };
}

export function useMapTransform(initialTransform: MapTransform): UseMapTransformReturn {
  const [transform, setTransformRaw] = useState<MapTransform>(() => sanitizeTransform(initialTransform));
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Wrap setTransform to always sanitize output
  const setTransform: React.Dispatch<React.SetStateAction<MapTransform>> = useCallback((action) => {
    setTransformRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      return sanitizeTransform(next);
    });
  }, []);

  const zoomIn = useCallback(() => {
    setTransform(t => ({ ...t, zoom: Math.min(MAX_ZOOM, Math.round(t.zoom) + 1) }));
  }, [setTransform]);

  const zoomOut = useCallback(() => {
    setTransform(t => ({ ...t, zoom: Math.max(MIN_ZOOM, Math.round(t.zoom) - 1) }));
  }, [setTransform]);

  const reset = useCallback((lat: number, lng: number, zoom: number) => {
    setTransform({ centerLat: lat, centerLng: lng, zoom });
  }, [setTransform]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: transform.centerLat,
      lng: transform.centerLng,
    };
    hasDraggedRef.current = false;
    setIsDragging(false);
  }, [transform.centerLat, transform.centerLng]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (!hasDraggedRef.current && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
    hasDraggedRef.current = true;
    setIsDragging(true);

    setTransform(t => {
      const z = t.zoom;
      const scale = Math.pow(2, z) * TILE_SIZE;
      if (scale === 0 || !isFinite(scale)) return t;

      // Convert drag delta from pixels to longitude degrees
      const dLng = -(dx / scale) * 360;

      // For latitude, use Mercator projection
      const startTileY = latToTileY(dragStartRef.current!.lat, z);
      const newTileY = startTileY - dy / TILE_SIZE;
      const newLat = tileYToLat(newTileY, z);

      if (!isFinite(newLat) || !isFinite(dLng)) return t;

      return {
        ...t,
        centerLat: Math.max(-85.051129, Math.min(85.051129, newLat)),
        centerLng: dragStartRef.current!.lng + dLng,
      };
    });
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
