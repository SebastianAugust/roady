import { ReactNode, useContext } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { NavigationRouteContext } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BATIK_CLUSTERS, BATIK_CLUSTERS_AUTH, BATIK_OPACITY, BATIK_OPACITY_AUTH } from '../theme/batikLayout';
import { colors, gradients } from '../theme/tokens';

// batik-soft.png (scripts/make-batik.mjs): white, edges faded to nothing, 936 x 948. Required once at module level, so
// every screen draws the same cached asset (it is not loaded again per screen).
const BATIK = require('../../assets/batik-soft.png');
const BATIK_RATIO = 948 / 936;

/** Screens that keep the old, fainter batik (they are left out of the redesign). */
const AUTH_ROUTES = new Set(['Login', 'SignUp']);

/**
 * The background of every screen: the diagonal brand gradient (navy900 to navy700 to navy500) with the batik clusters on
 * top (theme/batikLayout.ts, 22% and 14% as in docs/design/prototype-mobile.html), plain images with no masking, behind
 * the content and never catching touches. Login and Sign-up keep the old clusters at 8%: the route name tells them apart
 * (outside a navigator, as on the splash, there is no route and the new batik is used). `children` are drawn above it.
 */
export function AppBackground({ children }: { children?: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const route = useContext(NavigationRouteContext);
  const auth = route !== undefined && AUTH_ROUTES.has(route.name);
  const clusters = auth ? BATIK_CLUSTERS_AUTH : BATIK_CLUSTERS;
  const baseOpacity = auth ? BATIK_OPACITY_AUTH : BATIK_OPACITY;
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
        {clusters.map((c) => {
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
                opacity: c.opacity ?? baseOpacity,
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
