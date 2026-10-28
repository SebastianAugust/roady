/** Minimum length of the written reason of a deletion (alasan_hapus), docs/02. Shared by the dialog and the mock API. */
export const ALASAN_MIN_LENGTH = 10;

/** Minimum length of the reason of a verification (alasan_verifikasi), for approving and rejecting alike. */
export const ALASAN_VERIFIKASI_MIN_LENGTH = 15;

/** Error text for a reason, or undefined when it is long enough (trimmed). */
export function alasanError(alasan: string | undefined, min = ALASAN_MIN_LENGTH) {
  return (alasan?.trim().length ?? 0) >= min ? undefined : `Alasan wajib diisi, minimal ${min} karakter.`;
}

/** The reason of a decision: the chosen ready-made reason followed by the free note, if any. */
export function composeAlasan(preset: string, note: string) {
  return [preset.trim(), note.trim()].filter(Boolean).join('. ');
}

// Ready-made reasons (each is at least ALASAN_VERIFIKASI_MIN_LENGTH characters, so choosing one is enough).
export const QUICK_APPROVE_REASONS = [
  'Bukti foto jelas dan lokasi sesuai',
  'Dilaporkan oleh beberapa pengguna',
  'Deskripsi sesuai dengan foto kejadian',
  'Waktu dan lokasi masuk akal',
] as const;

export const QUICK_REJECT_REASONS = [
  'Foto tidak relevan',
  'Lokasi tidak sesuai',
  'Laporan duplikat',
  'Foto buram atau tidak jelas',
  'Deskripsi tidak sesuai dengan foto',
] as const;
