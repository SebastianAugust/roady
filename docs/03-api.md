# 03 — API (13 endpoint REST)

> **USULAN PERUBAHAN (belum disetujui tim, 28-10-2026).** Perubahan API-007, API-008, API-009 dan endpoint tambahan di bagian "Usulan jejak verifikasi dan penghapusan" mengikuti usulan perubahan ERD di `02-database.md` (keputusan #32). Endpoint di luar 13 yang tertulis dokumen proyek ditandai *(usulan)*.

Kode status umum: `200` berhasil, `201` dibuat, `401` tanpa token atau token tidak valid, `403` role tidak berhak, `422` validasi gagal (sertakan alasan atau daftar kesalahan). Auth memakai header `Authorization: Bearer <JWT>`. Isi JWT memuat role.

Parameter dan body yang ditandai *(usulan)* belum ditetapkan di dokumen proyek; tetapkan saat membuat kontrak lalu catat di sini.

| ID | Method | Endpoint | Role | Keterangan |
|---|---|---|---|---|
| API-001 | POST | `/api/auth/register` | tanpa login | Akun baru selalu role `pengemudi`. Body: nama, email, password |
| API-002 | POST | `/api/auth/login` | tanpa login | Balasan: token JWT + role. Gagal: `401` dengan pesan yang sama untuk email salah dan password salah |
| API-003 | GET | `/api/zones` | semua role | Zona dalam radius dari posisi pengguna (dipakai geofencing). Query *(usulan)*: `lat`, `lng`, `radius=5000` |
| API-004 | GET | `/api/zones/{zona_id}` | semua role | Detail zona untuk bottom sheet |
| API-005 | POST | `/api/reports` | pengemudi | Validasi otomatis (wilayah, field wajib). Gagal: `422`. Foto → `pending_review`; tanpa foto → `auto_approved` |
| API-006 | GET | `/api/reports/me` | pengemudi | Riwayat laporan milik sendiri |
| API-007 | GET | `/api/admin/reports` | admin | Antrean verifikasi. Query `status=pending_review` \| `approved` \| `rejected` *(usulan: dua nilai terakhir, lihat bawah)* |
| API-008 | PATCH | `/api/admin/reports/{id}/verify` | admin | Setujui atau tolak. Memicu notifikasi FCM ke pelapor. Body *(usulan)*: `{ keputusan: approved \| rejected, alasan }`; `alasan` wajib bila `rejected` (min. 10 karakter) *(usulan)* |
| API-009 | PUT, DELETE | `/api/admin/accidents/{id}` | admin | Kelola data kecelakaan resmi (ubah, hapus). Web hanya memakai DELETE: desain detail tidak punya tombol ubah (keputusan #27). *(usulan)* DELETE adalah soft delete dan **wajib** body `{ alasan }` (min. 10 karakter) |
| API-010 | POST | `/api/dishub/accidents` | dishub | Input data resmi. `input_by` diambil dari token, bukan dari body |
| API-011 | GET | `/api/dishub/statistics` | dishub | Rekap zona per kategori, zona teratas, riwayat skor |
| API-012 | GET | `/api/dishub/reports` | dishub | Detail laporan **tanpa** id_user, nama, email. Filter *(usulan)*: `zona_id`, rentang tanggal |
| API-013 | GET | `/api/dishub/export` | dishub | Ekspor CSV. Query *(usulan)*: `jenis=zona\|laporan`, `format=csv`. Jenis atau format lain → `422`. Ekspor laporan tanpa kolom identitas pelapor |

## Hak akses ringkas

| Kelompok | Tanpa token | Pengemudi | Dishub | Admin |
|---|---|---|---|---|
| API-003, 004 (zona) | 401 | ✔ | ✔ | ✔ |
| API-005, 006 (lapor, riwayat) | 401 | ✔ | belum diputuskan | belum diputuskan |
| API-007 sampai 009 (admin) | 401 | 403 | 403 | ✔ |
| API-010 sampai 013 (Dishub) | 401 | 403 | ✔ | 403 |
| `GET /api/admin/accidents`, `/deleted`, `/{id}` *(usulan)* | 401 | 403 | 403 | ✔ |
| `GET /api/dishub/accidents`, `/{id}` *(usulan, read-only)* | 401 | 403 | ✔ | 403 |

Admin dan Dishub adalah dua aplikasi terpisah **tanpa akses silang** (keputusan #30 di `05-decisions.md`): Admin tidak memakai endpoint Dishub dan sebaliknya; panggilan lintas role mendapat `403`.

API-005 dan API-006 saat ini hanya untuk pengemudi. Apakah Dishub dan Admin boleh melapor belum diputuskan; navigasi sementara menganggap tidak.

## Perilaku penting

- Validasi laporan: lokasi harus di dalam Bandung Raya, `kategori`, `deskripsi`, dan koordinat wajib. Gagal → laporan disimpan sebagai `auto_rejected` (jejak) dan balasan `422` memuat alasan.
- Batas wilayah Bandung Raya belum didefinisikan sebagai poligon atau kotak koordinat. Untuk mock, pakai kotak kasar lalu ganti saat backend dibuat.
- Notifikasi peringatan dini (radius 300 m) **tidak** lewat API: perangkat menghitung jarak ke zona yang sudah diunduh lewat API-003.

## Usulan tambahan dari mobile *(usulan, belum disetujui tim)*

Layar Profil dan Edit Profil di Figma butuh data dan aksi yang tidak ada di 13 endpoint di atas. Mock dan klien API mobile sudah memakai dua endpoint ini; setujui atau ganti sebelum backend dibuat.

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/users/me` | semua role | Pengguna yang sedang login: `id_user`, `nama`, `email`, `role`. Login hanya mengembalikan token dan role, sedangkan Profil menampilkan nama dan email. `401` bila token tidak valid, dan aplikasi lalu keluar otomatis |
| PATCH | `/api/users/me` | semua role | Ubah profil. Body: `nama`, `email`, `password`, semuanya opsional, hanya yang berubah yang dikirim. `422` dengan daftar kesalahan per kolom bila tidak valid (aturan sama dengan registrasi) |

Hapus akun ada di Figma (Profil) tetapi belum punya endpoint, jadi tombolnya baru menampilkan "Segera hadir".

## Bentuk balasan Dishub dari web *(usulan, dipakai mock `web/src/api/mock.ts`)*

- **API-011** `GET /api/dishub/statistics` → `{ rekap: { merah, kuning, hijau }, total_zona, total_laporan, total_kecelakaan_resmi, zona_teratas: (Zona & { lokasi_teks: string | null })[] (maks. 10, skor tertinggi dulu), riwayat_skor: { zona_id, titik: { last_updated, skor_risiko, kategori_risiko }[] }[] }`. `lokasi_teks` adalah nama tempat untuk kolom Lokasi (ZONA tidak punya kolom nama; server bisa mengambil `alamat_teks` atau `lokasi_deskripsi` terbaru di zona itu). Web juga memakai `GET /api/users/me` untuk chip akun dan halaman Akun, dengan tambahan `tanggal_terdaftar` (ISO) di balasannya.
- **API-010** `POST /api/dishub/accidents` body: `tanggal_waktu` (ISO), `lokasi_deskripsi`, `latitude`, `longitude`, `jumlah_korban` (bulat ≥ 0), `jenis_kendaraan_terlibat` (opsional), `kondisi_cuaca` (`cerah|hujan|lainnya`, opsional). Server mengisi `input_by` dari token (nilai di body diabaikan), `zona_id` dari clustering (docs/01), dan `waktu_pelaporan`. `422` dengan `errors` per kolom (`tanggal_waktu`, `lokasi_deskripsi`, `koordinat`, `jumlah_korban`, `kondisi_cuaca`). Balasan `201`: baris KECELAKAAN_RESMI.
- **API-012** `GET /api/dishub/reports?zona_id=&dari=YYYY-MM-DD&sampai=YYYY-MM-DD` → `Laporan[]` tanpa `user_id`, terbaru dulu, tanpa `auto_rejected`. Tanggal tidak valid atau `dari > sampai` → `422` dengan `errors`.
- **API-013** `GET /api/dishub/export?jenis=zona|laporan&format=csv` (filter API-012 berlaku untuk `jenis=laporan`) → `text/csv` dengan `Content-Disposition: attachment; filename="..."`. Kolom laporan: `id_report, zona_id, tanggal_kejadian, timestamp, kategori, kondisi_cuaca_saat_kejadian, status, latitude, longitude, alamat_teks, deskripsi, foto_url` (tanpa identitas pelapor).

## Bentuk balasan Admin dari web *(usulan, dipakai mock `web/src/api/mock.ts`)*

Semua hanya untuk role `admin` (Dishub → `403`), dan endpoint Dishub di atas hanya untuk role `dishub` (Admin → `403`). Laporan yang dikirim ke Admin juga **tanpa** `user_id`, nama, atau email pelapor.

- **API-007** `GET /api/admin/reports?status=pending_review` → `Laporan[]`, terlama dulu (urutan antrean). Tanpa `status` → semua laporan (dipakai untuk kartu angka dan detail). Tiap laporan membawa `waktu_verifikasi` (ISO atau `null`, usulan kolom baru di LAPORAN_KEJADIAN) untuk kartu "Disetujui Hari Ini".
- **API-008** `PATCH /api/admin/reports/{id}/verify` body `{ keputusan: 'approved' | 'rejected', alasan?: string }` (server mengisi `waktu_verifikasi` dan `diverifikasi_oleh` dari token; nilai di body diabaikan) → `{ laporan: LaporanAdmin, notifikasi_terkirim: boolean }`. `404` id tidak ada, `409` laporan tidak berstatus `pending_review`, `422` keputusan lain, atau `keputusan = rejected` dengan `alasan` kosong atau kurang dari 10 karakter (`errors: { alasan }`). Untuk `approved`, `alasan` diabaikan. Alasan penolakan ikut notifikasi FCM dan tampil di detail Riwayat pengemudi. Mengirim FCM ke pelapor; **tidak** menghitung ulang skor zona (scheduler, docs/01).
- **API-009** `DELETE /api/admin/accidents/{id}` body **wajib** `{ alasan }` (min. 10 karakter) *(usulan)* → `204`; `422` (`errors: { alasan }`) bila alasan kosong atau pendek; `404` bila tidak ada atau sudah dihapus (dipakai tombol HAPUS DATA). Soft delete: server mengisi `dihapus_oleh` (dari token), `waktu_hapus`, `alasan_hapus`. `PUT` tetap ada di kontrak (body dan aturan `422` sama dengan API-010; `input_by` dan `waktu_pelaporan` tidak berubah) dan ada di mock, tetapi web tidak memakainya karena desain tidak punya form ubah.
- **Tambahan Dishub (usulan, belum ada di 13 endpoint):** `GET /api/dishub/accidents` (role `dishub`) → `KecelakaanResmi[]` terbaru dulu, untuk grid halaman Arsip & Input.
- **Tambahan Admin (usulan, belum ada di 13 endpoint):** `GET /api/admin/accidents` → `KecelakaanResmi[]` terbaru dulu, dan `GET /api/admin/accidents/{id}` → satu baris (`404` bila tidak ada). Dibutuhkan layar Kelola Data Kecelakaan (daftar dan detail), karena API-009 hanya punya PUT dan DELETE.

## Usulan jejak verifikasi dan penghapusan *(usulan, belum disetujui tim; keputusan #32)*

Dipakai mock `web/src/api/mock.ts`. Semua balasan Admin dan Dishub tetap **tanpa** identitas pelapor (NFR-006).

**Pengguna.** `GET /api/users/me` (web dan mobile) menambah `kode_pengguna`. Registrasi (API-001) membuat `kode_pengguna` di server; klien tidak mengirimnya.

**Laporan (Admin).**
- API-007 `GET /api/admin/reports?status=pending_review|approved|rejected` → `LaporanAdmin[]`: tiap baris memuat `diverifikasi_oleh` (id_user Admin atau `null`), `diverifikasi_oleh_kode` (kode_pengguna Admin), `diverifikasi_oleh_nama` (nama Admin, join, untuk ditampilkan di samping kode), `waktu_verifikasi`, dan `alasan_penolakan`. Web memuat tanpa `status` lalu membagi tiga tab (Menunggu Tinjauan, Disetujui, Ditolak); filter `status` tetap berlaku bagi klien lain. Urutan: antrean `pending_review` terlama dulu; `approved` dan `rejected` terbaru diputus dulu. Status lain atau tanpa `status` mengikuti perilaku lama. Nilai `status` di luar daftar → `422`.
- Dishub (API-012 dan ekspor) menerima `Laporan` tanpa `diverifikasi_oleh` dan `diverifikasi_oleh_kode`. Pengemudi (API-006) menerima `alasan_penolakan` pada laporannya yang `rejected`, tidak pernah verifikatornya.

**Kecelakaan resmi.** Semua baris memuat `input_by`, `input_by_kode`, `input_by_nama` (join), dan `waktu_pelaporan` (waktu input ke sistem). Baris di `/deleted` juga memuat `dihapus_oleh_nama`. Baris terhapus tidak pernah muncul di endpoint selain `/deleted`.

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/admin/accidents` | admin | Daftar data aktif, dengan filter dan halaman (di bawah) |
| GET | `/api/admin/accidents/deleted` | admin | Data terhapus, memuat `dihapus_oleh`, `dihapus_oleh_kode`, `waktu_hapus`, `alasan_hapus`; filter sama; urutan bawaan: terbaru dihapus dulu. Rute ini didaftarkan sebelum `/{id}` |
| GET | `/api/admin/accidents/{id}` | admin | Satu baris aktif; `404` bila tidak ada atau terhapus |
| GET | `/api/dishub/accidents` | dishub | Daftar read-only data aktif (memuat `input_by`, `input_by_kode`); filter dan halaman yang sama |
| GET | `/api/dishub/accidents/{id}` | dishub | Satu baris aktif, read-only; `404` bila tidak ada atau terhapus |
| GET | `/api/dishub/zones` | dishub | Semua zona dengan `lokasi_teks`, skor tertinggi dulu (tabel Statistik Zona; pengurutan dan filter kategori dilakukan di browser) |
| GET | `/api/dishub/zones/{zona_id}` | dishub | Detail Zona (di bawah); `404` bila zona tidak ada |
| GET | `/api/dishub/reports/{id}` | dishub | Satu laporan tanpa identitas pelapor (dan tanpa pemutus); `404` bila tidak ada atau `auto_rejected` |

Query `GET /api/admin/accidents` (semua opsional, digabung dengan AND):

| Parameter | Arti |
|---|---|
| `tanggal_dari`, `tanggal_sampai` | `YYYY-MM-DD`, inklusif, terhadap `tanggal_waktu` (WIB). `dari > sampai` → `422` |
| `zona_id` | zona tepat |
| `lokasi` | mengandung teks, di `lokasi_deskripsi` (tanpa huruf besar-kecil) |
| `cuaca` | `cerah` \| `hujan` \| `lainnya` |
| `jenis_kendaraan` | mengandung teks, di `jenis_kendaraan_terlibat` |
| `korban_min`, `korban_max` | rentang `jumlah_korban`; `min > max` → `422` |
| `diinput_oleh` | `kode_pengguna` penginput, tepat |
| `q` | pencarian bebas atas `lokasi_deskripsi`, `jenis_kendaraan_terlibat`, dan kode penginput |
| `urut` | `terbaru` (bawaan) \| `terlama` \| `korban_terbanyak` \| `korban_tersedikit` |
| `halaman`, `per_halaman` | mulai 1; `per_halaman` bawaan 20, maksimal 100 |

Dropdown "Diinput oleh" di web diisi dari penginput pada 100 baris pertama (`per_halaman=100`); bila kelak penginput lebih banyak, perlu endpoint daftar penginput sendiri.

Balasan: `{ data: KecelakaanResmi[], total, halaman, per_halaman }` (`total` = jumlah setelah filter, sebelum dipotong halaman). Parameter tidak valid → `422` dengan `errors` per parameter.

## Usulan Detail Zona dan detail Dishub *(usulan, belum disetujui tim; keputusan #34)*

Dipakai mock `web/src/api/mock.ts`. Semuanya hanya role `dishub` (Admin dan Pengemudi `403`) dan tanpa identitas pelapor (NFR-006).

- **`GET /api/dishub/zones`** → `ZonaTeratas[]` untuk seluruh zona (tidak dibatasi 10 seperti `zona_teratas` di API-011), tiap baris berisi kolom zona, skor dan kategori terbaru, `jumlah_kejadian`, `weather_dependent`, `last_updated`, dan `lokasi_teks`.
- **`GET /api/dishub/zones/{zona_id}`** → `ZonaDetail`: baris di atas ditambah `persentase_kejadian_saat_hujan` (dari baris KALKULASI_RISIKO terbaru), `riwayat_skor` (semua baris KALKULASI_RISIKO zona itu, terlama dulu; tiap titik: `last_updated`, `skor_risiko`, `kategori_risiko`, `jumlah_kejadian`, `persentase_kejadian_saat_hujan`), `kecelakaan` (KECELAKAAN_RESMI aktif di zona itu, terbaru dulu, memuat `input_by_kode` dan `input_by_nama`) dan `laporan` (laporan zona itu selain `auto_rejected`, terbaru dulu, tanpa `user_id` dan tanpa pemutus). Daftar belum dipaginasi; bila zona kelak punya ratusan baris, tambahkan `halaman` seperti API admin.
- **`GET /api/dishub/reports/{id}`** → `Laporan` (bentuk yang sama dengan baris API-012).
- API-011 tetap, termasuk `riwayat_skor` per zona, yang kini juga membawa `jumlah_kejadian` dan `persentase_kejadian_saat_hujan` per titik.
- Mock `jumlah_kejadian` zona adalah angka sintetis; daftar kejadian dan laporan di Detail Zona hanya memuat baris yang ada di mock, jadi jumlahnya bisa lebih kecil dari angka itu.
