import type { Option } from '../components/Dropdown';
import type { Cuaca, Kategori } from '../types';

// Options come from the Figma dropdowns (d.tipe_kecelakaan, d.cuaca). Cuaca has no "lainnya": see docs/05-decisions.md.
export const KATEGORI_OPTIONS: Option<Kategori>[] = [
  { value: 'kecelakaan', label: 'Kecelakaan' },
  { value: 'near_miss', label: 'Nyaris celaka' },
];
export const CUACA_OPTIONS: Option<Cuaca>[] = [
  { value: 'hujan', label: 'Hujan' },
  { value: 'cerah', label: 'Cerah' },
];

export const KATEGORI_LABEL: Record<Kategori, string> = { kecelakaan: 'Kecelakaan', near_miss: 'Nyaris celaka' };
// `lainnya` exists in the database but cannot be picked in the app; it is still labeled in case the API returns it.
export const CUACA_LABEL: Record<Cuaca, string> = { cerah: 'Cerah', hujan: 'Hujan', lainnya: 'Lainnya' };
