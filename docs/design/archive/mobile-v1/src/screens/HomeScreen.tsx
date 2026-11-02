import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { BottomBar } from '../components/BottomBar';
import { iconResize } from '../components/homeArtSvg';
import { circleArrowRight } from '../components/petaArtSvg';
import { ReportCard } from '../components/ReportCard';
import { ReportPanel } from '../components/ReportPanel';
import { ZoneAreas } from '../components/ZoneAreas';
import { BANDUNG_RAYA } from '../config';
import { darkMapStyle } from '../lib/mapStyle';
import { APP_NAME } from '../constants';
import { useMyReports } from '../hooks/useMyReports';
import { useZones } from '../hooks/useZones';
import { metersPerDp } from '../lib/zoneArea';
import { colors, fontFamily } from '../theme/tokens';
import type { Laporan } from '../types';

// City-level view like the Figma frame (Cimahi to Bojongsoang); the full map with the zone areas is the Peta screen.
const MINI_MAP_REGION = { ...BANDUNG_RAYA.center, latitudeDelta: 0.12, longitudeDelta: 0.14 };
const RECENT_COUNT = 2;
const MINI_MAP_HEIGHT = 308;
// The mini-map neither pans nor zooms, so the size of a dp on the ground is fixed.
const MINI_MAP_MPD = metersPerDp(MINI_MAP_REGION.latitudeDelta, MINI_MAP_HEIGHT);

interface Props {
  onOpenMap: () => void;
  onOpenHistory: () => void;
  onOpenReport: (report: Laporan) => void;
  onReport: () => void;
  onProfile: () => void;
}

export function HomeScreen({ onOpenMap, onOpenHistory, onOpenReport, onReport, onProfile }: Props) {
  const insets = useSafeAreaInsets();
  const { reports, state, retry } = useMyReports();
  const { zones } = useZones();

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 4, paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.brand}>
          {APP_NAME}
        </Text>
        <Text style={styles.greeting}>Hai sobat {APP_NAME.replace('!', '')}, siap berkendara hari ini?</Text>

        <View style={styles.mapCard}>
          <MapView
            style={StyleSheet.absoluteFill}
            customMapStyle={darkMapStyle}
            initialRegion={MINI_MAP_REGION}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <ZoneAreas zones={zones} metersPerDp={MINI_MAP_MPD} />
          </MapView>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka peta penuh" onPress={onOpenMap} style={styles.expand}>
            <SvgXml xml={iconResize} width={28} height={28} />
          </Pressable>
        </View>

        <View style={styles.historyHeader}>
          <Text accessibilityRole="header" style={styles.historyTitle}>
            Riwayat Laporan
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Lihat semua riwayat laporan" hitSlop={6} onPress={onOpenHistory} style={styles.arrow}>
            <SvgXml xml={circleArrowRight} width={33} height={33} />
          </Pressable>
        </View>

        <ReportPanel style={styles.panel}>
          {state === 'loading' ? <ActivityIndicator color={colors.textPrimary} style={styles.panelStatus} /> : null}
          {state === 'error' ? (
            <View style={styles.panelStatus}>
              <Text style={styles.emptyText}>Riwayat gagal dimuat. Periksa koneksi lalu coba lagi.</Text>
              <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
                <Text style={styles.retryText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : null}
          {state === 'ready' && reports.length === 0 ? (
            <Text style={[styles.emptyText, styles.panelStatus]}>
              Belum ada laporan. Ketuk tombol di tengah bawah untuk melaporkan kejadian pertama Anda.
            </Text>
          ) : null}
          {/* Newest two, shown oldest first as in the Figma frame (#1 then #2). */}
          {state === 'ready'
            ? reports
                .slice(0, RECENT_COUNT)
                .reverse()
                .map((r) => <ReportCard key={r.id_report} report={r} onPress={() => onOpenReport(r)} />)
            : null}
        </ReportPanel>
      </ScrollView>
      <BottomBar active="home" onHome={() => {}} onReport={onReport} onProfile={onProfile} />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 25 },
  brand: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginLeft: 3 },
  greeting: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary, marginTop: 14, marginLeft: 3 },
  mapCard: { height: MINI_MAP_HEIGHT, marginTop: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.surface },
  expand: {
    position: 'absolute',
    right: 12,
    bottom: 19,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingLeft: 21, paddingRight: 14 },
  historyTitle: { fontFamily: fontFamily.display, fontSize: 21, color: colors.textPrimary },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  panel: { marginTop: 4 },
  panelStatus: { paddingVertical: 20, gap: 12, alignItems: 'center' },
  emptyText: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20, color: colors.textPrimary, textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 13, backgroundColor: colors.buttonPrimary, justifyContent: 'center' },
  retryText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.onButtonPrimary },
});
