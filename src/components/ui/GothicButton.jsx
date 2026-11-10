import React from 'react';

export default function GothicButton({
  children,
  variant = 'witch', // 'witch', 'blood', 'dark', 'ghost', 'gold'
  size = 'md',       // 'sm', 'md', 'lg'
  isWolf = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider rounded-xl transition-all duration-75 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 active:scale-95 touch-manipulation';

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 gap-1.5 min-h-[34px]',
    md: 'text-xs md:text-sm py-2 px-4 gap-2 min-h-[40px]',
    lg: 'text-sm md:text-base py-3 px-6 gap-2.5 min-h-[48px] uppercase font-cinzel font-black tracking-widest'
  };

  const variantStyles = {
    // Tím Phù Thủy (Occult Witch Purple)
    witch: 'bg-gradient-to-b from-[#2e1065] to-[#170536] hover:from-[#3b0764] hover:to-[#22074f] text-purple-200 border border-purple-700/70 hover:border-purple-500 shadow-[0_4px_16px_rgba(88,28,135,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)]',
    
    // Đỏ Ma Sói / Huyết Nguyệt (Blood / Werewolf)
    blood: 'bg-gradient-to-b from-[#450a0a] to-[#1c0305] hover:from-[#5c0d0d] hover:to-[#260507] text-rose-200 border border-rose-800/80 hover:border-rose-500 shadow-[0_4px_16px_rgba(153,27,27,0.4)] hover:shadow-[0_0_22px_rgba(225,29,72,0.5)]',
    
    // Tối Huyền Bí (Obsidian Dark)
    dark: 'bg-gradient-to-b from-[#161926] to-[#0c0e17] hover:from-[#1f2436] hover:to-[#121524] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.5)]',
    
    // Hủy / Viền Mờ (Ghost)
    ghost: 'bg-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800',

    // Vàng Thần Thoại (Sacred Gold / Sun)
    gold: 'bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#270e02] hover:from-[#92400e] text-amber-200 border border-amber-600/70 hover:border-amber-400 shadow-[0_4px_16px_rgba(180,83,9,0.35)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
  };

  // Wolf glow override
  const wolfGlow = isWolf ? 'border-rose-600/90 shadow-[0_0_18px_rgba(225,29,72,0.65)] ring-1 ring-rose-500/50' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${wolfGlow} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
