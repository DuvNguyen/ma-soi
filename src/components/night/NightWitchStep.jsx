import React from 'react';
import { Sparkles, Skull } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import WolfIcon from '../ui/WolfIcon';
import { getPlayerRole, isWolfPlayer } from '../../utils/roleUtils';

export default function NightWitchStep({
  players,
  alivePlayers,
  nightState,
  wolfVictim,
  onSaveAction,
  showConfirm
}) {
  const handleSelectPoisonTarget = (targetPlayer) => {
    // Nếu bấm lại vào chính người đang bị chọn độc -> Hủy độc ngay không cần confirm
    if (nightState.witchPoisonTargetId === targetPlayer.id) {
      onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null });
      return;
    }

    // Modal xác nhận bảo vệ người dùng không bị lỡ tay
    showConfirm({
      title: 'XÁC NHẬN DÙNG BÌNH ĐỘC?',
      message: `Bạn có chắc chắn muốn Phù Thủy sử dụng BÌNH ĐỘC để tiêu diệt ${targetPlayer.name} (#${targetPlayer.id}) đêm nay không?\n\n⚠️ Chú ý: Phù Thủy chỉ có DUY NHẤT 1 bình độc trong cả ván đấu. Khi đã dùng thì các đêm sau sẽ không thể đầu độc thêm ai nữa!`,
      variant: 'blood',
      confirmText: `Đầu Độc ${targetPlayer.name} ☠️`,
      cancelText: 'Hủy Bỏ',
      onConfirm: () => {
        onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: targetPlayer.id });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h4 className="font-bold text-sm text-purple-200 font-cinzel">
          Thuốc Phù Thủy
        </h4>
      </div>

      {/* Victim Status */}
      <div className="p-4 rounded-2xl bg-[#0c0d18]/60 backdrop-blur-sm border border-purple-950 flex items-center justify-between shadow-inner">
        <div>
          <span className="text-xs text-slate-400 block">Nạn nhân vừa bị Sói cắn đêm nay:</span>
          {wolfVictim ? (
            <span className="text-base font-bold text-rose-400">
              {wolfVictim.name} ({getPlayerRole(wolfVictim)?.name || 'Chưa lộ vai'})
            </span>
          ) : (
            <span className="text-sm font-bold text-emerald-400">
              Không ai bị cắn
            </span>
          )}
        </div>

        {wolfVictim && nightState.witchHasHeal && (
          <GothicButton
            variant={nightState.witchSaved ? 'blood' : 'witch'}
            size="sm"
            onClick={() => onSaveAction('witch', { saved: !nightState.witchSaved, poisonTargetId: nightState.witchPoisonTargetId })}
          >
            {nightState.witchSaved ? '✓ Đang Dùng Bình Cứu' : 'Cứu Sống Người Này'}
          </GothicButton>
        )}
      </div>

      {/* Poison Action */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Dùng Bình Độc (Giết 1 Người):
          </span>
          {nightState.witchPoisonTargetId && (
            <span className="text-[11px] text-rose-400 font-bold animate-pulse">
              ⚠️ Đã chọn 1 mục tiêu độc
            </span>
          )}
        </div>

        {nightState.witchHasPoison ? (
          <div className="space-y-2.5">
            {/* Active Poison Indicator Banner with Undo */}
            {nightState.witchPoisonTargetId && (() => {
              const poisonedP = players.find(p => p.id === nightState.witchPoisonTargetId);
              return (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-100 text-xs flex items-center justify-between shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                  <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                    <span>
                      Phù Thủy quyết định đầu độc: <strong className="text-white font-bold">{poisonedP?.name} (#{poisonedP?.id})</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null })}
                    className="px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-bold text-[11px] border border-rose-400 transition-colors cursor-pointer shrink-0"
                  >
                    ↩ Hủy Dùng Độc
                  </button>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null })}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                  nightState.witchPoisonTargetId === null
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                    : 'bg-[#10121d] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚫 Không Dùng Bình Độc
              </button>

              {alivePlayers.map(p => {
                const isWolf = isWolfPlayer(p);
                const isPoisoned = nightState.witchPoisonTargetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPoisonTarget(p)}
                    className={`p-2.5 rounded-xl border text-xs text-left truncate transition-all flex items-center justify-between cursor-pointer ${
                      isPoisoned
                        ? 'bg-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                        : isWolf
                        ? 'bg-gradient-to-r from-[#200508] to-[#120204] border-rose-600/90 hover:border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50 text-slate-200'
                        : 'bg-[#10121d] hover:bg-[#1a172c] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1">
                      {p.name} <span className="text-slate-500">({getPlayerRole(p)?.name || '❓ Chưa lộ vai'})</span>
                      {isWolf && <WolfIcon className="w-2.5 h-2.5 inline text-rose-400" />}
                    </span>
                    {isPoisoned && <span className="font-bold text-rose-400 ml-1 shrink-0">☠️ Độc</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Phù thủy đã dùng hết bình độc.</p>
        )}
      </div>
    </div>
  );
}
