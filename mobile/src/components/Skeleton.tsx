import { useEffect, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { colors } from '../theme/tokens';

/** One sweep of the highlight, as `.sk` in docs/design/prototype-mobile.html (1.2s, linear, repeating). */
const SWEEP_MS = 1200;

interface Props {
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A grey block standing in for content that is still loading, with a light band sliding across it. Decorative: hidden
 * from screen readers (the screen keeps its own loading indicator). With reduce motion the block stays still.
 */
export function Skeleton({ height, radius = 10, style }: Props) {
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);
  const [x] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce || width === 0) return;
    x.setValue(0);
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: SWEEP_MS, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce, width, x]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { height, borderRadius: radius }, style]}
    >
      {reduce || width === 0 ? null : (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={[colors.skeletonClear, colors.skeletonShine, colors.skeletonClear]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton, overflow: 'hidden' },
});
