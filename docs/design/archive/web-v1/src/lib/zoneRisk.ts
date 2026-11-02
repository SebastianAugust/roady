import type { RiwayatSkorPoint, Zona } from '../types';
import { simulatedRisk } from './rainSimulation';

type History = { zona_id: number; titik: RiwayatSkorPoint[] }[];

/** Share (0 to 1) of a zone's incidents that happened in rain, from the latest row of its score history (0 when it has none). */
export function porsiHujanTerbaru(riwayat: History, zonaId: number) {
  const titik = riwayat.find((r) => r.zona_id === zonaId)?.titik ?? [];
  const last = titik[titik.length - 1];
  return last ? last.persentase_kejadian_saat_hujan / 100 : 0;
}

/** A zone with its score and category under the rain simulation, ready to draw. */
export interface ZoneView<Z extends Zona = Zona> {
  zone: Z;
  skor: number;
  kategori: Zona['kategori_risiko'];
  porsiHujan: number;
  faktorHujanAktif: boolean;
}

export function viewZones<Z extends Zona>(zones: Z[], riwayat: History, rain: boolean): ZoneView<Z>[] {
  return zones.map((zone) => {
    const porsiHujan = porsiHujanTerbaru(riwayat, zone.zona_id);
    return { zone, porsiHujan, ...simulatedRisk(zone, rain, porsiHujan) };
  });
}
