// Line icons redrawn from the Figma confirmation frames; they take the text color (currentColor).

export function CloudDownloadIcon({ size = 150 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 17H6.5a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 16.6 8.1 3.75 3.75 0 0 1 17.5 17H16" />
      <path d="M12 11.5v9M8.75 17.75 12 21l3.25-3.25" />
    </svg>
  );
}

export function SentCheckIcon({ size = 150 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2.5 10.2 20.5 3l-4.2 13.6-4.3-2.3-2.4 3.2-1.3-5.2-5.8-2.1Z" fill="currentColor" />
      <path d="M8.3 12.3 18.8 4.6" stroke="var(--color-surface)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="17" cy="17.5" r="4.25" fill="currentColor" stroke="var(--color-surface)" strokeWidth="1" />
      <path d="m15.2 17.6 1.3 1.3 2.4-2.6" stroke="var(--color-surface)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 14a8 8 0 0 1-6.2-2.95C7 15.4 9.3 14.5 12 14.5s5 .9 6.2 2.55A8 8 0 0 1 12 20Z" />
    </svg>
  );
}

export function LogoutIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
    </svg>
  );
}

/** Person raising a hand, the welcome illustration of the Home frames. */
export function WaveIcon({ size = 210 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 210 170" fill="currentColor" aria-hidden="true">
      <circle cx="128" cy="45" r="40" />
      <path d="M0 0h34v6c6 50 44 86 94 86 38 0 62 20 62 48v30H56V96C24 78 4 44 0 0Z" />
    </svg>
  );
}

// Menu card icons of the Home frames (24px line icons).
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const MENU_ICONS = {
  statistik: <path {...line} d="M4 20h16M6 20v-6h3v6M10.5 20V8h3v12M15 20v-9h3v9" />,
  input: <path {...line} d="M4 4h16M12 20V8M7 13l5-5 5 5" />,
  laporan: (
    <g {...line}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 3l5 5v3M14 3v5h5M8 12h6M8 16h3" />
      <circle cx="17" cy="17" r="3" />
      <path d="m19.2 19.2 1.8 1.8" />
    </g>
  ),
  ekspor: <path {...line} d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M12 12v6M9 15l3 3 3-3" />,
  peta: <path {...line} d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  verifikasi: <path {...line} d="M9 4h6v3H9zM9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3M8.5 14l2.5 2.5 4.5-5" />,
  kecelakaan: (
    <g {...line}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </g>
  ),
};

export type MenuIconName = keyof typeof MENU_ICONS;

export function MenuIcon({ name, size = 36 }: { name: MenuIconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {MENU_ICONS[name]}
    </svg>
  );
}

export function BackIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
