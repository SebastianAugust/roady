import { CUACA_LABEL, KATEGORI_LABEL } from '../lib/format';
import type { Laporan } from '../types';
import { Button } from './Button';
import { StatusPill } from './StatusPill';
import './ReportCard.css';

interface Props {
  report: Laporan;
  onDetail: (report: Laporan) => void;
}

/** Figma Detail Laporan card: Status, Kejadian, Cuaca, Deskripsi (two lines), DETAIL. No reporter identity (NFR-006). */
export function ReportCard({ report, onDetail }: Props) {
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
      <Button className="report-detail-btn" onClick={() => onDetail(report)} aria-label={`Detail laporan ${report.id_report}`}>
        DETAIL
      </Button>
    </article>
  );
}
