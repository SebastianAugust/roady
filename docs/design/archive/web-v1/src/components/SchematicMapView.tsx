import { useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { BANDUNG_RAYA } from '../config';
import { RISK_COLOR, RISK_LABEL } from '../lib/risk';
import { colors } from '../theme/tokens';
import type { MapViewProps } from './mapViewTypes';
import './SchematicMap.css';

// The drawing is 1000 wide; its height follows the shape of the Bandung Raya box (about 55 km wide, 45 km tall).
const W = 1000;
const LAT_SPAN = BANDUNG_RAYA.maxLat - BANDUNG_RAYA.minLat;
const LNG_SPAN = BANDUNG_RAYA.maxLng - BANDUNG_RAYA.minLng;
const H = Math.round(W * (LAT_SPAN / (LNG_SPAN * Math.cos(((BANDUNG_RAYA.center.latitude * Math.PI) / 180)))));
const METERS_PER_PX = (LNG_SPAN * 111_320 * Math.cos((BANDUNG_RAYA.center.latitude * Math.PI) / 180)) / W;
/** A zone whose real radius is smaller than this on screen is drawn at this size so it stays visible and clickable. */
const MIN_RADIUS_PX = 11;

const x = (lng: number) => ((lng - BANDUNG_RAYA.minLng) / LNG_SPAN) * W;
const y = (lat: number) => ((BANDUNG_RAYA.maxLat - lat) / LAT_SPAN) * H;
const points = (line: [number, number][]) => line.map(([lat, lng]) => `${x(lng).toFixed(1)},${y(lat).toFixed(1)}`).join(' ');

// Main roads as [lat, lng] polylines, hand-placed after the real ones; this is a sketch, not a survey.
const MAJOR_ROADS: { name: string; line: [number, number][] }[] = [
  { name: 'Tol Padaleunyi', line: [[-6.955, 107.5], [-6.947, 107.58], [-6.94, 107.64], [-6.926, 107.7], [-6.921, 107.76], [-6.935, 107.84], [-6.985, 107.92]] },
  { name: 'Jl. Soekarno-Hatta', line: [[-6.945, 107.585], [-6.9447, 107.6409], [-6.9419, 107.6701], [-6.9436, 107.6958], [-6.94, 107.73]] },
  { name: 'Jl. Raya Cibiru - Cicalengka', line: [[-6.915, 107.7], [-6.9183, 107.7256], [-6.9275, 107.7708], [-6.9697, 107.793], [-6.9858, 107.835]] },
];
const MINOR_ROADS: [number, number][][] = [
  [[-6.8393, 107.5745], [-6.8935, 107.615], [-6.9034, 107.6188], [-6.9218, 107.6071], [-6.9501, 107.6118], [-6.9902, 107.6293]],
  [[-6.8722, 107.542], [-6.9034, 107.58], [-6.9218, 107.6071]],
  [[-6.9218, 107.6071], [-6.9183, 107.7256]],
  [[-6.9034, 107.6188], [-6.9275, 107.7708]],
  [[-6.9501, 107.6118], [-6.9697, 107.793]],
];
const PLACES: { name: string; lat: number; lng: number }[] = [
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Cimahi', lat: -6.8722, lng: 107.542 },
  { name: 'Lembang', lat: -6.8393, lng: 107.5745 },
  { name: 'Jatinangor', lat: -6.9275, lng: 107.7708 },
  { name: 'Cicalengka', lat: -6.9858, lng: 107.835 },
  { name: 'Bojongsoang', lat: -6.9902, lng: 107.6293 },
];

interface Props extends MapViewProps {
  /** A click on empty map reports its coordinates (the coordinate picker of Arsip & Input). */
  onPickPoint?: (lat: number, lng: number) => void;
  /** A place marker (not a zone), e.g. the point picked so far. */
  pin?: { lat: number; lng: number };
}

/**
 * The schematic map: a drawing of Bandung Raya with the main roads and each zone as a circle, used where Google Maps has
 * no key (or fails). Same props as GoogleMapView. Zones are buttons: Tab to move, Enter or Space to pick.
 */
export function SchematicMapView({ zones, selectedId, hoveredId, onSelect, onHover, onPickPoint, pin }: Props) {
  const svg = useRef<SVGSVGElement>(null);

  const background = (e: MouseEvent<SVGRectElement>) => {
    onSelect(undefined);
    const el = svg.current;
    const matrix = el?.getScreenCTM();
    if (!onPickPoint || !el || !matrix) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const lat = BANDUNG_RAYA.maxLat - (p.y / H) * LAT_SPAN;
    const lng = BANDUNG_RAYA.minLng + (p.x / W) * LNG_SPAN;
    onPickPoint(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
  };
  const onKey = (id: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  // The picked zone last, so it is drawn over the others.
  const ordered = [...zones].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId));
  return (
    <svg
      ref={svg}
      className={`schematic${onPickPoint ? ' schematic-pick' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label="Peta skematik Bandung Raya. Zona adalah tombol; daftar zona yang sama ada di samping peta."
    >
      <rect className="schematic-bg" x="0" y="0" width={W} height={H} fill={colors.bg} onClick={background} />
      <g className="schematic-grid" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={(W / 5) * i} y1="0" x2={(W / 5) * i} y2={H} />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={`h${i}`} x1="0" y1={(H / 4) * i} x2={W} y2={(H / 4) * i} />
        ))}
      </g>
      <g aria-hidden="true" pointerEvents="none">
        {MINOR_ROADS.map((line, i) => (
          <polyline key={i} className="schematic-road schematic-road-minor" points={points(line)} />
        ))}
        {MAJOR_ROADS.map((r) => (
          <polyline key={r.name} className="schematic-road schematic-road-major" points={points(r.line)} />
        ))}
        {PLACES.map((p) => (
          <text key={p.name} className="schematic-place" x={x(p.lng)} y={y(p.lat)}>
            {p.name}
          </text>
        ))}
      </g>

      {ordered.map((z) => {
        const color = RISK_COLOR[z.kategori];
        const selected = z.id === selectedId;
        const hovered = z.id === hoveredId;
        const r = Math.max(MIN_RADIUS_PX, z.radius / METERS_PER_PX);
        return (
          <g
            key={z.id}
            className={`schematic-zone${selected ? ' is-selected' : ''}${hovered ? ' is-hovered' : ''}`}
            tabIndex={0}
            role="button"
            aria-pressed={selected}
            aria-label={`Zona ${z.id}, ${z.label}, ${RISK_LABEL[z.kategori]}, skor ${z.skor} persen`}
            transform={`translate(${x(z.lng).toFixed(1)} ${y(z.lat).toFixed(1)})`}
            onClick={() => onSelect(z.id)}
            onKeyDown={onKey(z.id)}
            onMouseEnter={() => onHover(z.id)}
            onMouseLeave={() => onHover(undefined)}
            onFocus={() => onHover(z.id)}
            onBlur={() => onHover(undefined)}
          >
            <circle className="schematic-area" r={r} fill={color} fillOpacity={selected ? 0.5 : 0.3} stroke={color} strokeWidth={selected ? 4 : 2} />
            <circle className="schematic-dot" r={selected ? 7.5 : 5.5} fill={color} stroke={colors.white} strokeWidth="2" />
          </g>
        );
      })}

      {pin ? (
        <circle className="schematic-pin" cx={x(pin.lng)} cy={y(pin.lat)} r="8" fill={colors.accent} stroke={colors.white} strokeWidth="2" pointerEvents="none" />
      ) : null}
    </svg>
  );
}
