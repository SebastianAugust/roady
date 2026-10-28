import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { RISK_LABEL } from '../lib/risk';
import { colors } from '../theme/tokens';
import type { KategoriRisiko, Zona } from '../types';

export const RISK_COLOR: Record<KategoriRisiko, string> = {
  merah: colors.riskMerah,
  kuning: colors.riskKuning,
  hijau: colors.riskHijau,
};

export function RiskDot({ kategori }: { kategori: KategoriRisiko }) {
  return <View style={[styles.dot, { backgroundColor: RISK_COLOR[kategori] }]} />;
}

interface Props {
  zones: Zona[];
  /** When given, tapping a marker calls this (the detail sheet) instead of showing the native callout. */
  onSelect?: (zone: Zona) => void;
}

/** One marker per zone. Without `onSelect` the callout text carries the category so color is not the only cue. */
export function ZoneMarkers({ zones, onSelect }: Props) {
  return zones.map((z) => (
    <Marker
      key={z.zona_id}
      coordinate={{ latitude: z.center_latitude, longitude: z.center_longitude }}
      title={onSelect ? undefined : `Zona ${z.zona_id}: ${RISK_LABEL[z.kategori_risiko]}`}
      description={onSelect ? undefined : `Skor ${Math.round(z.skor_risiko)}, ${z.jumlah_kejadian} kejadian`}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      onPress={onSelect ? () => onSelect(z) : undefined}
    >
      {/* The transparent padding makes the tap target about 45px around the 17px dot. */}
      <View style={onSelect ? styles.hit : undefined}>
        <RiskDot kategori={z.kategori_risiko} />
      </View>
    </Marker>
  ));
}

const styles = StyleSheet.create({
  dot: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: colors.white },
  hit: { padding: 14 },
});
