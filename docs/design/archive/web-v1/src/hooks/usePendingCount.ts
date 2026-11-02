import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';

const CHANGED = 'roady:reports-changed';

/** Tells the sidebar badge (and anything else listening) that a report was decided or a decision was undone. */
export const notifyReportsChanged = () => window.dispatchEvent(new Event(CHANGED));

/**
 * Number of reports waiting for review (API-007 with status pending_review), for the badge of "Verifikasi Laporan".
 * It is read again on every page change and whenever notifyReportsChanged() is called, so the badge follows approvals,
 * rejections and undos at once; while it loads, or if it fails, the
 * last known number stays (undefined at first, so no badge).
 */
export function usePendingCount(enabled: boolean) {
  const { pathname } = useLocation();
  const [count, setCount] = useState<number>();
  const [changes, setChanges] = useState(0);
  useEffect(() => {
    const onChange = () => setChanges((n) => n + 1);
    window.addEventListener(CHANGED, onChange);
    return () => window.removeEventListener(CHANGED, onChange);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    api.getAdminReports({ status: 'pending_review' }).then(
      (reports) => alive && setCount(reports.length),
      () => undefined, // a badge is a hint; page requests handle errors and expired sessions
    );
    return () => {
      alive = false;
    };
  }, [enabled, pathname, changes]);
  return enabled ? count : undefined;
}
