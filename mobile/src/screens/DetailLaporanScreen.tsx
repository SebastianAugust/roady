import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { Glass } from '../components/Glass';
import { DetailField } from '../components/DetailField';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { placeText } from '../lib/address';
import { CUACA_LABEL, KATEGORI_LABEL } from '../lib/reportOptions';
import { formatDate } from '../lib/reportStatus';
import { colors, fontFamily } from '../theme/tokens';
import type { Laporan } from '../types';

/** One of the driver's own reports. There is no Figma frame for it yet (docs/04), so it reuses the glass card and tokens of the Lapor form. */
export function DetailLaporanScreen({ report, onBack }: { report: Laporan; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title={`Laporan #${report.id_report}`} onBack={onBack} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]} showsVerticalScrollIndicator={false}>
          <Glass radius={10} style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Status</Text>
              <StatusPill status={report.status} />
            </View>
            <DetailField label="Tanggal kejadian">{formatDate(report.tanggal_kejadian)}</DetailField>
            <DetailField label="Dikirim">{formatDate(report.timestamp)}</DetailField>
            <DetailField label="Jenis kejadian">{KATEGORI_LABEL[report.kategori]}</DetailField>
            <DetailField label="Cuaca">{CUACA_LABEL[report.kondisi_cuaca_saat_kejadian]}</DetailField>
            <DetailField label="Lokasi">{placeText(report)}</DetailField>
            <DetailField label="Zona">{report.zona_id === null ? 'Belum masuk zona' : `Zona ${report.zona_id}`}</DetailField>
          </Glass>

          {report.status === 'rejected' && report.alasan_penolakan ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Alasan Penolakan</Text>
              <Glass radius={10} style={styles.card}>
                <Text style={styles.value}>{report.alasan_penolakan}</Text>
              </Glass>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Deskripsi Kejadian</Text>
            <Glass radius={10} style={styles.card}>
              <Text style={styles.value}>{report.deskripsi}</Text>
            </Glass>
          </View>

          {report.foto_url ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Foto</Text>
              <Glass radius={10} style={styles.card}>
                {photoFailed ? (
                  <Text style={styles.value}>Foto tidak dapat dimuat.</Text>
                ) : (
                  <Image
                    source={{ uri: report.foto_url }}
                    accessibilityLabel="Foto kejadian"
                    onError={() => setPhotoFailed(true)}
                    style={styles.photo}
                  />
                )}
              </Glass>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  content: { paddingHorizontal: 4, paddingTop: 22, gap: 14 },
  card: { padding: 14, gap: 10 },
  field: { gap: 2, alignItems: 'flex-start' },
  label: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  value: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  section: { gap: 6, paddingLeft: 2 },
  sectionLabel: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  photo: { height: 200, borderRadius: 8, backgroundColor: colors.surfaceRaised },
});
