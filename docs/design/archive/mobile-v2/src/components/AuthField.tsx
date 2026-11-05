import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fontFamily, fontSize, radius, size, spacing } from '../theme/tokens';

export type InputHandle = ComponentRef<typeof TextInput>;

interface Props extends TextInputProps {
  ref?: Ref<InputHandle>;
  label: string;
  error?: string;
}

/** Eye / crossed-out eye, 22 dp line icons in the secondary text color (the same shapes as the web Login). */
function EyeIcon({ off }: { off: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {off ? (
        <Path d="M17.9 17.9A10.4 10.4 0 0 1 12 19C5.6 19 2 12 2 12a18 18 0 0 1 4.1-5M9.9 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
      ) : (
        <>
          <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      )}
    </Svg>
  );
}

/**
 * Label above a field, error below. A password field (`secureTextEntry`) gets an eye button inside its right edge that
 * shows or hides the text; the button is a real button with its own label and a 44 dp touch area.
 */
export function AuthField({ label, error, style, ref, secureTextEntry, ...rest }: Props) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          ref={ref}
          keyboardAppearance="dark"
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !revealed}
          style={[styles.input, secureTextEntry ? styles.inputWithToggle : null, error ? styles.inputError : null, style]}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
            accessibilityState={{ selected: revealed }}
            onPress={() => setRevealed((r) => !r)}
            style={styles.toggle}
          >
            <EyeIcon off={revealed} />
          </Pressable>
        ) : null}
      </View>
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
  inputWithToggle: { paddingRight: size.touchMin + 4 },
  inputError: { borderWidth: 2, borderColor: colors.error },
  toggle: { position: 'absolute', right: 0, top: 0, width: size.touchMin, height: size.field, alignItems: 'center', justifyContent: 'center' },
  error: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.statusDanger,
    marginTop: 4,
  },
});
