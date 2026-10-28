import type { FormatEkspor, JenisEkspor } from '../types';

export const JENIS_EKSPOR: readonly JenisEkspor[] = ['zona', 'laporan'];
export const FORMAT_EKSPOR: readonly FormatEkspor[] = ['csv'];

export type ExportCheck = { ok: true; jenis: JenisEkspor; format: FormatEkspor } | { ok: false; errors: Record<string, string> };

/** API-013 rule: jenis is zona or laporan, format is csv; anything else is rejected (422) with a message per field. */
export function checkExport(jenis: string, format: string): ExportCheck {
  const errors: Record<string, string> = {};
  if (!jenis) errors.jenis = 'Pilih jenis data yang akan diekspor.';
  else if (!JENIS_EKSPOR.includes(jenis as JenisEkspor))
    errors.jenis = `Jenis data "${jenis}" tidak dikenal. Pilih Data Zona atau Data Laporan.`;
  if (!FORMAT_EKSPOR.includes(format as FormatEkspor)) errors.format = `Format "${format || '(kosong)'}" tidak didukung. Ekspor hanya tersedia sebagai CSV.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, jenis: jenis as JenisEkspor, format: format as FormatEkspor };
}
