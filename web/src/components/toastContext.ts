import { createContext, useContext } from 'react';

export const ToastContext = createContext<((message: string) => void) | undefined>(undefined);

/** Shows a short message in the corner, announced to screen readers. */
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}
