import React from 'react';

/**
 * Stylized Gothic Werewolf Icon
 */
export default function WolfIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Outer wolf silhouette */}
      <path d="M12 2.8L9.5 7.2 4.8 4.2l1.6 5.6-4.2 2.6 4.2 2.6-.6 5.2 5.5-2.6 1 1 1-1 5.5 2.6-.6-5.2 4.2-2.6-4.2-2.6 1.6-5.6-4.7 3L12 2.8z" />
      {/* Cutout eyes */}
      <polygon points="8.5,11.2 10.5,12.2 9,13.2" fill="#0c0d16" />
      <polygon points="15.5,11.2 13.5,12.2 15,13.2" fill="#0c0d16" />
      {/* Nose */}
      <polygon points="12,17 10.8,15.5 13.2,15.5" fill="#0c0d16" />
    </svg>
  );
}
