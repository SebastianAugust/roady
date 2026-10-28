import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { tintSvg } from '../lib/tintSvg';
import { colors, fontFamily } from '../theme/tokens';

export interface MenuItem {
  key: string;
  label: string;
  subtitle?: string;
  /** Figma icon as an SVG string (exported in white; it is recolored here). Omit for a row without an icon (the space stays so labels line up). */
  icon?: string;
  iconWidth?: number;
  iconHeight?: number;
  /** Optical nudge in px (negative = left) for a glyph whose artwork sits off-center in its box. */
  iconShiftX?: number;
  onPress?: () => void;
  /** Right-hand control, e.g. a Toggle. */
  trailing?: ReactNode;
}

/** Light glass card with icon rows and hairline dividers (Profil, Bantuan and Pengaturan in Figma). */
export function GlassMenu({ items }: { items: MenuItem[] }) {
  return (
    <View style={styles.card}>
      {items.map((item, i) => {
        const content = (
          <>
            <View style={[styles.iconBox, item.iconShiftX ? { transform: [{ translateX: item.iconShiftX }] } : null]}>
              {item.icon ? <SvgXml xml={tintSvg(item.icon, colors.accent)} width={item.iconWidth} height={item.iconHeight} /> : null}
            </View>
            <View style={styles.texts}>
              <Text style={styles.label}>{item.label}</Text>
              {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
            </View>
            {item.trailing}
          </>
        );
        const rowStyle = [styles.row, i > 0 && styles.divider];
        return item.onPress ? (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [...rowStyle, pressed && styles.pressed]}
          >
            {content}
          </Pressable>
        ) : (
          <View key={item.key} style={rowStyle}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

// Same inset on both sides, so icons and text on the left line up with the Toggle on the right (Pengaturan).
const ROW_PAD_X = 18;

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: ROW_PAD_X, paddingVertical: 8 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pressed: { opacity: 0.7 },
  iconBox: { width: 33, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, marginLeft: 12, gap: 2 },
  label: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
});
