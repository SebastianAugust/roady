import { Circle, CircleMarker } from 'react-leaflet';
import type { ReactNode } from 'react';
import { ZONE_MAP } from '../config';
import { RISK_COLOR } from '../lib/risk';
import { colors } from '../theme/tokens';
import type { Zona } from '../types';

/** Fill 30%, outline 2 px in the risk colour (docs/01 step 5: green below 50, yellow 50 to 80, red above 80). */
export const AREA_FILL_OPACITY = 0.3;
export const AREA_OUTLINE_PX = 2;

const metersPerPixel = (latitude: number, zoom: number) => (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

type Shape = Pick<Zona, 'center_latitude' | 'center_longitude' | 'radius_zona' | 'kategori_risiko'>;

interface Props {
  zone: Shape;
  /** Current map zoom. When given, a zone smaller than ZONE_MAP.minPixelRadius on screen is drawn at that size instead. */
  zoom?: number;
}

/** True when the real circle would be too small to see at this zoom. */
const tooSmall = ({ zone, zoom }: Props) => zoom !== undefined && zone.radius_zona / metersPerPixel(zone.center_latitude, zoom) < ZONE_MAP.minPixelRadius;

/**
 * The thin dark edge under an area (draw all casings first, then all areas, so no casing covers a neighbour's outline).
 * It keeps the yellow outline readable on the light basemap.
 */
export function ZoneAreaCasing(props: Props) {
  const { zone } = props;
  const style = { color: colors.mapAreaCasing, weight: AREA_OUTLINE_PX + 2, fill: false, interactive: false };
  return tooSmall(props) ? (
    <CircleMarker center={[zone.center_latitude, zone.center_longitude]} radius={ZONE_MAP.minPixelRadius} pathOptions={style} />
  ) : (
    <Circle center={[zone.center_latitude, zone.center_longitude]} radius={zone.radius_zona} pathOptions={style} />
  );
}

/** The zone area itself: no pin, no dot. Children (Popup, Tooltip) attach to the shape. */
export function ZoneArea({ children, ...props }: Props & { children?: ReactNode }) {
  const { zone } = props;
  const color = RISK_COLOR[zone.kategori_risiko];
  const style = { color, weight: AREA_OUTLINE_PX, fillColor: color, fillOpacity: AREA_FILL_OPACITY };
  return tooSmall(props) ? (
    <CircleMarker center={[zone.center_latitude, zone.center_longitude]} radius={ZONE_MAP.minPixelRadius} pathOptions={style}>
      {children}
    </CircleMarker>
  ) : (
    <Circle center={[zone.center_latitude, zone.center_longitude]} radius={zone.radius_zona} pathOptions={style}>
      {children}
    </Circle>
  );
}
