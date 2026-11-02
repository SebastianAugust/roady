import { KpiNumber } from './KpiNumber';
import './Dashboard.css';

interface Props {
  label: string;
  value: number;
  /** One line under the number; `warn` turns it yellow ("perlu ditindak"). */
  note: string;
  warn?: boolean;
}

/** A counter of a Beranda: small label, the number counting up, and a one-line note. Lifts on hover. */
export function KpiCard({ label, value, note, warn = false }: Props) {
  return (
    <div className="kpi-card glass-in hover-lift">
      <p className="kpi-label">{label}</p>
      <KpiNumber value={value} className="kpi-value" />
      <p className={`kpi-note${warn ? ' kpi-note-warn' : ''}`}>{note}</p>
    </div>
  );
}
