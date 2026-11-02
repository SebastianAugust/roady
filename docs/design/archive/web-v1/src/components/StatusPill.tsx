import { STATUS_LABEL } from '../lib/format';
import type { StatusLaporan } from '../types';
import './StatusPill.css';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

// Report status uses the status tokens, never the risk colors (those are only for zone categories).
const TONE: Record<StatusLaporan, Tone> = {
  approved: 'success',
  pending_review: 'warning',
  rejected: 'danger',
  auto_rejected: 'danger',
  auto_approved: 'neutral',
};

/** Report status pill, worded as the Figma d.progress dropdown (Masuk Otomatis, Menunggu Tinjauan, Disetujui, Ditolak). */
export function StatusPill({ status }: { status: StatusLaporan }) {
  return <span className={`status-pill status-${TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}
