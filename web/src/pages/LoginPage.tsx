import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { RoleNotAllowedError } from '../auth/jwt';
import { AppBackground } from '../components/AppBackground';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { APP_NAME } from '../constants';
import { canOpen } from '../routes';
import './LoginPage.css';

/**
 * Login (docs/design/admin/Login.png, docs/design/dishub/Login.png; the same screen for both). Dishub and Admin sign in
 * here; pengemudi accounts are turned away. Afterwards it returns to the page that asked for a login only when the
 * new role may open it (e.g. not to an Admin URL after signing in as Dishub); otherwise to Beranda.
 */
export function LoginPage() {
  const { role, signIn } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (role) return <Navigate to={canOpen(role, from) ? from : '/'} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Isi email dan kata sandi.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const { token } = await api.login({ email, password });
      // The new role re-renders this page, and the <Navigate> above takes it on.
      signIn(token);
    } catch (err) {
      if (err instanceof RoleNotAllowedError) setError(err.message);
      else if (err instanceof ApiError) setError(err.status === 401 ? err.message : 'Gagal masuk. Coba lagi.');
      else setError('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <AppBackground />
      <header className="login-brand">{APP_NAME}</header>
      <h1 className="login-title">Login</h1>
      <main className="login-panel glass">
        <form className="login-form" onSubmit={submit} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="nama@dishub.go.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="login-error error-text" role="alert">
            {error}
          </p>
          <Button type="submit" busy={busy} className="login-submit">
            {busy ? 'MEMPROSES…' : 'LOGIN'}
          </Button>
        </form>
      </main>
    </div>
  );
}
