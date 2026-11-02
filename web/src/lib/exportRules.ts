import type { FormatEkspor, JenisEkspor } from '../types';

export const JENIS_EKSPOR: readonly JenisEkspor[] = ['zona', 'laporan'];
/** What the Ekspor page offers. XLSX and PDF are written in the browser from the CSV (lib/exportFiles.ts). */
export const FORMAT_EKSPOR: readonly FormatEkspor[] = ['csv', 'xlsx', 'pdf'];
/** What API-013 answers: CSV only. */
export const FORMAT_API: readonly FormatEkspor[] = ['csv'];

export type ExportCheck = { ok: true; jenis: JenisEkspor; format: FormatEkspor } | { ok: false; errors: Record<string, string> };

/**
 * API-013 rule: jenis is zona or laporan, format is csv; anything else is rejected (422) with a message per field.
 * The page calls it with FORMAT_EKSPOR before building XLSX or PDF; the mock API keeps the default (CSV only).
 */
export function checkExport(jenis: string, format: string, allowed: readonly FormatEkspor[] = FORMAT_API): ExportCheck {
  const errors: Record<string, string> = {};
  if (!jenis) errors.jenis = 'Pilih jenis data yang akan diekspor.';
  else if (!JENIS_EKSPOR.includes(jenis as JenisEkspor))
    errors.jenis = `Jenis data "${jenis}" tidak dikenal. Pilih Data Zona atau Data Laporan.`;
  if (!allowed.includes(format as FormatEkspor))
    errors.format = `Format "${format || '(kosong)'}" tidak didukung. Pilihan: ${allowed.map((f) => f.toUpperCase()).join(', ')}.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, jenis: jenis as JenisEkspor, format: format as FormatEkspor };
}
