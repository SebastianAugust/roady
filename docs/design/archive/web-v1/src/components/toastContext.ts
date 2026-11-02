import { createContext, useContext } from 'react';

export interface ToastOptions {
  /** Adds an "Urungkan" button that calls this and closes the toast. The toast then stays 6 seconds instead of 3. */
  undo?: () => void;
}

export type ShowToast = (message: string, options?: ToastOptions) => void;

export const ToastContext = createContext<ShowToast | undefined>(undefined);

/** Shows a short message at the top right, announced to screen readers. Pass `{ undo }` for an "Urungkan" button. */
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}
