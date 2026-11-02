import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { Skeleton } from '../components/Skeleton';
import { StatusPill } from '../components/StatusPill';
import { Chip, EmptyState, useToast } from '../components/ui';
import { BANDUNG_RAYA, ZONES_FETCH_RADIUS_M } from '../config';
import { errorMessage, useApi } from '../hooks/useApi';
import { notifyReportsChanged } from '../hooks/usePendingCount';
import { QUICK_APPROVE_REASONS } from '../lib/alasan';
import { CUACA_LABEL, formatDateTime, KATEGORI_LABEL, placeText } from '../lib/format';
import type { KeputusanVerifikasi, LaporanAdmin, StatusLaporan, Zona } from '../types';
import './VerifikasiPage.css';

type Filter = 'pending_review' | 'approved' | 'rejected' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'pending_review', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'all', label: 'Semua' },
];

/** Reasons offered when rejecting. `alasan` is what is stored (every reason needs at least ALASAN_VERIFIKASI_MIN_LENGTH characters). */
const REJECT_REASONS = [
  { label: 'Foto tidak jelas', alasan: 'Foto tidak jelas' },
  { label: 'Lokasi tidak sesuai', alasan: 'Lokasi tidak sesuai' },
  { label: 'Laporan ganda', alasan: 'Laporan ganda, kejadian yang sama sudah dilaporkan' },
  { label: 'Bukan kecelakaan', alasan: 'Bukan kecelakaan lalu lintas' },
] as const;

const REVIEWED: StatusLaporan[] = ['pending_review', 'approved', 'rejected'];

/** Queue first (oldest waiting first, as the API sorts it), then the decided ones, newest decision first. */
function byQueueThenDecided(a: LaporanAdmin, b: LaporanAdmin) {
  const aWaiting = a.status === 'pending_review';
  const bWaiting = b.status === 'pending_review';
  if (aWaiting !== bWaiting) return aWaiting ? -1 : 1;
  if (aWaiting) return a.timestamp.localeCompare(b.timestamp);
  return (b.waktu_verifikasi ?? '').localeCompare(a.waktu_verifikasi ?? '');
}

/** True while the user is typing somewhere, so single-letter shortcuts must not fire. */
function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

/**
 * Verifikasi Laporan as a split view (docs/design/prototype-web-v2.html, Admin): reports in a list on the left, the
 * selected one on the right. Only reports WITH a photo are here (without one a report is accepted automatically with
 * weight 0,5, docs/01 step 1). After Setujui or Tolak the next waiting report opens and a toast offers "Urungkan" for
 * 6 seconds. Keyboard (not while typing): J and K move, A approves, R starts a rejection. No reporter identity (NFR-006).
 */
