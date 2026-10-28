import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AccidentCard } from '../components/AccidentCard';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { useApi } from '../hooks/useApi';
import { PER_PAGE } from '../lib/accidentFilters';
import { arsipDetail, ROUTES } from '../routes';

/**
 * Arsip & Input, the archive variant of "dishub - input data resmi" (docs/design/dishub/dishub - input data resmi.png):
 * the official accidents as a card grid and INPUT DATA, which opens the form variant (InputDataPage). Each card has
 * DETAIL and opens a read-only detail (ArsipDetailPage); Dishub can neither edit nor delete. A card also shows who
 * entered it: input_by comes from the signed-in account, never from the form (API-010).
 * Data: GET /api/dishub/accidents (usulan).
 */
export function ArsipPage() {
  const [halaman, setHalaman] = useState(1);
  const load = useCallback(() => api.getDishubAccidents({ halaman, per_halaman: PER_PAGE }), [halaman]);
  const { state, retry } = useApi(load);

  return (
    <>
      <PageHeader
        title="Arsip & Input"
        subtitle="Tinjau kelengkapan arsip data di bawah ini, atau tambahkan rekam kecelakaan baru ke dalam sistem"
        actions={
          <Link to={ROUTES.arsipInput} className="btn btn-primary">
            INPUT DATA
          </Link>
        }
      />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat arsip…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && state.data.data.length === 0 ? <LoadState state="empty" message="Arsip masih kosong." /> : null}
      {state.status === 'ready' && state.data.data.length ? (
        <>
          <ul className="accident-grid">
            {state.data.data.map((a) => (
              <li key={a.id_kejadian}>
                <AccidentCard accident={a} to={arsipDetail(a.id_kejadian)} showInputter />
              </li>
            ))}
          </ul>
          <Pagination page={state.data.halaman} pageCount={Math.ceil(state.data.total / state.data.per_halaman)} onChange={setHalaman} />
        </>
      ) : null}
    </>
  );
}
