# 02 — Database (ERD final, 5 tabel)

Tipe kolom di bawah adalah **usulan** (dokumen proyek hanya menetapkan nama kolom dan nilai enum). Sesuaikan saat membuat migrasi PostgreSQL + PostGIS. Konfirmasi "upvote/konfirmasi laporan" **tidak ada** (tabel Konfirmasi_Laporan di-DROP, kolom `jumlah_konfirmasi` tidak dipakai).

## Relasi

- ZONA 1:N LAPORAN_KEJADIAN, ZONA 1:N KECELAKAAN_RESMI, ZONA 1:N KALKULASI_RISIKO (riwayat skor).
- USERS 1:N LAPORAN_KEJADIAN (`user_id`), USERS 1:N KECELAKAAN_RESMI (`input_by`, role dishub atau admin).

## USERS

| Kolom | Catatan |
|---|---|
| `id_user` (PK) | |
| `nama` | |
| `email` | unik |
| `password_hash` | bcrypt |
| `role` | `pengemudi` \| `admin` \| `dishub` |
| `tanggal_terdaftar` | |

Pendaftaran publik hanya membuat role `pengemudi`. Akun Dishub dan Admin dibuat tim (seed).

## LAPORAN_KEJADIAN (laporan crowdsourced)

| Kolom | Catatan |
|---|---|
| `id_report` (PK) | |
| `user_id` (FK → USERS) | |
| `zona_id` (FK → ZONA) | nullable jika `auto_rejected` |
| `latitude`, `longitude` | dari GPS |
| `alamat_teks` | opsional (`string` atau `null`). Alamat hasil reverse geocoding di perangkat saat laporan dikirim; `null` jika gagal. Disimpan, tidak dihitung ulang (lihat keputusan #12 di `05-decisions.md`) |
| `kategori` | `kecelakaan` \| `near_miss` |
| `deskripsi` | wajib |
| `foto_url` | opsional (URL penyimpanan, bukan berkas di DB) |
| `tanggal_kejadian` | |
| `kondisi_cuaca_saat_kejadian` | `cerah` \| `hujan` \| `lainnya` |
| `timestamp` | waktu pengiriman |
| `status` | `auto_rejected` \| `pending_review` \| `auto_approved` \| `approved` \| `rejected` |

Aturan status: lihat `01-scoring-formula.md` (Langkah 1).

## KECELAKAAN_RESMI (data Dishub)

| Kolom | Catatan |
|---|---|
| `id_kejadian` (PK) | |
| `zona_id` (FK → ZONA) | |
| `input_by` (FK → USERS) | role dishub atau admin |
| `tanggal_waktu` | wajib |
| `lokasi_deskripsi` | wajib |
| `latitude`, `longitude` | |
| `jumlah_korban` | bilangan bulat ≥ 0 |
| `jenis_kendaraan_terlibat` | opsional |
| `kondisi_cuaca` | opsional |
| `waktu_pelaporan` | |

## ZONA (identitas spasial, jarang berubah)

| Kolom | Catatan |
|---|---|
| `zona_id` (PK) | |
| `center_latitude`, `center_longitude` | centroid |
| `radius_zona` | meter; konstanta clustering |
| `created_at` | |

## KALKULASI_RISIKO (riwayat skor; satu zona banyak baris)

| Kolom | Catatan |
|---|---|
| `id_kalkulasi` (PK) | |
| `zona_id` (FK → ZONA) | |
| `jumlah_kejadian` | |
| `skor_mentah` | |
| `skor_risiko` | persentil 0–100 |
| `kategori_risiko` | `hijau` \| `kuning` \| `merah` |
| `weather_dependent` | boolean |
| `persentase_kejadian_saat_hujan` | |
| `last_updated` | |

Skor terbaru sebuah zona = baris `KALKULASI_RISIKO` dengan `last_updated` paling baru.

## Bentuk data untuk mock frontend (TypeScript, usulan)

```ts
type Role = 'pengemudi' | 'dishub' | 'admin';
type Kategori = 'kecelakaan' | 'near_miss';
type Cuaca = 'cerah' | 'hujan' | 'lainnya';
type StatusLaporan = 'auto_rejected' | 'pending_review' | 'auto_approved' | 'approved' | 'rejected';
type KategoriRisiko = 'hijau' | 'kuning' | 'merah';

interface Zona {
  zona_id: number;
  center_latitude: number;
  center_longitude: number;
  radius_zona: number;
  skor_risiko: number;            // persentil, dari kalkulasi terbaru
  kategori_risiko: KategoriRisiko;
  jumlah_kejadian: number;
  weather_dependent: boolean;
  last_updated: string;
}

interface Laporan {
  id_report: number;
  zona_id: number | null;
  latitude: number;
  longitude: number;
  alamat_teks?: string | null;   // opsional; null jika reverse geocoding gagal
  kategori: Kategori;
  deskripsi: string;
  foto_url: string | null;
  tanggal_kejadian: string;
  kondisi_cuaca_saat_kejadian: Cuaca;
  timestamp: string;
  status: StatusLaporan;
}
```

Tampilan Dishub dan Admin memakai `Laporan` **tanpa** `user_id`, nama, atau email pelapor.
