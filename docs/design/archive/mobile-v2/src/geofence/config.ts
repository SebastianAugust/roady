import { RADIUS_NOTIFIKASI_M } from '../config';
import type { KategoriRisiko } from '../types';

/** Distance from a zone centroid (meters) at which the early warning fires. Inclusive: exactly this far counts as inside. */
export const GEOFENCE_RADIUS_M = RADIUS_NOTIFIKASI_M;

/** A zone that already triggered a warning stays quiet for this many minutes, even if the user leaves and comes back. */
export const GEOFENCE_COOLDOWN_MIN = 10;

// ponytail: the team has not decided which categories warn (docs/05). Green is low risk, so only yellow and red do for now.
export const GEOFENCE_NOTIFY_CATEGORIES: readonly KategoriRisiko[] = ['merah', 'kuning'];

export interface GeofenceOptions {
  radiusM: number;
  cooldownMin: number;
  categories: readonly KategoriRisiko[];
}

export const DEFAULT_GEOFENCE_OPTIONS: GeofenceOptions = {
  radiusM: GEOFENCE_RADIUS_M,
  cooldownMin: GEOFENCE_COOLDOWN_MIN,
  categories: GEOFENCE_NOTIFY_CATEGORIES,
};
