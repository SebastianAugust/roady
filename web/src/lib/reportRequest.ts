import type { CreateAccidentRequest, Cuaca } from '../types';
import { choiceLabel, KENDARAAN, LOCATION_KEYS, type JenisLaporan, type ReportValues } from './reportTemplates';

const str = (v: string | string[] | undefined) => (typeof v === 'string' ? v.trim() : '');
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : []);
const int = (v: string | string[] | undefined) => Number(str(v) || 0);

/**
 * The API-010 body for answers that already passed validateReport. The place text is lokasi_deskripsi; for a kecelakaan
 * jumlah_korban is the sum of the three victim counts (and the counts stay in `detail`). A masalah jalan has no time of
 * its own, so it is dated when it is entered.
 */
export function buildAccidentRequest(jenis: JenisLaporan, v: ReportValues, now = new Date()): CreateAccidentRequest {
  const place = {
    lokasi_deskripsi: str(v[LOCATION_KEYS.alamat]),
    latitude: Number(str(v[LOCATION_KEYS.latitude])),
    longitude: Number(str(v[LOCATION_KEYS.longitude])),
    foto_nama: str(v.foto) || null,
  };
  const kendaraan = list(v.kendaraan);
  const kendaraanText = kendaraan.map((k) => choiceLabel(KENDARAAN, k)).join(', ') || null;

  switch (jenis) {
    case 'kecelakaan': {
      const meninggal = int(v.korban_meninggal);
      const berat = int(v.korban_luka_berat);
      const ringan = int(v.korban_luka_ringan);
      return {
        ...place,
        jenis,
        tanggal_waktu: new Date(str(v.waktu_kejadian)).toISOString(),
        jumlah_korban: meninggal + berat + ringan,
        jenis_kendaraan_terlibat: kendaraanText,
        kondisi_cuaca: str(v.cuaca) as Cuaca,
        detail: {
          kendaraan,
          korban_meninggal: meninggal,
          korban_luka_berat: berat,
          korban_luka_ringan: ringan,
          kondisi_jalan: str(v.kondisi_jalan),
          dugaan_penyebab: str(v.dugaan_penyebab),
          kronologi: str(v.kronologi),
        },
      };
    }
    case 'nyaris_celaka':
      return {
        ...place,
        jenis,
        tanggal_waktu: new Date(str(v.waktu_kejadian)).toISOString(),
        jumlah_korban: 0,
        jenis_kendaraan_terlibat: kendaraanText,
        kondisi_cuaca: null,
        detail: { kendaraan, hampir_terjadi: str(v.hampir_terjadi), penyebab: str(v.penyebab), kronologi: str(v.kronologi) },
      };
    case 'masalah_jalan':
      return {
        ...place,
        jenis,
        tanggal_waktu: now.toISOString(),
        jumlah_korban: 0,
        jenis_kendaraan_terlibat: null,
        kondisi_cuaca: null,
        detail: { jenis_masalah: str(v.jenis_masalah), tingkat_bahaya: str(v.tingkat_bahaya), deskripsi: str(v.deskripsi) },
      };
  }
}

/** Maps the field names of a 422 from API-010 onto the keys of the form answers (the rest is shown as a form-level message). */
export function serverErrorsToForm(errors: Record<string, string>): { fields: Record<string, string>; rest: string[] } {
  const rename: Record<string, string> = {
    tanggal_waktu: 'waktu_kejadian',
    koordinat: LOCATION_KEYS.latitude,
    lokasi_deskripsi: LOCATION_KEYS.alamat,
    jumlah_korban: 'korban_meninggal',
  };
  const known = new Set(['waktu_kejadian', 'latitude', 'longitude', 'alamat_teks', 'kendaraan', 'korban_meninggal', 'cuaca', 'kondisi_jalan', 'dugaan_penyebab', 'hampir_terjadi', 'penyebab', 'kronologi', 'jenis_masalah', 'tingkat_bahaya', 'deskripsi', 'foto']);
  const fields: Record<string, string> = {};
  const rest: string[] = [];
  for (const [key, message] of Object.entries(errors)) {
    const target = rename[key] ?? key;
    if (known.has(target)) fields[target] = message;
    else rest.push(message);
  }
  return { fields, rest };
}
