import { useMemo } from 'react';

const TILE_SIZE = 256;
const MAX_ZOOM_LEVEL = 19;

/** Web Mercator: lat → fractional tile Y at given integer zoom */
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

/** Web Mercator: lng → fractional tile X at given integer zoom */
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

// Use CartoDB Voyager tiles — CORS-friendly, no API key, supports zoom 0–19
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

    // Clamp zoom to safe integer range [0, MAX_ZOOM_LEVEL]
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

    // Integer tile index of the center tile
    const centerTileXInt = Math.floor(centerTileX);
    const centerTileYInt = Math.floor(centerTileY);

    // Sub-tile pixel offset of the center point within its tile
    const centerSubPixelX = (centerTileX - centerTileXInt) * TILE_SIZE;
    const centerSubPixelY = (centerTileY - centerTileYInt) * TILE_SIZE;

    // How many tiles we need to cover the viewport (add extra buffer)
    const tilesX = Math.ceil(viewportWidth / TILE_SIZE) + 3;
    const tilesY = Math.ceil(viewportHeight / TILE_SIZE) + 3;

    const halfTilesX = Math.floor(tilesX / 2);
    const halfTilesY = Math.floor(tilesY / 2);

    const startTileX = centerTileXInt - halfTilesX;
    const startTileY = centerTileYInt - halfTilesY;

    // Pixel position of the top-left corner of the start tile relative to viewport
    // The center tile's top-left is at: (vpW/2 - centerSubPixelX, vpH/2 - centerSubPixelY)
    // The start tile is halfTilesX tiles to the left and halfTilesY tiles above
    const startPixelX = viewportWidth / 2 - centerSubPixelX - halfTilesX * TILE_SIZE;
    const startPixelY = viewportHeight / 2 - centerSubPixelY - halfTilesY * TILE_SIZE;

    const maxTile = Math.pow(2, z); // always a power of 2 since z is integer
    const tiles: MapTile[] = [];

    for (let dy = 0; dy < tilesY; dy++) {
      for (let dx = 0; dx < tilesX; dx++) {
        const tileX = startTileX + dx;
        const tileY = startTileY + dy;

        // Skip tiles outside valid Y range (poles)
        if (tileY < 0 || tileY >= maxTile) continue;

        // Wrap X tiles (longitude wraps around the globe)
        const wrappedX = ((tileX % maxTile) + maxTile) % maxTile;

        // Ensure tile coordinates are valid integers in range
        const intX = Math.floor(wrappedX);
        const intY = Math.floor(tileY);
        if (intX < 0 || intX >= maxTile || intY < 0 || intY >= maxTile) continue;

        const pixelX = startPixelX + dx * TILE_SIZE;
        const pixelY = startPixelY + dy * TILE_SIZE;

        // Guard against non-finite pixel positions
        if (!isFinite(pixelX) || !isFinite(pixelY)) continue;

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

    /**
     * Convert a lat/lng to a pixel position within the viewport.
     * Uses the same tile coordinate system as the tile layout above.
     */
    const latLngToPixel = (lat: number, lng: number): { x: number; y: number } => {
      const safeLat = Math.max(-85.051129, Math.min(85.051129, isFinite(lat) ? lat : 0));
      const safeLng = Math.max(-180, Math.min(180, isFinite(lng) ? lng : 0));

      const tileX = lngToTileX(safeLng, z);
      const tileY = latToTileY(safeLat, z);

      if (!isFinite(tileX) || !isFinite(tileY)) {
        return { x: -9999, y: -9999 };
      }

      // Pixel offset from center tile's top-left corner
      // = (marker tile position - center tile position) * TILE_SIZE
      // Then offset by the sub-pixel position of the center within its tile
      const x = viewportWidth / 2 - centerSubPixelX + (tileX - centerTileXInt) * TILE_SIZE;
      const y = viewportHeight / 2 - centerSubPixelY + (tileY - centerTileYInt) * TILE_SIZE;

      if (!isFinite(x) || !isFinite(y)) {
        return { x: -9999, y: -9999 };
      }

      return { x, y };
    };

    return { tiles, latLngToPixel };
  }, [centerLat, centerLng, zoom, viewportWidth, viewportHeight]);
}
