import { BATIK_CLUSTERS } from '../theme/batikLayout';
import batikSoft from '../assets/batik-soft.png';
import './AppBackground.css';

/**
 * The page background of every web screen, Login included (docs/design/glass-reference.html): a fixed layer with the
 * layered navy gradient and three batik clusters placed by the percentages of theme/batikLayout.ts. Purely decorative.
 */
export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      {BATIK_CLUSTERS.map(({ id, width, rotate, left, right, top, bottom }) => (
        <span
          key={id}
          className="app-bg-batik"
          style={{
            width: `${width}vw`,
            left: left === undefined ? undefined : `${left}%`,
            right: right === undefined ? undefined : `${right}%`,
            top: top === undefined ? undefined : `${top}%`,
            bottom: bottom === undefined ? undefined : `${bottom}%`,
            transform: `rotate(${rotate}deg)`,
            backgroundImage: `url(${batikSoft})`,
          }}
        />
      ))}
    </div>
  );
}
