# Arsip mobile v1

Salinan aplikasi mobile (Expo, Pengemudi) tepat sebelum batik dan tampilan diubah mengikuti `docs/design/prototype-mobile.html`. Dibuat **2 November 2026**.

Isi: `src/`, `assets/`, `App.tsx`, `index.ts`, `package.json`, `app.json`. Tanpa `node_modules`. Isinya identik dengan `mobile/` saat dibuat (dibandingkan dengan `diff -r`).

## Hubungan dengan git

Tag `mobile-design-v1` menunjuk ke commit `afe53cd` ("major change", 2-11-2026). Saat arsip dibuat, `mobile/` sama persis dengan tag itu (tidak ada perubahan yang belum di-commit).

## Cara kembali

Simpan dulu pekerjaan yang ada (commit atau salin ke tempat lain).

**A. Dari folder ini** (dari akar repo, PowerShell):

```powershell
Remove-Item -Recurse -Force mobile\src, mobile\assets
Copy-Item -Recurse docs\design\archive\mobile-v1\src mobile\src
Copy-Item -Recurse docs\design\archive\mobile-v1\assets mobile\assets
Copy-Item docs\design\archive\mobile-v1\App.tsx, docs\design\archive\mobile-v1\index.ts, docs\design\archive\mobile-v1\package.json, docs\design\archive\mobile-v1\app.json mobile\
cd mobile; npm install
```

Hapus dulu `mobile\src` agar berkas yang dibuat setelah arsip tidak tertinggal.

**B. Dari tag** (bila tag ada):

```
git checkout mobile-design-v1 -- mobile/
```

Perintah ini hanya menimpa berkas yang ada di tag; berkas yang dibuat sesudahnya tetap ada. Untuk pemulihan penuh, hapus `mobile/src` dulu atau pakai cara A.

## Animasi dan transisi yang ada sekarang

**Library:** hanya `Animated` bawaan React Native (tidak ada Reanimated, tidak ada `LayoutAnimation`), ditambah animasi bawaan React Navigation (native-stack) dan `react-native-maps`. Tidak ada pengecekan *reduce motion* di kode.

| Efek | Komponen / berkas | Detail | Driver |
|---|---|---|---|
| Splash minimal tampil | `App.tsx` (`SPLASH_MS`) | Splash ditahan minimal 1500 ms sejak aplikasi dibuka | (timer) |
| Splash memudar | `components/SplashOverlay.tsx` | `Animated.timing` opacity 1 → 0, 250 ms, easing bawaan `Animated.timing` (`easeInOut`), lalu dilepas dari layar | native |
| Progress onboarding | `components/OnboardingProgress.tsx` | Isi bar dan ikon mobil bergeser ke halaman berikutnya, `Animated.timing` 250 ms, easing bawaan (`easeInOut`) | JS (lebar dan `left`) |
| Pergantian halaman onboarding | `screens/OnboardingScreen.tsx` | Isi halaman berganti seketika (tanpa animasi); yang bergerak hanya progress bar di atas | — |
| Toggle (switch) | `components/Toggle.tsx` | Warna track, warna kenop, dan posisi kenop, `Animated.timing` 220 ms, `Easing.out(Easing.quad)` | JS |
| Bottom sheet zona: buka/tutup | `components/ZoneSheet.tsx` | `translateY` 520 ↔ 0, `Animated.timing` 220 ms, easing bawaan (`easeInOut`) | native |
| Bottom sheet zona: seret | `components/ZoneSheet.tsx` | Ikut jari (`PanResponder`); dilepas lebih dari 80 px atau cepat (vy > 0.8) menutup, selain itu `Animated.spring` kembali ke 0 (spring bawaan) | native |
| Peta pindah ke lokasi | `screens/PetaScreen.tsx` | `animateToRegion` 400 ms ke lokasi pengguna (dan ke posisi uji lokasi) | react-native-maps |
| Transisi layar (stack app) | `navigation/AppNavigator.tsx` | native-stack `animation: 'fade'` (durasi bawaan platform) | native |
| Transisi layar (stack auth) | `navigation/AuthNavigator.tsx` | native-stack `animation: 'fade'` | native |
| Pindah tab | `navigation/AppNavigator.tsx` | Bottom tabs dengan `tabBar` sendiri (`BottomBar`), tanpa animasi pindah tab | — |
| Umpan balik tekan | `PrimaryButton` (opacity 0.85), `ReportCard` (0.8), `GlassMenu` (0.7) | Opacity berubah selama ditekan (`Pressable`), tanpa durasi | — |
| Indikator memuat | `ActivityIndicator` di `LoadingScreen`, `PrimaryButton` (busy), `ZoneSheet`, `HomeScreen`, `RiwayatScreen`, `PetaScreen`, `LocationPermissionScreen`, `EditProfilScreen` | Spinner bawaan platform | native |

Tidak ada skeleton, toast, FAB animasi, atau animasi centang pada versi ini.
