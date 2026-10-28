import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { Glass } from './Glass';

/** Lower part of the pre-login screens: a glass sheet with rounded top corners (Figma onboarding, band from y=322 of 892). */
export function GlassSheet({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Glass fill={colors.glassSheet} radius={36} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
      {children}
    </Glass>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 0.64, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0, paddingHorizontal: 31, paddingTop: 13 },
});
