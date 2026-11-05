import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PREFS, loadNotificationPrefs, NotificationPrefs, saveNotificationPrefs } from '../lib/storage';

/** Notification switches of Pengaturan, kept on the device. They only record the choice until FCM is built. */
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadNotificationPrefs().then((p) => {
      if (!alive) return;
      setPrefs(p);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setPref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      const next = { ...prefs, [key]: value };
      setPrefs(next);
      void saveNotificationPrefs(next);
    },
    [prefs],
  );

  return { prefs, loaded, setPref };
}
