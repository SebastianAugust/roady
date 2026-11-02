import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import type { Laporan } from '../types';

type State = 'loading' | 'error' | 'ready';

/** The signed-in driver's reports, newest first. Reloads whenever the screen gains focus, so a report just sent shows up. */
export function useMyReports() {
  const [reports, setReports] = useState<Laporan[]>([]);
  const [state, setState] = useState<State>('loading');

  const onData = useCallback((next: Laporan[]) => {
    setReports(next);
    setState('ready');
  }, []);
  // A failed background reload keeps the list that is already on screen.
  const onError = useCallback(() => setState((s) => (s === 'ready' ? s : 'error')), []);

  const retry = useCallback(() => {
    setState('loading');
    api.getMyReports().then(onData, onError);
  }, [onData, onError]);

  useFocusEffect(
    useCallback(() => {
      api.getMyReports().then(onData, onError);
    }, [onData, onError]),
  );

  return { reports, state, retry };
}
