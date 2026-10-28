import { kategoriFromPercentile } from '../lib/risk';
import type { Cuaca, JenisLaporan, Kategori, KecelakaanResmi, LaporanAdmin, RiwayatSkorPoint, Role, StatusLaporan, User, Zona } from '../types';

// Seeded like the real backend: Dishub and Admin accounts are made by the team (the first three match mobile/src/api/mock.ts).
// kode_pengguna = YYYYMMDD of registration - role code (01 admin, 02 dishub, 03 pengemudi) - number within the role.
export const MOCK_USERS: (User & { password: string })[] = [
  { id_user: 1, nama: 'Jane Doe', email: 'pengemudi@roady.test', password: 'password123', role: 'pengemudi', tanggal_terdaftar: '2026-09-01T03:00:00.000Z', kode_pengguna: '20260901-03-0001' },
  { id_user: 2, nama: 'Petugas Dishub', email: 'dishub@roady.test', password: 'password123', role: 'dishub', tanggal_terdaftar: '2026-10-22T03:00:00.000Z', kode_pengguna: '20261022-02-0001' },
  { id_user: 3, nama: 'Admin Roady', email: 'admin@roady.test', password: 'password123', role: 'admin', tanggal_terdaftar: '2026-10-22T03:00:00.000Z', kode_pengguna: '20261022-01-0001' },
  { id_user: 4, nama: 'Budi Santoso', email: 'budi@roady.test', password: 'password123', role: 'pengemudi', tanggal_terdaftar: '2026-09-15T03:00:00.000Z', kode_pengguna: '20260915-03-0002' },
  { id_user: 5, nama: 'Siti Rahma', email: 'siti@roady.test', password: 'password123', role: 'pengemudi', tanggal_terdaftar: '2026-09-18T03:00:00.000Z', kode_pengguna: '20260918-03-0003' },
  { id_user: 6, nama: 'Agus Pratama', email: 'agus@roady.test', password: 'password123', role: 'pengemudi', tanggal_terdaftar: '2026-09-20T03:00:00.000Z', kode_pengguna: '20260920-03-0004' },
  { id_user: 7, nama: 'Dewi Lestari', email: 'dishub2@roady.test', password: 'password123', role: 'dishub', tanggal_terdaftar: '2026-10-23T03:00:00.000Z', kode_pengguna: '20261023-02-0002' },
  { id_user: 8, nama: 'Rudi Hartono', email: 'admin2@roady.test', password: 'password123', role: 'admin', tanggal_terdaftar: '2026-10-23T03:00:00.000Z', kode_pengguna: '20261023-01-0002' },
];

/** nama of a user id (joined next to kode_pengguna in Admin responses). */
export const namaOf = (idUser: number) => MOCK_USERS.find((u) => u.id_user === idUser)?.nama ?? '-';

/** kode_pengguna of a user id (the server joins it into verification and accident rows). */
export const kodeOf = (idUser: number) => MOCK_USERS.find((u) => u.id_user === idUser)?.kode_pengguna ?? '-';

const ROLE_CODE: Record<Role, string> = { admin: '01', dishub: '02', pengemudi: '03' };

