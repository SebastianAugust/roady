// Placement of the batik clusters, as percentages of the screen. The image is batik-soft.png (scripts/make-batik.mjs):
// white, edges already faded, drawn as a plain image at the cluster's opacity, with no mask.
// width: % of screen width. left/top/right/bottom: % of screen width/height, negative = partly off screen.
// (The web no longer reads a copy of this file; its batik lives in web/src/components/ShellBatik.css and BatikBackground.css.)

/** Default opacity of a cluster (docs/design/prototype-mobile.html: .batik opacity .22). */
export const BATIK_OPACITY = 0.22;

export interface BatikCluster {
  id: string;
  width: number;
  rotate: number; // deg
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  /** Overrides BATIK_OPACITY for this cluster. */
  opacity?: number;
}

/**
 * Every screen after the splash except Login and Sign-up. The top-left and bottom-right clusters are about 20% larger
 * than before (30 -> 36 and 32 -> 38) and still hang past the screen edges; the left-middle one stays dimmer (prototype .lm).
 */
export const BATIK_CLUSTERS: readonly BatikCluster[] = [
  { id: 'top-left', width: 36, left: -8, top: -11, rotate: -8 }, // beside the wordmark
  { id: 'left-middle', width: 21, left: -10, top: 42, rotate: 0, opacity: 0.14 },
  { id: 'bottom-right', width: 38, right: -10, bottom: -17, rotate: 12 },
];

/** Login and Sign-up keep the batik they had (8%, the old sizes): those two screens are not part of this redesign. */
export const BATIK_OPACITY_AUTH = 0.08;
export const BATIK_CLUSTERS_AUTH: readonly BatikCluster[] = [
  { id: 'top-left', width: 30, left: -8, top: -11, rotate: -8 },
  { id: 'left-middle', width: 21, left: -10, top: 42, rotate: 0 },
  { id: 'bottom-right', width: 32, right: -10, bottom: -17, rotate: 12 },
];
