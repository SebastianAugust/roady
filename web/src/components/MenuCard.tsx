import { Link } from 'react-router-dom';
import { MenuIcon, type MenuIconName } from './icons';
import './MenuCard.css';

interface Props {
  to: string;
  icon: MenuIconName;
  title: string;
  description: string;
  /** A white pill on the right ("3 zona merah", "CSV"); left out while its number is still loading. */
  badge?: string;
}

/**
 * Beranda menu card (prototype-web-cards.html .qcard): icon, title and one-line purpose, a white count pill on the
 * right. The whole card is the link; the pill is part of its name ("Statistik Zona, 3 zona merah").
 */
export function MenuCard({ to, icon, title, description, badge }: Props) {
  return (
    <Link to={to} className="menu-card glass-in">
      <MenuIcon name={icon} size={30} />
      <span className="menu-card-text">
        <span className="menu-card-title">{title}</span>
        <span className="menu-card-desc">{description}</span>
      </span>
      {badge ? <span className="menu-card-badge">{badge}</span> : null}
    </Link>
  );
}
