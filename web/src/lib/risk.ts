import { colors } from '../theme/tokens';
import { kategoriDariSkor } from './zoneScore';
import type { KategoriRisiko } from '../types';

/** docs/01-scoring-formula.md, step 5: <50 hijau, 50..80 kuning, >80 merah (the one rule lives in shared/zoneScore.ts). */
export const kategoriFromPercentile: (p: number) => KategoriRisiko = kategoriDariSkor;

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
