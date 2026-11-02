# Arsip web v1

Salinan `web/` (Dishub + Admin) tepat sebelum desain web diubah lagi. Dibuat **2 November 2026**.

Isi: `src/`, `index.html`, `public/`, `package.json`. Tanpa `node_modules` dan `dist`. Lockfile, `vite.config.ts`, `tsconfig*.json`, dan `vercel.json` tidak ikut disalin karena tidak berubah oleh desain; ambil dari `web/` bila perlu.

Isi arsip identik dengan `web/` saat dibuat (dibandingkan dengan `diff -r`).

## Hubungan dengan git

- Tag `web-design-v1` menunjuk ke commit `209c239` ("revision", 2-11-2026).
- Arsip ini sama dengan tag itu **kecuali `web/src/routes.ts`**: di arsip, judul tab "Statistik Zona" dan "Verifikasi Laporan" (mengikuti prototipe v2); di tag masih "Zona" dan "Review". Perubahan itu belum di-commit saat arsip dibuat.
- Jadi memulihkan dari tag memberi desain yang sama, hanya dengan dua judul tab yang lama.

## Cara kembali

Kembali ke desain ini berarti menimpa `web/src`. Simpan dulu pekerjaan yang ada (commit atau salin ke tempat lain).

**A. Dari folder ini** (dari akar repo, PowerShell):

```powershell
Remove-Item -Recurse -Force web\src, web\public
Copy-Item -Recurse docs\design\archive\web-v1\src web\src
Copy-Item -Recurse docs\design\archive\web-v1\public web\public
Copy-Item docs\design\archive\web-v1\index.html web\index.html
Copy-Item docs\design\archive\web-v1\package.json web\package.json
cd web; npm install; npm run build
```

Hapus dulu `web\src` agar berkas yang dibuat setelah arsip tidak tertinggal. Dependensi bisa berubah antara versi, jadi jalankan `npm install` setelah mengganti `package.json`.

**B. Dari tag** (bila tag ada di repo):

```
git checkout web-design-v1 -- web/
```

Perintah ini hanya menimpa berkas yang ada di tag; berkas yang dibuat sesudahnya tetap di tempat. Untuk pemulihan penuh, hapus `web/src` lebih dulu atau pakai cara A.

## Animasi dan transisi yang ada sekarang

Semua gerak hidup di `src/motion.css` kecuali yang tertulis lain. Token (`src/theme/tokens.ts`, jadi CSS variable):
`--ease` = `cubic-bezier(.2,.8,.2,1)`, `--dur-fast` = 120ms, `--dur-base` = 200ms, `--dur-enter` = 500ms.

**Reduced motion:** semua animasi CSS di `motion.css` berada di dalam `@media (prefers-reduced-motion: no-preference)`, jadi dengan `reduce` tidak ada yang bergerak dan kondisi akhir langsung tampil. Pengecualian dan penyesuaian ada di kolom "Reduced motion" di bawah.

### A. Keyframes (`motion.css`)

| Keyframes | Gerak | Durasi, easing | Dipakai oleh |
|---|---|---|---|
| `rise-in` | fade 0→1 + naik 8px | 350ms, `--ease`, `backwards` | Isi halaman: `.app-main > :not(.home)` (semua halaman setelah login, tiap pindah rute) |
| `rise` | fade 0→1 + naik 14px | `--dur-enter` (500ms), `--ease`, `backwards` | `.rise`: kartu Login (`LoginPage`). `.stagger > *`: anak kartu Login bergantian. `.rise-rows > tr`: baris tabel di `ZoneTable`, `AccidentsTable`, `LaporanPage` |
| `pop-in` | fade 0→1 + skala 0,96→1 | `--dur-base`, `--ease`, `backwards` | `.account-popup` (menu akun, origin kanan-atas), `.dialog[open]` (modal `Dialog`/`VerifyDialog`, origin dari tombol pemicu), `.palette` (palet perintah). Utilitas `.pop` ada tapi belum dipakai komponen |
| `fade-in` | opacity 0→1 | `--dur-base`, `--ease`, `backwards` | `.dialog[open]::backdrop`, `.drawer-scrim`, `.palette-scrim` |
| `fade-out` | opacity →0 | `--dur-base`, `--ease`, `forwards` | `.toast-leaving` (toast keluar) |
| `slide-in-right` | geser dari kanan (`translateX(100%)`→0) | 300ms, `--ease`, `backwards` | `.drawer` (`ReportDrawer`, `AccidentEditDrawer`). Utilitas `.slide-in-right` ada tapi belum dipakai |
| `toast-in` | fade 0→1 + turun dari atas 16px | 300ms, `--ease`, `backwards` | `.toast` (`ToastProvider`) |
| `shake` | getar horizontal -8/+7/-5/+3px | 400ms, `ease-in-out` | `.shake` pada form Login (login gagal) dan `QuickInputForm` (simpan gagal validasi). Kelas dilepas lewat `onAnimationEnd` agar kegagalan berikutnya bergetar lagi |
| `shimmer` | kilap geser (`background-position` 200%→-200%) | 1,2s, `linear`, tak terbatas | `.shimmer` pada `Skeleton` (dipakai `PageSkeleton`, `StatTilesSkeleton`, `TableSkeleton`) |
| `grow` | batang tumbuh `scaleY(0)`→1 dari dasar | 700ms, `--ease`, `backwards`; jeda `i × 60ms` (inline) | `.bar-grow` di `WeekBars` (grafik 7 hari Beranda) |
| `spin` | putar 360° | 0,7s, `linear`, tak terbatas | `.btn-spinner` di `Button` saat `busy` |
| `load-spin` | putar 360° | 0,8s, `linear`, tak terbatas | `.load-spinner` di `LoadState` (`LoadState.css`, di luar `motion.css`). Reduced motion: `animation: none` |

