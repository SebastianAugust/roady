import { useEffect, useState } from 'react';

/** `value` after it has stayed unchanged for `delay` ms (typing in a filter should not send a request per key). */
export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
