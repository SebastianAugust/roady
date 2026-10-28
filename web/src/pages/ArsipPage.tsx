import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AccidentCard } from '../components/AccidentCard';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useApi } from '../hooks/useApi';
import { ROUTES } from '../routes';

/**
 * Arsip & Input, the archive variant of "dishub - input data resmi" (docs/design/dishub/dishub - input data resmi.png):
 * the official accidents as a card grid and INPUT DATA, which opens the form variant (InputDataPage).
 * The Figma cards have DETAIL, but its target is the "detail - Kelola data kecelakaan" frame, which Dishub must not
 * use (docs/05 #2), so the cards here have no action (docs/05 #21). Data: GET /api/dishub/accidents (usulan).
 */
export function ArsipPage() {
  const load = useCallback(() => api.getDishubAccidents(), []);
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
      {state.status === 'ready' && state.data.length === 0 ? <LoadState state="empty" message="Arsip masih kosong." /> : null}
      {state.status === 'ready' && state.data.length ? (
        <ul className="accident-grid">
          {state.data.map((a) => (
            <li key={a.id_kejadian}>
              <AccidentCard accident={a} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
