// ponytail: rough box and constants until the team defines the Bandung Raya polygon and radius_zona (docs/05 open item 5).
export const BANDUNG_RAYA = {
  minLat: -7.15,
  maxLat: -6.75,
  minLng: 107.45,
  maxLng: 107.95,
  center: { latitude: -6.9175, longitude: 107.6191 },
} as const;

export const RADIUS_NOTIFIKASI_M = 300;

/** Query radius that covers all of Bandung Raya from its center (API-003 radius is a proposal in docs/03). */
export const ZONES_FETCH_RADIUS_M = 40000;

export const isInBandungRaya = (lat: number, lng: number) =>
  lat >= BANDUNG_RAYA.minLat && lat <= BANDUNG_RAYA.maxLat && lng >= BANDUNG_RAYA.minLng && lng <= BANDUNG_RAYA.maxLng;

// ponytail: Figma Bantuan names an Instagram account and a WhatsApp contact center but gives no handle or number. Set the links in .env.
export const CONTACT = {
  instagramUrl: process.env.EXPO_PUBLIC_INSTAGRAM_URL,
  whatsappUrl: process.env.EXPO_PUBLIC_WHATSAPP_URL,
} as const;
