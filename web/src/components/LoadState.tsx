import { Button } from './Button';
import './LoadState.css';

interface Props {
  state: 'loading' | 'error' | 'empty';
  /** Text for the loading/empty states, or the error message. */
  message: string;
  onRetry?: () => void;
}

/** Loading, error and empty states of a data block, announced politely to screen readers. */
export function LoadState({ state, message, onRetry }: Props) {
  return (
    <div className="load-state" role={state === 'error' ? 'alert' : 'status'}>
      {state === 'loading' ? <span className="load-spinner" aria-hidden="true" /> : null}
      <p>{message}</p>
      {state === 'error' && onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
