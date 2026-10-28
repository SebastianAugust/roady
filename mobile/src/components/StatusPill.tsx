import { StyleSheet, Text, View } from 'react-native';
import { STATUS_LABEL, STATUS_TONE, StatusTone } from '../lib/reportStatus';
import { colors, fontFamily } from '../theme/tokens';
import type { StatusLaporan } from '../types';

const TONE: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: colors.statusSuccess, fg: colors.white },
  warning: { bg: colors.statusWarning, fg: colors.statusNeutral }, // black text on the bright yellow for contrast
  danger: { bg: colors.statusDanger, fg: colors.white },
  neutral: { bg: colors.statusNeutral, fg: colors.white },
};

/** Status is always spelled out in text, so the fill color is only a secondary cue. */
export function StatusPill({ status }: { status: StatusLaporan }) {
  const tone = TONE[STATUS_TONE[status]];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', height: 24, borderRadius: 14, paddingHorizontal: 13, justifyContent: 'center' },
  text: { fontFamily: fontFamily.semibold, fontSize: 13 },
});
