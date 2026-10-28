import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { AccidentInfo } from '../components/AccidentInfo';
import { DetailHeader } from '../components/DetailHeader';
import { LoadState } from '../components/LoadState';
import { IncidentMap } from '../components/IncidentMap';
import { useApi } from '../hooks/useApi';
import { formatWib } from '../lib/format';
import { ROUTES } from '../routes';

/**
 * Detail of one official accident in the Dishub archive: the layout of "detail - Kelola data kecelakaan" (map with
 * coordinates, Informasi Kejadian) but read-only. Dishub has no edit or delete here (docs/05 #2, #27); those stay with
 * the Admin. Data: GET /api/dishub/accidents/{id} (usulan, docs/03).
 */
export function ArsipDetailPage() {
  const id = Number(useParams().id);
  const load = useCallback(() => api.getDishubAccident(id), [id]);
  const { state, retry } = useApi(load);

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat data kecelakaan…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  const a = state.data;

  return (
    <article>
      <DetailHeader title={a.lokasi_deskripsi} subtitle={formatWib(a.tanggal_waktu)} backTo={ROUTES.arsip} />
      <div className="detail-body">
        <div>
          <IncidentMap latitude={a.latitude} longitude={a.longitude} zonaId={a.zona_id} className="detail-map" />
          <p className="detail-coords">
            Latitude: {a.latitude}
            <br />
            Longitude: {a.longitude}
          </p>
        </div>
        <div className="detail-cards">
          <AccidentInfo accident={a} zoneLink />
        </div>
      </div>
    </article>
  );
}
