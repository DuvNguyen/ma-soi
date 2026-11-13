import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import { getPlayerRole } from '../../utils/roleUtils';

export default function DayKnightDuel({
  players,
  alivePlayers,
  hasLynchedToday,
  onKnightDuel,
  showConfirm,
  showAlert
}) {
  const [selectedKnightTargetId, setSelectedKnightTargetId] = useState(null);

  const knight = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'ki-si' || getPlayerRole(p)?.id === 'ki-si'));
  if (!knight || knight.hasUsedKnightDuel || hasLynchedToday) return null;

  const validTargets = alivePlayers.filter(p => p.id !== knight.id);

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
      message: `Kị Sĩ ${knight.name} (#${knight.id}) sẽ lật bài thách đấu ${target.name} (#${target.id})!\n\n• Nếu là MA SÓI: Sói chết ngay lập tức, ngày kết thúc không cần vote tiếp.\n• Nếu là DÂN LÀNG: Kị Sĩ tự sát tại chỗ vì thách đấu sai!\n\nBạn có chắc muốn tiến hành?`,
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
    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0d1629] to-blue-950/80 border border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)] space-y-3">
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

      <p className="text-xs text-blue-200/80">
        Chọn 1 người chơi để Kị Sĩ lật bài chỉ mặt điểm tên trước giờ biểu quyết:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {validTargets.map(p => {
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
