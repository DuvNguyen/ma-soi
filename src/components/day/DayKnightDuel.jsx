import React, { useState } from 'react';
import { Swords, Search, UserCheck, AlertTriangle } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import { getRole, getPlayerRole, matchesSearch, removeVietnameseTones } from '../../utils/roleUtils';

export default function DayKnightDuel({
  players,
  alivePlayers,
  hasLynchedToday,
  onKnightDuel,
  showConfirm,
  showAlert,
  rolesInGame = [],
  deckRoleIds = [],
  onAssignRole
}) {
  const [selectedKnightTargetId, setSelectedKnightTargetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Kiểm tra Kị Sĩ có hiện diện trong ván chơi không
  const hasKnightInGame = rolesInGame?.some(r => r.id === 'ki-si') ||
    deckRoleIds?.includes('ki-si') ||
    players.some(p => (p.currentRoleId || p.roleId) === 'ki-si' || getPlayerRole(p)?.id === 'ki-si');

  if (!hasKnightInGame) return null;

  const knight = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'ki-si' || getPlayerRole(p)?.id === 'ki-si'));

  // Nếu Kị Sĩ đã lật bài thách đấu rồi trong ván này
  if (knight && knight.hasUsedKnightDuel) {
    return (
      <div id="day-knight-duel-section" className="p-3.5 rounded-2xl bg-[#090d18] border border-blue-900/40 text-slate-400 text-xs flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400/60 shrink-0">
          <Swords className="w-4 h-4" />
        </div>
        <span>Kị Sĩ (#{knight.id} {knight.name}) đã kích hoạt quyền lật bài quyết đấu trong ván này.</span>
      </div>
    );
  }

  // TRƯỜNG HỢP 1: Chưa gán Kị Sĩ cho người chơi nào -> Hỗ trợ lộ diện Kị Sĩ tại chỗ
  if (!knight) {
    return (
      <div id="day-knight-duel-section" className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0d1629] to-blue-950/80 border border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)] space-y-3">
        <div className="flex items-center gap-3 border-b border-blue-900/60 pb-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 border border-blue-500 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)] shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-300">
                Kỹ Năng Kị Sĩ Ban Ngày
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-600 text-amber-300 font-bold">
                Chờ Lộ Diện
              </span>
            </div>
            <h4 className="font-cinzel font-black text-white text-sm sm:text-base">
              KỊ SĨ LẬT BÀI THÁCH ĐẤU
            </h4>
          </div>
        </div>

        <p className="text-xs text-blue-200/80">
          Chưa chỉ định người giữ vai Kị Sĩ. Chọn người chơi công khai lật thẻ Kị Sĩ để quyết đấu:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {alivePlayers.map(p => {
            const pRole = getPlayerRole(p);
            const hasOtherRole = Boolean(pRole && pRole.id !== 'ki-si');
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (typeof onAssignRole === 'function') {
                    const knightRoleObj = getRole('ki-si');
                    onAssignRole(p.id, knightRoleObj);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between active:scale-95 ${
                  hasOtherRole
                    ? 'bg-[#0a0d18] border-slate-800 text-slate-400 hover:border-blue-500/60'
                    : 'bg-[#101424] hover:bg-blue-950/70 border-blue-800/60 hover:border-blue-400 text-blue-100 shadow-sm'
                }`}
              >
                <div className="truncate">
                  <div className="font-bold text-xs truncate">#{p.id} {p.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {pRole ? pRole.name : 'Chưa có vai'}
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: Đã có Kị Sĩ còn sống và chưa quyết đấu
  const validTargets = alivePlayers.filter(p => p.id !== knight.id);
  const filteredTargets = validTargets.filter(p => {
    if (!searchQuery) return true;
    const q = removeVietnameseTones(searchQuery);
    return matchesSearch(p.name, q) || String(p.id).includes(q);
  });

  const handleConfirmKnightDuel = () => {
    if (!selectedKnightTargetId) {
      showAlert({
        title: 'CHƯA CHỌN MỤC TIÊU!',
        message: 'Vui lòng chọn 1 người chơi để Kị Sĩ thách đấu.',
        variant: 'warning'
      });
      return;
    }
    const target = players.find(p => p.id === selectedKnightTargetId);
    showConfirm({
      title: '⚔️ KỊ SĨ QUYẾT ĐẤU?',
      message: `Kị Sĩ ${knight.name} (#${knight.id}) sẽ lật bài thách đấu ${target.name} (#${target.id})!\n\n• Nếu là MA SÓI: Sói chết ngay lập tức tại chỗ.\n• Nếu là DÂN LÀNG: Kị Sĩ tự sát tại chỗ vì thách đấu sai!\n\nBạn có chắc muốn tiến hành?`,
      variant: 'blood',
      confirmText: 'Lật Bài Quyết Đấu ⚔️',
      onConfirm: () => {
        if (onKnightDuel) {
          onKnightDuel(knight.id, selectedKnightTargetId);
          setSelectedKnightTargetId(null);
        }
      }
    });
  };

  return (
    <div id="day-knight-duel-section" className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0d1629] to-blue-950/80 border border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 border border-blue-500 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)] shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-300">
                Kỹ Năng Đặc Biệt Ban Ngày
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900 border border-blue-600 text-blue-200 font-bold">
                1 lần duy nhất
              </span>
              {hasLynchedToday && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Đã vote treo cổ
                </span>
              )}
            </div>
            <h4 className="font-cinzel font-black text-white text-sm sm:text-base">
              KỊ SĨ LẬT BÀI THÁCH ĐẤU: {knight.name} (#{knight.id})
            </h4>
          </div>
        </div>
        <GothicButton
          variant="blood"
          size="sm"
          disabled={!selectedKnightTargetId}
          onClick={handleConfirmKnightDuel}
          icon={Swords}
        >
          Quyết Đấu Ngay ⚔️
        </GothicButton>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-blue-200/80">
          Chọn 1 người chơi để Kị Sĩ lật bài chỉ mặt điểm tên:
        </p>

        {/* Compact search bar */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm tên / #ghế..."
            className="w-24 sm:w-32 text-xs py-0.5 pl-7 pr-2 rounded-lg bg-black/60 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1">
        {filteredTargets.map(p => {
          const isSelected = selectedKnightTargetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedKnightTargetId(p.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-900/90 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-blue-400'
                  : 'bg-[#101424] hover:bg-[#181e35] border-slate-800 text-slate-300'
              }`}
            >
              <div className="truncate">
                <div className="font-bold text-xs truncate">#{p.id} {p.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {getPlayerRole(p)?.name || 'Chưa lộ'}
                </div>
              </div>
              {isSelected && <span className="text-xs text-blue-300 font-bold">⚔️</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
