import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Zona } from '../types';

type Result = { id: number; zone: Zona } | { id: number; failed: true };
export type ZoneState = 'idle' | 'loading' | 'error' | 'ready';

/** One zone by id (API-004) for the detail sheet. `idle` while no zone is selected. */
export function useZone(zonaId: number | undefined) {
  const [result, setResult] = useState<Result>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (zonaId === undefined) return;
    let alive = true;
    api.getZone(zonaId).then(
      (zone) => alive && setResult({ id: zonaId, zone }),
      () => alive && setResult({ id: zonaId, failed: true }),
    );
    return () => {
      alive = false;
    };
  }, [zonaId, attempt]);

  // A result for another zone (the user tapped a different marker) counts as still loading.
  const current = zonaId !== undefined && result?.id === zonaId ? result : undefined;
  const state: ZoneState = zonaId === undefined ? 'idle' : !current ? 'loading' : 'zone' in current ? 'ready' : 'error';
  const zone = current && 'zone' in current ? current.zone : undefined;

  const retry = useCallback(() => {
    setResult(undefined);
    setAttempt((a) => a + 1);
  }, []);

  return { zone, state, retry };
}
