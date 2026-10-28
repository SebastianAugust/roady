import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { DetailHeader } from '../components/DetailHeader';
import { LoadState } from '../components/LoadState';
import { IncidentMap } from '../components/IncidentMap';
import { StatusPill } from '../components/StatusPill';
import { useApi } from '../hooks/useApi';
import { CUACA_LABEL, formatCoords, formatDate, formatDateTime, KATEGORI_LABEL, placeText } from '../lib/format';
import { ROUTES, zonaDetail } from '../routes';
import './LaporanDetailPage.css';

/**
 * Detail of one crowd report for Dishub (replaces the DETAIL dialog of Detail Laporan). Built only from Laporan, which
 * has no reporter identity (NFR-006). The photo is for the Admin's review, so here it only says whether one exists.
 * Data: GET /api/dishub/reports/{id} (usulan, docs/03).
 */
export function LaporanDetailPage() {
  const id = Number(useParams().id);
  const load = useCallback(() => api.getDishubReport(id), [id]);
  const { state, retry } = useApi(load);

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat laporan…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  const r = state.data;

  return (
    <article aria-labelledby="laporan-title">
      <DetailHeader
        title={placeText(r)}
        subtitle={`Laporan #${r.id_report} · ${formatDate(r.tanggal_kejadian)}`}
        backTo={ROUTES.laporan}
        aside={
          <>
            <span className="muted">Status:</span>
            <StatusPill status={r.status} />
          </>
        }
      />
      <div className="detail-body">
        <div>
          <IncidentMap latitude={r.latitude} longitude={r.longitude} zonaId={r.zona_id} className="detail-map" />
          <p className="detail-coords">
            Latitude: {r.latitude}
            <br />
            Longitude: {r.longitude}
          </p>
        </div>
        <div className="detail-cards">
          <section className="glass-in detail-card" aria-labelledby="info-title">
            <h2 id="info-title" className="detail-card-title">
              Informasi Laporan
            </h2>
            <dl className="laporan-info">
              <div>
                <dt>Kejadian:</dt>
                <dd>{KATEGORI_LABEL[r.kategori]}</dd>
              </div>
              <div>
                <dt>Kondisi Cuaca:</dt>
                <dd>{CUACA_LABEL[r.kondisi_cuaca_saat_kejadian]}</dd>
              </div>
              <div>
                <dt>Tanggal kejadian:</dt>
                <dd>{formatDate(r.tanggal_kejadian)}</dd>
              </div>
              <div>
                <dt>Dikirim:</dt>
                <dd>{formatDateTime(r.timestamp)}</dd>
              </div>
              <div>
                <dt>Zona:</dt>
                <dd>{r.zona_id === null ? '-' : <Link to={zonaDetail(r.zona_id)}>Zona {r.zona_id}</Link>}</dd>
              </div>
              <div>
                <dt>Koordinat:</dt>
                <dd>{formatCoords(r.latitude, r.longitude)}</dd>
              </div>
              <div>
                <dt>Foto:</dt>
                <dd>{r.foto_url ? 'Ada (ditinjau Admin)' : 'Tidak ada'}</dd>
              </div>
            </dl>
          </section>
          <section className="glass-in detail-card" aria-labelledby="desk-title">
            <h2 id="desk-title" className="detail-card-title">
              Deskripsi
            </h2>
            <p>{r.deskripsi}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
