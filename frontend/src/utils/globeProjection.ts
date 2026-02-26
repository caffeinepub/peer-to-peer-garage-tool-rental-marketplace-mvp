import * as THREE from 'three';

/**
 * Convert latitude and longitude to a 3D vector position on a sphere
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default 1)
 * @returns THREE.Vector3 position on sphere surface
 */
export function latLonToVector3(lat: number, lon: number, radius: number = 1): THREE.Vector3 {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  // Spherical to Cartesian coordinates
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Validate geographic coordinates
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @returns true if coordinates are valid
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Parse coordinate string to number
 * @param coord Coordinate string
 * @returns Parsed number or null if invalid
 */
export function parseCoordinate(coord: string): number | null {
  const parsed = parseFloat(coord);
  return isNaN(parsed) ? null : parsed;
}
