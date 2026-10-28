import { colors } from '../theme/tokens';

const paint = (featureType: string, elementType: string, color?: string, visibility?: 'off') => ({
  featureType,
  elementType,
  stylers: [...(color ? [{ color }] : []), ...(visibility ? [{ visibility }] : [])],
});

/**
 * Dark Google Maps style (navy land, slightly lighter roads, deep water, no points of interest) so the red, yellow and green risk markers
 * stand out. Used through `customMapStyle`; Apple Maps on iOS ignores it.
 */
export const darkMapStyle = [
  paint('all', 'geometry', colors.navy900),
  paint('all', 'labels.text.fill', colors.textSecondary),
  paint('all', 'labels.text.stroke', colors.navy900),
  paint('poi', 'all', undefined, 'off'),
  paint('transit', 'all', undefined, 'off'),
  paint('landscape', 'geometry', colors.navy900),
  paint('road', 'geometry', colors.surfaceRaised),
  paint('road', 'geometry.stroke', colors.surface),
  paint('road.highway', 'geometry', colors.navy500),
  paint('road.highway', 'geometry.stroke', colors.surfaceRaised),
  paint('administrative', 'geometry.stroke', colors.disabled),
  paint('water', 'geometry', '#06122A'),
  paint('water', 'labels.text.fill', colors.textMuted),
];
