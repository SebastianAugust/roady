import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, setAuthToken } from '../api';
import { clearSession, loadToken, saveToken } from '../lib/storage';
import type { Role, User } from '../types';
import { decodeToken, RoleNotAllowedError, WEB_ROLES } from './jwt';
import { AuthContext } from './useAuth';

/** Role of a stored token, or undefined when it is missing, malformed, expired or not a web role. */
function initialRole() {
  const token = loadToken();
  const claims = decodeToken(token);
  if (claims && WEB_ROLES.includes(claims.role)) {
    setAuthToken(token);
    return claims.role;
  }
  clearSession();
  return undefined;
}

/** Keeps the JWT in localStorage so the session survives a reload; a 401 from the API signs the user out. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | undefined>(initialRole);
  const [user, setUser] = useState<User>();

  const signOut = useCallback(() => {
    setAuthToken(undefined);
    clearSession();
    setUser(undefined);
    setRole(undefined);
  }, []);

  const signIn = useCallback((token: string) => {
    const claims = decodeToken(token);
    if (!claims) throw new Error('Token tidak valid.');
    // Pengemudi accounts are real accounts, just not for this app; the token is dropped instead of stored.
    if (!WEB_ROLES.includes(claims.role)) throw new RoleNotAllowedError();
    setAuthToken(token);
    saveToken(token);
    setUser(undefined);
    setRole(claims.role);
  }, []);

  useEffect(() => {
    if (!role) return;
    let alive = true;
    api.getMe().then(
      (me) => alive && setUser(me),
      (e: unknown) => {
        // Expired or unknown token: back to Login. Other failures leave the profile empty in Akun.
        if (alive && e instanceof ApiError && e.status === 401) signOut();
      },
    );
    return () => {
      alive = false;
    };
  }, [role, signOut]);

  const value = useMemo(() => ({ role, user, signIn, signOut }), [role, user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
