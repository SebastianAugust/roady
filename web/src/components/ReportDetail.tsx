import { CUACA_LABEL, formatCoords, formatDate, formatDateTime, KATEGORI_LABEL } from '../lib/format';
import type { Laporan } from '../types';
import { StatusPill } from './StatusPill';
import './ReportDetail.css';

/** Full report behind the DETAIL button. Built only from Laporan, which has no reporter identity (NFR-006). */
export function ReportDetail({ report }: { report: Laporan }) {
  return (
    <dl className="report-detail">
      <dt>Status</dt>
      <dd>
        <StatusPill status={report.status} />
      </dd>
      <dt>Zona</dt>
      <dd>{report.zona_id === null ? '-' : `Zona ${report.zona_id}`}</dd>
      <dt>Kejadian</dt>
      <dd>{KATEGORI_LABEL[report.kategori]}</dd>
      <dt>Tanggal kejadian</dt>
      <dd>{formatDate(report.tanggal_kejadian)}</dd>
      <dt>Dikirim</dt>
      <dd>{formatDateTime(report.timestamp)}</dd>
      <dt>Cuaca</dt>
      <dd>{CUACA_LABEL[report.kondisi_cuaca_saat_kejadian]}</dd>
      <dt>Lokasi</dt>
      <dd>
        {report.alamat_teks?.trim() ? (
          <>
            {report.alamat_teks}
            <br />
          </>
        ) : null}
        <span className="muted">{formatCoords(report.latitude, report.longitude)}</span>
      </dd>
      <dt>Foto</dt>
      <dd>{report.foto_url ? 'Ada (ditinjau Admin)' : 'Tidak ada'}</dd>
      <dt>Deskripsi</dt>
      <dd>{report.deskripsi}</dd>
    </dl>
  );
}
