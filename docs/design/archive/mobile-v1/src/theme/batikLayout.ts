// Placement of the batik clusters, as percentages of the screen (Figma frames 1440x1024: Home and Login of
// docs/design/admin and docs/design/dishub). Shared by web and mobile (copy at mobile/src/theme/batikLayout.ts), so keep
// the two files identical. The image is batik-soft.png (scripts/make-batik.mjs): white, edges already faded, used as a
// plain background-image at BATIK_OPACITY, with no CSS mask.
// width: % of screen width. left/top/right/bottom: % of screen width/height, negative = partly off screen.
export const BATIK_OPACITY = 0.08; // 6-10%

export interface BatikCluster {
  id: string;
  width: number;
  rotate: number; // deg
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export const BATIK_CLUSTERS: readonly BatikCluster[] = [
  { id: 'top-left', width: 30, left: -8, top: -11, rotate: -8 }, // beside the wordmark
  { id: 'left-middle', width: 21, left: -10, top: 42, rotate: 0 },
  { id: 'bottom-right', width: 32, right: -10, bottom: -17, rotate: 12 },
];
