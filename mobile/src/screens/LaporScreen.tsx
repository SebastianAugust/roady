import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError } from '../api';
import { AppBackground } from '../components/AppBackground';
import { Dropdown } from '../components/Dropdown';
import { PhotoField } from '../components/PhotoField';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { LocationState, useCurrentLocation } from '../hooks/useCurrentLocation';
import { CUACA_OPTIONS, KATEGORI_OPTIONS } from '../lib/reportOptions';
import { reverseGeocodeToText } from '../lib/reverseGeocode';
import { colors, fontFamily, radius } from '../theme/tokens';
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
  const [fotoUri, setFotoUri] = useState<string>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) return <LaporTerkirimScreen onDone={onDone} />;

  const submit = async () => {
    const next: FieldErrors = {};
    if (!kategori) next.kategori = 'Pilih jenis kejadian.';
    if (!cuaca) next.cuaca = 'Pilih kondisi cuaca.';
    if (!deskripsi.trim()) next.deskripsi = 'Deskripsi wajib diisi.';
    if (location.status !== 'ready') next.lokasi = 'Lokasi belum tersedia.';
    setErrors(next);
    if (Object.keys(next).length || !kategori || !cuaca || location.status !== 'ready') return;

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
        fotoUri,
      });
      setSent(true);
    } catch (e) {
      setErrors(
        e instanceof ApiError ? { form: e.message, ...e.fieldErrors } : { form: 'Tidak dapat terhubung. Coba lagi.' },
      );
      setLoading(false);
    }
  };

  const formErrors = [errors.lokasi, errors.kategori, errors.cuaca, errors.form].filter(Boolean);

  return (
    <AppBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.flex, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerPad}>
            <ScreenHeader title="Laporkan Kejadian" onBack={onBack} />
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.label}>
                Lokasi Anda: <Text style={styles.value}>{locationText(location)}</Text>
              </Text>
              {location.status === 'denied' || location.status === 'unavailable' ? (
                <Pressable accessibilityRole="button" onPress={retryLocation} style={styles.inlineAction}>
                  <Text style={styles.inlineActionText}>Coba lagi</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.dropdownRow}>
              <Dropdown placeholder="Kejadian" options={KATEGORI_OPTIONS} value={kategori} onChange={setKategori} hasError={!!errors.kategori} />
              <Dropdown placeholder="Cuaca" options={CUACA_OPTIONS} value={cuaca} onChange={setCuaca} hasError={!!errors.cuaca} />
            </View>

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
              <PhotoField uri={fotoUri} onChange={setFotoUri} />
              <Text style={styles.note}>**Harap tidak mengirim foto yang berisi wajah korban!</Text>
            </View>
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
            <PrimaryButton label="Kirim laporan" onPress={submit} loading={loading} fullWidth />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerPad: { paddingHorizontal: 20 },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 16, gap: 12 },
  card: { borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  section: { gap: 6, paddingLeft: 2 },
  label: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  value: { fontFamily: fontFamily.extrabold },
  sectionLabel: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  optional: { fontFamily: fontFamily.semibold, fontSize: 13 },
  dropdownRow: { flexDirection: 'row', gap: 4, paddingLeft: 2, zIndex: 10, elevation: 10 },
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
  note: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  inlineAction: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  inlineActionText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.textPrimary, textDecorationLine: 'underline' },
  footer: { paddingHorizontal: 33, paddingTop: 8, gap: 8 },
  errorBox: { borderRadius: radius.field, backgroundColor: colors.glass, padding: 10, gap: 2 },
  error: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.error },
});
