/** Minimum length of a written reason (alasan_penolakan, alasan_hapus), docs/02. Shared by the dialogs and the mock API. */
export const ALASAN_MIN_LENGTH = 10;

/** Error text for a reason, or undefined when it is long enough (trimmed). */
export function alasanError(alasan: string | undefined) {
  return (alasan?.trim().length ?? 0) >= ALASAN_MIN_LENGTH ? undefined : `Alasan wajib diisi, minimal ${ALASAN_MIN_LENGTH} karakter.`;
}

/** Ready-made reasons for rejecting a report (buttons above the text; each is longer than the minimum). */
export const QUICK_REJECT_REASONS = [
  'Foto buram atau tidak jelas.',
  'Foto tidak sesuai lokasi kejadian.',
  'Foto bukan dari kejadian yang dilaporkan.',
  'Deskripsi tidak sesuai dengan foto.',
  'Laporan ganda dari kejadian yang sama.',
] as const;
