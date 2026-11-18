import React, { useState } from 'react';
import { Flame, Check, RotateCcw, Sparkles, Gavel, UserX, Star, Scale } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import GothicBadge from '../ui/GothicBadge';
import PlayerSeatCard from '../ui/PlayerSeatCard';
import SearchInput from '../ui/SearchInput';
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
  scapegoatBannedVoterIds = [],
  scapegoatNominatedId = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const scapegoat = alivePlayers.find(p => {
    const rId = p.currentRoleId || p.roleId || getPlayerRole(p)?.id;
    return rId === 'nguoi-the-than' || rId === 'oan-nhan';
  });

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
            <SearchInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Tìm tên..."
              className="w-24 sm:hidden"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasLynchedToday && (
            <SearchInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Tìm tên hoặc số ghế..."
              className="w-36 hidden sm:flex"
            />
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
              const pRole = getPlayerRole(p);
              const origRole = getPlayerOriginalRole(p);

              const badges = (
                <div className="flex items-center gap-1 flex-wrap">
                  {nightState?.ravenTargetId === p.id && !nightState?.ravenSkipped && (
                    <span className="text-[10px] px-1 py-0.2 rounded font-black bg-purple-950 text-purple-300 border border-purple-600" title="Quạ phạt (+2)">
                      🪶 +2
                    </span>
                  )}
                  {p.id === scapegoatNominatedId && (
                    <Scale className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0 animate-pulse" title="Lên giàn (Oan Nhân)" />
                  )}
                  {scapegoatBannedVoterIds?.includes(p.id) && (
                    <Scale className="w-3 h-3 text-amber-400 shrink-0" title="Cấm biểu quyết" />
                  )}
                  {nightState?.silencedPlayerId === p.id && !nightState?.moonPriestessSkipped && (
                    <span className="text-[10px] select-none" title="Câm lặng">🔇</span>
                  )}
                  {(p.isAsleepByApothecary || (nightState?.apothecarySleepTargetId === p.id && !nightState?.apothecarySkipped)) && (
                    <span className="text-[10px] select-none" title="Mê man (Cấm vote)">💤</span>
                  )}
                </div>
              );

              const subtext = (
                <div className="flex items-center justify-between gap-1 w-full text-caption">
                  <span className="truncate text-slate-300">
                    {p.isCursedWolf && origRole ? (
                      <span className="text-rose-300 font-bold">{pRole?.name}</span>
                    ) : (
                      pRole?.name || 'Chưa lộ vai'
                    )}
                  </span>
                  {isSelected && (
                    <span className="text-caption font-bold text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-600 shrink-0">
                      Treo Cổ 🔥
                    </span>
                  )}
                </div>
              );

              return (
                <PlayerSeatCard
                  key={p.id}
                  player={p}
                  role={pRole}
                  mode="vote"
                  selected={isSelected}
                  variant="wolf"
                  showRole={true}
                  badges={badges}
                  subtext={subtext}
                  onClick={() => setSelectedLynchId(p.id)}
                />
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
                    title: 'HÒA PHIẾU: OAN NHÂN CHẾT THAY',
                    message: `Biểu quyết hòa phiếu: Oan Nhân (${scapegoat.name} #${scapegoat.id}) bị đưa lên giàn treo thay thế.\n\nTiến hành xử tử?`,
                    variant: 'blood',
                    confirmText: 'Xử Tử Oan Nhân ⚖️',
                    onConfirm: () => {
                      onLynchPlayer(scapegoat.id);
                    }
                  });
                }}
              >
                Oan Nhân Chết Thay ⚖️
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
