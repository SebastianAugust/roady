import { useMemo, useState } from 'react';
import { localDayKey } from '../lib/format';
import './Dashboard.css';

const DAYS = 7;
const WEEKDAY = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });

/** Counts items per local day for the last 7 days, today last; `dateOf` returns a YYYY-MM-DD (or longer ISO) string. */
function lastWeek<T>(items: T[], dateOf: (item: T) => string, now: Date) {
  const counts = new Map<string, number>();
  items.forEach((i) => counts.set(dateOf(i).slice(0, 10), (counts.get(dateOf(i).slice(0, 10)) ?? 0) + 1));
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return { label: WEEKDAY.format(d), count: counts.get(localDayKey(d)) ?? 0 };
  });
}

interface Props<T> {
  title: string;
  items: T[];
  dateOf: (item: T) => string;
  /** Accessible name of the chart. */
  label?: string;
}

/** A bar chart of the last 7 days in plain CSS: the bars grow from the baseline one after another (motion.css, .bar-grow). */
export function WeekBars<T>({ title, items, dateOf, label = 'Jumlah per hari' }: Props<T>) {
  // Read once per visit (a lazy initializer, so render stays pure).
  const [now] = useState(() => new Date());
  const days = useMemo(() => lastWeek(items, dateOf, now), [items, dateOf, now]);
  const peak = Math.max(1, ...days.map((d) => d.count));
  return (
    <section className="panel glass-in hover-lift" aria-labelledby="week-bars-title">
      <h2 id="week-bars-title" className="panel-title">
        {title}
      </h2>
      <ol className="bars" aria-label={label}>
        {days.map((d, i) => (
          <li key={i}>
            <span className="bar-count">{d.count}</span>
            <span className="bar bar-grow" style={{ height: `${Math.round((d.count / peak) * 100)}%`, animationDelay: `${i * 60}ms` }} />
            <span className="bar-day">{d.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
