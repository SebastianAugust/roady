import { StyleSheet, Text, View } from 'react-native';
import { RISK_LABEL } from '../lib/risk';
import { AREA_FILL_ALPHA, AREA_STROKE_WIDTH, withAlpha } from '../lib/zoneArea';
import { colors, fontFamily } from '../theme/tokens';
import type { KategoriRisiko } from '../types';
import { Glass } from './Glass';
import { RISK_COLOR } from './RiskDot';

const ROWS: { kategori: KategoriRisiko; range: string }[] = [
  { kategori: 'merah', range: 'skor di atas 80' },
  { kategori: 'kuning', range: 'skor 50 sampai 80' },
  { kategori: 'hijau', range: 'skor di bawah 50' },
];

/**
 * Legend of the zone map: each category as a swatch drawn like a zone (fill 30%, 2 dp outline), its name and what the
 * percentile limits of docs/01 step 5 mean. Navy glass, because it sits over the map.
 */
export function ZoneLegend() {
  return (
    <Glass
      fill={colors.glass}
      radius={8}
      style={styles.legend}
    >
      <View accessible accessibilityLabel="Legenda skor risiko persentil: merah di atas 80, kuning 50 sampai 80, hijau di bawah 50">
        <Text style={styles.title}>Skor risiko (persentil)</Text>
        {ROWS.map(({ kategori, range }) => (
          <View key={kategori} style={styles.row}>
            <View
              style={[
                styles.swatch,
                { borderColor: RISK_COLOR[kategori], backgroundColor: withAlpha(RISK_COLOR[kategori], AREA_FILL_ALPHA), borderWidth: AREA_STROKE_WIDTH },
              ]}
            />
            <View>
              <Text style={styles.label}>{RISK_LABEL[kategori]}</Text>
              <Text style={styles.range}>{range}</Text>
            </View>
          </View>
        ))}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  legend: { position: 'absolute', left: 12, top: 12, paddingVertical: 8, paddingHorizontal: 10 },
  title: { fontFamily: fontFamily.extrabold, fontSize: 12, lineHeight: 16, color: colors.textPrimary, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  label: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 15, color: colors.textPrimary },
  range: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, color: colors.textSecondary },
});
