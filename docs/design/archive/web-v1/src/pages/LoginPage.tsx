import { useState, type AnimationEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { RoleNotAllowedError } from '../auth/jwt';
import { AppBackground } from '../components/AppBackground';
import { Button } from '../components/Button';
import { EyeIcon, EyeOffIcon } from '../components/icons';
import { TextField } from '../components/TextField';
import { APP_NAME } from '../constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { canOpen, ROUTES } from '../routes';
import './LoginPage.css';

const PASSWORD_MIN_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MSG_EMAIL = 'Format email belum benar. Contoh: nama@instansi.go.id';
const MSG_PASSWORD = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;
const MSG_WRONG = 'Email atau password salah. Coba lagi.';

const ERROR_ID = 'login-error';
const PASSWORD_ID = 'login-password';

/**
 * Login (docs/design/admin/Login.png, docs/design/dishub/Login.png; the same screen for both) as one glass card
 * centred on the screen: wordmark (a link to /login), title, form. Dishub and Admin sign in here; pengemudi accounts
 * are turned away. The form is checked in the browser first (email shape, password length); one alert above the button
 * says what is wrong and the form shakes. Afterwards it returns to the page that asked for a login only when the new
 * role may open it (e.g. not to an Admin URL after signing in as Dishub); otherwise to Beranda.
 */
export function LoginPage() {
  usePageTitle('Masuk');
  const { role, signIn } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; field?: 'email' | 'password' }>();
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (role) return <Navigate to={canOpen(role, from) ? from : '/'} replace />;

  const fail = (message: string, field?: 'email' | 'password') => {
    setError({ message, field });
    setShaking(true);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(undefined);
    if (!EMAIL_PATTERN.test(email.trim())) return fail(MSG_EMAIL, 'email');
    if (password.length < PASSWORD_MIN_LENGTH) return fail(MSG_PASSWORD, 'password');

    setBusy(true);
    try {
      const { token } = await api.login({ email, password });
      // The new role re-renders this page, and the <Navigate> above takes it on.
      signIn(token);
    } catch (err) {
      if (err instanceof RoleNotAllowedError) fail(err.message);
      else if (err instanceof ApiError) fail(err.status === 401 ? MSG_WRONG : 'Gagal masuk. Coba lagi.');
      else fail('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  // Enter in the email field moves on to the password while that is still empty; with a password it submits as usual.
  const onEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing || password) return;
    e.preventDefault();
    document.getElementById(PASSWORD_ID)?.focus();
  };

  // The class is dropped when the shake itself ends (not when a child's rise animation bubbles up), so the next error shakes again.
  const onAnimationEnd = (e: AnimationEvent) => {
    if (e.target === e.currentTarget) setShaking(false);
  };

  return (
    <div className="login">
      <AppBackground />
      <main className="login-card glass rise stagger">
        <Link to={ROUTES.login} className="login-brand">
          {APP_NAME}
        </Link>
        <div className="login-head">
          <h1 className="login-title">Masuk ke {APP_NAME}</h1>
          <p className="login-subtitle">Panel Dishub dan Admin</p>
        </div>
        <div>
          <form className={`login-form${shaking ? ' shake' : ''}`} onSubmit={submit} onAnimationEnd={onAnimationEnd} noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="nama@instansi.go.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={onEmailKeyDown}
              aria-invalid={error?.field === 'email' || undefined}
              aria-describedby={error?.field === 'email' ? ERROR_ID : undefined}
            />
            <TextField
              id={PASSWORD_ID}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              endAdornment={
                <button
                  type="button"
                  className="field-adornment-button"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
              placeholder={`Minimal ${PASSWORD_MIN_LENGTH} karakter`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error?.field === 'password' || undefined}
              aria-describedby={error?.field === 'password' ? ERROR_ID : undefined}
            />
            <p id={ERROR_ID} className="login-error error-text" role="alert">
              {error?.message}
            </p>
            <Button type="submit" busy={busy} className="login-submit">
              {busy ? 'Memeriksa' : 'MASUK'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
