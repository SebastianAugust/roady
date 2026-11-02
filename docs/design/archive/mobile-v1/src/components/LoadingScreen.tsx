import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

/** Plain centered spinner shown while fonts or the stored session and first-run flags are being read. */
export function LoadingScreen() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
