import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppBackground } from './AppBackground';
import { colors, fontFamily, fontSize, spacing } from '../theme/tokens';

interface Props {
  title: string;
  /** Extra space between title and first field (Login has more than Sign up in Figma). */
  titleGap: number;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  onFooterPress: () => void;
}

/** Layout shared by Login and Sign up: title, fields/button, and a switch link below the panel. */
export function AuthForm({ title, titleGap, children, footerText, footerLink, onFooterPress }: Props) {
  // The space above the title follows the screen height (about 14%, between 72 and 140 dp) instead of the 244 of the Figma canvas.
  const { height } = useWindowDimensions();
  const top = Math.min(140, Math.max(72, Math.round(height * 0.14)));
  return (
    <AppBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: top }]} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={[styles.title, { marginBottom: titleGap }]}>
            {title}
          </Text>
          {children}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{footerText} </Text>
            <Pressable accessibilityRole="link" hitSlop={12} onPress={onFooterPress}>
              <Text style={styles.footerLink}>{footerLink}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingBottom: 48 },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontFamily: fontFamily.semibold, fontSize: fontSize.body, lineHeight: 22, color: colors.textPrimary },
  footerLink: { fontFamily: fontFamily.bold, fontSize: fontSize.body, lineHeight: 22, color: colors.accent, textDecorationLine: 'underline' },
});
