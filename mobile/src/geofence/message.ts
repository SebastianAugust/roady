import { RISK_LABEL } from '../lib/risk';
import type { Zona } from '../types';
import type { NearbyZone } from './nearby';

export interface AlertMessage {
  title: string;
  body: string;
}

/**
 * Text of the local notification. The top alert (most severe, then closest) is described; others are only counted.
 * Zona has no name field (docs/02), so the category label and score stand in for it.
 */
export function buildAlertMessage(alerts: readonly NearbyZone<Zona>[]): AlertMessage | undefined {
  const top = alerts[0];
  if (!top) return undefined;
  const { zone, distanceM } = top;
  const others = alerts.length - 1;
  const parts = [
    `Titik rawan kecelakaan sekitar ${Math.max(1, Math.round(distanceM))} m dari Anda (skor risiko ${Math.round(zone.skor_risiko)}%, ${zone.jumlah_kejadian} kejadian).`,
    others > 0 ? `Ada ${others} zona rawan lain di dekat Anda.` : null,
    'Kurangi kecepatan dan tetap waspada.',
  ];
  return { title: `${RISK_LABEL[zone.kategori_risiko]}: zona rawan di dekat Anda`, body: parts.filter(Boolean).join(' ') };
}
