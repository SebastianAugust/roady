import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { GlassSheet } from '../components/GlassSheet';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { PrimaryButton } from '../components/PrimaryButton';
import { APP_NAME } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

const NAME = APP_NAME.replace('!', '');

// Copy of Figma onboarding 4, 5 and 6 (1032:701, 1032:7546, 1032:7837).
const PAGES = [
  `Hai sobat ${NAME}, terima kasih sudah mempunyai keinginan berkontribusi untuk menjaga keselamatan lalu lintas!`,
  'Dari survei yang telah kami lakukan, banyak orang merasa terbantu dengan info jalan rawan kecelakaan. Kini, kami hadir sebagai penyedia informasi wilayah rawan paling update demi keamanan perjalananmu!',
  `Selain dari tim kami, Sobat ${NAME} juga bisa ikut melengkapi info kecelakaan terbaru yang ditemui. Kepedulianmu sangat berarti untuk membantu sesama pengendara agar tetap aman.`,
];

/** The three welcome pages shown once before Login. `onFinish` runs after the last page or after Lewati. */
export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const last = page === PAGES.length - 1;

  // Android back goes to the previous page instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 0) return false;
      setPage(page - 1);
      return true;
    });
    return () => sub.remove();
  }, [page]);

  return (
    <AppBackground>
      <View style={styles.root}>
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Lewati pengenalan" onPress={onFinish} style={styles.skip}>
            <Text style={styles.skipText}>LEWATI</Text>
          </Pressable>
          <View style={styles.titleBox}>
            <Text style={styles.titleSmall}>selamat datang di</Text>
            <Text accessibilityRole="header" style={styles.titleBig}>
              {APP_NAME}
            </Text>
          </View>
        </View>

        <GlassSheet>
          <OnboardingProgress fraction={page / (PAGES.length - 1)} />
          <Text style={styles.body} accessibilityLiveRegion="polite">
            {PAGES[page]}
          </Text>
          <View style={styles.actions}>
            {page > 0 ? <PrimaryButton label="Kembali" variant="secondary" onPress={() => setPage(page - 1)} /> : null}
            <PrimaryButton label={last ? 'Selesai' : 'Selanjutnya'} onPress={last ? onFinish : () => setPage(page + 1)} />
          </View>
        </GlassSheet>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flex: 0.36, paddingHorizontal: 24 },
  skip: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { fontFamily: fontFamily.extrabold, fontSize: 14, letterSpacing: 1.25, color: colors.textPrimary },
  titleBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  titleSmall: { fontFamily: fontFamily.display, fontSize: 30, lineHeight: 34, color: colors.textPrimary },
  titleBig: { fontFamily: fontFamily.display, fontSize: 52, lineHeight: 56, color: colors.textPrimary },
  body: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 24, color: colors.textPrimary, marginTop: 22 },
  actions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, paddingTop: 36 },
});
