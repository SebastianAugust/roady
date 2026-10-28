# 05 — Keputusan dan Hal yang Belum Diputuskan

## Sudah diputuskan

| # | Keputusan |
|---|---|
| 1 | Admin punya semua menu Dishub. Desain Admin yang belum memuatnya adalah kesalahan desain; pakai ulang layar Dishub. |
| 2 | Dishub **tidak** boleh Kelola Data Kecelakaan (hanya Admin). Abaikan frame `detail - Kelola data kecelakaan` di section Dishub. |
| 3 | Dishub punya Peta Zona Risiko. Desain web belum ada; adaptasi dari Peta mobile. |
| 4 | Layar pendukung mobile (onboarding, permission, bantuan) dibangun sesuai desain; letaknya di alur disesuaikan dengan use case. |
| 5 | `d.tipe_kecelakaan`, `d.cuaca`, `d.progress` adalah komponen dropdown. Baca pilihan sebenarnya dari Figma saat membangun form; kalau beda dari database, sesuaikan di kode dan catat di sini. |
| 6 | Nama aplikasi sementara **Roady!** (lebih menarik). Simpan di satu konstanta `APP_NAME`. |
| 7 | Frontend dulu dengan data tiruan, backend menyusul. |
| 8 | Claude dan Claude Code **tidak boleh commit atau push**. Pemilik repo yang melakukannya. |
| 9 | Registrasi publik hanya untuk Pengemudi; akun Dishub dan Admin dibuat langsung oleh tim. |
| 10 | Kalkulasi disimpan sebagai riwayat (banyak baris per zona) untuk tren di dashboard Dishub. |
| 11 | Form Lapor (mobile) memakai pilihan dropdown dari Figma: `d.tipe_kecelakaan` = Kecelakaan / Nyaris celaka (`kecelakaan` / `near_miss`), `d.cuaca` = Hujan / Cerah (`hujan` / `cerah`). Figma tidak punya "lainnya" untuk cuaca, jadi nilai `lainnya` di database tidak bisa dipilih dari aplikasi. Teks "Masuk Otomatis / Menunggu Tinjauan / Disetujui / Ditolak" di varian Default kedua komponen adalah sisa salinan `d.progress`, diabaikan. Form tidak punya kolom tanggal, jadi `tanggal_kejadian` diisi tanggal pengiriman. |
| 12 | `alamat_teks` (string atau null, opsional) pada `LAPORAN_KEJADIAN`: alamat disimpan saat laporan dikirim, bukan dihitung ulang dari koordinat. Aplikasi mengubah koordinat menjadi teks (jalan, kelurahan/kecamatan, kota) dengan `reverseGeocodeAsync` di perangkat; jika gagal, kosong, atau lebih dari 4 detik, disimpan `null` dan pengiriman tidak terhalang. Riwayat dan Detail Laporan menampilkan alamat itu, atau koordinat ringkas ("-6.9175, 107.6191") jika `null`. Alasan: hasil geocoder bisa berubah di kemudian hari, dan tampilan Dishub/Admin nanti tidak perlu memanggil geocoder. |
| 13 | ~~Palet teal + slate~~ (digantikan oleh keputusan #14; semua sisa warna teal dihapus dari kode). |
| 14 | ~~Tema terang navy/putih/abu~~ (digantikan oleh keputusan #15). |
| 15 | Tema gelap. Sumber kebenaran `mobile/src/theme/tokens.ts`: `bg` #0A1A33, `surface` #12294D, `surfaceRaised` #1A3560, `border` rgba(255,255,255,0.12), `textPrimary` #FFFFFF, `textSecondary` #C5CEDB, `textMuted` #8A96A8, `accent` #9DB7E8, `disabled` #4A5870. Gradien brand tetap diagonal navy900 → navy700 → navy500 (splash, onboarding, izin lokasi). Tombol utama: latar putih (`buttonPrimary`), teks navy900 (`onButtonPrimary`); sekunder: `surface` + border 12%, teks putih. Aksen aktif (ikon tab terpilih, ikon menu, link, progres) memakai `accent`. Kartu dan bottom bar memakai `surface`; bottom sheet, dropdown, popup, dan elemen di atas kartu memakai `surfaceRaised`; hierarki lewat perbedaan permukaan, bukan bayangan (semua `shadow*` dihapus). Panel kaca (legenda peta, sheet pra-login): navy semi-transparan + `BlurFill` (expo-blur, tint dark) + border putih 12%, teks putih; di Android expo-blur hanya menggambar lapisan transparan tanpa blur. Peta: gaya gelap Google (`lib/mapStyle.ts`, `customMapStyle`; Apple Maps mengabaikannya); marker risiko tidak berubah warna (merah #FD0000, kuning #C5B94B, hijau #3E8139) dan diberi garis tepi putih 1,5 px. Seluruh app: `StatusBar style="light"`, `keyboardAppearance="dark"` pada input, tema React Navigation gelap (`background` = bg) dan `contentStyle` navy pada stack, `app.json` `userInterfaceStyle: dark`, `backgroundColor` dan `splash.backgroundColor` #0A1A33. Teks error memakai `error` #FFD9D6; `statusSuccess` tetap #3A7D34 dan `statusWarning` kuning bertulisan hitam. Nama dan tagline di `APP_NAME` dan `APP_TAGLINE`. |

## Belum diputuskan (tanyakan ke pemilik repo sebelum berasumsi)

| # | Hal | Asumsi sementara |
|---|---|---|
| 1 | Stack backend final | Node.js + Express + PostgreSQL/PostGIS |
| 2 | Hosting database | Aiven atau Neon. Syarat: `CREATE EXTENSION postgis` harus berhasil. Pengembangan lokal pakai Docker |
| 3 | Dishub dan Admin boleh melapor kejadian (API-005, 006)? | Tidak |
| 4 | UC-010 Kelola Data Kecelakaan belum punya FR sendiri (gabung FR-004 atau FR-012) | Tidak mempengaruhi kode |
| 5 | Batas wilayah Bandung Raya (poligon atau kotak koordinat) dan nilai `radius_zona` | Kotak kasar dan konstanta konfigurasi untuk sementara |
| 6 | Data survei (nama jalan responden) belum dijadikan koordinat zona | Pakai zona contoh di sekitar Jl. Soekarno Hatta, Cibiru/Cinunuk, dan Jatinangor |
| 7 | Tempat penyimpanan foto laporan | Supabase Storage atau Cloudinary, belum dipilih |
| 8 | Isi pasti dropdown `d.progress`, `d.tipe_kecelakaan`, `d.cuaca` | Lihat keputusan #5 |
| 9 | Endpoint profil untuk mobile (`GET` dan `PATCH /api/users/me`) dan hapus akun | Dipakai sementara di mock, lihat bagian usulan di `docs/03-api.md`. Hapus akun belum dibuat |
| 10 | Tautan Instagram dan WhatsApp untuk layar Bantuan | Diisi lewat `EXPO_PUBLIC_INSTAGRAM_URL` dan `EXPO_PUBLIC_WHATSAPP_URL`; Figma tidak menyebut akun atau nomornya |
| 11 | Tampilan Detail Zona (bottom sheet) | Tidak ada frame Figma untuknya. Dibangun dari token yang ada; ganti bila desainnya dibuat |
| 12 | Frame Figma onboarding 6 (1032:7837) dan permission (1032:1561) | Belum dilihat secara visual (batas panggilan Figma MCP). Teks onboarding 6 dari metadata, label tombol "Selesai" disimpulkan dari lebar tombol; permission dibangun dari token. Cocokkan saat batas Figma pulih |

## Batasan teknis yang diketahui

- Geofence di background kemungkinan butuh development build (tidak cukup Expo Go).
- Free tier hosting database bisa dimatikan saat lama tidak dipakai; jangan mengandalkannya menjelang demo tanpa dicek.
