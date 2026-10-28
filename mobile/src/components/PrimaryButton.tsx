import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize, radius, size } from '../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  /** Stretch to the container width (the Lapor screens use a full-width button). */
  fullWidth?: boolean;
  /** `secondary` is the quiet button (Kembali on the onboarding pages): surface fill, hairline border, white text. The default is a white button with navy text. */
  variant?: 'solid' | 'secondary';
}

export function PrimaryButton({ label, onPress, loading = false, fullWidth = false, variant = 'solid' }: Props) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading }}
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, fullWidth && styles.full, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.textPrimary : colors.onButtonPrimary} />
      ) : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: size.buttonMinWidth,
    height: size.button,
    paddingHorizontal: 20,
    borderRadius: radius.button,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  full: { alignSelf: 'stretch' },
  secondaryLabel: { color: colors.textPrimary },
  pressed: { opacity: 0.85 },
  label: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.button,
    letterSpacing: 1.25,
    textTransform: 'uppercase',
    color: colors.onButtonPrimary,
  },
});
