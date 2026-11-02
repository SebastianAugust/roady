import type { KategoriRisiko } from '../types';

/** One zone as a MapView draws it: where, how big, and the category and score it has RIGHT NOW (rain simulation included). */
export interface MapViewZone {
  id: number;
  lat: number;
  lng: number;
  /** Radius of the circle in meters. */
  radius: number;
  kategori: KategoriRisiko;
  skor: number;
  /** Short place name for tooltips and screen readers. */
  label: string;
}

/**
 * What every map implementation takes (Google Maps and the schematic SVG map), so they can be swapped without the page
 * noticing. `selectedId` and `hoveredId` are owned by the page, which keeps the zone list in step with the map.
 */
export interface MapViewProps {
  zones: MapViewZone[];
  selectedId?: number;
  hoveredId?: number;
  /** A zone was clicked (id) or the empty map was (undefined). */
  onSelect: (id: number | undefined) => void;
  onHover: (id: number | undefined) => void;
}
