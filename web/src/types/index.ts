// Shapes follow docs/02-database.md and docs/03-api.md (same names as mobile/src/types).
export type Role = 'pengemudi' | 'dishub' | 'admin';

export interface User {
  id_user: number;
  nama: string;
  email: string;
  role: Role;
  /** USERS.tanggal_terdaftar (ISO). Optional in GET /api/users/me (usulan); shown in Akun. */
  tanggal_terdaftar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export type FieldErrors = Record<string, string>;

export type KategoriRisiko = 'hijau' | 'kuning' | 'merah';

export interface Zona {
  zona_id: number;
  center_latitude: number;
  center_longitude: number;
  radius_zona: number;
  skor_risiko: number;
  kategori_risiko: KategoriRisiko;
  jumlah_kejadian: number;
  weather_dependent: boolean;
  last_updated: string;
}

export interface ZonesQuery {
  lat: number;
  lng: number;
  /** meters */
  radius: number;
}

export type Kategori = 'kecelakaan' | 'near_miss';
export type Cuaca = 'cerah' | 'hujan' | 'lainnya';
export type StatusLaporan = 'auto_rejected' | 'pending_review' | 'auto_approved' | 'approved' | 'rejected';

/** A crowd report as Dishub and Admin see it: there is no user_id, nama or email (NFR-006, API-012). */
export interface Laporan {
  id_report: number;
  zona_id: number | null;
  latitude: number;
  longitude: number;
  alamat_teks?: string | null;
  kategori: Kategori;
  deskripsi: string;
  foto_url: string | null;
  tanggal_kejadian: string;
  kondisi_cuaca_saat_kejadian: Cuaca;
  timestamp: string;
  status: StatusLaporan;
  /** When an Admin approved or rejected it (usulan column, for "Disetujui Hari Ini"); null or absent before that. */
  waktu_verifikasi?: string | null;
}

/** API-012 query (usulan). Dates are YYYY-MM-DD and inclusive, compared with tanggal_kejadian. */
export interface DishubReportsQuery {
  zona_id?: number;
  dari?: string;
  sampai?: string;
}

/** One KALKULASI_RISIKO row, reduced to what the score history chart needs. */
export interface RiwayatSkorPoint {
  last_updated: string;
  skor_risiko: number;
  kategori_risiko: KategoriRisiko;
}

/**
 * A zone with a place name for the Lokasi column of Statistik Zona. ZONA has no name column (docs/02), so
 * lokasi_teks (usulan) is derived by the server, e.g. from the latest alamat_teks or lokasi_deskripsi in the zone;
 * null when there is none, and the UI then shows the coordinates.
 */
export interface ZonaTeratas extends Zona {
  lokasi_teks: string | null;
}

/** API-011 GET /api/dishub/statistics (shape usulan). */
export interface Statistics {
  /** Zones per category, from each zone's latest calculation. */
  rekap: Record<KategoriRisiko, number>;
  total_zona: number;
  /** Crowd reports counted in the scores (approved + auto_approved) and official accidents. */
  total_laporan: number;
  total_kecelakaan_resmi: number;
  /** Highest skor_risiko first, at most 10. */
  zona_teratas: ZonaTeratas[];
  /** Score history per zone, oldest first. */
  riwayat_skor: { zona_id: number; titik: RiwayatSkorPoint[] }[];
}

export type JenisEkspor = 'zona' | 'laporan';
export type FormatEkspor = 'csv';

/**
 * API-013 query (usulan). Typed as plain strings because that is what reaches the server (a URL can carry anything);
 * only JenisEkspor and FormatEkspor are accepted, anything else is answered with 422. Filters apply to jenis=laporan only.
 */
export interface ExportQuery extends DishubReportsQuery {
  jenis: string;
  format: string;
}

export interface ExportFile {
  filename: string;
  content: string;
}

/** API-010 body. input_by is taken from the token by the server and is deliberately not part of this type. */
export interface CreateAccidentRequest {
  /** ISO date-time */
  tanggal_waktu: string;
  lokasi_deskripsi: string;
  latitude: number;
  longitude: number;
  jumlah_korban: number;
  jenis_kendaraan_terlibat?: string | null;
  kondisi_cuaca?: Cuaca | null;
}

/** API-007 query. Without status the admin gets every report (still without reporter identity). */
export interface AdminReportsQuery {
  status?: StatusLaporan;
}

export type KeputusanVerifikasi = 'approved' | 'rejected';

/** API-008 PATCH /api/admin/reports/{id}/verify body (usulan in docs/03). */
export interface VerifyRequest {
  keputusan: KeputusanVerifikasi;
}

/**
 * API-008 response (usulan): the updated report and whether the push to the reporter was queued.
 * Zone scores are not recomputed here; the scheduler does that on its next run (docs/01).
 */
export interface VerifyResponse {
  laporan: Laporan;
  notifikasi_terkirim: boolean;
}

/** KECELAKAAN_RESMI row. zona_id is assigned by the server (clustering, docs/01). */
export interface KecelakaanResmi extends CreateAccidentRequest {
  id_kejadian: number;
  zona_id: number;
  input_by: number;
  waktu_pelaporan: string;
}
