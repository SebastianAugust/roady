import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { BANDUNG_RAYA, MAP_TILES } from '../config';
import { colors } from '../theme/tokens';
import './LocationPicker.css';

interface Props {
  /** Current point, or undefined while the fields are empty or not numbers. */
  value: { lat: number; lng: number } | undefined;
  onPick: (lat: number, lng: number) => void;
}

function ClickToPick({ onPick }: Pick<Props, 'onPick'>) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))) });
  return null;
}

/** Keeps the typed point in view. */
function FollowValue({ value }: Pick<Props, 'value'>) {
  const map = useMap();
  useEffect(() => {
    if (value && !map.getBounds().contains([value.lat, value.lng])) map.panTo([value.lat, value.lng]);
  }, [map, value]);
  return null;
}

/**
 * Figma Input Data Resmi map (beside Latitude/Longitude): click the map to fill the coordinates, or type them.
 * The point is a location, not a risk category, so it uses the accent color with the white edge of the zone markers.
 */
export function LocationPicker({ value, onPick }: Props) {
  return (
    <div className="location-picker">
      <MapContainer center={[BANDUNG_RAYA.center.latitude, BANDUNG_RAYA.center.longitude]} zoom={12} className="location-map">
        <TileLayer url={MAP_TILES.url} attribution={MAP_TILES.attribution} subdomains={MAP_TILES.subdomains} maxZoom={MAP_TILES.maxZoom} />
        <ClickToPick onPick={onPick} />
        <FollowValue value={value} />
        {value ? (
          <CircleMarker
            center={[value.lat, value.lng]}
            radius={9}
            pathOptions={{ color: colors.white, weight: 2, fillColor: colors.accent, fillOpacity: 1 }}
          />
        ) : null}
      </MapContainer>
      <p className="location-hint">Klik peta untuk mengisi latitude dan longitude.</p>
    </div>
  );
}
