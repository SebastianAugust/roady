import type { KategoriRisiko } from '../types';
import { RiskDot } from './RiskDot';
import './StatTile.css';

interface Props {
  label: string;
  value: number | string;
  /** Adds the category dot next to the label (the number itself stays white). */
  kategori?: KategoriRisiko;
  /** Makes the tile a toggle button (a filter); `selected` is its pressed state. */
  onSelect?: () => void;
  selected?: boolean;
}

/** Figma Statistik Zona summary card: label on top, one big number. */
export function StatTile({ label, value, kategori, onSelect, selected }: Props) {
  const content = (
    <>
      <span className="stat-label">
        {kategori ? <RiskDot kategori={kategori} /> : null}
        {label}
      </span>
      <span className="stat-value">{value}</span>
    </>
  );
  if (onSelect) {
    return (
      <button type="button" className="stat-tile stat-tile-button glass-in" aria-pressed={selected} onClick={onSelect}>
        {content}
      </button>
    );
  }
  return <div className="stat-tile glass-in">{content}</div>;
}