export function VerifikasiPage() {
  const { signOut } = useAuth();
  const toast = useToast();
  const params = useParams();
  const load = useCallback(() => api.getAdminReports({}), []);
  const { state, retry } = useApi(load);
  const loadZones = useCallback(
    () => api.getZones({ lat: BANDUNG_RAYA.center.latitude, lng: BANDUNG_RAYA.center.longitude, radius: ZONES_FETCH_RADIUS_M }),
    [],
  );
  const { state: zoneState } = useApi(loadZones);
  const zones = useMemo(() => new Map<number, Zona>(zoneState.status === 'ready' ? zoneState.data.map((z) => [z.zona_id, z]) : []), [zoneState]);

  const [changed, setChanged] = useState<Record<number, LaporanAdmin>>({});
  const [filter, setFilter] = useState<Filter>('pending_review');
  const [selectedId, setSelectedId] = useState<number | undefined>(() => (params.id ? Number(params.id) : undefined));
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<(typeof REJECT_REASONS)[number]>();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();

  const reviewed = useMemo(
    () =>
      (state.status === 'ready' ? state.data : [])
        .map((r) => changed[r.id_report] ?? r)
        .filter((r) => r.foto_url && REVIEWED.includes(r.status))
        .sort(byQueueThenDecided),
    [state, changed],
  );
  const queue = useMemo(() => reviewed.filter((r) => r.status === 'pending_review'), [reviewed]);
  const counts: Record<Filter, number> = {
    pending_review: queue.length,
    approved: reviewed.filter((r) => r.status === 'approved').length,
    rejected: reviewed.filter((r) => r.status === 'rejected').length,
    all: reviewed.length,
  };
  const list = useMemo(() => (filter === 'all' ? reviewed : reviewed.filter((r) => r.status === filter)), [reviewed, filter]);
  const selected = list.find((r) => r.id_report === selectedId) ?? list[0];

  const select = (id: number | undefined) => {
    setSelectedId(id);
    setRejecting(false);
    setReason(undefined);
    setActionError(undefined);
  };

  async function undo(id: number) {
    try {
      const restored = await api.revertVerification(id);
      setChanged((c) => ({ ...c, [id]: restored }));
      setFilter('pending_review');
      select(id);
      notifyReportsChanged();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else toast(`Tidak dapat mengurungkan: ${errorMessage(err)}`);
    }
  }

  async function decide(report: LaporanAdmin, keputusan: KeputusanVerifikasi, alasan: string) {
    if (busy) return;
    setBusy(true);
    setActionError(undefined);
    try {
      const { laporan } = await api.verifyReport(report.id_report, { keputusan, alasan });
      // The next waiting report, otherwise the one before it; with none left the decided report stays in view.
      const waiting = queue.filter((r) => r.id_report !== report.id_report);
      const at = queue.findIndex((r) => r.id_report === report.id_report);
      const next = waiting[at] ?? waiting[at - 1];
      setChanged((c) => ({ ...c, [laporan.id_report]: laporan }));
      select(next?.id_report ?? laporan.id_report);
      notifyReportsChanged();
      toast(`Laporan #${laporan.id_report} ${keputusan === 'approved' ? 'disetujui' : 'ditolak'}.`, { undo: () => void undo(laporan.id_report) });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const approve = (r: LaporanAdmin) => decide(r, 'approved', QUICK_APPROVE_REASONS[0]);
  const startReject = () => setRejecting(true);

  // Keyboard shortcuts. The handler is rebuilt on every render and kept in a ref, so the listener is added only once.
  const keys = useRef<(e: KeyboardEvent) => void>(() => undefined);
  useEffect(() => {
    keys.current = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return; // a drawer or the command palette is open
      const key = e.key.toLowerCase();
      const at = selected ? list.findIndex((r) => r.id_report === selected.id_report) : -1;
      let handled = true;
      if (key === 'j' || key === 'k') {
        const target = list[Math.min(list.length - 1, Math.max(0, at + (key === 'j' ? 1 : -1)))];
        if (target) select(target.id_report);
      } else if (selected?.status === 'pending_review' && key === 'a') void approve(selected);
      else if (selected?.status === 'pending_review' && key === 'r') startReject();
      else if (key === 'escape' && rejecting) setRejecting(false);
      else handled = false;
      if (handled) e.preventDefault();
    };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keys.current(e);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <PageHeader title="Verifikasi Laporan" subtitle="Periksa foto dan keterangan, lalu setujui atau tolak laporan dari warga." />
      {state.status === 'loading' ? <SplitSkeleton /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' ? (
        <>
          <div className="verif-toolbar">
            <div className="verif-chips" role="group" aria-label="Filter status">
              {FILTERS.map((f) => (
                <Chip key={f.value} pressed={filter === f.value} onClick={() => setFilter(f.value)}>
                  {f.label} ({counts[f.value]})
                </Chip>
              ))}
            </div>
            <p className="verif-hint">
              <kbd>J</kbd> <kbd>K</kbd> pindah · <kbd>A</kbd> setujui · <kbd>R</kbd> tolak
            </p>
          </div>
          <p className="verif-note">Laporan tanpa foto masuk otomatis dengan bobot 0,5 dan tidak perlu diverifikasi.</p>

          {list.length === 0 ? (
            <div className="verif-empty glass-in">
              <EmptyState
                title={filter === 'pending_review' ? 'Antrean kosong' : 'Tidak ada laporan'}
                description={filter === 'pending_review' ? 'Semua laporan berfoto sudah ditinjau. Laporan baru muncul di sini.' : 'Belum ada laporan dengan status ini.'}
                action={filter === 'all' ? undefined : { label: 'Tampilkan semua', onClick: () => setFilter('all') }}
              />
            </div>
          ) : (
            <div className="verif-split">
              <ul className="verif-list" aria-label="Daftar laporan">
                {list.map((r) => (
                  <li key={r.id_report}>
                    <button
                      type="button"
                      className="verif-item"
                      aria-current={r.id_report === selected?.id_report ? 'true' : undefined}
                      onClick={() => select(r.id_report)}
                    >
                      <span className="verif-item-place">{placeText(r)}</span>
                      <span className="verif-item-meta">
                        {KATEGORI_LABEL[r.kategori]} · {formatDateTime(r.timestamp)}
                      </span>
                      <StatusPill status={r.status} />
                    </button>
                  </li>
                ))}
              </ul>

              {selected ? (
                <ReportDetail
                  key={selected.id_report}
                  report={selected}
                  zone={selected.zona_id === null ? undefined : zones.get(selected.zona_id)}
                  busy={busy}
                  error={actionError}
                  rejecting={rejecting}
                  reason={reason}
                  onReason={setReason}
                  onApprove={() => void approve(selected)}
                  onStartReject={startReject}
                  onCancelReject={() => setRejecting(false)}
                  onConfirmReject={() => reason && void decide(selected, 'rejected', reason.alasan)}
                />
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </>
  );
}

interface DetailProps {
  report: LaporanAdmin;
  zone: Zona | undefined;
  busy: boolean;
  error: string | undefined;
  rejecting: boolean;
  reason: (typeof REJECT_REASONS)[number] | undefined;
  onReason: (reason: (typeof REJECT_REASONS)[number]) => void;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onConfirmReject: () => void;
}

/** What approving would do, in the words of docs/01: weight 1,0 on the zone's base score; the scheduler recomputes the score. */
function impactText(r: LaporanAdmin) {
  const zone = r.zona_id === null ? 'zona' : `Zona ${r.zona_id}`;
  if (r.status === 'approved') return `Dihitung dengan bobot penuh: +1,0 pada skor dasar ${zone}.`;
  if (r.status === 'rejected') return `Tidak dihitung pada skor ${zone}.`;
  return `Jika disetujui: +1,0 pada skor dasar ${zone}. Skor risiko dihitung ulang oleh penjadwal.`;
}

function ReportDetail({ report: r, zone, busy, error, rejecting, reason, onReason, onApprove, onStartReject, onCancelReject, onConfirmReject }: DetailProps) {
  const firstReason = useRef<HTMLButtonElement>(null);
  // R opens the reasons: put the keyboard on the first one.
  useEffect(() => {
    if (rejecting) firstReason.current?.focus();
  }, [rejecting]);

  return (
    <article className="verif-detail glass-in" aria-labelledby="verif-title">
      <header className="verif-detail-head">
        <div>
          <h2 id="verif-title" className="verif-detail-title">
            Laporan #{r.id_report}
          </h2>
          <p className="verif-detail-meta">
            {KATEGORI_LABEL[r.kategori]} · {formatDateTime(r.timestamp)}
          </p>
        </div>
        <StatusPill status={r.status} />
      </header>

      <img className="verif-photo" src={r.foto_url ?? undefined} alt={`Foto laporan #${r.id_report}`} />
      <p className="verif-desc">{r.deskripsi}</p>

      <dl className="verif-facts">
        <div>
          <dt>Lokasi</dt>
          <dd>{placeText(r)}</dd>
        </div>
        <div>
          <dt>Zona</dt>
          <dd>
            {r.zona_id === null ? 'Di luar zona rawan' : `Zona ${r.zona_id}`}
            {zone ? <RiskBadge kategori={zone.kategori_risiko} /> : null}
          </dd>
        </div>
        <div>
          <dt>Cuaca saat kejadian</dt>
          <dd>{CUACA_LABEL[r.kondisi_cuaca_saat_kejadian]}</dd>
        </div>
        <div>
          <dt>Bobot validasi</dt>
          <dd>1,0 (dengan foto)</dd>
        </div>
        <div className="verif-fact-wide">
          <dt>Dampak ke skor zona</dt>
          <dd>{impactText(r)}</dd>
        </div>
        {r.status !== 'pending_review' ? (
          <div className="verif-fact-wide">
            <dt>Ditinjau</dt>
            <dd>
              {r.diverifikasi_oleh_kode ?? '-'}
              {r.waktu_verifikasi ? ` · ${formatDateTime(r.waktu_verifikasi)}` : ''}
              {r.alasan_verifikasi ? <span className="verif-reason-text">{r.alasan_verifikasi}</span> : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {r.status === 'pending_review' ? (
        rejecting ? (
          <fieldset className="verif-reject" disabled={busy}>
            <legend>Alasan penolakan</legend>
            <div className="verif-reasons" role="group">
              {REJECT_REASONS.map((o, i) => (
                <Chip key={o.label} ref={i === 0 ? firstReason : undefined} pressed={reason?.label === o.label} onClick={() => onReason(o)}>
                  {o.label}
                </Chip>
              ))}
            </div>
            <div className="verif-actions">
              <Button variant="secondary" onClick={onCancelReject}>
                Batal
              </Button>
              <Button variant="danger" busy={busy} disabled={!reason} onClick={onConfirmReject}>
                Konfirmasi tolak
              </Button>
            </div>
          </fieldset>
        ) : (
          <div className="verif-actions">
            <Button busy={busy} onClick={onApprove}>
              Setujui
            </Button>
            <Button variant="danger-outline" disabled={busy} onClick={onStartReject}>
              Tolak
            </Button>
          </div>
        )
      ) : null}
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}

function SplitSkeleton() {
  return (
    <div className="verif-split" role="status" aria-label="Memuat laporan…">
      <div className="verif-list">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} width="100%" height={68} radius="var(--radius-field)" />
        ))}
      </div>
      <Skeleton width="100%" height={420} radius="var(--radius-card)" />
    </div>
  );
}
