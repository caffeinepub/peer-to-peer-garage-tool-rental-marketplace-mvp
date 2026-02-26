import { useMemo } from 'react';

const TILE_SIZE = 256;
const MAX_ZOOM_LEVEL = 19;

// Web Mercator tile math - with safe clamping
export function latToTileY(lat: number, zoom: number): number {
  const clampedLat = Math.max(-85.051129, Math.min(85.051129, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const cosVal = Math.cos(latRad);
  if (cosVal === 0) return Math.pow(2, zoom) / 2;
  const logArg = Math.tan(latRad) + 1 / cosVal;
  if (logArg <= 0) return Math.pow(2, zoom) / 2;
  const result = (1 - Math.log(logArg) / Math.PI) / 2 * Math.pow(2, zoom);
  return isFinite(result) ? result : Math.pow(2, zoom) / 2;
}

export function lngToTileX(lng: number, zoom: number): number {
  const clampedLng = Math.max(-180, Math.min(180, lng));
  return ((clampedLng + 180) / 360) * Math.pow(2, zoom);
}

export function tileXToLng(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

export function tileYToLat(y: number, zoom: number): number {
  const maxTile = Math.pow(2, zoom);
  const clampedY = Math.max(0, Math.min(maxTile, y));
  const n = Math.PI - (2 * Math.PI * clampedY) / maxTile;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export interface MapTile {
  x: number;
  y: number;
  z: number;
  url: string;
  pixelX: number;
  pixelY: number;
}

export interface UseMapTilesResult {
  tiles: MapTile[];
  /** Convert lat/lng to pixel position within the viewport */
  latLngToPixel: (lat: number, lng: number) => { x: number; y: number };
}

// Use CartoDB Voyager tiles - CORS-friendly, no API key needed, supports zoom up to 19
function getTileUrl(x: number, y: number, z: number): string {
  const subdomains = ['a', 'b', 'c', 'd'];
  const s = subdomains[(x + y) % subdomains.length];
  return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

export function useMapTiles(
  centerLat: number,
  centerLng: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number
): UseMapTilesResult {
  return useMemo(() => {
    if (viewportWidth === 0 || viewportHeight === 0) {
      return {
        tiles: [],
        latLngToPixel: () => ({ x: 0, y: 0 }),
      };
    }

    // Clamp zoom to safe integer range [0, 19]
    const z = Math.max(0, Math.min(MAX_ZOOM_LEVEL, Math.round(zoom)));

    // Clamp center coordinates to valid ranges
    const safeCenterLat = Math.max(-85.051129, Math.min(85.051129, isFinite(centerLat) ? centerLat : 0));
    const safeCenterLng = Math.max(-180, Math.min(180, isFinite(centerLng) ? centerLng : 0));

    // Center tile (fractional)
    const centerTileX = lngToTileX(safeCenterLng, z);
    const centerTileY = latToTileY(safeCenterLat, z);

    // Guard against NaN in tile calculations
    if (!isFinite(centerTileX) || !isFinite(centerTileY)) {
      return {
        tiles: [],
        latLngToPixel: () => ({ x: 0, y: 0 }),
      };
    }

    // Pixel offset of center within its tile
    const centerPixelOffsetX = (centerTileX % 1) * TILE_SIZE;
    const centerPixelOffsetY = (centerTileY % 1) * TILE_SIZE;

    // How many tiles we need to cover the viewport
    const tilesX = Math.ceil(viewportWidth / TILE_SIZE) + 2;
    const tilesY = Math.ceil(viewportHeight / TILE_SIZE) + 2;

    const startTileX = Math.floor(centerTileX) - Math.floor(tilesX / 2);
    const startTileY = Math.floor(centerTileY) - Math.floor(tilesY / 2);

    // Pixel position of the top-left corner of startTile relative to viewport center
    const startPixelX = viewportWidth / 2 - centerPixelOffsetX - Math.floor(tilesX / 2) * TILE_SIZE;
    const startPixelY = viewportHeight / 2 - centerPixelOffsetY - Math.floor(tilesY / 2) * TILE_SIZE;

    const maxTile = Math.pow(2, z); // z is integer, so maxTile is always a power of 2
    const tiles: MapTile[] = [];

    for (let dy = 0; dy < tilesY; dy++) {
      for (let dx = 0; dx < tilesX; dx++) {
        const tileX = startTileX + dx;
        const tileY = startTileY + dy;

        // Wrap X tiles (longitude wraps around)
        const wrappedX = ((tileX % maxTile) + maxTile) % maxTile;

        // Skip tiles outside valid Y range
        if (tileY < 0 || tileY >= maxTile) continue;

        const pixelX = startPixelX + dx * TILE_SIZE;
        const pixelY = startPixelY + dy * TILE_SIZE;

        // Guard against non-finite pixel positions
        if (!isFinite(pixelX) || !isFinite(pixelY)) continue;

        // Ensure tile coordinates are valid integers
        const intX = Math.floor(wrappedX);
        const intY = Math.floor(tileY);
        if (intX < 0 || intX >= maxTile || intY < 0 || intY >= maxTile) continue;

        tiles.push({
          x: intX,
          y: intY,
          z,
          url: getTileUrl(intX, intY, z),
          pixelX,
          pixelY,
        });
      }
    }

    const latLngToPixel = (lat: number, lng: number) => {
      const safeLat = Math.max(-85.051129, Math.min(85.051129, isFinite(lat) ? lat : 0));
      const safeLng = Math.max(-180, Math.min(180, isFinite(lng) ? lng : 0));
      const tileX = lngToTileX(safeLng, z);
      const tileY = latToTileY(safeLat, z);
      if (!isFinite(tileX) || !isFinite(tileY)) {
        return { x: -9999, y: -9999 };
      }
      const x = viewportWidth / 2 + (tileX - centerTileX) * TILE_SIZE;
      const y = viewportHeight / 2 + (tileY - centerTileY) * TILE_SIZE;
      if (!isFinite(x) || !isFinite(y)) {
        return { x: -9999, y: -9999 };
      }
      return { x, y };
    };

    return { tiles, latLngToPixel };
  }, [centerLat, centerLng, zoom, viewportWidth, viewportHeight]);
}
