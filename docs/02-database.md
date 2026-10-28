# 02 — Database (ERD final, 5 tabel)

> **USULAN PERUBAHAN ERD (belum disetujui tim, 28-10-2026).** Bagian yang diberi tanda **[USULAN]** di bawah menyentuh ERD final: kolom `kode_pengguna` (USERS), jejak verifikasi (LAPORAN_KEJADIAN), dan soft delete (KECELAKAAN_RESMI). Tidak ada tabel baru. Frontend dan mock sudah memakainya (keputusan #32 di `05-decisions.md`); setujui atau tolak sebelum migrasi dibuat. Jumlah tabel tetap 5.

Tipe kolom di bawah adalah **usulan** (dokumen proyek hanya menetapkan nama kolom dan nilai enum). Sesuaikan saat membuat migrasi PostgreSQL + PostGIS. Konfirmasi "upvote/konfirmasi laporan" **tidak ada** (tabel Konfirmasi_Laporan di-DROP, kolom `jumlah_konfirmasi` tidak dipakai).

## Relasi

- ZONA 1:N LAPORAN_KEJADIAN, ZONA 1:N KECELAKAAN_RESMI, ZONA 1:N KALKULASI_RISIKO (riwayat skor).
- USERS 1:N LAPORAN_KEJADIAN (`user_id`), USERS 1:N KECELAKAAN_RESMI (`input_by`, role dishub atau admin).
- **[USULAN]** USERS 1:N LAPORAN_KEJADIAN lewat `diverifikasi_oleh` (role admin, boleh null), dan USERS 1:N KECELAKAAN_RESMI lewat `dihapus_oleh` (role admin, null selama data aktif). Relasi baru ini bukan relasi ke pelapor: pelapor tetap hanya `user_id`.

## USERS

| Kolom | Catatan |
|---|---|
| `id_user` (PK) | |
| `nama` | |
| `email` | unik |
| `password_hash` | bcrypt |
| `role` | `pengemudi` \| `admin` \| `dishub` |
| `tanggal_terdaftar` | |
| `kode_pengguna` **[USULAN]** | teks, **unik**. Format `{YYYYMMDD tanggal terdaftar}-{RR}-{NNNN}`: `RR` = kode role (`01` admin, `02` dishub, `03` pengemudi), `NNNN` = nomor urut per role (4 digit, mulai 0001). Contoh: `20261022-01-0001` (admin pertama, terdaftar 22-10-2026). Diisi server saat akun dibuat dan tidak berubah. Kunci utama tetap `id_user`; kode ini hanya untuk tampilan dan jejak tindakan. Tanggal dihitung zona WIB. Nomor urut dibuat dalam satu transaksi dengan penguncian (mis. tabel/sequence per role) agar tidak ganda |

Pendaftaran publik hanya membuat role `pengemudi`. Akun Dishub dan Admin dibuat tim (seed).

**Di mana `kode_pengguna` ditampilkan:** dropdown akun dan halaman Profil Akun (web), Profil (mobile), dan setiap tempat yang menyebut Admin atau Dishub sebagai pelaku tindakan (diverifikasi oleh, diinput oleh, dihapus oleh). **Identitas pelapor (`user_id`, nama, email, dan juga `kode_pengguna` pelapor) tidak pernah ditampilkan di Dishub maupun Admin** (NFR-006). Verifikator juga tidak pernah ditampilkan ke pengemudi.

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
| `diverifikasi_oleh` (FK → USERS) **[USULAN]** | boleh null; Admin yang menyetujui atau menolak. Diisi dari token saat API-008. Tetap null untuk `auto_approved` dan `auto_rejected` (diputuskan sistem) dan `pending_review` |
| `waktu_verifikasi` **[USULAN]** | boleh null; waktu keputusan Admin (juga dipakai kartu "Disetujui Hari Ini") |
| `alasan_penolakan` **[USULAN]** | teks, **wajib bila `status = rejected`, minimal 10 karakter** (setelah `trim`); null selain itu. Ditampilkan ke pengemudi di detail Riwayat (tanpa identitas verifikator) dan ke Admin |

Aturan status: lihat `01-scoring-formula.md` (Langkah 1).

**Constraint [USULAN]:** `CHECK ((status = 'rejected') = (alasan_penolakan IS NOT NULL AND char_length(btrim(alasan_penolakan)) >= 10))`, dan `CHECK ((status IN ('approved','rejected')) = (diverifikasi_oleh IS NOT NULL AND waktu_verifikasi IS NOT NULL))`.

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
| `dihapus_oleh` (FK → USERS) **[USULAN]** | null selama data aktif; Admin yang menghapus. Diisi dari token |
| `waktu_hapus` **[USULAN]** | null selama data aktif |
| `alasan_hapus` **[USULAN]** | teks, **wajib saat dihapus, minimal 10 karakter**; null selama data aktif |

**Soft delete [USULAN]:** DELETE tidak membuang baris, hanya mengisi tiga kolom di atas. Baris terhapus **tidak** muncul di daftar dan detail biasa (hanya lewat `GET /api/admin/accidents/deleted`), **tidak** dihitung pada `jumlah_kejadian` dan skor zona (semua query clustering dan kalkulasi memakai `WHERE dihapus_oleh IS NULL`), dan tidak ikut ekspor. Constraint: `CHECK ((dihapus_oleh IS NULL) = (waktu_hapus IS NULL AND alasan_hapus IS NULL))` dan `char_length(btrim(alasan_hapus)) >= 10` bila terisi. Tidak ada fitur memulihkan data (di luar scope).

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

// [USULAN] kode_pengguna di semua bentuk User; jejak verifikasi dan penghapusan di bawah.
interface User {
  id_user: number;
  nama: string;
  email: string;
  role: Role;
  tanggal_terdaftar?: string;
  kode_pengguna: string;          // '20261022-01-0001'
}
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
  waktu_verifikasi?: string | null;     // [USULAN]
  alasan_penolakan?: string | null;     // [USULAN] terisi bila rejected; pengemudi memakai ini di detail Riwayat
}

// [USULAN] Laporan di Admin: ditambah pemutus (Admin), tetap tanpa pelapor. Dishub dan pengemudi tidak menerima dua field ini.
interface LaporanAdmin extends Laporan {
  diverifikasi_oleh: number | null;
  diverifikasi_oleh_kode: string | null; // kode_pengguna Admin
  diverifikasi_oleh_nama: string | null; // nama Admin (join; tampil di samping kode)
}

interface KecelakaanResmi {
  id_kejadian: number;
  zona_id: number;
  input_by: number;
  input_by_kode: string;                 // [USULAN] kode_pengguna penginput (join)
  input_by_nama: string;                 // [USULAN] nama penginput (join)
  tanggal_waktu: string;
  lokasi_deskripsi: string;
  latitude: number;
  longitude: number;
  jumlah_korban: number;
  jenis_kendaraan_terlibat?: string | null;
  kondisi_cuaca?: Cuaca | null;
  waktu_pelaporan: string;
}

// [USULAN] Hanya dikembalikan GET /api/admin/accidents/deleted.
interface KecelakaanTerhapus extends KecelakaanResmi {
  dihapus_oleh: number;
  dihapus_oleh_kode: string;
  dihapus_oleh_nama: string;
  waktu_hapus: string;
  alasan_hapus: string;
}
```

Tampilan Dishub dan Admin memakai `Laporan` **tanpa** `user_id`, nama, email, atau `kode_pengguna` pelapor.
