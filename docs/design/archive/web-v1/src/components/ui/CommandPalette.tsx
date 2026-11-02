import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './useModal';
import './CommandPalette.css';

export interface CommandItem {
  id: string;
  /** What the item does: "Buka Statistik Zona". */
  title: string;
  /** Small text on the right: where it lives or what kind it is ("Halaman", "Aksi"). */
  label?: string;
  action: () => void;
}

interface Props {
  items: CommandItem[];
  /** Controlled open state; leave both out and the palette opens and closes itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
}

/**
 * Ctrl/Cmd+K opens a search box over a list of commands: type to filter, Up/Down to move, Enter to run, Escape (or a
 * click outside) to close. Mount it once, near the root, with the list of things the current user can do.
 */
export function CommandPalette({ items, open: openProp, onOpenChange, placeholder = 'Cari halaman atau aksi…' }: Props) {
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = onOpenChange ?? setInner;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); // Firefox would focus its address bar
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return open ? createPortal(<Palette items={items} placeholder={placeholder} onClose={() => setOpen(false)} />, document.body) : null;
}

function Palette({ items, placeholder, onClose }: { items: CommandItem[]; placeholder: string; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  useModal(boxRef, inputRef, onClose);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.title} ${i.label ?? ''}`.toLowerCase().includes(q)) : items;
  }, [items, query]);
  const active = Math.min(index, results.length - 1);
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  const run = (item: CommandItem | undefined) => {
    if (!item) return;
    onClose();
    item.action();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!results.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setIndex((active + step + results.length) % results.length);
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      run(results[active]);
    }
  };

  return (
    <>
      <div className="palette-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={boxRef} className="palette" role="dialog" aria-modal="true" aria-label="Palet perintah">
        <input
          ref={inputRef}
          className="palette-input"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-label="Cari perintah"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={onKeyDown}
        />
        <ul id={listId} className="palette-list" role="listbox" aria-label="Hasil">
          {results.map((item, i) => (
            <li
              key={item.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className="palette-item"
              onMouseMove={() => setIndex(i)}
              onClick={() => run(item)}
            >
              <span>{item.title}</span>
              {item.label ? <span className="palette-item-label">{item.label}</span> : null}
            </li>
          ))}
        </ul>
        {results.length === 0 ? (
          <p className="palette-empty" role="status">
            Tidak ada hasil untuk “{query.trim()}”.
          </p>
        ) : null}
      </div>
    </>
  );
}
