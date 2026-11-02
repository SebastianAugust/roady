import { RISK_COLOR } from '../lib/risk';
import type { KategoriRisiko } from '../types';
import './RiskDot.css';

/** Category dot with a white edge, same as the map markers. Always paired with a text label: color is never the only cue. */
export function RiskDot({ kategori }: { kategori: KategoriRisiko }) {
  return <span className="risk-dot" style={{ background: RISK_COLOR[kategori] }} aria-hidden="true" />;
}
