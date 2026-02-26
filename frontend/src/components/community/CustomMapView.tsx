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

export default function CustomMapView({ members, selectedMemberId, onMemberSelect }: CustomMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
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

  // Measure viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Auto-fit to members once data is available
  useEffect(() => {
    if (hasAutoFit || members.length === 0) return;
    const bounds = getBoundsCenter(members);
    reset(bounds.lat, bounds.lng, bounds.zoom);
    setHasAutoFit(true);
  }, [members, hasAutoFit, reset]);

  // Wheel zoom with native listener (passive: false required for preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Guard: viewport must be valid
      if (viewportSize.width === 0 || viewportSize.height === 0) return;

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform(t => {
        const delta = e.deltaY > 0 ? -1 : 1;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, t.zoom + delta * 0.5));
        if (newZoom === t.zoom) return t;

        const zoomFactor = Math.pow(2, newZoom - t.zoom);
        if (!isFinite(zoomFactor) || zoomFactor === 0) return t;

        const vpCX = viewportSize.width / 2;
        const vpCY = viewportSize.height / 2;

        // Vector from viewport center to mouse in pixels
        const dx = mouseX - vpCX;
        const dy = mouseY - vpCY;

        const TILE_SIZE = 256;
        const scale = Math.pow(2, t.zoom) * TILE_SIZE;
        if (!isFinite(scale) || scale === 0) return { ...t, zoom: newZoom };

        const dLng = (dx / scale) * 360;

        // Shift center by (1 - 1/zoomFactor) * offset
        const shiftFraction = 1 - 1 / zoomFactor;
        const newCenterLng = t.centerLng + dLng * shiftFraction;

        // For latitude, work in tile-Y space to keep Mercator correct
        const latRad = (Math.max(-85.051129, Math.min(85.051129, t.centerLat)) * Math.PI) / 180;
        const cosVal = Math.cos(latRad);
        if (cosVal === 0) return { ...t, zoom: newZoom };
        const logArg = Math.tan(latRad) + 1 / cosVal;
        if (logArg <= 0) return { ...t, zoom: newZoom };

        const centerTileY = (1 - Math.log(logArg) / Math.PI) / 2 * Math.pow(2, t.zoom);
        const newCenterTileY = centerTileY + (dy / TILE_SIZE) * shiftFraction;

        // Convert back to lat
        const maxTile = Math.pow(2, t.zoom);
        const clampedTileY = Math.max(0, Math.min(maxTile, newCenterTileY));
        const n = Math.PI - (2 * Math.PI * clampedTileY) / maxTile;
        const newCenterLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

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
  }, [viewportSize, setTransform]);

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
    <div className="relative w-full h-full overflow-hidden bg-muted rounded-lg" ref={containerRef}>
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
              width: 256,
              height: 256,
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
      {tiles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading map…</div>
        </div>
      )}
    </div>
  );
}
