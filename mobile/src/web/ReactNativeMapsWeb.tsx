import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * Web stand-in for react-native-maps, which has no web build. metro.config.js points `react-native-maps` here for the web
 * bundle only, so Android and iOS keep the real map. It is used for the phone-frame preview in the web dashboard (presentation).
 *
 * It covers what the app uses: MapView (initialRegion, onPress, onRegionChangeComplete, scrollEnabled, zoomEnabled,
 * animateToRegion through the ref), Circle and Marker. The map is Web Mercator raster tiles from Esri's dark gray canvas
 * (no key; attribution shown as their terms ask), close to lib/mapStyle.ts. Zones are drawn in an SVG on top.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapPressEvent {
  nativeEvent: { coordinate: LatLng };
}

interface MapViewProps {
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  onPress?: (e: MapPressEvent) => void;
  onRegionChangeComplete?: (r: Region) => void;
  children?: ReactNode;
  // Accepted for compatibility with the native props the screens pass; they have no meaning here.
  customMapStyle?: unknown;
  showsUserLocation?: boolean;
  toolbarEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: string;
}

export interface MapViewHandle {
  animateToRegion: (region: Region, duration?: number) => void;
}

const TILE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DRAG_THRESHOLD_PX = 4;
// Esri's dark gray canvas (no key needed): the base, then its road and place labels on top.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const TILE_LAYERS = [
  (z: number, x: number, y: number) => `${ESRI}/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
  (z: number, x: number, y: number) => `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/${z}/${y}/${x}`,
];
const ATTRIBUTION = 'Esri, HERE, Garmin, © OpenStreetMap';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** World pixel position of a coordinate at a zoom (Web Mercator, 256 px tiles). */
function project(p: LatLng, zoom: number) {
  const size = TILE * 2 ** zoom;
  const s = Math.sin((clamp(p.latitude, -85, 85) * Math.PI) / 180);
  return { x: ((p.longitude + 180) / 360) * size, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * size };
}

function unproject(x: number, y: number, zoom: number): LatLng {
  const size = TILE * 2 ** zoom;
  const n = Math.PI - (2 * Math.PI * y) / size;
  return { latitude: (180 / Math.PI) * Math.atan(Math.sinh(n)), longitude: (x / size) * 360 - 180 };
}

/** Zoom at which `longitudeDelta` degrees fill `width` px. */
const zoomFor = (longitudeDelta: number, width: number) => clamp(Math.log2((width * 360) / (TILE * longitudeDelta)), MIN_ZOOM, MAX_ZOOM);

interface Camera {
  center: LatLng;
  zoom: number;
}

interface Projection {
  toPoint: (p: LatLng) => { x: number; y: number };
  metersPerPx: number;
}

const ProjectionContext = createContext<Projection | null>(null);

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(props, ref) {
  const { style, initialRegion, scrollEnabled = true, zoomEnabled = true, onPress, onRegionChangeComplete, children } = props;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [moved, setCamera] = useState<Camera>();
  // Until the map is moved, the camera is the initial region fitted to the box width.
  const camera = useMemo<Camera | undefined>(() => {
    if (moved) return moved;
    if (!size.w) return undefined;
    const r = initialRegion ?? { latitude: -6.9175, longitude: 107.6191, latitudeDelta: 0.28, longitudeDelta: 0.28 };
    return { center: { latitude: r.latitude, longitude: r.longitude }, zoom: zoomFor(r.longitudeDelta, size.w) };
  }, [moved, size.w, initialRegion]);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const callbacks = useRef({ onPress, onRegionChangeComplete });
  callbacks.current = { onPress, onRegionChangeComplete };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const regionOf = (c: Camera): Region => {
    const mid = project(c.center, c.zoom);
    const nw = unproject(mid.x - size.w / 2, mid.y - size.h / 2, c.zoom);
    const se = unproject(mid.x + size.w / 2, mid.y + size.h / 2, c.zoom);
    return { ...c.center, latitudeDelta: Math.abs(nw.latitude - se.latitude), longitudeDelta: Math.abs(se.longitude - nw.longitude) };
  };
  const settled = (c: Camera) => callbacks.current.onRegionChangeComplete?.(regionOf(c));

  const anim = useRef(0);
  useImperativeHandle(ref, () => ({
    animateToRegion(region, duration = 400) {
      const from = cameraRef.current;
      if (!from || !size.w) return;
      const to: Camera = { center: { latitude: region.latitude, longitude: region.longitude }, zoom: zoomFor(region.longitudeDelta, size.w) };
      cancelAnimationFrame(anim.current);
      const start = performance.now();
      const step = (now: number) => {
        const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
        const e = 1 - (1 - t) ** 3;
        const c: Camera = {
          center: {
            latitude: from.center.latitude + (to.center.latitude - from.center.latitude) * e,
            longitude: from.center.longitude + (to.center.longitude - from.center.longitude) * e,
          },
          zoom: from.zoom + (to.zoom - from.zoom) * e,
        };
        setCamera(c);
        if (t < 1) anim.current = requestAnimationFrame(step);
        else settled(c);
      };
      anim.current = requestAnimationFrame(step);
    },
  }));

  // Drag to pan, click (without moving) to press, wheel to zoom around the pointer.
  const drag = useRef<{ x: number; y: number; start: Camera; moved: boolean; id: number }>(undefined);
  const pointAt = (clientX: number, clientY: number, c: Camera) => {
    const rect = box.current!.getBoundingClientRect();
    const mid = project(c.center, c.zoom);
    return unproject(mid.x + clientX - rect.left - size.w / 2, mid.y + clientY - rect.top - size.h / 2, c.zoom);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!camera) return;
    drag.current = { x: e.clientX, y: e.clientY, start: camera, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !scrollEnabled) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!d.moved) box.current?.setPointerCapture(d.id);
    d.moved = true;
    const mid = project(d.start.center, d.start.zoom);
    setCamera({ center: unproject(mid.x - dx, mid.y - dy, d.start.zoom), zoom: d.start.zoom });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = undefined;
    if (!d || !camera) return;
    if (d.moved) settled(camera);
    else callbacks.current.onPress?.({ nativeEvent: { coordinate: pointAt(e.clientX, e.clientY, camera) } });
  };

  const wheelTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const el = box.current;
    if (!el || !zoomEnabled) return;
    const onWheel = (e: WheelEvent) => {
      const c = cameraRef.current;
      if (!c) return;
      e.preventDefault();
      const zoom = clamp(c.zoom - e.deltaY * 0.002, MIN_ZOOM, MAX_ZOOM);
      // Keep the point under the cursor where it is.
      const rect = el.getBoundingClientRect();
      const ox = e.clientX - rect.left - el.clientWidth / 2;
      const oy = e.clientY - rect.top - el.clientHeight / 2;
      const mid = project(c.center, c.zoom);
      const under = unproject(mid.x + ox, mid.y + oy, c.zoom);
      const p = project(under, zoom);
      const next = { center: unproject(p.x - ox, p.y - oy, zoom), zoom };
      setCamera(next);
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => settled(next), 150);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settled reads refs and the current size
  }, [zoomEnabled, size.w, size.h]);

  const view = useMemo(() => {
    if (!camera || !size.w) return undefined;
    const mid = project(camera.center, camera.zoom);
    const left = mid.x - size.w / 2;
    const top = mid.y - size.h / 2;
    const tz = clamp(Math.round(camera.zoom), 0, MAX_ZOOM);
    const ts = TILE * 2 ** (camera.zoom - tz);
    const count = 2 ** tz;
    const tiles: { key: string; src: string; x: number; y: number }[] = [];
    for (let ty = Math.floor(top / ts); ty <= Math.floor((top + size.h) / ts); ty++) {
      if (ty < 0 || ty >= count) continue;
      for (let tx = Math.floor(left / ts); tx <= Math.floor((left + size.w) / ts); tx++) {
        const wx = ((tx % count) + count) % count;
        TILE_LAYERS.forEach((url, layer) =>
          tiles.push({ key: `${layer}/${tz}/${tx}/${ty}`, src: url(tz, wx, ty), x: tx * ts - left, y: ty * ts - top }),
        );
      }
    }
    const projection: Projection = {
      toPoint: (p) => {
        const q = project(p, camera.zoom);
        return { x: q.x - left, y: q.y - top };
      },
      metersPerPx: (156543.03392 * Math.cos((camera.center.latitude * Math.PI) / 180)) / 2 ** camera.zoom,
    };
    return { tiles, ts, projection };
  }, [camera, size.w, size.h]);

  return (
    <View style={[styles.root, style]}>
      <div
        ref={box}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = undefined)}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          touchAction: 'none',
          cursor: scrollEnabled ? 'grab' : 'default',
          userSelect: 'none',
        }}
      >
        {view?.tiles.map((t) => (
          <img
            key={t.key}
            src={t.src}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: t.x, top: t.y, width: view.ts + 0.5, height: view.ts + 0.5, pointerEvents: 'none' }}
          />
        ))}
        {view ? (
          <svg width={size.w} height={size.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <ProjectionContext.Provider value={view.projection}>{children}</ProjectionContext.Provider>
          </svg>
        ) : null}
        <span
          style={{
            position: 'absolute',
            right: 4,
            bottom: 2,
            fontSize: 9,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'sans-serif',
            pointerEvents: 'none',
          }}
        >
          {ATTRIBUTION}
        </span>
      </div>
    </View>
  );
});

export default MapView;

interface CircleProps {
  center: LatLng;
  radius: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  zIndex?: number;
}

export function Circle({ center, radius, strokeWidth = 1, strokeColor = colors.textPrimary, fillColor = 'transparent' }: CircleProps) {
  const p = useContext(ProjectionContext);
  if (!p) return null;
  const { x, y } = p.toPoint(center);
  return <circle cx={x} cy={y} r={radius / p.metersPerPx} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />;
}

interface MarkerProps {
  coordinate: LatLng;
  pinColor?: string;
  title?: string;
}

export function Marker({ coordinate, pinColor = colors.riskMerah, title }: MarkerProps) {
  const p = useContext(ProjectionContext);
  if (!p) return null;
  const { x, y } = p.toPoint(coordinate);
  return (
    <circle cx={x} cy={y} r={7} fill={pinColor} stroke={colors.textPrimary} strokeWidth={2}>
      {title ? <title>{title}</title> : null}
    </circle>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', backgroundColor: colors.bg },
});
