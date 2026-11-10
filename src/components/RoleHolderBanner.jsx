import React, { useState } from 'react';
import { UserCheck, AlertTriangle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Skull, ShieldCheck, X } from 'lucide-react';
import { getRoleCapacity } from '../utils/deckUtils';

export default function RoleHolderBanner({
  currentRole,
  players,
  deckRoleIds = [],
  onAssignRole,
  isWolfStep,
  isWolfPlayer
}) {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  if (!currentRole) return null;

  // For wolf pack step: show all living wolves
  const holders = isWolfStep 
    ? players.filter(p => isWolfPlayer(p))
    : players.filter(p => p.roleId === currentRole.id);

  const capacity = isWolfStep 
    ? (deckRoleIds.filter(id => ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang'].includes(id)).length || 2)
    : getRoleCapacity(currentRole.id, deckRoleIds);

  const hasHolders = holders.length > 0;
  const aliveHolders = holders.filter(p => p.isAlive);
  const allDead = hasHolders && aliveHolders.length === 0;
  const isOverCapacity = !isWolfStep && holders.length > capacity;

  return (
    <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all mb-2.5 sm:mb-3 ${
      isOverCapacity
        ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
        : allDead
        ? 'bg-rose-950/60 border-rose-800 text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
        : !hasHolders && !isWolfStep
        ? 'bg-amber-950/50 border-amber-600/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
        : 'bg-[#121526] border-purple-800/60 text-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
    }`}>
      {/* Compact 1-Row Responsive Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Role identification info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
            isOverCapacity || allDead
              ? 'bg-rose-900 border-rose-600 text-rose-200'
              : !hasHolders && !isWolfStep
              ? 'bg-amber-900 border-amber-600 text-amber-200'
              : 'bg-purple-900 border-purple-500 text-purple-100 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
          }`}>
            {allDead ? <Skull className="w-4 h-4 text-rose-300" /> : isOverCapacity ? <AlertTriangle className="w-4 h-4 text-rose-200" /> : <UserCheck className="w-4 h-4 text-purple-200" />}
          </div>

          <div className="min-w-0 flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 shrink-0">
              {isWolfStep ? 'Bầy Sói:' : 'Giữ vai:'}
            </span>

            {hasHolders ? (
              holders.map(p => (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border truncate ${
                    p.isAlive
                      ? isWolfStep || isWolfPlayer(p)
                        ? 'bg-rose-950 text-rose-200 border-rose-700 shadow-sm'
                        : 'bg-purple-950 text-purple-200 border-purple-600 shadow-sm'
                      : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  <span className="truncate">{p.name} (#{p.id})</span>
                  {p.isAlive ? (
                    <span className="text-[9px] text-emerald-400 font-normal shrink-0">● Sống</span>
                  ) : (
                    <span className="text-[9px] text-rose-400 font-normal shrink-0">✕ Chết</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs font-medium text-amber-400 italic">
                Chưa xác định
              </span>
            )}

            {/* Capacity Pill */}
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
              isOverCapacity
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-black/40 border-slate-800 text-slate-400'
            }`} title="Số người giữ vai / Tối đa theo bộ bài">
              {holders.length}/{capacity}
            </span>
          </div>
        </div>

        {/* Right: Quick action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isWolfStep && (
            <button
              type="button"
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl border border-purple-700/80 bg-purple-950/80 hover:bg-purple-900 text-purple-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{hasHolders ? 'Đổi vai' : 'Gán vai'}</span>
              {showAssignDropdown ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>
          )}

          {allDead && (
            <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 shrink-0">
              Đã chết
            </span>
          )}
        </div>
      </div>

      {isOverCapacity && (
        <div className="text-[11px] text-rose-300 font-bold mt-1.5 pt-1.5 border-t border-rose-900/60">
          ⚠️ Cảnh báo: Vai này chỉ có {capacity} lá bài trong ván! Hãy bấm đổi để chọn lại đúng {capacity} người.
        </div>
      )}

      {/* Quick Assign Dropdown Drawer */}
      {showAssignDropdown && !isWolfStep && (
        <div className="mt-3 pt-3 border-t border-slate-800 animate-fade-in space-y-2">
          <div className="text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>Bấm vào người chơi để gán vai <strong>{currentRole.name}</strong> (Tối đa {capacity} người):</span>
            <span className="text-[11px] text-purple-300 italic">
              💡 Chạm vào người đang giữ để HỦY gán, chạm người khác để CHUYỂN vai
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {players.map(p => {
              const isCurrent = p.roleId === currentRole.id;
              const isWolf = isWolfPlayer(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onAssignRole(p.id, currentRole);
                    setShowAssignDropdown(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                    isCurrent
                      ? 'bg-purple-700 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)] ring-1 ring-purple-300'
                      : isWolf
                      ? 'bg-[#1c0608] hover:bg-[#28090c] text-rose-200 border-rose-800/80 hover:border-rose-500'
                      : 'bg-[#0f111c] hover:bg-[#181a2e] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Vai: {p.role?.name || '❓ Chưa lộ vai'}
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] text-purple-200 bg-purple-900 px-1.5 py-0.5 rounded border border-purple-400 font-bold">
                      ✓ Đang giữ
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Gán
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
