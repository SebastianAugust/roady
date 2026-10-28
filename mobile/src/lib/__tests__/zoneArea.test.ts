import { drawnRadius, metersPerDp, MIN_VISIBLE_DP, withAlpha, zoneAtPoint } from '../zoneArea';
import type { Zona } from '../../types';

const zone = (id: number, lat: number, lng: number, radius = 300): Zona => ({
  zona_id: id,
  center_latitude: lat,
  center_longitude: lng,
  radius_zona: radius,
  skor_risiko: 50,
  kategori_risiko: 'kuning',
  jumlah_kejadian: 5,
  weather_dependent: false,
  last_updated: '2026-10-20T02:00:00.000Z',
});

describe('withAlpha', () => {
  it('turns a hex colour into rgba', () => {
    expect(withAlpha('#FD0000', 0.3)).toBe('rgba(253, 0, 0, 0.3)');
    expect(withAlpha('#3E8139', 0.25)).toBe('rgba(62, 129, 57, 0.25)');
  });
});

describe('metersPerDp and drawnRadius', () => {
  it('is 0 before the map is measured, and then nothing is enlarged', () => {
    expect(metersPerDp(0.12, 0)).toBe(0);
    expect(drawnRadius(300, 0)).toBe(300);
  });

  it('keeps the real radius when it is big enough on screen', () => {
    const mpd = metersPerDp(0.01, 600); // close zoom, about 1.9 m per dp
    expect(drawnRadius(300, mpd)).toBe(300);
  });

  it('enlarges a zone that would be smaller than the minimum size', () => {
    const mpd = metersPerDp(0.28, 600); // whole Bandung Raya, about 52 m per dp
    expect(drawnRadius(300, mpd)).toBeCloseTo(MIN_VISIBLE_DP * mpd);
    expect(drawnRadius(300, mpd)).toBeGreaterThan(300);
  });
});

describe('zoneAtPoint', () => {
  const a = zone(1, -6.9436, 107.6958);
  const b = zone(2, -6.9419, 107.6701);
  const close = metersPerDp(0.01, 600);

  it('finds the zone a tap is inside', () => {
    expect(zoneAtPoint([a, b], { latitude: -6.9437, longitude: 107.6959 }, close)?.zona_id).toBe(1);
  });

  it('finds nothing far from every zone', () => {
    expect(zoneAtPoint([a, b], { latitude: -6.9, longitude: 107.6 }, close)).toBeUndefined();
  });

  it('forgives a tap just outside a tiny zone at a far zoom', () => {
    const far = metersPerDp(0.28, 600);
    // about 700 m east of the centre: outside the 300 m radius, inside the enlarged shape plus the finger tolerance
    expect(zoneAtPoint([a], { latitude: -6.9436, longitude: 107.7021 }, far)?.zona_id).toBe(1);
    expect(zoneAtPoint([a], { latitude: -6.9436, longitude: 107.7021 }, close)).toBeUndefined();
  });

  it('picks the zone the tap is deepest inside when zones overlap', () => {
    const big = zone(3, -6.9436, 107.6958, 900);
    const small = zone(4, -6.9436, 107.6998, 300);
    expect(zoneAtPoint([big, small], { latitude: -6.9436, longitude: 107.6998 }, close)?.zona_id).toBe(4);
    expect(zoneAtPoint([big, small], { latitude: -6.9436, longitude: 107.6958 }, close)?.zona_id).toBe(3);
  });

  it('ignores an invalid tap', () => {
    expect(zoneAtPoint([a], { latitude: Number.NaN, longitude: 107.6958 }, close)).toBeUndefined();
  });
});
