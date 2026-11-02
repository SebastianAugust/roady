import { formatDateTime, STATUS_LABEL } from '../lib/format';
import type { Laporan } from '../types';
import { StatusPill } from './StatusPill';
import './ReviewCard.css';

/**
 * "Peninjauan" card of a report (Admin and Dishub): the status, which Admin decided it (nama and kode_pengguna), when,
 * and the full written reason. Reports decided by the system (auto_approved, auto_rejected) and those still waiting say
 * so instead. Never the reporter (NFR-006).
 */
export function ReviewCard({ report: r }: { report: Laporan }) {
  const decidedByAdmin = (r.status === 'approved' || r.status === 'rejected') && r.diverifikasi_oleh_kode && r.waktu_verifikasi;
  return (
    <section className="glass-in detail-card" aria-labelledby="peninjauan-title">
      <h2 id="peninjauan-title" className="detail-card-title">
        Peninjauan
      </h2>
      <dl className="review-info">
        <dt>Status</dt>
        <dd>
          <StatusPill status={r.status} />
        </dd>
        {decidedByAdmin ? (
          <>
            <dt>Ditinjau oleh</dt>
            <dd>
              {r.diverifikasi_oleh_nama} <span className="review-code">{r.diverifikasi_oleh_kode}</span>
            </dd>
            <dt>Waktu</dt>
            <dd>{formatDateTime(r.waktu_verifikasi as string)}</dd>
            <dt>{r.status === 'approved' ? 'Alasan persetujuan' : 'Alasan penolakan'}</dt>
            <dd className="review-reason">{r.alasan_verifikasi ?? r.alasan_penolakan ?? '-'}</dd>
          </>
        ) : null}
      </dl>
      {!decidedByAdmin ? (
        <p className="muted" role="status">
          {r.status === 'pending_review' ? 'Menunggu tinjauan Admin.' : `${STATUS_LABEL[r.status]}: diputuskan otomatis oleh sistem, tanpa tinjauan Admin.`}
        </p>
      ) : null}
    </section>
  );
}
