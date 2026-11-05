import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppBackground } from '../components/AppBackground';
import { Button } from '../components/Button';
import { PhoneFrame } from '../components/PhoneFrame';
import { MOBILE_PREVIEW_URL } from '../config';
import { APP_NAME } from '../constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { ROUTES } from '../routes';
import { size } from '../theme/tokens';
import './MobilePreviewPage.css';

/** Location state Login sets when a pengemudi account signs in (survives a reload, since it lives in history.state). */
export interface MobilePreviewState {
  pengemudi: true;
  email: string;
}

const PHONE_HEIGHT = size.phoneStatusBar + size.phoneScreenHeight + 2 * size.phoneBezel;
const PHONE_WIDTH = size.phoneScreenWidth + 2 * size.phoneBezel;
/** Room the page keeps around the phone (padding and, on narrow screens, the panel above it). */
const PAGE_MARGIN = 48;

/** Scale so the whole handset fits the window; never larger than 1 (the app keeps its Figma size). */
function fitScale() {
  return Math.min(1, (window.innerHeight - PAGE_MARGIN) / PHONE_HEIGHT, (window.innerWidth - 32) / PHONE_WIDTH);
}

type Reachability = 'checking' | 'up' | 'down';

/**
 * The pengemudi side for presentations: the real mobile app (Expo on web, `npm run web:preview` in mobile/) in a phone
 * frame, so it can be shown from the same laptop as the dashboards. Login sends a pengemudi account here instead of
 * refusing it; the pengemudi never enters the Dishub/Admin shell (no token is stored, docs/05 #30 and #45). The app inside
 * the frame keeps its own session; "Mulai dari awal" reloads it with ?reset=1, which clears that session and shows the
 * splash and onboarding again.
 */
export function MobilePreviewPage() {
  usePageTitle('Aplikasi Pengemudi');
  const navigate = useNavigate();
  const state = useLocation().state as MobilePreviewState | null;
  const [scale, setScale] = useState(fitScale);
  const [frameKey, setFrameKey] = useState(0);
  const [src, setSrc] = useState(MOBILE_PREVIEW_URL);
  const [reach, setReach] = useState<Reachability>('checking');

  useEffect(() => {
    const onResize = () => setScale(fitScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // A cross-origin iframe does not say whether it loaded, so ask the dev server directly (opaque response = it is up).
  useEffect(() => {
    let alive = true;
    fetch(MOBILE_PREVIEW_URL, { mode: 'no-cors', cache: 'no-store' }).then(
      () => alive && setReach('up'),
      () => alive && setReach('down'),
    );
    return () => {
      alive = false;
    };
  }, [frameKey]);

  if (!state?.pengemudi) return <Navigate to={ROUTES.login} replace />;

  const reload = (reset: boolean) => {
    setReach('checking');
    setSrc(reset ? `${MOBILE_PREVIEW_URL}/?reset=1` : MOBILE_PREVIEW_URL);
    setFrameKey((k) => k + 1);
  };

  return (
    <div className="mobile-preview">
      <AppBackground />
      <aside className="mobile-preview-panel glass rise">
        <p className="mobile-preview-brand">{APP_NAME}</p>
        <div>
          <h1 className="mobile-preview-title">Aplikasi Pengemudi</h1>
          <p className="mobile-preview-sub">
            Masuk sebagai <strong>{state.email}</strong>. Aplikasi pengemudi berjalan di ponsel; layar di samping adalah aplikasi
            mobile yang sama, ditampilkan di browser.
          </p>
        </div>
        <ul className="mobile-preview-tips">
          <li>Klik untuk mengetuk, seret untuk menggeser peta, gulir untuk memperbesar.</li>
          <li>Di dalam aplikasi, masuk dengan akun yang sama.</li>
          <li>Mulai dari awal: kembali ke splash dan onboarding.</li>
        </ul>
        <div className="mobile-preview-actions">
          <Button onClick={() => reload(true)}>Mulai dari awal</Button>
          <Button variant="secondary" onClick={() => reload(false)}>
            Muat ulang
          </Button>
          <Button variant="ghost" onClick={() => navigate(ROUTES.login, { replace: true })}>
            Keluar
          </Button>
        </div>
      </aside>

      <div className="mobile-preview-stage" style={{ width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <PhoneFrame>
            {reach === 'down' ? (
              <div className="mobile-preview-offline" role="alert">
                <p className="mobile-preview-offline-title">Aplikasi mobile belum berjalan</p>
                <p>
                  Jalankan <code>npm run web:preview</code> di folder <code>mobile/</code>, lalu tekan Muat ulang.
                </p>
                <p className="mobile-preview-offline-url">{MOBILE_PREVIEW_URL}</p>
              </div>
            ) : (
              <iframe key={frameKey} src={src} title={`Aplikasi ${APP_NAME} untuk pengemudi`} allow="geolocation" />
            )}
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
