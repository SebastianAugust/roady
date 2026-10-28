# Roady! (RoadWatchers) — Panduan untuk Claude Code

Aplikasi peringatan dini titik rawan kecelakaan di Bandung Raya (SDG 3.6), proyek mata kuliah Rekayasa Perangkat Lunak, Universitas Padjadjaran 2026, tim The Roadwatchers. Nama di aplikasi sementara **Roady!** (nama resmi proyek: RoadWatchers).

## Aturan keras

1. **Jangan pernah `git commit`, `git push`, `git tag`, atau membuat PR.** Pemilik repo yang commit dan push sendiri. Boleh `git status`, `git diff`, `git log` (baca saja).
2. **Jangan usulkan ulang hal yang sudah di-DROP** (lihat "Di luar scope" di bawah).
3. **Jangan menaruh rahasia di repo** (password, token, connection string). Pakai `.env` (di-`.gitignore`) dan `.env.example` berisi nama variabel saja.
4. **Jangan menimpa file yang sudah ada tanpa membacanya dulu.**
5. Nama aplikasi hanya ditulis di satu konstanta (`APP_NAME`), karena bisa diganti ke RoadWatchers.

## Status dan urutan kerja

**Frontend dulu dengan data tiruan (mock), backend menyusul.** Urutan:
1. `mobile/` (Expo): tema dari Figma, Login, Sign up, Peta, Lapor, Riwayat, Profil.
2. `web/` (React + Vite): dashboard Dishub dan dashboard Admin (dua halaman terpisah).
3. `api/` (Node.js + Express + PostgreSQL/PostGIS): setelah layar utama jadi.

Frontend memanggil API lewat satu lapisan (`src/api/`) yang punya dua implementasi: **mock** (default, data tiruan berbentuk sama dengan API asli) dan **real** (HTTP). Dipilih lewat env (`EXPO_PUBLIC_USE_MOCK` / `VITE_USE_MOCK`). Tipe data dan endpoint mengikuti `docs/03-api.md` dan `docs/02-database.md`, jadi pindah ke API asli cukup mengganti implementasi.

## Stack

| Bagian | Teknologi |
|---|---|
| Mobile (Pengemudi) | React Native + Expo, TypeScript |
| Web (Dishub, Admin) | React + Vite, TypeScript |
| Backend | Node.js + Express *(rencana, belum dikonfirmasi tim)* |
| Database | PostgreSQL + PostGIS *(hosting: Aiven atau Neon, belum dipilih; cek `CREATE EXTENSION postgis`)* |
| Notifikasi status laporan | Firebase Cloud Messaging |
| Cuaca | Open-Meteo API |
| Auth | JWT + bcrypt |

Catatan teknis mobile:
- Notifikasi radius 300 m dihitung **di perangkat** (jarak ke centroid zona yang sudah diunduh), bukan di server.
- Geofence saat aplikasi di background kemungkinan butuh *development build*, tidak cukup Expo Go. Mulai dari foreground dan tes dengan Expo Go dulu.
- Tes lokasi di Android dengan mock location di opsi pengembang.

## Struktur repo (target)

```
roady/
├── CLAUDE.md
├── docs/            # dokumen proyek, baca sebelum membangun fitur
├── mobile/          # Expo app (Pengemudi)
├── web/             # Vite app (Dishub + Admin)
└── api/             # Express API (belakangan)
```

## Dokumen yang harus dibaca

| File | Isi | Baca saat |
|---|---|---|
| `docs/00-overview.md` | Scope, aktor, use case, FR, NFR, KPI | Memulai apa pun |
| `docs/01-scoring-formula.md` | Rumus skor risiko zona | Menyentuh zona, warna, skor |
| `docs/02-database.md` | 5 tabel dan bentuk data | Membuat tipe data, mock, migrasi |
| `docs/03-api.md` | 13 endpoint, role, kode status | Membuat lapisan API |
| `docs/04-navigation-and-screens.md` | Pohon navigasi + daftar layar Figma dengan node-id | Membangun layar |
| `docs/05-decisions.md` | Keputusan final dan hal yang belum diputuskan | Ragu soal perilaku |

