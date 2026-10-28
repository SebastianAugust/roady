// Shapes follow docs/02-database.md and docs/03-api.md.
export type Role = 'pengemudi' | 'dishub' | 'admin';

export interface User {
  id_user: number;
  nama: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface RegisterRequest {
  nama: string;
  email: string;
  password: string;
}

/** PATCH /api/users/me (usulan). Only the fields that change are sent. */
export interface UpdateProfileRequest {
  nama?: string;
  email?: string;
  password?: string;
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

export interface Laporan {
  id_report: number;
  zona_id: number | null;
  latitude: number;
  longitude: number;
  /** Address text saved when the report is sent (not recomputed later); null/absent when the lookup failed. */
  alamat_teks?: string | null;
  kategori: Kategori;
  deskripsi: string;
  foto_url: string | null;
  tanggal_kejadian: string;
  kondisi_cuaca_saat_kejadian: Cuaca;
  timestamp: string;
  status: StatusLaporan;
}

export interface CreateReportRequest {
  latitude: number;
  longitude: number;
  /** Reverse-geocoded on the device at send time; null when that failed. */
  alamat_teks?: string | null;
  kategori: Kategori;
  deskripsi: string;
  kondisi_cuaca_saat_kejadian: Cuaca;
  /** YYYY-MM-DD */
  tanggal_kejadian: string;
  /** Local file URI of the optional photo. */
  fotoUri?: string;
}
