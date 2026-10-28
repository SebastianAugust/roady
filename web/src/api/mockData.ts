import { kategoriFromPercentile } from '../lib/risk';
import type { Cuaca, Kategori, KecelakaanResmi, Laporan, RiwayatSkorPoint, StatusLaporan, Zona } from '../types';

// Synthetic data (sumber_data: sintetis). Zones are the same as mobile/src/api/mockZones.ts so both apps show one map.
const RADIUS_ZONA_M = 300;
const UPDATED = '2026-10-20T02:00:00.000Z';

// [lat, lng, jumlah_kejadian, skor_risiko percentile, weather_dependent, place]
const zoneRows: [number, number, number, number, boolean, string][] = [
  [-6.9436, 107.6958, 21, 96, true, 'Jl. Soekarno Hatta, Gedebage'],
  [-6.9419, 107.6701, 17, 90, false, 'Jl. Soekarno Hatta, Margacinta'],
  [-6.9447, 107.6409, 12, 73, true, 'Jl. Soekarno Hatta, Buahbatu'],
  [-6.9501, 107.6118, 9, 61, false, 'Jl. Soekarno Hatta, Kopo'],
  [-6.9455, 107.5951, 6, 38, false, 'Jl. Soekarno Hatta, Leuwipanjang'],
  [-6.9183, 107.7256, 14, 84, true, 'Jl. Raya Cibiru'],
  [-6.9425, 107.7313, 11, 70, true, 'Jl. Raya Cinunuk'],
  [-6.9275, 107.7708, 8, 56, false, 'Jl. Raya Jatinangor'],
  [-6.9697, 107.793, 10, 66, true, 'Jl. Raya Rancaekek'],
  [-6.9858, 107.835, 7, 44, false, 'Jl. Raya Cicalengka'],
  [-6.8935, 107.615, 4, 22, false, 'Jl. Dipatiukur'],
  [-6.9034, 107.6188, 5, 31, false, 'Jl. Pasteur'],
  [-6.9218, 107.6071, 13, 78, false, 'Jl. Asia Afrika, Alun-alun'],
  [-6.8722, 107.542, 6, 40, false, 'Jl. Amir Machmud, Cimahi'],
  [-6.9902, 107.6293, 3, 15, false, 'Jl. Bojongsoang'],
  [-6.8393, 107.5745, 5, 28, false, 'Jl. Raya Lembang'],
];

export const MOCK_ZONES: Zona[] = zoneRows.map(([lat, lng, n, skor, wet], i) => ({
  zona_id: i + 1,
  center_latitude: lat,
  center_longitude: lng,
  radius_zona: RADIUS_ZONA_M,
  skor_risiko: skor,
  kategori_risiko: kategoriFromPercentile(skor),
  jumlah_kejadian: n,
  weather_dependent: wet,
  last_updated: UPDATED,
}));

/** Street name of a zone, used as the place text of the synthetic reports. */
export const zonePlace = (zonaId: number): string | null => zoneRows[zonaId - 1]?.[5] ?? null;

// Eight weekly KALKULASI_RISIKO rows per zone ending at the current score; the drift is fixed per zone so it is stable.
const WEEKS = 8;
export const MOCK_HISTORY: Record<number, RiwayatSkorPoint[]> = Object.fromEntries(
  MOCK_ZONES.map((z) => {
    const drift = ((z.zona_id * 7) % 9) - 4; // -4..4 points per week
    const titik = Array.from({ length: WEEKS }, (_, w) => {
      const weeksAgo = WEEKS - 1 - w;
      const wobble = ((z.zona_id + w) % 3) - 1;
      const skor = Math.max(1, Math.min(99, z.skor_risiko - drift * weeksAgo + (weeksAgo ? wobble : 0)));
      const date = new Date(Date.parse(UPDATED) - weeksAgo * 7 * 86_400_000).toISOString();
      return { last_updated: date, skor_risiko: skor, kategori_risiko: kategoriFromPercentile(skor) };
    });
    return [z.zona_id, titik];
  }),
);

/** Internal report row: the mock keeps user_id like the real table does, and strips it before anything leaves the API. */
export type StoredLaporan = Laporan & { user_id: number };

