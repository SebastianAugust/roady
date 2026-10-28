import type { Cuaca, Kategori, StatusLaporan } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

/** 2026-10-14 or an ISO timestamp -> 14-10-2026 (date part as written, no time zone shift). */
export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
}

/** ISO timestamp -> 20-10-2026 09:00 in the browser's time zone. */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "-6.9175, 107.6191" */
export const formatCoords = (latitude: number, longitude: number) => `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

/** Saved address, or the coordinates when the address lookup failed (docs/05 #12). */
export const placeText = (r: { alamat_teks?: string | null; latitude: number; longitude: number }) =>
  r.alamat_teks?.trim() || formatCoords(r.latitude, r.longitude);

// Options of the Figma dropdowns d.tipe_kecelakaan and d.cuaca (Admin 1036:3214, 1036:3235): same as mobile.
export const KATEGORI_LABEL: Record<Kategori, string> = { kecelakaan: 'Kecelakaan', near_miss: 'Nyaris celaka' };
export const CUACA_LABEL: Record<Cuaca, string> = { cerah: 'Cerah', hujan: 'Hujan', lainnya: 'Lainnya' };
// Wording of the Figma d.progress dropdown (1036:3189): Masuk Otomatis, Menunggu Tinjauan, Disetujui, Ditolak.
// Figma's Detail Laporan cards say "Menunggu Konfirmasi" / "Diterima" instead; the dropdown wins (docs/05 #24).
// auto_rejected has no Figma label; it only shows to Admin.
export const STATUS_LABEL: Record<StatusLaporan, string> = {
  auto_approved: 'Masuk Otomatis',
  pending_review: 'Menunggu Tinjauan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  auto_rejected: 'Ditolak Otomatis',
};

/** 2026-10-09T07:34Z -> "9-10-2026 · 14.34 WIB" as on the Figma cards (time in the browser's zone, WIB in Bandung). */
export function formatWib(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.getDate()}-${pad(d.getMonth() + 1)}-${d.getFullYear()} · ${pad(d.getHours())}.${pad(d.getMinutes())} WIB`;
}

/** Today in the browser's time zone as YYYY-MM-DD (for date inputs). */
export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
