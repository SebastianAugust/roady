import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import { BlurFill } from './BlurFill';

/** Lower part of the dark pre-login screens: a near-white glass sheet with rounded top corners (Figma onboarding, band from y=322 of 892). */
export function GlassSheet({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
      <BlurFill radius={36} />
      {children}
    </View>;
}

const styles = StyleSheet.create({
  sheet: {
    flex: 0.64,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    backgroundColor: colors.glassSheet,
    overflow: 'hidden',
    paddingHorizontal: 31,
    paddingTop: 13,
  },
});
