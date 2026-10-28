import { useCallback } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { api } from '../api';
import { BANDUNG_RAYA, MAP_TILES, ZONES_FETCH_RADIUS_M } from '../config';
import { useApi } from '../hooks/useApi';
import { formatDateTime } from '../lib/format';
import { RISK_COLOR, RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { colors } from '../theme/tokens';
import { LoadState } from './LoadState';
import { RiskDot } from './RiskDot';
import './ZoneMap.css';

const CENTER: [number, number] = [BANDUNG_RAYA.center.latitude, BANDUNG_RAYA.center.longitude];
const MARKER_RADIUS_PX = 9;

/**
 * Peta Zona Risiko, the "Peta" tab of Statistik Zona (Dishub only; no web frame in Figma, adapted from the mobile Peta
 * 1032:5391): a dark map card, a glass legend, one white-edged risk dot per zone, details in a popup on click.
 */
export function ZoneMap() {
  const load = useCallback(
    () => api.getZones({ lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude, radius: ZONES_FETCH_RADIUS_M }),
    [],
  );
  const { state, retry } = useApi(load);
  const zones = state.status === 'ready' ? state.data : [];

  return (
    <section className="peta-card" aria-label="Peta zona risiko">
      <MapContainer center={CENTER} zoom={12} minZoom={10} className="peta-map" scrollWheelZoom>
        <TileLayer url={MAP_TILES.url} attribution={MAP_TILES.attribution} subdomains={MAP_TILES.subdomains} maxZoom={MAP_TILES.maxZoom} />
        {zones.map((z) => (
          <CircleMarker
            key={z.zona_id}
            center={[z.center_latitude, z.center_longitude]}
            radius={MARKER_RADIUS_PX}
            pathOptions={{ color: colors.white, weight: 1.5, fillColor: RISK_COLOR[z.kategori_risiko], fillOpacity: 1 }}
          >
            <Popup>
              <div className="zone-popup">
                <p className="zone-popup-title">Zona {z.zona_id}</p>
                <p className="risk-label">
                  <RiskDot kategori={z.kategori_risiko} />
                  {RISK_LABEL[z.kategori_risiko]}
                </p>
                <dl>
                  <dt>Skor risiko</dt>
                  <dd>{Math.round(z.skor_risiko)}</dd>
                  <dt>Jumlah kejadian</dt>
                  <dd>{z.jumlah_kejadian}</dd>
                  <dt>Dipengaruhi hujan</dt>
                  <dd>{z.weather_dependent ? 'Ya' : 'Tidak'}</dd>
                  <dt>Diperbarui</dt>
                  <dd>{formatDateTime(z.last_updated)}</dd>
                </dl>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <ul className="peta-legend" aria-label="Legenda">
        {RISK_ORDER.map((k) => (
          <li key={k} className="risk-label">
            <RiskDot kategori={k} />
            {RISK_LABEL[k]}
          </li>
        ))}
      </ul>

      {state.status !== 'ready' || zones.length === 0 ? (
        <div className="peta-status">
          {state.status === 'loading' ? <LoadState state="loading" message="Memuat zona risiko…" /> : null}
          {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
          {state.status === 'ready' ? <LoadState state="empty" message="Belum ada zona risiko di area ini." /> : null}
        </div>
      ) : null}
    </section>
  );
}
