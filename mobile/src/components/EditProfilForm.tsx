import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/AuthContext';
import { colors, fontFamily } from '../theme/tokens';
import type { FieldErrors, UpdateProfileRequest, User } from '../types';
import { LabeledInput } from './LabeledInput';
import { PrimaryButton } from './PrimaryButton';
import { Glass } from './Glass';

/** Name, email and password fields with the Simpan button; mounted only once the profile is loaded so the fields start from real values. */
export function EditProfilForm({ user, onDone }: { user: User; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();
  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const save = async () => {
    // Send only what changed; an empty password means "keep the current one".
    const body: UpdateProfileRequest = {};
    if (nama.trim() !== user.nama) body.nama = nama;
    if (email.trim().toLowerCase() !== user.email) body.email = email;
    if (password) body.password = password;
    if (Object.keys(body).length === 0) {
      onDone();
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      setUser(await api.updateMe(body));
      onDone();
    } catch (e) {
      setErrors(e instanceof ApiError ? { form: e.message, ...e.fieldErrors } : { form: 'Tidak dapat terhubung. Coba lagi.' });
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
          <View style={styles.identityText}>
            <Text style={styles.name}>{user.nama}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        <Glass radius={10} style={styles.card}>
          <LabeledInput label="Nama" value={nama} onChangeText={setNama} autoCapitalize="words" error={errors.nama} />
          <LabeledInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Kosongkan jika tidak diganti"
            error={errors.password}
          />
        </Glass>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
        {errors.form ? (
          <Text accessibilityLiveRegion="polite" style={styles.formError}>
            {errors.form}
          </Text>
        ) : null}
        <PrimaryButton label="Simpan" onPress={save} loading={loading} fullWidth />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 18, gap: 18 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 8 },
  avatar: { width: 89, height: 89, borderRadius: 45, backgroundColor: colors.surfaceRaised },
  identityText: { flex: 1 },
  name: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28, color: colors.textPrimary },
  email: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  card: { padding: 14, gap: 12 },
  footer: { paddingHorizontal: 11, paddingTop: 8, gap: 8 },
  formError: { fontFamily: fontFamily.semibold, fontSize: 13, lineHeight: 18, color: colors.error, textAlign: 'center' },
});
