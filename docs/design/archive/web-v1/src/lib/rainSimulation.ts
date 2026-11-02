import { useSyncExternalStore } from 'react';
import { FAKTOR_HUJAN, hitungSkor } from './zoneScore';
import type { KategoriRisiko, Zona } from '../types';

// The "Simulasi hujan" switch of the Admin Beranda: one global value, shared by every screen that shows zone scores
// and kept for the browser tab (sessionStorage). It never reaches the server; it only shows what the weather factor
// of docs/01 step 3 would do.
const KEY = 'roady.simulasi-hujan';

function read() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false; // storage blocked: the switch still works, it just forgets on reload
  }
}

let raining = read();
const listeners = new Set<() => void>();

export function setRainSimulation(on: boolean) {
  raining = on;
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // see read()
  }
  listeners.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => void listeners.delete(notify);
};

/** [raining, setRaining] of the global rain simulation. */
export function useRainSimulation() {
  return [useSyncExternalStore(subscribe, () => raining), setRainSimulation] as const;
}

/** docs/01 step 3: a weather-dependent zone counts 1,5 times in rain. */
export const RAIN_FACTOR = FAKTOR_HUJAN;

/**
 * Score and category of a zone under the simulation, from the pure function in shared/zoneScore.ts: the zone's stored
 * score is the base, the 1,5 factor applies in rain to a zone with more than 60% of its incidents in rain, capped at 100.
 * Simplified on purpose: the official score is a percentile over all zones (docs/01 step 4), which only the scheduler
 * computes. Without the share of rain incidents (`porsiHujan`, 0 to 1) the zone's weather_dependent flag stands in for it.
 */
export function simulatedRisk(
  zone: Pick<Zona, 'skor_risiko' | 'weather_dependent'>,
  rain: boolean,
  porsiHujan: number = zone.weather_dependent ? 1 : 0,
): { skor: number; kategori: KategoriRisiko; faktorHujanAktif: boolean } {
  const { skor, kategori, faktorHujanAktif } = hitungSkor({ skorDasar: zone.skor_risiko, hujan: rain, porsiKejadianHujan: porsiHujan });
  return { skor, kategori, faktorHujanAktif };
}
