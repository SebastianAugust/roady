import { Marker } from '@vis.gl/react-google-maps';
import { colors } from '../theme/tokens';

/** The one-place pin: a place, not a risk category, so it is the accent blue with a white edge (readable on the dark map). */
export function PlacePin({ position, size = 9 }: { position: google.maps.LatLngLiteral; size?: number }) {
  return (
    <Marker
      position={position}
      clickable={false}
      zIndex={1000}
      icon={{ path: google.maps.SymbolPath.CIRCLE, scale: size, fillColor: colors.accent, fillOpacity: 1, strokeColor: colors.white, strokeWeight: 2 }}
    />
  );
}
