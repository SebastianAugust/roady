type Cell = string | number | boolean | null | undefined;

/** RFC 4180 field: quoted when it holds a comma, quote or line break. Leading = + - @ are prefixed with ' against formula injection in spreadsheets. */
function field(value: Cell) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Builds CSV from an explicit column list, so only the listed keys can ever reach the file. */
export function toCsv<T>(rows: T[], columns: readonly (keyof T & string)[]) {
  const lines = [columns.join(','), ...rows.map((r) => columns.map((c) => field(r[c] as Cell)).join(','))];
  return lines.join('\r\n') + '\r\n';
}
