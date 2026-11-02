import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { colors } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Geometry in a 70x70 box. The dash lengths are a little longer than the strokes so the start is fully hidden.
const R = 32;
const CIRCLE_LENGTH = Math.ceil(2 * Math.PI * R); // 202
const CHECK = 'M22 36 L31 45 L49 26';
const CHECK_LENGTH = 40;
// docs/design/prototype-mobile.html .done: the ring draws in 0.7s, the tick 0.4s from 0.55s, both on --ease.
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * The check of Laporan Terkirim, drawn on screen: first the ring, then the tick. Decorative (the message below says what
 * happened). With reduce motion it is shown complete at once.
 */
export function DrawnCheck({ size = 70 }: { size?: number }) {
  const reduce = useReduceMotion();
  // 1 = not drawn yet, 0 = fully drawn (the share of the dash still hidden).
  const [ring] = useState(() => new Animated.Value(1));
  const [tick] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduce) {
      ring.stopAnimation();
      tick.stopAnimation();
      ring.setValue(0);
      tick.setValue(0);
      return;
    }
    // stroke-dashoffset is an SVG prop, so this runs on the JS driver.
    const draw = Animated.parallel([
      Animated.timing(ring, { toValue: 0, duration: 700, easing: EASE, useNativeDriver: false }),
      Animated.sequence([Animated.delay(550), Animated.timing(tick, { toValue: 0, duration: 400, easing: EASE, useNativeDriver: false })]),
    ]);
    draw.start();
    return () => draw.stop();
  }, [reduce, ring, tick]);

  return (
    <Svg width={size} height={size} viewBox="0 0 70 70" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <AnimatedCircle
        cx={35}
        cy={35}
        r={R}
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
        strokeDashoffset={ring.interpolate({ inputRange: [0, 1], outputRange: [0, CIRCLE_LENGTH] })}
        transform="rotate(-90 35 35)"
      />
      <AnimatedPath
        d={CHECK}
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${CHECK_LENGTH} ${CHECK_LENGTH}`}
        strokeDashoffset={tick.interpolate({ inputRange: [0, 1], outputRange: [0, CHECK_LENGTH] })}
      />
    </Svg>
  );
}
