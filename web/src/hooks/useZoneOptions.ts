import { useCallback, useMemo } from 'react';
import { api } from '../api';
import type { Option } from '../components/SelectField';
import { BANDUNG_RAYA, ZONES_FETCH_RADIUS_M } from '../config';
import { useApi } from './useApi';

/** "Zona N" options for a zone dropdown, from API-003 over all of Bandung Raya (empty until loaded). */
export function useZoneOptions(): Option<string>[] {
  const load = useCallback(
    () => api.getZones({ lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude, radius: ZONES_FETCH_RADIUS_M }),
    [],
  );
  const { state } = useApi(load);
  return useMemo(
    () =>
      state.status === 'ready'
        ? [...state.data].sort((a, b) => a.zona_id - b.zona_id).map((z) => ({ value: String(z.zona_id), label: `Zona ${z.zona_id}` }))
        : [],
    [state],
  );
}
