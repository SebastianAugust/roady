import type { InputHTMLAttributes } from 'react';
import './SearchField.css';

/** Figma Detail Laporan search: a wide rounded field with a magnifier on the left. */
export function SearchField({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`search${className ? ` ${className}` : ''}`}>
      <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input type="search" className="search-input" {...rest} />
    </div>
  );
}
