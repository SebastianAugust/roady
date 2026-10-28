import { b64urlEncode, decodeToken } from '../auth/jwt';
import { isInBandungRaya } from '../config';
import { toCsv } from '../lib/csv';
import { checkExport } from '../lib/exportRules';
import { kategoriFromPercentile } from '../lib/risk';
import { alasanError } from '../lib/alasan';
import { kodeOf, MOCK_ACCIDENTS, namaOf, MOCK_HISTORY, MOCK_REPORTS, MOCK_USERS, MOCK_ZONES, zonePlace, type StoredKecelakaan, type StoredLaporan } from './mockData';
import { ApiError, type ApiClient } from './types';
import type {
  AccidentsQuery,
  CreateAccidentRequest,
  Cuaca,
  DishubReportsQuery,
  KategoriRisiko,
  KecelakaanResmi,
  KecelakaanTerhapus,
  Laporan,
  LaporanAdmin,
  Page,
  Role,
  StatusLaporan,
  User,
  Zona,
} from '../types';

const DELAY_MS = 400;
const wait = () => new Promise<void>((r) => setTimeout(r, DELAY_MS));

const users = MOCK_USERS;

const TOKEN_TTL_S = 8 * 60 * 60;

/** A JWT-shaped token (header.payload.signature) so the app decodes the role the same way it will with the real API. Unsigned. */
function token(u: User) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = b64urlEncode(JSON.stringify({ sub: u.id_user, role: u.role, iat: now, exp: now + TOKEN_TTL_S }));
  return `${header}.${payload}.mock`;
}

let currentToken: string | undefined;
export const setMockToken = (t: string | undefined) => {
  currentToken = t;
};

/** 401 without a valid token, 403 when the role is not allowed (docs/03, hak akses ringkas). */
function authorize(roles?: readonly Role[]) {
  const claims = decodeToken(currentToken);
  const user = users.find((u) => u.id_user === claims?.sub);
  if (!claims || !user) throw new ApiError(401, 'Sesi berakhir. Silakan masuk lagi.');
  if (roles && !roles.includes(user.role)) throw new ApiError(403, 'Anda tidak berhak mengakses data ini.');
  return user;
}

// No cross access (docs/05 #30): API-010 to 013 are Dishub only, API-007 to 009 Admin only; the other role gets 403.
const DISHUB: readonly Role[] = ['dishub'];
const ADMIN: readonly Role[] = ['admin'];

/** NFR-006: the reporter's user_id never leaves the API. */
const withoutReporter = ({ user_id: _omit, ...rest }: StoredLaporan): LaporanAdmin => rest;

/** Dishub does not see who verified a report; that trail is for the Admin. */
const forDishub = ({ diverifikasi_oleh: _by, diverifikasi_oleh_kode: _kode, diverifikasi_oleh_nama: _nama, ...rest }: LaporanAdmin): Laporan => rest;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function filterReports({ zona_id, dari, sampai }: DishubReportsQuery) {
  const errors: Record<string, string> = {};
  if (dari && !DATE.test(dari)) errors.dari = 'Format tanggal tidak valid.';
  if (sampai && !DATE.test(sampai)) errors.sampai = 'Format tanggal tidak valid.';
  if (dari && sampai && dari > sampai) errors.sampai = 'Tanggal akhir harus sama atau setelah tanggal awal.';
  if (Object.keys(errors).length) throw new ApiError(422, 'Filter tidak valid.', errors);
  return (
    MOCK_REPORTS
      // auto_rejected rows are only a trace of failed validation (outside Bandung Raya or empty fields), not reports.
      .filter((r) => r.status !== 'auto_rejected')
      .filter((r) => zona_id === undefined || r.zona_id === zona_id)
      .filter((r) => (!dari || r.tanggal_kejadian >= dari) && (!sampai || r.tanggal_kejadian <= sampai))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .map((r) => forDishub(withoutReporter(r)))
  );
}

// Explicit column allowlists: identity columns cannot end up in an export even if the row type grows.
const ZONA_COLUMNS = [
  'zona_id',
  'center_latitude',
  'center_longitude',
  'radius_zona',
  'skor_risiko',
  'kategori_risiko',
  'jumlah_kejadian',
  'weather_dependent',
  'last_updated',
] as const;
const LAPORAN_COLUMNS = [
  'id_report',
  'zona_id',
  'tanggal_kejadian',
  'timestamp',
  'kategori',
  'kondisi_cuaca_saat_kejadian',
  'status',
  'latitude',
  'longitude',
  'alamat_teks',
  'deskripsi',
  'foto_url',
] as const;

