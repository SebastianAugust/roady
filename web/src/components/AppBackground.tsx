import { BatikBackground } from './BatikBackground';
import './AppBackground.css';

/**
 * The page background of every web screen, Login included (docs/design/glass-reference.html): a fixed layer with the
 * layered navy gradient and the shared BatikBackground. The app shell passes `batik={false}` and draws its own,
 * scrolling batik (ShellBatik); Login keeps this one. Purely decorative.
 */
export function AppBackground({ batik = true }: { batik?: boolean }) {
  return (
    <div className="app-bg" aria-hidden="true">
      {batik ? <BatikBackground /> : null}
    </div>
  );
}
