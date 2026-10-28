import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthBackground } from './AuthBackground';
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
  return (
    <AuthBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingTop: 244, paddingBottom: 48 },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    lineHeight: 40,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 61 },
  footerText: { fontFamily: fontFamily.semibold, fontSize: fontSize.body, lineHeight: 22, color: colors.textPrimary },
  footerLink: { fontFamily: fontFamily.bold, fontSize: fontSize.body, lineHeight: 22, color: colors.accent, textDecorationLine: 'underline' },
});
