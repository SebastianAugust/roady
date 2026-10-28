import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { StatusPill } from '../components/StatusPill';
import { StatTile } from '../components/StatTile';
import { Tabs } from '../components/Tabs';
import { VerifyDialog } from '../components/VerifyDialog';
import { APP_NAME } from '../constants';
import { useApi } from '../hooks/useApi';
import { useRowNavigate } from '../hooks/useRowNavigate';
import { formatDate, formatDateTime, KATEGORI_LABEL, placeText } from '../lib/format';
import { verifikasiDetail } from '../routes';
import type { KeputusanVerifikasi, LaporanAdmin } from '../types';
import '../components/DataTable.css';

type View = 'pending_review' | 'approved' | 'rejected';

const EMPTY: Record<View, string> = {
  pending_review: 'Antrean kosong. Semua laporan berfoto sudah ditinjau.',
  approved: 'Belum ada laporan yang disetujui.',
  rejected: 'Belum ada laporan yang ditolak.',
};

/**
 * Figma "Verifikasi Laporan" (docs/design/admin/Verifikasi Laporan.png): three counters, then the reports in three
 * tabs (Menunggu Tinjauan | Disetujui | Ditolak; API-007 with status). The queue has SETUJUI / TOLAK per row (API-008);
 * the two decided tabs show who reviewed it (nama + kode pengguna), when and the reason. Every row has a status badge. A click on a row opens the detail.
 * No reporter name, email or id anywhere (NFR-006).
 */
export function VerifikasiPage() {
  const rowTo = useRowNavigate();
  // All reports for the counters and tabs (API-007 without status); each tab is a part of it.
  const load = useCallback(() => api.getAdminReports({}), []);
  const { state, retry } = useApi(load);
  const [decided, setDecided] = useState<Record<number, LaporanAdmin>>({});
  const [pending, setPending] = useState<{ report: LaporanAdmin; keputusan: KeputusanVerifikasi }>();
  const [view, setView] = useState<View>('pending_review');

  const reports = useMemo(() => (state.status === 'ready' ? state.data.map((r) => decided[r.id_report] ?? r) : []), [state, decided]);
  const byView = useMemo(() => {
    const decidedFirst = (a: LaporanAdmin, b: LaporanAdmin) => (b.waktu_verifikasi ?? '').localeCompare(a.waktu_verifikasi ?? '');
    return {
      // The queue: the report waiting longest first. The decided tabs: most recently decided first.
      pending_review: reports.filter((r) => r.status === 'pending_review').sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      approved: reports.filter((r) => r.status === 'approved').sort(decidedFirst),
      rejected: reports.filter((r) => r.status === 'rejected').sort(decidedFirst),
    };
  }, [reports]);
  // Disetujui Hari Ini: approved with a verification time on today's date in the browser's time zone.
  // Read once per visit (a lazy initializer, so render stays pure).
  const [today] = useState(() => new Date().toDateString());
  const approvedToday = byView.approved.filter((r) => r.waktu_verifikasi && new Date(r.waktu_verifikasi).toDateString() === today).length;

  const rows = byView[view];
  const isQueue = view === 'pending_review';


  return (
    <>
      <PageHeader title="Verifikasi Laporan" subtitle={`Kelola dan tentukan status dari setiap laporan yang masuk dari sobat ${APP_NAME}`} />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat antrean…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? (
        <>
          <section className="stat-tiles" aria-label="Ringkasan verifikasi">
            <StatTile label="Menunggu Tinjauan" value={byView.pending_review.length} />
            <StatTile label="Disetujui Hari Ini" value={approvedToday} />
            <StatTile label="Total Laporan Masuk" value={reports.length} />
          </section>

          <Tabs
            label="Status verifikasi"
            tabs={[
              { value: 'pending_review', label: `Menunggu Tinjauan (${byView.pending_review.length})` },
              { value: 'approved', label: `Disetujui (${byView.approved.length})` },
              { value: 'rejected', label: `Ditolak (${byView.rejected.length})` },
            ]}
            value={view}
            onChange={setView}
          >
            <div className="data-table-card glass">
              {rows.length ? (
                <table className="data-table">
                  <caption className="visually-hidden">
                    {isQueue ? 'Antrean laporan berfoto yang menunggu tinjauan, terlama di atas' : 'Laporan yang sudah diputuskan, terbaru di atas'}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Foto</th>
                      <th scope="col">Lokasi</th>
                      <th scope="col">Kejadian</th>
                      <th scope="col">Tanggal</th>
                      <th scope="col">Status</th>
                      {isQueue ? (
                        <th scope="col">Aksi</th>
                      ) : (
                        <>
                          <th scope="col">Ditinjau oleh</th>
                          <th scope="col">Waktu</th>
                          <th scope="col">Alasan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id_report} {...rowTo(verifikasiDetail(r.id_report))}>
                        <td>
                          {r.foto_url ? <img className="verif-thumb" src={r.foto_url} alt={`Foto laporan #${r.id_report}`} loading="lazy" /> : '-'}
                        </td>
                        <th scope="row">
                          <Link to={verifikasiDetail(r.id_report)}>{placeText(r)}</Link>
                          <span className="data-id">Laporan #{r.id_report}</span>
                        </th>
                        <td>{KATEGORI_LABEL[r.kategori]}</td>
                        <td>{formatDate(r.tanggal_kejadian)}</td>
                        <td>
                          <StatusPill status={r.status} />
                        </td>
                        {isQueue ? (
                          <td>
                            <div className="verif-actions">
                              <Button className="btn-sm" onClick={() => setPending({ report: r, keputusan: 'approved' })}>
                                SETUJUI
                              </Button>
                              <Button className="btn-sm" variant="danger-outline" onClick={() => setPending({ report: r, keputusan: 'rejected' })}>
                                TOLAK
                              </Button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td>
                              <span className="data-who">{r.diverifikasi_oleh_nama ?? '-'}</span>
                              <span className="data-who-name">{r.diverifikasi_oleh_kode ?? ''}</span>
                            </td>
                            <td>{r.waktu_verifikasi ? formatDateTime(r.waktu_verifikasi) : '-'}</td>
                            <td className="data-wrap">{r.alasan_verifikasi ?? '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <LoadState state="empty" message={EMPTY[view]} />
              )}
            </div>
          </Tabs>
        </>
      ) : null}

      <VerifyDialog
        pending={pending}
        onClose={() => setPending(undefined)}
        onDecided={(report) => {
          // The row leaves the queue at once and shows up in its decided tab; the counters follow from the same state.
          setDecided((d) => ({ ...d, [report.id_report]: report }));
          setPending(undefined);
        }}
      />
    </>
  );
}
