import React, { useState } from 'react';
import { Flame, Check, RotateCcw, Sparkles, Gavel, UserX, Star, Scale, Search } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import GothicBadge from '../ui/GothicBadge';
import WolfIcon from '../ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole, matchesSearch, removeVietnameseTones } from '../../utils/roleUtils';

export default function DayVotingSection({
  alivePlayers,
  hasLynchedToday,
  lynchedPlayer,
  lynchedTodayPlayerId,
  onUndoLynch,
  onOpenAssignRole,
  hasStutteringJudge,
  setExtraLynchAllowed,
  selectedLynchId,
  setSelectedLynchId,
  nightState,
  onLynchPlayer,
  showConfirm,
  scapegoatBannedVoterIds = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const scapegoat = alivePlayers.find(p => (p.currentRoleId || p.roleId) === 'nguoi-the-than' || getPlayerRole(p)?.id === 'nguoi-the-than');

  const filteredAlive = alivePlayers.filter(p => {
    if (!searchQuery) return true;
    const q = removeVietnameseTones(searchQuery);
    return matchesSearch(p.name, q) || String(p.id).includes(q);
  });

  return (
    <div className="p-5 rounded-2xl bg-[#0f111c]/60 backdrop-blur-md border border-purple-900/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-cinzel">
            <Flame className="w-5 h-5 text-orange-400" />
            BIỂU QUYẾT TREO CỔ
          </h3>
          {hasStutteringJudge && nightState?.stutteringJudgeSignal && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-300 shrink-0" title="Dấu hiệu bí mật Thẩm Phán Lắp Bắp">
              ⚖️ Dấu hiệu Thẩm Phán: {nightState.stutteringJudgeSignal}
            </span>
          )}
          {!hasLynchedToday && (
            <div className="relative sm:hidden">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm tên..."
                className="w-24 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasLynchedToday && (
            <div className="relative hidden sm:block">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm tên hoặc số ghế..."
                className="w-36 text-xs py-1 pl-7 pr-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>
          )}
          {hasLynchedToday && (
            <GothicBadge variant="wolf">
              <Check className="w-3.5 h-3.5" />
              Đã xong biểu quyết sáng nay
            </GothicBadge>
          )}
        </div>
      </div>

      {/* LOCKED BANNER WHEN 1 PERSON IS ALREADY LYNCHED */}
      {hasLynchedToday ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#290508]/80 via-[#120305] to-[#290508]/80 border border-rose-600/80 text-center space-y-3 shadow-[0_0_25px_rgba(225,29,72,0.35)]">
          <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-600 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
            <Flame className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
              Án Treo Cổ Đã Được Thực Hiện
            </div>
            <div className="text-xl font-black font-cinzel text-white">
              Nạn nhân: {lynchedPlayer?.name || 'Người chơi'} ({getPlayerRole(lynchedPlayer)?.name || 'Chưa lộ vai'})
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {onUndoLynch && (
              <GothicButton
                variant="dark"
                size="sm"
                icon={RotateCcw}
                onClick={() => {
                  onUndoLynch(lynchedTodayPlayerId);
                  setExtraLynchAllowed(false);
                }}
              >
                Hoàn tác treo cổ
              </GothicButton>
            )}

            {/* SỬA / GÁN VAI TRÒ CHO NẠN NHÂN TRỰC TIẾP TẠI CHỖ */}
            {onOpenAssignRole && lynchedPlayer && (
              <GothicButton
                variant="witch"
                size="sm"
                icon={Sparkles}
                onClick={() => onOpenAssignRole(lynchedPlayer)}
              >
                {getPlayerRole(lynchedPlayer) ? 'Đổi Vai Trò' : 'Gán Vai Trò'}
              </GothicButton>
            )}

            {hasStutteringJudge && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <GothicButton
                  variant="witch"
                  size="sm"
                  icon={Gavel}
                  onClick={() => setExtraLynchAllowed(true)}
                >
                  Thẩm Phán (Vote Thêm)
                </GothicButton>
                {nightState?.stutteringJudgeSignal && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-300">
                    Dấu hiệu: {nightState.stutteringJudgeSignal}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VOTING GRID - ALLOW SELECTING ONLY 1 PERSON - WITH WEREWOLF RED BORDERS */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredAlive.map(p => {
              const isSelected = selectedLynchId === p.id;
              const isWolf = isWolfPlayer(p);
              const pRole = getPlayerRole(p);
              const origRole = getPlayerOriginalRole(p);
              const isServant = (p.currentRoleId === 'nguoi-day-to-tan-tuy' || p.roleId === 'nguoi-day-to-tan-tuy' || pRole?.id === 'nguoi-day-to-tan-tuy');

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedLynchId(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-950 via-[#3a080c] to-rose-950 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] ring-1 ring-rose-400'
                      : isWolf
                      ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                      : isServant
                      ? 'bg-gradient-to-r from-[#06182a] to-[#030e1a] border-cyan-500/90 hover:border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/60 text-slate-200'
                      : 'bg-[#121422] hover:bg-[#181a2e] border-slate-800 hover:border-purple-600/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-400'
                        : isWolf
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : isServant
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {p.id}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5 flex-wrap">
                        <span className={isWolf ? 'text-rose-200 font-black' : isSelected ? 'text-white' : isServant ? 'text-cyan-100 font-bold' : 'text-slate-100'}>
                          {p.name}
                        </span>
                        {isServant && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.5)] flex items-center gap-0.5">
                            🗝️ Người Hầu
                          </span>
                        )}
                        {p.isSheriff && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-950 text-amber-300 border border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> Trưởng Làng (x2)
                          </span>
                        )}
                        {isWolf && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center gap-1">
                            <WolfIcon className="w-2.5 h-2.5" /> Sói
                          </span>
                        )}
                        {nightState?.ravenTargetId === p.id && !nightState?.ravenSkipped && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-purple-950 text-purple-300 border border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.5)] flex items-center gap-0.5">
                            🪶 Quạ phạt (+2)
                          </span>
                        )}
                        {scapegoatBannedVoterIds?.includes(p.id) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-950 text-amber-300 border border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex items-center gap-0.5">
                            <Scale className="w-2.5 h-2.5" /> Cấm biểu quyết
                          </span>
                        )}
                        {nightState?.silencedPlayerId === p.id && !nightState?.moonPriestessSkipped && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-slate-900 text-slate-300 border border-slate-700 shadow-sm flex items-center gap-0.5" title="Bị Nguyệt Nữ cấm phát biểu">
                            🔇 Câm lặng
                          </span>
                        )}
                        {(p.isAsleepByApothecary || (nightState?.apothecarySleepTargetId === p.id && !nightState?.apothecarySkipped)) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-teal-950 text-teal-300 border border-teal-600 shadow-[0_0_8px_rgba(20,184,166,0.5)] flex items-center gap-0.5" title="Bị Dược Sĩ gây mê: Cấm nói & cấm biểu quyết">
                            💤 Mê man (Cấm vote)
                          </span>
                        )}
                        {p.isHypnotized && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-purple-950 text-purple-300 border border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.5)] flex items-center gap-0.5" title="Bị Người Thổi Sáo thôi miên">
                            🎵 Thôi miên
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Vai: {p.isCursedWolf && origRole ? (
                          <span className="text-rose-300 font-bold">
                            {pRole?.name}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">{pRole?.name || 'Chưa lộ vai'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-black text-rose-300 bg-rose-950 px-2.5 py-1 rounded-xl border border-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.6)]">
                      Treo Cổ 🔥
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TIE VOTE ACTION FOR SCAPEGOAT (HÒA PHIẾU TREO CỔ) */}
          {scapegoat && (
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-cinzel">
                <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hòa phiếu biểu quyết:</span>
              </span>
              <GothicButton
                variant="blood"
                size="sm"
                onClick={() => {
                  showConfirm({
                    title: 'HÒA PHIẾU: NGƯỜI THẾ THÂN CHẾT THAY',
                    message: `Biểu quyết hòa phiếu: Người Thế Thân (${scapegoat.name} #${scapegoat.id}) bị đưa lên giàn treo thay thế.\n\nTiến hành xử tử?`,
                    variant: 'blood',
                    confirmText: 'Xử Tử Người Thế Thân ⚖️',
                    onConfirm: () => {
                      onLynchPlayer(scapegoat.id);
                    }
                  });
                }}
              >
                Người Thế Thân Chết Thay ⚖️
              </GothicButton>
            </div>
          )}

          {selectedLynchId && (
            <div className="pt-2 flex justify-end">
              <GothicButton
                variant="blood"
                size="md"
                icon={UserX}
                onClick={() => {
                  onLynchPlayer(selectedLynchId);
                  setSelectedLynchId(null);
                  setExtraLynchAllowed(false);
                }}
                className="shadow-2xl shadow-rose-950/80"
              >
                Xác nhận treo cổ
              </GothicButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
