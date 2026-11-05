import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { Coordinate, EMPTY_GEOFENCE_STATE, evaluateGeofence, GeofenceState } from '../geofence';
import { useDebugLocation } from '../lib/debugLocation';
import { notifyZoneProximity } from '../lib/proximityNotifier';
import type { Zona } from '../types';

/**
 * Early warning, computed on the device (docs/03: not through the API). While the app is in the foreground and location is
 * allowed, every position update is checked against the downloaded zones and a local notification fires per the geofence rules.
 * A fake position from the debug panel replaces the GPS. Does not ask for any permission itself.
 */
export function useGeofenceAlerts(zones: readonly Zona[]) {
  const debug = useDebugLocation();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [locationGranted, setLocationGranted] = useState(false);

  const zonesRef = useRef(zones);
  const memory = useRef<GeofenceState>(EMPTY_GEOFENCE_STATE);
  const lastPosition = useRef<Coordinate>(undefined);

  const check = useCallback((position: Coordinate) => {
    lastPosition.current = position;
    const { state, alerts } = evaluateGeofence(memory.current, position, zonesRef.current, Date.now());
    memory.current = state;
    // A failed notification must not crash the map; the zone is already marked as warned.
    if (alerts.length) notifyZoneProximity(alerts).catch(() => {});
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);

  // Re-read the permission whenever the app comes back to the foreground: the user may have granted it in the settings.
  useEffect(() => {
    if (appActive) Location.getForegroundPermissionsAsync().then((p) => setLocationGranted(p.granted), () => setLocationGranted(false));
  }, [appActive]);

  // Zones usually arrive after the first fix: check the last known position against them.
  useEffect(() => {
    zonesRef.current = zones;
    if (lastPosition.current) check(lastPosition.current);
  }, [zones, check]);

  // Declared before the debug-position effect so a reset and a new fake position in the same render run in that order.
  useEffect(() => {
    memory.current = EMPTY_GEOFENCE_STATE;
  }, [debug.resetCount]);

  useEffect(() => {
    if (debug.position) check(debug.position);
  }, [debug.position, debug.resetCount, check]);

  const useGps = appActive && locationGranted && !debug.position;
  useEffect(() => {
    if (!useGps) return;
    let cancelled = false;
    let subscription: Location.LocationSubscription | undefined;
    Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 20, timeInterval: 5000 }, ({ coords }) =>
      check({ latitude: coords.latitude, longitude: coords.longitude }),
    ).then(
      (s) => {
        if (cancelled) s.remove();
        else subscription = s;
      },
      () => {}, // No GPS or location switched off: there is nothing to warn about.
    );
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [useGps, check]);

  return { locationGranted };
}
