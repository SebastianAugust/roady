import { useMemo } from 'react';
import { Circle } from 'react-native-maps';
import { AREA_FILL_ALPHA, AREA_STROKE_WIDTH, drawnRadius, withAlpha } from '../lib/zoneArea';
import type { KategoriRisiko, Zona } from '../types';
import { RISK_COLOR } from './RiskDot';

// Drawn low to high risk, so red ends up on top where zones overlap (zIndex is honoured on both platforms).
const LAYER: Record<KategoriRisiko, number> = { hijau: 1, kuning: 2, merah: 3 };

interface Props {
  zones: Zona[];
  /** Ground meters under one dp (lib/zoneArea metersPerDp), so a zone too small to see is drawn a little larger. 0 = real radius. */
  metersPerDp: number;
}

/**
 * Every zone as an AREA: a circle of its own radius_zona around its centre, filled 30% and outlined 2 dp in its risk colour,
 * so the edge is visible and overlapping zones still read through their outlines. No pins, no clusters. The circles are not
 * tappable themselves: the map handles the tap and finds the zone (zoneAtPoint), which also forgives a finger on a small zone.
 */
export function ZoneAreas({ zones, metersPerDp }: Props) {
  const ordered = useMemo(() => [...zones].sort((a, b) => LAYER[a.kategori_risiko] - LAYER[b.kategori_risiko]), [zones]);
  return ordered.map((z) => (
    <Circle
      key={z.zona_id}
      center={{ latitude: z.center_latitude, longitude: z.center_longitude }}
      radius={drawnRadius(z.radius_zona, metersPerDp)}
      strokeWidth={AREA_STROKE_WIDTH}
      strokeColor={RISK_COLOR[z.kategori_risiko]}
      fillColor={withAlpha(RISK_COLOR[z.kategori_risiko], AREA_FILL_ALPHA)}
      zIndex={LAYER[z.kategori_risiko]}
    />
  ));
}
