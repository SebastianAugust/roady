/** True when the user asked for less motion. Read once per call; it does not change while a page is open in practice. */
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
