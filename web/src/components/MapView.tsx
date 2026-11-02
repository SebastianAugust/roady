import { RISK_COLOR, RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { RADIUS_PERINGATAN_M } from '../lib/zoneScore';
import { GoogleMapView } from './GoogleMapView';
import { MapFrame } from './MapFrame';
import type { MapViewProps } from './mapViewTypes';
import { SchematicMapView } from './SchematicMapView';
import { AREA_FILL_OPACITY, AREA_OUTLINE_PX } from './ZoneArea';
import './MapView.css';

/** Legend rows: category, and what the limits of docs/01 step 5 mean. */
const LEGEND = {
  merah: 'skor lebih dari 80',
  kuning: 'skor 50 sampai 80',
  hijau: 'skor kurang dari 50',
} as const;

/**
 * The zone map of Statistik Zona. One interface (MapViewProps), two implementations: Google Maps (dark style, centre
 * Bandung Raya, zoom 11) when VITE_GOOGLE_MAPS_API_KEY is set, otherwise the schematic SVG map; the schematic map also
 * takes over if the Google script fails or the key is refused, so the page never ends in an error box. Around either
 * one: the legend and a tooltip chip for the zone under the pointer (or the keyboard focus).
 */
export function MapView(props: MapViewProps) {
  const hovered = props.zones.find((z) => z.id === props.hoveredId);
  return (
    <div className="mapview">
      <MapFrame className="mapview-frame" label="Peta zona risiko. Daftar zona yang sama ada di samping peta." fallback={<SchematicMapView {...props} />}>
        <GoogleMapView {...props} />
      </MapFrame>

      <div className="mapview-legend" role="group" aria-label="Legenda">
        <p className="mapview-legend-title">Skor risiko</p>
        <ul>
          {RISK_ORDER.map((k) => (
            <li key={k}>
              <span
                className="mapview-swatch"
                aria-hidden="true"
                style={{ borderColor: RISK_COLOR[k], borderWidth: AREA_OUTLINE_PX, background: `color-mix(in srgb, ${RISK_COLOR[k]} ${AREA_FILL_OPACITY * 100}%, transparent)` }}
              />
              <span>
                <span className="mapview-legend-name">{RISK_LABEL[k]}</span>
                <span className="mapview-legend-range">{LEGEND[k]}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mapview-legend-note">Lingkaran = radius peringatan {RADIUS_PERINGATAN_M} m.</p>
      </div>

      {hovered ? (
        <p className="mapview-tooltip" role="status">
          <strong>Zona {hovered.id}</strong> · {hovered.label} · {RISK_LABEL[hovered.kategori]} · {hovered.skor}%
        </p>
      ) : null}
    </div>
  );
}
