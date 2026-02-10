/**
 * Utility functions for converting geographic coordinates to screen positions
 * using equirectangular projection (simple cylindrical projection)
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface ScreenPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

/**
 * Validates if coordinates are within valid ranges
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function isValidCoordinates(coords: GeoCoordinates | null | undefined): boolean {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

/**
 * Converts geographic coordinates to screen position percentages
 * using equirectangular projection
 * 
 * @param coords - Geographic coordinates (latitude, longitude)
 * @returns Screen position as percentages (x: 0-100, y: 0-100)
 */
export function geoToScreen(coords: GeoCoordinates): ScreenPosition {
  // Clamp values to valid ranges
  const lat = Math.max(-90, Math.min(90, coords.latitude));
  const lon = Math.max(-180, Math.min(180, coords.longitude));

  // Convert longitude (-180 to 180) to x percentage (0 to 100)
  const x = ((lon + 180) / 360) * 100;

  // Convert latitude (90 to -90) to y percentage (0 to 100)
  // Note: latitude 90 (north) maps to y=0 (top), latitude -90 (south) maps to y=100 (bottom)
  const y = ((90 - lat) / 180) * 100;

  return { x, y };
}

/**
 * Parses coordinate string input and validates
 * Accepts formats like "40.7128" or "40.7128, -74.0060"
 */
export function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return null;
  
  return parsed;
}
