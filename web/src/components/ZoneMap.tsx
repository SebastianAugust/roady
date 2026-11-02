import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { MAP_VIEW } from '../config';
import { formatCoords, formatDateTime } from '../lib/format';
import { RISK_COLOR, RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { zonaDetail } from '../routes';
import type { ZonaTeratas } from '../types';
import { BaseMap } from './BaseMap';
import { EmptyState } from './EmptyState';
import { MapFrame } from './MapFrame';
import { RiskBadge } from './RiskBadge';
import { AREA_FILL_OPACITY, AREA_OUTLINE_PX, ZoneArea, type ZoneEmphasis } from './ZoneArea';
import './ZoneMap.css';

/** Legend rows: category, and what the percentile limits of docs/01 step 5 mean. */
const LEGEND: Record<(typeof RISK_ORDER)[number], string> = {
  merah: 'skor lebih dari 80',
  kuning: 'skor 50 sampai 80',
  hijau: 'skor kurang dari 50',
};

/** Zoom that shows one zone with its surroundings (a 300 m circle fills about a third of the map). */
const FOCUS_ZOOM = 15;

/** Moves to the zone picked in the dropdown, and back to the start view when the pick is cleared. */
function ZoneCamera({ zone }: { zone: ZonaTeratas | undefined }) {
  const map = useMap();
  const moved = useRef(false);
  useEffect(() => {
    if (!map) return;
    if (zone) {
      // One atomic move: panning and zooming separately lets the bounds restriction undo the pan at the old zoom.
      map.moveCamera({ center: { lat: zone.center_latitude, lng: zone.center_longitude }, zoom: FOCUS_ZOOM });
      moved.current = true;
    } else if (moved.current) {
      map.moveCamera({ center: MAP_VIEW.center, zoom: MAP_VIEW.zoom });
      moved.current = false;
    }
  }, [map, zone]);
  return null;
}

interface Props {
  zones: ZonaTeratas[];
  /** The zone picked above the table: it is highlighted, the view moves to it and the other zones are dimmed. */
  selectedId?: number;
  /** Text for a filtered view, e.g. "Zona Merah", shown on the map so a missing zone is not a mystery. */
  filterLabel?: string;
}

/**
 * Peta Zona Risiko, the "Peta" tab of Statistik Zona (Dishub only; no web frame in Figma), on Google Maps in the dark
 * Roady style, starting on Bandung Raya at zoom 11. Every zone is an AREA (a circle of its own radius_zona, filled 30%,
 * outlined 2 px in its risk colour) with a marker at its centre, so it stays visible and clickable when zoomed far out.
 * A click on a marker or area opens the info panel (name, score, number of incidents, link to Detail Zona); a click on
 * the map or on the close button closes it. The map pans and zooms and stays inside Bandung Raya.
 */
export function ZoneMap({ zones, selectedId, filterLabel }: Props) {
  // A click remembers which dropdown pick it was made under; once the dropdown changes the pick wins again.
  const [clicked, setClicked] = useState<{ id: number | null; forSelected: number | undefined }>();
  const openId = clicked && clicked.forSelected === selectedId ? clicked.id : selectedId;
  const panelZone = openId == null ? undefined : zones.find((z) => z.zona_id === openId);
  const selected = selectedId === undefined ? undefined : zones.find((z) => z.zona_id === selectedId);
  const highlightId = openId ?? selectedId;

  // Highest risk last (on top), the highlighted zone after all of them.
  const ordered = useMemo(
    () =>
      [...zones].sort(
        (a, b) => Number(a.zona_id === highlightId) - Number(b.zona_id === highlightId) || RISK_ORDER.indexOf(b.kategori_risiko) - RISK_ORDER.indexOf(a.kategori_risiko),
      ),
    [zones, highlightId],
  );
  const emphasisOf = (z: ZonaTeratas): ZoneEmphasis | undefined =>
    z.zona_id === highlightId ? 'selected' : selected ? 'dim' : undefined;

  return (
    <MapFrame className="peta-card" label="Peta zona risiko. Daftar zona yang sama tersedia di tab Tabel.">
      <BaseMap restrict onClick={() => setClicked({ id: null, forSelected: selectedId })}>
        <ZoneCamera zone={selected} />
        {ordered.map((z) => (
          <ZoneArea key={z.zona_id} zone={z} emphasis={emphasisOf(z)} marker onSelect={(id) => setClicked({ id, forSelected: selectedId })} />
        ))}
      </BaseMap>

      <div className="peta-legend" role="group" aria-label="Legenda">
        <p className="peta-legend-title">Skor risiko (persentil)</p>
        <ul>
          {RISK_ORDER.map((k) => (
            <li key={k}>
              <RiskArea kategori={k} />
              <span>
                <span className="risk-label">{RISK_LABEL[k]}</span>
                <span className="peta-legend-range">{LEGEND[k]}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="peta-legend-note">Titik = pusat zona. Lingkaran = radius zona.</p>
      </div>

      <div className="peta-left">
        {filterLabel ? <p className="peta-chip">Menampilkan: {filterLabel}</p> : null}
        {selected ? <p className="peta-chip">Zona {selected.zona_id} disorot; zona lain diredupkan</p> : null}
        {panelZone ? <ZoneInfo zone={panelZone} onClose={() => setClicked({ id: null, forSelected: selectedId })} /> : null}
      </div>

      {zones.length === 0 ? (
        <div className="peta-status">
          <EmptyState title="Belum ada zona" description="Belum ada zona risiko untuk ditampilkan." />
        </div>
      ) : null}
    </MapFrame>
  );
}

/** The info panel of the picked zone: name, score, number of incidents. Escape closes it. */
function ZoneInfo({ zone: z, onClose }: { zone: ZonaTeratas; onClose: () => void }) {
  return (
    <aside
      className="peta-info"
      aria-label={`Info Zona ${z.zona_id}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <button type="button" className="peta-info-close" aria-label="Tutup info zona" onClick={onClose}>
        ×
      </button>
      <p className="zone-popup-title">Zona {z.zona_id}</p>
      <p className="zone-popup-place">{z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude)}</p>
      <RiskBadge kategori={z.kategori_risiko} />
      <dl>
        <dt>Skor risiko</dt>
        <dd>{Math.round(z.skor_risiko)}%</dd>
        <dt>Jumlah kejadian</dt>
        <dd>{z.jumlah_kejadian}</dd>
        <dt>Bergantung cuaca</dt>
        <dd>{z.weather_dependent ? 'Ya' : 'Tidak'}</dd>
        <dt>Radius zona</dt>
        <dd>{z.radius_zona} m</dd>
        <dt>Diperbarui</dt>
        <dd>{formatDateTime(z.last_updated)}</dd>
      </dl>
      <Link to={zonaDetail(z.zona_id)} className="zone-popup-link">
        Lihat detail zona
      </Link>
    </aside>
  );
}

/** Legend swatch drawn like a zone: the risk colour at the area fill opacity with the 2 px outline. */
function RiskArea({ kategori }: { kategori: keyof typeof LEGEND }) {
  const color = RISK_COLOR[kategori];
  return (
    <span
      className="peta-swatch"
      aria-hidden="true"
      style={{ borderColor: color, borderWidth: AREA_OUTLINE_PX, background: `color-mix(in srgb, ${color} ${AREA_FILL_OPACITY * 100}%, transparent)` }}
    />
  );
}
