import { useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { colors, fontFamily } from '../theme/tokens';
import { cloudUpload } from './laporArtSvg';
import { LineIcon } from './LineIcon';

/** A photo picked for the report: its uri (what is sent) plus the name and size shown on the preview. */
export interface PickedPhoto {
  uri: string;
  name: string;
  /** Bytes; not every platform reports it. */
  size?: number;
}

interface Props {
  photo: PickedPhoto | undefined;
  onChange: (photo: PickedPhoto | undefined) => void;
}

const CLOUD_UPLOAD = cloudUpload.replaceAll('stroke="white"', `stroke="${colors.textPrimary}"`);
const OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/** "1,8 MB" / "640 KB", Indonesian decimal comma. */
function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function pick(source: 'camera' | 'library'): Promise<PickedPhoto | undefined> {
  if (source === 'camera') {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Izin kamera ditolak', 'Aktifkan izin kamera di pengaturan, atau pilih foto dari galeri.');
      return undefined;
    }
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted && perm.accessPrivileges !== 'limited') {
      Alert.alert('Izin galeri ditolak', 'Aktifkan izin foto di pengaturan, atau ambil foto dengan kamera.');
      return undefined;
    }
  }
  try {
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(OPTIONS) : await ImagePicker.launchImageLibraryAsync(OPTIONS);
    if (result.canceled) return undefined;
    const a = result.assets[0];
    return { uri: a.uri, name: a.fileName ?? a.uri.split('/').pop() ?? 'foto.jpg', size: a.fileSize };
  } catch {
    Alert.alert('Foto tidak dapat dibuka', 'Coba lagi, atau pilih foto lain.');
    return undefined;
  }
}

/** Ambil foto / Pilih dari galeri / Batal: an action sheet on iOS, an alert with three buttons on Android. */
function chooseSource(onPick: (source: 'camera' | 'library') => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'Tambah foto', options: ['Ambil foto', 'Pilih dari galeri', 'Batal'], cancelButtonIndex: 2 },
      (i) => {
        if (i === 0) onPick('camera');
        else if (i === 1) onPick('library');
      },
    );
    return;
  }
  Alert.alert(
    'Tambah foto',
    undefined,
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Pilih dari galeri', onPress: () => onPick('library') },
      { text: 'Ambil foto', onPress: () => onPick('camera') },
    ],
    { cancelable: true },
  );
}

/** The chosen photo: the image with the weight badge, then the file name and size with Ganti and Hapus. Pops in (scale .96 to 1). */
function Preview({ photo, onReplace, onRemove }: { photo: PickedPhoto; onReplace: () => void; onRemove: () => void }) {
  const reduce = useReduceMotion();
  const [pop] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce) {
      pop.setValue(1);
      return;
    }
    pop.setValue(0);
    const anim = Animated.timing(pop, { toValue: 1, duration: 300, easing: EASE, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [photo.uri, reduce, pop]);

  const meta = photo.size ? `${photo.name} · ${formatSize(photo.size)}` : photo.name;

  return (
    <Animated.View
      style={[styles.preview, { opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}
    >
      <View>
        <Image source={{ uri: photo.uri }} style={styles.image} accessibilityLabel="Foto kejadian yang dipilih" />
        <View style={styles.badge}>
          <LineIcon name="check" size={13} color={colors.textPrimary} strokeWidth={2.5} />
          <Text style={styles.badgeText}>Bobot 1,0, diverifikasi Admin</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta} numberOfLines={1} ellipsizeMode="middle">
          {meta}
        </Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Ganti foto" hitSlop={5} onPress={onReplace} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            <Text style={styles.chipText}>Ganti</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Hapus foto" hitSlop={5} onPress={onRemove} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            <LineIcon name="trash" size={15} color={colors.error} />
            <Text style={[styles.chipText, styles.remove]}>Hapus</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Optional photo of the report. Empty: one dashed box ("Ketuk untuk tambah foto") that opens the source choice, with
 * the weight note under it. Chosen: a preview card (Ganti opens the same choice, Hapus removes it).
 */
export function PhotoField({ photo, onChange }: Props) {
  const choose = () => chooseSource((source) => pick(source).then((p) => p && onChange(p)));

  if (photo) return <Preview photo={photo} onReplace={choose} onRemove={() => onChange(undefined)} />;
  return (
    <View style={styles.emptyWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tambah foto, opsional"
        accessibilityHint="Ambil foto dengan kamera atau pilih dari galeri"
        onPress={choose}
        style={({ pressed }) => [styles.empty, pressed && styles.emptyPressed]}
      >
        <SvgXml xml={CLOUD_UPLOAD} width={26} height={24} />
        <Text style={styles.hint}>Ketuk untuk tambah foto</Text>
      </Pressable>
      <Text style={styles.weight}>Tanpa foto, bobot laporan 0,5 dan langsung masuk otomatis.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { gap: 6 },
  empty: {
    height: 104,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedEdge,
    backgroundColor: colors.glassInFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyPressed: { backgroundColor: colors.chipFill, transform: [{ scale: 0.97 }] },
  hint: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textPrimary },
  weight: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  preview: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.glassInEdge, backgroundColor: colors.glassInFill },
  image: { width: '100%', height: 150, backgroundColor: colors.surface },
  badge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.statusSuccess,
  },
  badgeText: { fontFamily: fontFamily.bold, fontSize: 12, lineHeight: 17, color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  meta: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 13, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: 6 },
  chip: { height: 34, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.chipFill, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pressed: { opacity: 0.8 },
  chipText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  remove: { color: colors.error },
});