const STATUS: readonly StatusLaporan[] = ['auto_rejected', 'pending_review', 'auto_approved', 'approved', 'rejected'];
const CUACA: readonly Cuaca[] = ['cerah', 'hujan', 'lainnya'];

const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
};

const today = () => new Date().toISOString().slice(0, 10);

export const mockApi: ApiClient = {
  async login({ email, password }) {
    await wait();
    const user = users.find((u) => u.email === email.trim().toLowerCase());
    // Same message for wrong email and wrong password (API-002).
    if (!user || user.password !== password) throw new ApiError(401, 'Email atau kata sandi salah.');
    return { token: token(user), role: user.role };
  },

  async getMe() {
    await wait();
    const { id_user, nama, email, role, tanggal_terdaftar, kode_pengguna } = authorize();
    return { id_user, nama, email, role, tanggal_terdaftar, kode_pengguna };
  },

  async getZones({ lat, lng, radius }) {
    await wait();
    authorize();
    return MOCK_ZONES.filter((z) => distanceMeters(lat, lng, z.center_latitude, z.center_longitude) <= radius);
  },

  async getZone(zonaId) {
    await wait();
    authorize();
    const zone = MOCK_ZONES.find((z) => z.zona_id === zonaId);
    if (!zone) throw new ApiError(404, 'Zona tidak ditemukan.');
    return zone;
  },

  async getStatistics() {
    await wait();
    authorize(DISHUB);
    const rekap: Record<KategoriRisiko, number> = { merah: 0, kuning: 0, hijau: 0 };
    MOCK_ZONES.forEach((z) => rekap[z.kategori_risiko]++);
    return {
      rekap,
      total_zona: MOCK_ZONES.length,
      total_laporan: MOCK_REPORTS.filter((r) => r.status === 'approved' || r.status === 'auto_approved').length,
      total_kecelakaan_resmi: active().length, // soft-deleted rows are not counted
      zona_teratas: [...MOCK_ZONES]
        .sort((a, b) => b.skor_risiko - a.skor_risiko)
        .slice(0, 10)
        .map((z) => ({ ...z, lokasi_teks: zonePlace(z.zona_id) })),
      riwayat_skor: MOCK_ZONES.map((z) => ({ zona_id: z.zona_id, titik: MOCK_HISTORY[z.zona_id] ?? [] })),
    };
  },

  async getDishubZones() {
    await wait();
    authorize(DISHUB);
    return [...MOCK_ZONES].sort((a, b) => b.skor_risiko - a.skor_risiko).map((z) => ({ ...z, lokasi_teks: zonePlace(z.zona_id) }));
  },

  async getDishubZone(zonaId) {
    await wait();
    authorize(DISHUB);
    const zone = MOCK_ZONES.find((z) => z.zona_id === zonaId);
    if (!zone) throw new ApiError(404, 'Zona tidak ditemukan.');
    const riwayat = MOCK_HISTORY[zonaId] ?? [];
    return {
      ...zone,
      lokasi_teks: zonePlace(zonaId),
      persentase_kejadian_saat_hujan: riwayat.at(-1)?.persentase_kejadian_saat_hujan ?? 0,
      riwayat_skor: riwayat,
      kecelakaan: active()
        .filter((a) => a.zona_id === zonaId)
        .sort(URUT.terbaru)
        .map(publicAccident),
      // auto_rejected rows are only a validation trace (as in API-012); the reporter's user_id is stripped.
      laporan: MOCK_REPORTS.filter((r) => r.zona_id === zonaId && r.status !== 'auto_rejected')
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .map((r) => forDishub(withoutReporter(r))),
    };
  },

  async getDishubReport(id) {
    await wait();
    authorize(DISHUB);
    const report = MOCK_REPORTS.find((r) => r.id_report === id && r.status !== 'auto_rejected');
    if (!report) throw new ApiError(404, 'Laporan tidak ditemukan.');
    return forDishub(withoutReporter(report));
  },

  async getDishubReports(query) {
    await wait();
    authorize(DISHUB);
    return filterReports(query);
  },

  async exportData({ jenis, format, ...filters }) {
    await wait();
    authorize(DISHUB);
    const check = checkExport(jenis, format);
    if (!check.ok) throw new ApiError(422, 'Permintaan ekspor tidak valid.', check.errors);
    const content =
      check.jenis === 'zona'
        ? toCsv([...MOCK_ZONES].sort((a, b) => a.zona_id - b.zona_id), ZONA_COLUMNS)
        : toCsv(filterReports(filters), LAPORAN_COLUMNS);
    return { filename: `roady-${jenis}-${today()}.csv`, content };
  },

  async createAccident(body) {
    await wait();
    const user = authorize(DISHUB);
    const fields = validateAccident(body);
    const record: StoredKecelakaan = {
      ...fields,
      id_kejadian: Math.max(0, ...MOCK_ACCIDENTS.map((a) => a.id_kejadian)) + 1,
      zona_id: zoneFor(fields.latitude, fields.longitude),
      input_by: user.id_user, // from the token, never from the body (API-010)
      input_by_kode: user.kode_pengguna,
      input_by_nama: user.nama,
      waktu_pelaporan: new Date().toISOString(),
      dihapus_oleh: null,
      waktu_hapus: null,
      alasan_hapus: null,
    };
    MOCK_ACCIDENTS.push(record);
    return publicAccident(record);
  },

  async getAdminReports({ status }) {
    await wait();
    authorize(ADMIN);
    if (status !== undefined && !STATUS.includes(status)) throw new ApiError(422, 'Status tidak dikenal.', { status: 'Status tidak dikenal.' });
    const decided = status === 'approved' || status === 'rejected';
    return (
      MOCK_REPORTS.filter((r) => !status || r.status === status)
        // The queue: the report waiting longest comes first. Decided lists: most recently decided first.
        .sort((a, b) => (decided ? (b.waktu_verifikasi ?? '').localeCompare(a.waktu_verifikasi ?? '') : a.timestamp.localeCompare(b.timestamp)))
        .map(withoutReporter)
    );
  },

  async verifyReport(id, { keputusan, alasan }) {
    await wait();
    const admin = authorize(ADMIN);
    const report = MOCK_REPORTS.find((r) => r.id_report === id);
    if (!report) throw new ApiError(404, 'Laporan tidak ditemukan.');
    if (keputusan !== 'approved' && keputusan !== 'rejected')
      throw new ApiError(422, 'Keputusan tidak valid.', { keputusan: 'Keputusan harus "approved" atau "rejected".' });
    if (report.status !== 'pending_review') throw new ApiError(409, 'Laporan ini sudah diverifikasi sebelumnya.');
    if (keputusan === 'rejected' && alasanError(alasan)) throw new ApiError(422, 'Alasan penolakan wajib diisi.', { alasan: alasanError(alasan) as string });
    report.status = keputusan;
    report.waktu_verifikasi = new Date().toISOString();
    report.diverifikasi_oleh = admin.id_user; // from the token
    report.diverifikasi_oleh_kode = admin.kode_pengguna;
    report.diverifikasi_oleh_nama = admin.nama;
    report.alasan_penolakan = keputusan === 'rejected' ? (alasan as string).trim() : null;
    // Zone scores are NOT recomputed here: the scheduler adds a new KALKULASI_RISIKO row on its next run (docs/01).
    // ponytail: FCM goes out from the backend later; the mock only logs it, without the reporter's id.
    console.info(`[FCM mock] Notifikasi ke pelapor laporan #${id}: laporan ${keputusan === 'approved' ? 'disetujui' : 'ditolak'}.`);
    return { laporan: withoutReporter(report), notifikasi_terkirim: true };
  },

  async getDishubAccidents(query = {}) {
    await wait();
    authorize(DISHUB);
    return mapPage(queryAccidents(active(), query), publicAccident);
  },

  async getDishubAccident(id) {
    await wait();
    authorize(DISHUB);
    return publicAccident(findAccident(id));
  },

  async getAccidents(query = {}) {
    await wait();
    authorize(ADMIN);
    return mapPage(queryAccidents(active(), query), publicAccident);
  },

  async getDeletedAccidents(query = {}) {
    await wait();
    authorize(ADMIN);
    return mapPage(
      queryAccidents(
        MOCK_ACCIDENTS.filter((a) => a.dihapus_oleh !== null),
        query,
        (a) => a.waktu_hapus ?? '',
      ),
      deletedAccident,
    );
  },

  async getAccident(id) {
    await wait();
    authorize(ADMIN);
    return publicAccident(findAccident(id));
  },

  async updateAccident(id, body) {
    await wait();
    authorize(ADMIN);
    const record = findAccident(id);
    const fields = validateAccident(body);
    // input_by and waktu_pelaporan keep their original values; only the accident data changes.
    Object.assign(record, fields, { zona_id: zoneFor(fields.latitude, fields.longitude) });
    return publicAccident(record);
  },

  async deleteAccident(id, body) {
    await wait();
    const admin = authorize(ADMIN);
    const record = findAccident(id);
    if (alasanError(body?.alasan)) throw new ApiError(422, 'Alasan penghapusan wajib diisi.', { alasan: alasanError(body?.alasan) as string });
    // Soft delete: the row stays with who, when and why; it leaves the lists and the zone counts.
    record.dihapus_oleh = admin.id_user; // from the token
    record.waktu_hapus = new Date().toISOString();
    record.alasan_hapus = body.alasan.trim();
  },
};

