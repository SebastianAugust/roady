import type { AccidentsQuery, Cuaca, UrutKecelakaan } from '../types';

/** The filter bar of Kelola Data Kecelakaan as typed (strings), plus the sort order and the page. */
export interface AccidentFilters {
  q: string;
  dari: string;
  sampai: string;
  zona: string;
  lokasi: string;
  cuaca: Cuaca | '';
  kendaraan: string;
  korbanMin: string;
  korbanMax: string;
  /** kode_pengguna of the one who entered it. */
  oleh: string;
  urut: UrutKecelakaan;
  halaman: number;
}

export const PER_PAGE = 9; // three rows of the three-column grid

export const NO_FILTERS: AccidentFilters = {
  q: '',
  dari: '',
  sampai: '',
  zona: '',
  lokasi: '',
  cuaca: '',
  kendaraan: '',
  korbanMin: '',
  korbanMax: '',
  oleh: '',
  urut: 'terbaru',
  halaman: 1,
};

/** True when something other than the sort order and the page is set (the reset button and the empty state use it). */
export const hasFilters = (f: AccidentFilters) =>
  Boolean(f.q.trim() || f.dari || f.sampai || f.zona || f.lokasi.trim() || f.cuaca || f.kendaraan.trim() || f.korbanMin || f.korbanMax || f.oleh);

/** Messages per field for a filter the API would answer with 422; empty when the filters are fine. */
export function filterErrors(f: AccidentFilters) {
  const errors: Partial<Record<'sampai' | 'korbanMin' | 'korbanMax', string>> = {};
  if (f.dari && f.sampai && f.dari > f.sampai) errors.sampai = 'Tanggal akhir harus sama atau setelah tanggal awal.';
  const min = f.korbanMin === '' ? undefined : Number(f.korbanMin);
  const max = f.korbanMax === '' ? undefined : Number(f.korbanMax);
  if (min !== undefined && (!Number.isInteger(min) || min < 0)) errors.korbanMin = 'Isi bilangan bulat 0 atau lebih.';
  if (max !== undefined && (!Number.isInteger(max) || max < 0)) errors.korbanMax = 'Isi bilangan bulat 0 atau lebih.';
  if (min !== undefined && max !== undefined && !errors.korbanMin && !errors.korbanMax && min > max) errors.korbanMax = 'Harus sama atau lebih besar dari jumlah korban minimal.';
  return errors;
}

/** Filters as the query of GET /api/admin/accidents (docs/03); empty fields are left out. */
export function toQuery(f: AccidentFilters): AccidentsQuery {
  return {
    q: f.q.trim() || undefined,
    tanggal_dari: f.dari || undefined,
    tanggal_sampai: f.sampai || undefined,
    zona_id: f.zona ? Number(f.zona) : undefined,
    lokasi: f.lokasi.trim() || undefined,
    cuaca: f.cuaca || undefined,
    jenis_kendaraan: f.kendaraan.trim() || undefined,
    korban_min: f.korbanMin === '' ? undefined : Number(f.korbanMin),
    korban_max: f.korbanMax === '' ? undefined : Number(f.korbanMax),
    diinput_oleh: f.oleh || undefined,
    urut: f.urut,
    halaman: f.halaman,
    per_halaman: PER_PAGE,
  };
}
