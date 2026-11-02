import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { cloudUpload } from './laporArtSvg';
import { colors, fontFamily } from '../theme/tokens';

interface Props {
  uri: string | undefined;
  onChange: (uri: string | undefined) => void;
}

// The Figma icon is white; recolor it to the dark text color so it stays visible on light glass.
const CLOUD_UPLOAD_DARK = cloudUpload.replaceAll('stroke="white"', `stroke="${colors.textPrimary}"`);

const OPTIONS = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 0.7 };

async function pick(source: 'camera' | 'library'): Promise<string | undefined> {
  if (source === 'camera') {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Izin kamera ditolak', 'Aktifkan izin kamera di pengaturan, atau pilih foto dari galeri.');
      return undefined;
    }
  }
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(OPTIONS) : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  return result.canceled ? undefined : result.assets[0].uri;
}

/** Optional photo: tap to take or choose one; a chosen photo shows as a thumbnail with Ganti / Hapus. */
export function PhotoField({ uri, onChange }: Props) {
  const choose = () =>
    Alert.alert('Tambah foto', undefined, [
      { text: 'Kamera', onPress: () => pick('camera').then((u) => u && onChange(u)) },
      { text: 'Galeri', onPress: () => pick('library').then((u) => u && onChange(u)) },
      { text: 'Batal', style: 'cancel' },
    ]);

  if (uri) {
    return (
      <View style={styles.zone}>
        <Image source={{ uri }} style={styles.thumb} accessibilityLabel="Foto kejadian yang dipilih" />
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={choose} style={styles.action}>
            <Text style={styles.actionText}>Ganti foto</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onChange(undefined)} style={styles.action}>
            <Text style={styles.actionText}>Hapus foto</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Tambah foto, opsional" onPress={choose} style={[styles.zone, styles.empty]}>
      <SvgXml xml={CLOUD_UPLOAD_DARK} width={22} height={20} />
      <Text style={styles.hint}>Ketuk untuk tambah foto</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: { minHeight: 78, borderRadius: 10, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, padding: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  hint: { fontFamily: fontFamily.semibold, fontSize: 14, color: colors.textSecondary },
  thumb: { width: '100%', height: 140, borderRadius: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  actionText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.accent },
});
