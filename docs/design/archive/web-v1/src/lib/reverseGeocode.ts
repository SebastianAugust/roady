// Reverse geocoding for reports that have no saved alamat_teks (docs/05 #12), with the Google Geocoding API.
// The key is read from VITE_GOOGLE_GEOCODING_KEY (web/.env, never in the repo); without it nothing is requested and the
// callers fall back to the coordinates. Results (also "nothing found") are cached for the session, so a coordinate is
// asked for once. A browser key is visible to anyone using the page: restrict it to this site by HTTP referrer and to
// the Geocoding API in the Google Cloud console.

const KEY = import.meta.env.VITE_GOOGLE_GEOCODING_KEY as string | undefined;
const STORAGE_PREFIX = 'roady.geocode.';
const memory = new Map<string, string | null>();

export const canReverseGeocode = Boolean(KEY);

const cacheKey = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

function readCache(key: string): string | null | undefined {
  if (memory.has(key)) return memory.get(key);
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (stored !== null) {
      const value = JSON.parse(stored) as string | null;
      memory.set(key, value);
      return value;
    }
  } catch {
    // Storage can be blocked; the in-memory cache still works.
  }
  return undefined;
}

function writeCache(key: string, value: string | null) {
  memory.set(key, value);
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignored, see above
  }
}

interface Component {
  long_name: string;
  types: string[];
}

/** "Jl. Ir. H. Juanda No. 12, Dago, Kec. Coblong, Kota Bandung" from Google's address components; Google's own text if they are too sparse. */
function formatAddress(components: Component[], fallback: string) {
  const of = (type: string) => components.find((c) => c.types.includes(type))?.long_name;
  const street = of('route');
  const number = of('street_number');
  const kelurahan = of('administrative_area_level_4') ?? of('sublocality_level_1');
  const kecamatan = of('administrative_area_level_3');
  const kota = of('administrative_area_level_2');
  const parts = [street && (number ? `${street} No. ${number}` : street), kelurahan, kecamatan && `Kec. ${kecamatan.replace(/^Kecamatan\s+/i, '')}`, kota].filter(Boolean);
  return parts.length >= 2 ? parts.join(', ') : fallback;
}

/** Address text for a coordinate, or null when there is no key, nothing is found or the request fails. Never throws. */
export async function reverseGeocode(latitude: number, longitude: number, signal?: AbortSignal): Promise<string | null> {
  if (!KEY) return null;
  const key = cacheKey(latitude, longitude);
  const cached = readCache(key);
  if (cached !== undefined) return cached;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=id&key=${encodeURIComponent(KEY)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: string; results?: { formatted_address: string; address_components: Component[] }[] };
    // A failed lookup (quota, key restrictions) is not cached so it can be retried; "no result" is cached.
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return null;
    const first = data.results?.[0];
    const text = first ? formatAddress(first.address_components, first.formatted_address) : null;
    writeCache(key, text);
    return text;
  } catch {
    return null;
  }
}
