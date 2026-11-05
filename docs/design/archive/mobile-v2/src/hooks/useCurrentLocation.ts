import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type LocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'unavailable' }
  | { status: 'ready'; latitude: number; longitude: number; address: string };

async function readLocation(): Promise<LocationState> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return { status: 'denied' };
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [a] = await Location.reverseGeocodeAsync(coords).catch(() => []);
    const address = [a?.street ?? a?.name, a?.city ?? a?.subregion].filter(Boolean).join(', ');
    return { status: 'ready', latitude: coords.latitude, longitude: coords.longitude, address: address || 'Lokasi saat ini' };
  } catch {
    return { status: 'unavailable' };
  }
}

/** Foreground GPS fix plus a reverse-geocoded address. `retry` asks again (e.g. after the user grants permission). */
export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    readLocation().then(setLocation);
  }, []);

  const retry = useCallback(() => {
    setLocation({ status: 'loading' });
    readLocation().then(setLocation);
  }, []);

  return { location, retry };
}
