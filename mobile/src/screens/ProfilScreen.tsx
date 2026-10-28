import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { BottomBar } from '../components/BottomBar';
import { GlassMenu } from '../components/GlassMenu';
import { iconDelete, iconHeadset, iconLogout, iconSettings } from '../components/profileArtSvg';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

interface Props {
  onHome: () => void;
  onReport: () => void;
  onOpenBantuan: () => void;
  onOpenPengaturan: () => void;
  onEditProfil: () => void;
}

/** Account tab (Figma 1032:2670). Riwayat Laporan is reached from Home (arrow beside the section title), not from here. */
export function ProfilScreen({ onHome, onReport, onOpenBantuan, onOpenPengaturan, onEditProfil }: Props) {
  const insets = useSafeAreaInsets();
  const { user, userState, reloadUser, signOut } = useAuth();

  const confirmSignOut = () =>
    Alert.alert('Keluar akun', 'Anda akan keluar dari akun ini.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => void signOut() },
    ]);
  // No delete-account endpoint in docs/03 yet.
  const comingSoon = () => Alert.alert('Segera hadir', 'Hapus akun belum tersedia.');

  const firstName = user?.nama.trim().split(/\s+/)[0];

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 4, paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.brand}>
          {APP_NAME}
        </Text>
        <Text style={styles.greeting}>{firstName ? `Hai, ${firstName}!` : 'Hai!'}</Text>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />

        {userState === 'ready' && user ? (
          <View style={styles.identity}>
            <Text style={styles.name}>{user.nama}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        ) : userState === 'error' ? (
          <View style={styles.identity}>
            <Text style={styles.email}>Profil gagal dimuat.</Text>
            <Pressable accessibilityRole="button" onPress={reloadUser} style={styles.retry}>
              <Text style={styles.editText}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.identity}>
            <Text style={styles.email}>Memuat profil…</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profil"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={userState !== 'ready'}
          onPress={onEditProfil}
          style={[styles.editButton, userState !== 'ready' && styles.editDisabled]}
        >
          <Text style={styles.editText}>Edit Profil</Text>
        </Pressable>

        <View style={styles.menu}>
          <GlassMenu
            items={[
              { key: 'bantuan', label: 'Bantuan', icon: iconHeadset, iconWidth: 24, iconHeight: 24, onPress: onOpenBantuan },
              { key: 'keluar', label: 'Keluar akun', icon: iconLogout, iconWidth: 24, iconHeight: 24, iconShiftX: -3, onPress: confirmSignOut },
              { key: 'pengaturan', label: 'Pengaturan', icon: iconSettings, iconWidth: 28, iconHeight: 28, onPress: onOpenPengaturan },
            ]}
          />
          <GlassMenu items={[{ key: 'hapus', label: 'Hapus akun', icon: iconDelete, iconWidth: 28, iconHeight: 28, onPress: comingSoon }]} />
        </View>
      </ScrollView>
      <BottomBar active="profil" onHome={onHome} onReport={onReport} onProfile={() => {}} />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22 },
  brand: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginLeft: 6 },
  greeting: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28, color: colors.textPrimary, textAlign: 'center', marginTop: 6 },
  avatar: { width: 89, height: 89, borderRadius: 45, backgroundColor: colors.surfaceRaised, alignSelf: 'center', marginTop: 16 },
  identity: { alignItems: 'center', marginTop: 12, minHeight: 50 },
  name: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28, color: colors.textPrimary },
  email: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  editButton: { alignSelf: 'center', width: 100, height: 28, borderRadius: 8, marginTop: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  editDisabled: { opacity: 0.5 },
  editText: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textPrimary },
  menu: { marginTop: 24, gap: 13 },
});
