// Run from web/: npm test (node --test, no extra dependency; Node strips the TypeScript types by itself).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AMBANG_PORSI_HUJAN, FAKTOR_HUJAN, hitungSkor, kategoriDariSkor, RADIUS_PERINGATAN_M } from './zoneScore.ts';

test('categories: below 50 hijau, 50 to 80 kuning, above 80 merah', () => {
  assert.equal(kategoriDariSkor(0), 'hijau');
  assert.equal(kategoriDariSkor(49), 'hijau');
  assert.equal(kategoriDariSkor(50), 'kuning');
  assert.equal(kategoriDariSkor(80), 'kuning');
  assert.equal(kategoriDariSkor(81), 'merah');
  assert.equal(kategoriDariSkor(100), 'merah');
});

test('no rain: the base score is kept, whatever the share of rain incidents', () => {
  const r = hitungSkor({ skorDasar: 60, hujan: false, porsiKejadianHujan: 0.9 });
  assert.deepEqual(r, { skor: 60, kategori: 'kuning', faktorHujanAktif: false });
});

test('rain and a weather-dependent zone: times 1,5, rounded', () => {
  const r = hitungSkor({ skorDasar: 45, hujan: true, porsiKejadianHujan: 0.7 });
  assert.equal(r.skor, 68); // 67,5 rounds up
  assert.equal(r.kategori, 'kuning');
  assert.equal(r.faktorHujanAktif, true);
});

test('rain pushes a zone up a category', () => {
  assert.equal(hitungSkor({ skorDasar: 40, hujan: true, porsiKejadianHujan: 0.8 }).kategori, 'kuning'); // 60
  assert.equal(hitungSkor({ skorDasar: 60, hujan: true, porsiKejadianHujan: 0.8 }).kategori, 'merah'); // 90
});

test('the share must be MORE than 60 percent: exactly 0,6 does not count', () => {
  assert.equal(AMBANG_PORSI_HUJAN, 0.6);
  assert.equal(hitungSkor({ skorDasar: 50, hujan: true, porsiKejadianHujan: 0.6 }).faktorHujanAktif, false);
  assert.equal(hitungSkor({ skorDasar: 50, hujan: true, porsiKejadianHujan: 0.61 }).faktorHujanAktif, true);
});

test('the score is capped at 100', () => {
  assert.equal(hitungSkor({ skorDasar: 96, hujan: true, porsiKejadianHujan: 1 }).skor, 100);
  assert.equal(hitungSkor({ skorDasar: 100, hujan: true, porsiKejadianHujan: 1 }).skor, 100);
});

test('constants', () => {
  assert.equal(FAKTOR_HUJAN, 1.5);
  assert.equal(RADIUS_PERINGATAN_M, 300);
});
