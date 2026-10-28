import { haversineMeters } from '../geofence';
import { kategoriFromPercentile } from '../lib/risk';
import type { Zona } from '../types';

// Sample zones (sumber_data: sintetis) around the streets named most in the survey: Jl. Soekarno Hatta,
// Cibiru/Cinunuk, Jatinangor, Rancaekek-Cicalengka, plus central Bandung and Cimahi. Replace with API data.
const RADIUS_ZONA_M = 300;
const UPDATED = '2026-10-20T02:00:00.000Z';

// [lat, lng, jumlah_kejadian, skor_risiko percentile, weather_dependent]
const rows: [number, number, number, number, boolean][] = [
  [-6.9436, 107.6958, 21, 96, true], // Jl. Soekarno Hatta, Gedebage
  [-6.9419, 107.6701, 17, 90, false], // Soekarno Hatta, Margacinta
  [-6.9447, 107.6409, 12, 73, true], // Soekarno Hatta, Buahbatu
  [-6.9501, 107.6118, 9, 61, false], // Soekarno Hatta, Kopo
  [-6.9455, 107.5951, 6, 38, false], // Soekarno Hatta, Leuwipanjang
  [-6.9183, 107.7256, 14, 84, true], // Cibiru
  [-6.9425, 107.7313, 11, 70, true], // Cinunuk
  [-6.9275, 107.7708, 8, 56, false], // Jatinangor
  [-6.9697, 107.793, 10, 66, true], // Rancaekek
  [-6.9858, 107.835, 7, 44, false], // Cicalengka
  [-6.8935, 107.615, 4, 22, false], // Dipatiukur
  [-6.9034, 107.6188, 5, 31, false], // Pasteur
  [-6.9218, 107.6071, 13, 78, false], // Alun-alun / Asia Afrika
  [-6.8722, 107.542, 6, 40, false], // Cimahi
  [-6.9902, 107.6293, 3, 15, false], // Bojongsoang
  [-6.8393, 107.5745, 5, 28, false], // Lembang (KBB)
];

export const MOCK_ZONES: Zona[] = rows.map(([lat, lng, n, skor, wet], i) => ({
  zona_id: i + 1,
  center_latitude: lat,
  center_longitude: lng,
  radius_zona: RADIUS_ZONA_M,
  skor_risiko: skor,
  kategori_risiko: kategoriFromPercentile(skor),
  jumlah_kejadian: n,
  weather_dependent: wet,
  last_updated: UPDATED,
}));

export const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) =>
  haversineMeters({ latitude: lat1, longitude: lng1 }, { latitude: lat2, longitude: lng2 });
