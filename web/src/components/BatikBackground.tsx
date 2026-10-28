import './BatikBackground.css';

/**
 * The batik motifs behind every web page (Figma Home and Login of docs/design/admin and docs/design/dishub): two
 * clusters pinned straight to the top-left and bottom-right corners, never rotated or skewed. Sizes and offsets are
 * in vw (BatikBackground.css), so the placement is the same on every page. Purely decorative; render it inside
 * AppBackground, which supplies the fixed layer under the content.
 */
export function BatikBackground() {
  return (
    <div className="batik" aria-hidden="true">
      <span className="batik-cluster batik-top-left" />
      <span className="batik-cluster batik-bottom-right" />
    </div>
  );
}
