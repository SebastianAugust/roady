export interface Coordinate {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_M = 6371000;
const RAD = Math.PI / 180;

/** True for finite numbers inside the WGS84 range. GPS glitches and bad API data show up as NaN, null-ish or out-of-range values. */
export function isValidCoordinate(c: Partial<Coordinate> | null | undefined): c is Coordinate {
  return (
    c != null &&
    typeof c.latitude === 'number' &&
    typeof c.longitude === 'number' &&
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.latitude) <= 90 &&
    Math.abs(c.longitude) <= 180
  );
}

/** Great-circle distance in meters. Returns NaN when either coordinate is invalid, so callers cannot mistake bad input for "nearby". */
export function haversineMeters(a: Coordinate, b: Coordinate): number {
  if (!isValidCoordinate(a) || !isValidCoordinate(b)) return NaN;
  const h =
    Math.sin(((b.latitude - a.latitude) * RAD) / 2) ** 2 +
    Math.cos(a.latitude * RAD) * Math.cos(b.latitude * RAD) * Math.sin(((b.longitude - a.longitude) * RAD) / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
