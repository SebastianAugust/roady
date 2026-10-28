import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { tintSvg } from '../lib/tintSvg';
import { colors } from '../theme/tokens';
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
// Icons are exported in white: accent for the active tab, textSecondary for the other, navy on the white center button.
const ICON_HOME = (active: boolean) => tintSvg(iconHome, active ? colors.accent : colors.textSecondary);
const ICON_ACCOUNT = (active: boolean) => tintSvg(iconAccount, active ? colors.accent : colors.textSecondary);
const ICON_REPORT = tintSvg(iconReport, colors.onButtonPrimary);

const BAR_HEIGHT = 83;
const NOTCH_RISE = 21; // the FAB circle rises above the bar
const BAR_DROP = 10;

/** Bottom navigation of the two tab screens: Home, Laporkan Kejadian (center, opens Lapor), Profil. */
export function BottomBar({ active, onHome, onReport, onProfile }: Props) {
  return (
    <View style={styles.root} pointerEvents="box-none">
      <SvgXml xml={NAV_BACKDROP} width="100%" height={BAR_HEIGHT} style={styles.bar} preserveAspectRatio="none" />
      <SvgXml xml={FAB_RING} width={74} height={74} style={styles.fabCircle} />
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Beranda"
        accessibilityState={{ selected: active === 'home' }}
        onPress={onHome}
        style={[styles.hit, styles.left]}
      >
        <SvgXml xml={ICON_HOME(active === 'home')} width={42} height={41} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Laporkan kejadian" onPress={onReport} style={[styles.hit, styles.center]}>
        <SvgXml xml={ICON_REPORT} width={54} height={43} />
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Profil"
        accessibilityState={{ selected: active === 'profil' }}
        onPress={onProfile} style={[styles.hit, styles.right]}>
        <SvgXml xml={ICON_ACCOUNT(active === 'profil')} width={45} height={45} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sits BAR_DROP below the screen edge so the content above it gets a little breathing room.
  root: { position: 'absolute', left: 0, right: 0, bottom: -BAR_DROP, height: BAR_HEIGHT + NOTCH_RISE },
  bar: { position: 'absolute', left: 0, right: 0, top: NOTCH_RISE },
  fabCircle: { position: 'absolute', alignSelf: 'center', top: 0 },
  hit: { position: 'absolute', width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  // Figma places the home icon at x=60 (center 81 of 412), not mirrored with the profile icon.
  left: { left: '11.9%', top: NOTCH_RISE + 3 },
  right: { right: '14%', top: NOTCH_RISE + 3 },
  // Figma icon sits 3px above the ring's center.
  center: { alignSelf: 'center', width: 74, height: 74, top: 0, paddingBottom: 10 },
});
