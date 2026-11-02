import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { BaseMap } from './BaseMap';
import { MapFrame } from './MapFrame';
import { PlacePin } from './PlacePin';
import { SchematicMapView } from './SchematicMapView';
import './LocationPicker.css';

interface Props {
  /** Current point, or undefined while the fields are empty or not numbers. */
  value: { lat: number; lng: number } | undefined;
  onPick: (lat: number, lng: number) => void;
}

const noop = () => undefined;

/** Keeps the typed point in view. */
function FollowValue({ value }: Pick<Props, 'value'>) {
  const map = useMap();
  useEffect(() => {
    if (map && value && !map.getBounds()?.contains(value)) map.panTo(value);
  }, [map, value]);
  return null;
}

/**
 * Figma Input Data Resmi map (beside Latitude/Longitude): click the map to fill the coordinates, or type them.
 * The point is a location, not a risk category, so it is the accent pin with a white edge. No address lookup happens here.
 * Without a Google Maps key the schematic map stands in, and a click on it picks a point the same way.
 */
export function LocationPicker({ value, onPick }: Props) {
  return (
    <div className="location-picker">
      <MapFrame
        className="location-map"
        label="Peta untuk memilih titik koordinat"
        fallback={<SchematicMapView zones={[]} onSelect={noop} onHover={noop} onPickPoint={onPick} pin={value} />}
      >
        <BaseMap
          zoom={12}
          cursor="crosshair"
          onClick={(e) => {
            const p = e.detail.latLng;
            if (p) onPick(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
          }}
        >
          <FollowValue value={value} />
          {value ? <PlacePin position={value} /> : null}
        </BaseMap>
      </MapFrame>
      <p className="location-hint">Klik peta untuk mengisi latitude dan longitude.</p>
    </div>
  );
}
