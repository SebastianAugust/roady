import { RAIN_FACTOR, useRainSimulation } from '../lib/rainSimulation';
import { Switch } from './ui';
import './Dashboard.css';

/**
 * "Cuaca Bandung Raya" with the global "Simulasi hujan" switch (lib/rainSimulation.ts). The simulation never reaches the
 * server; every screen that shows zone scores reads the same switch.
 */
export function WeatherCard({ idPrefix = 'weather' }: { idPrefix?: string }) {
  const [rain, setRain] = useRainSimulation();
  const labelId = `${idPrefix}-rain-label`;
  return (
    <section className="weather-card glass-in hover-lift" aria-labelledby={`${idPrefix}-title`}>
      <div>
        <h2 id={`${idPrefix}-title`} className="panel-title">
          Cuaca Bandung Raya
        </h2>
        <p className="panel-note" role="status">
          {rain
            ? `Hujan. Zona yang kejadiannya lebih dari 60% saat hujan dikali ${String(RAIN_FACTOR).replace('.', ',')}.`
            : 'Cerah berawan. Faktor hujan tidak aktif.'}
        </p>
      </div>
      <label className="weather-switch">
        <span id={labelId}>Simulasi hujan</span>
        <Switch aria-labelledby={labelId} checked={rain} onCheckedChange={setRain} />
      </label>
    </section>
  );
}
