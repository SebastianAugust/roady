# 04 — Struktur Navigasi dan Layar Figma

File Figma: `0QjYuXdvJ0TeJGcPRi2vdF` (nama: MAIN TO SHARE W PEEPS). Section prototype: User `1110:1729`, Admin `1110:1730`, Dishub `1110:1731`.

**Baca satu frame per layar yang sedang dibangun** (jangan satu section utuh, terlalu besar). Ukuran layar: mobile 412×892, web 1440×1024. Daftar di bawah dibuat dari nama dan ukuran frame saja; isi visualnya belum diperiksa.

## Pohon navigasi

### Pengemudi (mobile)

```
Login ── Daftar Akun ── Form Pendaftaran
  └─ Halaman Utama (Peta Zona Risiko)
       ├─ Detail Zona (bottom sheet)
       ├─ Notifikasi Peringatan Dini (otomatis, bukan halaman)
       ├─ Riwayat Laporan ── Detail Laporan (dari panah di Halaman Utama)
       ├─ Laporkan Kejadian ── Form Laporan ── Status Laporan Terkirim
       └─ Profil
            ├─ Pengaturan Peringatan
            ├─ Bantuan dan Informasi
            └─ Keluar
```

Layar pendukung di desain: onboarding ×3, permission (izin lokasi), bantuan ×3. Letaknya di alur disesuaikan dengan use case; onboarding dan permission muncul sebelum Login pada pemakaian pertama.

