const pad = (n: number) => String(n).padStart(2, '0');

/** ISO timestamp -> 20-10-2026 09:00 in the phone's time zone. Not Intl, which Hermes may lack on older Android. */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
