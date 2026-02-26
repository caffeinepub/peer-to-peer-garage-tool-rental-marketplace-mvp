import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CommunityMapProfile } from '../../backend';
import { useMapTiles, latToTileY, lngToTileX } from '../../hooks/useMapTiles';
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

/**
 * Compute the new map center after a cursor-anchored zoom.
 *
 * The invariant: the geographic point under the cursor must remain at the
 * same screen pixel after the zoom.
 *
 * Strategy (all math in tile-coordinate space):
 *   1. Find the cursor's tile position at the OLD zoom.
 *   2. The cursor's tile position at the NEW zoom = cursorTile * 2^(newZoom-oldZoom).
 *   3. New center tile = cursorTile_new - (cursorOffset_pixels / TILE_SIZE).
 *   4. Convert new center tile back to lat/lng.
 */
function computeZoomedCenter(
  centerLat: number,
  centerLng: number,
  oldZoom: number,
  newZoom: number,
  cursorOffsetX: number, // pixels from viewport center
  cursorOffsetY: number,
): { lat: number; lng: number } {
  if (oldZoom === newZoom) return { lat: centerLat, lng: centerLng };

  const oldScale = Math.pow(2, oldZoom);
  const newScale = Math.pow(2, newZoom);

  if (!isFinite(oldScale) || !isFinite(newScale) || oldScale === 0) {
    return { lat: centerLat, lng: centerLng };
  }

  // Center tile coordinates at old zoom
  const centerTileX_old = lngToTileX(centerLng, oldZoom);
  const centerTileY_old = latToTileY(centerLat, oldZoom);

  // Cursor tile coordinates at old zoom
  const cursorTileX_old = centerTileX_old + cursorOffsetX / TILE_SIZE;
  const cursorTileY_old = centerTileY_old + cursorOffsetY / TILE_SIZE;

  // Scale factor between old and new zoom
  const zoomRatio = newScale / oldScale; // 2 for zoom-in, 0.5 for zoom-out

  // Cursor tile coordinates at new zoom
  const cursorTileX_new = cursorTileX_old * zoomRatio;
  const cursorTileY_new = cursorTileY_old * zoomRatio;

  // New center tile at new zoom: cursor stays at same pixel offset from center
  const newCenterTileX = cursorTileX_new - cursorOffsetX / TILE_SIZE;
  const newCenterTileY = cursorTileY_new - cursorOffsetY / TILE_SIZE;

  if (!isFinite(newCenterTileX) || !isFinite(newCenterTileY)) {
    return { lat: centerLat, lng: centerLng };
  }

  // Convert tile X back to longitude
  const maxTile = newScale;
  const newCenterLng = (newCenterTileX / maxTile) * 360 - 180;

  // Convert tile Y back to latitude (inverse Mercator)
  const clampedTileY = Math.max(0, Math.min(maxTile, newCenterTileY));
  const n = Math.PI - (2 * Math.PI * clampedTileY) / maxTile;
  const newCenterLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  if (!isFinite(newCenterLat) || !isFinite(newCenterLng)) {
    return { lat: centerLat, lng: centerLng };
  }

  return {
    lat: Math.max(-85.051129, Math.min(85.051129, newCenterLat)),
    lng: Math.max(-180, Math.min(180, newCenterLng)),
  };
}

export default function CustomMapView({ members, selectedMemberId, onMemberSelect }: CustomMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  // Keep a ref to viewport size so the wheel handler always reads the latest value
  // without needing to re-register the event listener on every resize
  const viewportSizeRef = useRef({ width: 0, height: 0 });
  // Keep a ref to the latest transform so the wheel handler can read it without
  // being re-registered on every transform change
  const transformRef = useRef({ centerLat: DEFAULT_CENTER.lat, centerLng: DEFAULT_CENTER.lng, zoom: DEFAULT_ZOOM });
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

  // Keep transformRef in sync with the latest transform state
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

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

  // Wheel zoom — registered once on mount.
  // Reads viewport size and current transform from refs to avoid stale closures.
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { width: vpW, height: vpH } = viewportSizeRef.current;
      if (vpW === 0 || vpH === 0) return;

      // Read the latest transform from the ref (avoids stale closure)
      const t = transformRef.current;

      const delta = e.deltaY > 0 ? -1 : 1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, t.zoom + delta));
      if (newZoom === t.zoom) return;

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Cursor offset from viewport center
      const cursorOffsetX = mouseX - vpW / 2;
      const cursorOffsetY = mouseY - vpH / 2;

      const newCenter = computeZoomedCenter(
        t.centerLat,
        t.centerLng,
        t.zoom,
        newZoom,
        cursorOffsetX,
        cursorOffsetY,
      );

      setTransform({
        centerLat: newCenter.lat,
        centerLng: newCenter.lng,
        zoom: newZoom,
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTransform]); // setTransform is stable; transform and viewport are read from refs

  // Expose current transform values as data attributes so the drag handler
  // (which is memoized without transform in its deps) can read them at pointer-down time
  const dragDataProps = {
    'data-lat': transform.centerLat.toString(),
    'data-lng': transform.centerLng.toString(),
    'data-zoom': transform.zoom.toString(),
  };

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
        {...dragDataProps}
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
            x < -60 || x > viewportSize.width + 60 ||
            y < -60 || y > viewportSize.height + 60
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
