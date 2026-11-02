import { useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError } from '../api';
import { AppBackground } from '../components/AppBackground';
import { Glass } from '../components/Glass';
import { LineIcon } from '../components/LineIcon';
import { PhotoField, PickedPhoto } from '../components/PhotoField';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { LocationState, useCurrentLocation } from '../hooks/useCurrentLocation';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { CUACA_OPTIONS, KATEGORI_OPTIONS } from '../lib/reportOptions';
import { reverseGeocodeToText } from '../lib/reverseGeocode';
import { colors, fontFamily, radius, screenLayout } from '../theme/tokens';
import type { Cuaca, FieldErrors, Kategori } from '../types';
import { LaporTerkirimScreen } from './LaporTerkirimScreen';


const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function locationText(l: LocationState) {
  if (l.status === 'ready') return `${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}, ${l.address}`;
  if (l.status === 'loading') return 'Mencari lokasi…';
  if (l.status === 'denied') return 'Izin lokasi ditolak. Aktifkan di pengaturan agar laporan bisa dikirim.';
  return 'Lokasi tidak tersedia.';
}

export function LaporScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { location, retry: retryLocation } = useCurrentLocation();
  const [kategori, setKategori] = useState<Kategori>();
  const [cuaca, setCuaca] = useState<Cuaca>();
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState<PickedPhoto>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const reduceMotion = useReduceMotion();
  const [shakeX] = useState(() => new Animated.Value(0));

  // A failed check shakes the form sideways (-6, 6, -4, 3, 0 px in 400 ms), skipped with reduce motion.
  const shake = () => {
    if (reduceMotion) return;
    shakeX.setValue(0);
    const step = (toValue: number) => Animated.timing(shakeX, { toValue, duration: 80, easing: Easing.linear, useNativeDriver: true });
    Animated.sequence([step(-6), step(6), step(-4), step(3), step(0)]).start();
  };

  if (sent) return <LaporTerkirimScreen onDone={onDone} />;

  // Choosing an option clears its error at once (the prototype does the same).
  const chooseKategori = (v: Kategori) => {
    setKategori(v);
    setErrors(({ kategori: _cleared, ...rest }) => rest);
  };
  const chooseCuaca = (v: Cuaca) => {
    setCuaca(v);
    setErrors(({ cuaca: _cleared, ...rest }) => rest);
  };

  const submit = async () => {
    const next: FieldErrors = {};
    if (!kategori) next.kategori = 'Pilih jenis kejadian.';
    if (!cuaca) next.cuaca = 'Pilih kondisi cuaca.';
    if (!deskripsi.trim()) next.deskripsi = 'Deskripsi wajib diisi.';
    if (location.status !== 'ready') next.lokasi = 'Lokasi belum tersedia.';
    setErrors(next);
    if (Object.keys(next).length) {
      shake();
      return;
    }
    if (!kategori || !cuaca || location.status !== 'ready') return;

    setLoading(true);
    try {
      // Saved with the report (not recomputed later). Null on failure or timeout; it never blocks sending.
      const alamat_teks = await reverseGeocodeToText(location.latitude, location.longitude);
      await api.createReport({
        latitude: location.latitude,
        longitude: location.longitude,
        alamat_teks,
        kategori,
        deskripsi,
        kondisi_cuaca_saat_kejadian: cuaca,
        tanggal_kejadian: today(),
        fotoUri: foto?.uri,
      });
      setSent(true);
    } catch (e) {
      setErrors(
        e instanceof ApiError ? { form: e.message, ...e.fieldErrors } : { form: 'Tidak dapat terhubung. Coba lagi.' },
      );
      setLoading(false);
    }
  };

  // Kejadian and Cuaca show their message under their own group; the rest is listed above the button.
  const formErrors = [errors.lokasi, errors.form].filter(Boolean);

  return (
    <AppBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.flex, { paddingTop: insets.top + screenLayout.top }]}>
          <View style={styles.headerPad}>
            <ScreenHeader title="Laporkan Kejadian" onBack={onBack} />
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.form, { transform: [{ translateX: shakeX }] }]}>
            <Glass radius={10} style={styles.card}>
              <Text style={styles.label}>
                Lokasi Anda: <Text style={styles.value}>{locationText(location)}</Text>
              </Text>
              {location.status === 'denied' || location.status === 'unavailable' ? (
                <Pressable accessibilityRole="button" onPress={retryLocation} style={styles.inlineAction}>
                  <Text style={styles.inlineActionText}>Coba lagi</Text>
                </Pressable>
              ) : null}
            </Glass>

            <SegmentedControl label="Kejadian" options={KATEGORI_OPTIONS} value={kategori} onChange={chooseKategori} error={errors.kategori} />
            <SegmentedControl label="Cuaca" options={CUACA_OPTIONS} value={cuaca} onChange={chooseCuaca} error={errors.cuaca} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Deskripsi Kejadian</Text>
              <TextInput
                keyboardAppearance="dark"
                accessibilityLabel="Deskripsi kejadian"
                multiline
                value={deskripsi}
                onChangeText={setDeskripsi}
                placeholder="Contoh: depan DU ada kecelakaan bis beruntun"
                placeholderTextColor={colors.textSecondary}
                textAlignVertical="top"
                style={[styles.textarea, errors.deskripsi ? styles.inputError : null]}
              />
              {errors.deskripsi ? <Text style={styles.error}>{errors.deskripsi}</Text> : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Foto <Text style={styles.optional}>(opsional)</Text>
              </Text>
              <PhotoField photo={foto} onChange={setFoto} />
              <View style={styles.info}>
                <LineIcon name="info" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>Harap tidak mengirim foto yang berisi wajah korban!</Text>
              </View>
            </View>
            </Animated.View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
            {formErrors.length ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                {formErrors.map((m) => (
                  <Text key={m} style={styles.error}>
                    {m}
                  </Text>
                ))}
              </View>
            ) : null}
            <PrimaryButton label="Kirim laporan" onPress={submit} loading={loading} fullWidth tall />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerPad: { paddingHorizontal: screenLayout.side },
  content: { paddingHorizontal: screenLayout.side, paddingTop: 14, paddingBottom: 16 },
  form: { gap: 14 },
  card: { padding: 14, gap: 8 },
  section: { gap: 6 },
  label: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  value: { fontFamily: fontFamily.extrabold },
  sectionLabel: { fontFamily: fontFamily.bold, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  optional: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  textarea: {
    minHeight: 78,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputError: { borderWidth: 2, borderColor: colors.error },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.glassInFill },
  infoText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  inlineAction: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  inlineActionText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.textPrimary, textDecorationLine: 'underline' },
  footer: { paddingHorizontal: screenLayout.side, paddingTop: 8, gap: 8 },
  errorBox: { borderRadius: radius.field, backgroundColor: colors.glass, padding: 10, gap: 2 },
  error: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.error },
});
