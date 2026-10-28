import type { KategoriRisiko } from '../types';
import { RiskDot } from './RiskDot';
import './StatTile.css';

interface Props {
  label: string;
  value: number | string;
  /** Adds the category dot next to the label (the number itself stays white). */
  kategori?: KategoriRisiko;
}

/** Figma Statistik Zona summary card: label on top, one big number. */
export function StatTile({ label, value, kategori }: Props) {
  return (
    <div className="stat-tile glass-in">
      <p className="stat-label">
        {kategori ? <RiskDot kategori={kategori} /> : null}
        {label}
      </p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
