import { useSyncExternalStore } from 'react';
import type { Coordinate } from '../geofence';

// Debug-only fake position for testing the early warning without driving around. Set by GeofenceDebugPanel, which shows in __DEV__ only.
interface DebugLocation {
  /** When set, the geofence uses this instead of the GPS. */
  position: Coordinate | undefined;
  /** Bumped to make the geofence forget which zones already warned. */
  resetCount: number;
}

let current: DebugLocation = { position: undefined, resetCount: 0 };
const listeners = new Set<() => void>();

const update = (next: Partial<DebugLocation>) => {
  current = { ...current, ...next };
  listeners.forEach((l) => l());
};

export const setDebugPosition = (position: Coordinate | undefined) => update({ position });
export const resetGeofenceMemory = () => update({ resetCount: current.resetCount + 1 });

export function useDebugLocation(): DebugLocation {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
