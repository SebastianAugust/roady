import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Leaflet only measures its container at start and on window resize. A container that changes size afterwards (a tab
 * panel that was hidden, a layout that settles after the fonts load) leaves grey or missing tiles until the map is
 * told, so this calls invalidateSize on every size change of the container.
 */
export function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}
