import { useCallback, useState } from 'react';
import { api } from '../api';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { ScoreHistoryChart } from '../components/ScoreHistoryChart';
import { SelectField } from '../components/SelectField';
import { StatTile } from '../components/StatTile';
import { Tabs } from '../components/Tabs';
import { ZoneMap } from '../components/ZoneMap';
import { ZoneTable } from '../components/ZoneTable';
import { useApi } from '../hooks/useApi';
import { formatCoords, formatDate } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import type { Statistics } from '../types';
import './DashboardPage.css';

/**
 * Figma "dishub - dashboard statistik" (docs/design/dishub/dishub - dashboard statistik.png), data from API-011.
 * Below the four counters, "Tabel | Peta": the zone table (and score history) or the Peta Zona Risiko map, which has
 * no web frame and is not a navbar item (docs/05 #31).
 */
export function DashboardPage() {
  const load = useCallback(() => api.getStatistics(), []);
  const { state, retry } = useApi(load);

  return (
    <>
      <PageHeader title="Statistik Zona" subtitle="Pemetaan tingkat risiko dan sebaran zona rawan lalu lintas" />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat statistik…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? <Dashboard stats={state.data} /> : null}
    </>
  );
}

function Dashboard({ stats }: { stats: Statistics }) {
  const { rekap, total_zona } = stats;
  const [view, setView] = useState<'tabel' | 'peta'>('tabel');

  return (
    <>
      <section className="stat-tiles" aria-label="Rekap zona per kategori">
        <StatTile label="Total Zona Risiko" value={total_zona} />
        <StatTile label="Zona Merah" value={rekap.merah} kategori="merah" />
        <StatTile label="Zona Kuning" value={rekap.kuning} kategori="kuning" />
        <StatTile label="Zona Hijau" value={rekap.hijau} kategori="hijau" />
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
        {view === 'peta' ? <ZoneMap /> : <ZoneTableView stats={stats} />}
      </Tabs>
    </>
  );
}

/** The "Tabel" tab: the Figma zone table, then the score history of one zone (API-011 riwayat_skor). */
function ZoneTableView({ stats }: { stats: Statistics }) {
  const { zona_teratas, riwayat_skor } = stats;
  const [zonaId, setZonaId] = useState(String(zona_teratas[0]?.zona_id ?? ''));
  const history = riwayat_skor.find((r) => String(r.zona_id) === zonaId)?.titik ?? [];
  const zoneName = (id: number) => {
    const z = zona_teratas.find((t) => t.zona_id === id);
    return z ? `Zona ${id} · ${z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude)}` : `Zona ${id}`;
  };

  return (
    <>
      <section aria-labelledby="zona-teratas">
        <h2 id="zona-teratas" className="dashboard-heading">
          Zona dengan skor tertinggi
        </h2>
        {zona_teratas.length ? <ZoneTable zones={zona_teratas} /> : <LoadState state="empty" message="Belum ada zona." />}
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
            options={zona_teratas.map((z) => ({ value: String(z.zona_id), label: zoneName(z.zona_id) }))}
          />
        </div>
        {history.length ? (
          <>
            <ScoreHistoryChart titik={history} label={`Riwayat skor ${zoneName(Number(zonaId))}`} />
            <details className="dashboard-table-toggle">
              <summary>Tampilkan sebagai tabel</summary>
              <table className="dashboard-history-table">
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Skor</th>
                    <th scope="col">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.last_updated}>
                      <td>{formatDate(p.last_updated)}</td>
                      <td>{Math.round(p.skor_risiko)}</td>
                      <td>{RISK_LABEL[p.kategori_risiko]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        ) : (
          <LoadState state="empty" message="Belum ada riwayat skor untuk zona ini." />
        )}
      </section>
    </>
  );
}
