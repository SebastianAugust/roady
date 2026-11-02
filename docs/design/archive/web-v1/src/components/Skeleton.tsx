import type { CSSProperties } from 'react';
import './Skeleton.css';

interface Props {
  width?: number | string;
  height?: number | string;
  /** Corner radius; a number is px. Defaults to the field radius. */
  radius?: number | string;
  className?: string;
}

/** A grey block with a sliding highlight, standing in for content that is still loading. Decorative: hidden from screen readers. */
export function Skeleton({ width = '100%', height = 16, radius, className }: Props) {
  const style: CSSProperties = { width, height, ...(radius !== undefined ? { borderRadius: radius } : {}) };
  return <span className={`skeleton shimmer${className ? ` ${className}` : ''}`} style={style} aria-hidden="true" />;
}
