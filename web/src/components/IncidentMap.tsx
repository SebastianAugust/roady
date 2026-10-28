import { useCallback } from 'react';
import { api } from '../api';
import { useApi } from '../hooks/useApi';
import { MiniMap } from './MiniMap';

interface Props {
  latitude: number;
  longitude: number;
  /** zona_id of the accident or report; null when it is not in a zone yet. */
  zonaId: number | null;
  className?: string;
}

/**
 * The detail map of one incident (official accident or crowd report, Admin and Dishub): one pin, plus the circle of
 * the zone it belongs to (API-004). The pin shows at once; the circle follows when the zone has loaded, and a zone
 * that cannot be loaded just leaves the pin alone.
 */
export function IncidentMap({ latitude, longitude, zonaId, className }: Props) {
  const load = useCallback(() => (zonaId === null ? Promise.resolve(undefined) : api.getZone(zonaId)), [zonaId]);
  const { state } = useApi(load);
  const zone = state.status === 'ready' ? state.data : undefined;
  return <MiniMap latitude={latitude} longitude={longitude} zone={zone} className={className} />;
}
