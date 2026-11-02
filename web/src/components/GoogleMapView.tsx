import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { BaseMap } from './BaseMap';
import type { MapViewProps, MapViewZone } from './mapViewTypes';
import { ZoneArea, type ZoneEmphasis } from './ZoneArea';

/** Moves the map to the picked zone (keeping the zoom), so a zone chosen in the list comes into view. */
function Follow({ zone }: { zone: MapViewZone | undefined }) {
  const map = useMap();
  const last = useRef<number>(undefined);
  useEffect(() => {
    if (!map || !zone || last.current === zone.id) return;
    last.current = zone.id;
    if (!map.getBounds()?.contains({ lat: zone.lat, lng: zone.lng })) map.moveCamera({ center: { lat: zone.lat, lng: zone.lng } });
  }, [map, zone]);
  return null;
}

/**
 * The Google Maps implementation of MapView (dark style, centre Bandung Raya, zoom 11): a marker and a circle of the
 * zone's radius in its category colour. Meant to sit inside a MapFrame, which waits for the script.
 */
export function GoogleMapView({ zones, selectedId, onSelect, onHover }: MapViewProps) {
  const selected = zones.find((z) => z.id === selectedId);
  const emphasisOf = (z: MapViewZone): ZoneEmphasis | undefined => (selected ? (z.id === selected.id ? 'selected' : 'dim') : undefined);
  // The picked zone is drawn last, so it is on top of its neighbours.
  const ordered = [...zones].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId));
  return (
    <BaseMap restrict onClick={() => onSelect(undefined)}>
      <Follow zone={selected} />
      {ordered.map((z) => (
        <ZoneArea
          key={z.id}
          zone={{ zona_id: z.id, center_latitude: z.lat, center_longitude: z.lng, radius_zona: z.radius, kategori_risiko: z.kategori }}
          emphasis={emphasisOf(z)}
          marker
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </BaseMap>
  );
}
