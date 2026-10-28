import { useCallback, useMemo, useState } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { ReportCard } from '../components/ReportCard';
import { ReportDetail } from '../components/ReportDetail';
import { SearchField } from '../components/SearchField';
import { SelectField, type Option } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { BANDUNG_RAYA, ZONES_FETCH_RADIUS_M } from '../config';
import { useApi } from '../hooks/useApi';
import { CUACA_LABEL, KATEGORI_LABEL, STATUS_LABEL, todayIso } from '../lib/format';
import type { Cuaca, Kategori, Laporan, StatusLaporan } from '../types';
import './LaporanPage.css';

// auto_rejected never reaches Dishub (it is a validation trace), so it is not offered as a filter.
const STATUS_OPTIONS: Option<StatusLaporan>[] = (['approved', 'pending_review', 'auto_approved', 'rejected'] as const).map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}));
const KATEGORI_OPTIONS: Option<Kategori>[] = (['kecelakaan', 'near_miss'] as const).map((k) => ({ value: k, label: KATEGORI_LABEL[k] }));
const CUACA_OPTIONS: Option<Cuaca>[] = (['cerah', 'hujan', 'lainnya'] as const).map((c) => ({ value: c, label: CUACA_LABEL[c] }));

/**
 * Figma "dishub - detail laporan" (1025:7378), data from API-012.
 * Zona and the date range go to the API (docs/03 filter usulan); search, Progress, Kejadian and Cuaca (the Figma
 * dropdowns) filter the loaded list in the browser.
 */
export function LaporanPage() {
  const [zona, setZona] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusLaporan | ''>('');
  const [kategori, setKategori] = useState<Kategori | ''>('');
  const [cuaca, setCuaca] = useState<Cuaca | ''>('');
  const [selected, setSelected] = useState<Laporan>();

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

  const loadZones = useCallback(
    () => api.getZones({ lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude, radius: ZONES_FETCH_RADIUS_M }),
    [],
  );
  const { state: zonesState } = useApi(loadZones);
  const zoneOptions = useMemo(
    () =>
      zonesState.status === 'ready'
        ? [...zonesState.data].sort((a, b) => a.zona_id - b.zona_id).map((z) => ({ value: String(z.zona_id), label: `Zona ${z.zona_id}` }))
        : [],
    [zonesState],
  );

  const reports = useMemo(() => {
    if (state.status !== 'ready') return [];
    const q = search.trim().toLowerCase();
    return state.data.filter(
      (r) =>
        (!status || r.status === status) &&
        (!kategori || r.kategori === kategori) &&
        (!cuaca || r.kondisi_cuaca_saat_kejadian === cuaca) &&
        (!q || r.deskripsi.toLowerCase().includes(q) || (r.alamat_teks ?? '').toLowerCase().includes(q)),
    );
  }, [state, search, status, kategori, cuaca]);

  const anyFilter = Boolean(zona || dari || sampai || search || status || kategori || cuaca);
  const reset = () => {
    setZona('');
    setDari('');
    setSampai('');
    setSearch('');
    setStatus('');
    setKategori('');
    setCuaca('');
  };

  return (
    <>
      <PageHeader title="Detail Laporan" subtitle="Pantau dan kelola rekam data kecelakaan yang terintegrasi otomatis dari sistem Dishub" />

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
          <SelectField label="Progress" value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Semua" />
          <SelectField label="Kejadian" value={kategori} onChange={setKategori} options={KATEGORI_OPTIONS} placeholder="Semua" />
          <SelectField label="Cuaca" value={cuaca} onChange={setCuaca} options={CUACA_OPTIONS} placeholder="Semua" />
        </div>
        {anyFilter ? (
          <Button variant="ghost" className="laporan-reset" onClick={reset}>
            Hapus filter
          </Button>
        ) : null}
      </form>

      {state.status === 'loading' ? <LoadState state="loading" message="Memuat laporan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? (
        <>
          <p className="laporan-count" role="status">
            {reports.length} laporan
          </p>
          {reports.length ? (
            <ul className="report-grid">
              {reports.map((r) => (
                <li key={r.id_report}>
                  <ReportCard report={r} onDetail={setSelected} />
                </li>
              ))}
            </ul>
          ) : (
            <LoadState state="empty" message="Tidak ada laporan yang cocok dengan filter." />
          )}
        </>
      ) : null}

      <Dialog open={selected !== undefined} title={selected ? `Laporan #${selected.id_report}` : ''} onClose={() => setSelected(undefined)}>
        {selected ? <ReportDetail report={selected} /> : null}
      </Dialog>
    </>
  );
}