/** Next kode_pengguna for a new account, e.g. 20261028-03-0009; the number counts the accounts of that role. */
export function nextKode(role: Role, registeredAt: Date) {
  const date = registeredAt.toISOString().slice(0, 10).replaceAll('-', '');
  const count = MOCK_USERS.filter((u) => u.role === role).length + 1;
  return `${date}-${ROLE_CODE[role]}-${String(count).padStart(4, '0')}`;
}

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
// [street, kelurahan, kecamatan, kota or kabupaten] per zone, in the order of zoneRows: the parts of a saved address.
const zoneAddressRows: [string, string, string, string][] = [
  ['Jl. Soekarno Hatta', 'Cisaranten Kidul', 'Gedebage', 'Kota Bandung'],
  ['Jl. Soekarno Hatta', 'Margasari', 'Buahbatu', 'Kota Bandung'],
  ['Jl. Soekarno Hatta', 'Cijaura', 'Buahbatu', 'Kota Bandung'],
  ['Jl. Soekarno Hatta', 'Kebon Lega', 'Bojongloa Kidul', 'Kota Bandung'],
  ['Jl. Soekarno Hatta', 'Situsaeur', 'Bojongloa Kidul', 'Kota Bandung'],
  ['Jl. Raya Cibiru', 'Cipadung', 'Cibiru', 'Kota Bandung'],
  ['Jl. Raya Cinunuk', 'Cinunuk', 'Cileunyi', 'Kab. Bandung'],
  ['Jl. Raya Jatinangor', 'Cibeusi', 'Jatinangor', 'Kab. Sumedang'],
  ['Jl. Raya Rancaekek', 'Linggar', 'Rancaekek', 'Kab. Bandung'],
  ['Jl. Raya Cicalengka', 'Cicalengka Wetan', 'Cicalengka', 'Kab. Bandung'],
  ['Jl. Dipati Ukur', 'Lebakgede', 'Coblong', 'Kota Bandung'],
  ['Jl. Dr. Djundjunan', 'Pasteur', 'Sukajadi', 'Kota Bandung'],
  ['Jl. Asia Afrika', 'Braga', 'Sumur Bandung', 'Kota Bandung'],
  ['Jl. Amir Machmud', 'Setiamanah', 'Cimahi Tengah', 'Kota Cimahi'],
  ['Jl. Raya Bojongsoang', 'Bojongsoang', 'Bojongsoang', 'Kab. Bandung'],
  ['Jl. Raya Lembang', 'Lembang', 'Lembang', 'Kab. Bandung Barat'],
];

/** A full saved address in the format of alamat_teks: "Jl. Dipati Ukur No. 35, Lebakgede, Kec. Coblong, Kota Bandung". */
export function zoneAddress(zonaId: number, houseNumber: number): string {
  const [street, kelurahan, kecamatan, kota] = zoneAddressRows[zonaId - 1] ?? zoneAddressRows[0];
  return `${street} No. ${houseNumber}, ${kelurahan}, Kec. ${kecamatan}, ${kota}`;
}

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
      // The other KALKULASI_RISIKO columns: the event count grows towards today's, the rain share is fixed per zone.
      const rain = z.weather_dependent ? 52 + ((z.zona_id * 7) % 25) : 8 + ((z.zona_id * 5) % 22);
      const jumlah = Math.max(1, z.jumlah_kejadian - Math.floor(weeksAgo / 2));
      return { last_updated: date, skor_risiko: skor, kategori_risiko: kategoriFromPercentile(skor), jumlah_kejadian: jumlah, persentase_kejadian_saat_hujan: rain };
    });
    return [z.zona_id, titik];
  }),
);

/** Internal report row: the mock keeps user_id like the real table does, and strips it before anything leaves the API. */
export type StoredLaporan = LaporanAdmin & { user_id: number };

// [zona_id, kategori, cuaca, status, tanggal, has photo, deskripsi, alasan_penolakan (rejected only)]
const reportRows: [number, Kategori, Cuaca, StatusLaporan, string, boolean, string, string?][] = [
  [1, 'kecelakaan', 'hujan', 'approved', '2026-10-17', true, 'Kecelakaan beruntun, 1 mobil dan 2 motor, jalan licin.'],
  [1, 'near_miss', 'hujan', 'auto_approved', '2026-10-15', false, 'Motor hampir tergelincir di genangan dekat lampu merah.'],
  [1, 'kecelakaan', 'cerah', 'pending_review', '2026-10-21', true, 'Motor menabrak pembatas jalan saat menyalip truk.'],
  [2, 'kecelakaan', 'cerah', 'approved', '2026-10-12', true, 'Tabrakan mobil dan motor di putaran balik.'],
  [2, 'near_miss', 'cerah', 'auto_approved', '2026-10-09', false, 'Mobil memotong jalur tanpa lampu sein.'],
  [3, 'kecelakaan', 'cerah', 'approved', '2026-10-14', true, 'Kecelakaan tunggal motor di perempatan Buahbatu.'],
  [3, 'near_miss', 'hujan', 'auto_approved', '2026-10-03', false, 'Pejalan kaki menyeberang mendadak saat hujan deras.'],
  [4, 'near_miss', 'cerah', 'auto_approved', '2026-09-28', false, 'Angkot berhenti mendadak menaikkan penumpang.'],
  [4, 'kecelakaan', 'hujan', 'rejected', '2026-10-01', true, 'Motor jatuh di dekat halte Kopo.', 'Foto tidak menunjukkan lokasi kejadian. Kirim ulang dengan foto yang jelas di lokasi.'],
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
  [3, 'kecelakaan', 'cerah', 'rejected', '2026-10-06', true, 'Tabrakan di Buahbatu.', 'Foto yang dilampirkan bukan foto kejadian, melainkan gambar dari internet.'],
  [7, 'near_miss', 'hujan', 'rejected', '2026-10-09', true, 'Hampir tertabrak truk di Cinunuk.', 'Deskripsi tidak sesuai dengan foto; waktu dan lokasi pada foto berbeda.'],
];

