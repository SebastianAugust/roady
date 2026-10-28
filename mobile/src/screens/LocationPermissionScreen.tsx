import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { GlassSheet } from '../components/GlassSheet';
import { PrimaryButton } from '../components/PrimaryButton';
import { iconPin } from '../components/sheetArtSvg';
import { APP_NAME } from '../constants';
import { tintSvg } from '../lib/tintSvg';
import { colors, fontFamily } from '../theme/tokens';

type Phase = 'checking' | 'ask' | 'denied';

/**
 * Asks for foreground location (Figma 1032:1561). `onDone` runs once: when the permission is granted, or when the user
 * chooses to go on without it. A refusal never blocks the app; Peta and Lapor already handle a missing location.
 */
export function LocationPermissionScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('checking');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  const apply = useCallback(
    (p: Location.LocationPermissionResponse) => {
      if (p.granted) {
        finish();
        return;
      }
      setCanAskAgain(p.canAskAgain);
      setPhase(p.status === Location.PermissionStatus.UNDETERMINED ? 'ask' : 'denied');
    },
    [finish],
  );

  const check = useCallback(() => {
    Location.getForegroundPermissionsAsync().then(apply, () => {
      setCheckFailed(true);
      setPhase((p) => (p === 'checking' ? 'ask' : p));
    });
  }, [apply]);

  useEffect(check, [check]);

  // Coming back from the system settings: pick up a permission that was just granted there.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && phase === 'denied') check();
    });
    return () => sub.remove();
  }, [phase, check]);

  const request = async () => {
    setRequesting(true);
    try {
      apply(await Location.requestForegroundPermissionsAsync());
    } catch {
      setCheckFailed(true);
      setPhase('denied');
    } finally {
      setRequesting(false);
    }
  };

  const openSettings = () => {
    // Opening settings can fail on some devices; the user can still continue without location.
    Linking.openSettings().catch(() => setCheckFailed(true));
  };

  const denied = phase === 'denied';
  return (
    <AppBackground>
      <View style={styles.root}>
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <SvgXml xml={tintSvg(iconPin, colors.textPrimary)} width={56} height={56} />
          </View>
          <Text style={styles.brand}>{APP_NAME}</Text>
        </View>

        <GlassSheet>
          {phase === 'checking' ? (
            <ActivityIndicator color={colors.textPrimary} style={styles.checking} />
          ) : (
            <>
              <Text accessibilityRole="header" style={styles.title}>
                {denied ? 'Izin lokasi ditolak' : 'Aktifkan lokasi'}
              </Text>
              <Text style={styles.body} accessibilityLiveRegion="polite">
                {denied && !canAskAgain
                  ? `Izin lokasi dimatikan untuk ${APP_NAME} dan sistem tidak akan menanyakannya lagi. Buka pengaturan, pilih Izin lalu Lokasi, dan izinkan saat aplikasi digunakan. Tanpa izin ini peta tidak bisa memusatkan posisimu, peringatan dini tidak bekerja, dan laporan kejadian tidak bisa dikirim.`
                  : denied
                  ? 'Tanpa izin lokasi, peta tidak bisa memusatkan posisimu, peringatan dini saat mendekati zona rawan tidak bisa bekerja, dan laporan kejadian tidak bisa dikirim. Kamu bisa mengaktifkannya kapan saja di pengaturan.'
                  : `${APP_NAME} memakai lokasimu untuk menampilkan zona rawan di sekitarmu, memberi peringatan dini saat kamu mendekati zona, dan mengisi lokasi laporan kejadian.`}
              </Text>
              {checkFailed ? <Text style={styles.note}>Tidak dapat memeriksa izin lokasi. Coba lagi atau lanjutkan tanpa lokasi.</Text> : null}

              <View style={styles.actions}>
                {denied ? (
                  <>
                    <PrimaryButton label="Buka pengaturan" onPress={openSettings} fullWidth />
                    {canAskAgain ? <PrimaryButton label="Coba lagi" variant="secondary" onPress={request} loading={requesting} fullWidth /> : null}
                  </>
                ) : (
                  <PrimaryButton label="Izinkan lokasi" onPress={request} loading={requesting} fullWidth />
                )}
                <Pressable accessibilityRole="button" onPress={finish} style={styles.skip}>
                  <Text style={styles.skipText}>{denied ? 'Lanjutkan tanpa lokasi' : 'Nanti saja'}</Text>
                </Pressable>
              </View>
            </>
          )}
        </GlassSheet>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flex: 0.36, alignItems: 'center', justifyContent: 'center', gap: 12 },
  badge: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  brand: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, color: colors.textPrimary },
  checking: { marginTop: 40 },
  title: { fontFamily: fontFamily.display, fontSize: 24, lineHeight: 30, color: colors.textPrimary, marginTop: 14 },
  body: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 24, color: colors.textPrimary, marginTop: 10 },
  note: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.textPrimary, marginTop: 8 },
  actions: { gap: 10, marginTop: 24 },
  skip: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: fontFamily.extrabold, fontSize: 14, letterSpacing: 1.25, color: colors.textPrimary, textDecorationLine: 'underline' },
});
