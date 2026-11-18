import React, { useState } from 'react';
import { Heart, Skull, Shield, Eye, UserCheck, AlertCircle, Sparkles, Star, Edit3, Users, Scale, History } from 'lucide-react';
import GothicBadge from './ui/GothicBadge';
import PlayerSeatCard from './ui/PlayerSeatCard';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole, isHostileThirdParty } from '../utils/roleUtils';
import PlayerJourneyModal from './PlayerJourneyModal';

export default function PlayersGridView({ players, onOpenAssignRole, onOpenRosters, scapegoatBannedVoterIds = [], scapegoatNominatedId = null, nightState = {} }) {
  const [journeyPlayer, setJourneyPlayer] = useState(null);
  const aliveCount = players.filter(p => p.isAlive).length;
  const wolfCount = players.filter(p => p.isAlive && isWolfPlayer(p)).length;
  const villagerCount = players.filter(p => p.isAlive && !isWolfPlayer(p) && !isHostileThirdParty(p)).length;
  const thirdPartyCount = players.filter(p => p.isAlive && isHostileThirdParty(p)).length;
  const transformedPlayers = players.filter(p => p.roleHistory && p.roleHistory.length > 0);
  const transformedCount = transformedPlayers.length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Overview Stat Badges - Compact Gothic Style */}
      <div className={`grid gap-2 sm:gap-3 ${thirdPartyCount > 0 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
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

        {thirdPartyCount > 0 && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#1b0a2a] border border-purple-600/90 shadow-[0_0_12px_rgba(168,85,247,0.3)] flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 text-base sm:text-lg shrink-0 select-none">
              ⚔️
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300">Phe Thứ 3</div>
              <div className="text-xs sm:text-sm font-black text-purple-200 truncate">{thirdPartyCount} người sống</div>
            </div>
          </div>
        )}

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

          <div className="flex items-center gap-2">
            {transformedCount > 0 && (
              <button
                type="button"
                onClick={() => setJourneyPlayer(transformedPlayers[0])}
                className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-600/80 hover:border-amber-400 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Xem sơ đồ chuỗi biến đổi của các nhân vật"
              >
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span>Chuỗi Biến Đổi ({transformedCount})</span>
              </button>
            )}
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
        </div>

        {/* Theatre Matrix Seats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 max-h-[62vh] overflow-y-auto custom-scrollbar pr-1">
          {players.map(p => {
            const partner = p.loverId ? players.find(x => x.id === p.loverId) : null;
            const isWolf = isWolfPlayer(p);
            const pRole = getPlayerRole(p);
            const origRole = getPlayerOriginalRole(p);
            const hasRole = Boolean(pRole || p.currentRoleId || p.roleId);
            const isSilenced = nightState?.silencedPlayerId === p.id && !nightState?.moonPriestessSkipped;
            const isServant = p.isAlive && ((p.currentRoleId || p.roleId) === 'nguoi-day-to-tan-tuy' || pRole?.id === 'nguoi-day-to-tan-tuy');

            const badges = (
              <div className="flex items-center gap-1">
                {p.poisonedByRustySword && <span className="text-[10px] select-none" title="Nhiễm gỉ sét từ Hiệp Sĩ Kiếm Gỉ">🗡️</span>}
                {isSilenced && <span className="text-[10px] select-none" title="Bị Nguyệt Nữ cấm lặng hôm nay">🔇</span>}
                {p.id === scapegoatNominatedId && (
                  <Scale className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0 animate-pulse" title="Bị Oan Nhân chỉ định lên giàn nghi vấn" />
                )}
                {scapegoatBannedVoterIds?.includes(p.id) && (
                  <Scale className="w-3 h-3 text-amber-400 shrink-0" title="Bị cấm biểu quyết (Di ngôn Oan Nhân)" />
                )}
                {p.roleHistory && p.roleHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setJourneyPlayer(p);
                    }}
                    className="hit-44 px-1 py-0.2 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/80 text-purple-200 text-caption flex items-center gap-0.5 cursor-pointer shadow-sm ml-0.5"
                    title="Xem nhật ký các lần biến đổi vai trò của người chơi này"
                  >
                    <History className="w-2.5 h-2.5 text-purple-300" />
                    <span>{p.roleHistory.length}</span>
                  </button>
                )}
              </div>
            );

            const renderSubtext = () => {
              if (!p.isAlive) {
                return <span className="text-rose-400/90 font-medium">Tử trận</span>;
              }
              if (!hasRole) {
                return <span className="text-slate-500 italic">Chưa gán</span>;
              }
              if (p.isCursedWolf && origRole) {
                return (
                  <div className="space-y-0.5">
                    <span className="text-caption font-bold px-1 py-0.5 rounded flex items-center justify-center gap-1 truncate bg-rose-950 text-rose-200 border border-rose-600 shadow-sm" title={pRole?.name}>
                      <WolfIcon className="w-2.5 h-2.5 shrink-0" /> {pRole?.name}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium block truncate" title={`Vai ban đầu: ${origRole.name}`}>
                      🔮 Trúng nguyền
                    </span>
                  </div>
                );
              }
              return (
                <div className="space-y-0.5">
                  <span className={`text-caption font-bold px-1.5 py-0.2 rounded block truncate ${
                    isWolf
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : isServant
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {pRole?.name || 'Đã gán vai'}
                  </span>
                  {isServant && (
                    <span className="text-[10px] text-cyan-300 font-semibold block truncate" title="Người Hầu: Chờ đổi thẻ sau khi có người bị treo cổ">
                      🗝️ Chờ kế thừa
                    </span>
                  )}
                  {p.isAlive && (p.currentRoleId === 'dua-tre-hoang-da' || p.roleId === 'dua-tre-hoang-da' || pRole?.id === 'dua-tre-hoang-da') && !p.isCursedWolf && (
                    p.idolId ? (
                      <span className="text-[10px] text-amber-300 font-medium block truncate bg-amber-950/50 border border-amber-800/60 rounded px-1 py-0.5 mt-0.5" title={`Mẹ (Thần tượng): Ghế #${p.idolId}`}>
                        ★ Mẹ: #{p.idolId}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold block truncate bg-amber-950/50 border border-amber-800/60 rounded px-1 py-0.5 mt-0.5" title="Chưa chọn Mẹ">
                        ★ Chưa gán Mẹ
                      </span>
                    )
                  )}
                  {p.isAlive && p.isCursedWolf && p.originalRoleId === 'dua-tre-hoang-da' && (
                    <span className="text-[10px] text-rose-300 font-bold block truncate" title={`Con Hoang đã hóa Sói (Mẹ #${p.idolId} đã chết)`}>
                      🐺 Con Hoang Hóa Sói
                    </span>
                  )}
                  {p.isAlive && (p.currentRoleId === 'anh-tu' || p.roleId === 'anh-tu' || pRole?.id === 'anh-tu') && (
                    p.shadowHostId ? (
                      <span className="text-[10px] text-purple-300 font-medium block truncate bg-purple-950/50 border border-purple-800/60 rounded px-1 py-0.5 mt-0.5" title={`Bản thể: Ghế #${p.shadowHostId}`}>
                        👻 Bản thể: #{p.shadowHostId}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-300 font-semibold block truncate bg-amber-950/50 border border-amber-800/60 rounded px-1 py-0.5 mt-0.5" title="Chưa liên kết bản thể">
                        👻 Chưa gán bản thể
                      </span>
                    )
                  )}
                </div>
              );
            };

            return (
              <PlayerSeatCard
                key={p.id}
                player={p}
                role={pRole}
                partner={partner}
                mode="view"
                showAvatar={hasRole && p.isAlive}
                badges={badges}
                subtext={renderSubtext()}
                onClick={() => onOpenAssignRole(p)}
              />
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
            <span className="w-3 h-3 rounded bg-[#081a2e] border border-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]"></span>
            <span>Người Hầu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-black/80 border border-slate-800"></span>
            <span>Ghế Đã Hy Sinh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500" />
            <span>Cặp Đôi Yêu Nhau</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🎵</span>
            <span>Bị Thôi Miên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🔇</span>
            <span>Bị Câm Lặng</span>
          </div>
        </div>
      </div>

      {/* Player Transformation Journey Modal */}
      <PlayerJourneyModal
        isOpen={Boolean(journeyPlayer)}
        onClose={() => setJourneyPlayer(null)}
        player={journeyPlayer}
        players={players}
      />
    </div>
  );
}