const APPROVE_REASONS = [
  'Bukti foto jelas dan lokasi sesuai dengan koordinat laporan.',
  'Dilaporkan oleh beberapa pengguna di lokasi yang sama.',
  'Deskripsi sesuai dengan foto kejadian, waktu dan lokasi masuk akal.',
];

// Reporters are drivers 1, 4, 5, 6 in the mock user table; they never appear in any Dishub response.
const REPORTERS = [1, 4, 5, 6];

export const MOCK_REPORTS: StoredLaporan[] = reportRows.map(([zonaId, kategori, cuaca, status, tanggal, foto, deskripsi, alasan], i) => {
  const zone = MOCK_ZONES[zonaId - 1];
  // Spread the points a little around the zone center, inside radius_zona.
  const offset = ((i % 5) - 2) * 0.0006;
  const decided = status === 'approved' || status === 'rejected';
  return {
    id_report: i + 1,
    user_id: REPORTERS[i % REPORTERS.length],
    zona_id: zonaId,
    latitude: Number((zone.center_latitude + offset).toFixed(5)),
    longitude: Number((zone.center_longitude - offset).toFixed(5)),
    // Every report carries its saved address (docs/05 #12); the house number varies so the sample data does not repeat itself.
    alamat_teks: zoneAddress(zonaId, 5 + ((i * 7) % 60)),
    kategori,
    deskripsi,
    // ponytail: one placeholder image for every mock photo until the storage (docs/05 open item 7) exists.
    foto_url: foto ? `/mock-foto.svg#laporan-${i + 1}` : null,
    tanggal_kejadian: tanggal,
    kondisi_cuaca_saat_kejadian: cuaca,
    timestamp: `${tanggal}T0${(i % 9) + 1}:15:00.000Z`,
    status,
    // Decided reports were verified the day after they came in; pending and automatic ones have no verification time.
    waktu_verifikasi: decided ? new Date(Date.parse(tanggal) + 30 * 3_600_000).toISOString() : null,
    // Two Admins share the decisions; automatic and pending reports have no verifier.
    diverifikasi_oleh: decided ? (i % 2 ? 8 : 3) : null,
    diverifikasi_oleh_kode: decided ? kodeOf(i % 2 ? 8 : 3) : null,
    diverifikasi_oleh_nama: decided ? namaOf(i % 2 ? 8 : 3) : null,
    // Both decisions carry a written reason (min. 15 characters); alasan_penolakan repeats it for rejected rows.
    alasan_verifikasi: status === 'approved' ? APPROVE_REASONS[i % APPROVE_REASONS.length] : status === 'rejected' ? (alasan ?? 'Laporan tidak memenuhi syarat verifikasi.') : null,
    alasan_penolakan: status === 'rejected' ? (alasan ?? 'Laporan tidak memenuhi syarat verifikasi.') : null,
  };
});

/** Internal accident row: the soft-delete trail stays in the table; active rows have dihapus_oleh null. */
export type StoredKecelakaan = KecelakaanResmi & { dihapus_oleh: number | null; waktu_hapus: string | null; alasan_hapus: string | null };

