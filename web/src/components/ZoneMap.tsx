import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { latLng, latLngBounds } from 'leaflet';
import { Link } from 'react-router-dom';
import { BANDUNG_RAYA, MAP_TILES, ZONE_MAP } from '../config';
import { formatCoords, formatDateTime } from '../lib/format';
import { RISK_COLOR, RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { zonaDetail } from '../routes';
import type { ZonaTeratas } from '../types';
import { AREA_FILL_OPACITY, AREA_OUTLINE_PX, ZoneArea, ZoneAreaCasing } from './ZoneArea';
import { LoadState } from './LoadState';
import { MapResizer } from './MapResizer';
import { RiskBadge } from './RiskBadge';
import './ZoneMap.css';

const CENTER: [number, number] = [BANDUNG_RAYA.center.latitude, BANDUNG_RAYA.center.longitude];

/** Legend rows: category, and what the percentile limits of docs/01 step 5 mean. */
const LEGEND: Record<(typeof RISK_ORDER)[number], string> = {
  merah: 'skor lebih dari 80',
  kuning: 'skor 50 sampai 80',
  hijau: 'skor kurang dari 50',
};

/** Fits the view to every zone (with its radius) whenever the set of zones changes. */
function FitToZones({ zones }: { zones: ZonaTeratas[] }) {
  const map = useMap();
  const key = zones.map((z) => z.zona_id).join(',');
  useEffect(() => {
    if (!zones.length) return;
    const bounds = latLngBounds(zones.map((z) => latLng(z.center_latitude, z.center_longitude).toBounds(z.radius_zona * 2)).flatMap((b) => [b.getSouthWest(), b.getNorthEast()]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    // The key stands for the zone list: refit when zones appear, disappear or are filtered, not on every render.
  }, [map, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Reports the zoom level, so zones too small to see are drawn at a minimum size (ZoneArea). */
function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) });
  useEffect(() => onZoom(map.getZoom()), [map, onZoom]);
  return null;
}

interface Props {
  zones: ZonaTeratas[];
  /** Text for a filtered view, e.g. "Zona Merah", shown on the map so a missing zone is not a mystery. */
  filterLabel?: string;
}

/**
 * Peta Zona Risiko, the "Peta" tab of Statistik Zona (Dishub only; no web frame in Figma). Every zone is an AREA: a
 * circle of its own radius_zona around its centre, filled 30% and outlined 2 px in its risk colour, so where a zone
 * starts and ends is visible and overlapping zones still read through their outlines. There are no pins and no clusters.
 * A click opens a compact popup with a link to the Detail Zona page. The map pans and zooms, fits all zones at first
 * and stays inside Bandung Raya. At a far zoom a zone whose real radius is under a few pixels is drawn a little larger.
 */
export function ZoneMap({ zones, filterLabel }: Props) {
  const [zoom, setZoom] = useState<number>();
  // Casings first, then the areas, with the highest risk on top.
  const ordered = useMemo(() => [...zones].sort((a, b) => RISK_ORDER.indexOf(b.kategori_risiko) - RISK_ORDER.indexOf(a.kategori_risiko)), [zones]);
  // A basemap that fails to load (blocked, a tile account that refuses the domain) is announced instead of leaving a silent grey map.
  const [tiles, setTiles] = useState({ loaded: 0, failed: 0 });

  return (
    <section className="peta-card" aria-label="Peta zona risiko. Daftar zona yang sama tersedia di tab Tabel.">
      <MapContainer
        center={CENTER}
        zoom={12}
        minZoom={ZONE_MAP.minZoom}
        maxZoom={ZONE_MAP.maxZoom}
        maxBounds={ZONE_MAP.bounds}
        maxBoundsViscosity={1}
        className="peta-map"
        scrollWheelZoom
      >
        <TileLayer
          url={MAP_TILES.url}
          attribution={MAP_TILES.attribution}
          subdomains={MAP_TILES.subdomains}
          maxZoom={ZONE_MAP.maxZoom}
          eventHandlers={{
            tileload: () => setTiles((t) => ({ ...t, loaded: t.loaded + 1 })),
            tileerror: () => setTiles((t) => ({ ...t, failed: t.failed + 1 })),
          }}
        />
        <MapResizer />
        <ZoomTracker onZoom={setZoom} />
        <FitToZones zones={zones} />
        {ordered.map((z) => (
          <ZoneAreaCasing key={`casing-${z.zona_id}`} zone={z} zoom={zoom} />
        ))}
        {ordered.map((z) => (
          <ZoneArea key={z.zona_id} zone={z} zoom={zoom}>
            <Tooltip sticky>
              Zona {z.zona_id} · {RISK_LABEL[z.kategori_risiko]}
            </Tooltip>
            <Popup>
              <div className="zone-popup">
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
              </div>
            </Popup>
          </ZoneArea>
        ))}
      </MapContainer>

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
        <p className="peta-legend-note">Area = radius zona. Pada zoom jauh, zona kecil digambar sedikit lebih besar agar tetap terlihat.</p>
      </div>

      {filterLabel ? <p className="peta-filter">Menampilkan: {filterLabel}</p> : null}
      {tiles.failed > 0 && tiles.loaded === 0 ? (
        <p className="peta-notice" role="status">
          Peta dasar tidak dapat dimuat. Area zona tetap ditampilkan; periksa koneksi atau pengaturan penyedia peta (docs/05 #35).
        </p>
      ) : null}
      {zones.length === 0 ? (
        <div className="peta-status">
          <LoadState state="empty" message="Belum ada zona risiko untuk ditampilkan." />
        </div>
      ) : null}
    </section>
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
