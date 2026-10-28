import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { GlassMenu } from '../components/GlassMenu';
import { iconBell, iconMail } from '../components/profileArtSvg';
import { ScreenHeader } from '../components/ScreenHeader';
import { Toggle } from '../components/Toggle';
import { APP_NAME } from '../constants';
import { useNotificationPrefs } from '../hooks/useNotificationPrefs';
import { colors, fontFamily } from '../theme/tokens';

/** Notification settings (Figma 1032:3758). The choices are saved on the device; sending notifications comes with the backend. */
export function PengaturanScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { prefs, loaded, setPref } = useNotificationPrefs();
  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <View style={styles.header}>
          <ScreenHeader title="Pengaturan" onBack={onBack} />
        </View>
        <GlassMenu
          items={[
            {
              key: 'push',
              label: 'Push notifications',
              icon: iconBell,
              iconWidth: 29,
              iconHeight: 29,
              trailing: <Toggle label="Push notifications" value={prefs.push} disabled={!loaded} onChange={(v) => setPref('push', v)} />,
            },
            {
              key: 'email',
              label: 'Email notifications',
              icon: iconMail,
              iconWidth: 33,
              iconHeight: 33,
              trailing: <Toggle label="Email notifications" value={prefs.email} disabled={!loaded} onChange={(v) => setPref('email', v)} />,
            },
          ]}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 22 },
  brand: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginLeft: 6 },
  header: { marginTop: 10, marginBottom: 24, marginLeft: -2 },
});
