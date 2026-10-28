# 00 — Overview

## Ringkasan

Roady! (RoadWatchers) memberi peringatan dini kepada pengemudi saat mendekati titik rawan kecelakaan di Bandung Raya. Pengemudi bisa melihat peta zona risiko, melapor kejadian (kecelakaan atau near miss), dan menerima notifikasi saat berada dalam radius 300 m dari zona. Dishub memasukkan data resmi dan memantau statistik. Admin memverifikasi laporan berfoto. Skor risiko dihitung otomatis dengan faktor cuaca.

Wilayah: Bandung Raya (Kota Bandung, Cimahi, Kab. Bandung, Kab. Bandung Barat, Jatinangor/Sumedang).

## Aktor

Tiga aktor dengan generalisasi: Pengemudi → Dishub → Admin. Generalisasi hanya mewarisi hak akses, **bukan** menghapus kewajiban Login. Setiap aktor Login sendiri.

> Catatan implementasi (28-10-2026, keputusan #30 di `05-decisions.md`): di dashboard web, Admin dan Dishub dibuat sebagai dua halaman terpisah **tanpa akses silang**; Admin tidak memakai menu atau endpoint Dishub. Bila diagram use case tetap memakai generalisasi, sesuaikan agar sama dengan keputusan ini.

Pengemudi memakai aplikasi mobile. Dishub dan Admin memakai dashboard web.

## Use case

| ID | Use case | Aktor |
|---|---|---|
| UC-001 | Login | Semua |
| UC-002 | Lihat Peta Zona Risiko | Pengemudi |
| UC-003 | Laporkan Kejadian Kecelakaan | Pengemudi |
| UC-004 | Lihat Riwayat Laporan | Pengemudi |
| UC-005 | Input Data Kecelakaan Resmi | Dishub |
| UC-006 | Lihat Dashboard Statistik | Dishub |
| UC-007 | Lihat Detail Laporan | Dishub |
| UC-008 | Ekspor Data | Dishub |
| UC-009 | Verifikasi Laporan (Foto) | Admin |
| UC-010 | Kelola Data Kecelakaan | Admin |

`<<extend>>` Ekspor Data memperluas Lihat Detail Laporan. Notifikasi peringatan dini adalah proses latar belakang, bukan use case interaktif.

## Functional requirements

| ID | Nama | Prioritas |
|---|---|---|
| FR-001 | Tampil Informasi Titik Rawan | Must |
| FR-002 | Pelaporan Kejadian Kecelakaan | Must |
| FR-003 | Notifikasi Peringatan Dini (radius 300 m) | Must |
| FR-004 | Input Data Kecelakaan Resmi (Dishub) | Should |
| FR-005 | Verifikasi Laporan (berfoto → Admin; tanpa foto → masuk otomatis, bobot 0,5) | Should |
| FR-006 | Riwayat Laporan Pengguna | Could |
| FR-007 | Autentikasi dan Hak Akses (JWT, role) | Must |
| FR-008 | Perhitungan Skor Risiko Zona (otomatis, scheduler) | Must |
| FR-009 | Dashboard Statistik Dishub | Should |
| FR-010 | Detail Laporan untuk Dishub (identitas disamarkan) | Should |
| FR-011 | Ekspor Data CSV | Could |

UC-010 (Kelola Data Kecelakaan) belum punya FR sendiri.

## Non-functional requirements

| ID | Kategori | Kriteria |
|---|---|---|
| NFR-001 | Performance | Peta termuat ≤ 10 detik saat pertama dibuka; delay notifikasi zona ≤ 3 detik |
| NFR-002 | Usability | Pengguna baru bisa melapor dalam ≤ 1 menit pada percobaan pertama |
| NFR-003 | Availability | ≥ 99% per bulan |
| NFR-004 | Security | Password di-hash (bcrypt); validasi laporan berjenjang |
| NFR-005 | Compatibility | Android dan iOS |
| NFR-006 | Privacy | Tampilan Dishub tidak memuat nama, email, atau id pelapor |

Radius notifikasi 300 m berdasar waktu reaksi 7–18 detik pada 40–100 km/jam. `radius_notifikasi` (konstanta aplikasi) berbeda dari `radius_zona` (konstanta clustering di database).

## KPI

| KPI | Target |
|---|---|
| Zona risiko dipetakan | Minimal 15 zona di Bandung Raya |
| Delay deteksi + kirim notifikasi | ≤ 3 detik |
| Laporan tersimpan tanpa gagal teknis | ≥ 95% |

## Data

- Data survei asli berupa nama jalan teks bebas (puluhan responden). Terbanyak: Jl. Soekarno Hatta (18 sebutan, "Bypass" juga merujuk ke jalan ini), Cibiru/Cinunuk (7), Jatinangor (3), Rancaekek–Cicalengka (3).
- Titik dummy 200–300 buah, berlabel `sumber_data: wawancara | sintetis`. Dosen sudah menyetujui dengan disclaimer.
- Semua data survei dianggap akurat (confidence level di-DROP).
- Kondisi cuaca data historis diisi dummy dengan pengungkapan.
