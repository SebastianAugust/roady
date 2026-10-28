import { Platform } from 'react-native';
import { buildAlertMessage, NearbyZone } from '../geofence';
import type { Zona } from '../types';

type NotificationsModule = typeof import('expo-notifications');

const CHANNEL_ID = 'zona-rawan';
let ready: Promise<void> | undefined;
let cached: NotificationsModule | null | undefined;

export const NOTIFICATIONS_UNAVAILABLE_MESSAGE =
  'Peringatan dini tidak tersedia di Expo Go ini karena modul notifikasi tidak ada. Fitur lain tetap bisa dipakai. Pakai development build untuk mengaktifkannya.';

/**
 * expo-notifications is loaded on first use instead of at import time: in an Expo Go build that lacks its native module
 * (e.g. "Cannot find native module 'ExpoTopicSubscriptionModule'") a top-level import would crash the whole app at launch.
 * Returns null when the module cannot be loaded.
 */
function loadNotifications(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- deliberate lazy require, see above
    cached = require('expo-notifications') as NotificationsModule;
  } catch (e) {
    console.warn('[proximityNotifier] expo-notifications unavailable, proximity alerts disabled:', e);
    cached = null;
  }
  return cached;
}

export function isNotificationsAvailable(): boolean {
  return loadNotifications() !== null;
}

/** Idempotent. Without a handler, notifications are silently dropped while the app is open, which is the only mode for now. */
export function initProximityNotifications(): Promise<void> {
  ready ??= (async () => {
    const Notifications = loadNotifications();
    if (!Notifications) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Peringatan zona rawan',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  })();
  return ready;
}

/** 'unavailable' means the native module is missing (Expo Go); the alerts stay off. */
export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

const toPermission = (
  Notifications: NotificationsModule,
  p: Awaited<ReturnType<NotificationsModule['getPermissionsAsync']>>,
): NotificationPermission =>
  p.granted ? 'granted' : p.status === Notifications.PermissionStatus.UNDETERMINED ? 'undetermined' : 'denied';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const Notifications = loadNotifications();
  if (!Notifications) return 'unavailable';
  try {
    return toPermission(Notifications, await Notifications.getPermissionsAsync());
  } catch {
    return 'unavailable';
  }
}

/** Shows the system dialog (only the first time; afterwards the OS answers on its own). */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const Notifications = loadNotifications();
  if (!Notifications) return 'unavailable';
  try {
    return toPermission(Notifications, await Notifications.requestPermissionsAsync());
  } catch {
    return 'unavailable';
  }
}

/** One local notification for all zones entered at the same time. Does nothing when permission or the module is missing. */
export async function notifyZoneProximity(alerts: readonly NearbyZone<Zona>[]): Promise<void> {
  const message = buildAlertMessage(alerts);
  const Notifications = loadNotifications();
  if (!message || !Notifications || (await getNotificationPermission()) !== 'granted') return;
  await initProximityNotifications();
  await Notifications.scheduleNotificationAsync({
    content: { ...message, ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}) },
    trigger: null,
  });
}
