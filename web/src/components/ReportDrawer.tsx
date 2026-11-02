import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApi } from '../hooks/useApi';
import { CUACA_LABEL, formatDateTime, KATEGORI_LABEL, placeText } from '../lib/format';
import { laporanDetail } from '../routes';
import type { Laporan, StatusLaporan } from '../types';
import { RiskBadge } from './RiskBadge';
import { StatusPill } from './StatusPill';
import { Drawer } from './ui';
import './ReportDrawer.css';

/** Weight of a report in the zone score (docs/01 step 1), in words. */
const WEIGHT: Record<StatusLaporan, string> = {
  approved: '1,0 (dengan foto, disetujui Admin)',
  auto_approved: '0,5 (tanpa foto, masuk otomatis)',
  pending_review: 'Belum dihitung (menunggu tinjauan Admin)',
  rejected: 'Dibuang (ditolak Admin, tidak dihitung)',
  auto_rejected: 'Dibuang (gagal validasi otomatis)',
};

interface Props {
  /** The report to show; undefined keeps the drawer closed. */
  report: Laporan | undefined;
  onClose: () => void;
}

/** The read-only detail of one report (Detail Laporan): photo or the note that there is none, text, zone, weather, weight. */
export function ReportDrawer({ report, onClose }: Props) {
  return report ? <Content key={report.id_report} report={report} onClose={onClose} /> : null;
}

function Content({ report: r, onClose }: { report: Laporan; onClose: () => void }) {
  const zonaId = r.zona_id;
  const loadZone = useCallback(() => (zonaId === null ? Promise.resolve(undefined) : api.getZone(zonaId)), [zonaId]);
  const { state } = useApi(loadZone);
  const zone = state.status === 'ready' ? state.data : undefined;
  const reason = r.status === 'rejected' ? (r.alasan_verifikasi ?? r.alasan_penolakan) : null;

  return (
    <Drawer
      open
      title={`Laporan #${r.id_report}`}
      onClose={onClose}
      footer={
        <Link to={laporanDetail(r.id_report)} className="btn btn-secondary">
          Halaman detail lengkap
        </Link>
      }
    >
      <div className="report-drawer-meta">
        <StatusPill status={r.status} />
        <span>
          {KATEGORI_LABEL[r.kategori]} · {formatDateTime(r.timestamp)}
        </span>
      </div>

      {r.foto_url ? (
        <img className="report-drawer-photo" src={r.foto_url} alt={`Foto laporan #${r.id_report}`} />
      ) : (
        <p className="report-drawer-nophoto">Tanpa foto. Laporan ini masuk otomatis dengan bobot 0,5.</p>
      )}

      <p>{r.deskripsi}</p>

      <dl className="report-drawer-facts">
        <div>
          <dt>Lokasi</dt>
          <dd>{placeText(r)}</dd>
        </div>
        <div>
          <dt>Zona</dt>
          <dd>
            {zonaId === null ? 'Di luar zona rawan' : `Zona ${zonaId}`}
            {zone ? <RiskBadge kategori={zone.kategori_risiko} /> : null}
          </dd>
        </div>
        <div>
          <dt>Cuaca saat kejadian</dt>
          <dd>{CUACA_LABEL[r.kondisi_cuaca_saat_kejadian]}</dd>
        </div>
        <div>
          <dt>Bobot</dt>
          <dd>{WEIGHT[r.status]}</dd>
        </div>
        {r.diverifikasi_oleh_kode ? (
          <div>
            <dt>Ditinjau oleh</dt>
            <dd>
              {r.diverifikasi_oleh_kode}
              {r.waktu_verifikasi ? ` · ${formatDateTime(r.waktu_verifikasi)}` : ''}
            </dd>
          </div>
        ) : null}
        {reason ? (
          <div>
            <dt>Alasan penolakan</dt>
            <dd>{reason}</dd>
          </div>
        ) : null}
      </dl>
    </Drawer>
  );
}
