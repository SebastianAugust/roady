import type { ReactNode } from 'react';
import { Map, type MapMouseEvent } from '@vis.gl/react-google-maps';
import { MAP_VIEW } from '../config';
import { DARK_MAP_STYLES } from '../lib/mapStyle';
import { colors } from '../theme/tokens';

interface Props {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  /** Static preview (cards): no controls, no dragging, no zooming. */
  still?: boolean;
  /** Keeps the view inside Bandung Raya (the zone map). */
  restrict?: boolean;
  /** Cursor over the map, e.g. "crosshair" while picking a point. */
  cursor?: string;
  onClick?: (e: MapMouseEvent) => void;
  children?: ReactNode;
}

/**
 * The one Google map every screen uses: Roady dark style, only the zoom buttons, no Street View or map-type switch,
 * and Google's own place icons are not clickable. The start view is Bandung Raya at zoom 11 unless told otherwise;
 * the view is "default", so the map stays free to pan and zoom (remount with a `key` to move it from outside).
 */
export function BaseMap({ center = MAP_VIEW.center, zoom = MAP_VIEW.zoom, still = false, restrict = false, cursor, onClick, children }: Props) {
  return (
    <Map
      defaultCenter={center}
      defaultZoom={zoom}
      minZoom={MAP_VIEW.minZoom}
      maxZoom={MAP_VIEW.maxZoom}
      styles={DARK_MAP_STYLES}
      backgroundColor={colors.bg}
      disableDefaultUI
      zoomControl={!still}
      gestureHandling={still ? 'none' : 'greedy'}
      keyboardShortcuts={!still}
      clickableIcons={false}
      restriction={restrict ? { latLngBounds: MAP_VIEW.bounds, strictBounds: false } : undefined}
      draggableCursor={cursor}
      onClick={onClick}
    >
      {children}
    </Map>
  );
}
