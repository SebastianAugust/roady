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

// Dark raster tiles (docs/05 #18). Default: Stadia "Alidade Smooth Dark", which works without a key on localhost; a
// deployed site needs its domain registered on a (free) Stadia account, or a key in VITE_MAP_TILE_URL
// (…png?api_key=…). CARTO dark_all was the first choice but now answers every tile with "API KEY REQUIRED".
const STADIA_DARK = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const STADIA_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_TILES = {
  url: import.meta.env.VITE_MAP_TILE_URL || STADIA_DARK,
  attribution: import.meta.env.VITE_MAP_TILE_ATTRIBUTION || STADIA_ATTRIBUTION,
  // Only used when the URL has {s}.
  subdomains: 'abc',
  maxZoom: 19,
} as const;
