import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { ROUTES } from '../routes';
import { AccountMenu } from './AccountMenu';
import './AppHeader.css';

/** The top of the app shell (prototype-web-cards.html .head): the wordmark on the left, the account chip on the right. */
export function AppHeader() {
  return (
    <header className="app-header">
      <Link to={ROUTES.beranda} className="app-wordmark">
        {APP_NAME}
      </Link>
      <AccountMenu />
    </header>
  );
}
