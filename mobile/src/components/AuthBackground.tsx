import { ReactNode } from 'react';
import { BackdropCanvas, Square, Turned } from './BackdropCanvas';
import * as art from './authArtSvg';

// Positions are in Figma canvas pixels (412x892) taken from frame 1032:986.
const squares: [string, number, number][] = [
  [art.batik457, 306.14, 643.67], [art.batik455, 372.73, 708.21], [art.batik454, 372.73, 643.67], [art.batik456, 306.14, 708.21],
  [art.batik458, 306.14, 788.67], [art.batik455, 372.73, 853.21], [art.batik460, 372.73, 788.67], [art.batik461, 306.14, 853.21],
  [art.batik462, 156.14, 789.67], [art.batik455, 222.73, 854.21], [art.batik463, 222.73, 789.67], [art.batik464, 156.14, 854.21],
];
const turned: [string, number, number][] = [
  [art.batik440, 355.85, 621], [art.batik441, 281, 692.54], [art.batik443, 430.69, 691.91], [art.batik459, 355.73, 766.09],
  [art.batik440, 355.85, 766], [art.batik441, 281, 837.54], [art.batik443, 430.69, 836.91], [art.batik459, 355.73, 911.09],
  [art.batik440, 205.85, 767], [art.batik441, 131, 838.54], [art.batik443, 280.69, 837.91], [art.batik459, 205.73, 912.09],
];

const Art = (
  <>
    {squares.map(([xml, l, t], i) => <Square key={`s${i}`} xml={xml} left={l} top={t} />)}
    {turned.map(([xml, l, t], i) => <Turned key={`t${i}`} xml={xml} left={l} top={t} rotate={-90} />)}
  </>
);

/**
 * Backdrop of the pre-login screens: the navy page color (Login, Sign up) or, with `gradient`, the brand gradient (onboarding, location
 * permission, which have a glass sheet below the title). Faint batik in the corner either way.
 */
export function AuthBackground({ children, gradient = false }: { children: ReactNode; gradient?: boolean }) {
  return (
    <BackdropCanvas art={Art} gradient={gradient}>
      {children}
    </BackdropCanvas>
  );
}
