import type { ReactNode } from 'react';
import { BackButton } from './BackButton';
import './DetailHeader.css';

interface Props {
  title: string;
  subtitle: string;
  backTo: string;
  /** Right side of the header card (e.g. the status). */
  aside?: ReactNode;
}

/** Figma detail frames: round back button, then a header card with the place as title and date · time WIB below. */
export function DetailHeader({ title, subtitle, backTo, aside }: Props) {
  return (
    <div className="detail-header">
      <BackButton fallback={backTo} />
      <header className="detail-header-card glass-in">
        <div>
          <h1 className="detail-title">{title}</h1>
          <p className="detail-subtitle">{subtitle}</p>
        </div>
        {aside ? <div className="detail-aside">{aside}</div> : null}
      </header>
    </div>
  );
}
