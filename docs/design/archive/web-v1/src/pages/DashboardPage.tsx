import { useCallback, useMemo, useState } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { ScoreHistory } from '../components/ScoreHistory';
import { SelectField } from '../components/SelectField';
import { Skeleton } from '../components/Skeleton';
import { StatTile } from '../components/StatTile';
import { StatTilesSkeleton } from '../components/StatTilesSkeleton';
import { Tabs } from '../components/Tabs';
import { ZoneExplorer } from '../components/ZoneExplorer';
import { ZoneTable } from '../components/ZoneTable';
import { EmptyState } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { formatCoords } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import type { KategoriRisiko, Statistics, ZonaTeratas } from '../types';
import './DashboardPage.css';

/** "Zona 3 · Jl. Soekarno Hatta, Buahbatu (Merah, 73%)" for the dropdowns. */
const zoneLabel = (z: ZonaTeratas) =>
  `Zona ${z.zona_id} · ${z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude)} (${RISK_SHORT[z.kategori_risiko]}, ${Math.round(z.skor_risiko)}%)`;

const RISK_SHORT: Record<KategoriRisiko, string> = { merah: 'Merah', kuning: 'Kuning', hijau: 'Hijau' };

/**
 * Statistik Zona (docs/design/prototype-web-v2.html, Dishub), two tabs. "Peta": category chips, the rain switch, the map
 * (Google Maps, or the schematic map without a key) and the zone list and detail on the side (ZoneExplorer). "Tabel":
 * the Figma frame "dishub - dashboard statistik" (docs/design/dishub/dishub - dashboard statistik.png): counters from
 * API-011 that filter the zone table, a zone dropdown, the table, and the score history of one zone.
 */
export function DashboardPage() {
  const loadStats = useCallback(() => api.getStatistics(), []);
  const loadZones = useCallback(() => api.getDishubZones(), []);
  const { state: stats, retry: retryStats } = useApi(loadStats);
  const { state: zones, retry: retryZones } = useApi(loadZones);

  return (
    <>
      <PageHeader title="Statistik Zona" subtitle="Pemetaan tingkat risiko dan sebaran zona rawan lalu lintas" />
      {stats.status === 'loading' || zones.status === 'loading' ? (
        <>
          <StatTilesSkeleton label="Memuat statistik…" />
          <Skeleton width="100%" height={420} radius="var(--radius-card)" />
        </>
      ) : null}
      {stats.status === 'error' ? <LoadState state="error" message={stats.message} onRetry={retryStats} /> : null}
      {zones.status === 'error' ? <LoadState state="error" message={zones.message} onRetry={retryZones} /> : null}
      {stats.status === 'ready' && zones.status === 'ready' ? <Dashboard stats={stats.data} zones={zones.data} /> : null}
    </>
  );
}

function Dashboard({ stats, zones }: { stats: Statistics; zones: ZonaTeratas[] }) {
  const [view, setView] = useState<'peta' | 'tabel'>('peta');
  return (
    <Tabs
      label="Tampilan zona"
      tabs={[
        { value: 'peta', label: 'Peta' },
        { value: 'tabel', label: 'Tabel' },
      ]}
      value={view}
      onChange={setView}
    >
      {view === 'peta' ? <ZoneExplorer zones={zones} stats={stats} /> : <ZoneTableTab stats={stats} zones={zones} />}
    </Tabs>
  );
}

/**
 * The "Tabel" tab. The Merah / Kuning / Hijau counters filter the table; Total Zona Risiko clears the filter. Above the
 * table a zone dropdown ("Semua zona" or one zone) filters it to that zone; picking a zone clears the category filter
 * and the other way round, so the two never contradict each other.
 */
