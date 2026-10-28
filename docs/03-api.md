# 03 — API (13 endpoint REST)

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
| API-007 | GET | `/api/admin/reports` | admin | Antrean verifikasi. Query `status=pending_review` |
| API-008 | PATCH | `/api/admin/reports/{id}/verify` | admin | Setujui atau tolak. Memicu notifikasi FCM ke pelapor. Body *(usulan)*: keputusan `approved` \| `rejected` |
| API-009 | PUT, DELETE | `/api/admin/accidents/{id}` | admin | Kelola data kecelakaan resmi (ubah, hapus) |
| API-010 | POST | `/api/dishub/accidents` | dishub, admin | Input data resmi. `input_by` diambil dari token, bukan dari body |
| API-011 | GET | `/api/dishub/statistics` | dishub, admin | Rekap zona per kategori, zona teratas, riwayat skor |
| API-012 | GET | `/api/dishub/reports` | dishub, admin | Detail laporan **tanpa** id_user, nama, email. Filter *(usulan)*: `zona_id`, rentang tanggal |
| API-013 | GET | `/api/dishub/export` | dishub, admin | Ekspor CSV. Query *(usulan)*: `jenis=zona\|laporan`, `format=csv`. Jenis atau format lain → `422`. Ekspor laporan tanpa kolom identitas pelapor |

## Hak akses ringkas

| Kelompok | Tanpa token | Pengemudi | Dishub | Admin |
|---|---|---|---|---|
| API-003, 004 (zona) | 401 | ✔ | ✔ | ✔ |
| API-005, 006 (lapor, riwayat) | 401 | ✔ | belum diputuskan | belum diputuskan |
| API-007 sampai 009 (admin) | 401 | 403 | 403 | ✔ |
| API-010 sampai 013 (Dishub) | 401 | 403 | ✔ | ✔ |

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