Jeda berurutan:
- `.stagger > *`: 60, 120, 180, 240, 300, 360, 420, 480ms (anak ke-1 sampai ke-8 dan seterusnya).
- `.rise-rows > tr`: 0, 70, 140, 210, 280, 350, 420, 490ms; baris ke-9 dan seterusnya tanpa animasi.

### B. Transisi (hover, fokus, status)

| Elemen | Properti, durasi, easing | Catatan |
|---|---|---|
| `.sidebar-item`, `.sidebar-hint`, `.switch`, `.switch::after`, `.chip`, `.btn`, `.account-chip`, `.account-item`, `.quick-reason`, `.field-input` (dan `.navbar-tab`, sudah tidak ada komponennya) | `background-color`, `border-color`, `color`, `box-shadow`, `filter` 200ms `ease`; `transform` 120ms `--ease` | Perubahan halus saat hover, fokus, dan toggle. `.switch::after` memakai `transform` untuk menggeser kenop |
| `.btn:hover` | `filter: brightness(.92)`, naik 1px, bayangan tombol | Hanya bila tidak `disabled` dan tidak `aria-busy` |
| `.btn:active` | `brightness(.85)`, kembali ke 0 + skala 0,98, tanpa bayangan | |
| `.menu-card`, `.stat-tile-button`, `.hover-lift` | `border-color`, `box-shadow` 180ms `ease`; `transform` 180ms `--ease` | Hover: naik 2px + bayangan kartu. Active (`.menu-card`, `.stat-tile-button`): turun + skala 0,99. `.hover-lift` dipakai `KpiCard`, `WeatherCard`, `WeekBars`, panel di `DishubHome` dan `AdminHome`; `.stat-tile-button` di `StatTile`. `.menu-card` (`MenuCard`) tidak dipakai halaman mana pun sekarang |
| `.schematic-zone .schematic-area` | `fill-opacity` 200ms `ease` | Hover zona di peta SVG (`SchematicMap.css`), dibungkus `no-preference` |
| `.ekspor-progress i` | `width` 200ms `--ease` | Bar progres Ekspor (`EksporPage.css`), dibungkus `no-preference` |

### C. Animasi lewat JavaScript

| Animasi | Detail | Berkas | Reduced motion |
|---|---|---|---|
| Skeleton pindah halaman | Setiap rute berganti, `PageSkeleton` tampil 600ms (`PAGE_SKELETON_MS`), lalu halaman muncul dengan `rise-in`. Tidak tampil pada muat pertama | `components/AppLayout.tsx` | Dilewati; halaman langsung tampil |
| Count-up angka KPI | 0 → nilai dalam 600ms, `easeOutCubic` (`1-(1-t)^3`), `requestAnimationFrame`; perubahan berikutnya menghitung dari angka di layar. Pembaca layar hanya mendapat nilai akhir | `components/KpiNumber.tsx` | Nilai akhir langsung |
| Toast | Tampil 3000ms (6000ms bila ada "Urungkan"), lalu `fade-out` 200ms (`LEAVE_MS`) sebelum dihapus; klik teks menutup | `components/ToastProvider.tsx` | Animasi CSS-nya mati; batas waktunya tetap |
| Grafik riwayat skor | Animasi bawaan Chart.js (garis tergambar, sekitar 1 detik, `easeOutQuart`) | `components/ScoreHistoryChart.tsx` | `animation: false` |
| Origin modal | `transform-origin` dihitung dari posisi tombol pemicu sehingga `pop-in` tumbuh dari tombol itu | `components/Dialog.tsx` | Tidak ada animasi |
| Langkah progres Ekspor | Bar maju 8% → 55% → 85% → 100% dengan jeda 150, 200, 150, 250ms di antara langkah | `pages/EksporPage.tsx` | Lebar berubah tanpa transisi; jeda tetap |

### D. Selektor di `motion.css` yang tidak lagi punya komponen

Tidak merusak apa pun, tapi bisa dibuang saat merapikan: `.home-wave`, `.home-head`, `.menu-cards > .menu-card` (animasi `rise-in` 220ms, jeda 40ms per kartu), `.navbar-tab` (di daftar transisi). Utilitas `.pop` dan `.slide-in-right` belum dipakai komponen.

### E. Di luar kode kita

Peta Google (`GoogleMapView`) memakai animasi geser dan zoom bawaannya sendiri dan tidak mengikuti pengaturan di atas.