## Cara membaca Figma (hemat token)

- File Figma: key `0QjYuXdvJ0TeJGcPRi2vdF`. Section prototype: User `1110:1729`, Admin `1110:1730`, Dishub `1110:1731`.
- **Jangan membaca satu section utuh.** Section Dishub saja lebih dari 270 ribu karakter. Baca satu frame per layar yang sedang dibangun, pakai node-id di `docs/04-navigation-and-screens.md`.
- Ambil warna, font, dan komponen berulang (navbar, dropdown `d.*`) satu kali, simpan sebagai token dan komponen bersama, lalu pakai ulang.
- Frame yang berulang (varian input, konfirmasi) dibangun dari satu komponen.
- Ukuran layar: mobile 412×892, web 1440×1024.

## Scope (terkunci)

**Termasuk:** peta titik rawan, peringatan dini radius 300 m, laporan kejadian oleh Pengemudi, verifikasi laporan berfoto oleh Admin, validasi otomatis, input data resmi oleh Dishub, dashboard statistik, detail laporan (identitas pelapor disamarkan), ekspor CSV, faktor cuaca. Wilayah: Bandung Raya (Kota Bandung, Cimahi, Kab. Bandung, KBB, Jatinangor/Sumedang).

**Di luar scope (jangan diusulkan):** kondisi jalan rusak atau penerangan sebagai fitur, deteksi kelelahan pengemudi, routing A-ke-B, upvote/trust score/reputasi, confidence level lokasi, device fingerprinting, rate limiting per akun.

## Aktor dan hak akses

