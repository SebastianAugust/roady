import { useSyncExternalStore, type ReactNode } from 'react';
import { APILoadingStatus, APIProvider, useApiLoadingStatus } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_KEY } from '../config';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import './MapFrame.css';

// Google loads the script fine even when the key is wrong or its referrer restriction refuses this site, and then
// calls window.gm_authFailure and paints its own "Ups!" over the map. Turn that into one flag every frame can read.
let authFailed = false;
const authListeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    authFailed = true;
    authListeners.forEach((notify) => notify());
  };
}
const subscribeAuthFailure = (notify: () => void) => {
  authListeners.add(notify);
  return () => void authListeners.delete(notify);
};
const getAuthFailed = () => authFailed;

interface Props {
  /** The size comes from this class (a height); the frame fills it. */
  className?: string;
  /** Accessible name of the map region. */
  label?: string;
  /** Small previews: messages shrink to one line and the whole map is hidden from assistive tech. */
  compact?: boolean;
  /** What to draw once the Google Maps script is ready: a <BaseMap>, legends and panels. */
  children: ReactNode;
  /** Shown instead of the Google map when there is no key, the script fails or the key is refused (e.g. the schematic map). */
  fallback?: ReactNode;
}

/**
 * The box every map sits in. It owns the three states around a Google map: no key (EmptyState "Peta belum
 * dikonfigurasi"), loading (a skeleton) and a script that failed or was refused (EmptyState with a reload button).
 * Children are only mounted once the API is loaded, so they may use the `google.maps` globals.
 */
export function MapFrame({ className, label, compact = false, children, fallback }: Props) {
  return (
    <div
      className={`map-frame${className ? ` ${className}` : ''}`}
      role={label && !compact ? 'region' : undefined}
      aria-label={label && !compact ? label : undefined}
      aria-hidden={compact || undefined}
    >
      {GOOGLE_MAPS_KEY ? (
        <APIProvider apiKey={GOOGLE_MAPS_KEY} language="id" region="ID">
          <MapGate compact={compact} fallback={fallback}>
            {children}
          </MapGate>
        </APIProvider>
      ) : (
        (fallback ?? <MapMessage kind="missing" compact={compact} />)
      )}
    </div>
  );
}

function MapGate({ compact, children, fallback }: { compact: boolean; children: ReactNode; fallback?: ReactNode }) {
  const status = useApiLoadingStatus();
  const refused = useSyncExternalStore(subscribeAuthFailure, getAuthFailed);
  if (refused) return fallback ?? <MapMessage kind="refused" compact={compact} />;
  if (status === APILoadingStatus.LOADED) return <>{children}</>;
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return fallback ?? <MapMessage kind={status === APILoadingStatus.AUTH_FAILURE ? 'refused' : 'failed'} compact={compact} />;
  }
  return (
    <div className="map-frame-fill" role="status" aria-label="Memuat peta…">
      <Skeleton width="100%" height="100%" radius={0} />
    </div>
  );
}

const MESSAGES = {
  missing: { title: 'Peta belum dikonfigurasi', text: 'Kunci Google Maps belum diisi. Hubungi pengelola sistem untuk mengaktifkan peta.' },
  failed: { title: 'Peta gagal dimuat', text: 'Periksa koneksi internet, lalu muat ulang halaman.' },
  refused: { title: 'Peta gagal dimuat', text: 'Google menolak kunci peta ini. Periksa pembatasan domain dan API yang diaktifkan pada kunci.' },
} as const;

function MapMessage({ kind, compact }: { kind: keyof typeof MESSAGES; compact: boolean }) {
  const m = MESSAGES[kind];
  return (
    <div className="map-frame-fill map-frame-message">
      {compact ? (
        <p className="map-frame-compact">{m.title}</p>
      ) : (
        <EmptyState
          title={m.title}
          description={m.text}
          action={kind === 'missing' ? undefined : { label: 'Muat ulang', onClick: () => window.location.reload() }}
        />
      )}
    </div>
  );
}
