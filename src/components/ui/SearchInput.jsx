import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Standardized Compact Search Input
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  onClear = null,
  autoFocus = false
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none shrink-0" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full text-body py-1.5 pl-8 pr-7 rounded-control bg-slate-900/90 border border-[var(--color-line)] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-village)] transition-all min-h-9"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xóa tìm kiếm"
          className="absolute right-2 text-slate-400 hover:text-slate-200 cursor-pointer hit-44"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
