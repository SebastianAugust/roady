import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import './Tabs.css';

interface Props<T extends string> {
  label: string;
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
}

/** Segmented tabs ("Tabel | Peta") with the WAI-ARIA tab pattern: arrow keys move between tabs, one panel shown. */
export function Tabs<T extends string>({ label, tabs, value, onChange, children }: Props<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent, index: number) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  }

  return (
    <>
      <div className="tabs" role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-${t.value}`}
            aria-selected={t.value === value}
            aria-controls={`${id}-panel`}
            tabIndex={t.value === value ? 0 : -1}
            className="tab"
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${value}`} className="tab-panel">
        {children}
      </div>
    </>
  );
}