// [zona_id, tanggal_waktu (UTC), lokasi, lat, lng, korban, kendaraan, cuaca, input_by (Dishub 2 or 7, Admin 3 or 8),
//  deleted: [dihapus_oleh (an Admin), alasan_hapus] or undefined]
type AccidentRow = [number, string, string, number, number, number, string | null, Cuaca | null, number, [number, string]?];
const accidentRows: AccidentRow[] = [
  [1, '2026-10-07T17:40:00.000Z', 'Jl. Soekarno Hatta depan Summarecon, arah timur', -6.9438, 107.6962, 2, 'Motor, truk', 'hujan', 2],
  [1, '2026-10-09T07:34:00.000Z', 'Jl. Soekarno Hatta, Bandung', -6.9393, 107.6616, 10, 'Motor, Mobil', 'hujan', 2],
  [2, '2026-10-11T09:29:00.000Z', 'Jl. Soekarno Hatta, Margacinta', -6.942, 107.6705, 5, 'Mobil, Bus', 'cerah', 7],
  [6, '2026-10-14T17:11:00.000Z', 'Jl. Raya Cibiru depan Pasar Cibiru', -6.9185, 107.7259, 2, 'Motor', 'hujan', 3],
  [13, '2026-10-16T19:34:00.000Z', 'Jl. Asia Afrika dekat Alun-alun', -6.9219, 107.6073, 3, 'Motor, Angkot', 'cerah', 7],
  [8, '2026-10-17T08:29:00.000Z', 'Jl. Raya Jatinangor depan gerbang Unpad', -6.9276, 107.771, 1, 'Motor', 'cerah', 8],
  [9, '2026-10-19T16:41:00.000Z', 'Jl. Raya Rancaekek, simpang Cikopo', -6.9699, 107.7932, 7, 'Truk, Motor', 'hujan', 2],
  [3, '2026-10-21T04:05:00.000Z', 'Jl. Soekarno Hatta simpang Buahbatu', -6.9448, 107.6411, 0, 'Mobil', null, 2],
  [7, '2026-10-22T11:15:00.000Z', 'Jl. Raya Cinunuk depan pasar', -6.9427, 107.7315, 4, 'Motor, Mobil', 'hujan', 8],
  [12, '2026-10-23T02:50:00.000Z', 'Jl. Pasteur dekat pintu tol', -6.9035, 107.6191, 1, 'Mobil', 'cerah', 7],
  // Deleted rows (soft delete): kept for the trail, not listed normally and not counted in the zone scores.
  [1, '2026-10-08T05:10:00.000Z', 'Jl. Soekarno Hatta Gedebage (data ganda)', -6.9437, 107.696, 2, 'Motor', 'hujan', 2, [3, 'Data ganda, sudah tercatat pada kejadian 7 Oktober 2026.']],
  [4, '2026-10-12T13:00:00.000Z', 'Jl. Kopo (salah lokasi)', -6.9502, 107.6119, 1, 'Motor', null, 7, [8, 'Lokasi salah input, kejadian sebenarnya di Cimahi dan sudah diinput ulang.']],
  [16, '2026-10-15T09:20:00.000Z', 'Jl. Raya Lembang (uji coba)', -6.8394, 107.5746, 0, null, null, 2, [3, 'Data uji coba, bukan kejadian nyata.']],
];

export const MOCK_ACCIDENTS: StoredKecelakaan[] = accidentRows.map(
  ([zona_id, tanggal_waktu, lokasi_deskripsi, latitude, longitude, jumlah_korban, jenis_kendaraan_terlibat, kondisi_cuaca, input_by, deleted], i) => ({
    id_kejadian: i + 1,
    zona_id,
    input_by,
    input_by_kode: kodeOf(input_by),
    input_by_nama: namaOf(input_by),
    // Entries made before the templates existed: plain kecelakaan, no photo, no template answers.
    jenis: 'kecelakaan' as JenisLaporan,
    foto_url: null,
    detail: null,
    tanggal_waktu,
    lokasi_deskripsi,
    latitude,
    longitude,
    jumlah_korban,
    jenis_kendaraan_terlibat,
    kondisi_cuaca,
    waktu_pelaporan: new Date(Date.parse(tanggal_waktu) + 18 * 3_600_000).toISOString(),
    dihapus_oleh: deleted?.[0] ?? null,
    waktu_hapus: deleted ? new Date(Date.parse(tanggal_waktu) + 3 * 86_400_000).toISOString() : null,
    alasan_hapus: deleted?.[1] ?? null,
  }),
);

