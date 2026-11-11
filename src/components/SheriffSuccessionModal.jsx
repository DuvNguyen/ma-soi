import React from 'react';
import { Star, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import { getPlayerRole } from '../utils/roleUtils';
import triggerHaptic from '../utils/haptics';

export default function SheriffSuccessionModal({
  isOpen,
  onClose,
  deadSheriff,
  alivePlayers = [],
  onSelectSuccessor,
  isMandatory = false
}) {
  if (!isOpen) return null;

  const handleSelect = (playerId) => {
    triggerHaptic('success');
    onSelectSuccessor(playerId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={() => {
        if (!isMandatory) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1c0f24] via-[#140a1c] to-[#0c0512] border-2 border-amber-500/70 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-4 sm:p-6 text-white my-auto flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/50 shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinzel text-amber-300 flex items-center gap-1.5">
                <span>DI CHÚC CẢNH SÁT TRƯỞNG</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40">
                  Phiếu x2
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-200/80">
                Chỉ định 1 người chơi còn sống để kế thừa huy hiệu
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Đóng"
            >
              ✕
            </button>
          )}
        </div>

        {/* Notice Banner */}
        <div className="my-3 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs sm:text-sm text-amber-100 flex items-start gap-2.5 shrink-0">
          <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {deadSheriff ? (
              <>
                <strong className="text-amber-300 font-cinzel">{deadSheriff.name} (#{deadSheriff.id})</strong> đã hy sinh! 
                Trước khi trút hơi thở cuối cùng, Cảnh Sát Trưởng phải chỉ định 1 người chơi còn sống để di chúc trao lại huy hiệu.
              </>
            ) : (
              <>
                Theo luật Ma Sói, Cảnh Sát Trưởng nắm giữ quyền biểu quyết x2. Hãy chạm trực tiếp vào người chơi còn sống bên dưới để trao huy hiệu.
              </>
            )}
            {isMandatory && (
              <div className="mt-1 font-bold text-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Bắt buộc phải chỉ định người kế nhiệm trước khi cả làng đi ngủ!</span>
              </div>
            )}
          </div>
        </div>

        {/* Living Players Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 overscroll-contain">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Danh sách người sống ({alivePlayers.length} người):</span>
            <span className="text-amber-400/80">Chạm 1 lần để trao</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {alivePlayers.map(p => {
              const role = getPlayerRole(p);
              const isOldSheriff = deadSheriff && deadSheriff.id === p.id;
              if (isOldSheriff) return null;

              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className="group relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-amber-950/60 border border-slate-700/70 hover:border-amber-400 transition-all text-left flex flex-col justify-between min-h-[64px] shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-300 border border-slate-700 group-hover:border-amber-500/40">
                      #{p.id < 10 ? `0${p.id}` : p.id}
                    </span>
                    <Star className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>

                  <div className="mt-1">
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-amber-300/80 truncate">
                      {role?.name || 'Chưa lộ vai'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!isMandatory && (
          <div className="pt-3 mt-3 border-t border-slate-800 flex justify-end shrink-0">
            <GothicButton
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Để Sau
            </GothicButton>
          </div>
        )}
      </div>
    </div>
  );
}