const mapPage = <T, U>(page: Page<T>, fn: (row: T) => U): Page<U> => ({ ...page, data: page.data.map(fn) });

/** Rows that are not soft-deleted. */
const active = () => MOCK_ACCIDENTS.filter((a) => a.dihapus_oleh === null);

/** The row as the API returns it: without the deletion columns (only the deleted list has them). */
function publicAccident({ dihapus_oleh: _by, waktu_hapus: _at, alasan_hapus: _why, ...rest }: StoredKecelakaan): KecelakaanResmi {
  return rest;
}

function deletedAccident(a: StoredKecelakaan): KecelakaanTerhapus {
  return { ...publicAccident(a), dihapus_oleh: a.dihapus_oleh as number, dihapus_oleh_kode: kodeOf(a.dihapus_oleh as number), dihapus_oleh_nama: namaOf(a.dihapus_oleh as number), waktu_hapus: a.waktu_hapus as string, alasan_hapus: a.alasan_hapus as string };
}

const wibDate = (iso: string) => new Date(Date.parse(iso) + 7 * 3_600_000).toISOString().slice(0, 10);
const URUT: Record<string, (a: StoredKecelakaan, b: StoredKecelakaan) => number> = {
  terbaru: (a, b) => b.tanggal_waktu.localeCompare(a.tanggal_waktu),
  terlama: (a, b) => a.tanggal_waktu.localeCompare(b.tanggal_waktu),
  korban_terbanyak: (a, b) => b.jumlah_korban - a.jumlah_korban,
  korban_tersedikit: (a, b) => a.jumlah_korban - b.jumlah_korban,
};

