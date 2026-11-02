import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api';
import { useAuth } from '../auth/useAuth';

type State<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };
type Result<T> = { status: 'error'; message: string } | { status: 'ready'; data: T };

/**
 * Runs `load` on mount and whenever `load` changes (wrap it in useCallback with its inputs).
 * A 401 signs the user out; other errors become a message for LoadState.
 */
export function useApi<T>(load: () => Promise<T>) {
  const { signOut } = useAuth();
  const [attempt, setAttempt] = useState(0);
  // The result remembers which request it answers; anything older reads as loading, so no reset is needed.
  const [result, setResult] = useState<{ load: () => Promise<T>; attempt: number; value: Result<T> }>();

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setResult({ load, attempt, value: { status: 'ready', data } }),
      (e: unknown) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) signOut();
        else setResult({ load, attempt, value: { status: 'error', message: errorMessage(e) } });
      },
    );
    return () => {
      alive = false;
    };
  }, [load, attempt, signOut]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: State<T> = result && result.load === load && result.attempt === attempt ? result.value : { status: 'loading' };
  return { state, retry };
}

export function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.status === 403 ? 'Akun ini tidak berhak mengakses data ini.' : e.message;
  return 'Gagal memuat data. Periksa koneksi lalu coba lagi.';
}
