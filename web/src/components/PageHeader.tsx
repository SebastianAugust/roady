import type { ReactNode } from 'react';
import './PageHeader.css';

interface Props {
  title: string;
  subtitle?: string;
  /** Buttons on the right of the title row. */
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
