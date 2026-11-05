import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { BANDUNG_RAYA, ZONES_FETCH_RADIUS_M } from '../config';
import type { Zona } from '../types';

type State = 'loading' | 'error' | 'ready';

/** All zones in Bandung Raya, for the map views. */
export function useZones() {
  const [zones, setZones] = useState<Zona[]>([]);
  const [state, setState] = useState<State>('loading');

  const fetchZones = useCallback(
    () =>
      api.getZones({
        lat: BANDUNG_RAYA.center.latitude,
        lng: BANDUNG_RAYA.center.longitude,
        radius: ZONES_FETCH_RADIUS_M,
      }),
    [],
  );
  const onData = useCallback((next: Zona[]) => {
    setZones(next);
    setState('ready');
  }, []);
  const onError = useCallback(() => setState('error'), []);

  // state starts as 'loading'; retry() resets it before fetching again.
  const retry = useCallback(() => {
    setState('loading');
    fetchZones().then(onData, onError);
  }, [fetchZones, onData, onError]);

  useEffect(() => {
    fetchZones().then(onData, onError);
  }, [fetchZones, onData, onError]);

  return { zones, state, retry };
}
