import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { LoadState } from '../components/LoadState';
import { ROUTES } from '../routes';
import type { Role } from '../types';
import './AkunPage.css';

const ROLE_LABEL: Record<Role, string> = { dishub: 'Dishub', admin: 'Admin', pengemudi: 'Pengemudi' };

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** 2026-10-22T... -> 22 Oktober 2026 (as in the Figma Tanggal Terdaftar). */
function longDate(iso: string | undefined) {
  const d = iso ? new Date(iso) : undefined;
  return d && !Number.isNaN(d.getTime()) ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '-';
}

/** Figma "dishub - akun" (1044:5869): the signed-in officer's own profile (GET /api/users/me) and Keluar. */
export function AkunPage() {
  const { role, user, signOut } = useAuth();

  return (
    <section className="akun" aria-labelledby="akun-title">
      <header className="akun-header">
        {/* navigate(-1) to the page before the profile; Beranda when the profile was opened directly. */}
        <BackButton fallback={ROUTES.beranda} />
        <h1 id="akun-title" className="akun-title">
          Profil Akun
        </h1>
      </header>

      {!user ? (
        <LoadState state="loading" message="Memuat profil…" />
      ) : (
        <div className="akun-body">
          <span className="akun-avatar" aria-hidden="true">
            {user.nama.charAt(0).toUpperCase()}
          </span>
          <div className="akun-main">
            <div className="akun-identity">
              <div>
                <p className="akun-name">{user.nama}</p>
                <p className="akun-email">{user.email}</p>
              </div>
              <Button onClick={signOut}>KELUAR</Button>
            </div>

            <section className="akun-info glass-in" aria-labelledby="akun-info-title">
              <h2 id="akun-info-title" className="akun-info-title">
                Informasi Akun
              </h2>
              <dl className="akun-fields">
                <div>
                  <dt>Nama Lengkap:</dt>
                  <dd>{user.nama}</dd>
                </div>
                <div>
                  <dt>Kode Pengguna:</dt>
                  <dd>{user.kode_pengguna}</dd>
                </div>
                <div>
                  <dt>Email:</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Tanggal Terdaftar:</dt>
                  <dd>{longDate(user.tanggal_terdaftar)}</dd>
                </div>
                <div>
                  <dt>Peran:</dt>
                  <dd>{role ? ROLE_LABEL[role] : '-'}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}
    </section>
  );
}
