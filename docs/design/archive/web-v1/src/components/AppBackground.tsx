import { BatikBackground } from './BatikBackground';
import './AppBackground.css';

/**
 * The page background of every web screen, Login included (docs/design/glass-reference.html): a fixed layer with the
 * layered navy gradient and the shared BatikBackground. Purely decorative.
 */
export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <BatikBackground />
    </div>
  );
}
