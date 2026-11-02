import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { sendCheck } from '../components/laporArtSvg';
import { APP_NAME } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

/** Confirmation shown after a report was accepted by the API (Figma 1032:6482). */
export function LaporTerkirimScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
        <ScreenHeader title="Laporkan Kejadian" />
        <View style={styles.body}>
          <SvgXml xml={sendCheck} width={70} height={70} />
          <View style={styles.card} accessibilityLiveRegion="polite">
            <Text style={styles.message}>
              Laporan sobat {APP_NAME.replace('!', '')} sudah terkirim, terima kasih sudah ikut berkontribusi!
            </Text>
          </View>
        </View>
        <PrimaryButton label="Selesai" onPress={onDone} fullWidth />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 33 },
  body: { flex: 1, alignItems: 'center', marginTop: 70 },
  card: { alignSelf: 'stretch', marginTop: 60, padding: 24, borderRadius: 10, backgroundColor: colors.glass },
  message: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28, color: colors.white, textAlign: 'center' },
});
