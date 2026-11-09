import React from 'react';

export default function GothicBadge({
  children,
  variant = 'witch', // 'witch', 'blood', 'wolf', 'villager', 'dark'
  className = '',
  icon: Icon = null
}) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border select-none';

  const variants = {
    // Tím Phù Thủy
    witch: 'bg-[#21093d]/80 border-purple-800/70 text-purple-300 shadow-[0_0_10px_rgba(147,51,234,0.25)]',
    
    // Ma Sói - Ánh Đỏ Rực Rỡ Bắt Mắt
    wolf: 'bg-[#2e0509]/90 border-rose-600 text-rose-300 shadow-[0_0_14px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/40',
    
    // Dân Làng
    villager: 'bg-[#0b1b36]/80 border-blue-900/60 text-blue-300 shadow-[0_0_8px_rgba(37,99,235,0.2)]',

    // Tối Huyền Bí
    dark: 'bg-[#12141f] border-slate-800 text-slate-300',

    // Vàng Cổ
    gold: 'bg-[#291404]/80 border-amber-800/70 text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.25)]'
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
