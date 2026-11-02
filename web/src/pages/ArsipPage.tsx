import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AccidentsTable } from '../components/AccidentsTable';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { QuickInputForm } from '../components/QuickInputForm';
import { TableSkeleton } from '../components/TableSkeleton';
import { EmptyState } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { PER_PAGE } from '../lib/accidentFilters';
import { arsipDetail, ROUTES } from '../routes';

/**
 * Arsip & Input (docs/design/prototype-web-v2.html, Dishub): the quick entry form on top and the archive of official
 * accidents under it. Dishub can only add: the table has no edit and no delete, and each row opens a read-only detail
 * (ArsipDetailPage). The full template form (kecelakaan, nyaris celaka, masalah jalan, with photo) is one click away.
 * Data: GET /api/dishub/accidents (usulan) and API-010.
 */
export function ArsipPage() {
  const [halaman, setHalaman] = useState(1);
  // A saved entry bumps this, which reloads the table (page 1, newest first, so the new row is on top).
  const [version, setVersion] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` is only a reload trigger, it is not read inside
  const load = useCallback(() => api.getDishubAccidents({ halaman, per_halaman: PER_PAGE, urut: 'terbaru' }), [halaman, version]);
  const { state, retry } = useApi(load);

  return (
    <>
      <PageHeader
        title="Arsip & Input"
        subtitle="Tambahkan rekam kecelakaan baru, lalu tinjau arsip data resmi di bawahnya"
        actions={
          <Link to={ROUTES.arsipInput} className="btn btn-secondary">
            FORM LENGKAP
          </Link>
        }
      />

      <QuickInputForm
        onSaved={() => {
          setHalaman(1);
          setVersion((v) => v + 1);
        }}
      />

      <h2 className="arsip-heading">Arsip data kecelakaan</h2>
      {state.status === 'loading' ? <TableSkeleton columns={5} label="Memuat arsip…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && state.data.data.length === 0 ? (
        <div className="glass-in" style={{ borderRadius: 'var(--radius-card)' }}>
          <EmptyState title="Arsip masih kosong" description="Isi formulir di atas untuk menambahkan data kecelakaan pertama." />
        </div>
      ) : null}
      {state.status === 'ready' && state.data.data.length ? (
        <>
          <AccidentsTable rows={state.data.data} detailTo={arsipDetail} />
          <Pagination page={state.data.halaman} pageCount={Math.ceil(state.data.total / state.data.per_halaman)} onChange={setHalaman} />
        </>
      ) : null}
    </>
  );
}
