import type { KategoriRisiko } from '../types';
import { RiskDot } from './RiskDot';

const SHORT_LABEL: Record<KategoriRisiko, string> = { merah: 'Merah', kuning: 'Kuning', hijau: 'Hijau' };

/**
 * Zone category as in the Figma "Kategori Zona" column. Figma fills a pill with the risk color and writes on it;
 * white on #FD0000 or #C5B94B is below 4.5:1, so the color sits in a dot and the word stays white.
 */
export function RiskBadge({ kategori }: { kategori: KategoriRisiko }) {
  return (
    <span className="risk-label risk-badge">
      <RiskDot kategori={kategori} />
      {SHORT_LABEL[kategori]}
    </span>
  );
}
