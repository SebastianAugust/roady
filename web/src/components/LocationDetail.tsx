import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAddress } from '../hooks/useAddress';
import { useApi } from '../hooks/useApi';
import { formatCoords } from '../lib/format';
import { zonaDetail } from '../routes';
import type { Laporan } from '../types';
import { RiskBadge } from './RiskBadge';
import './LocationDetail.css';

interface Props {
  report: Pick<Laporan, 'latitude' | 'longitude' | 'alamat_teks' | 'zona_id'>;
  /** Links the zone to its Detail Zona page (Dishub only; the Admin app has no zone pages, docs/05 #30). */
  zoneLink?: boolean;
}

/**
 * "Lokasi" card of a report: the street address (saved alamat_teks, or looked up from the coordinates when it is empty)
 * with the coordinates small below it, then the zone the report falls in ("Zona 3 (Jl. ...)" with score, category and
 * radius) or "Di luar zona rawan". The zone comes from API-004, which every role may call.
 */
export function LocationDetail({ report: r, zoneLink = false }: Props) {
  const address = useAddress(r);
  const zonaId = r.zona_id;
  const load = useCallback(() => (zonaId === null ? Promise.resolve(undefined) : api.getZone(zonaId)), [zonaId]);
  const { state } = useApi(load);
  const zone = state.status === 'ready' ? state.data : undefined;

  const zoneName = zonaId === null ? null : `Zona ${zonaId}${zone?.lokasi_teks ? ` (${zone.lokasi_teks})` : ''}`;

  return (
    <section className="glass-in detail-card" aria-labelledby="lokasi-title">
      <h2 id="lokasi-title" className="detail-card-title">
        Lokasi
      </h2>
      <p className="location-address">{address.text ?? 'Alamat tidak tersedia'}</p>
      <p className="location-coords">{formatCoords(r.latitude, r.longitude)}</p>

      <div className="location-zone">
        {zonaId === null ? (
          <p className="location-zone-name">Di luar zona rawan</p>
        ) : (
          <>
            <p className="location-zone-name">{zoneLink ? <Link to={zonaDetail(zonaId)}>{zoneName}</Link> : zoneName}</p>
            {state.status === 'loading' ? <p className="muted">Memuat zona…</p> : null}
            {zone ? (
              <dl className="location-zone-info">
                <dt>Skor risiko</dt>
                <dd>{Math.round(zone.skor_risiko)}%</dd>
                <dt>Kategori</dt>
                <dd>
                  <RiskBadge kategori={zone.kategori_risiko} />
                </dd>
                <dt>Radius</dt>
                <dd>{zone.radius_zona} m</dd>
              </dl>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
