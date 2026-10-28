import { colors, effects, fontFamily, fontSize, fontWeight, gradients, opacity, radius, size, spacing } from './tokens';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const px = (group: Record<string, number>, prefix: string) =>
  Object.entries(group).map(([k, v]) => [`--${prefix}-${kebab(k)}`, `${v}px`] as const);

/** tokens.ts as CSS custom properties: --color-bg, --space-md, --radius-card, --font-body, ... */
export const cssVars: ReadonlyArray<readonly [string, string]> = [
  ...Object.entries(colors).map(([k, v]) => [`--color-${kebab(k)}`, v] as const),
  ...Object.entries(gradients).map(([k, v]) => [`--gradient-${kebab(k)}`, v] as const),
  ...Object.entries(effects).map(([k, v]) => [`--effect-${kebab(k)}`, v] as const),
  ...px(spacing, 'space'),
  ...px(radius, 'radius'),
  ...px(size, 'size'),
  ...px(fontSize, 'text'),
  ...Object.entries(opacity).map(([k, v]) => [`--opacity-${kebab(k)}`, String(v)] as const),
  ...Object.entries(fontFamily).map(([k, v]) => [`--font-${kebab(k)}`, v] as const),
  ...Object.entries(fontWeight).map(([k, v]) => [`--weight-${kebab(k)}`, String(v)] as const),
];

/** Writes the tokens onto :root once at startup, so the stylesheets only ever use var(--...). */
export function applyCssVars(root: HTMLElement = document.documentElement) {
  for (const [name, value] of cssVars) root.style.setProperty(name, value);
}
