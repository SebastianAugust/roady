import { formatDateTime } from '../lib/format';
import { choiceLabel, LOCATION_KEYS, TEMPLATES, type JenisLaporan, type ReportValues } from '../lib/reportTemplates';
import { Button } from './Button';

interface Props {
  jenis: JenisLaporan;
  /** Fills the form with the example. */
  onUse: () => void;
}

const asList = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

/** The display text of one example answer. */
function show(field: (typeof TEMPLATES)[JenisLaporan]['fields'][number], v: ReportValues): string {
  switch (field.kind) {
    case 'datetime':
      return formatDateTime(String(v[field.key]));
    case 'location':
      return `${v[LOCATION_KEYS.alamat]} (${v[LOCATION_KEYS.latitude]}, ${v[LOCATION_KEYS.longitude]})`;
    case 'multiselect':
      return asList(v[field.key]).map((x) => choiceLabel(field.options ?? [], x)).join(', ');
    case 'select':
      return choiceLabel(field.options ?? [], String(v[field.key]));
    case 'count':
      return `${v[field.key]} orang`;
    case 'photo':
      return v[field.key] ? String(v[field.key]) : 'Tidak ada (opsional)';
    default:
      return String(v[field.key]);
  }
}

/** One complete example of a good entry for the chosen kind (from shared/reportTemplates.ts), with a button that fills the form with it. */
export function ReportExample({ jenis, onUse }: Props) {
  const template = TEMPLATES[jenis];
  return (
    <details className="report-example glass-in" open>
      <summary>Contoh pengisian yang baik: {template.label}</summary>
      <dl>
        {template.fields.map((f) => (
          <div key={f.key}>
            <dt>{f.label}</dt>
            <dd>{show(f, template.contoh)}</dd>
          </div>
        ))}
      </dl>
      <Button variant="secondary" className="btn-sm" onClick={onUse}>
        Isi formulir dengan contoh ini
      </Button>
    </details>
  );
}
