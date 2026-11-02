import {
  DEFAULT_GEOFENCE_OPTIONS,
  EMPTY_GEOFENCE_STATE,
  evaluateGeofence,
  findZonesWithin,
  GeofenceState,
  GeofenceZone,
  haversineMeters,
  isValidCoordinate,
} from '..';

const ZONE_LAT = -6.9436;
const ZONE_LNG = 107.6958;
const M_PER_DEG_LAT = (Math.PI / 180) * 6371000;
const MIN = 60_000;

const zone = (id: number, kategori_risiko: GeofenceZone['kategori_risiko'] = 'merah', lat = ZONE_LAT, lng = ZONE_LNG): GeofenceZone => ({
  zona_id: id,
  center_latitude: lat,
  center_longitude: lng,
  kategori_risiko,
});

/** A point `meters` due north of the sample zone. */
const north = (meters: number) => ({ latitude: ZONE_LAT + meters / M_PER_DEG_LAT, longitude: ZONE_LNG });

describe('haversineMeters', () => {
  it('is 0 for the same point', () => {
    expect(haversineMeters(north(0), north(0))).toBe(0);
  });

  it('matches a known distance (Bandung to Jakarta is about 116 km)', () => {
    const d = haversineMeters({ latitude: -6.9175, longitude: 107.6191 }, { latitude: -6.2088, longitude: 106.8456 });
    expect(d / 1000).toBeGreaterThan(110);
    expect(d / 1000).toBeLessThan(125);
  });

  it('is NaN for invalid input', () => {
    expect(haversineMeters({ latitude: NaN, longitude: 0 }, north(0))).toBeNaN();
    expect(haversineMeters(north(0), { latitude: 91, longitude: 0 })).toBeNaN();
  });
});

describe('findZonesWithin', () => {
  const zones = [zone(1)];

  it('includes a zone exactly at the radius', () => {
    const p = north(300);
    const exact = haversineMeters(p, { latitude: ZONE_LAT, longitude: ZONE_LNG });
    expect(findZonesWithin(p, zones, exact)).toHaveLength(1);
    expect(exact).toBeCloseTo(300, 3);
  });

  it('includes 299 m and excludes 301 m at the 300 m radius', () => {
    expect(findZonesWithin(north(299), zones, 300)).toHaveLength(1);
    expect(findZonesWithin(north(301), zones, 300)).toHaveLength(0);
  });

  it('returns two simultaneous zones, closest first', () => {
    const hits = findZonesWithin(north(0), [zone(1, 'merah', north(200).latitude), zone(2, 'kuning', north(100).latitude)], 300);
    expect(hits.map((h) => h.zone.zona_id)).toEqual([2, 1]);
  });

  it('returns nothing for an invalid position and skips invalid zones', () => {
    expect(findZonesWithin({ latitude: NaN, longitude: ZONE_LNG }, zones, 300)).toEqual([]);
    expect(findZonesWithin({ latitude: 0, longitude: 200 }, zones, 300)).toEqual([]);
    expect(findZonesWithin(north(0), [zone(9, 'merah', NaN, NaN), ...zones], 300).map((h) => h.zone.zona_id)).toEqual([1]);
  });
});

describe('isValidCoordinate', () => {
  it.each([
    [{ latitude: NaN, longitude: 0 }],
    [{ latitude: 0, longitude: Infinity }],
    [{ latitude: -90.1, longitude: 0 }],
    [{ latitude: 0, longitude: 180.1 }],
    [null],
    [undefined],
    [{ latitude: '1' as unknown as number, longitude: 0 }],
  ])('rejects %j', (c) => {
    expect(isValidCoordinate(c)).toBe(false);
  });

  it('accepts the range limits', () => {
    expect(isValidCoordinate({ latitude: -90, longitude: 180 })).toBe(true);
  });
});

