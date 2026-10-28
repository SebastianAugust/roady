import './AppBackground.css';

/**
 * The page background of every web screen, Login included (docs/design/glass-reference.html): a fixed layer with the
 * layered navy gradient (soft light at the top centre, bluer bottom-right corner and left middle) and four clusters of
 * the original batik (src/assets/batik.png) as white masks cut off at the screen edges. Purely decorative.
 */
export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <span className="app-bg-batik app-bg-b1" />
      <span className="app-bg-batik app-bg-b2" />
      <span className="app-bg-batik app-bg-b3" />
      <span className="app-bg-batik app-bg-b4" />
    </div>
  );
}
