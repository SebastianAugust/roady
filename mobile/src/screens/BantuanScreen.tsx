import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { GlassMenu } from '../components/GlassMenu';
import { iconInstagram, iconWhatsapp } from '../components/profileArtSvg';
import { ScreenHeader } from '../components/ScreenHeader';
import { CONTACT } from '../config';
import { APP_NAME } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

async function openContact(url: string | undefined) {
  if (!url) {
    Alert.alert('Kontak belum tersedia', 'Tautan kontak belum diatur.');
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Tidak dapat membuka tautan', 'Coba lagi nanti.');
  }
}

/** Help and contact options (Figma 1032:3223). */
export function BantuanScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <View style={styles.header}>
          <ScreenHeader title="Bantuan" onBack={onBack} />
        </View>
        <GlassMenu
          items={[
            {
              key: 'instagram',
              label: 'DM Instagram',
              subtitle: `Hubungi akun ${APP_NAME.replace('!', '')} melalui Instagram`,
              icon: iconInstagram,
              iconWidth: 30,
              iconHeight: 30,
              onPress: () => void openContact(CONTACT.instagramUrl),
            },
            {
              key: 'whatsapp',
              label: 'Chat Whatsapp',
              subtitle: `Hubungi Contact Center ${APP_NAME.replace('!', '')} melalui Chat Whatsapp`,
              icon: iconWhatsapp,
              iconWidth: 27,
              iconHeight: 27,
              onPress: () => void openContact(CONTACT.whatsappUrl),
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
