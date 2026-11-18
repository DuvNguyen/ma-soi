import React from 'react';

/**
 * Standardized Gothic Status Badge
 * Replaces ad-hoc badges across screens with WCAG compliant colors & 12px min text size
 */
export default function GothicBadge({
  children,
  tone = 'neutral', // 'neutral', 'wolf', 'village', 'lover', 'success', 'warning', 'danger'
  variant,          // Backwards compatibility with 'witch', 'blood', 'wolf', 'villager', 'dark', 'gold'
  size = 'md',      // 'sm', 'md'
  className = '',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border select-none tracking-wide';

  const sizeStyles = {
    sm: 'text-caption px-2 py-0.5 gap-1',
    md: 'text-caption px-2.5 py-0.5 gap-1.5'
  };

  const toneMap = {
    neutral: 'bg-slate-900/90 border-slate-700/70 text-slate-300',
    dark: 'bg-[var(--color-surface-2)] border-[var(--color-line)] text-slate-300',
    wolf: 'bg-rose-950/80 border-rose-600/80 text-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.35)]',
    blood: 'bg-rose-950/80 border-rose-600/80 text-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.35)]',
    village: 'bg-purple-950/80 border-purple-600/80 text-purple-300 shadow-[0_0_10px_rgba(124,58,237,0.25)]',
    witch: 'bg-purple-950/80 border-purple-600/80 text-purple-300 shadow-[0_0_10px_rgba(124,58,237,0.25)]',
    villager: 'bg-blue-950/80 border-blue-700/70 text-blue-300 shadow-[0_0_8px_rgba(37,99,235,0.2)]',
    lover: 'bg-pink-950/80 border-pink-500/80 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]',
    gold: 'bg-amber-950/80 border-amber-600/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
    warning: 'bg-amber-950/80 border-amber-600/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
    success: 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    danger: 'bg-red-950/80 border-red-600/80 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
  };

  const activeKey = variant || tone;
  const toneClass = toneMap[activeKey] || toneMap.neutral;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <span className={`${baseStyles} ${sizeClass} ${toneClass} ${className}`} {...props}>
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
