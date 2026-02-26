import { useMemo } from 'react';

export interface TileInfo {
  key: string;
  url: string;
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  tileZ: number;
}

export interface UseMapTilesOptions {
  centerLat: number;
  centerLng: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  tileSize?: number;
}

/** Convert lat/lng to tile coordinates at a given zoom level */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

/** Convert tile coordinates to lat/lng */
export function tileToLatLng(tileX: number, tileY: number, zoom: number): { lat: number; lng: number } {
  const n = Math.pow(2, zoom);
  const lng = (tileX / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

/** Convert lat/lng to pixel position relative to the viewport center */
export function latLngToPixel(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  tileSize: number
): { x: number; y: number } {
  const centerTile = latLngToTile(centerLat, centerLng, zoom);
  const pointTile = latLngToTile(lat, lng, zoom);
  return {
    x: (pointTile.x - centerTile.x) * tileSize,
    y: (pointTile.y - centerTile.y) * tileSize,
  };
}

/** Convert pixel offset from center to lat/lng */
export function pixelToLatLng(
  pixelX: number,
  pixelY: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  tileSize: number
): { lat: number; lng: number } {
  const centerTile = latLngToTile(centerLat, centerLng, zoom);
  const tileX = centerTile.x + pixelX / tileSize;
  const tileY = centerTile.y + pixelY / tileSize;
  return tileToLatLng(tileX, tileY, zoom);
}

/** Wrap tile X coordinate to valid range */
function wrapTileX(x: number, zoom: number): number {
  const n = Math.pow(2, zoom);
  return ((x % n) + n) % n;
}

export function useMapTiles({
  centerLat,
  centerLng,
  zoom,
  viewportWidth,
  viewportHeight,
  tileSize = 256,
}: UseMapTilesOptions): TileInfo[] {
  return useMemo(() => {
    if (viewportWidth === 0 || viewportHeight === 0) return [];

    const clampedZoom = Math.max(0, Math.min(19, Math.round(zoom)));
    const centerTile = latLngToTile(centerLat, centerLng, clampedZoom);

    // How many tiles fit in each direction from center
    const halfW = Math.ceil(viewportWidth / tileSize / 2) + 1;
    const halfH = Math.ceil(viewportHeight / tileSize / 2) + 1;

    const tiles: TileInfo[] = [];
    const maxTileY = Math.pow(2, clampedZoom) - 1;

    for (let dy = -halfH; dy <= halfH; dy++) {
      for (let dx = -halfW; dx <= halfW; dx++) {
        const tileX = Math.floor(centerTile.x) + dx;
        const tileY = Math.floor(centerTile.y) + dy;

        // Skip tiles outside valid Y range
        if (tileY < 0 || tileY > maxTileY) continue;

        const wrappedX = wrapTileX(tileX, clampedZoom);

        // Pixel offset from viewport center
        const pixelX = (tileX - centerTile.x) * tileSize;
        const pixelY = (tileY - centerTile.y) * tileSize;

        tiles.push({
          key: `${clampedZoom}-${tileX}-${tileY}`,
          url: `https://tile.openstreetmap.org/${clampedZoom}/${wrappedX}/${tileY}.png`,
          x: pixelX,
          y: pixelY,
          tileX,
          tileY,
          tileZ: clampedZoom,
        });
      }
    }

    return tiles;
  }, [centerLat, centerLng, zoom, viewportWidth, viewportHeight, tileSize]);
}
