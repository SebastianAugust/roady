import { ReactNode } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BATIK_CLUSTERS, BATIK_OPACITY } from '../theme/batikLayout';
import { colors, gradients } from '../theme/tokens';

// batik-soft.png (scripts/make-batik.mjs): white, edges faded to nothing, 936 x 948.
const BATIK = require('../../assets/batik-soft.png');
const BATIK_RATIO = 948 / 936;

/**
 * The background of every screen: the diagonal brand gradient (navy900 to navy700 to navy500) with the batik clusters on
 * top, placed by the same percentages as on the web (theme/batikLayout.ts) at 8% opacity, plain images with no masking.
 * `children` are drawn above it.
 */
export function AppBackground({ children }: { children?: ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...gradients.brand.colors]}
        start={gradients.brand.start}
        end={gradients.brand.end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        {BATIK_CLUSTERS.map((c) => {
          const w = (width * c.width) / 100;
          return (
            <Image
              key={c.id}
              source={BATIK}
              resizeMode="stretch"
              style={{
                position: 'absolute',
                width: w,
                height: w * BATIK_RATIO,
                opacity: BATIK_OPACITY,
                // Percentages of the screen: left/right of its width, top/bottom of its height (negative = partly off screen).
                ...(c.left !== undefined ? { left: (width * c.left) / 100 } : null),
                ...(c.right !== undefined ? { right: (width * c.right) / 100 } : null),
                ...(c.top !== undefined ? { top: (height * c.top) / 100 } : null),
                ...(c.bottom !== undefined ? { bottom: (height * c.bottom) / 100 } : null),
                transform: [{ rotate: `${c.rotate}deg` }],
              }}
            />
          );
        })}
      </View>
      {children}
    </View>
  );
}

/** The start screen uses the same background. */
export const SplashBackground = AppBackground;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
});
