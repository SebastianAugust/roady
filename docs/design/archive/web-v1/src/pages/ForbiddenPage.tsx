import { Link } from 'react-router-dom';
import { WEB_ROLES } from '../auth/jwt';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ROUTES } from '../routes';

/**
 * 403 from RequireRole. Dishub on an Admin URL or Admin on a Dishub URL (no cross access, docs/05 #30) stays signed in
 * and gets a way back to its own Beranda; any other role can only sign out.
 */
export function ForbiddenPage() {
  const { role, signOut } = useAuth();
  const webRole = role !== undefined && WEB_ROLES.includes(role);
  return (
    <section className="card glass-in center-message" aria-labelledby="forbidden-title">
      <h1 id="forbidden-title">Akses ditolak</h1>
      <p className="muted">
        {role === 'dishub'
          ? 'Halaman ini hanya untuk Admin. Akun Dishub tidak berhak membukanya.'
          : role === 'admin'
            ? 'Halaman ini hanya untuk Dishub. Akun Admin tidak berhak membukanya.'
            : 'Akun ini tidak berhak membuka halaman ini. Dashboard web hanya untuk akun Dishub dan Admin.'}
      </p>
      {webRole ? (
        <Link to={ROUTES.beranda} className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      ) : (
        <Button onClick={signOut}>Keluar</Button>
      )}
    </section>
  );
}
