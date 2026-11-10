import React from 'react';

/**
 * Gothic Werewolf Head Vector Graphic (SVG)
 * Đầu Ma Sói răng nanh sắc nhọn, mắt đỏ rực, bờm lông ma quái
 */
export default function WolfHead({
  className = '',
  size = 40,
  eyeGlow = true,
  primaryColor = '#e11d48',
  secondaryColor = '#9f1239'
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Blood Glow Filter */}
        <filter id="wolfBloodGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>

        {/* Eye Crimson Fire Filter */}
        <filter id="eyeFire" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="wolfGradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="45%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#2a040a" />
        </linearGradient>

        <linearGradient id="furGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#be123c" />
          <stop offset="70%" stopColor="#4c0519" />
          <stop offset="100%" stopColor="#120205" />
        </linearGradient>
      </defs>

      {/* Outer Ears & Mane Spikes (Left & Right) */}
      {/* Left Ear */}
      <path
        d="M24 12 L38 28 L28 36 L16 26 Z"
        fill="url(#wolfGradient)"
        stroke="#fda4af"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M26 16 L34 27 L27 31 Z" fill="#4c0519" />

      {/* Right Ear */}
      <path
        d="M76 12 L84 26 L72 36 L62 28 Z"
        fill="url(#wolfGradient)"
        stroke="#fda4af"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M74 16 L73 31 L66 27 Z" fill="#4c0519" />

      {/* Mane Side Spikes */}
      <path
        d="M12 40 L24 44 L16 54 L28 56 L18 68 L32 68 L24 82 L38 78 L34 92 L50 86 L66 92 L62 78 L76 82 L68 68 L82 68 L72 56 L84 54 L76 44 L88 40 L74 38 L62 28 L50 36 L38 28 L26 38 Z"
        fill="url(#furGradient)"
        stroke="#e11d48"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner Forehead & Snout Structure */}
      <path
        d="M36 34 L50 42 L64 34 L62 50 L70 56 L50 82 L30 56 L38 50 Z"
        fill="url(#wolfGradient)"
        stroke="#fb7185"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Snout Bridge & Nose */}
      <path
        d="M44 54 L50 50 L56 54 L54 68 L50 72 L46 68 Z"
        fill="#1a0307"
        stroke="#e11d48"
        strokeWidth="1"
      />
      {/* Black Nose */}
      <path d="M47 66 L53 66 L50 71 Z" fill="#000" stroke="#ff4d6d" strokeWidth="0.8" />

      {/* Sharp Fangs / Teeth */}
      {/* Top Left Fang */}
      <polygon points="42,76 45,76 43,84" fill="#ffffff" />
      {/* Top Right Fang */}
      <polygon points="55,76 58,76 57,84" fill="#ffffff" />
      {/* Bottom Center Teeth */}
      <polygon points="46,80 48,80 47,75" fill="#fecdd3" />
      <polygon points="52,80 54,80 53,75" fill="#fecdd3" />

      {/* Glowing Crimson Eyes */}
      {/* Left Eye */}
      <path
        d="M34 46 Q 42 45 44 49 Q 40 52 34 46 Z"
        fill="#ff0033"
        filter={eyeGlow ? "url(#eyeFire)" : undefined}
      />
      <circle cx="40" cy="48" r="1.2" fill="#fff" />

      {/* Right Eye */}
      <path
        d="M66 46 Q 58 45 56 49 Q 60 52 66 46 Z"
        fill="#ff0033"
        filter={eyeGlow ? "url(#eyeFire)" : undefined}
      />
      <circle cx="60" cy="48" r="1.2" fill="#fff" />

      {/* Snarl Wrinkles above nose */}
      <path d="M46 58 L54 58" stroke="#ff4d6d" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M47 62 L53 62" stroke="#ff4d6d" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
