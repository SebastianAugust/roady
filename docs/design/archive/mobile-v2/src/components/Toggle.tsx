import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Spoken name of the switch. */
  label: string;
  disabled?: boolean;
}

const WIDTH = 46;
const HEIGHT = 25;
const KNOB = 19;
const GAP = 3;
const DURATION = 220;

/** Pill switch from Figma Pengaturan (1032:3758), scaled down. Off = dark track + light knob; on = the colors swap, animated. */
export function Toggle({ value, onChange, label, disabled = false }: Props) {
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    // Colors cannot run on the native driver, so the whole (tiny) animation stays on the JS driver.
    Animated.timing(progress, { toValue: value ? 1 : 0, duration: DURATION, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [value, progress]);

  const trackColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceRaised, colors.white] });
  const knobColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.textMuted, colors.navy900] });
  const knobLeft = progress.interpolate({ inputRange: [0, 1], outputRange: [GAP, WIDTH - KNOB - GAP] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      onPress={() => onChange(!value)}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }, disabled && styles.disabled]}>
        <Animated.View style={[styles.knob, { backgroundColor: knobColor, left: knobLeft }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  knob: { position: 'absolute', top: (HEIGHT - KNOB) / 2 - 1, width: KNOB, height: KNOB, borderRadius: KNOB / 2 },
});
