import React from 'react';
import { Star, Heart, Skull, Shield, Eye, Check, Scale } from 'lucide-react';
import WolfIcon from './WolfIcon';
import RoleAvatar from './RoleAvatar';
import { isWolfPlayer, getPlayerRole } from '../../utils/roleUtils';

/**
 * Standardized PlayerSeatCard Primitive (Soft Bento Minimalist + Gothic)
 * Unified across PlayerSeatPicker, PlayersGridView, DayVotingSection, and Sheriff succession.
 */
export default function PlayerSeatCard({
  player,
  role = null,
  partner = null,
  mode = 'pick', // 'pick' | 'view' | 'vote'
  selected = false,
  disabled = false,
  variant = 'default', // 'default' | 'wolf' | 'seer' | 'cupid' | 'protect' | 'witch'
  showRole = false,
  showAvatar = false,
  subtext = null,
  badges = null,
  onClick = null,
  className = ''
}) {
  const p = player;
  if (!p) return null;

  const isAlive = p.isAlive !== false;
  const isWolf = isWolfPlayer(p);
  const resolvedRole = role || getPlayerRole(p);

  // Faction identifier for CSS token mapping
  const faction = isWolf ? 'werewolf' : resolvedRole?.teamCode === '3' ? 'neutral' : 'village';

  // Base card surface and border styles
  let cardStyles = '';
  if (!isAlive) {
    cardStyles = 'bg-[var(--color-surface-2)] border-[var(--color-line)] grayscale opacity-50 cursor-not-allowed';
  } else if (selected) {
    if (variant === 'wolf' || isWolf) {
      cardStyles = 'bg-rose-950/90 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] ring-1 ring-rose-400';
    } else if (variant === 'cupid') {
      cardStyles = 'bg-pink-950/90 border-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] ring-1 ring-pink-400';
    } else if (variant === 'protect') {
      cardStyles = 'bg-teal-950/90 border-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.6)] ring-1 ring-teal-400';
    } else if (variant === 'seer') {
      cardStyles = 'bg-purple-950/90 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] ring-1 ring-purple-400';
    } else {
      cardStyles = 'bg-purple-950/90 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-1 ring-purple-400';
    }
  } else if (disabled) {
    cardStyles = 'bg-[var(--color-surface-1)] border-[var(--color-line)] opacity-40 cursor-not-allowed text-slate-500';
  } else if (isWolf && (mode === 'view' || mode === 'vote')) {
    cardStyles = 'bg-[var(--color-surface-1)] hover:bg-[#1a0a0d] border-rose-900/60 hover:border-rose-500 text-slate-200';
  } else {
    cardStyles = 'bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border-[var(--color-line)] hover:border-purple-600/70 text-slate-200';
  }

  // Headrest indicator bar color
  let barColor = 'bg-[var(--color-line)]';
  if (!isAlive) {
    barColor = 'bg-slate-700';
  } else if (selected) {
    barColor = 'bg-white shadow-sm';
  } else if (isWolf) {
    barColor = 'bg-[var(--color-wolf)]';
  } else {
    barColor = 'bg-[var(--color-village)]';
  }

  // Status icons
  const renderStatusIcon = () => {
    if (!isAlive) {
      return <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-label="Tử trận" />;
    }
    if (selected) {
      if (variant === 'cupid') return <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500 animate-bounce" />;
      if (variant === 'protect') return <Shield className="w-3.5 h-3.5 text-teal-300 fill-teal-400" />;
      if (variant === 'wolf') return <Skull className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" />;
      if (variant === 'seer') return <Eye className="w-3.5 h-3.5 text-purple-300" />;
      return <Check className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (isWolf && (mode === 'view' || mode === 'vote')) {
      return <WolfIcon className="w-3 h-3 text-rose-400 shrink-0" />;
    }
    return null;
  };

  const statusLabel = !isAlive
    ? 'tử trận'
    : selected
    ? 'đã chọn'
    : disabled
    ? 'bị cấm'
    : 'còn sống';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-faction={faction}
      aria-pressed={selected}
      aria-label={`Ghế ${p.id}, ${p.name}, ${statusLabel}`}
      className={`relative p-2 sm:p-2.5 rounded-card border text-left transition-all duration-100 select-none touch-manipulation active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[72px] sm:min-h-[84px] overflow-hidden ${cardStyles} ${className}`}
    >
      {/* Top Headrest Indicator Bar */}
      <div className={`w-6 sm:w-8 h-0.5 sm:h-1 rounded-full mb-1 shrink-0 ${barColor}`} />

      {/* Header Row: Seat Number + Badges / Icons */}
      <div className="flex items-center justify-between w-full shrink-0 gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`font-mono font-bold text-caption ${
            !isAlive ? 'line-through text-slate-400' : selected ? 'text-white font-black' : isWolf ? 'text-rose-300' : 'text-purple-300'
          }`}>
            #{p.id < 10 ? `0${p.id}` : p.id}
          </span>
          {p.isSheriff && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" title="Cảnh Sát Trưởng (x2 phiếu)" />}
          {partner && <Heart className="w-3 h-3 text-pink-400 fill-pink-500 shrink-0" title="Người yêu" />}
          {p.isHypnotized && <span className="text-[10px] select-none" title="Bị thôi miên">🎵</span>}
          {p.poisonedByRustySword && <span className="text-[10px] select-none" title="Nhiễm gỉ sét">🗡️</span>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {badges}
          {renderStatusIcon()}
        </div>
      </div>

      {/* Center: Player Name + Optional Tiny Avatar */}
      <div className="flex items-center gap-1.5 w-full my-1 min-w-0">
        {showAvatar && resolvedRole && isAlive && (
          <RoleAvatar role={resolvedRole} size="sm" dead={!isAlive} className="w-5 h-5 rounded-md shrink-0" />
        )}
        <div className={`text-body font-semibold truncate flex-1 ${
          !isAlive ? 'line-through text-slate-400' : selected ? 'text-white font-bold' : isWolf ? 'text-rose-100 font-bold' : 'text-slate-100'
        }`}>
          {p.name}
        </div>
      </div>

      {/* Bottom Row: Role hint or custom subtext */}
      <div className="w-full text-caption truncate shrink-0">
        {subtext !== null ? (
          <div className="truncate">{subtext}</div>
        ) : !isAlive ? (
          <span className="text-rose-400/90 font-medium">Tử trận</span>
        ) : showRole ? (
          <span className="text-slate-400 truncate block">
            {resolvedRole?.name || (disabled ? 'Bị cấm' : 'Chưa lộ vai')}
          </span>
        ) : null}
      </div>
    </button>
  );
}
