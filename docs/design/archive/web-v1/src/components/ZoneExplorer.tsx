import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRainSimulation } from '../lib/rainSimulation';
import { RISK_LABEL, RISK_ORDER } from '../lib/risk';
import { viewZones, type ZoneView } from '../lib/zoneRisk';
import { AMBANG_PORSI_HUJAN, FAKTOR_HUJAN } from '../lib/zoneScore';
import { zonaDetail } from '../routes';
import type { KategoriRisiko, Statistics, ZonaTeratas } from '../types';
import { MapView } from './MapView';
import type { MapViewZone } from './mapViewTypes';
import { RiskBadge } from './RiskBadge';
import { Chip, EmptyState, Switch } from './ui';
import './ZoneExplorer.css';

type Filter = KategoriRisiko | 'semua';

const placeOf = (z: ZonaTeratas) => z.lokasi_teks ?? `Zona ${z.zona_id}`;
const percent = (share: number) => `${Math.round(share * 100)}%`;

interface Props {
  zones: ZonaTeratas[];
  stats: Statistics;
}

/**
 * The "Peta" tab of Statistik Zona: category chips and the rain switch on top; the map on the left; on the right the
 * detail of the picked zone above the list of zones. Map and list are one selection: pick or hover in either and the
 * other follows. The colours are the category each zone has under the rain simulation, recomputed as the switch moves
 * (shared/zoneScore.ts).
 */
export function ZoneExplorer({ zones, stats }: Props) {
  const [rain, setRain] = useRainSimulation();
  const [filter, setFilter] = useState<Filter>('semua');
  const [selectedId, setSelectedId] = useState<number>();
  const [hoveredId, setHoveredId] = useState<number>();

  const views = useMemo(() => viewZones(zones, stats.riwayat_skor, rain), [zones, stats, rain]);
  const counts: Record<Filter, number> = {
    semua: views.length,
    merah: views.filter((v) => v.kategori === 'merah').length,
    kuning: views.filter((v) => v.kategori === 'kuning').length,
    hijau: views.filter((v) => v.kategori === 'hijau').length,
  };
  const shown = useMemo(
    () => views.filter((v) => filter === 'semua' || v.kategori === filter).sort((a, b) => b.skor - a.skor || a.zone.zona_id - b.zone.zona_id),
    [views, filter],
  );
  // A zone that left the filtered set (a filter, or the rain changed its category) is no longer picked.
  const selected = shown.find((v) => v.zone.zona_id === selectedId);

  const mapZones = useMemo<MapViewZone[]>(
    () =>
      shown.map((v) => ({
        id: v.zone.zona_id,
        lat: v.zone.center_latitude,
        lng: v.zone.center_longitude,
        radius: v.zone.radius_zona,
        kategori: v.kategori,
        skor: v.skor,
        label: placeOf(v.zone),
      })),
    [shown],
  );

  return (
    <div className="explorer">
      <div className="explorer-toolbar">
        <div className="explorer-chips" role="group" aria-label="Filter kategori zona">
          <Chip pressed={filter === 'semua'} onClick={() => setFilter('semua')}>
            Semua ({counts.semua})
          </Chip>
          {RISK_ORDER.map((k) => (
            <Chip key={k} pressed={filter === k} onClick={() => setFilter(filter === k ? 'semua' : k)}>
              {RISK_LABEL[k]} ({counts[k]})
            </Chip>
          ))}
        </div>
        <label className="explorer-rain">
          <span id="explorer-rain-label">Simulasi hujan</span>
          <Switch aria-labelledby="explorer-rain-label" checked={rain} onCheckedChange={setRain} />
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="explorer-empty glass-in">
          <EmptyState
            title="Tidak ada zona di kategori ini"
            description={rain ? 'Dengan simulasi hujan, tidak ada zona yang masuk kategori ini.' : 'Belum ada zona yang masuk kategori ini.'}
            action={{ label: 'Tampilkan semua zona', onClick: () => setFilter('semua') }}
          />
        </div>
      ) : (
        <div className="explorer-split">
          <MapView zones={mapZones} selectedId={selected?.zone.zona_id} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
          <aside className="explorer-side" aria-label="Rincian dan daftar zona">
            {selected ? <ZoneDetail view={selected} rain={rain} onClose={() => setSelectedId(undefined)} /> : null}
            <ZoneList shown={shown} selectedId={selected?.zone.zona_id} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
          </aside>
        </div>
      )}
    </div>
  );
}

