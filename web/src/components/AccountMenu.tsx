import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROUTES } from '../routes';
import type { Role } from '../types';
import { LogoutIcon, UserIcon } from './icons';
import './AccountMenu.css';

const ROLE_LABEL: Record<Role, string> = { dishub: 'Dishub', admin: 'Admin', pengemudi: 'Pengemudi' };

/**
 * Account chip (role, email, round avatar) that opens the account popup of Figma "akun admin" (1036:7250):
 * two right-aligned rows under the chip, "Profil akun" and "Keluar". Closes on Escape, an outside click, or a choice.
 */
export function AccountMenu() {
  const { role, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const roleLabel = role ? ROLE_LABEL[role] : '';
  const initial = (user?.nama ?? roleLabel).charAt(0).toUpperCase();

  return (
    <div className="account" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="account-chip glass"
        aria-expanded={open}
        aria-controls={popupId}
        aria-label={`Menu akun ${roleLabel}${user ? `, ${user.email}` : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="account-text">
          <span className="account-role">{roleLabel}</span>
          <span className="account-email">{user?.email ?? ' '}</span>
        </span>
        <span className="account-avatar" aria-hidden="true">
          {initial}
        </span>
      </button>

      {open ? (
        <ul id={popupId} className="account-popup" aria-label="Menu akun">
          {user ? (
            <li className="account-code">
              <span>Kode pengguna</span>
              <strong>{user.kode_pengguna}</strong>
            </li>
          ) : null}
          <li>
            <Link to={ROUTES.akun} className="account-item" onClick={() => setOpen(false)}>
              Profil akun
              <UserIcon />
            </Link>
          </li>
          <li>
            <button type="button" className="account-item account-item-danger" onClick={signOut}>
              Keluar
              <LogoutIcon />
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
