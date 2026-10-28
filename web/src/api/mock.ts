import { b64urlEncode, decodeToken } from '../auth/jwt';
import { isInBandungRaya } from '../config';
import { toCsv } from '../lib/csv';
import { checkExport } from '../lib/exportRules';
import { kategoriFromPercentile } from '../lib/risk';
import { MOCK_ACCIDENTS, MOCK_HISTORY, MOCK_REPORTS, MOCK_ZONES, zonePlace, type StoredLaporan } from './mockData';
import { ApiError, type ApiClient } from './types';
import type { CreateAccidentRequest, Cuaca, DishubReportsQuery, KategoriRisiko, KecelakaanResmi, Laporan, Role, User, Zona } from '../types';

const DELAY_MS = 400;
const wait = () => new Promise<void>((r) => setTimeout(r, DELAY_MS));

// Seeded like the real backend: Dishub and Admin accounts are made by the team (same accounts as mobile/src/api/mock.ts).
const users: (User & { password: string })[] = [
  { id_user: 1, nama: 'Jane Doe', email: 'pengemudi@roady.test', password: 'password123', role: 'pengemudi', tanggal_terdaftar: '2026-09-01T03:00:00.000Z' },
  { id_user: 2, nama: 'Petugas Dishub', email: 'dishub@roady.test', password: 'password123', role: 'dishub', tanggal_terdaftar: '2026-10-22T03:00:00.000Z' },
  { id_user: 3, nama: 'Admin Roady', email: 'admin@roady.test', password: 'password123', role: 'admin', tanggal_terdaftar: '2026-10-22T03:00:00.000Z' },
];

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
const withoutReporter = ({ user_id: _omit, ...rest }: StoredLaporan): Laporan => rest;

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
      .map(withoutReporter)
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
    const { id_user, nama, email, role, tanggal_terdaftar } = authorize();
    return { id_user, nama, email, role, tanggal_terdaftar };
  },

  async getZones({ lat, lng, radius }) {
    await wait();
    authorize();
    return MOCK_ZONES.filter((z) => distanceMeters(lat, lng, z.center_latitude, z.center_longitude) <= radius);
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
      total_kecelakaan_resmi: MOCK_ACCIDENTS.length,
      zona_teratas: [...MOCK_ZONES]
        .sort((a, b) => b.skor_risiko - a.skor_risiko)
        .slice(0, 10)
        .map((z) => ({ ...z, lokasi_teks: zonePlace(z.zona_id) })),
      riwayat_skor: MOCK_ZONES.map((z) => ({ zona_id: z.zona_id, titik: MOCK_HISTORY[z.zona_id] ?? [] })),
    };
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
    const record: KecelakaanResmi = {
      ...fields,
      id_kejadian: Math.max(0, ...MOCK_ACCIDENTS.map((a) => a.id_kejadian)) + 1,
      zona_id: zoneFor(fields.latitude, fields.longitude),
      input_by: user.id_user, // from the token, never from the body (API-010)
      waktu_pelaporan: new Date().toISOString(),
    };
    MOCK_ACCIDENTS.push(record);
    return record;
  },

  async getAdminReports({ status }) {
    await wait();
    authorize(ADMIN);
    return (
      MOCK_REPORTS.filter((r) => !status || r.status === status)
        // A queue: the report waiting longest comes first.
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .map(withoutReporter)
    );
  },

  async verifyReport(id, { keputusan }) {
    await wait();
    authorize(ADMIN);
    const report = MOCK_REPORTS.find((r) => r.id_report === id);
    if (!report) throw new ApiError(404, 'Laporan tidak ditemukan.');
    if (keputusan !== 'approved' && keputusan !== 'rejected')
      throw new ApiError(422, 'Keputusan tidak valid.', { keputusan: 'Keputusan harus "approved" atau "rejected".' });
    if (report.status !== 'pending_review') throw new ApiError(409, 'Laporan ini sudah diverifikasi sebelumnya.');
    report.status = keputusan;
    report.waktu_verifikasi = new Date().toISOString();
    // Zone scores are NOT recomputed here: the scheduler adds a new KALKULASI_RISIKO row on its next run (docs/01).
    // ponytail: FCM goes out from the backend later; the mock only logs it, without the reporter's id.
    console.info(`[FCM mock] Notifikasi ke pelapor laporan #${id}: laporan ${keputusan === 'approved' ? 'disetujui' : 'ditolak'}.`);
    return { laporan: withoutReporter(report), notifikasi_terkirim: true };
  },

  async getDishubAccidents() {
    await wait();
    authorize(DISHUB);
    return [...MOCK_ACCIDENTS].sort((a, b) => b.tanggal_waktu.localeCompare(a.tanggal_waktu));
  },

  async getAccidents() {
    await wait();
    authorize(ADMIN);
    return [...MOCK_ACCIDENTS].sort((a, b) => b.tanggal_waktu.localeCompare(a.tanggal_waktu));
  },

  async getAccident(id) {
    await wait();
    authorize(ADMIN);
    return findAccident(id);
  },

  async updateAccident(id, body) {
    await wait();
    authorize(ADMIN);
    const record = findAccident(id);
    const fields = validateAccident(body);
    // input_by and waktu_pelaporan keep their original values; only the accident data changes.
    Object.assign(record, fields, { zona_id: zoneFor(fields.latitude, fields.longitude) });
    return { ...record };
  },

  async deleteAccident(id) {
    await wait();
    authorize(ADMIN);
    const index = MOCK_ACCIDENTS.findIndex((a) => a.id_kejadian === id);
    if (index < 0) throw new ApiError(404, 'Data kecelakaan tidak ditemukan.');
    MOCK_ACCIDENTS.splice(index, 1);
  },
};

function findAccident(id: number) {
  const record = MOCK_ACCIDENTS.find((a) => a.id_kejadian === id);
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
