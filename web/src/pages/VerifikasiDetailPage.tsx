import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { Button } from '../components/Button';
import { DetailHeader } from '../components/DetailHeader';
import { LoadState } from '../components/LoadState';
import { IncidentMap } from '../components/IncidentMap';
import { StatusPill } from '../components/StatusPill';
import { VerifyDialog } from '../components/VerifyDialog';
import { useApi } from '../hooks/useApi';
import { CUACA_LABEL, formatCoords, formatDate, formatDateTime, KATEGORI_LABEL, placeText, STATUS_LABEL } from '../lib/format';
import { ROUTES } from '../routes';
import type { KeputusanVerifikasi, LaporanAdmin } from '../types';
import './VerifikasiDetailPage.css';

/**
 * One photo report for the Admin to judge. Layout from the detail frame with "Foto Kejadian" and "Deskripsi"
 * (the "detail - Kelola data kecelakaan" frame, which shows a crowd report with its status; docs/05 #26).
 * There is no single-report endpoint, so it reads API-007 and picks the id.
 */
export function VerifikasiDetailPage() {
  const id = Number(useParams().id);
  const load = useCallback(async () => {
    const report = (await api.getAdminReports({})).find((r) => r.id_report === id);
    if (!report) throw new ApiError(404, 'Laporan tidak ditemukan.');
    return report;
  }, [id]);
  const { state, retry } = useApi(load);
  const [updated, setUpdated] = useState<LaporanAdmin>();
  const [pending, setPending] = useState<{ report: LaporanAdmin; keputusan: KeputusanVerifikasi }>();

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat laporan…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  const report = updated?.id_report === id ? updated : state.data;
  const open = report.status === 'pending_review';

  return (
    <article aria-labelledby="laporan-title">
      <DetailHeader
        title={placeText(report)}
        subtitle={`Laporan #${report.id_report} · ${formatDate(report.tanggal_kejadian)}`}
        backTo={ROUTES.verifikasi}
        aside={
          <>
            <span className="muted">Status:</span>
            <StatusPill status={report.status} />
          </>
        }
      />
      <div className="detail-body">
        <div>
          <IncidentMap latitude={report.latitude} longitude={report.longitude} zonaId={report.zona_id} className="detail-map" />
          <p className="detail-coords">
            Latitude: {report.latitude}
            <br />
            Longitude: {report.longitude}
          </p>
        </div>
        <div className="detail-cards">
          <section className="glass-in detail-card verif-photo-card" aria-labelledby="foto-title">
            <h2 id="foto-title" className="detail-card-title">
              Foto Kejadian
            </h2>
            {report.foto_url ? (
              <a href={report.foto_url} target="_blank" rel="noreferrer" className="verif-photo-link">
                <img src={report.foto_url} alt={`Foto kejadian laporan #${report.id_report}`} className="verif-photo" />
              </a>
            ) : (
              <p className="muted">Laporan ini tanpa foto.</p>
            )}
          </section>
          <section className="glass-in detail-card" aria-labelledby="desk-title">
            <h2 id="desk-title" className="detail-card-title">
              Deskripsi
            </h2>
            <p>{report.deskripsi}</p>
            <dl className="verif-meta">
              <dt>Kejadian</dt>
              <dd>{KATEGORI_LABEL[report.kategori]}</dd>
              <dt>Cuaca</dt>
              <dd>{CUACA_LABEL[report.kondisi_cuaca_saat_kejadian]}</dd>
              <dt>Dikirim</dt>
              <dd>{formatDateTime(report.timestamp)}</dd>
              <dt>Zona</dt>
              <dd>{report.zona_id === null ? '-' : `Zona ${report.zona_id}`}</dd>
              <dt>Koordinat</dt>
              <dd>{formatCoords(report.latitude, report.longitude)}</dd>
            </dl>
          </section>
          {open ? (
            <div className="detail-actions">
              <Button onClick={() => setPending({ report, keputusan: 'approved' })}>SETUJUI</Button>
              <Button variant="danger" onClick={() => setPending({ report, keputusan: 'rejected' })}>
                TOLAK
              </Button>
            </div>
          ) : (
            <section className="glass-in detail-card" aria-labelledby="jejak-title">
              <h2 id="jejak-title" className="detail-card-title">
                Jejak Verifikasi
              </h2>
              {report.diverifikasi_oleh_kode && report.waktu_verifikasi ? (
                <dl className="verif-meta">
                  <dt>Keputusan</dt>
                  <dd>{STATUS_LABEL[report.status]}</dd>
                  <dt>Diputuskan oleh</dt>
                  <dd>
                    {report.diverifikasi_oleh_kode} · {report.diverifikasi_oleh_nama}
                  </dd>
                  <dt>Waktu</dt>
                  <dd>{formatDateTime(report.waktu_verifikasi)}</dd>
                  {report.status === 'rejected' ? (
                    <>
                      <dt>Alasan penolakan</dt>
                      <dd>{report.alasan_penolakan}</dd>
                    </>
                  ) : null}
                </dl>
              ) : (
                <p className="muted" role="status">
                  Laporan ini diputuskan otomatis oleh sistem.
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <VerifyDialog
        pending={pending}
        onClose={() => setPending(undefined)}
        onDecided={(r) => {
          setUpdated(r);
          setPending(undefined);
        }}
      />
    </article>
  );
}
