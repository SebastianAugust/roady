import { useRef, useState } from 'react';
import { View } from 'react-native';
import { api, ApiError } from '../api';
import { AuthField, InputHandle } from '../components/AuthField';
import { AuthForm } from '../components/AuthForm';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing } from '../theme/tokens';
import type { LoginResponse } from '../types';

interface Props {
  onSuccess: (session: LoginResponse) => void;
  onGoToSignUp: () => void;
}

export function LoginScreen({ onSuccess, onGoToSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<InputHandle>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      onSuccess(await api.login({ email, password }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Tidak dapat terhubung. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Login"
      titleGap={111}
      footerText="Belum punya akun?"
      footerLink="Sign-up"
      onFooterPress={onGoToSignUp}
    >
      <AuthField
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
      />
      <AuthField
        ref={passwordRef}
        label="Password"
        placeholder="••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={error}
      />
      <View style={{ marginTop: spacing.section }}>
        <PrimaryButton label="Login" onPress={submit} loading={loading} />
      </View>
    </AuthForm>
  );
}
