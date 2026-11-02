import { haversineMeters, type Coordinate } from '../geofence/distance';
import type { Zona } from '../types';

/** Zone area style (same as the web map): fill 30%, outline 2 dp in the risk colour. */
export const AREA_FILL_ALPHA = 0.3;
export const AREA_STROKE_WIDTH = 2;
/** A zone whose real radius is smaller than this many dp on screen is drawn at this size, so it stays visible at a far zoom. */
export const MIN_VISIBLE_DP = 9;
/** A tap within this many dp of a zone's edge still selects it (a finger is far wider than a 300 m circle at a far zoom). */
export const HIT_TOLERANCE_DP = 22;

const METERS_PER_DEGREE = 111_320;

/** '#RRGGBB' + alpha -> 'rgba(r, g, b, a)'. */
export function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Ground meters under one dp of the map, from the visible latitude span and the map height in dp. 0 until the map has been measured. */
export function metersPerDp(latitudeDelta: number, mapHeightDp: number): number {
  return mapHeightDp > 0 ? (latitudeDelta * METERS_PER_DEGREE) / mapHeightDp : 0;
}

/** The radius a zone is drawn with: its own radius_zona, or the minimum visible size when that would be too small to see. */
export function drawnRadius(radiusZona: number, mpd: number): number {
  return Math.max(radiusZona, MIN_VISIBLE_DP * mpd);
}

/**
 * The zone under a tap, or undefined. A zone is hit when the tap is within its drawn radius plus the finger tolerance;
 * where several are hit (overlapping zones) the one the tap is deepest inside, relative to its size, wins.
 */
export function zoneAtPoint(zones: readonly Zona[], point: Coordinate, mpd: number): Zona | undefined {
  let best: { zone: Zona; score: number } | undefined;
  for (const zone of zones) {
    const reach = drawnRadius(zone.radius_zona, mpd) + HIT_TOLERANCE_DP * mpd;
    const d = haversineMeters(point, { latitude: zone.center_latitude, longitude: zone.center_longitude });
    if (!(d <= reach)) continue; // also false for NaN
    const score = d / reach;
    if (!best || score < best.score) best = { zone, score };
  }
  return best?.zone;
}
