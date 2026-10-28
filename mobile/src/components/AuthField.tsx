import type { ComponentRef, Ref } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fontFamily, fontSize, radius, size, spacing } from '../theme/tokens';

export type InputHandle = ComponentRef<typeof TextInput>;

interface Props extends TextInputProps {
  ref?: Ref<InputHandle>;
  label: string;
  error?: string;
}

export function AuthField({ label, error, style, ref, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        keyboardAppearance="dark"
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
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
  wrap: { alignSelf: 'stretch', marginBottom: spacing.sm },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    height: size.field,
    borderRadius: radius.field,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  inputError: { borderWidth: 2, borderColor: colors.error },
  error: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.statusDanger,
    marginTop: 4,
  },
});
