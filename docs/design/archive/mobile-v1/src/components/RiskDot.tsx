import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';
import type { KategoriRisiko } from '../types';

export const RISK_COLOR: Record<KategoriRisiko, string> = {
  merah: colors.riskMerah,
  kuning: colors.riskKuning,
  hijau: colors.riskHijau,
};

/** Small category dot with a white edge (chips, labels). Always next to a text label: colour is never the only cue. */
export function RiskDot({ kategori }: { kategori: KategoriRisiko }) {
  return <View style={[styles.dot, { backgroundColor: RISK_COLOR[kategori] }]} />;
}

const styles = StyleSheet.create({
  dot: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: colors.white },
});
