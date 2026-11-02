import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../theme/tokens';
import type { Option } from './Dropdown';
import { LineIcon } from './LineIcon';

interface Props<T extends string> {
  /** Shown above the group and read as the group's name. */
  label: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  /** Validation message under the group; the buttons get the error border. */
  error?: string;
}

/**
 * Two (or more) equal choices side by side, as `.seg` in docs/design/prototype-mobile.html: 46 high, radius 12; the
 * chosen one is white with navy text and a small check. A radio group for screen readers.
 */
export function SegmentedControl<T extends string>({ label, options, value, onChange, error }: Props<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityState={{ checked }}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => [
                styles.option,
                checked && styles.optionOn,
                error && !checked ? styles.optionError : null,
                pressed && styles.pressed,
              ]}
            >
              {checked ? <LineIcon name="check" size={16} color={colors.onButtonPrimary} strokeWidth={2.5} /> : null}
              <Text style={[styles.optionText, checked && styles.optionTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fontFamily.bold, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassInEdge,
    backgroundColor: colors.glassInFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  optionOn: { backgroundColor: colors.buttonPrimary, borderColor: colors.buttonPrimary },
  optionError: { borderColor: colors.error },
  pressed: { transform: [{ scale: 0.98 }] },
  optionText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.textPrimary },
  optionTextOn: { color: colors.onButtonPrimary },
  error: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, color: colors.error },
});
