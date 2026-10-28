import { ApiClient, ApiError } from './types';
import { isInBandungRaya } from '../config';
import { MOCK_REPORTS } from './mockReports';
import { MOCK_ZONES, distanceMeters } from './mockZones';
import type { Laporan, StatusLaporan, User } from '../types';

const DELAY_MS = 400;
const wait = () => new Promise<void>((r) => setTimeout(r, DELAY_MS));

// Seeded like the real backend: Dishub and Admin accounts are made by the team, not self-registered.
const users: (User & { password: string })[] = [
  { id_user: 1, nama: 'Jane Doe', email: 'pengemudi@roady.test', password: 'password123', role: 'pengemudi' },
  { id_user: 2, nama: 'Petugas Dishub', email: 'dishub@roady.test', password: 'password123', role: 'dishub' },
  { id_user: 3, nama: 'Admin Roady', email: 'admin@roady.test', password: 'password123', role: 'admin' },
];

// The token carries the user id so getMe can tell who is signed in (a real JWT carries it too).
const token = (u: User) => `mock.${u.id_user}.${u.role}.${Date.now()}`;

let currentToken: string | undefined;
export const setMockToken = (t: string | undefined) => {
  currentToken = t;
};

const publicUser = ({ id_user, nama, email, role }: User): User => ({ id_user, nama, email, role });

/** Registered mock users live in memory only, so after an app reload a token for one of them is no longer valid (401). */
function currentUser() {
  const id = Number(currentToken?.split('.')[1]);
  const user = users.find((u) => u.id_user === id);
  if (!user) throw new ApiError(401, 'Sesi berakhir. Silakan masuk lagi.');
  return user;
}

const validEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
function passwordError(password: string) {
  if (password.length < 8) return 'Kata sandi minimal 8 karakter.';
  if (!/\d/.test(password)) return 'Tambahkan angka pada kata sandi.';
  return undefined;
}

export const mockApi: ApiClient = {
  async login({ email, password }) {
    await wait();
    const user = users.find((u) => u.email === email.trim().toLowerCase());
    // Same message for wrong email and wrong password (API-002).
    if (!user || user.password !== password) throw new ApiError(401, 'Email atau kata sandi salah.');
    return { token: token(user), role: user.role };
  },

  async register({ nama, email, password }) {
    await wait();
    const errors: Record<string, string> = {};
    if (!nama.trim()) errors.nama = 'Nama wajib diisi.';
    if (!validEmail(email)) errors.email = 'Format email tidak valid.';
    const pwError = passwordError(password);
    if (pwError) errors.password = pwError;
    const normalized = email.trim().toLowerCase();
    if (!errors.email && users.some((u) => u.email === normalized)) errors.email = 'Email sudah terdaftar.';
    if (Object.keys(errors).length) throw new ApiError(422, 'Data tidak valid.', errors);

    const user: User & { password: string } = {
      id_user: users.length + 1,
      nama: nama.trim(),
      email: normalized,
      password,
      role: 'pengemudi',
    };
    users.push(user);
    return { token: token(user), role: user.role };
  },

  async getMe() {
    await wait();
    return publicUser(currentUser());
  },

  async updateMe({ nama, email, password }) {
    await wait();
    const user = currentUser();
    const errors: Record<string, string> = {};
    if (nama !== undefined && !nama.trim()) errors.nama = 'Nama wajib diisi.';
    const normalized = email?.trim().toLowerCase();
    if (normalized !== undefined) {
      if (!validEmail(normalized)) errors.email = 'Format email tidak valid.';
      else if (users.some((u) => u.id_user !== user.id_user && u.email === normalized)) errors.email = 'Email sudah terdaftar.';
    }
    const pwError = password === undefined ? undefined : passwordError(password);
    if (pwError) errors.password = pwError;
    if (Object.keys(errors).length) throw new ApiError(422, 'Data tidak valid.', errors);

    if (nama !== undefined) user.nama = nama.trim();
    if (normalized !== undefined) user.email = normalized;
    if (password !== undefined) user.password = password;
    return publicUser(user);
  },

  async getZones({ lat, lng, radius }) {
    await wait();
    return MOCK_ZONES.filter((z) => distanceMeters(lat, lng, z.center_latitude, z.center_longitude) <= radius);
  },

  async getZone(zonaId) {
    await wait();
    const zone = MOCK_ZONES.find((z) => z.zona_id === zonaId);
    if (!zone) throw new ApiError(404, 'Zona tidak ditemukan.');
    return zone;
  },

  async getMyReports() {
    await wait();
    return [...MOCK_REPORTS].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async createReport(body) {
    await wait();
    const { latitude, longitude, alamat_teks, kategori, deskripsi, kondisi_cuaca_saat_kejadian, tanggal_kejadian, fotoUri } = body;
    const errors: Record<string, string> = {};
    if (!deskripsi.trim()) errors.deskripsi = 'Deskripsi wajib diisi.';
    if (!kategori) errors.kategori = 'Pilih jenis kejadian.';
    if (!kondisi_cuaca_saat_kejadian) errors.cuaca = 'Pilih kondisi cuaca.';
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) errors.lokasi = 'Lokasi belum tersedia.';
    else if (!isInBandungRaya(latitude, longitude)) errors.lokasi = 'Lokasi Anda di luar wilayah Bandung Raya.';

    const valid = Object.keys(errors).length === 0;
    // ponytail: nearest existing zone within radius_zona, else null; the real backend creates a new zone (docs/01).
    const zone = valid
      ? MOCK_ZONES.find((z) => distanceMeters(latitude, longitude, z.center_latitude, z.center_longitude) <= z.radius_zona)
      : undefined;
    const status: StatusLaporan = !valid ? 'auto_rejected' : fotoUri ? 'pending_review' : 'auto_approved';
    const report: Laporan = {
      id_report: Math.max(0, ...MOCK_REPORTS.map((r) => r.id_report)) + 1,
      zona_id: zone?.zona_id ?? null,
      latitude,
      longitude,
      alamat_teks: alamat_teks ?? null,
      kategori,
      deskripsi: deskripsi.trim(),
      foto_url: fotoUri ?? null,
      tanggal_kejadian,
      kondisi_cuaca_saat_kejadian,
      timestamp: new Date().toISOString(),
      status,
    };
    // Rejected reports are kept as a trace, as in docs/03, but the caller gets 422.
    MOCK_REPORTS.push(report);
    if (!valid) throw new ApiError(422, 'Laporan ditolak.', errors);
    return report;
  },
};
