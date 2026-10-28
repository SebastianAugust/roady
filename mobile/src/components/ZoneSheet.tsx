import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useZone } from '../hooks/useZone';
import { formatDateTime } from '../lib/dateFormat';
import { RISK_LABEL } from '../lib/risk';
import { colors, fontFamily } from '../theme/tokens';
import { DetailField } from './DetailField';
import { Glass } from './Glass';
import { RISK_COLOR, RiskDot } from './RiskDot';

// The closed sheet is translated this far down; it must be taller than the sheet with its content.
const HIDE_OFFSET = 520;
const CLOSE_DISTANCE = 80;

interface Props {
  /** Selected zone; the sheet is hidden while this is undefined. */
  zonaId: number | undefined;
  /** Must be a stable function (useCallback): the drag handlers are created once and keep the first one. */
  onClose: () => void;
}

/**
 * Bottom sheet with the details of one zone (API-004): risk score and category, number of incidents, weather dependence, last update.
 * Closes with the X button, by dragging the handle down, with the Android back button, or by tapping the map (Peta does that).
 * There is no Figma frame for it (docs/04 lists it in the navigation tree only), so it is built from the existing tokens.
 */
export function ZoneSheet({ zonaId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { zone, state, retry } = useZone(zonaId);
  const open = zonaId !== undefined;
  const [translateY] = useState(() => new Animated.Value(HIDE_OFFSET));


  useEffect(() => {
    Animated.timing(translateY, { toValue: open ? 0 : HIDE_OFFSET, duration: 220, useNativeDriver: true }).start();
  }, [open, translateY]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  const [pan] = useState(() => {
    const springBack = () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => translateY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => (g.dy > CLOSE_DISTANCE || g.vy > 0.8 ? onClose() : springBack()),
      onPanResponderTerminate: springBack,
    });
  });

  return (
    <Animated.View
      pointerEvents={open ? 'auto' : 'none'}
      accessibilityViewIsModal={open}
      style={[styles.sheetPosition, { transform: [{ translateY }] }]}
    >
      <Glass fill={colors.glass} radius={24} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View {...pan.panHandlers} style={styles.handleArea}>
        <View style={styles.handle} />
      </View>

      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {zonaId === undefined ? '' : `Zona ${zonaId}`}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Tutup detail zona" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {state === 'loading' ? <ActivityIndicator color={colors.textPrimary} style={styles.status} /> : null}
      {state === 'error' ? (
        <View style={styles.status}>
          <Text style={styles.statusText}>Detail zona gagal dimuat. Periksa koneksi lalu coba lagi.</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
            <Text style={styles.retryText}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : null}
      {state === 'ready' && zone ? (
        <View style={styles.body} accessibilityLiveRegion="polite">
          {/* Category is spelled out in text; the color is a second cue (docs/01 step 5). */}
          <View style={[styles.chip, { borderColor: RISK_COLOR[zone.kategori_risiko] }]}>
            <RiskDot kategori={zone.kategori_risiko} />
            <Text style={styles.chipText}>{RISK_LABEL[zone.kategori_risiko]}</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.score}>{Math.round(zone.skor_risiko)}%</Text>
            <Text style={styles.scoreLabel}>skor risiko (persentil di antara semua zona)</Text>
          </View>
          <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, zone.skor_risiko))}%`, backgroundColor: RISK_COLOR[zone.kategori_risiko] }]} />
          </View>

          <View style={styles.fields}>
            <DetailField label="Jumlah kejadian">{`${zone.jumlah_kejadian} kejadian`}</DetailField>
            <DetailField label="Bergantung cuaca">
              {zone.weather_dependent ? 'Ya, risiko naik saat hujan' : 'Tidak'}
            </DetailField>
            <DetailField label="Terakhir diperbarui">{formatDateTime(zone.last_updated)}</DetailField>
          </View>
        </View>
      ) : null}
      </Glass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheetPosition: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sheet: { minHeight: 280, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0, paddingHorizontal: 20 },
  handleArea: { height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fontFamily.display, fontSize: 24, color: colors.textPrimary },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.textPrimary },
  body: { gap: 12, paddingTop: 4 },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textPrimary },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  score: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 38, color: colors.textPrimary },
  scoreLabel: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  fields: { gap: 10, paddingTop: 4 },
  status: { paddingVertical: 28, gap: 12, alignItems: 'center' },
  statusText: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20, color: colors.textPrimary, textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 13, backgroundColor: colors.buttonPrimary, justifyContent: 'center' },
  retryText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.onButtonPrimary },
});
