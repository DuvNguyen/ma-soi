import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Sparkles, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react';
import { ROLES } from '../data/roles';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';

export default function DeckInventoryRadar({
  players,
  deckRoleIds,
  onAutoAssignVillagers,
  onAssignRole
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!deckRoleIds || deckRoleIds.length === 0) return null;

  // Total players & assigned count
  const totalCount = players.length;
  const assignedPlayers = players.filter(p => (p.currentRoleId || p.roleId));
  const unassignedPlayers = players.filter(p => !(p.currentRoleId || p.roleId));
  const assignedCount = assignedPlayers.length;

  // Calculate remaining roles in deck
  // Map of roleId -> total count in deck
  const deckRoleCounts = {};
  deckRoleIds.forEach(id => {
    deckRoleCounts[id] = (deckRoleCounts[id] || 0) + 1;
  });

  // Count already assigned roles (including cards whose original holders were cursed into werewolves)
  const assignedRoleCounts = {};
  players.forEach(p => {
    // Lá bài vật lý trong bộ bài mà người này sở hữu (kể cả khi đã biến đổi sang Sói / vai khác)
    const deckCardId = p.originalRoleId || p.currentRoleId || p.roleId;
    if (deckCardId) {
      assignedRoleCounts[deckCardId] = (assignedRoleCounts[deckCardId] || 0) + 1;
    }
  });

  // Calculate remaining roles in deck
  const remainingRoles = [];
  Object.entries(deckRoleCounts).forEach(([roleId, total]) => {
    const assigned = assignedRoleCounts[roleId] || 0;
    const remaining = Math.max(0, total - assigned);
    if (remaining > 0) {
      const roleObj = ROLES.find(r => r.id === roleId) || { id: roleId, name: roleId, teamCode: 'V' };
      remainingRoles.push({
        ...roleObj,
        count: remaining
      });
    }
  });

  // Check if only villagers remain
  const onlyVillagersRemain = remainingRoles.length > 0 && remainingRoles.every(r => r.id === 'dan-lang');
  const allAssigned = remainingRoles.length === 0 || unassignedPlayers.length === 0;

  return (
    <div className="mb-2.5 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#12091d] via-[#101222] to-[#0d101d] border border-purple-900/60 p-2 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5">
        {/* Left: Summary status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-300 font-bold shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-black font-cinzel text-purple-200 uppercase tracking-wider">
                Kho Bài (Deck Radar):
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-purple-950/80 border border-purple-700 text-purple-300">
                Đã gán: {assignedCount}/{totalCount}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {allAssigned ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 inline" /> Toàn bộ đã được gán vai!
                </span>
              ) : (
                <span>
                  Còn <strong className="text-amber-300">{unassignedPlayers.length} người</strong> chưa lộ diện vai
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {onlyVillagersRemain && unassignedPlayers.length > 0 && (
            <GothicButton
              variant="witch"
              size="sm"
              onClick={onAutoAssignVillagers}
              className="text-[11px] sm:text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 shadow-lg animate-pulse"
              title="Gán toàn bộ người còn lại làm Dân Làng"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 inline" />
              <span>Gán Dân Làng ({unassignedPlayers.length})</span>
            </GothicButton>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] sm:text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-[#141628] hover:bg-[#1e2038] text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Thu Gọn' : 'Xem Thẻ Còn Lại'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Remaining Roles Pill List */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-purple-950/50 space-y-2 animate-fade-in">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Các lá bài chưa lộ diện trong Deck:
          </div>

          {remainingRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {remainingRoles.map(r => {
                const isWolf = r.teamCode === 'W' || ['soi-thuong', 'soi-con', 'soi-lon-xau-xa'].includes(r.id);
                return (
                  <span
                    key={r.id}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      isWolf
                        ? 'bg-rose-950/80 text-rose-200 border-rose-700/80 shadow-[0_0_8px_rgba(225,29,72,0.3)]'
                        : 'bg-purple-950/70 text-purple-200 border-purple-700/70'
                    }`}
                  >
                    <span className="flex items-center gap-1">{isWolf ? <WolfIcon className="w-3.5 h-3.5 shrink-0" /> : '✨'} {r.name}</span>
                    <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full border border-white/10 text-white font-mono">
                      x{r.count}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-semibold italic">
              Không còn lá bài nào chưa gán! Toàn bộ bài trong deck đã được phân phối xong.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
