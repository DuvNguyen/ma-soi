import React from 'react';

/**
 * Werewolf Claw Marks / Scratch Slash SVG Decoration
 * Vết cào rách 4 móng vuốt Ma Sói đỏ máu phát sáng
 */
export default function ClawMarks({ className = '', size = 80, color = '#e11d48' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <defs>
        <filter id="bloodGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.9" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#4c0519" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Slash 1 (Outer Left) */}
      <path
        d="M18 10 C 22 25, 25 55, 12 85 C 15 65, 26 35, 20 10 Z"
        fill="url(#clawGradient)"
        filter="url(#bloodGlow)"
        opacity="0.85"
      />
      
      {/* Slash 2 (Deep Middle Left) */}
      <path
        d="M38 6 C 45 30, 48 65, 30 96 C 36 70, 49 40, 42 6 Z"
        fill="url(#clawGradient)"
        filter="url(#bloodGlow)"
      />

      {/* Slash 3 (Deadly Center Right) */}
      <path
        d="M62 4 C 70 32, 72 70, 52 98 C 60 72, 75 42, 66 4 Z"
        fill="url(#clawGradient)"
        filter="url(#bloodGlow)"
      />

      {/* Slash 4 (Outer Right) */}
      <path
        d="M84 14 C 90 35, 88 65, 75 88 C 82 66, 92 40, 86 14 Z"
        fill="url(#clawGradient)"
        filter="url(#bloodGlow)"
        opacity="0.85"
      />

      {/* Dripping blood drops */}
      <circle cx="31" cy="98" r="2" fill="#ff4d6d" opacity="0.9" />
      <circle cx="53" cy="100" r="2.5" fill="#e11d48" />
      <circle cx="76" cy="91" r="1.5" fill="#be123c" />
    </svg>
  );
}
