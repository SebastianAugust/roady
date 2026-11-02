import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { placeText } from '../lib/address';
import { formatDate } from '../lib/reportStatus';
import { colors, fontFamily } from '../theme/tokens';
import type { Laporan } from '../types';
import { Glass } from './Glass';
import { StatusPill } from './StatusPill';

interface Props {
  report: Laporan;
  /** Opens the report detail. */
  onPress?: () => void;
  /** Riwayat Laporan shows the attached photo above the title (Figma 1032:4841); Home does not. */
  showPhoto?: boolean;
  /** Riwayat Laporan adds a Lokasi row (saved address plus coordinates; coordinates only when there is no address). */
  showLocation?: boolean;
}

export function ReportCard({ report, onPress, showPhoto = false, showLocation = false }: Props) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = showPhoto && report.foto_url && !photoFailed ? report.foto_url : undefined;
  const date = <Text style={styles.date}>{formatDate(report.tanggal_kejadian)}</Text>;

  return (
    <Glass inner radius={10}>
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Laporan ${report.id_report}, buka detail` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {photo ? (
        <>
          <View style={styles.dateRight}>{date}</View>
          <Image
            source={{ uri: photo }}
            accessibilityLabel="Foto laporan"
            onError={() => setPhotoFailed(true)}
            style={styles.photo}
          />
        </>
      ) : null}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Laporan #{report.id_report}</Text>
        {photo ? null : date}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Deskripsi:</Text>
        <Text style={styles.value} numberOfLines={2}>
          {report.deskripsi}
        </Text>
      </View>
      {showLocation ? (
        <View style={styles.row}>
          <Text style={styles.label}>Lokasi:</Text>
          <Text style={styles.value} numberOfLines={3}>
            {placeText(report)}
          </Text>
        </View>
      ) : null}
      <View style={[styles.row, styles.statusRow]}>
        <Text style={styles.label}>Status:</Text>
        <StatusPill status={report.status} />
      </View>
    </Pressable>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 15, paddingVertical: 7 },
  pressed: { opacity: 0.8 },
  dateRight: { alignItems: 'flex-end' },
  photo: { height: 96, borderRadius: 4, marginTop: 4, marginHorizontal: -3, backgroundColor: colors.surface },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: fontFamily.bold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  date: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textMuted },
  row: { flexDirection: 'row', marginTop: 2 },
  statusRow: { alignItems: 'center', marginTop: 6 },
  label: { width: 69, fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.textPrimary },
  value: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.textPrimary },
});
