import React from 'react';
import { Heart, Skull, Shield, Eye, UserCheck, AlertCircle, Sparkles, Star, Edit3, Users } from 'lucide-react';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../utils/roleUtils';

export default function PlayersGridView({ players, onOpenAssignRole, onOpenRosters }) {
  const aliveCount = players.filter(p => p.isAlive).length;
  const wolfCount = players.filter(p => p.isAlive && isWolfPlayer(p)).length;
  const villagerCount = players.filter(p => p.isAlive && !isWolfPlayer(p) && getPlayerRole(p)?.teamCode === 'V').length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Overview Stat Badges - Compact Gothic Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0f111a] border border-slate-800 flex items-center gap-2.5 shadow-sm">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Heart className="w-4 h-4 fill-emerald-500/20" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Còn sống</div>
            <div className="text-xs sm:text-sm font-black text-slate-100 truncate">{aliveCount} người</div>
          </div>
        </div>

        {/* Werewolves Alive Badge */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#240508] to-[#120204] border border-rose-600/90 shadow-[0_0_12px_rgba(225,29,72,0.35)] flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0">
            <WolfIcon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Phe Sói</div>
            <div className="text-xs sm:text-sm font-black text-rose-200 truncate">{wolfCount} con sống</div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0a1224] border border-blue-900/60 flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-300 text-base sm:text-lg shrink-0 select-none">
            👨‍🌾
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Phe Dân</div>
            <div className="text-xs sm:text-sm font-black text-blue-200 truncate">{villagerCount} người sống</div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#170826] border border-purple-900/60 flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0">
            <Skull className="w-4 h-4 text-purple-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Hy sinh</div>
            <div className="text-xs sm:text-sm font-black text-purple-200 truncate">{players.length - aliveCount} người</div>
          </div>
        </div>
      </div>

      {/* THEATRE / CINEMA SEATS MATRIX CONTAINER */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0b0d18] border border-purple-950/80 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Theatre Stage Arc Indicator & Action Header */}
        <div className="relative mb-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2 border-b border-purple-950/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-widest text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-700/80 shadow-sm font-cinzel">
              ✦ SÂN KHẤU QUẢN TRÒ • VÒNG TRÒN LÀNG ✦
            </span>
          </div>

          {onOpenRosters && (
            <button
              type="button"
              onClick={onOpenRosters}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600 hover:border-purple-400 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="Mở danh sách nhóm người chơi để đổi hoặc sửa tên"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-300" />
              <span>Sửa Nhóm Người</span>
            </button>
          )}
        </div>

        {/* Theatre Matrix Seats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 max-h-[62vh] overflow-y-auto custom-scrollbar pr-1">
          {players.map(p => {
            const partner = p.loverId ? players.find(x => x.id === p.loverId) : null;
            const isWolf = isWolfPlayer(p);
            const pRole = getPlayerRole(p);
            const origRole = getPlayerOriginalRole(p);
            const hasRole = Boolean(pRole || p.currentRoleId || p.roleId);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenAssignRole(p)}
                title={`Ghế #${p.id} - ${p.name} (${pRole?.name || 'Chưa gán vai'}) - Bấm để đổi vai trò`}
                className={`relative p-2 sm:p-2.5 rounded-xl border text-center transition-all duration-75 select-none touch-manipulation active:scale-95 cursor-pointer flex flex-col items-center justify-between min-h-[90px] sm:min-h-[105px] group ${
                  !p.isAlive
                    ? 'bg-[#08080c]/80 border-slate-900 opacity-40 hover:opacity-75'
                    : isWolf
                    ? 'bg-gradient-to-b from-[#280509] via-[#160205] to-[#0c0203] border-rose-600/90 shadow-[0_0_15px_rgba(225,29,72,0.4)] ring-1 ring-rose-500/50 hover:scale-105'
                    : 'bg-[#101322] hover:bg-[#181c33] border-purple-900/70 hover:border-purple-400 shadow-sm hover:scale-105'
                }`}
              >
                {/* Theatre Seat Top Headrest Bar */}
                <div className={`w-8 sm:w-10 h-1 rounded-full mb-1 ${
                  !p.isAlive
                    ? 'bg-slate-800'
                    : isWolf
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]'
                    : 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]'
                }`}></div>

                {/* Seat Number (Prominent Like Cinema Seat) */}
                <div className="flex items-center gap-1">
                  <span className={`font-mono font-black text-xs sm:text-sm ${
                    !p.isAlive
                      ? 'text-slate-600 line-through'
                      : isWolf
                      ? 'text-rose-300'
                      : 'text-purple-300'
                  }`}>
                    #{p.id}
                  </span>
                  {p.isSheriff && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" title="Cảnh Sát Trưởng (x2 phiếu)" />}
                  {partner && <Heart className="w-3 h-3 text-pink-400 fill-pink-500 shrink-0" />}
                </div>

                {/* Player Name */}
                <div className={`font-bold text-xs truncate max-w-full px-1 ${
                  !p.isAlive
                    ? 'text-slate-600 line-through'
                    : isWolf
                    ? 'text-rose-100 font-black'
                    : 'text-slate-100'
                }`}>
                  {p.name}
                </div>

                {/* Role Pill or Status */}
                <div className="w-full mt-1">
                  {!p.isAlive ? (
                    <span className="text-[9px] font-bold text-rose-400/90 flex items-center justify-center gap-0.5">
                      <Skull className="w-2.5 h-2.5" /> Chết
                    </span>
                  ) : hasRole ? (
                    p.isCursedWolf && origRole ? (
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded flex items-center justify-center gap-1 truncate bg-rose-950 text-rose-200 border border-rose-600 shadow-sm" title={pRole?.name}>
                          <WolfIcon className="w-2.5 h-2.5 shrink-0" /> {pRole?.name}
                        </span>
                        <span className="text-[8px] text-purple-300 font-medium block truncate" title={`Vai ban đầu: ${origRole.name}`}>
                          🔮 Trúng nguyền
                        </span>
                      </div>
                    ) : (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded block truncate ${
                        isWolf
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {pRole?.name || 'Đã gán vai'}
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] text-slate-500 italic block truncate">
                      Chưa gán
                    </span>
                  )}
                </div>

                {/* Hover Quick Prompt */}
                <span className="absolute inset-x-0 -bottom-1 text-[8px] uppercase tracking-wider text-purple-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 py-0.5 rounded-b-xl border-t border-purple-600">
                  Đổi vai ▾
                </span>
              </button>
            );
          })}
        </div>

        {/* Theatre Seat Legend */}
        <div className="mt-5 pt-3 border-t border-purple-950/60 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600/90 border border-rose-400 shadow-[0_0_6px_rgba(225,29,72,0.6)]"></span>
            <span>Ghế Ma Sói</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#101322] border border-purple-600"></span>
            <span>Ghế Dân Làng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-black/80 border border-slate-800"></span>
            <span>Ghế Đã Hy Sinh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500" />
            <span>Cặp Đôi Yêu Nhau</span>
          </div>
          <span className="text-slate-500 italic hidden sm:inline">
            (Chạm vào bất kỳ ghế nào để đổi vai trò)
          </span>
        </div>
      </div>
    </div>
  );
}