import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';

/**
 * The splash drawn over the whole app. While `visible` it blocks touches; when `visible` turns false it fades out
 * over 250 ms and then unmounts, so what is behind it (onboarding, Login or Home) is already in place.
 */
export function SplashOverlay({ visible }: { visible: boolean }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (visible) return;
    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, opacity]);

  if (!mounted) return null;
  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, { opacity }]}>
      <SplashScreen />
    </Animated.View>
  );
}
