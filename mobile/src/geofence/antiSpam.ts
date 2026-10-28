import { DEFAULT_GEOFENCE_OPTIONS, GeofenceOptions } from './config';
import { Coordinate, isValidCoordinate } from './distance';
import { bySeverityThenDistance, findZonesWithin, GeofenceZone, NearbyZone } from './nearby';

interface ZoneMemory {
  inside: boolean;
  /** ms epoch of the last warning for this zone. */
  lastNotifiedAt: number | null;
}

/** Per-zone memory between position updates, keyed by zona_id. Treat as immutable; `evaluateGeofence` returns a new one. */
export type GeofenceState = Readonly<Record<number, ZoneMemory>>;

export const EMPTY_GEOFENCE_STATE: GeofenceState = {};

export interface GeofenceResult<Z extends GeofenceZone = GeofenceZone> {
  state: GeofenceState;
  /** Zones that should warn now, most severe then closest first. */
  alerts: NearbyZone<Z>[];
}

/**
 * One position update. A zone warns only on an outside-to-inside transition (the first fix inside counts as one),
 * and only if its category is in `options.categories` and its last warning is at least `options.cooldownMin` minutes old.
 * So staying inside never repeats, and leaving then returning inside the cooldown stays quiet.
 * An invalid position changes nothing: a GPS glitch must neither fake an exit nor a warning.
 * A zone missing from `zones` (e.g. after a refresh) is dropped from the state.
 */
export function evaluateGeofence<Z extends GeofenceZone>(
  state: GeofenceState,
  position: Coordinate,
  zones: readonly Z[],
  now: number,
  options: GeofenceOptions = DEFAULT_GEOFENCE_OPTIONS,
): GeofenceResult<Z> {
  if (!isValidCoordinate(position) || !Number.isFinite(now)) return { state, alerts: [] };

  const insideNow = new Map(findZonesWithin(position, zones, options.radiusM).map((h) => [h.zone.zona_id, h]));
  const cooldownMs = options.cooldownMin * 60_000;
  const next: Record<number, ZoneMemory> = {};
  const alerts: NearbyZone<Z>[] = [];

  for (const { zona_id, kategori_risiko } of zones) {
    const before = state[zona_id];
    const hit = insideNow.get(zona_id);
    let lastNotifiedAt = before?.lastNotifiedAt ?? null;

    const entered = hit !== undefined && !before?.inside;
    const cooledDown = lastNotifiedAt === null || now - lastNotifiedAt >= cooldownMs;
    if (entered && cooledDown && options.categories.includes(kategori_risiko)) {
      alerts.push(hit);
      lastNotifiedAt = now;
    }
    next[zona_id] = { inside: hit !== undefined, lastNotifiedAt };
  }

  return { state: next, alerts: alerts.sort(bySeverityThenDistance) as NearbyZone<Z>[] };
}
