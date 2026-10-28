import { isInBandungRaya } from '../config';
import type { CreateAccidentRequest, Cuaca } from '../types';

/** Raw form values, all strings as typed. There is deliberately no input_by: the server takes it from the token. */
export interface AccidentForm {
  jumlah_korban: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm, local time (WIB)
  jenis_kendaraan_terlibat: string;
  kondisi_cuaca: Cuaca | '';
  lokasi_deskripsi: string;
  latitude: string;
  longitude: string;
}

export const EMPTY_ACCIDENT_FORM: AccidentForm = {
  jumlah_korban: '',
  tanggal: '',
  waktu: '',
  jenis_kendaraan_terlibat: '',
  kondisi_cuaca: '',
  lokasi_deskripsi: '',
  latitude: '',
  longitude: '',
};

const NUMBER = /^-?\d+(\.\d+)?$/;

export type AccidentCheck = { ok: true; body: CreateAccidentRequest } | { ok: false; errors: Partial<Record<keyof AccidentForm, string>> };

/** Same rules as API-010 in the mock: date and time required and not in the future, place required, victims an integer >= 0. */
export function checkAccidentForm(f: AccidentForm, now = new Date()): AccidentCheck {
  const errors: Partial<Record<keyof AccidentForm, string>> = {};

  if (!f.tanggal) errors.tanggal = 'Tanggal kejadian wajib diisi.';
  if (!f.waktu) errors.waktu = 'Waktu kejadian wajib diisi.';
  // Without a zone suffix the browser reads this as local time.
  const when = f.tanggal && f.waktu ? new Date(`${f.tanggal}T${f.waktu}`) : undefined;
  if (when && Number.isNaN(when.getTime())) errors.tanggal = 'Tanggal atau waktu tidak valid.';
  else if (when && when > now) errors.tanggal = 'Tanggal dan waktu kejadian tidak boleh di masa depan.';

  if (!f.lokasi_deskripsi.trim()) errors.lokasi_deskripsi = 'Deskripsi lokasi wajib diisi.';

  const korban = f.jumlah_korban.trim();
  if (!korban) errors.jumlah_korban = 'Jumlah korban wajib diisi (isi 0 bila tidak ada).';
  else if (!/^\d+$/.test(korban)) errors.jumlah_korban = 'Jumlah korban harus bilangan bulat 0 atau lebih.';

  const lat = f.latitude.trim();
  const lng = f.longitude.trim();
  if (!lat) errors.latitude = 'Latitude wajib diisi, atau klik lokasi di peta.';
  else if (!NUMBER.test(lat)) errors.latitude = 'Latitude harus berupa angka, misalnya -6.939305.';
  if (!lng) errors.longitude = 'Longitude wajib diisi, atau klik lokasi di peta.';
  else if (!NUMBER.test(lng)) errors.longitude = 'Longitude harus berupa angka, misalnya 107.661631.';
  if (!errors.latitude && !errors.longitude && !isInBandungRaya(Number(lat), Number(lng)))
    errors.latitude = 'Koordinat berada di luar wilayah Bandung Raya.';

  if (Object.keys(errors).length || !when) return { ok: false, errors };
  return {
    ok: true,
    body: {
      tanggal_waktu: when.toISOString(),
      lokasi_deskripsi: f.lokasi_deskripsi.trim(),
      latitude: Number(lat),
      longitude: Number(lng),
      jumlah_korban: Number(korban),
      jenis_kendaraan_terlibat: f.jenis_kendaraan_terlibat.trim() || null,
      kondisi_cuaca: f.kondisi_cuaca || null,
    },
  };
}

/** Maps API-010 422 field names onto the form fields. */
export function apiErrorsToForm(errors: Record<string, string>): Partial<Record<keyof AccidentForm, string>> {
  const { tanggal_waktu, koordinat, ...rest } = errors;
  return {
    ...(rest as Partial<Record<keyof AccidentForm, string>>),
    ...(tanggal_waktu ? { tanggal: tanggal_waktu } : {}),
    ...(koordinat ? { latitude: koordinat } : {}),
  };
}
