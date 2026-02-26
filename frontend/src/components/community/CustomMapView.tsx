import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CommunityMapProfile } from '../../backend';
import { useMapTiles } from '../../hooks/useMapTiles';
import { useMapTransform } from '../../hooks/useMapTransform';
import CustomMarker from './CustomMarker';
import { ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomMapViewProps {
  members: CommunityMapProfile[];
  selectedMemberId?: string;
  onMemberSelect?: (id: string) => void;
}

const DEFAULT_CENTER = { lat: 30, lng: 0 };
const DEFAULT_ZOOM = 2;
const MIN_ZOOM = 2;
const MAX_ZOOM = 19;
const TILE_SIZE = 256;

function getBoundsCenter(members: CommunityMapProfile[]): { lat: number; lng: number; zoom: number } {
  const withCoords = members.filter(m => m.coordinates);
  if (withCoords.length === 0) return { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, zoom: DEFAULT_ZOOM };

  if (withCoords.length === 1) {
    return {
      lat: withCoords[0].coordinates!.latitude,
      lng: withCoords[0].coordinates!.longitude,
      zoom: 10,
    };
  }

  const lats = withCoords.map(m => m.coordinates!.latitude);
  const lngs = withCoords.map(m => m.coordinates!.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;
  const span = Math.max(latSpan, lngSpan);

  let zoom = DEFAULT_ZOOM;
  if (span < 1) zoom = 10;
  else if (span < 5) zoom = 7;
  else if (span < 20) zoom = 5;
  else if (span < 60) zoom = 4;
  else if (span < 120) zoom = 3;
  else zoom = 2;

  return { lat: centerLat, lng: centerLng, zoom };
}

/** Safe Web Mercator lat → fractional tile Y */
function latToTileYSafe(lat: number, zoom: number): number {
  const clamped = Math.max(-85.051129, Math.min(85.051129, lat));
  const latRad = (clamped * Math.PI) / 180;
  const cosVal = Math.cos(latRad);
  if (cosVal === 0) return Math.pow(2, zoom) / 2;
  const logArg = Math.tan(latRad) + 1 / cosVal;
  if (logArg <= 0) return Math.pow(2, zoom) / 2;
  const result = (1 - Math.log(logArg) / Math.PI) / 2 * Math.pow(2, zoom);
  return isFinite(result) ? result : Math.pow(2, zoom) / 2;
}

/** Safe tile Y → lat */
function tileYToLatSafe(y: number, zoom: number): number {
  const maxTile = Math.pow(2, zoom);
  const clampedY = Math.max(0, Math.min(maxTile, y));
  const n = Math.PI - (2 * Math.PI * clampedY) / maxTile;
  const result = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return isFinite(result) ? Math.max(-85.051129, Math.min(85.051129, result)) : 0;
}

export default function CustomMapView({ members, selectedMemberId, onMemberSelect }: CustomMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  // Keep a ref to viewport size so the wheel handler always reads the latest value
  // without needing to re-register the event listener on every resize
  const viewportSizeRef = useRef({ width: 0, height: 0 });
  const [hasAutoFit, setHasAutoFit] = useState(false);

  const initialBounds = getBoundsCenter(members);
  const {
    transform,
    setTransform,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    zoomIn,
    zoomOut,
    reset,
    isAtMaxZoom,
    isAtMinZoom,
  } = useMapTransform({
    centerLat: initialBounds.lat,
    centerLng: initialBounds.lng,
    zoom: initialBounds.zoom,
  });

  // Measure viewport and keep ref in sync
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const size = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        viewportSizeRef.current = size;
        setViewportSize(size);
      }
    });
    ro.observe(el);
    const initial = { width: el.clientWidth, height: el.clientHeight };
    viewportSizeRef.current = initial;
    setViewportSize(initial);
    return () => ro.disconnect();
  }, []);

  // Auto-fit to members once data is available
  useEffect(() => {
    if (hasAutoFit || members.length === 0) return;
    const bounds = getBoundsCenter(members);
    reset(bounds.lat, bounds.lng, bounds.zoom);
    setHasAutoFit(true);
  }, [members, hasAutoFit, reset]);

  // Wheel zoom — register once on mount; read viewport size from ref to avoid stale closures
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { width: vpW, height: vpH } = viewportSizeRef.current;
      if (vpW === 0 || vpH === 0) return;

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform(t => {
        // Determine zoom delta — clamp to integer steps for reliability
        const delta = e.deltaY > 0 ? -1 : 1;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(t.zoom) + delta));
        if (newZoom === Math.round(t.zoom)) return t;

        const zoomFactor = Math.pow(2, newZoom - t.zoom);
        if (!isFinite(zoomFactor) || zoomFactor === 0) return { ...t, zoom: newZoom };

        const vpCX = vpW / 2;
        const vpCY = vpH / 2;

        // Vector from viewport center to mouse cursor in pixels
        const dx = mouseX - vpCX;
        const dy = mouseY - vpCY;

        // Current scale: pixels per degree-longitude-equivalent
        const scale = Math.pow(2, t.zoom) * TILE_SIZE;
        if (!isFinite(scale) || scale === 0) return { ...t, zoom: newZoom };

        // Shift fraction: how much of the offset to absorb into the new center
        const shiftFraction = 1 - 1 / zoomFactor;

        // Longitude shift (linear in Mercator)
        const dLng = (dx / scale) * 360;
        const newCenterLng = t.centerLng + dLng * shiftFraction;

        // Latitude shift (non-linear — work in tile-Y space)
        const centerTileY = latToTileYSafe(t.centerLat, t.zoom);
        const newCenterTileY = centerTileY + (dy / TILE_SIZE) * shiftFraction;
        const newCenterLat = tileYToLatSafe(newCenterTileY, t.zoom);

        if (!isFinite(newCenterLat) || !isFinite(newCenterLng)) {
          return { ...t, zoom: newZoom };
        }

        return {
          centerLat: Math.max(-85.051129, Math.min(85.051129, newCenterLat)),
          centerLng: newCenterLng,
          zoom: newZoom,
        };
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTransform]); // setTransform is stable; viewportSize is read from ref

  const { tiles, latLngToPixel } = useMapTiles(
    transform.centerLat,
    transform.centerLng,
    transform.zoom,
    viewportSize.width,
    viewportSize.height
  );

  const handleResetView = useCallback(() => {
    const bounds = getBoundsCenter(members);
    reset(bounds.lat, bounds.lng, bounds.zoom);
  }, [members, reset]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted rounded-lg" ref={mapContainerRef}>
      {/* Tile layer */}
      <div
        className="absolute inset-0"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        {tiles.map(tile => (
          <img
            key={`${tile.z}-${tile.x}-${tile.y}`}
            src={tile.url}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: tile.pixelX,
              top: tile.pixelY,
              width: TILE_SIZE,
              height: TILE_SIZE,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}

        {/* Member markers */}
        {members.map(member => {
          if (!member.coordinates) return null;
          const pixel = latLngToPixel(
            member.coordinates.latitude,
            member.coordinates.longitude
          );
          const { x, y } = pixel;

          // Guard against NaN/Infinity pixel positions
          if (!isFinite(x) || !isFinite(y)) return null;

          // Only render if within viewport bounds (with some padding)
          if (
            x < -50 || x > viewportSize.width + 50 ||
            y < -50 || y > viewportSize.height + 50
          ) return null;

          return (
            <CustomMarker
              key={member.id.toString()}
              member={member}
              x={x}
              y={y}
              isSelected={selectedMemberId === member.id.toString()}
              isCurrentUser={member.isCurrentUser}
              onClick={() => onMemberSelect?.(member.id.toString())}
            />
          );
        })}
      </div>

      {/* Map controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background shadow-md"
          onClick={zoomIn}
          disabled={isAtMaxZoom}
          title={isAtMaxZoom ? 'Maximum zoom reached' : 'Zoom in'}
          aria-label={isAtMaxZoom ? 'Maximum zoom reached' : 'Zoom in'}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background shadow-md"
          onClick={zoomOut}
          disabled={isAtMinZoom}
          title={isAtMinZoom ? 'Minimum zoom reached' : 'Zoom out'}
          aria-label={isAtMinZoom ? 'Minimum zoom reached' : 'Zoom out'}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background shadow-md"
          onClick={handleResetView}
          title="Reset view"
          aria-label="Reset view"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 z-10 text-[10px] text-muted-foreground bg-background/80 px-1 rounded">
        © <a href="https://carto.com/" target="_blank" rel="noopener noreferrer" className="underline">CARTO</a>{' '}
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>

      {/* Loading placeholder when no tiles yet */}
      {tiles.length === 0 && viewportSize.width > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-muted-foreground text-sm">Loading map…</div>
        </div>
      )}
    </div>
  );
}