describe('evaluateGeofence', () => {
  const zones = [zone(1)];
  const T0 = 1_000_000_000_000;
  const step = (state: GeofenceState, meters: number, at: number, z = zones) => evaluateGeofence(state, north(meters), z, at);

  it('warns on entering at exactly 300 m and not at 301 m', () => {
    const exact = { ...DEFAULT_GEOFENCE_OPTIONS, radiusM: haversineMeters(north(300), north(0)) };
    expect(evaluateGeofence(EMPTY_GEOFENCE_STATE, north(300), zones, T0, exact).alerts).toHaveLength(1);
    expect(step(EMPTY_GEOFENCE_STATE, 301, T0).alerts).toHaveLength(0);
  });

  it('does not repeat while the user stays inside, even long after the cooldown', () => {
    let r = step(EMPTY_GEOFENCE_STATE, 250, T0);
    expect(r.alerts).toHaveLength(1);
    r = step(r.state, 200, T0 + 60 * MIN);
    expect(r.alerts).toHaveLength(0);
  });

  it('stays quiet for exit then re-entry inside the cooldown', () => {
    let r = step(EMPTY_GEOFENCE_STATE, 250, T0);
    r = step(r.state, 500, T0 + 2 * MIN);
    r = step(r.state, 250, T0 + 5 * MIN);
    expect(r.alerts).toHaveLength(0);
    // The suppressed entry is consumed: staying inside after the cooldown still does not warn.
    r = step(r.state, 250, T0 + 30 * MIN);
    expect(r.alerts).toHaveLength(0);
  });

  it('warns again for exit then re-entry once the cooldown has passed', () => {
    let r = step(EMPTY_GEOFENCE_STATE, 250, T0);
    r = step(r.state, 500, T0 + 2 * MIN);
    r = step(r.state, 250, T0 + DEFAULT_GEOFENCE_OPTIONS.cooldownMin * MIN);
    expect(r.alerts).toHaveLength(1);
  });

  it('does not warn for re-entry just under the cooldown', () => {
    let r = step(EMPTY_GEOFENCE_STATE, 250, T0);
    r = step(r.state, 500, T0 + MIN);
    r = step(r.state, 250, T0 + DEFAULT_GEOFENCE_OPTIONS.cooldownMin * MIN - 1);
    expect(r.alerts).toHaveLength(0);
  });

  it('tracks two simultaneous zones independently and orders by severity', () => {
    const two = [zone(1, 'kuning', north(50).latitude), zone(2, 'merah', north(-100).latitude)];
    let r = evaluateGeofence(EMPTY_GEOFENCE_STATE, north(0), two, T0);
    expect(r.alerts.map((a) => a.zone.zona_id)).toEqual([2, 1]);
    // Leave only zone 2's radius; re-enter later after the cooldown: only zone 2 warns again.
    r = evaluateGeofence(r.state, north(340), two, T0 + MIN);
    expect(r.state[1].inside).toBe(true);
    expect(r.state[2].inside).toBe(false);
    r = evaluateGeofence(r.state, north(0), two, T0 + 20 * MIN);
    expect(r.alerts.map((a) => a.zone.zona_id)).toEqual([2]);
  });

  it('ignores categories that are not configured', () => {
    const r = step(EMPTY_GEOFENCE_STATE, 100, T0, [zone(1, 'hijau')]);
    expect(r.alerts).toHaveLength(0);
    expect(r.state[1].inside).toBe(true);
  });

  it('leaves state untouched and warns nothing for an invalid position', () => {
    const entered = step(EMPTY_GEOFENCE_STATE, 100, T0);
    for (const bad of [{ latitude: NaN, longitude: NaN }, { latitude: 123, longitude: 0 }]) {
      const r = evaluateGeofence(entered.state, bad, zones, T0 + 20 * MIN);
      expect(r.alerts).toEqual([]);
      expect(r.state).toBe(entered.state);
    }
    // A glitch must not count as an exit: coming back to a valid fix inside does not warn again.
    expect(step(entered.state, 100, T0 + 30 * MIN).alerts).toHaveLength(0);
  });

  it('drops zones that disappear from the list', () => {
    const entered = step(EMPTY_GEOFENCE_STATE, 100, T0);
    expect(step(entered.state, 100, T0 + MIN, []).state).toEqual({});
  });

  it('does not mutate the previous state', () => {
    const before = step(EMPTY_GEOFENCE_STATE, 500, T0).state;
    const snapshot = JSON.stringify(before);
    step(before, 100, T0 + MIN);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
