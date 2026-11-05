import type { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

interface Props {
  children?: ReactNode;
  /** Padding, size and layout of the panel; corner radii and the edge can be overridden here too (e.g. a bottom sheet). */
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /**
   * A glass card inside another glass panel: the same tinted fill and edge but no blur. Blur is for the outer panel only
   * (blur on blur is costly and muddy), so cards in cards pass `inner`.
   */
  inner?: boolean;
  /** Fill colour. Without it the panel gets the soft white gradient; over a map use a navy one (colors.glass) so text stays readable. */
  fill?: string;
  intensity?: number;
}

const GRADIENT = [colors.glassFrom, colors.glassTo] as const;

/**
 * The one glass surface of the app, the counterpart of `.glass` / `.glass-in` on the web: a blur (expo-blur, dark tint),
 * a fill and a thin white edge. The default fill is a diagonal white gradient from 13% to 5%, as `.glass` in
 * docs/design/prototype-mobile.html; `fill` replaces it with a solid colour, and `inner` cards keep their flat 6%.
 * On iOS it blurs what is behind it; on Android expo-blur's default draws a plain translucent layer (no blur, no crash),
 * so the fill alone has to carry the look.
 */
export function Glass({ children, style, radius = 16, inner = false, fill, intensity = 30 }: Props) {
  const gradient = !inner && fill === undefined;
  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: radius,
          backgroundColor: gradient ? 'transparent' : (fill ?? colors.glassInFill),
          borderColor: inner ? colors.glassInEdge : colors.glassEdge,
        },
        style,
      ]}
    >
      {inner ? null : <BlurView pointerEvents="none" tint="dark" intensity={intensity} style={StyleSheet.absoluteFill} />}
      {gradient ? (
        <LinearGradient pointerEvents="none" colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, overflow: 'hidden' },
});
