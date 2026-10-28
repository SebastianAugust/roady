# 01 — Rumus Skor Risiko Zona (FINAL, versi sederhana)

Dijalankan oleh scheduler untuk setiap zona. Hasilnya disimpan sebagai **baris baru** di tabel Kalkulasi_Risiko (riwayat, bukan menimpa).

## Langkah 1 — Bobot validasi per laporan

Validasi otomatis gagal (lokasi di luar Bandung Raya atau field wajib kosong) → dibuang (`auto_rejected`).

| Kondisi | Status | Bobot |
|---|---|---|
| Ada foto, Admin setujui | `approved` | 1,0 |
| Ada foto, Admin tolak | `rejected` | dibuang |
| Ada foto, belum ditinjau | `pending_review` | belum dihitung |
| Tanpa foto (masuk otomatis) | `auto_approved` | 0,5 |

## Langkah 2 — Skor dasar per zona (jumlah, bukan rata-rata)

```
skor_dasar = SUM(bobot_validasi laporan crowd) + (jumlah KECELAKAAN_RESMI × 1,0)
```

## Langkah 3 — Faktor cuaca

```
persentase_hujan  = (laporan dengan cuaca = hujan) / (total laporan di zona)
weather_dependent = TRUE jika persentase_hujan > 60%

skor_mentah = skor_dasar × 1,5   jika weather_dependent DAN cuaca_sekarang = hujan
skor_mentah = skor_dasar         selain itu
```

Cuaca sekarang dari Open-Meteo. Batas 60% bersifat tegas: tepat 60% **bukan** weather_dependent.

## Langkah 4 — Normalisasi berbasis persentil

`skor_risiko (%)` = posisi persentil `skor_mentah` zona ini terhadap semua zona. Dihitung setelah semua zona punya `skor_mentah`.

## Langkah 5 — Kategori

| Persentil | Kategori | Warna |
|---|---|---|
| < 50 | Hijau | Risiko rendah |
| 50 sampai 80 (inklusif) | Kuning | Risiko sedang |
| > 80 | Merah | Risiko tinggi |

Batas: 49,99 → Hijau; 50,00 → Kuning; 80,00 → Kuning; 80,01 → Merah.

## Pengelompokan titik ke zona

Untuk tiap titik baru: jika ada zona dalam `radius_zona` dari centroid, titik masuk zona itu; jika tidak, buat zona baru dengan titik itu sebagai centroid. Nilai `radius_zona` belum ditetapkan, jadikan konstanta konfigurasi.

## Kelemahan yang sengaja didokumentasikan (jangan ditambal)

Foto bisa palsu, pengguna bisa melewati foto agar masuk otomatis, Admin hanya mahasiswa tanpa alat validasi tambahan, tidak ada peluruhan data lama, tidak ada jalur banding.
