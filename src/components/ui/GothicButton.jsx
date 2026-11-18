import React from 'react';

export default function GothicButton({
  children,
  variant = 'witch', // 'primary', 'secondary', 'danger', 'ghost', 'witch', 'blood', 'dark', 'gold', 'cyan'
  size = 'md',       // 'sm', 'md', 'lg'
  isWolf = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-wider rounded-control transition-all duration-75 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-[var(--color-village)] focus-visible:outline-none';

  const sizeStyles = {
    sm: 'text-body py-1.5 px-3 gap-1.5 min-h-9 hit-44',
    md: 'text-body py-2.5 px-4 gap-2 min-h-11',
    lg: 'text-body md:text-title py-3 px-6 gap-2.5 min-h-[52px] uppercase font-display font-black tracking-widest'
  };

  const variantStyles = {
    // Primary / Tím Phù Thủy (Occult Witch Purple)
    primary: 'bg-gradient-to-b from-[#2e1065] to-[#170536] hover:from-[#3b0764] hover:to-[#22074f] text-purple-200 border border-purple-700/70 hover:border-purple-500 shadow-[0_4px_16px_rgba(88,28,135,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)]',
    witch: 'bg-gradient-to-b from-[#2e1065] to-[#170536] hover:from-[#3b0764] hover:to-[#22074f] text-purple-200 border border-purple-700/70 hover:border-purple-500 shadow-[0_4px_16px_rgba(88,28,135,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)]',
    
    // Danger / Đỏ Ma Sói / Huyết Nguyệt (Blood / Werewolf)
    danger: 'bg-gradient-to-b from-[#450a0a] to-[#1c0305] hover:from-[#5c0d0d] hover:to-[#260507] text-rose-200 border border-rose-800/80 hover:border-rose-500 shadow-[0_4px_16px_rgba(153,27,27,0.4)] hover:shadow-[0_0_22px_rgba(225,29,72,0.5)]',
    blood: 'bg-gradient-to-b from-[#450a0a] to-[#1c0305] hover:from-[#5c0d0d] hover:to-[#260507] text-rose-200 border border-rose-800/80 hover:border-rose-500 shadow-[0_4px_16px_rgba(153,27,27,0.4)] hover:shadow-[0_0_22px_rgba(225,29,72,0.5)]',
    
    // Secondary / Tối Huyền Bí (Obsidian Dark)
    secondary: 'bg-gradient-to-b from-[#161926] to-[#0c0e17] hover:from-[#1f2436] hover:to-[#121524] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.5)]',
    dark: 'bg-gradient-to-b from-[#161926] to-[#0c0e17] hover:from-[#1f2436] hover:to-[#121524] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.5)]',
    
    // Hủy / Viền Mờ (Ghost)
    ghost: 'bg-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800',

    // Vàng Thần Thoại (Sacred Gold / Sun)
    gold: 'bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#270e02] hover:from-[#92400e] text-amber-200 border border-amber-600/70 hover:border-amber-400 shadow-[0_4px_16px_rgba(180,83,9,0.35)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',

    // Lam Ngọc Đầy Tớ (Devoted Servant Cyan)
    cyan: 'bg-gradient-to-b from-[#083344] to-[#041c26] hover:from-[#0e4860] hover:to-[#082938] text-cyan-200 border border-cyan-600/70 hover:border-cyan-400 shadow-[0_4px_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.witch;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  // Wolf glow override
  const wolfGlow = isWolf ? 'border-rose-600/90 shadow-[0_0_18px_rgba(225,29,72,0.65)] ring-1 ring-rose-500/50' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${wolfGlow} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children && <span>{children}</span>}
    </button>
  );
}
