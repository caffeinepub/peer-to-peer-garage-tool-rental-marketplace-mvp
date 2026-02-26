import { useRef, useState, useCallback, useEffect, WheelEvent, PointerEvent } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import { useMapTiles, latLngToPixel, latLngToTile, tileToLatLng } from '../../hooks/useMapTiles';
import CustomMarker from './CustomMarker';
import type { CommunityMapProfile } from '../../backend';

const TILE_SIZE = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 18;
const DEFAULT_LAT = 20;
const DEFAULT_LNG = 0;
const DEFAULT_ZOOM = 2;

interface CustomMapViewProps {
  members: CommunityMapProfile[];
  selectedMemberId: string | null;
  onMemberSelect: (memberId: string | null) => void;
}

export default function CustomMapView({ members, selectedMemberId, onMemberSelect }: CustomMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Map state: center lat/lng and integer zoom level
  const [centerLat, setCenterLat] = useState(DEFAULT_LAT);
  const [centerLng, setCenterLng] = useState(DEFAULT_LNG);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Drag state
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; lat: number; lng: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);

  // Measure viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
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

  // Auto-fit to members on first load
  useEffect(() => {
    if (members.length === 0 || viewportSize.width === 0) return;

    const validMembers = members.filter((m) => m.coordinates);
    if (validMembers.length === 0) return;

    if (validMembers.length === 1) {
      const coord = validMembers[0].coordinates!;
      setCenterLat(coord.latitude);
      setCenterLng(coord.longitude);
      setZoom(10);
      return;
    }

    // Compute bounding box
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const m of validMembers) {
      const { latitude: lat, longitude: lng } = m.coordinates!;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    setCenterLat(midLat);
    setCenterLng(midLng);

    // Find best zoom to fit all markers
    let bestZoom = 2;
    for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      const minTile = latLngToTile(minLat, minLng, z);
      const maxTile = latLngToTile(maxLat, maxLng, z);
      const tileSpanX = Math.abs(maxTile.x - minTile.x) * TILE_SIZE;
      const tileSpanY = Math.abs(maxTile.y - minTile.y) * TILE_SIZE;
      if (tileSpanX < viewportSize.width * 0.7 && tileSpanY < viewportSize.height * 0.7) {
        bestZoom = z;
        break;
      }
    }
    setZoom(Math.min(bestZoom, 12));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length, viewportSize.width, viewportSize.height]);

  // Pan to selected member
  useEffect(() => {
    if (!selectedMemberId) return;
    const member = members.find((m) => m.id.toString() === selectedMemberId);
    if (!member?.coordinates) return;
    setCenterLat(member.coordinates.latitude);
    setCenterLng(member.coordinates.longitude);
    setZoom((prev) => Math.max(prev, 8));
  }, [selectedMemberId, members]);

  const tiles = useMapTiles({
    centerLat,
    centerLng,
    zoom,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
    tileSize: TILE_SIZE,
  });

  // Zoom helpers
  const doZoom = useCallback((delta: number, pivotX?: number, pivotY?: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta));
      if (newZoom === prevZoom) return prevZoom;

      // Zoom toward pivot point
      if (pivotX !== undefined && pivotY !== undefined && viewportSize.width > 0) {
        const offsetX = pivotX - viewportSize.width / 2;
        const offsetY = pivotY - viewportSize.height / 2;

        // Current pixel offset of pivot from center
        const scale = Math.pow(2, newZoom - prevZoom);

        // Adjust center so pivot stays fixed
        const newOffsetX = offsetX / scale;
        const newOffsetY = offsetY / scale;
        const shiftX = offsetX - newOffsetX;
        const shiftY = offsetY - newOffsetY;

        setCenterLat((prevLat) => {
          setCenterLng((prevLng) => {
            const { lat: newLat, lng: newLng } = tileToLatLng(
              latLngToTile(prevLat, prevLng, newZoom).x + shiftX / TILE_SIZE,
              latLngToTile(prevLat, prevLng, newZoom).y + shiftY / TILE_SIZE,
              newZoom
            );
            setCenterLat(Math.max(-85, Math.min(85, newLat)));
            setCenterLng(newLng);
            return prevLng;
          });
          return prevLat;
        });
      }

      return newZoom;
    });
  }, [viewportSize]);

  const zoomIn = useCallback(() => doZoom(1), [doZoom]);
  const zoomOut = useCallback(() => doZoom(-1), [doZoom]);

  const resetView = useCallback(() => {
    if (members.length === 0) {
      setCenterLat(DEFAULT_LAT);
      setCenterLng(DEFAULT_LNG);
      setZoom(DEFAULT_ZOOM);
      return;
    }
    const validMembers = members.filter((m) => m.coordinates);
    if (validMembers.length === 0) return;
    if (validMembers.length === 1) {
      const coord = validMembers[0].coordinates!;
      setCenterLat(coord.latitude);
      setCenterLng(coord.longitude);
      setZoom(10);
      return;
    }
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const m of validMembers) {
      const { latitude: lat, longitude: lng } = m.coordinates!;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    setCenterLat((minLat + maxLat) / 2);
    setCenterLng((minLng + maxLng) / 2);
    setZoom(3);
  }, [members]);

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pivotX = e.clientX - rect.left;
    const pivotY = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1 : -1;
    doZoom(delta, pivotX, pivotY);
  }, [doZoom]);

  // Pointer events for drag
  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        lat: centerLat,
        lng: centerLng,
      };
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      pinchStartRef.current = {
        distance: Math.sqrt(dx * dx + dy * dy),
        zoom,
      };
      dragStartRef.current = null;
    }
  }, [centerLat, centerLng, zoom]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDraggedRef.current = true;
      }

      // Convert pixel delta to lat/lng delta
      const scale = TILE_SIZE * Math.pow(2, zoom);
      const dLng = -(dx / scale) * 360;
      const centerTileY = latLngToTile(dragStartRef.current.lat, dragStartRef.current.lng, zoom).y;
      const dTileY = -(dy / TILE_SIZE);
      const newTileY = centerTileY + dTileY;
      const { lat: newLat } = tileToLatLng(0, newTileY, zoom);

      setCenterLat(Math.max(-85, Math.min(85, newLat)));
      setCenterLng(dragStartRef.current.lng + dLng);
    } else if (activePointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = distance / pinchStartRef.current.distance;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchStartRef.current.zoom + Math.log2(scale)));
      setZoom(Math.round(newZoom));
    }
  }, [zoom]);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      pinchStartRef.current = null;
      setTimeout(() => { hasDraggedRef.current = false; }, 50);
    }
  }, []);

  const handleMapClick = useCallback(() => {
    if (hasDraggedRef.current) return;
    onMemberSelect(null);
  }, [onMemberSelect]);

  // Compute marker screen positions
  const markerPositions = members
    .filter((m) => m.coordinates)
    .map((m) => {
      const pixel = latLngToPixel(
        m.coordinates!.latitude,
        m.coordinates!.longitude,
        centerLat,
        centerLng,
        zoom,
        TILE_SIZE
      );
      return {
        profile: m,
        screenX: viewportSize.width / 2 + pixel.x,
        screenY: viewportSize.height / 2 + pixel.y,
      };
    });

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e8e0d8] rounded-lg" ref={containerRef}>
      {/* Tile layer */}
      <div
        className="absolute inset-0"
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleMapClick}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            draggable={false}
            loading="lazy"
            style={{
              position: 'absolute',
              left: viewportSize.width / 2 + tile.x,
              top: viewportSize.height / 2 + tile.y,
              width: TILE_SIZE,
              height: TILE_SIZE,
              imageRendering: 'pixelated',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Markers */}
        {markerPositions.map(({ profile, screenX, screenY }) => (
          <CustomMarker
            key={profile.id.toString()}
            profile={profile}
            screenX={screenX}
            screenY={screenY}
            isSelected={selectedMemberId === profile.id.toString()}
            onClick={() => {
              if (!hasDraggedRef.current) {
                onMemberSelect(
                  selectedMemberId === profile.id.toString() ? null : profile.id.toString()
                );
              }
            }}
          />
        ))}
      </div>

      {/* Zoom controls - Google Maps style */}
      <div className="absolute bottom-8 right-3 z-20 flex flex-col gap-0.5 pointer-events-auto">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-white rounded-t-sm shadow-md flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200 text-gray-700"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-white rounded-b-sm shadow-md flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200 border-t-0 text-gray-700"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Reset/locate button */}
      <div className="absolute bottom-20 right-3 z-20 pointer-events-auto">
        <button
          onClick={resetView}
          className="w-8 h-8 bg-white rounded-sm shadow-md flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200 text-gray-700"
          aria-label="Reset view"
          title="Fit all members"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 z-20 pointer-events-none">
        <span className="text-[10px] bg-white/80 text-gray-600 px-1.5 py-0.5 rounded-tl-sm">
          © <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto hover:underline"
          >
            OpenStreetMap
          </a> contributors
        </span>
      </div>
    </div>
  );
}
