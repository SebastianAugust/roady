import { useEffect, useState, type ReactNode } from 'react';
import './PhoneFrame.css';

const clock = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

/**
 * A handset drawn around `children` (the mobile app at 412x892, its Figma size): bezel, rounded screen, a status bar with
 * the live time, signal, wifi and battery, and the camera island. The status bar sits ABOVE the screen content, since the
 * app in the browser has no safe-area inset of its own. Purely decorative apart from the content.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(clock);
  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="phone">
      <span className="phone-button phone-button-power" aria-hidden="true" />
      <span className="phone-button phone-button-volume" aria-hidden="true" />
      <div className="phone-screen">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">{time}</span>
          <span className="phone-island" />
          <span className="phone-icons">
            <svg viewBox="0 0 18 12" width="18" height="12">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
              <rect x="10" y="3" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg viewBox="0 0 16 12" width="16" height="12">
              <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0z" />
              <path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.2 1.2a4.8 4.8 0 0 0-6.8 0z" />
              <path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.2 1.2a7.9 7.9 0 0 0-11.2 0z" />
            </svg>
            <svg viewBox="0 0 26 12" width="26" height="12">
              <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.6" />
              <rect x="2.5" y="2.5" width="15" height="7" rx="1.5" />
              <rect x="23.5" y="4" width="2" height="4" rx="1" opacity="0.6" />
            </svg>
          </span>
        </div>
        <div className="phone-content">{children}</div>
      </div>
    </div>
  );
}
