import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

/**
 * Standardized Gothic Modal Component
 * Replaces ad-hoc full-screen overlays with unified backdrop, safe-area padding,
 * keyboard accessibility (ESC) and mobile-first layout.
 */
export default function GothicModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon = null,
  iconTone = 'witch', // 'witch', 'blood', 'gold', 'neutral'
  maxWidth = 'max-w-2xl',
  children,
  footer = null,
  className = ''
}) {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toneHeaderMap = {
    witch: 'from-purple-950/80 to-transparent border-purple-900/60 text-purple-200',
    blood: 'from-rose-950/80 to-transparent border-rose-900/60 text-rose-200',
    gold: 'from-amber-950/80 to-transparent border-amber-900/60 text-amber-200',
    neutral: 'from-slate-900/80 to-transparent border-slate-800 text-slate-200'
  };

  const toneIconMap = {
    witch: 'bg-purple-950/90 border-purple-700/80 text-purple-300',
    blood: 'bg-rose-950/90 border-rose-600/80 text-rose-300',
    gold: 'bg-amber-950/90 border-amber-600/80 text-amber-300',
    neutral: 'bg-slate-900/90 border-slate-700/80 text-slate-300'
  };

  const headerTone = toneHeaderMap[iconTone] || toneHeaderMap.witch;
  const iconToneClass = toneIconMap[iconTone] || toneIconMap.witch;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 modal-safe-overlay bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-card bg-[var(--color-surface-1)] border border-[var(--color-line)] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between gap-3 bg-gradient-to-r ${headerTone} shrink-0`}>
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {Icon && (
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-control border flex items-center justify-center shrink-0 shadow-sm ${iconToneClass}`}>
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display font-bold text-headline text-slate-100 tracking-wide truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-caption text-slate-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {onClose && (
            <IconButton
              icon={X}
              label="Đóng"
              onClick={onClose}
              variant="ghost"
              size="sm"
            />
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="relative z-10 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-200">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="relative z-10 px-4 sm:px-6 py-3 border-t border-[var(--color-line)] bg-[var(--color-surface-2)]/90 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
