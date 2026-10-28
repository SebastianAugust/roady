import { colors } from '../theme/tokens';
import type { KategoriRisiko } from '../types';

/** docs/01-scoring-formula.md, step 5: <50 hijau, 50..80 kuning, >80 merah. */
export function kategoriFromPercentile(p: number): KategoriRisiko {
  if (p > 80) return 'merah';
  if (p >= 50) return 'kuning';
  return 'hijau';
}

export const RISK_LABEL: Record<KategoriRisiko, string> = {
  merah: 'Risiko Tinggi',
  kuning: 'Risiko Sedang',
  hijau: 'Risiko Rendah',
};

/** Highest risk first, as in the legends. */
export const RISK_ORDER: KategoriRisiko[] = ['merah', 'kuning', 'hijau'];

export const RISK_COLOR: Record<KategoriRisiko, string> = {
  merah: colors.riskMerah,
  kuning: colors.riskKuning,
  hijau: colors.riskHijau,
};