// [zona_id, kategori, cuaca, status, tanggal, has photo, deskripsi]
const reportRows: [number, Kategori, Cuaca, StatusLaporan, string, boolean, string][] = [
  [1, 'kecelakaan', 'hujan', 'approved', '2026-10-17', true, 'Kecelakaan beruntun, 1 mobil dan 2 motor, jalan licin.'],
  [1, 'near_miss', 'hujan', 'auto_approved', '2026-10-15', false, 'Motor hampir tergelincir di genangan dekat lampu merah.'],
  [1, 'kecelakaan', 'cerah', 'pending_review', '2026-10-21', true, 'Motor menabrak pembatas jalan saat menyalip truk.'],
  [2, 'kecelakaan', 'cerah', 'approved', '2026-10-12', true, 'Tabrakan mobil dan motor di putaran balik.'],
  [2, 'near_miss', 'cerah', 'auto_approved', '2026-10-09', false, 'Mobil memotong jalur tanpa lampu sein.'],
  [3, 'kecelakaan', 'cerah', 'approved', '2026-10-14', true, 'Kecelakaan tunggal motor di perempatan Buahbatu.'],
  [3, 'near_miss', 'hujan', 'auto_approved', '2026-10-03', false, 'Pejalan kaki menyeberang mendadak saat hujan deras.'],
  [4, 'near_miss', 'cerah', 'auto_approved', '2026-09-28', false, 'Angkot berhenti mendadak menaikkan penumpang.'],
  [4, 'kecelakaan', 'hujan', 'rejected', '2026-10-01', true, 'Foto tidak menunjukkan kejadian.'],
  [5, 'near_miss', 'cerah', 'auto_approved', '2026-10-05', false, 'Bus keluar terminal tanpa melihat arus.'],
  [6, 'kecelakaan', 'hujan', 'approved', '2026-10-18', true, 'Motor terjatuh di turunan Cibiru, jalan licin.'],
  [6, 'kecelakaan', 'hujan', 'pending_review', '2026-10-22', true, 'Mobil tergelincir dan menabrak warung.'],
  [7, 'near_miss', 'hujan', 'auto_approved', '2026-10-11', false, 'Truk berbelok tanpa memberi tanda.'],
  [7, 'kecelakaan', 'cerah', 'approved', '2026-09-30', true, 'Tabrakan dua motor di depan pasar Cinunuk.'],
  [8, 'near_miss', 'cerah', 'auto_approved', '2026-10-08', false, 'Mahasiswa menyeberang di luar zebra cross.'],
  [8, 'kecelakaan', 'cerah', 'approved', '2026-10-02', true, 'Motor menabrak mobil yang parkir di bahu jalan.'],
  [9, 'kecelakaan', 'hujan', 'approved', '2026-10-16', true, 'Motor tergelincir di jalan berlubang yang tergenang.'],
  [10, 'near_miss', 'cerah', 'auto_approved', '2026-09-25', false, 'Kendaraan melawan arus di dekat stasiun.'],
  [11, 'near_miss', 'cerah', 'auto_approved', '2026-10-19', false, 'Ojek daring berhenti mendadak di depan kampus.'],
  [12, 'kecelakaan', 'cerah', 'auto_approved', '2026-10-06', false, 'Tabrakan ringan di pintu keluar tol Pasteur.'],
  [13, 'kecelakaan', 'cerah', 'approved', '2026-10-13', true, 'Motor menyerempet pejalan kaki di Asia Afrika.'],
  [13, 'near_miss', 'hujan', 'pending_review', '2026-10-20', true, 'Bus wisata berhenti di jalur kiri saat hujan.'],
  [14, 'near_miss', 'cerah', 'auto_approved', '2026-10-04', false, 'Mobil keluar gang tanpa melihat kanan kiri.'],
  [15, 'near_miss', 'hujan', 'auto_approved', '2026-09-27', false, 'Genangan dalam membuat motor oleng.'],
  [16, 'kecelakaan', 'cerah', 'approved', '2026-10-10', true, 'Rem blong di turunan Lembang, satu mobil.'],
  [2, 'near_miss', 'hujan', 'pending_review', '2026-10-23', true, 'Nyaris celaka depan Pasar Kordon, jalan rusak, roda masuk retakan.'],
  [8, 'kecelakaan', 'cerah', 'pending_review', '2026-10-24', true, 'Motor menabrak pejalan kaki di depan gerbang kampus.'],
  [9, 'near_miss', 'hujan', 'pending_review', '2026-10-25', true, 'Truk tergelincir ke bahu jalan, hampir menabrak motor.'],
];

