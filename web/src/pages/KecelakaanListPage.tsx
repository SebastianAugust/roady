import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AccidentCard } from '../components/AccidentCard';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useApi } from '../hooks/useApi';
import { kecelakaanDetail } from '../routes';

/**
 * Figma "Kelola data kecelakaan" (docs/design/admin/Kelola data kecelakaan.png): a grid of cards with DETAIL. Admin only.
 * The list comes from GET /api/admin/accidents (usulan; API-009 has PUT/DELETE only).
 */
export function KecelakaanListPage() {
  const load = useCallback(() => api.getAccidents(), []);
  const { state, retry } = useApi(load);

  return (
    <>
      <PageHeader title="Kelola Data Kecelakaan" subtitle="Pantau dan kelola rekam data kecelakaan yang terintegrasi otomatis dari sistem Dishub" />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat data kecelakaan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && state.data.length === 0 ? <LoadState state="empty" message="Belum ada data kecelakaan resmi." /> : null}
      {state.status === 'ready' && state.data.length ? (
        <ul className="accident-grid">
          {state.data.map((a) => (
            <li key={a.id_kejadian}>
              <AccidentCard
                accident={a}
                action={
                  <Link to={kecelakaanDetail(a.id_kejadian)} className="btn btn-primary btn-sm" aria-label={`Detail kecelakaan ${a.lokasi_deskripsi}`}>
                    DETAIL
                  </Link>
                }
              />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
