import { useCallback, useMemo, useState } from 'react';
import { api } from '../api';
import { AccidentCard } from '../components/AccidentCard';
import { AccidentFilterBar } from '../components/AccidentFilterBar';
import { DeletedAccidents } from '../components/DeletedAccidents';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { Tabs } from '../components/Tabs';
import { useApi } from '../hooks/useApi';
import { useDebounced } from '../hooks/useDebounced';
import { useZoneOptions } from '../hooks/useZoneOptions';
import { filterErrors, hasFilters, NO_FILTERS, PER_PAGE, toQuery, type AccidentFilters } from '../lib/accidentFilters';
import { kecelakaanDetail } from '../routes';

type View = 'aktif' | 'terhapus';

/**
 * Figma "Kelola data kecelakaan" (docs/design/admin/Kelola data kecelakaan.png): the card grid with DETAIL, now under a
 * filter bar and with paging. Two tabs: Data Kecelakaan and Riwayat Penghapusan (soft-deleted rows, read-only).
 * Admin only. Data: GET /api/admin/accidents and /deleted (usulan, docs/03).
 */
export function KecelakaanListPage() {
  const [view, setView] = useState<View>('aktif');
  return (
    <>
      <PageHeader title="Kelola Data Kecelakaan" subtitle="Pantau dan kelola rekam data kecelakaan yang terintegrasi otomatis dari sistem Dishub" />
      <Tabs
        label="Data kecelakaan"
        tabs={[
          { value: 'aktif', label: 'Data Kecelakaan' },
          { value: 'terhapus', label: 'Riwayat Penghapusan' },
        ]}
        value={view}
        onChange={setView}
      >
        {view === 'aktif' ? <ActiveAccidents /> : <DeletedAccidents />}
      </Tabs>
    </>
  );
}

function ActiveAccidents() {
  const [filters, setFilters] = useState<AccidentFilters>(NO_FILTERS);
  // Any change to a filter goes back to page 1; only the pager keeps the page it sets.
  const change = useCallback((patch: Partial<AccidentFilters>) => setFilters((f) => ({ ...f, ...patch, halaman: patch.halaman ?? 1 })), []);

  // Typing is sent after a short pause. Filters the API would answer with 422 (a reversed range) keep the last valid request.
  const debounced = useDebounced(filters);
  const [applied, setApplied] = useState(() => toQuery(NO_FILTERS));
  if (Object.keys(filterErrors(debounced)).length === 0) {
    const next = toQuery(debounced);
    if (JSON.stringify(next) !== JSON.stringify(applied)) setApplied(next);
  }

  const load = useCallback(() => api.getAccidents(applied), [applied]);
  const { state, retry } = useApi(load);

  // Everyone who entered data, for the "Diinput oleh" dropdown (the first 100 rows are enough for the few staff accounts).
  const loadAll = useCallback(() => api.getAccidents({ per_halaman: 100 }), []);
  const { state: allState } = useApi(loadAll);
  const inputterOptions = useMemo(() => {
    if (allState.status !== 'ready') return [];
    const byKode = new Map(allState.data.data.map((a) => [a.input_by_kode, a.input_by_nama]));
    return [...byKode].sort(([a], [b]) => a.localeCompare(b)).map(([kode, nama]) => ({ value: kode, label: `${kode} · ${nama}` }));
  }, [allState]);
  const zoneOptions = useZoneOptions();

  const total = state.status === 'ready' ? state.data.total : undefined;
  return (
    <>
      <AccidentFilterBar filters={filters} onChange={change} zoneOptions={zoneOptions} inputterOptions={inputterOptions} total={total} />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat data kecelakaan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && state.data.data.length === 0 ? (
        <LoadState state="empty" message={hasFilters(filters) ? 'Tidak ada data kecelakaan yang cocok dengan filter.' : 'Belum ada data kecelakaan resmi.'} />
      ) : null}
      {state.status === 'ready' && state.data.data.length ? (
        <>
          <ul className="accident-grid">
            {state.data.data.map((a) => (
              <li key={a.id_kejadian}>
                <AccidentCard accident={a} to={kecelakaanDetail(a.id_kejadian)} />
              </li>
            ))}
          </ul>
          <Pagination
            page={state.data.halaman}
            pageCount={Math.ceil(state.data.total / (state.data.per_halaman || PER_PAGE))}
            onChange={(halaman) => change({ halaman })}
          />
        </>
      ) : null}
    </>
  );
}
