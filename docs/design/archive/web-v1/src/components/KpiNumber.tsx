import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 600;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * A whole number that counts up to `value` in 600ms (ease-out cubic, requestAnimationFrame). The first time it counts
 * from 0; when the value changes later it counts from the number on screen. With reduced motion it shows the value at once.
 * Screen readers get the final value only, not the count.
 */
export function KpiNumber({ value, className }: { value: number; className?: string }) {
  const reduced = prefersReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const from = useRef(reduced ? value : 0);

  useEffect(() => {
    if (reduced) return;
    const start = from.current;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION_MS);
      const current = Math.round(start + (value - start) * easeOutCubic(t));
      from.current = current;
      setShown(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  return (
    <>
      <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }} aria-hidden="true">
        {reduced ? value : shown}
      </span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}