/** Filters, sorts and pages accident rows (query of GET /api/admin/accidents). 422 with errors per parameter when one is invalid. */
function queryAccidents(rows: StoredKecelakaan[], query: AccidentsQuery, dateOf: (a: StoredKecelakaan) => string = (a) => a.tanggal_waktu): Page<StoredKecelakaan> {
  const { tanggal_dari, tanggal_sampai, zona_id, lokasi, cuaca, jenis_kendaraan, korban_min, korban_max, diinput_oleh, q, urut = 'terbaru', halaman = 1, per_halaman = 20 } = query;
  const errors: Record<string, string> = {};
  if (tanggal_dari && !DATE.test(tanggal_dari)) errors.tanggal_dari = 'Format tanggal tidak valid.';
  if (tanggal_sampai && !DATE.test(tanggal_sampai)) errors.tanggal_sampai = 'Format tanggal tidak valid.';
  if (tanggal_dari && tanggal_sampai && tanggal_dari > tanggal_sampai) errors.tanggal_sampai = 'Tanggal akhir harus sama atau setelah tanggal awal.';
  if (korban_min !== undefined && korban_max !== undefined && korban_min > korban_max) errors.korban_max = 'korban_max harus sama atau lebih besar dari korban_min.';
  if (cuaca !== undefined && !CUACA.includes(cuaca)) errors.cuaca = 'Kondisi cuaca tidak dikenal.';
  if (!(urut in URUT)) errors.urut = 'Urutan tidak dikenal.';
  if (!Number.isInteger(halaman) || halaman < 1) errors.halaman = 'halaman harus bilangan bulat 1 atau lebih.';
  if (!Number.isInteger(per_halaman) || per_halaman < 1 || per_halaman > 100) errors.per_halaman = 'per_halaman harus 1 sampai 100.';
  if (Object.keys(errors).length) throw new ApiError(422, 'Filter tidak valid.', errors);

  const has = (text: string | null | undefined, needle: string) => (text ?? '').toLowerCase().includes(needle.trim().toLowerCase());
  const found = rows
    .filter((a) => !tanggal_dari || wibDate(a.tanggal_waktu) >= tanggal_dari)
    .filter((a) => !tanggal_sampai || wibDate(a.tanggal_waktu) <= tanggal_sampai)
    .filter((a) => zona_id === undefined || a.zona_id === zona_id)
    .filter((a) => !lokasi || has(a.lokasi_deskripsi, lokasi))
    .filter((a) => !cuaca || a.kondisi_cuaca === cuaca)
    .filter((a) => !jenis_kendaraan || has(a.jenis_kendaraan_terlibat, jenis_kendaraan))
    .filter((a) => korban_min === undefined || a.jumlah_korban >= korban_min)
    .filter((a) => korban_max === undefined || a.jumlah_korban <= korban_max)
    .filter((a) => !diinput_oleh || a.input_by_kode === diinput_oleh)
    .filter((a) => !q || has(a.lokasi_deskripsi, q) || has(a.jenis_kendaraan_terlibat, q) || has(a.input_by_kode, q))
    // The deleted list is sorted by deletion time unless another order is asked for.
    .sort(query.urut ? URUT[urut] : (a, b) => dateOf(b).localeCompare(dateOf(a)));
  return { data: found.slice((halaman - 1) * per_halaman, halaman * per_halaman), total: found.length, halaman, per_halaman };
}

