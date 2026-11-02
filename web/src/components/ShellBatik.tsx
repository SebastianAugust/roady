import './ShellBatik.css';

/**
 * Batik of the app shell (prototype-web-cards.html .batik): the two corner clusters at 30% and an extra right-middle one
 * at 20%. The layer is fixed to the viewport (z-index 0, behind the header, nav and page, never catches the pointer), so
 * the batik stays still while the page scrolls: no parallax. Login keeps its own batik (AppBackground). Purely decorative.
 */
export function ShellBatik() {
  return (
    <div className="shell-batik" aria-hidden="true">
      <span className="shell-batik-cluster shell-batik-top-left" />
      <span className="shell-batik-cluster shell-batik-right-middle" />
      <span className="shell-batik-cluster shell-batik-bottom-right" />
    </div>
  );
}
