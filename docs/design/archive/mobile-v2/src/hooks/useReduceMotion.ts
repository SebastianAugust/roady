import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the user turned on "reduce motion" (iOS) or "remove animations" (Android). Follows changes while the app is
 * open. It starts as false and is read once on mount, so an animation that has already begun finishes at once when it
 * turns true (the components that use it jump to their end state).
 */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (on) => alive && setReduce(on),
      () => undefined, // not supported: keep motion
    );
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
