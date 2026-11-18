import React from 'react';

/**
 * Accessible Icon-only Button with minimum 44px touch target (via hit-44 utility)
 */
export default function IconButton({
  icon: Icon,
  label, // Mandatory for accessibility (aria-label & title)
  variant = 'ghost', // 'ghost', 'solid', 'danger', 'gold'
  size = 'md', // 'sm' (32px), 'md' (36px), 'lg' (40px)
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  if (!label) {
    console.warn('IconButton requires a descriptive "label" prop for accessibility.');
  }

  const baseStyles = 'inline-flex items-center justify-center rounded-control transition-all duration-75 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 active:scale-95 touch-manipulation hit-44 focus-visible:ring-2 focus-visible:ring-[var(--color-village)] focus-visible:outline-none shrink-0';

  const sizeStyles = {
    sm: 'w-8 h-8 text-caption',
    md: 'w-9 h-9 text-body',
    lg: 'w-10 h-10 text-body'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantStyles = {
    ghost: 'bg-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-transparent hover:border-slate-700/60',
    solid: 'bg-[var(--color-surface-2)] hover:bg-slate-800 text-slate-300 hover:text-white border border-[var(--color-line)] shadow-sm',
    danger: 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/80 hover:border-rose-500 shadow-sm',
    gold: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 hover:text-amber-100 border border-amber-800/80 hover:border-amber-500 shadow-sm'
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.ghost;
  const iconSizeClass = iconSizes[size] || iconSizes.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${iconSizeClass} shrink-0`} aria-hidden="true" />}
    </button>
  );
}