- **Pengemudi** memakai aplikasi mobile. Daftar akun sendiri (role otomatis `pengemudi`).
- **Dishub** memakai dashboard web. Akun dibuat tim, tidak ada pendaftaran. Menu: Beranda, Statistik Zona (tab Tabel | Peta), Arsip & Input, Detail Laporan, Ekspor Data.
- **Admin** memakai dashboard web. Akun dibuat tim. Menu: Beranda, Verifikasi Laporan, Kelola Data Kecelakaan.
- **Admin dan Dishub adalah dua halaman terpisah tanpa akses silang** (keputusan #30, menggantikan "Admin punya semua menu Dishub"). Admin tidak membuka layar Dishub dan sebaliknya; URL role lain → 403; endpoint role lain → 403.
- Dishub **tidak** boleh Kelola Data Kecelakaan (hanya Admin).
- Tampilan Dishub dan Admin tidak boleh memuat nama, email, atau id pelapor (NFR-006).

## Konvensi kode

- TypeScript strict, tanpa `any` kecuali terpaksa dan diberi komentar alasannya.
- Teks antarmuka dalam Bahasa Indonesia. Identifier, nama file, dan komentar kode dalam Bahasa Inggris.
- Satu komponen satu file. Warna dan jarak lewat token tema, bukan angka di dalam komponen.
- Setelah menyelesaikan satu layar atau fitur: jalankan lint dan type-check, lalu laporkan apa yang diubah dan apa yang perlu dites manual. Jangan commit.
- Tambahkan perintah yang berlaku (install, jalankan, lint, test) ke bagian ini begitu proyeknya ada.

## Token warna (mobile)

Tema gelap. Sumber kebenaran: `mobile/src/theme/tokens.ts`. Jangan menulis warna langsung di layar; pakai `colors.*` (keputusan #15 di `docs/05-decisions.md`; tema terang dan palet teal sebelumnya sudah diganti).

| Token | Nilai | Pakai untuk |
|---|---|---|
| `bg` | #0A1A33 | latar halaman |
| `surface` | #12294D | kartu, bottom bar |
| `surfaceRaised` | #1A3560 | bottom sheet, dropdown, popup, elemen di atas kartu |
| `border` | rgba(255,255,255,0.12) | garis tepi dan pemisah |
| `textPrimary` / `textSecondary` / `textMuted` | #FFFFFF / #C5CEDB / #8A96A8 | teks isi, sekunder, petunjuk dan placeholder |
| `accent` | #9DB7E8 | ikon tab terpilih, ikon menu, link |
| `disabled` | #4A5870 | elemen nonaktif |
| `buttonPrimary` / `onButtonPrimary` | #FFFFFF / #0A1A33 | tombol utama (latar putih, teks navy) |
| `gradients.brand` | navy900 → navy700 → navy500, diagonal | latar semua layar lewat `AppBackground` (gradien + batik-soft, `expo-linear-gradient`) |
| `riskMerah` / `riskKuning` / `riskHijau` | #FD0000 / #C5B94B / #3E8139 | hanya marker, badge, status zona (marker bertepi putih) |

Hierarki lewat perbedaan permukaan (bg < surface < surfaceRaised), bukan bayangan. Panel kaca: komponen `Glass` (`expo-blur` + token `glassFill`/`glassEdge`); kartu di dalam panel kaca memakai `<Glass inner>` (tanpa blur). Area zona di peta: `ZoneAreas` (Circle `radius_zona`, isian 30%, garis 2 dp), legenda `ZoneLegend`. Target kontras 4,5:1 untuk teks biasa; `textMuted` hanya untuk petunjuk di atas `bg` atau `surface`.

## Perintah

Mobile (`mobile/`, jalankan dari folder itu):

| Perintah | Fungsi |
|---|---|
| `npx expo start` | Jalankan dev server (Expo Go di HP) |
| `npx expo install <paket>` | Pasang paket dengan versi yang cocok dengan SDK (jangan `npm install`) |
| `npx tsc --noEmit` | Type-check |
| `npx expo lint` | Lint (hanya `src/`) |
| `npm test` | Unit test (jest-expo), saat ini `src/geofence/__tests__/` |

Navigasi memakai React Navigation (permintaan pemilik repo), bukan Expo Router seperti di `mobile/AGENTS.md`. Sesi login disimpan di `expo-secure-store`. Akun mock: `pengemudi@roady.test` / `password123` (lihat `src/api/mock.ts`).

Web (`web/`, jalankan dari folder itu; salin `.env.example` ke `.env` bila perlu):

| Perintah | Fungsi |
|---|---|
| `npm install` | Pasang dependensi |
| `npm run dev` | Dev server Vite (http://localhost:5173) |
| `npx tsc -b` | Type-check |
| `npm run lint` | Lint (oxlint) |
| `npm run build` | Type-check + build produksi |

Token web di `web/src/theme/tokens.ts` (jadi CSS variables lewat `theme/cssVars.ts`); CSS memakai `var(--color-*)`, tidak ada warna langsung. Latar semua halaman (termasuk Login) adalah komponen `AppBackground` (gradien berlapis + tiga gugus `batik-soft.png` sebagai background-image biasa, tanpa mask; penempatan di `theme/batikLayout.ts`, aset dibuat oleh `node scripts/make-batik.mjs` dari `docs/design/batik.png`). Panel memakai `.glass` (blur nyata, satu per area) dan isi di dalamnya `.glass-in` (tanpa blur); jangan beri backdrop-filter ke baris tabel atau elemen berulang, dan jangan menulis latar solid baru untuk panel (keputusan #29, acuan `docs/design/glass-reference.html`). Acuan desain web ada sebagai PNG di `docs/design/`. Sesi JWT disimpan di `localStorage`. Akun mock: `dishub@roady.test` / `password123`, `admin@roady.test` / `password123`; `pengemudi@roady.test` ditolak di Login web. Menu per role ada di `NAV_ITEMS` (`web/src/routes.ts`); rute Dishub dan Admin di dua cabang `RequireRole` terpisah di `App.tsx` (tanpa akses silang, keputusan #30). Tile peta: Stadia Alidade Smooth terang (tanpa key di localhost), bisa diganti lewat `VITE_MAP_TILE_URL`; CARTO tidak bisa dipakai (semua tile minta API key). Zona digambar sebagai area (lingkaran `radius_zona`, isian 30%, garis tepi 2px warna risiko) lewat `ZoneArea`; peta Statistik Zona adalah `ZoneMap`, peta detail satu kejadian adalah `IncidentMap` (satu pin + lingkaran zona).
