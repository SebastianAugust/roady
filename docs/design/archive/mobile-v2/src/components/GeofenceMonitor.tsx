import { useEffect } from 'react';
import { Alert } from 'react-native';
import { APP_NAME } from '../constants';
import { useGeofenceAlerts } from '../hooks/useGeofenceAlerts';
import { useZones } from '../hooks/useZones';
import {
  getNotificationPermission,
  initProximityNotifications,
  NOTIFICATIONS_UNAVAILABLE_MESSAGE,
  requestNotificationPermission,
} from '../lib/proximityNotifier';
import { loadNotificationPromptAsked, markNotificationPromptAsked } from '../lib/storage';

/** Module-level so the "unavailable" message appears once per app launch, not every time the monitor remounts. */
let unavailableShown = false;

/**
 * Runs the early warning for as long as the signed-in app is open (renders nothing).
 * The notification permission is asked here, once the location permission is granted: that is the moment the user can see why
 * a warning is useful, and asking earlier (at launch or login) would be a dialog without context.
 */
export function GeofenceMonitor() {
  const { zones } = useZones();
  const { locationGranted } = useGeofenceAlerts(zones);

  useEffect(() => {
    initProximityNotifications().catch(() => {});
  }, []);

  useEffect(() => {
    if (!locationGranted) return;
    let cancelled = false;
    (async () => {
      const [permission, asked] = await Promise.all([getNotificationPermission(), loadNotificationPromptAsked()]);
      if (cancelled) return;
      if (permission === 'unavailable') {
        if (!unavailableShown) {
          unavailableShown = true;
          Alert.alert('Peringatan dini nonaktif', NOTIFICATIONS_UNAVAILABLE_MESSAGE);
        }
        return;
      }
      if (permission !== 'undetermined' || asked) return;
      // "Nanti" leaves the flag unset, so the question comes back the next time the app opens.
      Alert.alert(
        'Aktifkan peringatan dini?',
        `${APP_NAME} bisa memberi tahu saat kamu berada dalam 300 m dari zona rawan kecelakaan, selama aplikasi terbuka.`,
        [
          { text: 'Nanti' },
          {
            text: 'Aktifkan',
            isPreferred: true,
            onPress: () => {
              void markNotificationPromptAsked();
              requestNotificationPermission().catch(() => {});
            },
          },
        ],
      );
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locationGranted]);

  return null;
}
