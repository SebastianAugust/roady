// Shapes follow docs/02-database.md and docs/03-api.md (same names as mobile/src/types).
export type Role = 'pengemudi' | 'dishub' | 'admin';

export interface User {
  id_user: number;
  nama: string;
  email: string;
  role: Role;
  /** USERS.tanggal_terdaftar (ISO). Optional in GET /api/users/me (usulan); shown in Akun. */
  tanggal_terdaftar?: string;
  /**
   * USERS.kode_pengguna (usulan, docs/02): YYYYMMDD of registration - RR (01 admin, 02 dishub, 03 pengemudi) - NNNN per role.
   * Shown wherever an Admin or Dishub is named as the one who acted.
   */
  kode_pengguna: string;
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
  /** LAPORAN_KEJADIAN.alasan_penolakan (usulan): required (min. ALASAN_MIN_LENGTH) when status is rejected; null otherwise. */
  alasan_penolakan?: string | null;
}

/**
 * A report as the Admin sees it (API-007/008): adds who decided it. diverifikasi_oleh is an Admin (USERS FK), shown by
 * kode_pengguna; the reporter is still not part of it (NFR-006). Dishub never receives these two fields.
 */
export interface LaporanAdmin extends Laporan {
  diverifikasi_oleh: number | null;
  diverifikasi_oleh_kode: string | null;
  /** nama of that Admin (shown next to the kode in the Admin app). */
  diverifikasi_oleh_nama: string | null;
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
  /** The other KALKULASI_RISIKO columns of that row, for the Detail Zona summary and history. */
  jumlah_kejadian: number;
  persentase_kejadian_saat_hujan: number;
}

/**
 * A zone with a place name for the Lokasi column of Statistik Zona. ZONA has no name column (docs/02), so
 * lokasi_teks (usulan) is derived by the server, e.g. from the latest alamat_teks or lokasi_deskripsi in the zone;
 * null when there is none, and the UI then shows the coordinates.
 */
export interface ZonaTeratas extends Zona {
  lokasi_teks: string | null;
}

/**
 * GET /api/dishub/zones/{zona_id} (usulan, dishub): one zone for the Detail Zona page. The summary comes from the
 * latest KALKULASI_RISIKO row; the lists are the zone's official accidents (not deleted) and crowd reports, both
 * newest first and without any reporter identity (NFR-006).
 */
export interface ZonaDetail extends ZonaTeratas {
  persentase_kejadian_saat_hujan: number;
  /** All KALKULASI_RISIKO rows of the zone, oldest first. */
  riwayat_skor: RiwayatSkorPoint[];
  kecelakaan: KecelakaanResmi[];
  laporan: Laporan[];
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
  /** Required (min. ALASAN_MIN_LENGTH characters) when keputusan is rejected; ignored for approved. */
  alasan?: string;
}

/**
 * API-008 response (usulan): the updated report and whether the push to the reporter was queued.
 * Zone scores are not recomputed here; the scheduler does that on its next run (docs/01).
 */
export interface VerifyResponse {
  laporan: LaporanAdmin;
  notifikasi_terkirim: boolean;
}

/** KECELAKAAN_RESMI row. zona_id is assigned by the server (clustering, docs/01). */
export interface KecelakaanResmi extends CreateAccidentRequest {
  id_kejadian: number;
  zona_id: number;
  /** USERS FK of the Dishub or Admin who entered it, with that user's kode_pengguna (joined by the server). */
  input_by: number;
  input_by_kode: string;
  input_by_nama: string;
  /** When it was entered into the system ("waktu input"). */
  waktu_pelaporan: string;
}

/** A soft-deleted KECELAKAAN_RESMI row (GET /api/admin/accidents/deleted). Not counted in zone scores (docs/01). */
export interface KecelakaanTerhapus extends KecelakaanResmi {
  dihapus_oleh: number;
  dihapus_oleh_kode: string;
  dihapus_oleh_nama: string;
  waktu_hapus: string;
  alasan_hapus: string;
}

/** API-009 DELETE body (usulan): the reason is required, min. ALASAN_MIN_LENGTH characters. */
export interface DeleteAccidentRequest {
  alasan: string;
}

export type UrutKecelakaan = 'terbaru' | 'terlama' | 'korban_terbanyak' | 'korban_tersedikit';

/** Filters of GET /api/admin/accidents and /deleted (usulan); the Dishub list takes the same ones. Dates are YYYY-MM-DD (WIB). */
export interface AccidentsQuery {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  zona_id?: number;
  /** Substring of lokasi_deskripsi. */
  lokasi?: string;
  cuaca?: Cuaca;
  /** Substring of jenis_kendaraan_terlibat. */
  jenis_kendaraan?: string;
  korban_min?: number;
  korban_max?: number;
  /** kode_pengguna of the one who entered it. */
  diinput_oleh?: string;
  /** Free text over lokasi_deskripsi, jenis_kendaraan_terlibat and kode_pengguna of the inputter. */
  q?: string;
  urut?: UrutKecelakaan;
  /** 1-based, default 1. */
  halaman?: number;
  /** Default 20, at most 100. */
  per_halaman?: number;
}

export interface Page<T> {
  data: T[];
  total: number;
  halaman: number;
  per_halaman: number;
}
