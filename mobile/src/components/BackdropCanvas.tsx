import { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { canvas, colors, gradients } from '../theme/tokens';

// Batik tile sizes in Figma canvas pixels. A turned tile is drawn at ROT then rotated, so its box is h x w.
const SQ = { w: 76.03, h: 75.84 };
const ROT = { w: 43.91, h: 43.31 };

export const at = (left: number, top: number) => ({ position: 'absolute' as const, left, top });

export function Square({ xml, left, top, rotate = 0 }: { xml: string; left: number; top: number; rotate?: 0 | 180 }) {
  return (
    <View style={[at(left, top), rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null]}>
      <SvgXml xml={xml} width={SQ.w} height={SQ.h} />
    </View>
  );
}

export function Turned({ xml, left, top, rotate }: { xml: string; left: number; top: number; rotate: 90 | -90 }) {
  return (
    <View style={[at(left, top), { width: ROT.h, height: ROT.w }]}>
      <View
        style={{
          position: 'absolute',
          left: (ROT.h - ROT.w) / 2,
          top: (ROT.w - ROT.h) / 2,
          transform: [{ rotate: `${rotate}deg` }],
        }}
      >
        <SvgXml xml={xml} width={ROT.w} height={ROT.h} />
      </View>
    </View>
  );
}

/**
 * Full-screen backdrop: the navy page color, or the brand gradient with `gradient`, then `art` (batik tiles) drawn on the 412x892
 * Figma canvas scaled to cover the screen, then `children` on top.
 */
export function BackdropCanvas({ art, children, gradient = false }: { art: ReactNode; children: ReactNode; gradient?: boolean }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(width / canvas.width, height / canvas.height);
  return (
    <View style={styles.root}>
      {gradient ? (
        <LinearGradient
          colors={[...gradients.brand.colors]}
          start={gradients.brand.start}
          end={gradients.brand.end}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          width: canvas.width,
          height: canvas.height,
          left: (width - canvas.width) / 2,
          top: (height - canvas.height) / 2,
          transform: [{ scale }],
        }}
      >
        {art}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
});
