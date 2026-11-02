import { formatAddress, formatCoords, placeText } from '../address';

describe('formatAddress', () => {
  it('joins street, district and city', () => {
    expect(formatAddress({ street: 'Jl. Buahbatu', district: 'Margasari', city: 'Kota Bandung' })).toBe('Jl. Buahbatu, Margasari, Kota Bandung');
  });
  it('falls back to subregion and drops repeats', () => {
    expect(formatAddress({ street: 'Jl. Soekarno Hatta', subregion: 'Kota Bandung' })).toBe('Jl. Soekarno Hatta, Kota Bandung');
  });
  it('ignores a numeric or Plus Code name when there is no street', () => {
    expect(formatAddress({ name: '12', city: 'Cimahi' })).toBe('Cimahi');
    expect(formatAddress({ name: '4RHQ+2X', city: 'Cimahi' })).toBe('Cimahi');
  });
  it('returns null when empty', () => {
    expect(formatAddress({})).toBeNull();
    expect(formatAddress(undefined)).toBeNull();
  });
});

describe('placeText', () => {
  it('shows the saved address and the coordinates', () => {
    expect(placeText({ alamat_teks: 'Jl. A, Bandung', latitude: -6.9175, longitude: 107.6191 })).toBe('Jl. A, Bandung\n-6.9175, 107.6191');
  });
  it('shows compact coordinates when the address is null', () => {
    expect(placeText({ alamat_teks: null, latitude: -6.9175, longitude: 107.6191 })).toBe('-6.9175, 107.6191');
    expect(formatCoords(-6.91751, 107.61909)).toBe('-6.9175, 107.6191');
  });
});
