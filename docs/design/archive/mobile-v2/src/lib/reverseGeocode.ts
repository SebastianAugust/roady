import * as Location from 'expo-location';
import { formatAddress } from './address';

const TIMEOUT_MS = 4000;

/** Address text for a coordinate, or null when the lookup fails, times out or finds nothing. Never throws, so it cannot block a report. */
export async function reverseGeocodeToText(latitude: number, longitude: number): Promise<string | null> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS));
    const result = await Promise.race([Location.reverseGeocodeAsync({ latitude, longitude }), timeout]);
    return formatAddress(result?.[0]);
  } catch {
    return null;
  }
}
