# Arsip mobile v2

Salinan aplikasi mobile (Expo, Pengemudi) tepat sebelum safe area, bottom bar berpenanda aktif, dan layout Lapor baru (acuan `docs/design/prototype-mobile.html`). Dibuat **2 November 2026**.

Isi: `src/`, `assets/`, `App.tsx`, `index.ts` (entry point), `package.json`, `app.json`. Tanpa `node_modules`. Isinya identik dengan `mobile/` saat dibuat (dibandingkan dengan `diff -r`).

Arsip sebelumnya, `mobile-v1`, sengaja tidak ditimpa: isinya adalah keadaan tag `mobile-design-v1` (sebelum batik 22% dan kartu kaca prototipe).

## Hubungan dengan git

Saat arsip dibuat, `mobile/` sama persis dengan commit `70dd4ab` ("background fix"); tidak ada perubahan mobile yang belum di-commit. Tag `mobile-design-v1` menunjuk ke `afe53cd` (keadaan `mobile-v1`), **bukan** ke arsip ini. Untuk menandai keadaan ini, buat tag sendiri, misalnya:

```
git tag mobile-design-v2 70dd4ab
```

## Cara kembali

Simpan dulu pekerjaan yang ada (commit atau salin ke tempat lain).

**A. Dari folder ini** (dari akar repo, PowerShell):

```powershell
Remove-Item -Recurse -Force mobile\src, mobile\assets
Copy-Item -Recurse docs\design\archive\mobile-v2\src mobile\src
Copy-Item -Recurse docs\design\archive\mobile-v2\assets mobile\assets
Copy-Item docs\design\archive\mobile-v2\App.tsx, docs\design\archive\mobile-v2\index.ts, docs\design\archive\mobile-v2\package.json, docs\design\archive\mobile-v2\app.json mobile\
cd mobile; npm install
```

Hapus dulu `mobile\src` agar berkas yang dibuat setelah arsip (misalnya `SegmentedControl.tsx`, `LineIcon.tsx`) tidak tertinggal.

**B. Dari tag** (bila tag `mobile-design-v2` sudah dibuat seperti di atas):

```
git checkout mobile-design-v2 -- mobile/
```

Perintah ini hanya menimpa berkas yang ada di tag; berkas yang dibuat sesudahnya tetap ada. Untuk pemulihan penuh, hapus `mobile/src` dulu atau pakai cara A.

## Animasi dan transisi yang ada sekarang

**Library:** hanya `Animated` bawaan React Native (tidak ada Reanimated, tidak ada `LayoutAnimation`), ditambah animasi bawaan React Navigation (native-stack) dan `react-native-maps`. *Reduce motion* dibaca lewat `hooks/useReduceMotion.ts` (`AccessibilityInfo`), dan hanya dipakai oleh tiga animasi baru di bagian bawah tabel.

| Efek | Komponen / berkas | Detail | Driver |
|---|---|---|---|
| Splash minimal tampil | `App.tsx` (`SPLASH_MS`) | Splash ditahan minimal 1500 ms sejak aplikasi dibuka | (timer) |
| Splash memudar | `components/SplashOverlay.tsx` | `Animated.timing` opacity 1 → 0, 250 ms, easing bawaan (`easeInOut`), lalu dilepas dari layar | native |
| Progress onboarding | `components/OnboardingProgress.tsx` | Isi bar dan ikon mobil bergeser, `Animated.timing` 250 ms, easing bawaan | JS (lebar dan `left`) |
| Pergantian halaman onboarding | `screens/OnboardingScreen.tsx` | Seketika; yang bergerak hanya progress bar | — |
| Toggle (switch) | `components/Toggle.tsx` | Warna track, warna kenop, posisi kenop, `Animated.timing` 220 ms, `Easing.out(Easing.quad)` | JS |
| Bottom sheet zona: buka/tutup | `components/ZoneSheet.tsx` | `translateY` 520 ↔ 0, `Animated.timing` 220 ms, easing bawaan | native |
| Bottom sheet zona: seret | `components/ZoneSheet.tsx` | `PanResponder`; dilepas > 80 px atau vy > 0.8 menutup, selain itu `Animated.spring` kembali ke 0 | native |
| Peta pindah ke lokasi | `screens/PetaScreen.tsx` | `animateToRegion` 400 ms | react-native-maps |
| Transisi layar (stack app dan auth) | `navigation/AppNavigator.tsx`, `AuthNavigator.tsx` | native-stack `animation: 'fade'` | native |
| Pindah tab | `navigation/AppNavigator.tsx` | `tabBar` sendiri (`BottomBar`), tanpa animasi pindah tab; ikon tab aktif berwarna accent | — |
| Umpan balik tekan | `PrimaryButton` (opacity 0.85), `ReportCard` (0.8), `GlassMenu` (0.7) | Opacity selama ditekan (`Pressable`) | — |
| Indikator memuat | `ActivityIndicator` di `LoadingScreen`, `PrimaryButton` (busy), `ZoneSheet`, `HomeScreen` (di tengah skeleton), `RiwayatScreen`, `PetaScreen`, `LocationPermissionScreen`, `EditProfilScreen` | Spinner bawaan | native |
| Skeleton Home | `components/Skeleton.tsx` (di `HomeScreen`) | Dua blok 96 tinggi; pita terang bergeser (`translateX`), `Animated.loop` 1200 ms linear. Reduce motion: blok diam | native |
| Goyang form Lapor | `screens/LaporScreen.tsx` | Saat validasi gagal: `translateX` -6, 6, -4, 3, 0, masing-masing 80 ms linear (400 ms). Reduce motion: tidak bergoyang | native |
| Centang Laporan Terkirim | `components/DrawnCheck.tsx` | Lingkaran tergambar 700 ms, centang 400 ms mulai 550 ms, `Easing.bezier(0.2, 0.8, 0.2, 1)` (stroke-dashoffset). Reduce motion: langsung utuh | JS |

Tidak ada toast, FAB animasi, atau penanda tab berbentuk pil pada versi ini.