// Reporters are drivers 1, 4, 5, 6 in the mock user table; they never appear in any Dishub response.
const REPORTERS = [1, 4, 5, 6];

export const MOCK_REPORTS: StoredLaporan[] = reportRows.map(([zonaId, kategori, cuaca, status, tanggal, foto, deskripsi], i) => {
  const zone = MOCK_ZONES[zonaId - 1];
  // Spread the points a little around the zone center, inside radius_zona.
  const offset = ((i % 5) - 2) * 0.0006;
  return {
    id_report: i + 1,
    user_id: REPORTERS[i % REPORTERS.length],
    zona_id: zonaId,
    latitude: Number((zone.center_latitude + offset).toFixed(5)),
    longitude: Number((zone.center_longitude - offset).toFixed(5)),
    // Every fourth report has no saved address (failed lookup), so the UI shows coordinates instead.
    alamat_teks: i % 4 === 3 ? null : zonePlace(zonaId),
    kategori,
    deskripsi,
    // ponytail: one placeholder image for every mock photo until the storage (docs/05 open item 7) exists.
    foto_url: foto ? `/mock-foto.svg#laporan-${i + 1}` : null,
    tanggal_kejadian: tanggal,
    kondisi_cuaca_saat_kejadian: cuaca,
    timestamp: `${tanggal}T0${(i % 9) + 1}:15:00.000Z`,
    status,
    // Decided reports were verified the day after they came in; pending and automatic ones have no verification time.
    waktu_verifikasi: status === 'approved' || status === 'rejected' ? new Date(Date.parse(tanggal) + 30 * 3_600_000).toISOString() : null,
  };
});

// [zona_id, tanggal_waktu (UTC), lokasi, lat, lng, korban, kendaraan, cuaca, input_by (2 dishub, 3 admin)]
const accidentRows: [number, string, string, number, number, number, string | null, Cuaca | null, number][] = [
  [1, '2026-10-07T17:40:00.000Z', 'Jl. Soekarno Hatta depan Summarecon, arah timur', -6.9438, 107.6962, 2, 'Motor, truk', 'hujan', 2],
  [1, '2026-10-09T07:34:00.000Z', 'Jl. Soekarno Hatta, Bandung', -6.9393, 107.6616, 10, 'Motor, Mobil', 'hujan', 2],
  [2, '2026-10-11T09:29:00.000Z', 'Jl. Soekarno Hatta, Margacinta', -6.942, 107.6705, 5, 'Mobil, Bus', 'cerah', 2],
  [6, '2026-10-14T17:11:00.000Z', 'Jl. Raya Cibiru depan Pasar Cibiru', -6.9185, 107.7259, 2, 'Motor', 'hujan', 3],
  [13, '2026-10-16T19:34:00.000Z', 'Jl. Asia Afrika dekat Alun-alun', -6.9219, 107.6073, 3, 'Motor, Angkot', 'cerah', 2],
  [8, '2026-10-17T08:29:00.000Z', 'Jl. Raya Jatinangor depan gerbang Unpad', -6.9276, 107.771, 1, 'Motor', 'cerah', 3],
  [9, '2026-10-19T16:41:00.000Z', 'Jl. Raya Rancaekek, simpang Cikopo', -6.9699, 107.7932, 7, 'Truk, Motor', 'hujan', 2],
  [3, '2026-10-21T04:05:00.000Z', 'Jl. Soekarno Hatta simpang Buahbatu', -6.9448, 107.6411, 0, 'Mobil', null, 2],
];

export const MOCK_ACCIDENTS: KecelakaanResmi[] = accidentRows.map(
  ([zona_id, tanggal_waktu, lokasi_deskripsi, latitude, longitude, jumlah_korban, jenis_kendaraan_terlibat, kondisi_cuaca, input_by], i) => ({
    id_kejadian: i + 1,
    zona_id,
    input_by,
    tanggal_waktu,
    lokasi_deskripsi,
    latitude,
    longitude,
    jumlah_korban,
    jenis_kendaraan_terlibat,
    kondisi_cuaca,
    waktu_pelaporan: new Date(Date.parse(tanggal_waktu) + 18 * 3_600_000).toISOString(),
  }),
);
