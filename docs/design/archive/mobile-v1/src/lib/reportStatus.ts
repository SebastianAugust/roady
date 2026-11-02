import type { StatusLaporan } from '../types';

// ponytail: labels are proposals; the d.progress dropdown in Figma may define the real wording (docs/05 open item 8).
export const STATUS_LABEL: Record<StatusLaporan, string> = {
  pending_review: 'Menunggu Konfirmasi',
  approved: 'Diterima',
  auto_approved: 'Masuk Otomatis', // Figma riwayat laporan (1032:4841), black pill
  rejected: 'Ditolak',
  auto_rejected: 'Ditolak',
};

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export const STATUS_TONE: Record<StatusLaporan, StatusTone> = {
  pending_review: 'warning',
  approved: 'success',
  auto_approved: 'neutral',
  rejected: 'danger',
  auto_rejected: 'danger',
};

/** 2026-10-14T... -> 14-10-2026 */
export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
}
