/** The parts of an expo-location address that matter here (a subset of LocationGeocodedAddress). */
export interface AddressParts {
  street?: string | null;
  name?: string | null;
  district?: string | null;
  subregion?: string | null;
  city?: string | null;
}

// Android sometimes returns a house number or a Plus Code as `name`; neither reads as a street.
const NOT_A_STREET = /^[\d\s./-]+$|^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/;

const clean = (s?: string | null) => s?.trim() ?? '';

/** "Jl. Buahbatu, Margasari, Kota Bandung": street, kelurahan/kecamatan, city. Returns null when nothing usable is left. */
export function formatAddress(a: AddressParts | undefined): string | null {
  if (!a) return null;
  const name = clean(a.name);
  const street = clean(a.street) || (NOT_A_STREET.test(name) ? '' : name);
  const parts = [street, clean(a.district) || clean(a.subregion), clean(a.city) || clean(a.subregion)].filter(Boolean);
  // Drop repeats ("Cimahi, Cimahi") while keeping order.
  const unique = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  return unique.length ? unique.join(', ') : null;
}

/** "-6.9175, 107.6191" */
export const formatCoords = (latitude: number, longitude: number) => `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

/** What to show for a report's place: the saved address with the coordinates on the next line, or just the coordinates when there is no address. */
export const placeText = (r: { alamat_teks?: string | null; latitude: number; longitude: number }) => {
  const coords = formatCoords(r.latitude, r.longitude);
  const address = r.alamat_teks?.trim();
  return address ? `${address}\n${coords}` : coords;
};