function ZoneDetail({ view: v, rain, onClose }: { view: ZoneView<ZonaTeratas>; rain: boolean; onClose: () => void }) {
  const z = v.zone;
  const factor = v.faktorHujanAktif
    ? `Aktif (×${String(FAKTOR_HUJAN).replace('.', ',')})`
    : !rain
      ? 'Tidak aktif (cuaca cerah)'
      : `Tidak aktif (porsi hujan tidak lebih dari ${percent(AMBANG_PORSI_HUJAN)})`;
  return (
    <section className="explorer-detail glass-in" aria-labelledby="explorer-detail-title">
      <button type="button" className="explorer-detail-close" aria-label="Tutup rincian zona" onClick={onClose}>
        ×
      </button>
      <h2 id="explorer-detail-title" className="explorer-detail-title">
        Zona {z.zona_id}
      </h2>
      <p className="explorer-detail-place">{placeOf(z)}</p>
      <RiskBadge kategori={v.kategori} />
      <dl className="explorer-facts">
        <dt>Skor risiko</dt>
        <dd>
          {v.skor}%{v.skor !== z.skor_risiko ? <span className="explorer-base"> (dasar {z.skor_risiko}%)</span> : null}
        </dd>
        <dt>Jumlah kejadian</dt>
        <dd>{z.jumlah_kejadian}</dd>
        <dt>Kejadian saat hujan</dt>
        <dd>{percent(v.porsiHujan)}</dd>
        <dt>Faktor hujan</dt>
        <dd className={v.faktorHujanAktif ? 'explorer-factor-on' : undefined}>{factor}</dd>
      </dl>
      <Link to={zonaDetail(z.zona_id)} className="explorer-detail-link">
        Lihat detail zona
      </Link>
    </section>
  );
}

interface ListProps {
  shown: ZoneView<ZonaTeratas>[];
  selectedId: number | undefined;
  hoveredId: number | undefined;
  onSelect: (id: number | undefined) => void;
  onHover: (id: number | undefined) => void;
}

function ZoneList({ shown, selectedId, hoveredId, onSelect, onHover }: ListProps) {
  const list = useRef<HTMLUListElement>(null);
  // A zone picked on the map scrolls into view in the list.
  useEffect(() => {
    if (selectedId !== undefined) list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);
  return (
    <ul ref={list} className="explorer-list" aria-label="Daftar zona, skor tertinggi di atas">
      {shown.map((v) => (
        <li key={v.zone.zona_id}>
          <button
            type="button"
            className={`explorer-item${v.zone.zona_id === hoveredId ? ' is-hovered' : ''}`}
            aria-current={v.zone.zona_id === selectedId ? 'true' : undefined}
            onClick={() => onSelect(v.zone.zona_id === selectedId ? undefined : v.zone.zona_id)}
            onMouseEnter={() => onHover(v.zone.zona_id)}
            onMouseLeave={() => onHover(undefined)}
            onFocus={() => onHover(v.zone.zona_id)}
            onBlur={() => onHover(undefined)}
          >
            <span className="explorer-item-text">
              <span className="explorer-item-place">{placeOf(v.zone)}</span>
              <span className="explorer-item-meta">
                Zona {v.zone.zona_id} · {v.zone.jumlah_kejadian} kejadian
              </span>
            </span>
            <RiskBadge kategori={v.kategori} />
            <span className="explorer-item-score">{v.skor}%</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
