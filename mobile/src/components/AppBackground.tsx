import { ReactNode } from 'react';
import { BackdropCanvas, Square, Turned } from './BackdropCanvas';
import * as auth from './authArtSvg';
import * as art from './petaArtSvg';

// Positions are in Figma canvas pixels (412x892) taken from frame 1032:5391.
// Top-left cluster: three groups of four rotated tiles.
const topSquares: [string, number, number][] = [
  [art.batik465, 179.83, 51.49], [art.batik466, 113.24, -13.05], [art.batik467, 113.24, 51.49], [art.batik468, 179.83, -13.05],
  [art.batik470, 29.83, 197.49], [art.batik466, -36.76, 132.95], [art.batik471, -36.76, 197.49], [art.batik472, 29.83, 132.95],
  [art.batik473, 29.83, 52.49], [art.batik466, -36.76, -12.05], [art.batik474, -36.76, 52.49], [art.batik475, 29.83, -12.05],
];
const topTurned: [string, number, number][] = [
  [art.batik442, 162.85, 106.09], [art.batik444, 237.69, 34.55], [art.batik445, 88, 35.18], [art.batik469, 162.96, -39],
  [art.batik442, 12.85, 252.09], [art.batik444, 87.69, 180.55], [art.batik445, -62, 181.18], [art.batik469, 12.96, 107],
  [art.batik442, 12.85, 107.09], [art.batik444, 87.69, 35.55], [art.batik445, -62, 36.18], [art.batik469, 12.96, -38],
];
// Bottom-right cluster is the same tile set as the auth screens.
const bottomSquares: [string, number, number][] = [
  [auth.batik457, 306.14, 643.67], [auth.batik455, 372.73, 708.21], [auth.batik454, 372.73, 643.67], [auth.batik456, 306.14, 708.21],
  [auth.batik458, 306.14, 788.67], [auth.batik455, 372.73, 853.21], [auth.batik460, 372.73, 788.67], [auth.batik461, 306.14, 853.21],
  [auth.batik462, 156.14, 789.67], [auth.batik455, 222.73, 854.21], [auth.batik463, 222.73, 789.67], [auth.batik464, 156.14, 854.21],
];
const bottomTurned: [string, number, number][] = [
  [auth.batik440, 355.85, 621], [auth.batik441, 281, 692.54], [auth.batik443, 430.69, 691.91], [auth.batik459, 355.73, 766.09],
  [auth.batik440, 355.85, 766], [auth.batik441, 281, 837.54], [auth.batik443, 430.69, 836.91], [auth.batik459, 355.73, 911.09],
  [auth.batik440, 205.85, 767], [auth.batik441, 131, 838.54], [auth.batik443, 280.69, 837.91], [auth.batik459, 205.73, 912.09],
];

// Batik tiles only (no blobs): the original white-ish tiles (7% opacity) on the navy backdrop.
const makeArt = () => (
  <>
    {bottomSquares.map(([xml, l, t], i) => <Square key={`bs${i}`} xml={xml} left={l} top={t} />)}
    {bottomTurned.map(([xml, l, t], i) => <Turned key={`bt${i}`} xml={xml} left={l} top={t} rotate={-90} />)}
    {topSquares.map(([xml, l, t], i) => <Square key={`ts${i}`} xml={xml} left={l} top={t} rotate={180} />)}
    {topTurned.map(([xml, l, t], i) => <Turned key={`tt${i}`} xml={xml} left={l} top={t} rotate={90} />)}
  </>
);

const Art = makeArt();

/** Backdrop for the signed-in screens (Home, Peta, ...): the navy page color with faint batik in two corners. */
export function AppBackground({ children }: { children: ReactNode }) {
  return <BackdropCanvas art={Art}>{children}</BackdropCanvas>;
}

/** Backdrop of the start screen (Figma 1032:7012): brand gradient navy with white batik at 7%. */
export function SplashBackground({ children }: { children: ReactNode }) {
  return (
    <BackdropCanvas art={Art} gradient>
      {children}
    </BackdropCanvas>
  );
}
