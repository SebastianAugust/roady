import type { KategoriRisiko, Zona } from '../types';
import { Coordinate, haversineMeters, isValidCoordinate } from './distance';

/** The part of a zone the geofence needs; a full `Zona` fits. */
export type GeofenceZone = Pick<Zona, 'zona_id' | 'center_latitude' | 'center_longitude' | 'kategori_risiko'>;

export interface NearbyZone<Z extends GeofenceZone = GeofenceZone> {
  zone: Z;
  distanceM: number;
}

const SEVERITY: Record<KategoriRisiko, number> = { merah: 3, kuning: 2, hijau: 1 };

/** Most severe first, then closest. */
export const bySeverityThenDistance = (a: NearbyZone, b: NearbyZone) =>
  SEVERITY[b.zone.kategori_risiko] - SEVERITY[a.zone.kategori_risiko] || a.distanceM - b.distanceM;

/**
 * Zones whose centroid is within `radiusM` of `position` (inclusive), closest first.
 * An invalid position gives an empty list; zones with invalid coordinates are skipped.
 */
export function findZonesWithin<Z extends GeofenceZone>(position: Coordinate, zones: readonly Z[], radiusM: number): NearbyZone<Z>[] {
  if (!isValidCoordinate(position)) return [];
  const hits: NearbyZone<Z>[] = [];
  for (const zone of zones) {
    const distanceM = haversineMeters(position, { latitude: zone.center_latitude, longitude: zone.center_longitude });
    if (distanceM <= radiusM) hits.push({ zone, distanceM });
  }
  return hits.sort((a, b) => a.distanceM - b.distanceM);
}
