import { RISK_LABEL } from '../lib/risk';
import type { Zona } from '../types';
import { BaseMap } from './BaseMap';
import { MapFrame } from './MapFrame';
import { PlacePin } from './PlacePin';
import { RiskDot } from './RiskDot';
import { ZoneArea } from './ZoneArea';
import './MiniMap.css';

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** Static preview (cards): no dragging, zooming or controls, and hidden from assistive tech. */
  still?: boolean;
  className?: string;
  /** The zone the place belongs to: drawn as an area (real radius, risk colour) under the pin, with a small label. */
  zone?: Zona;
  /** The one-place pin (default). The Detail Zona map has no pin: the area is the subject. */
  pin?: boolean;
}

/**
 * The map with one pin from the Figma detail and card frames (Google Maps, dark style). The pin is a place, not a risk
 * category. When the zone is known its circle is drawn around it, so the detail shows where the zone starts and ends.
 * Every map that is shown is a billed Google map load, so `still` previews in long lists are worth a thought.
 */
export function MiniMap({ latitude, longitude, zoom = 15, still = false, className, zone, pin = true }: Props) {
  const position = { lat: latitude, lng: longitude };
  return (
    <MapFrame className={`mini-map${className ? ` ${className}` : ''}`} compact={still} label="Peta lokasi">
      <BaseMap key={`${latitude},${longitude}`} center={position} zoom={zoom} still={still}>
        {zone ? <ZoneArea zone={zone} /> : null}
        {pin ? <PlacePin position={position} size={still ? 7 : 9} /> : null}
      </BaseMap>
      {zone ? (
        <p className="mini-map-zone">
          <RiskDot kategori={zone.kategori_risiko} />
          Zona {zone.zona_id} · {RISK_LABEL[zone.kategori_risiko]} · radius {zone.radius_zona} m
        </p>
      ) : null}
    </MapFrame>
  );
}
