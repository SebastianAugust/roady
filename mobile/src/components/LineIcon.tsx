import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

// Stroke icons of docs/design/prototype-mobile.html (24x24, round caps), for the Lapor form.
const ICONS = {
  check: <Path d="M5 12l5 5 9-10" />,
  info: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 8v.5M12 11.5V16" />
    </>
  ),
  trash: <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
} as const;

interface Props {
  name: keyof typeof ICONS;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** A small decorative line icon (hidden from screen readers; the text next to it carries the meaning). */
export function LineIcon({ name, size = 16, color = colors.textPrimary, strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ICONS[name]}
    </Svg>
  );
}
