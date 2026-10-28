import { useCallback, useMemo, useState } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { ScoreHistory } from '../components/ScoreHistory';
import { SelectField } from '../components/SelectField';
import { StatTile } from '../components/StatTile';
import { Tabs } from '../components/Tabs';
import { ZoneMap } from '../components/ZoneMap';
import { ZoneTable } from '../components/ZoneTable';
import { useApi } from '../hooks/useApi';
import { formatCoords } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import type { KategoriRisiko, Statistics, ZonaTeratas } from '../types';
import './DashboardPage.css';

const RISK_SHORT: Record<KategoriRisiko, string> = { merah: 'Merah', kuning: 'Kuning', hijau: 'Hijau' };

/**
 * Figma "dishub - dashboard statistik" (docs/design/dishub/dishub - dashboard statistik.png): counters from API-011 and
 * the zone list from GET /api/dishub/zones (usulan). Below the counters, "Tabel | Peta": the zone table (and score
 * history) or the Peta Zona Risiko map, which has no web frame and is not a navbar item (docs/05 #31).
 * The Merah / Kuning / Hijau counters filter the table; Total Zona Risiko clears the filter.
 */
export function DashboardPage() {
  const loadStats = useCallback(() => api.getStatistics(), []);
  const loadZones = useCallback(() => api.getDishubZones(), []);
  const { state: stats, retry: retryStats } = useApi(loadStats);
  const { state: zones, retry: retryZones } = useApi(loadZones);

  return (
    <>
      <PageHeader title="Statistik Zona" subtitle="Pemetaan tingkat risiko dan sebaran zona rawan lalu lintas" />
      {stats.status === 'loading' || zones.status === 'loading' ? <LoadState state="loading" message="Memuat statistik…" /> : null}
      {stats.status === 'error' ? <LoadState state="error" message={stats.message} onRetry={retryStats} /> : null}
      {zones.status === 'error' ? <LoadState state="error" message={zones.message} onRetry={retryZones} /> : null}
      {stats.status === 'ready' && zones.status === 'ready' ? <Dashboard stats={stats.data} zones={zones.data} /> : null}
    </>
  );
}

function Dashboard({ stats, zones }: { stats: Statistics; zones: ZonaTeratas[] }) {
  const { rekap, total_zona } = stats;
  const [view, setView] = useState<'tabel' | 'peta'>('tabel');
  const [kategori, setKategori] = useState<KategoriRisiko | ''>('');
  // Clicking the active counter again clears the filter, the same as Total.
  const pick = (k: KategoriRisiko) => setKategori((current) => (current === k ? '' : k));

  return (
    <>
      <section className="stat-tiles" aria-label="Rekap zona per kategori; pilih kartu untuk memfilter tabel">
        <StatTile label="Total Zona Risiko" value={total_zona} selected={kategori === ''} onSelect={() => setKategori('')} />
        <StatTile label="Zona Merah" value={rekap.merah} kategori="merah" selected={kategori === 'merah'} onSelect={() => pick('merah')} />
        <StatTile label="Zona Kuning" value={rekap.kuning} kategori="kuning" selected={kategori === 'kuning'} onSelect={() => pick('kuning')} />
        <StatTile label="Zona Hijau" value={rekap.hijau} kategori="hijau" selected={kategori === 'hijau'} onSelect={() => pick('hijau')} />
      </section>

      <Tabs
        label="Tampilan zona"
        tabs={[
          { value: 'tabel', label: 'Tabel' },
          { value: 'peta', label: 'Peta' },
        ]}
        value={view}
        onChange={setView}
      >
        {view === 'peta' ? <ZoneMap zones={kategori ? zones.filter((z) => z.kategori_risiko === kategori) : zones} filterLabel={kategori ? `Zona ${RISK_SHORT[kategori]}` : undefined} /> : <ZoneTableView stats={stats} zones={zones} kategori={kategori} onClear={() => setKategori('')} />}
      </Tabs>
    </>
  );
}

/** The "Tabel" tab: the Figma zone table, then the score history of one zone (API-011 riwayat_skor). */
function ZoneTableView({ stats, zones, kategori, onClear }: { stats: Statistics; zones: ZonaTeratas[]; kategori: KategoriRisiko | ''; onClear: () => void }) {
  const { riwayat_skor } = stats;
  const shown = useMemo(() => (kategori ? zones.filter((z) => z.kategori_risiko === kategori) : zones), [zones, kategori]);
  const [zonaId, setZonaId] = useState(String(zones[0]?.zona_id ?? ''));
  const history = riwayat_skor.find((r) => String(r.zona_id) === zonaId)?.titik ?? [];
  const zoneName = (id: number) => {
    const z = zones.find((t) => t.zona_id === id);
    return z ? `Zona ${id} · ${z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude)}` : `Zona ${id}`;
  };

  return (
    <>
      <section aria-labelledby="daftar-zona">
        <div className="dashboard-list-head">
          <h2 id="daftar-zona" className="dashboard-heading">
            Daftar zona
          </h2>
          <p className="dashboard-count" role="status" aria-live="polite">
            {kategori ? `${shown.length} zona ${RISK_LABEL[kategori].toLowerCase()}` : `${shown.length} zona`}
          </p>
          {kategori ? (
            <Button variant="ghost" className="dashboard-clear" onClick={onClear}>
              Hapus filter
            </Button>
          ) : null}
        </div>
        {shown.length ? <ZoneTable zones={shown} /> : <LoadState state="empty" message="Tidak ada zona pada kategori ini." />}
      </section>

      <section aria-labelledby="riwayat-skor" className="dashboard-history glass-in">
        <div className="dashboard-history-head">
          <h2 id="riwayat-skor" className="dashboard-heading">
            Riwayat skor zona
          </h2>
          <SelectField
            label="Zona"
            className="dashboard-zone-select"
            value={zonaId}
            onChange={setZonaId}
            options={zones.map((z) => ({ value: String(z.zona_id), label: zoneName(z.zona_id) }))}
          />
        </div>
        {history.length ? (
          <ScoreHistory titik={history} label={`Riwayat skor ${zoneName(Number(zonaId))}`} />
        ) : (
          <LoadState state="empty" message="Belum ada riwayat skor untuk zona ini." />
        )}
      </section>
    </>
  );
}
