import { Circle, Marker } from '@vis.gl/react-google-maps';
import { RISK_COLOR, RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { colors } from '../theme/tokens';
import type { Zona } from '../types';

/** Fill 30%, outline 2 px in the risk colour (docs/01 step 5: green below 50, yellow 50 to 80, red above 80). */
export const AREA_FILL_OPACITY = 0.3;
export const AREA_OUTLINE_PX = 2;
/** The zone picked in Statistik Zona: a heavier outline and fill; the others are dimmed (still clickable). */
export const AREA_SELECTED_OUTLINE_PX = 4;
export const AREA_SELECTED_FILL_OPACITY = 0.5;
export const AREA_DIM_FILL_OPACITY = 0.1;
export const AREA_DIM_OUTLINE_OPACITY = 0.45;

export type ZoneEmphasis = 'selected' | 'dim';

type Shape = Pick<Zona, 'zona_id' | 'center_latitude' | 'center_longitude' | 'radius_zona' | 'kategori_risiko'>;

interface Props {
  zone: Shape;
  /** Highlights (selected) or dims the zone while another one is picked. */
  emphasis?: ZoneEmphasis;
  /** Draws the zone's centre marker (white edge, risk colour). The detail maps have their own pin and leave it off. */
  marker?: boolean;
  /** Makes the circle and the marker clickable. */
  onSelect?: (zoneId: number) => void;
}

/**
 * A zone as an AREA: a circle of its own radius_zona around its centre, plus (on the zone map) a marker at the centre so
 * a zone stays visible and clickable when zoomed far out. Higher risk and the picked zone are drawn on top.
 */
export function ZoneArea({ zone, emphasis, marker = false, onSelect }: Props) {
  const color = RISK_COLOR[zone.kategori_risiko];
  const position = { lat: zone.center_latitude, lng: zone.center_longitude };
  const selected = emphasis === 'selected';
  const dim = emphasis === 'dim';
  const zIndex = (selected ? 100 : 0) + (RISK_ORDER.length - RISK_ORDER.indexOf(zone.kategori_risiko));
  const select = onSelect ? () => onSelect(zone.zona_id) : undefined;
  return (
    <>
      <Circle
        center={position}
        radius={zone.radius_zona}
        strokeColor={color}
        strokeWeight={selected ? AREA_SELECTED_OUTLINE_PX : AREA_OUTLINE_PX}
        strokeOpacity={dim ? AREA_DIM_OUTLINE_OPACITY : 1}
        fillColor={color}
        fillOpacity={selected ? AREA_SELECTED_FILL_OPACITY : dim ? AREA_DIM_FILL_OPACITY : AREA_FILL_OPACITY}
        clickable={onSelect !== undefined}
        zIndex={zIndex}
        onClick={select}
      />
      {marker ? (
        <Marker
          position={position}
          title={`Zona ${zone.zona_id} · ${RISK_LABEL[zone.kategori_risiko]}`}
          clickable={onSelect !== undefined}
          opacity={dim ? 0.55 : 1}
          zIndex={zIndex + 10}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: selected ? 11 : 8,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: colors.white,
            strokeWeight: 2,
          }}
          onClick={select}
        />
      ) : null}
    </>
  );
}
