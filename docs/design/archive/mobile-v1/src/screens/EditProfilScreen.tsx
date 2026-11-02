import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { EditProfilForm } from '../components/EditProfilForm';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../constants';
import { colors, fontFamily } from '../theme/tokens';

/** Edit name, email and password (Figma 1032:4293). */
export function EditProfilScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { user, userState, reloadUser } = useAuth();
  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <View style={styles.header}>
          <ScreenHeader title="Edit Profil" onBack={onBack} />
        </View>
        {user ? (
          <EditProfilForm user={user} onDone={onBack} />
        ) : userState === 'error' ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>Profil gagal dimuat. Periksa koneksi lalu coba lagi.</Text>
            <Pressable accessibilityRole="button" onPress={reloadUser} style={styles.retry}>
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator color={colors.textPrimary} style={styles.status} />
        )}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 22 },
  brand: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginLeft: 6 },
  header: { marginTop: 10, marginLeft: -2 },
  status: { marginTop: 40, gap: 12, alignItems: 'center' },
  statusText: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20, color: colors.textPrimary, textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 13, backgroundColor: colors.buttonPrimary, justifyContent: 'center' },
  retryText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.onButtonPrimary },
});
