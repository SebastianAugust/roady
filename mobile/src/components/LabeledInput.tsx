import { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontFamily } from '../theme/tokens';

type Props = { label: string; error?: string } & ComponentProps<typeof TextInput>;

/** Text field for the light glass cards (Edit Profil): dark label and text, red message below. */
export function LabeledInput({ label, error, ...input }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardAppearance="dark"
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, error ? styles.inputError : null]}
        {...input}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: { borderWidth: 2, borderColor: colors.error },
  error: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.error },
});
