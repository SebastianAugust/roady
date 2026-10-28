import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import './motion.css';
import { App } from './App';
import { APP_NAME } from './constants';
import { applyCssVars } from './theme/cssVars';

applyCssVars();
document.title = `${APP_NAME} Dashboard`;

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
