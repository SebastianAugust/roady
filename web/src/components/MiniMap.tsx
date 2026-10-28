import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { MAP_TILES } from '../config';
import { RISK_LABEL } from '../lib/risk';
import { colors } from '../theme/tokens';
import type { Zona } from '../types';
import { MapResizer } from './MapResizer';
import { RiskDot } from './RiskDot';
import { ZoneArea, ZoneAreaCasing } from './ZoneArea';
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
 * The map with one pin from the Figma detail and card frames. The pin is a place, not a risk category, so it is dark
 * with a white edge (readable on the light basemap). When the zone is known its circle is drawn around it, so the
 * detail shows where the zone starts and ends.
 */
export function MiniMap({ latitude, longitude, zoom = 15, still = false, className, zone, pin = true }: Props) {
  return (
    <div className={`mini-map${className ? ` ${className}` : ''}`} aria-hidden={still || undefined}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        className="mini-map-canvas"
        dragging={!still}
        scrollWheelZoom={false}
        doubleClickZoom={!still}
        touchZoom={!still}
        boxZoom={!still}
        keyboard={!still}
        zoomControl={!still}
        attributionControl={!still}
      >
        <TileLayer url={MAP_TILES.url} attribution={MAP_TILES.attribution} subdomains={MAP_TILES.subdomains} maxZoom={MAP_TILES.maxZoom} />
        <MapResizer />
        {zone ? (
          <>
            <ZoneAreaCasing zone={zone} />
            <ZoneArea zone={zone} />
          </>
        ) : null}
        {pin ? (
          <CircleMarker
            center={[latitude, longitude]}
            radius={still ? 7 : 9}
            // markerPane sits above the zone area whatever order they were added in (the zone arrives after its request).
            pathOptions={{ color: colors.white, weight: 2, fillColor: colors.mapPin, fillOpacity: 1, pane: 'markerPane' }}
          />
        ) : null}
      </MapContainer>
      {zone ? (
        <p className="mini-map-zone">
          <RiskDot kategori={zone.kategori_risiko} />
          Zona {zone.zona_id} · {RISK_LABEL[zone.kategori_risiko]} · radius {zone.radius_zona} m
        </p>
      ) : null}
    </div>
  );
}
