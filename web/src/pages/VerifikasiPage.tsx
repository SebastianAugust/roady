import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { StatTile } from '../components/StatTile';
import { VerifyDialog } from '../components/VerifyDialog';
import { APP_NAME } from '../constants';
import { useApi } from '../hooks/useApi';
import { formatDate, KATEGORI_LABEL, placeText } from '../lib/format';
import { verifikasiDetail } from '../routes';
import type { KeputusanVerifikasi, Laporan } from '../types';
import './VerifikasiPage.css';

/**
 * Figma "Verifikasi Laporan" (docs/design/admin/Verifikasi Laporan.png): three counters and the queue of photo reports (API-007, status=pending_review)
 * with SETUJUI / TOLAK per row (API-008). No reporter name or email anywhere, as in the frame.
 */
export function VerifikasiPage() {
  // All reports for the counters; the queue is the pending_review part of it.
  const load = useCallback(() => api.getAdminReports({}), []);
  const { state, retry } = useApi(load);
  const [decided, setDecided] = useState<Record<number, Laporan>>({});
  const [pending, setPending] = useState<{ report: Laporan; keputusan: KeputusanVerifikasi }>();

  const reports = useMemo(() => (state.status === 'ready' ? state.data.map((r) => decided[r.id_report] ?? r) : []), [state, decided]);
  const queue = reports.filter((r) => r.status === 'pending_review');
  // Disetujui Hari Ini: approved with a verification time on today's date in the browser's time zone.
  // Read once per visit (a lazy initializer, so render stays pure).
  const [today] = useState(() => new Date().toDateString());
  const approvedToday = reports.filter(
    (r) => r.status === 'approved' && r.waktu_verifikasi && new Date(r.waktu_verifikasi).toDateString() === today,
  ).length;

  return (
    <>
      <PageHeader title="Verifikasi Laporan" subtitle={`Kelola dan tentukan status dari setiap laporan yang masuk dari sobat ${APP_NAME}`} />
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat antrean…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? (
        <>
          <section className="stat-tiles" aria-label="Ringkasan verifikasi">
            <StatTile label="Menunggu Tinjauan" value={queue.length} />
            <StatTile label="Disetujui Hari Ini" value={approvedToday} />
            <StatTile label="Total Laporan Masuk" value={reports.length} />
          </section>

          <div className="verif-table-card glass">
            {queue.length ? (
              <table className="verif-table">
                <caption className="visually-hidden">Antrean laporan berfoto yang menunggu tinjauan, terlama di atas</caption>
                <thead>
                  <tr>
                    <th scope="col">Foto</th>
                    <th scope="col">Lokasi</th>
                    <th scope="col">Kejadian</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((r) => (
                    <tr key={r.id_report}>
                      <td>
                        {r.foto_url ? <img className="verif-thumb" src={r.foto_url} alt={`Foto laporan #${r.id_report}`} loading="lazy" /> : '-'}
                      </td>
                      <th scope="row">
                        <Link to={verifikasiDetail(r.id_report)}>{placeText(r)}</Link>
                        <span className="verif-id">Laporan #{r.id_report}</span>
                      </th>
                      <td>{KATEGORI_LABEL[r.kategori]}</td>
                      <td>{formatDate(r.tanggal_kejadian)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <LoadState state="empty" message="Antrean kosong. Semua laporan berfoto sudah ditinjau." />
            )}
          </div>
        </>
      ) : null}

      <VerifyDialog
        pending={pending}
        onClose={() => setPending(undefined)}
        onDecided={(report) => {
          // The row leaves the queue at once; the counters follow from the same state.
          setDecided((d) => ({ ...d, [report.id_report]: report }));
          setPending(undefined);
        }}
      />
    </>
  );
}
