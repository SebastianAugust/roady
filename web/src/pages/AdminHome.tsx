import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { KpiCard } from '../components/KpiCard';
import { LoadState } from '../components/LoadState';
import { MenuCard } from '../components/MenuCard';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { StatTilesSkeleton } from '../components/StatTilesSkeleton';
import { WeatherCard } from '../components/WeatherCard';
import { WeekBars } from '../components/WeekBars';
import { EmptyState } from '../components/ui';
import { BANDUNG_RAYA, ZONES_FETCH_RADIUS_M } from '../config';
import { useApi } from '../hooks/useApi';
import { formatDateTime, placeText, todayIso } from '../lib/format';
import { simulatedRisk, useRainSimulation } from '../lib/rainSimulation';
import { ROUTES, verifikasiDetail } from '../routes';
import type { LaporanAdmin, Zona } from '../types';
import '../components/Dashboard.css';

const QUEUE_PREVIEW = 3;
const reportDay = (r: LaporanAdmin) => r.tanggal_kejadian;

/**
 * Beranda of the Admin (docs/design/prototype-web-v2.html): three counters, the weather card with the global "Simulasi
 * hujan" switch, reports of the last 7 days as a bar chart, and the first reports of the verification queue.
 * Data: API-003 (zones) and API-007 (reports); nothing here names a reporter (NFR-006).
 * Above them, the menu cards of prototype-web-cards.html with a count pill each, taken from the data the page behind the
 * card shows: the reports with a photo waiting in Verifikasi Laporan, and the total of Kelola Data Kecelakaan.
 */
export function AdminHome() {
  const loadZones = useCallback(
    () => api.getZones({ lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude, radius: ZONES_FETCH_RADIUS_M }),
    [],
  );
  const loadReports = useCallback(() => api.getAdminReports({}), []);
  const { state: zones, retry: retryZones } = useApi(loadZones);
  const { state: reports, retry: retryReports } = useApi(loadReports);
  const loadAccidents = useCallback(() => api.getAccidents({ per_halaman: 1 }), []);
  const { state: accidents } = useApi(loadAccidents);
  const waiting = reports.status === 'ready' ? reports.data.filter((r) => r.status === 'pending_review' && r.foto_url).length : undefined;

  return (
    <>
      <PageHeader title="Selamat Datang, Admin" subtitle="Pantau laporan warga dan tindak lanjuti data kecelakaan dengan cepat dan akurat" />
      <nav className="menu-cards" aria-label="Pintasan">
        <MenuCard
          to={ROUTES.verifikasi}
          icon="verifikasi"
          title="Verifikasi Laporan"
          description="Periksa lampiran bukti dari pelapor, lalu tentukan untuk menyetujui atau menolak laporan"
          badge={waiting === undefined ? undefined : `${waiting} menunggu`}
        />
        <MenuCard
          to={ROUTES.kecelakaan}
          icon="kecelakaan"
          title="Kelola Data Kecelakaan"
          description="Pantau, perbarui, dan atur seluruh rekam data kecelakaan yang tersimpan di dalam sistem"
          badge={accidents.status === 'ready' ? `${accidents.data.total} data` : undefined}
        />
      </nav>
      {zones.status === 'error' ? <LoadState state="error" message={zones.message} onRetry={retryZones} /> : null}
      {reports.status === 'error' ? <LoadState state="error" message={reports.message} onRetry={retryReports} /> : null}
      {zones.status === 'loading' || reports.status === 'loading' ? <HomeSkeleton /> : null}
      {zones.status === 'ready' && reports.status === 'ready' ? <Overview zones={zones.data} reports={reports.data} /> : null}
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <StatTilesSkeleton count={3} label="Memuat ringkasan…" />
      <Skeleton width="100%" height={72} radius="var(--radius-card)" />
    </>
  );
}

function Overview({ zones, reports }: { zones: Zona[]; reports: LaporanAdmin[] }) {
  const navigate = useNavigate();
  const [rain] = useRainSimulation();

  const redNow = zones.filter((z) => simulatedRisk(z, rain).kategori === 'merah').length;
  const redNormal = zones.filter((z) => z.kategori_risiko === 'merah').length;
  const queue = useMemo(() => reports.filter((r) => r.status === 'pending_review' && r.foto_url), [reports]);
  const counted = useMemo(() => reports.filter((r) => r.status !== 'auto_rejected'), [reports]);
  const today = todayIso();
  const todayCount = counted.filter((r) => r.tanggal_kejadian.slice(0, 10) === today).length;

  return (
    <>
      <section className="kpi-grid" aria-label="Ringkasan">
        <KpiCard label="Zona rawan (merah)" value={redNow} note={rain && redNow > redNormal ? `naik ${redNow - redNormal} zona karena hujan` : 'kondisi normal'} />
        <KpiCard label="Menunggu verifikasi" value={queue.length} note={queue.length ? 'perlu ditindak' : 'antrean kosong'} warn />
        <KpiCard label="Laporan hari ini" value={todayCount} note={todayCount ? 'masuk sejak 00.00' : 'belum ada laporan masuk'} />
      </section>

      <WeatherCard idPrefix="admin" />

      <div className="home-columns">
        <WeekBars title="Laporan 7 hari terakhir" items={counted} dateOf={reportDay} label="Jumlah laporan per hari" />

        <section className="panel glass-in hover-lift" aria-labelledby="queue-title">
          <h2 id="queue-title" className="panel-title">
            Antrean verifikasi
          </h2>
          {queue.length ? (
            <>
              <ul className="queue">
                {queue.slice(0, QUEUE_PREVIEW).map((r) => (
                  <li key={r.id_report}>
                    <div className="queue-text">
                      <span className="queue-place">{placeText(r)}</span>
                      <span className="queue-meta">{formatDateTime(r.timestamp)} · foto bobot 1,0</span>
                    </div>
                    <Button variant="secondary" className="btn-sm" onClick={() => navigate(verifikasiDetail(r.id_report))}>
                      Buka
                    </Button>
                  </li>
                ))}
              </ul>
              <Button className="btn-sm queue-start" onClick={() => navigate(ROUTES.verifikasi)}>
                Mulai verifikasi
              </Button>
            </>
          ) : (
            <EmptyState title="Antrean kosong" description="Semua laporan berfoto sudah diverifikasi." />
          )}
        </section>
      </div>
    </>
  );
}
