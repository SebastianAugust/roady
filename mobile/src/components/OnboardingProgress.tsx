import { useEffect, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { tintSvg } from '../lib/tintSvg';
import { colors } from '../theme/tokens';
import { iconCar } from './sheetArtSvg';

const CAR = 54;
const BAR_HEIGHT = 8;
// Figma linear progress (1032:7569 / 7842), recolored to the dark theme: surfaceRaised track, accent active part.
const TRACK = colors.surfaceRaised;
const ACTIVE = colors.accent;

/** Linear progress with the car riding on its front edge; `fraction` is 0 on the first onboarding page and 1 on the last. */
export function OnboardingProgress({ fraction }: { fraction: number }) {
  const [width, setWidth] = useState(0);
  const [value] = useState(() => new Animated.Value(fraction));

  useEffect(() => {
    Animated.timing(value, { toValue: fraction, duration: 250, useNativeDriver: false }).start();
  }, [fraction, value]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const fillWidth = value.interpolate({ inputRange: [0, 1], outputRange: [0, width] });
  const carLeft = value.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, width - CAR)] });

  return (
    <View
      onLayout={onLayout}
      style={styles.root}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
    >
      <Animated.View style={[styles.car, { left: carLeft }]}>
        <SvgXml xml={tintSvg(iconCar, colors.textPrimary)} width={CAR} height={CAR} />
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
        <View style={styles.stopDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: CAR, justifyContent: 'flex-end' },
  car: { position: 'absolute', top: 0 },
  track: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: TRACK, overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: ACTIVE, borderRadius: BAR_HEIGHT / 2 },
  stopDot: { position: 'absolute', right: 3, width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textPrimary },
});
