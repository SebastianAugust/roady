import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../theme/tokens';

/** Small label above a value, used on the report detail card. */
export function DetailField({ label, children }: { label: string; children: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 2, alignItems: 'flex-start' },
  label: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  value: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
});
