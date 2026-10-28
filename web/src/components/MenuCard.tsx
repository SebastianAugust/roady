import { Link } from 'react-router-dom';
import { MenuIcon, type MenuIconName } from './icons';
import './MenuCard.css';

interface Props {
  to: string;
  icon: MenuIconName;
  title: string;
  description: string;
}

/** Home menu card (Figma Home Dishub 1010:1263 / Admin 1036:3772): icon left, title and one-line purpose. */
export function MenuCard({ to, icon, title, description }: Props) {
  return (
    <Link to={to} className="menu-card glass-in">
      <MenuIcon name={icon} />
      <span className="menu-card-text">
        <span className="menu-card-title">{title}</span>
        <span className="menu-card-desc">{description}</span>
      </span>
    </Link>
  );
}
