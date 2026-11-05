import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { Dropdown, Option } from '../components/Dropdown';
import { ReportCard } from '../components/ReportCard';
import { ReportPanel } from '../components/ReportPanel';
import { ScreenHeader } from '../components/ScreenHeader';
import { useMyReports } from '../hooks/useMyReports';
import { KATEGORI_OPTIONS } from '../lib/reportOptions';
import { STATUS_LABEL } from '../lib/reportStatus';
import { colors, fontFamily } from '../theme/tokens';
import type { Kategori, Laporan } from '../types';

// d.progress filter: one entry per wording shown on the status pills (auto/manual rejections share "Ditolak").
const PROGRESS_OPTIONS: Option<string>[] = [...new Set(Object.values(STATUS_LABEL))].map((label) => ({ value: label, label }));

interface Props {
  onBack: () => void;
  onOpenReport: (report: Laporan) => void;
}

/** Full report history of the signed-in driver (Figma 1032:4841), oldest first like the Figma list, with Progress and Kejadian filters. */
export function RiwayatScreen({ onBack, onOpenReport }: Props) {
  const insets = useSafeAreaInsets();
  const { reports, state, retry } = useMyReports();
  const [progress, setProgress] = useState<string>();
  const [kategori, setKategori] = useState<Kategori>();

  const shown = [...reports]
    .reverse()
    .filter((r) => (progress === undefined || STATUS_LABEL[r.status] === progress) && (kategori === undefined || r.kategori === kategori));

  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Riwayat Laporan" onBack={onBack} />
        <View style={styles.filters}>
          <Dropdown placeholder="Progress" options={PROGRESS_OPTIONS} value={progress} onChange={setProgress} onClear={() => setProgress(undefined)} />
          <Dropdown placeholder="Kejadian" options={KATEGORI_OPTIONS} value={kategori} onChange={setKategori} onClear={() => setKategori(undefined)} />
        </View>
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
          showsVerticalScrollIndicator={false}
        >
          <ReportPanel>
            {state === 'loading' ? <ActivityIndicator color={colors.textPrimary} style={styles.status} /> : null}
            {state === 'error' ? (
              <View style={styles.status}>
                <Text style={styles.statusText}>Riwayat gagal dimuat. Periksa koneksi lalu coba lagi.</Text>
                <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
                  <Text style={styles.retryText}>Coba lagi</Text>
                </Pressable>
              </View>
            ) : null}
            {state === 'ready' && reports.length === 0 ? (
              <Text style={[styles.statusText, styles.status]}>Belum ada laporan. Ketuk tombol laporan di Beranda untuk melaporkan kejadian pertama Anda.</Text>
            ) : null}
            {state === 'ready' && reports.length > 0 && shown.length === 0 ? (
              <Text style={[styles.statusText, styles.status]}>Tidak ada laporan yang cocok dengan filter ini.</Text>
            ) : null}
            {state === 'ready' ? shown.map((r) => <ReportCard key={r.id_report} report={r} showPhoto showLocation onPress={() => onOpenReport(r)} />) : null}
          </ReportPanel>
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  // Figma puts the filters under the title, aligned with its left edge (x=70 of 412).
  filters: { flexDirection: 'row', gap: 4, paddingLeft: 50, marginTop: 6, marginBottom: 14, zIndex: 10, elevation: 10 },
  list: { flex: 1, paddingHorizontal: 5 },
  status: { paddingVertical: 20, gap: 12, alignItems: 'center' },
  statusText: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20, color: colors.textPrimary, textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 13, backgroundColor: colors.buttonPrimary, justifyContent: 'center' },
  retryText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.onButtonPrimary },
});
