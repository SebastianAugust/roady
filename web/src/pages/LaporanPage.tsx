import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { ReportDrawer } from '../components/ReportDrawer';
import { SearchField } from '../components/SearchField';
import { SelectField, type Option } from '../components/SelectField';
import { StatusPill } from '../components/StatusPill';
import { TableSkeleton } from '../components/TableSkeleton';
import { TextField } from '../components/TextField';
import { Chip, EmptyState } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { useZoneOptions } from '../hooks/useZoneOptions';
import { CUACA_LABEL, formatDate, KATEGORI_LABEL, placeText, todayIso } from '../lib/format';
import type { Cuaca, Kategori, Laporan, StatusLaporan } from '../types';
import '../components/DataTable.css';
import './LaporanPage.css';

// auto_rejected never reaches Dishub (it is a validation trace), so it has no chip. "Otomatis" is auto_approved
// (no photo, weight 0,5).
type StatusFilter = StatusLaporan | 'semua';
const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'pending_review', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'auto_approved', label: 'Otomatis' },
  { value: 'rejected', label: 'Ditolak' },
];
const KATEGORI_OPTIONS: Option<Kategori>[] = (['kecelakaan', 'near_miss'] as const).map((k) => ({ value: k, label: KATEGORI_LABEL[k] }));
const CUACA_OPTIONS: Option<Cuaca>[] = (['cerah', 'hujan', 'lainnya'] as const).map((c) => ({ value: c, label: CUACA_LABEL[c] }));

/**
 * Detail Laporan (docs/design/prototype-web-v2.html, Dishub; data from API-012): a read-only table of the crowd reports
 * with status chips (Semua, Menunggu, Disetujui, Otomatis, Ditolak). A click on a row, or Enter on a focused row, opens
 * the report in a drawer. Zona and the date range go to the API (docs/03 filter usulan); search, Kejadian and Cuaca
 * filter the loaded list in the browser. Dishub cannot change a report here.
 */
export function LaporanPage() {
  const [zona, setZona] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('semua');
  const [kategori, setKategori] = useState<Kategori | ''>('');
  const [cuaca, setCuaca] = useState<Cuaca | ''>('');
  const [open, setOpen] = useState<Laporan>();

  const rangeError = dari && sampai && dari > sampai ? 'Tanggal akhir harus sama atau setelah tanggal awal.' : undefined;
  // An invalid range keeps the last valid request instead of sending one the API would answer with 422.
  const [applied, setApplied] = useState({ zona: '', dari: '', sampai: '' });
  if (!rangeError && (applied.zona !== zona || applied.dari !== dari || applied.sampai !== sampai)) {
    setApplied({ zona, dari, sampai });
  }

  const loadReports = useCallback(
    () =>
      api.getDishubReports({
        zona_id: applied.zona ? Number(applied.zona) : undefined,
        dari: applied.dari || undefined,
        sampai: applied.sampai || undefined,
      }),
    [applied],
  );
  const { state, retry } = useApi(loadReports);

  const zoneOptions = useZoneOptions();

  // Everything but the status, so each chip can show how many reports it would list.
  const base = useMemo(() => {
    if (state.status !== 'ready') return [];
    const q = search.trim().toLowerCase();
    return state.data.filter(
      (r) =>
        (!kategori || r.kategori === kategori) &&
        (!cuaca || r.kondisi_cuaca_saat_kejadian === cuaca) &&
        (!q || r.deskripsi.toLowerCase().includes(q) || (r.alamat_teks ?? '').toLowerCase().includes(q)),
    );
  }, [state, search, kategori, cuaca]);
  const countOf = (s: StatusFilter) => (s === 'semua' ? base.length : base.filter((r) => r.status === s).length);
  const reports = useMemo(() => (status === 'semua' ? base : base.filter((r) => r.status === status)), [base, status]);

  const anyFilter = Boolean(zona || dari || sampai || search || status !== 'semua' || kategori || cuaca);
  const reset = () => {
    setZona('');
    setDari('');
    setSampai('');
    setSearch('');
    setStatus('semua');
    setKategori('');
    setCuaca('');
  };

  const onRowKey = (r: Laporan) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(r);
    }
  };

  return (
    <>
      <PageHeader title="Detail Laporan" subtitle="Pantau laporan kejadian dari warga beserta status verifikasinya" />

      <form className="laporan-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <SearchField
          className="laporan-search"
          aria-label="Cari deskripsi atau lokasi"
          placeholder="Cari deskripsi atau lokasi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="laporan-filter-row">
          <SelectField label="Zona" value={zona} onChange={setZona} options={zoneOptions} placeholder="Semua zona" />
          <TextField label="Dari tanggal" type="date" value={dari} max={sampai || todayIso()} onChange={(e) => setDari(e.target.value)} />
          <TextField
            label="Sampai tanggal"
            type="date"
            value={sampai}
            min={dari || undefined}
            max={todayIso()}
            onChange={(e) => setSampai(e.target.value)}
            error={rangeError}
          />
          <SelectField label="Kejadian" value={kategori} onChange={setKategori} options={KATEGORI_OPTIONS} placeholder="Semua" />
          <SelectField label="Cuaca" value={cuaca} onChange={setCuaca} options={CUACA_OPTIONS} placeholder="Semua" />
        </div>
        {anyFilter ? (
          <Button variant="ghost" className="laporan-reset" onClick={reset}>
            Hapus filter
          </Button>
        ) : null}
      </form>

      {state.status === 'loading' ? <TableSkeleton columns={6} label="Memuat laporan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? (
        <>
          <div className="laporan-chips" role="group" aria-label="Filter status laporan">
            {STATUS_CHIPS.map((c) => (
              <Chip key={c.value} pressed={status === c.value} onClick={() => setStatus(c.value)}>
                {c.label} ({countOf(c.value)})
              </Chip>
            ))}
          </div>
          <p className="laporan-count" role="status">
            {reports.length} laporan
          </p>
          {reports.length ? (
            <div className="data-table-card glass">
              <table className="data-table">
                <caption className="visually-hidden">Laporan dari warga; pilih baris atau tekan Enter untuk membuka detailnya</caption>
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Lokasi</th>
                    <th scope="col">Kejadian</th>
                    <th scope="col">Cuaca</th>
                    <th scope="col">Foto</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody className="rise-rows">
                  {reports.map((r) => (
                    <tr
                      key={r.id_report}
                      className="is-clickable"
                      tabIndex={0}
                      aria-haspopup="dialog"
                      aria-label={`Laporan #${r.id_report}, ${placeText(r)}. Tekan Enter untuk membuka detail.`}
                      onClick={() => setOpen(r)}
                      onKeyDown={onRowKey(r)}
                    >
                      <td>{formatDate(r.tanggal_kejadian)}</td>
                      <th scope="row">{placeText(r)}</th>
                      <td>{KATEGORI_LABEL[r.kategori]}</td>
                      <td>{CUACA_LABEL[r.kondisi_cuaca_saat_kejadian]}</td>
                      <td>{r.foto_url ? 'Ada' : <span className="data-who-name">Tidak ada</span>}</td>
                      <td>
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-in" style={{ borderRadius: 'var(--radius-card)' }}>
              <EmptyState
                title="Tidak ada laporan"
                description="Tidak ada laporan yang cocok dengan filter ini."
                action={anyFilter ? { label: 'Hapus filter', onClick: reset } : undefined}
              />
            </div>
          )}
        </>
      ) : null}

      <ReportDrawer report={open} onClose={() => setOpen(undefined)} />
    </>
  );
}
