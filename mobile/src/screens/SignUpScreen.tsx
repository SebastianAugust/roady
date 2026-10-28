import { useRef, useState } from 'react';
import { View } from 'react-native';
import { api, ApiError } from '../api';
import { AuthField, InputHandle } from '../components/AuthField';
import { AuthForm } from '../components/AuthForm';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing } from '../theme/tokens';
import type { FieldErrors, LoginResponse } from '../types';

interface Props {
  onSuccess: (session: LoginResponse) => void;
  onGoToLogin: () => void;
}

export function SignUpScreen({ onSuccess, onGoToLogin }: Props) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<InputHandle>(null);
  const passwordRef = useRef<InputHandle>(null);

  const submit = async () => {
    setErrors({});
    setLoading(true);
    try {
      onSuccess(await api.register({ nama, email, password }));
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fieldErrors ?? { form: e.message });
      else setErrors({ form: 'Tidak dapat terhubung. Coba lagi.' });
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Sign-up"
      titleGap={33}
      footerText="Sudah punya akun?"
      footerLink="Login"
      onFooterPress={onGoToLogin}
    >
      <AuthField
        label="Nama Lengkap"
        placeholder="Jane Doe"
        value={nama}
        onChangeText={setNama}
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.nama}
      />
      <AuthField
        ref={emailRef}
        label="Email"
        placeholder="janedoe@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
      />
      <AuthField
        ref={passwordRef}
        label="Password"
        placeholder="••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={errors.password ?? errors.form}
      />
      <View style={{ marginTop: spacing.section }}>
        <PrimaryButton label="Signup" onPress={submit} loading={loading} />
      </View>
    </AuthForm>
  );
}
