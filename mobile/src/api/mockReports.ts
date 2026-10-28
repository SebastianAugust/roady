import type { Laporan } from '../types';

// The signed-in driver's own reports (sumber_data: sintetis), same two as the Figma home frame.
// Mutable on purpose: the mock createReport appends here so Home shows the new report.
export const MOCK_REPORTS: Laporan[] = [
  {
    id_report: 1,
    zona_id: 3,
    latitude: -6.9447,
    longitude: 107.6409,
    alamat_teks: 'Jl. Buahbatu, Margasari, Kota Bandung',
    kategori: 'kecelakaan',
    deskripsi: 'Kecelakaan tunggal, motor, karena jalanan rusak di perempatan jalan Buahbatu.',
    foto_url: 'https://example.invalid/foto/1.jpg',
    tanggal_kejadian: '2026-10-14',
    kondisi_cuaca_saat_kejadian: 'cerah',
    timestamp: '2026-10-14T08:30:00.000Z',
    status: 'approved',
    alasan_penolakan: null,
  },
  {
    id_report: 2,
    zona_id: 1,
    latitude: -6.9436,
    longitude: 107.6958,
    alamat_teks: null, // example of a failed lookup: the UI falls back to coordinates
    kategori: 'kecelakaan',
    deskripsi: 'Kecelakaan beruntun di jalan Soetta, ada 1 mobil & 2 motor',
    foto_url: 'https://example.invalid/foto/2.jpg',
    tanggal_kejadian: '2026-10-17',
    kondisi_cuaca_saat_kejadian: 'hujan',
    timestamp: '2026-10-17T10:15:00.000Z',
    status: 'pending_review',
    alasan_penolakan: null,
  },
  {
    id_report: 3,
    zona_id: 4,
    latitude: -6.9501,
    longitude: 107.6118,
    alamat_teks: 'Jl. Soekarno Hatta, Kopo, Kota Bandung',
    kategori: 'kecelakaan',
    deskripsi: 'Motor jatuh di dekat halte Kopo.',
    foto_url: 'https://example.invalid/foto/3.jpg',
    tanggal_kejadian: '2026-10-01',
    kondisi_cuaca_saat_kejadian: 'hujan',
    timestamp: '2026-10-01T09:20:00.000Z',
    status: 'rejected',
    alasan_penolakan: 'Foto tidak menunjukkan lokasi kejadian. Kirim ulang dengan foto yang jelas di lokasi.',
  },
];
