import { Link } from 'react-router-dom';
import { CUACA_LABEL, KATEGORI_LABEL } from '../lib/format';
import { laporanDetail } from '../routes';
import type { Laporan } from '../types';
import { StatusPill } from './StatusPill';
import './ReportCard.css';

/**
 * Figma Detail Laporan card: Status, Kejadian, Cuaca, Deskripsi (two lines), DETAIL. The DETAIL button is the real
 * link and its hit area covers the whole card, so a click anywhere opens the report. No reporter identity (NFR-006).
 */
export function ReportCard({ report }: { report: Laporan }) {
  return (
    <article className="report-card glass-in" aria-label={`Laporan ${report.id_report}`}>
      <dl className="report-fields">
        <dt>Status</dt>
        <dd>
          <StatusPill status={report.status} />
        </dd>
        <dt>Kejadian</dt>
        <dd>{KATEGORI_LABEL[report.kategori]}</dd>
        <dt>Cuaca</dt>
        <dd>{CUACA_LABEL[report.kondisi_cuaca_saat_kejadian]}</dd>
        <dt>Deskripsi</dt>
        <dd className="report-desc">{report.deskripsi}</dd>
      </dl>
      <Link to={laporanDetail(report.id_report)} className="btn btn-primary report-detail-btn" aria-label={`Detail laporan ${report.id_report}`}>
        DETAIL
      </Link>
    </article>
  );
}
