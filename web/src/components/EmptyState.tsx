import type { ReactNode } from 'react';
import { Button } from './Button';
import { InboxIcon } from './icons';
import './EmptyState.css';

interface Props {
  /** Short and active: "Antrean kosong", "Belum ada zona". */
  title: string;
  /** One sentence on why it is empty or what to do next. */
  description: string;
  icon?: ReactNode;
  /** The one thing the user can do about it (e.g. clear a filter). */
  action?: { label: string; onClick: () => void };
}

/** What a list or table shows when it has no rows: icon, title, one sentence and an optional button. */
export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon">{icon ?? <InboxIcon />}</span>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {action ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
