// ponytail: rough box until the team defines the Bandung Raya polygon (docs/05 open item 5). Same values as mobile/src/config.ts.
export const BANDUNG_RAYA = {
  minLat: -7.15,
  maxLat: -6.75,
  minLng: 107.45,
  maxLng: 107.95,
  center: { latitude: -6.9175, longitude: 107.6191 },
} as const;

export const isInBandungRaya = (lat: number, lng: number) =>
  lat >= BANDUNG_RAYA.minLat && lat <= BANDUNG_RAYA.maxLat && lng >= BANDUNG_RAYA.minLng && lng <= BANDUNG_RAYA.maxLng;

/** Query radius that covers all of Bandung Raya from its center (API-003 radius is a proposal in docs/03). */
export const ZONES_FETCH_RADIUS_M = 40000;

/**
 * Google Maps JavaScript API key. Empty = the maps show "Peta belum dikonfigurasi" instead of crashing.
 * Restrict the key to this site (HTTP referrer) and to the Maps JavaScript API; keep it in .env, never in the repo.
 */
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

/**
 * The mobile app running in the browser (`npm run web:preview` in mobile/), shown in a phone frame after a pengemudi
 * account signs in here (MobilePreviewPage, for presentations).
 */
export const MOBILE_PREVIEW_URL: string = import.meta.env.VITE_MOBILE_PREVIEW_URL || 'http://localhost:19006';

// Wide enough that the whole viewport at the start zoom (about 0.85 degrees across on a 1280 px map) fits inside the bounds;
// a narrower box makes Google pin the map centre to the middle of the box and ignore where we point the camera.
const MARGIN_DEG = 0.25;
/** Start view of the zone map and the limits it cannot leave: Bandung Raya (the box above plus a margin), no further out than the region. */
export const MAP_VIEW = {
  center: { lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude },
  zoom: 11,
  minZoom: 10,
  maxZoom: 18,
  bounds: {
    south: BANDUNG_RAYA.minLat - MARGIN_DEG,
    north: BANDUNG_RAYA.maxLat + MARGIN_DEG,
    west: BANDUNG_RAYA.minLng - MARGIN_DEG,
    east: BANDUNG_RAYA.maxLng + MARGIN_DEG,
  },
} as const;
