import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { arrowDropDown } from './laporArtSvg';
import { colors, fontFamily, size } from '../theme/tokens';

// Figma trigger is 27px tall; the extra touch area brings it to the 44px minimum.
const TRIGGER_HEIGHT = 27;
const HIT_SLOP = { top: Math.ceil((size.touchMin - TRIGGER_HEIGHT) / 2), bottom: Math.ceil((size.touchMin - TRIGGER_HEIGHT) / 2), left: 4, right: 4 };

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  /** Shown while nothing is selected, and used as the accessibility label. */
  placeholder: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  hasError?: boolean;
  /** Filters only: adds a first row that clears the choice (e.g. "Semua"). */
  onClear?: () => void;
  clearLabel?: string;
}

/** Compact select from Figma d.tipe_kecelakaan / d.cuaca / d.progress: a pill that opens a short list below it. */
export function Dropdown<T extends string>({ placeholder, options, value, onChange, hasError, onClear, clearLabel = 'Semua' }: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const rows = [
    ...(onClear ? [{ key: '__clear', label: clearLabel, selected: value === undefined, pick: onClear }] : []),
    ...options.map((o) => ({ key: o.value, label: o.label, selected: o.value === value, pick: () => onChange(o.value) })),
  ];

  return (
    <View style={[styles.wrap, open && styles.wrapOpen]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        accessibilityValue={{ text: selected?.label ?? 'Belum dipilih' }}
        accessibilityState={{ expanded: open }}
        hitSlop={HIT_SLOP}
        onPress={() => setOpen((o) => !o)}
        style={[styles.trigger, hasError && styles.triggerError]}
      >
        <Text style={styles.text} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <SvgXml xml={arrowDropDown} width={24} height={24} />
      </Pressable>
      {open ? (
        <View style={styles.list}>
          {rows.map((r, i) => (
            <Pressable
              key={r.key}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: r.selected }}
              onPress={() => {
                r.pick();
                setOpen(false);
              }}
              style={[styles.option, i > 0 && styles.optionDivider]}
            >
              <Text style={styles.text}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, maxWidth: 141 },
  wrapOpen: { zIndex: 10, elevation: 10 },
  trigger: {
    height: TRIGGER_HEIGHT,
    borderRadius: 10,
    paddingLeft: 7,
    paddingRight: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
  },
  triggerError: { borderWidth: 2, borderColor: colors.error },
  text: { fontFamily: fontFamily.semibold, fontSize: 13, color: colors.white, flexShrink: 1 },
  list: {
    position: 'absolute',
    top: TRIGGER_HEIGHT + 4,
    left: 0,
    right: 0,
    borderRadius: 10,
    backgroundColor: colors.navy900,
    overflow: 'hidden',
  },
  option: { minHeight: 44, paddingHorizontal: 10, justifyContent: 'center' },
  optionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