// Entries made with the Dishub templates (shared/reportTemplates.ts): one of each kind, so the archive shows all three.
const templateAccidents: Omit<StoredKecelakaan, 'id_kejadian' | 'input_by_kode' | 'input_by_nama' | 'dihapus_oleh' | 'waktu_hapus' | 'alasan_hapus' | 'waktu_pelaporan'>[] = [
  {
    jenis: 'kecelakaan',
    zona_id: 11,
    input_by: 2,
    tanggal_waktu: '2026-10-24T01:20:00.000Z',
    lokasi_deskripsi: zoneAddress(11, 35),
    latitude: -6.8937,
    longitude: 107.6152,
    jumlah_korban: 3,
    jenis_kendaraan_terlibat: 'Motor, Mobil',
    kondisi_cuaca: 'hujan',
    foto_url: '/mock-foto.svg#arsip-14',
    detail: {
      kendaraan: ['motor', 'mobil'],
      korban_meninggal: 0,
      korban_luka_berat: 1,
      korban_luka_ringan: 2,
      kondisi_jalan: 'basah_licin',
      dugaan_penyebab: 'kecepatan',
      kronologi: 'Motor melaju kencang di turunan Dipati Ukur saat hujan, tidak sempat mengerem dan menabrak bagian belakang mobil yang berhenti di lampu merah. Pengendara motor dilarikan ke rumah sakit.',
    },
  },
  {
    jenis: 'nyaris_celaka',
    zona_id: 13,
    input_by: 7,
    tanggal_waktu: '2026-10-25T00:45:00.000Z',
    lokasi_deskripsi: zoneAddress(13, 65),
    latitude: -6.9216,
    longitude: 107.6074,
    jumlah_korban: 0,
    jenis_kendaraan_terlibat: 'Motor, Angkot',
    kondisi_cuaca: 'cerah',
    foto_url: null,
    detail: {
      kendaraan: ['motor', 'angkot'],
      hampir_terjadi: 'tabrakan_kendaraan',
      penyebab: 'pengemudi_lain',
      kronologi: 'Angkot berhenti mendadak di jalur kanan untuk menurunkan penumpang tanpa memberi tanda. Motor di belakangnya mengerem keras dan hampir menabrak.',
    },
  },
  {
    jenis: 'masalah_jalan',
    zona_id: 6,
    input_by: 2,
    tanggal_waktu: '2026-10-26T02:10:00.000Z',
    lokasi_deskripsi: zoneAddress(6, 18),
    latitude: -6.9181,
    longitude: 107.7254,
    jumlah_korban: 0,
    jenis_kendaraan_terlibat: null,
    kondisi_cuaca: null,
    foto_url: '/mock-foto.svg#arsip-16',
    detail: {
      jenis_masalah: 'lubang',
      tingkat_bahaya: 'tinggi',
      deskripsi: 'Lubang sedalam kira-kira 15 cm di lajur kiri setelah lampu merah, tertutup genangan sehingga tidak terlihat oleh pengendara motor.',
    },
  },
];

templateAccidents.forEach((a) => {
  const id = MOCK_ACCIDENTS.length + 1;
  MOCK_ACCIDENTS.push({
    ...a,
    id_kejadian: id,
    input_by_kode: kodeOf(a.input_by),
    input_by_nama: namaOf(a.input_by),
    waktu_pelaporan: new Date(Date.parse(a.tanggal_waktu) + 2 * 3_600_000).toISOString(),
    dihapus_oleh: null,
    waktu_hapus: null,
    alasan_hapus: null,
  });
});
