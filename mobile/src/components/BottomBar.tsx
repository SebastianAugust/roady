import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { tintSvg } from '../lib/tintSvg';
import { colors, fontFamily } from '../theme/tokens';
import { fabCircle, iconAccount, iconHome, iconReport, navBar } from './homeArtSvg';

interface Props {
  /** The tab of the screen that renders the bar. */
  active: 'home' | 'profil';
  onHome: () => void;
  onReport: () => void;
  onProfile: () => void;
}

// The Figma bar and ring paths are filled white at 10%; here the bar is the surface color with a hairline edge, and the ring is solid white.
const NAV_BACKDROP = navBar.replace('fill="white" fill-opacity="0.1"', `fill="${colors.surface}" stroke="${colors.border}" stroke-width="1"`);
const FAB_RING = fabCircle.replace('fill="white" fill-opacity="0.1"', `fill="${colors.buttonPrimary}"`);
// Icons are exported in white: accent on the active tab, textMuted (#8A96A8) on the others, navy on the white center button.
const ICON_HOME = { on: tintSvg(iconHome, colors.accent), off: tintSvg(iconHome, colors.textMuted) };
const ICON_ACCOUNT = { on: tintSvg(iconAccount, colors.accent), off: tintSvg(iconAccount, colors.textMuted) };
const ICON_REPORT = tintSvg(iconReport, colors.onButtonPrimary);

const BAR_HEIGHT = 83;
const NOTCH_RISE = 21; // the FAB circle rises above the bar
const BAR_DROP = 10;
// Tab hit area: 96x58 (at least 48x48), 28 below the top of the bar block, centred 6 left of the quarter line.
const TAB_WIDTH = 96;
const TAB_HEIGHT = 58;
const TAB_TOP = 28;
const TAB_INSET = 54; // left: calc(25% - 54px)
const ICON_SIZE = 30; // active size; inactive tabs show it scaled down to 26
const ICON_IDLE_SCALE = 26 / ICON_SIZE;
const ICON_TOP = 4; // active icon: 4pt above where the idle icon is centred
const IDLE_SHIFT = (TAB_HEIGHT - ICON_SIZE) / 2 - ICON_TOP; // idle icon is centred in the tab
const LABEL_TOP = ICON_TOP + ICON_SIZE;
const LINE_TOP = LABEL_TOP + 16;
const SWITCH_MS = 250;
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

interface TabProps {
  label: string;
  icon: { on: string; off: string };
  selected: boolean;
  onPress: () => void;
  side: 'left' | 'right';
}

/**
 * One side tab. Idle: only a 26pt muted icon. Selected: the icon rises 4pt and grows to 30pt in the accent colour, the
 * label fades in below it and a small accent line sits under the label (250 ms). With reduce motion it switches at once.
 */
function Tab({ label, icon, selected, onPress, side }: TabProps) {
  const focused = useIsFocused();
  const reduce = useReduceMotion();
  const [p] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const target = selected && focused ? 1 : 0;
    if (reduce) {
      p.stopAnimation();
      p.setValue(target);
      return;
    }
    const anim = Animated.timing(p, { toValue: target, duration: SWITCH_MS, easing: EASE, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [selected, focused, reduce, p]);

  const iconStyle = {
    transform: [
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [IDLE_SHIFT, 0] }) },
      { scale: p.interpolate({ inputRange: [0, 1], outputRange: [ICON_IDLE_SCALE, 1] }) },
    ],
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, side === 'left' ? styles.left : styles.right]}
    >
      <Animated.View pointerEvents="none" style={[styles.icon, iconStyle]}>
        <Animated.View style={[styles.iconLayer, { opacity: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          <SvgXml xml={icon.off} width={ICON_SIZE} height={ICON_SIZE} />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, { opacity: p }]}>
          <SvgXml xml={icon.on} width={ICON_SIZE} height={ICON_SIZE} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.label, { opacity: p }]}>{label}</Animated.Text>
      <Animated.View pointerEvents="none" style={[styles.line, { opacity: p }]} />
    </Pressable>
  );
}

/** Bottom navigation of the two tab screens: Home, Laporkan Kejadian (center, opens Lapor), Profil. */
export function BottomBar({ active, onHome, onReport, onProfile }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { height: BAR_HEIGHT + NOTCH_RISE + insets.bottom }]} pointerEvents="box-none">
      <SvgXml xml={NAV_BACKDROP} width="100%" height={BAR_HEIGHT} style={styles.bar} preserveAspectRatio="none" />
      {/* Below the bar, over the home indicator / gesture area: the same surface, so the bar reaches the screen edge. */}
      {insets.bottom > 0 ? <View pointerEvents="none" style={[styles.barExtension, { height: insets.bottom + BAR_DROP + 20 }]} /> : null}
      <SvgXml xml={FAB_RING} width={74} height={74} style={styles.fabCircle} />
      <Tab label="Beranda" icon={ICON_HOME} selected={active === 'home'} onPress={onHome} side="left" />
      <Pressable accessibilityRole="button" accessibilityLabel="Laporkan kejadian" onPress={onReport} style={styles.center}>
        <SvgXml xml={ICON_REPORT} width={54} height={43} />
      </Pressable>
      <Tab label="Profil" icon={ICON_ACCOUNT} selected={active === 'profil'} onPress={onProfile} side="right" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Sits BAR_DROP below the screen edge so the content above it gets a little breathing room; grows by the bottom inset.
  root: { position: 'absolute', left: 0, right: 0, bottom: -BAR_DROP },
  bar: { position: 'absolute', left: 0, right: 0, top: NOTCH_RISE },
  // Starts 20 above the bar's bottom edge to hide its rounded bottom corners.
  barExtension: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: NOTCH_RISE + BAR_HEIGHT - 20,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  fabCircle: { position: 'absolute', alignSelf: 'center', top: 0 },
  tab: { position: 'absolute', top: TAB_TOP, width: TAB_WIDTH, height: TAB_HEIGHT },
  left: { left: '25%', marginLeft: -TAB_INSET },
  right: { right: '25%', marginRight: -TAB_INSET },
  icon: { position: 'absolute', top: ICON_TOP, left: (TAB_WIDTH - ICON_SIZE) / 2, width: ICON_SIZE, height: ICON_SIZE },
  iconLayer: { position: 'absolute', top: 0, left: 0, width: ICON_SIZE, height: ICON_SIZE },
  label: { position: 'absolute', top: LABEL_TOP, left: 0, right: 0, textAlign: 'center', fontFamily: fontFamily.bold, fontSize: 11, lineHeight: 14, color: colors.textPrimary },
  line: { position: 'absolute', top: LINE_TOP, left: (TAB_WIDTH - 18) / 2, width: 18, height: 3, borderRadius: 3, backgroundColor: colors.accent },
  // Figma icon sits 3px above the ring's center.
  center: { position: 'absolute', alignSelf: 'center', width: 74, height: 74, top: 0, paddingBottom: 10, alignItems: 'center', justifyContent: 'center' },
});
