import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Sparkles, Skull, Check, AlertCircle, HelpCircle, SkipForward, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';
import { getPlayerRole, isWolfPlayer as checkWolfPlayer, WOLF_ROLE_IDS } from '../utils/roleUtils';

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
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'slider'
  const [slidePage, setSlidePage] = useState(0);

  const isSisters = currentRole?.id === 'hai-chi-em';
  const isBrothers = currentRole?.id === 'ba-anh-em';
  const isMultiAssign = isWolfStep || isSisters || isBrothers;

  // Calculate capacity: Wolves configured by deck; Hai Chị Em is 2; Ba Anh Em is 3
  const targetCapacity = isWolfStep
    ? (deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2)
    : isSisters
    ? 2
    : isBrothers
    ? 3
    : 1;

  const hasCursedInDeck = deckRoleIds.some(id => ['soi-quy', 'nguoi-cha-cua-soi', 'soi-nguyen'].includes(id));

  const pageSize = 6;
  const totalPages = Math.ceil(players.length / pageSize);

  const scrollSlider = (direction) => {
    if (direction === 'prev') {
      setSlidePage(prev => Math.max(0, prev - 1));
    } else {
      setSlidePage(prev => Math.min(totalPages - 1, prev + 1));
    }
  };

  // Initialize selected players from already assigned players if any
  useEffect(() => {
    if (isMultiAssign) {
      const existingHolders = isWolfStep
        ? players.filter(p => isWolfPlayer(p)).map(p => p.id)
        : players.filter(p => (p.currentRoleId || p.roleId) === currentRole?.id).map(p => p.id);
      if (existingHolders.length > 0 && selectedWolfIds.length === 0) {
        setSelectedWolfIds(existingHolders);
      }
    }
  }, [isWolfStep, currentRole?.id]);

  if (!currentRole) return null;

  // Handles single tap assignment (for single-seat roles)
  const handleSingleAssign = (playerId) => {
    onAssignRole(playerId, currentRole);
  };

  // Toggle player selection with strict rules
  const toggleMultiSelection = (playerId) => {
    const target = players.find(p => p.id === playerId);
    if (!target) return;

    const targetCurrentId = target.currentRoleId || target.roleId;
    const isTargetAlreadyThisRole = isWolfStep
      ? isWolfPlayer(target)
      : targetCurrentId === currentRole.id;

    // Strict Rule: Players who already have other roles CANNOT be selected
    if (targetCurrentId && !isTargetAlreadyThisRole) {
      return;
    }

    setSelectedWolfIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      // Strict limit: Cannot select more than targetCapacity
      if (prev.length >= targetCapacity) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  // Confirm multiple assignment
  const handleConfirmMulti = () => {
    if (selectedWolfIds.length === 0 || selectedWolfIds.length > targetCapacity) return;
    if (onAssignRoleToMultiple) {
      onAssignRoleToMultiple(selectedWolfIds, currentRole);
    } else {
      selectedWolfIds.forEach(id => onAssignRole(id, currentRole));
    }
  };

  const renderSeatCard = (p) => {
    const pCurrentId = p.currentRoleId || p.roleId;
    const hasRole = Boolean(pCurrentId);
    const isWolf = isWolfPlayer(p);
    const isCurrentSelected = selectedWolfIds.includes(p.id);
    const isAlreadyAssignedRole = isWolfStep ? isWolf : pCurrentId === currentRole.id;
    const hasOtherRole = hasRole && !isAlreadyAssignedRole;
    const isMaxReached = selectedWolfIds.length >= targetCapacity;
    const isSlotLocked = isMaxReached && !isCurrentSelected && !isAlreadyAssignedRole;
    const isFirstSelectedWolf = isWolfStep && isCurrentSelected && selectedWolfIds[0] === p.id && hasCursedInDeck;

    if (isMultiAssign) {
      const isDisabled = hasOtherRole || isSlotLocked;

      return (
        <button
          key={p.id}
          type="button"
          disabled={isDisabled && !isCurrentSelected && !isAlreadyAssignedRole}
          onClick={() => toggleMultiSelection(p.id)}
          className={`p-2 rounded-xl border text-left transition-all duration-75 select-none touch-manipulation active:scale-95 cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[72px] relative overflow-hidden ${
            isCurrentSelected || isAlreadyAssignedRole
              ? isWolfStep
                ? isFirstSelectedWolf
                  ? 'bg-gradient-to-r from-purple-950 via-[#3b084d] to-purple-950 border-purple-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.7)] ring-1 ring-purple-300 scale-[1.03]'
                  : 'bg-gradient-to-r from-rose-950 via-[#3b090e] to-rose-950 border-rose-500 text-white shadow-[0_0_18px_rgba(225,29,72,0.7)] ring-1 ring-rose-400 scale-[1.03]'
                : 'bg-gradient-to-r from-purple-950 via-[#35104d] to-purple-950 border-purple-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.7)] ring-1 ring-purple-300 scale-[1.03]'
              : hasOtherRole
              ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
              : isSlotLocked
              ? 'opacity-50 cursor-not-allowed bg-[#10121e] border-slate-800 text-slate-500'
              : 'bg-[#101322] hover:bg-[#181c33] border-slate-800 hover:border-purple-600 text-slate-300 shadow-sm'
          }`}
        >
          {/* Top seat bar indicator */}
          <div className={`w-6 h-0.5 rounded-full mb-1 ${
            isCurrentSelected || isAlreadyAssignedRole
              ? isWolfStep
                ? isFirstSelectedWolf ? 'bg-purple-300' : 'bg-rose-400'
                : 'bg-purple-300'
              : 'bg-slate-700'
          }`}></div>

          {/* Seat Header: Seat Number + Status Icon */}
          <div className="flex items-center justify-between w-full">
            <span className={`font-mono font-black text-xs sm:text-sm ${
              isCurrentSelected || isAlreadyAssignedRole
                ? 'text-white'
                : hasOtherRole
                ? 'text-slate-600'
                : 'text-slate-300'
            }`}>
              #{p.id}
            </span>

            {(isCurrentSelected || isAlreadyAssignedRole) ? (
              isWolfStep ? (
                isFirstSelectedWolf ? (
                  <span className="text-xs">🔮</span>
                ) : (
                  <Skull className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" />
                )
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              )
            ) : hasOtherRole ? (
              <Lock className="w-3 h-3 text-slate-600" />
            ) : null}
          </div>

          {/* Player Name */}
          <div className="font-bold text-xs truncate w-full mt-0.5">
            <span className={
              isCurrentSelected || isAlreadyAssignedRole
                ? 'text-white font-black'
                : hasOtherRole
                ? 'text-slate-500'
                : 'text-slate-200'
            }>
              {p.name}
            </span>
          </div>

          {/* Role or Action hint */}
          <div className="text-[9px] truncate w-full mt-0.5">
            {hasOtherRole ? (
              <span className="text-slate-500">Đã có vai</span>
            ) : (isCurrentSelected || isAlreadyAssignedRole) ? (
              isWolfStep ? (
                isFirstSelectedWolf ? (
                  <span className="text-purple-300 font-bold">🔮 Sói Nguyền</span>
                ) : (
                  <span className="text-rose-300 font-bold flex items-center gap-0.5"><WolfIcon className="w-2.5 h-2.5 inline" /> Sói Thường</span>
                )
              ) : isSisters ? (
                <span className="text-purple-300 font-bold">👭 Chị Em</span>
              ) : (
                <span className="text-purple-300 font-bold">👬 Anh Em</span>
              )
            ) : isSlotLocked ? (
              <span className="text-slate-500">Đã đủ {targetCapacity}</span>
            ) : (
              <span className="text-slate-500">Chưa có vai</span>
            )}
          </div>
        </button>
      );
    }

    // Single role assignment
    const isHoldingCurrent = pCurrentId === currentRole.id;
    const isHoldingOther = hasRole && !isHoldingCurrent;

    return (
      <button
        key={p.id}
        type="button"
        disabled={isHoldingOther}
        onClick={() => handleSingleAssign(p.id)}
        className={`p-2 rounded-xl border text-left transition-all duration-75 select-none touch-manipulation active:scale-95 cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[72px] relative overflow-hidden ${
          isHoldingCurrent
            ? 'bg-purple-950 border-purple-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.7)] ring-1 ring-purple-300 scale-[1.03]'
            : isHoldingOther
            ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
            : 'bg-[#101322] hover:bg-[#181c33] border-slate-800 hover:border-purple-600 text-slate-300 shadow-sm'
        }`}
      >
        <div className={`w-6 h-0.5 rounded-full mb-1 ${
          isHoldingCurrent ? 'bg-purple-300' : 'bg-slate-700'
        }`}></div>

        <div className="flex items-center justify-between w-full">
          <span className={`font-mono font-black text-xs sm:text-sm ${
            isHoldingCurrent ? 'text-white' : isHoldingOther ? 'text-slate-600' : 'text-slate-300'
          }`}>
            #{p.id}
          </span>
          {isHoldingCurrent ? (
            <Check className="w-3.5 h-3.5 text-purple-300" />
          ) : isHoldingOther ? (
            <Lock className="w-3 h-3 text-slate-600" />
          ) : null}
        </div>

        <div className="font-bold text-xs truncate w-full mt-0.5">
          <span className={isHoldingCurrent ? 'text-white font-black' : isHoldingOther ? 'text-slate-500' : 'text-slate-200'}>
            {p.name}
          </span>
        </div>

        <div className="text-[9px] truncate w-full mt-0.5">
          {isHoldingCurrent ? (
            <span className="text-purple-300 font-bold">✓ Giữ vai này</span>
          ) : isHoldingOther ? (
            <span className="text-slate-500">Đã có vai</span>
          ) : (
            <span className="text-slate-500">Chưa có vai</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-[0_6px_30px_rgba(0,0,0,0.7)] animate-fade-in mb-4 ${
      isWolfStep
        ? 'bg-gradient-to-b from-[#220609] via-[#150305] to-[#0c0203] border-rose-600/90 shadow-[0_0_25px_rgba(225,29,72,0.35)]'
        : 'bg-gradient-to-b from-[#190d2e] via-[#100921] to-[#0a0714] border-purple-600/80 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
    }`}>
      {/* Header Prompt */}
      <div className="space-y-2 mb-3 text-center sm:text-left">
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

            {isMultiAssign ? (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                isWolfStep 
                  ? 'bg-rose-950/90 border-rose-600 text-rose-200' 
                  : 'bg-purple-950/90 border-purple-600 text-purple-200'
              }`}>
                Đã chọn: <strong className="text-white text-xs">{selectedWolfIds.length}</strong> / {targetCapacity} {isWolfStep ? 'Sói' : 'Người'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Tip for Cursed Wolf */}
        {isWolfStep && hasCursedInDeck && (
          <div className="text-[11px] text-purple-300 font-medium bg-purple-950/50 border border-purple-800/60 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-sm">🔮</span>
            <span>Bộ bài có Sói Nguyền: <strong>Người được chọn đầu tiên (#1)</strong> sẽ giữ vai <strong>Sói Nguyền</strong>.</span>
          </div>
        )}
      </div>

      {/* TOP SUMMARY BOX: CHOSEN PLAYERS HIGHLIGHT (FOR MULTI-ASSIGN ROLES) */}
      {isMultiAssign && (
        <div className={`p-3 sm:p-4 rounded-2xl border shadow-md mb-3.5 space-y-2 ${
          isWolfStep
            ? 'bg-gradient-to-r from-[#2a060b] via-[#1a0407] to-[#120204] border-rose-600/80'
            : 'bg-gradient-to-r from-[#200d33] via-[#140722] to-[#0c0415] border-purple-600/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={`uppercase tracking-wider flex items-center gap-1.5 font-cinzel ${
              isWolfStep ? 'text-rose-200' : 'text-purple-200'
            }`}>
              {isWolfStep ? <Skull className="w-3.5 h-3.5 text-rose-400 fill-rose-500" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              <span>
                {isWolfStep
                  ? `Danh Sách Ma Sói Đã Chọn (${selectedWolfIds.length}/${targetCapacity}):`
                  : isSisters
                  ? `Danh Sách Hai Chị Em Đã Chọn (${selectedWolfIds.length}/${targetCapacity}):`
                  : `Danh Sách Ba Anh Em Đã Chọn (${selectedWolfIds.length}/${targetCapacity}):`}
              </span>
            </span>
            {selectedWolfIds.length === targetCapacity && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                ✓ Đã chọn đủ {targetCapacity} người
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: targetCapacity }).map((_, idx) => {
              const targetId = selectedWolfIds[idx];
              const targetPlayer = targetId ? players.find(p => p.id === targetId) : null;
              const isCursedSlot = isWolfStep && idx === 0 && hasCursedInDeck;

              return (
                <div
                  key={idx}
                  className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                    targetPlayer
                      ? isWolfStep
                        ? isCursedSlot
                          ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] text-white'
                          : 'bg-rose-950/80 border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.4)] text-white'
                        : 'bg-purple-950/80 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] text-white'
                      : 'bg-black/30 border-dashed border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${
                    isWolfStep 
                      ? (isCursedSlot ? 'text-purple-300' : 'text-rose-400')
                      : 'text-purple-300'
                  }`}>
                    {isWolfStep 
                      ? (isCursedSlot ? '🔮 Sói Nguyền' : `🐺 Sói ${idx + 1}`)
                      : isSisters
                      ? `👭 Chị Em ${idx + 1}`
                      : `👬 Anh Em ${idx + 1}`}
                  </div>
                  <div className="font-black text-sm truncate mt-0.5">
                    {targetPlayer ? targetPlayer.name : '— Chưa chọn —'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {targetPlayer ? `Ghế #${targetPlayer.id}` : `Trống`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Switcher Bar: Theatre Matrix vs Slider */}
      <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
        <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
          <span>Ghế Ngồi: {isMultiAssign ? `${selectedWolfIds.length}/${targetCapacity}` : '1'} đã chọn</span>
        </span>

        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? isWolfStep ? 'bg-rose-900 border border-rose-500 text-white' : 'bg-purple-900 border border-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ma Trận Ghế
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'slider'
                ? isWolfStep ? 'bg-rose-900 border border-rose-500 text-white' : 'bg-purple-900 border border-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thanh Trượt (Slider)
          </button>
        </div>
      </div>

      {/* MODE 1: THEATRE SEAT MATRIX */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 animate-fade-in">
          {players.map(p => renderSeatCard(p))}
        </div>
      )}

      {/* MODE 2: HORIZONTAL SLIDER */}
      {viewMode === 'slider' && (
        <div className="space-y-2 animate-fade-in">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {players
              .slice(slidePage * pageSize, (slidePage + 1) * pageSize)
              .map(p => renderSeatCard(p))}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              disabled={slidePage === 0}
              onClick={() => scrollSlider('prev')}
              className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 disabled:opacity-30 text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trước
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Trang {slidePage + 1}/{totalPages} ({players.length} ghế)
            </span>
            <button
              type="button"
              disabled={slidePage >= totalPages - 1}
              onClick={() => scrollSlider('next')}
              className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 disabled:opacity-30 text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              Sau <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Action Footer for Multi-assign (Wolves, Hai Chị Em, Ba Anh Em) */}
      {isMultiAssign && (
        <div className={`mt-3.5 pt-3 border-t flex items-center justify-between gap-2 ${
          isWolfStep ? 'border-rose-950/80' : 'border-purple-950/80'
        }`}>
          {selectedWolfIds.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedWolfIds([])}
              className={`text-xs underline font-medium cursor-pointer ${
                isWolfStep ? 'text-slate-400 hover:text-rose-300' : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              ✕ Xóa chọn lại
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              {isWolfStep ? 'Chưa chọn Ma Sói' : isSisters ? 'Chưa chọn 2 Chị Em' : 'Chưa chọn 3 Anh Em'}
            </div>
          )}

          <GothicButton
            variant={isWolfStep ? 'blood' : 'witch'}
            size="md"
            disabled={selectedWolfIds.length !== targetCapacity}
            onClick={handleConfirmMulti}
            className="shadow-xl"
          >
            <Check className="w-4 h-4 mr-1 inline" />
            <span>
              {isWolfStep
                ? `Xác Nhận (${selectedWolfIds.length}/${targetCapacity}) Sói ✓`
                : isSisters
                ? `Xác Nhận (${selectedWolfIds.length}/2) Hai Chị Em ✓`
                : `Xác Nhận (${selectedWolfIds.length}/3) Ba Anh Em ✓`}
            </span>
          </GothicButton>
        </div>
      )}
    </div>
  );
}

