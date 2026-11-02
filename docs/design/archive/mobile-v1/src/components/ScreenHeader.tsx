import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { circleArrowRight } from './petaArtSvg';
import { colors, fontFamily } from '../theme/tokens';


interface Props {
  title: string;
  /** Omitted when there is nowhere to go back to. */
  onBack?: () => void;
}

/** Back button plus Cal Sans title, shared by the signed-in sub-screens. */
export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Kembali" hitSlop={8} onPress={onBack} style={styles.back}>
          {/* The arrow is a cut-out of the white circle, so a small disc in the page color behind it shows it as navy. */}
          <View style={styles.iconWrap}>
            <View style={styles.arrowFill} />
            <SvgXml xml={circleArrowRight} width={33} height={33} style={styles.icon} />
          </View>
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  iconWrap: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center' },
  arrowFill: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg },
  icon: { transform: [{ scaleY: -1 }, { rotate: '180deg' }] },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 21,
    color: colors.textPrimary,
  },
});
