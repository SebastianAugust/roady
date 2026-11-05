import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, setAuthToken } from '../api';
import { clearSession, loadSession, saveSession } from '../lib/storage';
import type { LoginResponse, User } from '../types';

type Status = 'loading' | 'signedOut' | 'signedIn';
type UserState = 'loading' | 'error' | 'ready';

interface AuthValue {
  /** `loading` while the stored session is being read at startup. */
  status: Status;
  /** The signed-in user's profile (GET /api/users/me). */
  user: User | undefined;
  userState: UserState;
  signIn: (session: LoginResponse) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  reloadUser: () => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

/** Keeps the session in expo-secure-store so it survives an app reload; a 401 from the API signs the user out. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User>();
  const [userState, setUserState] = useState<UserState>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    loadSession().then((session) => {
      if (!alive) return;
      if (session) setAuthToken(session.token);
      setStatus(session ? 'signedIn' : 'signedOut');
    });
    return () => {
      alive = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(undefined);
    setUser(undefined);
    setStatus('signedOut');
    await clearSession();
  }, []);

  const signIn = useCallback(async (session: LoginResponse) => {
    setAuthToken(session.token);
    setUser(undefined);
    setUserState('loading');
    setStatus('signedIn');
    await saveSession(session);
  }, []);

  useEffect(() => {
    if (status !== 'signedIn') return;
    let alive = true;
    api.getMe().then(
      (me) => {
        if (!alive) return;
        setUser(me);
        setUserState('ready');
      },
      (e: unknown) => {
        if (!alive) return;
        // Expired or unknown token: back to Login. Other failures (offline) keep the session and offer a retry.
        if (e instanceof ApiError && e.status === 401) void signOut();
        else setUserState('error');
      },
    );
    return () => {
      alive = false;
    };
  }, [status, reloadKey, signOut]);

  const reloadUser = useCallback(() => {
    setUserState('loading');
    setReloadKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({ status, user, userState, signIn, signOut, setUser, reloadUser }),
    [status, user, userState, signIn, signOut, reloadUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
