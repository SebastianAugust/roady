import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { LoadState } from '../components/LoadState';
import { MenuCard } from '../components/MenuCard';
import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { Skeleton } from '../components/Skeleton';
import { StatTilesSkeleton } from '../components/StatTilesSkeleton';
import { WeatherCard } from '../components/WeatherCard';
import { WeekBars } from '../components/WeekBars';
import { EmptyState } from '../components/ui';
import { APP_NAME } from '../constants';
import { useApi } from '../hooks/useApi';
import { todayIso } from '../lib/format';
import { useRainSimulation } from '../lib/rainSimulation';
import { viewZones } from '../lib/zoneRisk';
import { ROUTES, zonaDetail } from '../routes';
import type { Laporan, Statistics, ZonaTeratas } from '../types';
import '../components/Dashboard.css';

const TOP_ZONES = 4;
const reportDay = (r: Laporan) => r.tanggal_kejadian;

/**
 * Beranda of Dishub (docs/design/prototype-web-v2.html): three counters, the weather card with the global "Simulasi
 * hujan" switch, reports of the last 7 days, and the 4 most dangerous zones with their score. Scores follow the rain
 * simulation (lib/zoneRisk.ts). Data: API-011 statistics, the zone list and API-012 reports, none of it naming a reporter.
 * Above them, the menu cards of prototype-web-cards.html with a count pill each, taken from the data the page behind the
 * card shows: red zones (with the rain simulation, as Statistik Zona), the archive total, the reports of Detail Laporan.
 */
export function DishubHome() {
  const loadStats = useCallback(() => api.getStatistics(), []);
  const loadZones = useCallback(() => api.getDishubZones(), []);
  const loadReports = useCallback(() => api.getDishubReports({}), []);
  const { state: stats, retry: retryStats } = useApi(loadStats);
  const { state: zones, retry: retryZones } = useApi(loadZones);
  const { state: reports, retry: retryReports } = useApi(loadReports);
  const loadArchive = useCallback(() => api.getDishubAccidents({ per_halaman: 1 }), []);
  const { state: archive } = useApi(loadArchive);
  const [rain] = useRainSimulation();
  const redZones = useMemo(
    () =>
      stats.status === 'ready' && zones.status === 'ready'
        ? viewZones(zones.data, stats.data.riwayat_skor, rain).filter((v) => v.kategori === 'merah').length
        : undefined,
    [stats, zones, rain],
  );

  const failed = [
    { s: stats, retry: retryStats },
    { s: zones, retry: retryZones },
    { s: reports, retry: retryReports },
  ].find((x) => x.s.status === 'error');

  return (
    <>
      <PageHeader title="Selamat Datang, Dishub" subtitle="Kelola data kecelakaan, pantau statistik zona risiko, dan tinjau laporan warga untuk evaluasi keselamatan jalan" />
      <nav className="menu-cards" aria-label="Pintasan">
        <MenuCard
          to={ROUTES.statistik}
          icon="statistik"
          title="Statistik Zona"
          description="Pemetaan tingkat risiko dan sebaran zona rawan lalu lintas"
          badge={redZones === undefined ? undefined : `${redZones} zona merah`}
        />
        <MenuCard
          to={ROUTES.arsip}
          icon="input"
          title="Arsip & Input"
          description="Tinjau kelengkapan arsip data di bawah ini, atau tambahkan rekam kecelakaan baru ke dalam sistem"
          badge={archive.status === 'ready' ? `${archive.data.total} arsip` : undefined}
        />
        <MenuCard
          to={ROUTES.laporan}
          icon="laporan"
          title="Detail Laporan"
          description="Pantau dan kelola rekam data kecelakaan yang terintegrasi otomatis dari sistem Dishub"
          badge={reports.status === 'ready' ? `${reports.data.length} laporan` : undefined}
        />
        <MenuCard
          to={ROUTES.ekspor}
          icon="ekspor"
          title="Ekspor Data"
          description={`Unduh data zona dan laporan ${APP_NAME} untuk kebutuhan laporan internal`}
          badge="CSV"
        />
      </nav>
      {failed && failed.s.status === 'error' ? <LoadState state="error" message={failed.s.message} onRetry={failed.retry} /> : null}
      {stats.status === 'loading' || zones.status === 'loading' || reports.status === 'loading' ? (
        <>
          <StatTilesSkeleton count={3} label="Memuat ringkasan…" />
          <Skeleton width="100%" height={72} radius="var(--radius-card)" />
        </>
      ) : null}
      {stats.status === 'ready' && zones.status === 'ready' && reports.status === 'ready' ? (
        <Overview stats={stats.data} zones={zones.data} reports={reports.data} />
      ) : null}
    </>
  );
}

function Overview({ stats, zones, reports }: { stats: Statistics; zones: ZonaTeratas[]; reports: Laporan[] }) {
  const [rain] = useRainSimulation();
  const views = useMemo(() => viewZones(zones, stats.riwayat_skor, rain), [zones, stats, rain]);
  const ranked = useMemo(() => [...views].sort((a, b) => b.skor - a.skor || a.zone.zona_id - b.zone.zona_id).slice(0, TOP_ZONES), [views]);
  const redNow = views.filter((v) => v.kategori === 'merah').length;
  const redNormal = zones.filter((z) => z.kategori_risiko === 'merah').length;
  const today = todayIso();
  const todayCount = reports.filter((r) => r.tanggal_kejadian.slice(0, 10) === today).length;

  return (
    <>
      <section className="kpi-grid" aria-label="Ringkasan">
        <KpiCard label="Zona rawan (merah)" value={redNow} note={rain && redNow > redNormal ? `naik ${redNow - redNormal} zona karena hujan` : 'kondisi normal'} />
        <KpiCard label="Laporan hari ini" value={todayCount} note={todayCount ? 'masuk sejak 00.00' : 'belum ada laporan masuk'} />
        <KpiCard label="Kecelakaan resmi" value={stats.total_kecelakaan_resmi} note="tercatat di arsip" />
      </section>

      <WeatherCard idPrefix="dishub" />

      <div className="home-columns">
        <WeekBars title="Laporan 7 hari terakhir" items={reports} dateOf={reportDay} label="Jumlah laporan per hari" />

        <section className="panel glass-in hover-lift" aria-labelledby="top-zones-title">
          <h2 id="top-zones-title" className="panel-title">
            Zona paling rawan
          </h2>
          {ranked.length ? (
            <>
              <ol className="top-zones">
                {ranked.map((v) => (
                  <li key={v.zone.zona_id}>
                    <Link to={zonaDetail(v.zone.zona_id)} className="top-zone">
                      <span className="top-zone-text">
                        <span className="top-zone-place">{v.zone.lokasi_teks ?? `Zona ${v.zone.zona_id}`}</span>
                        <span className="top-zone-meta">
                          Zona {v.zone.zona_id} · {v.zone.jumlah_kejadian} kejadian
                          {v.faktorHujanAktif ? ' · faktor hujan ×1,5' : ''}
                        </span>
                      </span>
                      <RiskBadge kategori={v.kategori} />
                      <span className="top-zone-score">{v.skor}%</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link to={ROUTES.statistik} className="btn btn-secondary btn-sm queue-start">
                Lihat semua zona
              </Link>
            </>
          ) : (
            <EmptyState title="Belum ada zona" description="Zona muncul setelah ada kejadian yang tercatat." />
          )}
        </section>
      </div>
    </>
  );
}
