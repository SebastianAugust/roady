// Zone risk score as one pure function, shared by the web (Beranda, Statistik Zona) and, later, the mobile app.
// Plain TypeScript with no imports (it must run as it is under Node for the tests in zoneScore.test.mjs).
// The official score is computed by the scheduler (docs/01-scoring-formula.md: weights, percentile over all zones);
// this is the on-screen version: the stored base score, times the weather factor, capped at 100.

export type KategoriRisiko = 'merah' | 'kuning' | 'hijau';

/** Radius of the early warning around a zone centre, in meters (docs/00: peringatan radius 300 m). */
export const RADIUS_PERINGATAN_M = 300;

/** Multiplier of a weather-dependent zone while it rains (docs/01 step 3). */
export const FAKTOR_HUJAN = 1.5;

/** A zone depends on the weather when MORE than this share of its incidents happened in rain (exactly 0,6 does not count). */
export const AMBANG_PORSI_HUJAN = 0.6;

/** Category limits: below 50 hijau, 50 to 80 (both included) kuning, above 80 merah (docs/01 step 5). */
export const BATAS_HIJAU = 50;
export const BATAS_MERAH = 80;

export function kategoriDariSkor(skor: number): KategoriRisiko {
  if (skor > BATAS_MERAH) return 'merah';
  if (skor >= BATAS_HIJAU) return 'kuning';
  return 'hijau';
}

export interface InputSkor {
  /** The zone's score without the weather factor (0 to 100). */
  skorDasar: number;
  /** Whether it is raining now (or the rain simulation is on). */
  hujan: boolean;
  /** Share of the zone's incidents that happened in rain, 0 to 1. */
  porsiKejadianHujan: number;
}

export interface HasilSkor {
  skor: number;
  kategori: KategoriRisiko;
  /** True when the 1,5 factor was applied: it rains AND the zone depends on the weather. */
  faktorHujanAktif: boolean;
}

/** skor = min(100, round(skorDasar × (hujan dan porsi > 0,6 ? 1,5 : 1))); the category follows the score. */
export function hitungSkor({ skorDasar, hujan, porsiKejadianHujan }: InputSkor): HasilSkor {
  const faktorHujanAktif = hujan && porsiKejadianHujan > AMBANG_PORSI_HUJAN;
  const skor = Math.min(100, Math.round(skorDasar * (faktorHujanAktif ? FAKTOR_HUJAN : 1)));
  return { skor, kategori: kategoriDariSkor(skor), faktorHujanAktif };
}
