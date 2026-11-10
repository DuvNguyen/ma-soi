import React from 'react';

/**
 * Werewolf Head Graphic (Official Roaring Wolf Illustration)
 * Đầu Ma Sói gầm mắt đỏ rực, răng nanh sắc nhọn, hiệu ứng phát sáng quỷ dị
 */
export default function WolfHead({
  className = '',
  size = 40,
  eyeGlow = true,
  alt = "Ma Sói",
  ...props
}) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <img
        src="/wolf-head.png"
        alt={alt}
        className={`w-full h-full object-contain pointer-events-none transition-transform duration-300 ${
          eyeGlow ? 'filter drop-shadow-[0_0_18px_rgba(225,29,72,0.65)]' : 'filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]'
        }`}
        draggable={false}
      />
    </div>
  );
}
