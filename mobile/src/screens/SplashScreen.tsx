import { StyleSheet, Text, View } from 'react-native';
import { SplashBackground } from '../components/AppBackground';
import { APP_NAME, APP_TAGLINE } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

// The wordmark has no "!" in Figma (1032:7012).
const WORDMARK = APP_NAME.replace('!', '');

/** Start screen (Figma "mulai app", 1032:7012): navy brand gradient, batik at 7%, white wordmark and a light tagline. Shown for a moment at launch. */
export function SplashScreen() {
  return (
    <SplashBackground>
      <View style={styles.center}>
        <Text accessibilityRole="header" style={styles.wordmark}>
          {WORDMARK}
        </Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
      </View>
    </SplashBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontFamily: fontFamily.display, fontSize: 68, lineHeight: 76, color: colors.white },
  tagline: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24, color: colors.border, marginTop: 2 },
});
