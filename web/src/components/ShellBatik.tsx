import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import './ShellBatik.css';

/**
 * Batik of the app shell (prototype-web-cards.html .batik): the two corner clusters at 30% and an extra right-middle one
 * at 20%, placed in the page (not fixed) so they scroll with it. A slow parallax shifts them by the scroll position,
 * written as --sy on this layer in one requestAnimationFrame per scroll; with reduced motion nothing listens and the
 * clusters stay put. Login keeps its own batik (AppBackground). Purely decorative.
 */
export function ShellBatik() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        ref.current?.style.setProperty('--sy', String(window.scrollY));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="shell-batik" ref={ref} aria-hidden="true">
      <span className="shell-batik-cluster shell-batik-top-left" />
      <span className="shell-batik-cluster shell-batik-right-middle" />
      <span className="shell-batik-cluster shell-batik-bottom-right" />
    </div>
  );
}
