import React from 'react';
import { Flame, Check, RotateCcw, Sparkles, Gavel, UserX, Star } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import GothicBadge from '../ui/GothicBadge';
import WolfIcon from '../ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../../utils/roleUtils';

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
  showConfirm
}) {
  const scapegoat = alivePlayers.find(p => (p.currentRoleId || p.roleId) === 'nguoi-the-than' || getPlayerRole(p)?.id === 'nguoi-the-than');

  return (
    <div className="p-5 rounded-2xl bg-[#0f111c]/60 backdrop-blur-md border border-purple-900/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-cinzel">
            <Flame className="w-5 h-5 text-orange-400" />
            BIỂU QUYẾT TREO CỔ
          </h3>
        </div>

        {hasLynchedToday && (
          <GothicBadge variant="wolf">
            <Check className="w-3.5 h-3.5" />
            Đã xong biểu quyết sáng nay
          </GothicBadge>
        )}
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
              <GothicButton
                variant="witch"
                size="sm"
                icon={Gavel}
                onClick={() => setExtraLynchAllowed(true)}
              >
                Thẩm Phán (Vote Thêm)
              </GothicButton>
            )}
          </div>
        </div>
      ) : (
        /* VOTING GRID - ALLOW SELECTING ONLY 1 PERSON - WITH WEREWOLF RED BORDERS */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {alivePlayers.map(p => {
              const isSelected = selectedLynchId === p.id;
              const isWolf = isWolfPlayer(p);
              const pRole = getPlayerRole(p);
              const origRole = getPlayerOriginalRole(p);

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedLynchId(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-950 via-[#3a080c] to-rose-950 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] ring-1 ring-rose-400'
                      : isWolf
                      ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                      : 'bg-[#121422] hover:bg-[#181a2e] border-slate-800 hover:border-purple-600/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-400'
                        : isWolf
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {p.id}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <span className={isWolf ? 'text-rose-200 font-black' : isSelected ? 'text-white' : 'text-slate-100'}>
                          {p.name}
                        </span>
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

          {/* TIE VOTE ACTION FOR SCAPEGOAT (NGƯỜI THẾ THÂN CHẾT THAY KHI HÒA PHIẾU) */}
          {scapegoat && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                ⚖️ Trong bàn có <strong className="text-amber-300">Người Thế Thân</strong>: Nếu biểu quyết giơ tay hòa phiếu, Người Thế Thân sẽ chết thay.
              </div>
              <GothicButton
                variant="witch"
                size="sm"
                onClick={() => {
                  showConfirm({
                    title: '⚖️ BỎ PHIẾU HÒA (NGƯỜI THẾ THÂN CHẾT THAY)?',
                    message: `Khi số phiếu biểu quyết cao nhất bị hòa nhau:\n\nNgười Thế Thân (${scapegoat.name} #${scapegoat.id}) bị đưa lên giàn treo cổ chết thay ngay lập tức!\n\nBạn có muốn thực hiện án phạt này?`,
                    variant: 'blood',
                    confirmText: 'Xử Tử Người Thế Thân ⚖️',
                    onConfirm: () => {
                      onLynchPlayer(scapegoat.id);
                    }
                  });
                }}
              >
                Hòa Phiếu: Người Thế Thân Chết Thay ⚖️
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
