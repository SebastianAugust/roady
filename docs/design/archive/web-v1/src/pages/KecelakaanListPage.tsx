import { useCallback, useMemo, useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { AccidentEditDrawer } from '../components/AccidentEditDrawer';
import { AccidentFilterBar } from '../components/AccidentFilterBar';
import { AccidentsTable } from '../components/AccidentsTable';
import { DeletedAccidents } from '../components/DeletedAccidents';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { Tabs } from '../components/Tabs';
import { TableSkeleton } from '../components/TableSkeleton';
import { EmptyState, useToast } from '../components/ui';
import { errorMessage, useApi } from '../hooks/useApi';
import { useDebounced } from '../hooks/useDebounced';
import { useZoneOptions } from '../hooks/useZoneOptions';
import { filterErrors, hasFilters, NO_FILTERS, PER_PAGE, toQuery, type AccidentFilters } from '../lib/accidentFilters';
import type { KecelakaanResmi } from '../types';

type View = 'aktif' | 'terhapus';

/**
 * Kelola Data Kecelakaan (docs/design/prototype-web-v2.html, Admin): a table (tanggal, lokasi, cuaca, korban, sumber) under a
 * filter bar and with paging; Ubah opens a drawer, Hapus deletes at once and offers "Urungkan". Two tabs: Data Kecelakaan and Riwayat Penghapusan (soft-deleted rows, read-only).
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

/** The reason stored with a deletion made from the list (API-009 DELETE needs one); the detail page asks for a written one. */
const LIST_DELETE_REASON = 'Dihapus dari daftar Kelola Data Kecelakaan';

function ActiveAccidents() {
  const { signOut } = useAuth();
  const toast = useToast();
  // Changes made on this page are applied here at once instead of reloading the table: deleted rows are hidden, edited
  // rows replaced. A reload (filter, page) reads the same state from the server.
  const [removed, setRemoved] = useState<ReadonlySet<number>>(new Set());
  const [edited, setEdited] = useState<Record<number, KecelakaanResmi>>({});
  const [editing, setEditing] = useState<KecelakaanResmi>();
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

  const rows = useMemo(() => (state.status === 'ready' ? state.data.data.filter((a) => !removed.has(a.id_kejadian)).map((a) => edited[a.id_kejadian] ?? a) : []), [state, removed, edited]);
  const hiddenHere = state.status === 'ready' ? state.data.data.length - rows.length : 0;
  const total = state.status === 'ready' ? state.data.total - hiddenHere : undefined;

  const failed = (err: unknown) => (err instanceof ApiError && err.status === 401 ? signOut() : toast(errorMessage(err)));

  async function restore(a: KecelakaanResmi) {
    try {
      await api.restoreAccident(a.id_kejadian);
      setRemoved((r) => new Set([...r].filter((id) => id !== a.id_kejadian)));
      toast('Data kecelakaan dikembalikan.');
    } catch (err) {
      failed(err);
    }
  }

  async function remove(a: KecelakaanResmi) {
    try {
      await api.deleteAccident(a.id_kejadian, { alasan: LIST_DELETE_REASON });
      setRemoved((r) => new Set(r).add(a.id_kejadian));
      toast(`Data "${a.lokasi_deskripsi}" dihapus.`, { undo: () => void restore(a) });
    } catch (err) {
      failed(err);
    }
  }

  return (
    <>
      <AccidentFilterBar filters={filters} onChange={change} zoneOptions={zoneOptions} inputterOptions={inputterOptions} total={total} />
      {state.status === 'loading' ? <TableSkeleton columns={6} label="Memuat data kecelakaan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && rows.length === 0 ? (
        <div className="glass-in" style={{ borderRadius: 'var(--radius-card)' }}>
          <EmptyState
            title={hasFilters(filters) ? 'Tidak ada data yang cocok' : 'Belum ada data kecelakaan'}
            description={hasFilters(filters) ? 'Ubah atau hapus filter untuk melihat data lain.' : 'Data kecelakaan resmi yang dimasukkan Dishub akan muncul di sini.'}
          />
        </div>
      ) : null}
      {state.status === 'ready' && rows.length ? (
        <>
          <AccidentsTable rows={rows} onEdit={setEditing} onDelete={(a) => void remove(a)} />
          <Pagination
            page={state.data.halaman}
            pageCount={Math.ceil(state.data.total / (state.data.per_halaman || PER_PAGE))}
            onChange={(halaman) => change({ halaman })}
          />
        </>
      ) : null}
      <AccidentEditDrawer
        accident={editing}
        onClose={() => setEditing(undefined)}
        onSaved={(saved) => {
          setEdited((e) => ({ ...e, [saved.id_kejadian]: saved }));
          setEditing(undefined);
        }}
      />
    </>
  );
}
