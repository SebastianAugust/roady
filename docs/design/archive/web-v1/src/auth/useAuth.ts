import { createContext, useContext } from 'react';
import type { Role, User } from '../types';

export interface AuthValue {
  /** Role read from the JWT; undefined when signed out. */
  role: Role | undefined;
  /** The signed-in user's profile (GET /api/users/me), loaded after sign-in. */
  user: User | undefined;
  /** Stores the token. Throws RoleNotAllowedError when the role may not use the web dashboard (pengemudi). */
  signIn: (token: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthValue | undefined>(undefined);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
