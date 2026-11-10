import React, { useEffect } from 'react';
import { X, Skull, Moon } from 'lucide-react';
import ClawMarks from './ClawMarks';
import WolfHead from './WolfHead';

export default function GothicModalContainer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon = null,
  iconColor = 'text-rose-500',
  useWolfHeadIcon = false,
  children,
  maxWidth = 'max-w-xl',
  showClawMarks = true,
  showWolfWatermark = true
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Outer Glow & Shadow Container */}
      <div 
        className={`relative w-full ${maxWidth} rounded-3xl bg-gradient-to-b from-[#180407]/90 via-[#0d0204]/85 to-[#070102]/90 backdrop-blur-md border-2 border-rose-600/90 shadow-[0_0_50px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 overflow-hidden my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Red Moon Spotlight */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-red-950/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Werewolf Head Ghost Watermark in Background */}
        {showWolfWatermark && (
          <div className="absolute -bottom-10 -right-8 opacity-[0.16] pointer-events-none select-none rotate-6">
            <WolfHead size={240} eyeGlow={true} />
          </div>
        )}

        {/* Decorative Claw Slash Scratch Marks on Corners */}
        {showClawMarks && (
          <>
            <div className="absolute -top-4 -right-4 rotate-12 opacity-80 pointer-events-none">
              <ClawMarks size={100} color="#e11d48" />
            </div>
            <div className="absolute -bottom-6 -left-6 -rotate-45 opacity-50 pointer-events-none">
              <ClawMarks size={90} color="#be123c" />
            </div>
          </>
        )}

        {/* Top Header Bar */}
        <div className="relative z-10 px-5 pt-5 pb-4 border-b border-rose-950/80 flex items-start justify-between gap-3 bg-gradient-to-r from-[#200508]/80 to-transparent">
          <div className="flex items-center gap-3">
            {useWolfHeadIcon ? (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-950 via-[#2a0409] to-black border border-rose-500/90 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(225,29,72,0.7)] p-1">
                <WolfHead size={32} eyeGlow={true} />
              </div>
            ) : Icon ? (
              <div className="w-10 h-10 rounded-2xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-950 via-[#2a0409] to-black border border-rose-500/90 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(225,29,72,0.7)] p-1">
                <WolfHead size={32} eyeGlow={true} />
              </div>
            )}

            <div>
              <h3 className="font-cinzel font-black text-lg sm:text-xl text-rose-100 tracking-wider drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-rose-300/80 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-black/60 hover:bg-rose-950 text-slate-400 hover:text-rose-200 border border-rose-900/60 hover:border-rose-500 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="relative z-10 p-5 sm:p-6 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
