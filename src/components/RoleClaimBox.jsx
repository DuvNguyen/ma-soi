import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Skull, Check, AlertCircle, HelpCircle, SkipForward, Lock } from 'lucide-react';
import GothicButton from './ui/GothicButton';

const WOLF_ROLE_IDS = [
  'soi-thuong', 'soi-con', 'soi-lon-xau-xa', 
  'soi-trang', 'nguoi-cha-cua-soi', 'soi-lua', 'anh-em-soi'
];

export default function RoleClaimBox({
  currentRole,
  players,
  deckRoleIds = [],
  onAssignRole,
  onAssignRoleToMultiple,
  onSkipRole,
  isWolfStep,
  isWolfPlayer
}) {
  const [selectedWolfIds, setSelectedWolfIds] = useState([]);

  // Calculate maximum wolves strictly allowed by deck configuration
  const maxWolves = isWolfStep
    ? (deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2)
    : 1;

  // Initialize selected wolves from already assigned wolves if any
  useEffect(() => {
    if (isWolfStep) {
      const existingWolves = players.filter(p => isWolfPlayer(p)).map(p => p.id);
      if (existingWolves.length > 0 && selectedWolfIds.length === 0) {
        setSelectedWolfIds(existingWolves);
      }
    }
  }, [isWolfStep]);

  if (!currentRole) return null;

  // Handles single tap assignment (for non-wolf steps)
  const handleSingleAssign = (playerId) => {
    onAssignRole(playerId, currentRole);
  };

  // Toggle wolf player selection with strict rules
  const toggleWolfSelection = (playerId) => {
    const target = players.find(p => p.id === playerId);
    if (!target) return;

    // Strict Rule: Players who already have other roles (Cupid, Bodyguard, Seer, Half-wolf, etc.) CANNOT be selected
    if (target.roleId && !isWolfPlayer(target)) {
      return;
    }

    setSelectedWolfIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      // Strict limit: Cannot select more than maxWolves
      if (prev.length >= maxWolves) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  // Confirm multiple wolves
  const handleConfirmWolves = () => {
    if (selectedWolfIds.length === 0 || selectedWolfIds.length > maxWolves) return;
    if (onAssignRoleToMultiple) {
      onAssignRoleToMultiple(selectedWolfIds, currentRole);
    } else {
      selectedWolfIds.forEach(id => onAssignRole(id, currentRole));
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-[0_6px_30px_rgba(0,0,0,0.7)] animate-fade-in mb-4 ${
      isWolfStep
        ? 'bg-gradient-to-b from-[#220609] via-[#150305] to-[#0c0203] border-rose-600/90 shadow-[0_0_25px_rgba(225,29,72,0.35)]'
        : 'bg-gradient-to-b from-[#190d2e] via-[#100921] to-[#0a0714] border-purple-600/80 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
    }`}>
      {/* Header Prompt */}
      <div className="space-y-2 mb-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border ${
              isWolfStep
                ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                : 'bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
            }`}>
              {isWolfStep ? <Skull className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <span className={`text-[10px] uppercase font-black tracking-widest ${
                isWolfStep ? 'text-rose-400' : 'text-purple-400'
              }`}>
                Bước Nhận Diện Danh Tính (Lần Đầu Gọi)
              </span>
              <h3 className="text-base sm:text-xl font-black font-cinzel text-white">
                {isWolfStep 
                  ? 'CHỌN NHỮNG NGƯỜI MỞ MẮT NHẬN MA SÓI' 
                  : `AI TRONG VÒNG TRÒN LÀ ${currentRole.name.toUpperCase()}?`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isWolfStep && onSkipRole && (
              <button
                type="button"
                onClick={() => onSkipRole(currentRole.id)}
                className="text-xs px-2.5 py-1 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                title="Bỏ qua nếu vai này không có trong làng hoặc không ai giơ tay"
              >
                <SkipForward className="w-3 h-3" />
                <span>Bỏ qua vai</span>
              </button>
            )}

            {isWolfStep ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-600 text-rose-200">
                Đã chọn: <strong className="text-white text-xs">{selectedWolfIds.length}</strong> / {maxWolves} Sói
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-slate-300 hidden sm:inline">
                Chạm để gán
              </span>
            )}
          </div>
        </div>

        {/* Subtitle instructions */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
          <p className="text-slate-400">
            {isWolfStep
              ? `Chạm chọn đúng ${maxWolves} người mở mắt làm Ma Sói (những người đã có vai khác sẽ bị khóa nghiêm ngặt):`
              : `Chạm vào người chơi giơ tay nhận vai ${currentRole.name}:`}
          </p>
          {isWolfStep && selectedWolfIds.length === maxWolves && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full animate-pulse">
              ✓ Đã chọn đủ {maxWolves}/{maxWolves} Sói theo bộ bài
            </span>
          )}
        </div>
      </div>

      {/* Grid of Players to Claim */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {players.map(p => {
          const hasRole = Boolean(p.roleId);
          const isWolf = isWolfPlayer(p);
          const isCurrentSelectedWolf = selectedWolfIds.includes(p.id);
          const hasOtherRole = hasRole && !isWolf;
          const isHalfWolf = p.roleId === 'nua-nguoi-nua-soi' || p.roleId === 'cho-soi-soi-lai';
          const isMaxReached = selectedWolfIds.length >= maxWolves;
          const isSlotLocked = isMaxReached && !isCurrentSelectedWolf && !isWolf;

          if (isWolfStep) {
            const isDisabled = hasOtherRole || isSlotLocked;

            return (
              <button
                key={p.id}
                type="button"
                disabled={isDisabled && !isCurrentSelectedWolf && !isWolf}
                onClick={() => toggleWolfSelection(p.id)}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 ${
                  isCurrentSelectedWolf || isWolf
                    ? 'bg-gradient-to-r from-rose-950 via-[#3b090e] to-rose-950 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] ring-1 ring-rose-400 cursor-pointer'
                    : hasOtherRole
                    ? 'bg-[#0a0c16] border-slate-900/90 text-slate-500 opacity-40 cursor-not-allowed select-none'
                    : isSlotLocked
                    ? 'bg-[#10121e] border-slate-800/60 text-slate-400 opacity-60 cursor-not-allowed'
                    : 'bg-[#181a2e] hover:bg-[#221c38] border-purple-900/80 hover:border-rose-600 text-slate-200 cursor-pointer'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-black text-[10px] shrink-0 border ${
                      isCurrentSelectedWolf || isWolf
                        ? 'bg-rose-900 text-rose-100 border-rose-500'
                        : hasOtherRole
                        ? 'bg-slate-950 text-slate-600 border-slate-900'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {p.id}
                    </span>
                    <span className={`font-bold text-xs truncate ${
                      isCurrentSelectedWolf || isWolf ? 'text-white' : hasOtherRole ? 'text-slate-400' : 'text-slate-100'
                    }`}>
                      {p.name}
                    </span>
                  </div>
                  <div className="text-[10px] truncate pl-6.5 mt-0.5">
                    {hasOtherRole ? (
                      isHalfWolf ? (
                        <span className="text-amber-400/90 font-medium">🔒 Bán Sói (chỉ hóa khi bị cắn)</span>
                      ) : (
                        <span className="text-purple-400/80 font-medium">🔒 Đã là {p.role?.name || p.roleId}</span>
                      )
                    ) : (isCurrentSelectedWolf || isWolf) ? (
                      <span className="text-rose-300 font-bold">🐺 Đang chọn làm Sói</span>
                    ) : (
                      <span className="text-slate-500">Chưa có vai</span>
                    )}
                  </div>
                </div>

                {(isCurrentSelectedWolf || isWolf) ? (
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-700/80 shrink-0">
                    🐺 Bỏ
                  </span>
                ) : hasOtherRole ? (
                  <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded shrink-0 font-mono">
                    Đã có vai
                  </span>
                ) : isSlotLocked ? (
                  <span className="text-[9px] text-amber-500/80 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded shrink-0">
                    Đã đủ {maxWolves}
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 px-2 py-0.5 rounded shrink-0 font-bold">
                    Chọn +
                  </span>
                )}
              </button>
            );
          }

          // Single role assignment (Cupid, Seer, Bodyguard, Witch, etc.)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSingleAssign(p.id)}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 cursor-pointer ${
                hasRole
                  ? 'bg-[#0f111d] border-slate-900 text-slate-400 hover:border-purple-800'
                  : 'bg-gradient-to-r from-[#170e28] to-[#111425] hover:from-[#2a134d] hover:to-[#1b1c36] border-purple-800/80 hover:border-purple-500 text-slate-200 shadow-sm'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-black text-[10px] shrink-0 border ${
                    hasRole 
                      ? 'bg-slate-900 text-slate-500 border-slate-800' 
                      : 'bg-purple-950 text-purple-200 border-purple-700/80'
                  }`}>
                    {p.id}
                  </span>
                  <span className="font-bold text-xs truncate text-slate-100">{p.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate pl-6.5 mt-0.5">
                  {hasRole ? (
                    <span className="text-purple-300 font-medium">{p.role?.name}</span>
                  ) : (
                    <span className="text-slate-500">Chưa có vai</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                hasRole
                  ? 'bg-slate-950 text-slate-500 border-slate-800'
                  : 'bg-purple-900/90 text-purple-200 border-purple-600'
              }`}>
                {hasRole ? 'Đổi' : 'Gán'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Wolf Confirm Action Footer */}
      {isWolfStep && (
        <div className="mt-4 pt-3 border-t border-rose-950/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-rose-300">
            {selectedWolfIds.length === maxWolves ? (
              <span className="text-emerald-400 font-bold">✓ Đã chọn đủ {maxWolves}/{maxWolves} Ma Sói theo bộ bài</span>
            ) : (
              <span>Đã chọn <strong>{selectedWolfIds.length}/{maxWolves} người</strong> (còn thiếu {Math.max(0, maxWolves - selectedWolfIds.length)})</span>
            )}
          </div>

          <GothicButton
            variant="blood"
            size="md"
            disabled={selectedWolfIds.length === 0 || selectedWolfIds.length > maxWolves}
            onClick={handleConfirmWolves}
            className="shadow-xl"
          >
            <Check className="w-4 h-4 mr-1 inline" />
            <span>Xác Nhận {selectedWolfIds.length}/{maxWolves} Sói ✓</span>
          </GothicButton>
        </div>
      )}
    </div>
  );
}