function ZoneTableTab({ stats, zones }: { stats: Statistics; zones: ZonaTeratas[] }) {
  const { rekap, total_zona } = stats;
  const [kategori, setKategori] = useState<KategoriRisiko | ''>('');
  const [zonaFilter, setZonaFilter] = useState('');
  // Clicking the active counter again clears the filter, the same as Total. A category filter drops the zone filter.
  const pick = (k: KategoriRisiko) => {
    setZonaFilter('');
    setKategori((current) => (current === k ? '' : k));
  };
  const clearAll = () => {
    setKategori('');
    setZonaFilter('');
  };
  const selectedId = zonaFilter ? Number(zonaFilter) : undefined;
  const shown = useMemo(() => {
    if (selectedId !== undefined) return zones.filter((z) => z.zona_id === selectedId);
    return kategori ? zones.filter((z) => z.kategori_risiko === kategori) : zones;
  }, [zones, kategori, selectedId]);
  const zoneOptions = useMemo(() => [...zones].sort((a, b) => a.zona_id - b.zona_id).map((z) => ({ value: String(z.zona_id), label: zoneLabel(z) })), [zones]);

  return (
    <>
      <section className="stat-tiles" aria-label="Rekap zona per kategori; pilih kartu untuk memfilter tabel">
        <StatTile label="Total Zona Risiko" value={total_zona} selected={kategori === ''} onSelect={clearAll} />
        <StatTile label="Zona Merah" value={rekap.merah} kategori="merah" selected={kategori === 'merah'} onSelect={() => pick('merah')} />
        <StatTile label="Zona Kuning" value={rekap.kuning} kategori="kuning" selected={kategori === 'kuning'} onSelect={() => pick('kuning')} />
        <StatTile label="Zona Hijau" value={rekap.hijau} kategori="hijau" selected={kategori === 'hijau'} onSelect={() => pick('hijau')} />
      </section>

      <SelectField
        label="Pilih zona"
        className="dashboard-zone-filter"
        placeholder="Semua zona"
        value={zonaFilter}
        options={zoneOptions}
        onChange={(v) => {
          setZonaFilter(v);
          setKategori('');
        }}
      />

      <ZoneTableView stats={stats} zones={zones} shown={shown} kategori={kategori} selectedId={selectedId} onClear={clearAll} />
    </>
  );
}

interface TableViewProps {
  stats: Statistics;
  /** Every zone (for the names in the history picker). */
  zones: ZonaTeratas[];
  /** The zones the table shows after the category or zone filter. */
  shown: ZonaTeratas[];
  kategori: KategoriRisiko | '';
  selectedId: number | undefined;
  onClear: () => void;
}

/** The zone table, then the score history of one zone (API-011 riwayat_skor); a picked zone also picks the history. */
function ZoneTableView({ stats, zones, shown, kategori, selectedId, onClear }: TableViewProps) {
  const { riwayat_skor } = stats;
  const [historyZona, setHistoryZona] = useState(String(zones[0]?.zona_id ?? ''));
  const zonaId = selectedId !== undefined ? String(selectedId) : historyZona;
  const history = riwayat_skor.find((r) => String(r.zona_id) === zonaId)?.titik ?? [];
  const zoneName = (id: number) => {
    const z = zones.find((t) => t.zona_id === id);
    return z ? zoneLabel(z) : `Zona ${id}`;
  };

  return (
    <>
      <section aria-labelledby="daftar-zona">
        <div className="dashboard-list-head">
          <h2 id="daftar-zona" className="dashboard-heading">
            Daftar zona
          </h2>
          <p className="dashboard-count" role="status" aria-live="polite">
            {selectedId !== undefined ? `Zona ${selectedId}` : kategori ? `${shown.length} zona ${RISK_LABEL[kategori].toLowerCase()}` : `${shown.length} zona`}
          </p>
          {kategori || selectedId !== undefined ? (
            <Button variant="ghost" className="dashboard-clear" onClick={onClear}>
              Hapus filter
            </Button>
          ) : null}
        </div>
        {shown.length ? (
          <ZoneTable zones={shown} />
        ) : (
          <EmptyState
            title="Tidak ada zona yang cocok"
            description="Coba kategori lain atau hapus filter untuk melihat semua zona."
            action={{ label: 'Hapus filter', onClick: onClear }}
          />
        )}
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
            onChange={setHistoryZona}
            disabled={selectedId !== undefined}
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
