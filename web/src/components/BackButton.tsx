import { useNavigate } from 'react-router-dom';
import { BackIcon } from './icons';
import './BackButton.css';

/** Round back button of the Figma detail frames. Goes back in history, or to `fallback` when the page was opened directly. */
export function BackButton({ fallback }: { fallback: string }) {
  const navigate = useNavigate();
  // history.state.idx is React Router's position in its history stack; 0 means this page was opened directly.
  const back = () => ((window.history.state as { idx?: number } | null)?.idx ? navigate(-1) : navigate(fallback));
  return (
    <button type="button" className="back-button glass-in" onClick={back} aria-label="Kembali">
      <BackIcon />
    </button>
  );
}