Admin dan Dishub adalah **dua aplikasi web terpisah tanpa akses silang** (keputusan #30 di `05-decisions.md`). Navbar dan urutannya persis seperti Figma (`docs/design/admin/Home.png`, `docs/design/dishub/Home.png`). Membuka URL role lain → halaman 403.

### Dishub (web) — navbar: Beranda · Statistik Zona · Arsip & Input · Detail Laporan · Ekspor Data

```
Login
  └─ Beranda (sapaan + kartu pintasan, tanpa data)                 /
       ├─ Statistik Zona: 4 kartu angka (memfilter tabel), tab "Tabel | Peta"   /statistik
       │     ├─ Tabel: Lokasi, Jumlah Kejadian, Skor Risiko, Kategori Zona (kolom bisa diurutkan, baris bisa diklik) ── Riwayat Skor Zona
       │     │     └─ Detail Zona (belum ada desain Figma): ringkasan, grafik riwayat skor, kejadian resmi, laporan warga   /statistik/:zonaId
       │     └─ Peta: Peta Zona Risiko (belum ada desain web; bukan item navbar)
       ├─ Arsip & Input: grid arsip data resmi (kartu bisa diklik) ── INPUT DATA   /arsip
       │     ├─ Detail kejadian resmi (read-only, tanpa ubah/hapus)   /arsip/:id
       │     └─ Form Input Data Resmi ── Konfirmasi               /arsip/input
       ├─ Detail Laporan ── Filter, DETAIL (kartu bisa diklik)      /laporan
       │     └─ Detail laporan (halaman, tanpa identitas pelapor)   /laporan/:id
       ├─ Ekspor Data (CSV) ── Konfirmasi                          /ekspor
       └─ Akun (popup: Profil akun, Keluar)                         /akun
```

### Admin (web) — navbar: Beranda · Verifikasi Laporan · Kelola Data Kecelakaan

```
Login
  └─ Beranda (sapaan + kartu pintasan, tanpa data)                 /
       ├─ Verifikasi Laporan: 3 kartu angka + antrean berfoto ── Setujui / Tolak   /admin/verifikasi
       │     └─ Detail laporan dan foto ── Setujui / Tolak         /admin/verifikasi/:id
       ├─ Kelola Data Kecelakaan: grid data resmi ── DETAIL         /admin/kecelakaan
       │     └─ Detail: peta, Informasi Kejadian, Hapus Data (konfirmasi)   /admin/kecelakaan/:id
       └─ Akun (popup: Profil akun, Keluar)                         /akun
```

Admin **tidak** memakai Statistik Zona, Arsip & Input, Detail Laporan, Ekspor Data, atau peta Dishub. Detail Kelola Data Kecelakaan tidak punya Ubah Data (tidak ada di desain).

## Layar Figma — USER mobile (`1110:1729`)

| Layar | Node-id | Catatan |
|---|---|---|
| onboarding 4 | `1032:701` | onboarding 1 dari 3 |
| onboarding 5 | `1032:7546` | |
| onboarding 6 | `1032:7837` | |
| login page | `1032:986` | |
| sign up page | `1032:1272` | |
| permission | `1032:1561` | izin lokasi |
| home | `1032:2116` | |
| Peta | `1032:5391` | |
| Laporkan Kejadian | `1032:5942` | |
| Konfirmasi Laporan Kejadian | `1032:6482` | |
| riwayat laporan | `1032:4841` | |
| account | `1032:2670` | |
| Bantuan (3 frame) | `1032:3223`, `1032:3758`, `1032:4293` | |
| mulai app | `1032:7012` | frame kosong (0 anak) |
| d.progress | `1032:8124` | komponen dropdown; kemungkinan status/filter laporan |
| d.tipe_kecelakaan | `1032:8149` | komponen dropdown; kemungkinan kategori laporan |
| d.cuaca | `1032:8170` | komponen dropdown; cuaca |
| AdobeColor-RPL 1 | `846:655` | kemungkinan referensi palet warna (820×892) |
| Group 467 | `888:1400` | belum jelas |
| Map Maker (placeholder peta) | `1032:4840` | gambar peta contoh (Surabaya), bukan data nyata |

## Layar Figma — ADMIN web (`1110:1730`)

| Layar | Node-id |
|---|---|
| Login | `1036:3256` |
| Home | `1036:3772` |
| Verifikasi Laporan | `1036:4305` |
| Kelola data kecelakaan | `1036:4964` |
| detail - Kelola data kecelakaan | `1036:5764` |
| Profil akun | `1036:6298` |
| navbar | `1036:6824` |
| isi (tabel/konten) | `1036:6834` |
| data dishub | `1036:6973` |
| akun admin (popup) | `1036:7250` |
| d.progress, d.tipe_kecelakaan, d.cuaca | `1036:3189`, `1036:3214`, `1036:3235` |

~~**Kekurangan desain Admin:** tidak ada menu Dishub.~~ Bukan kekurangan: Admin memang tidak memakai menu Dishub (keputusan #30 menggantikan #1).

## Layar Figma — DISHUB web (`1110:1731`)

| Layar | Node-id |
|---|---|
| Login | `1036:1392` |
| Home | `1010:1263` |
| dishub - dashboard statistik | `1044:4367` |
| dishub - input data resmi (varian 1) | `1025:2953` |
| dishub - input data resmi (varian 2) | `1025:4358` |
| dishub - input data resmi - konfirmasi | `1053:7776` |
| dishub - detail laporan | `1025:7378` |
| dishub - ekspor data | `1044:3413` |
| dishub - ekspor data - konfirmasi | `1053:8352` |
| dishub - akun | `1044:5869` |
| navbar-dishub | `1053:7485` |
| isi (tabel/konten) | `1044:5375` |
| data dishub, data laporan | `1036:2150`, `1025:5254` |
| akun dishub (popup) | `1036:2427` |
| pilih (dropdown kecil) | `1053:7622` |
| d.progress, d.tipe_kecelakaan, d.cuaca | `1036:1934`, `1036:1959`, `1036:1980` |

**ABAIKAN** dua frame `detail - Kelola data kecelakaan` di section Dishub (`1053:8881`, `1044:2829`). Dishub tidak boleh Kelola Data Kecelakaan.

**Belum ada desain:** peta web Dishub. Diadaptasi dari layar Peta mobile (`1032:5391`) dan ditaruh sebagai tab "Peta" di Statistik Zona. Admin tidak punya peta.

**Acuan gambar:** frame web di atas tersedia sebagai PNG di `docs/design/admin/` dan `docs/design/dishub/`. Dua varian Input Data Resmi: `dishub - input data resmi.png` = arsip, `dishub - input data resmi-1.png` = form; keduanya dipakai (arsip → INPUT DATA → form).
