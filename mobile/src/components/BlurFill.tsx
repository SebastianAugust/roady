import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * Frosted layer for a glass panel: put it as the first child of a rounded, semi-transparent navy view (pass its corner `radius`). iOS blurs what is behind it; on Android expo-blur's default draws a plain translucent layer (no crash, no blur).
 */
export function BlurFill({ intensity = 40, radius = 10 }: { intensity?: number; radius?: number }) {
  return <BlurView pointerEvents="none" tint="dark" intensity={intensity} style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]} />;
}
