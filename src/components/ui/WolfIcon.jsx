import React from 'react';

/**
 * Werewolf Head Icon (Official Illustration)
 * Đầu Ma Sói gầm mắt đỏ rực, răng nanh sắc nhọn
 */
export default function WolfIcon({ className = "w-4 h-4", alt = "Sói", ...props }) {
  return (
    <img
      src="/wolf-icon.png"
      alt={alt}
      className={`inline-block shrink-0 object-contain select-none drop-shadow-[0_1px_3px_rgba(225,29,72,0.4)] ${className}`}
      loading="eager"
      draggable={false}
      {...props}
    />
  );
}
