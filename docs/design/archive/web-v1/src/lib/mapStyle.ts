import { colors } from '../theme/tokens';

/** Dark base map in the Roady palette (bg, surface, accent). Points of interest and transit are hidden: the zones are the subject. */
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: colors.bg }] },
  { elementType: 'labels.text.fill', stylers: [{ color: colors.textMuted }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: colors.bg }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: colors.navy500 }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: colors.textSecondary }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: colors.pageBottom }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: colors.surfaceRaised }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.surface }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: colors.textSecondary }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: colors.navy500 }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: colors.accent }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.pageBottom }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: colors.navy500 }] },
];