function findAccident(id: number) {
  // Deleted rows are gone for every endpoint except /deleted.
  const record = active().find((a) => a.id_kejadian === id);
  if (!record) throw new ApiError(404, 'Data kecelakaan tidak ditemukan.');
  return record;
}

/** API-010 and API-009 PUT share these rules: 422 with one message per field. Returns the cleaned fields. */
function validateAccident(body: CreateAccidentRequest): CreateAccidentRequest {
  const { tanggal_waktu, lokasi_deskripsi, latitude, longitude, jumlah_korban, jenis_kendaraan_terlibat, kondisi_cuaca } = body;
  const errors: Record<string, string> = {};
  const when = Date.parse(tanggal_waktu);
  if (Number.isNaN(when)) errors.tanggal_waktu = 'Tanggal dan waktu wajib diisi.';
  else if (when > Date.now()) errors.tanggal_waktu = 'Tanggal kejadian tidak boleh di masa depan.';
  if (!lokasi_deskripsi?.trim()) errors.lokasi_deskripsi = 'Deskripsi lokasi wajib diisi.';
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) errors.koordinat = 'Koordinat wajib diisi.';
  else if (!isInBandungRaya(latitude, longitude)) errors.koordinat = 'Koordinat berada di luar wilayah Bandung Raya.';
  if (!Number.isInteger(jumlah_korban) || jumlah_korban < 0) errors.jumlah_korban = 'Jumlah korban harus bilangan bulat 0 atau lebih.';
  if (kondisi_cuaca != null && !CUACA.includes(kondisi_cuaca)) errors.kondisi_cuaca = 'Kondisi cuaca tidak dikenal.';
  if (Object.keys(errors).length) throw new ApiError(422, 'Data tidak valid.', errors);
  return {
    tanggal_waktu: new Date(when).toISOString(),
    lokasi_deskripsi: lokasi_deskripsi.trim(),
    latitude,
    longitude,
    jumlah_korban,
    jenis_kendaraan_terlibat: jenis_kendaraan_terlibat?.trim() || null,
    kondisi_cuaca: kondisi_cuaca ?? null,
  };
}

/**
 * Clustering as in docs/01: the zone whose center is within radius_zona, otherwise a new zone at this point.
 * Counts and scores are left alone: the scheduler recomputes them (KALKULASI_RISIKO); a new zone shows as hijau until then.
 */
function zoneFor(latitude: number, longitude: number) {
  const zone = MOCK_ZONES.find((z) => distanceMeters(latitude, longitude, z.center_latitude, z.center_longitude) <= z.radius_zona);
  if (zone) return zone.zona_id;
  const created: Zona = {
    zona_id: Math.max(...MOCK_ZONES.map((z) => z.zona_id)) + 1,
    center_latitude: latitude,
    center_longitude: longitude,
    radius_zona: MOCK_ZONES[0]?.radius_zona ?? 300,
    skor_risiko: 0,
    kategori_risiko: kategoriFromPercentile(0),
    jumlah_kejadian: 0,
    weather_dependent: false,
    last_updated: new Date().toISOString(),
  };
  MOCK_ZONES.push(created);
  return created.zona_id;
}
