import React, { useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import WolfIcon from './WolfIcon';

const SIZE = { sm: 32, md: 48, lg: 64 };

/**
 * Standardized RoleAvatar with zero layout shift (CLS = 0)
 * and graceful fallback on missing artwork.
 */
export default function RoleAvatar({ role, size = 'md', dead = false, className = '', label = '' }) {
  const [hasError, setHasError] = useState(false);
  const px = SIZE[size] || 48;
  const roleId = role?.id;

  const renderFallbackIcon = () => {
    const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
    if (role?.teamCode === 'W' || role?.faction === 'werewolf') {
      return <WolfIcon className={`${iconClass} text-rose-400`} />;
    }
    if (role?.teamCode === '3' || role?.faction === 'neutral') {
      return <Sparkles className={`${iconClass} text-amber-400`} />;
    }
    return <Shield className={`${iconClass} text-sky-400`} />;
  };

  const factionBorder = 
    role?.teamCode === 'W' || role?.faction === 'werewolf'
      ? 'border-rose-800'
      : role?.teamCode === '3' || role?.faction === 'neutral'
      ? 'border-amber-800'
      : 'border-sky-800';

  if (!roleId || hasError) {
    return (
      <div
        style={{ width: `${px}px`, height: `${px}px` }}
        aria-label={label || role?.name || 'Vai trò'}
        className={`rounded-control bg-slate-900 border flex items-center justify-center shrink-0 ${factionBorder} ${
          dead ? 'grayscale opacity-50' : ''
        } ${className}`}
      >
        {renderFallbackIcon()}
      </div>
    );
  }

  return (
    <img
      src={`/cards/avatars/${roleId}.webp`}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      alt={label || ''}
      onError={() => setHasError(true)}
      className={`rounded-control object-cover ring-1 ring-[var(--color-line)] shrink-0 ${
        dead ? 'grayscale opacity-50' : ''
      } ${className}`}
    />
  );
}
