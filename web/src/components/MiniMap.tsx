import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { MAP_TILES } from '../config';
import { colors } from '../theme/tokens';
import './MiniMap.css';

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** Static preview (cards): no dragging, zooming or controls, and hidden from assistive tech. */
  still?: boolean;
  className?: string;
}

/**
 * The map with one pin from the Figma detail and card frames. The pin is a place, not a risk category,
 * so it uses the accent fill with the white edge of the zone markers.
 */
export function MiniMap({ latitude, longitude, zoom = 15, still = false, className }: Props) {
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
        <CircleMarker
          center={[latitude, longitude]}
          radius={still ? 7 : 9}
          pathOptions={{ color: colors.white, weight: 2, fillColor: colors.accent, fillOpacity: 1 }}
        />
      </MapContainer>
    </div>
  );
}
