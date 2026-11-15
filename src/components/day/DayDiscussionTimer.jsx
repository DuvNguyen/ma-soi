import React from 'react';
import { Clock, Play, Pause, Bell, Volume2 } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import triggerHaptic from '../../utils/haptics';
import { isWolfPlayer, getPlayerRole } from '../../utils/roleUtils';

export default function DayDiscussionTimer({
  timeLeft,
  setTimeLeft,
  isTimerRunning,
  setIsTimerRunning,
  formatTime,
  alivePlayers,
  players,
  nightState = {}
}) {
  const silencedPlayer = nightState?.silencedPlayerId && !nightState?.moonPriestessSkipped
    ? players.find(p => p.id === nightState.silencedPlayerId)
    : null;

  // Bear Tamer logic
  const bearTamer = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'nguoi-thuan-phuc-gau' || getPlayerRole(p)?.id === 'nguoi-thuan-phuc-gau' || (p.currentRoleId || p.roleId) === 'than-gau'));
  let bearData = null;

  // Transformed Wild Child (Con Hoang hóa Sói do Mẹ chết)
  const transformedWildChildren = players.filter(p => p.isAlive && p.isCursedWolf && p.originalRoleId === 'dua-tre-hoang-da');

  // Living Devoted Servant (Người Đầy Tớ Tận Tụy)
  const livingServants = players.filter(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'nguoi-day-to-tan-tuy' || getPlayerRole(p)?.id === 'nguoi-day-to-tan-tuy'));

  if (bearTamer && alivePlayers.length > 2) {
    const sortedAlive = [...alivePlayers].sort((a, b) => a.id - b.id);
    const idx = sortedAlive.findIndex(p => p.id === bearTamer.id);
    if (idx !== -1) {
      const leftNeighbor = sortedAlive[(idx - 1 + sortedAlive.length) % sortedAlive.length];
      const rightNeighbor = sortedAlive[(idx + 1) % sortedAlive.length];
      const isSelfWolf = isWolfPlayer(bearTamer);
      const bearHasWolf = isSelfWolf || isWolfPlayer(leftNeighbor) || isWolfPlayer(rightNeighbor);
      bearData = { bearTamer, leftNeighbor, rightNeighbor, bearHasWolf, isSelfWolf };
    }
  }

  return (
    <div className="space-y-4">
      {/* Silenced Player Warning Banner (Nguyệt Nữ) */}
      {silencedPlayer && silencedPlayer.isAlive && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#1c1228] to-purple-950/80 border border-purple-600/80 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900 border border-purple-500 flex items-center justify-center text-purple-300 text-lg shrink-0">
              🔇
            </div>
            <div>
              <h4 className="font-bold text-purple-100 text-sm font-cinzel">
                Bị Câm Lặng: #{silencedPlayer.id} {silencedPlayer.name}
              </h4>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Bị Nguyệt Nữ khóa miệng trong đêm. Người chơi này bị cấm phát biểu trong suốt ngày hôm nay!
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700 shrink-0">
            Nguyệt Nữ
          </span>
        </div>
      )}

      {/* Transformed Wild Child (Con Hoang hóa Sói) Notification Banner */}
      {transformedWildChildren.map(wc => {
        const idol = players.find(p => p.id === wc.idolId || p.id === nightState?.wildChildIdolId);
        return (
          <div key={wc.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#230914] to-rose-950/90 border border-rose-600/80 text-rose-200 shadow-[0_0_20px_rgba(225,29,72,0.35)] flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900 border border-rose-500 flex items-center justify-center text-rose-300 text-lg shrink-0">
                🐺
              </div>
              <div>
                <h4 className="font-bold text-rose-100 text-sm font-cinzel flex items-center gap-2">
                  <span>Con Hoang Hóa Sói: #{wc.id} {wc.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-bold">
                    Phe Sói 🐺
                  </span>
                </h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  {idol ? `Mẹ / Thần tượng (${idol.name} #${idol.id}) đã qua đời ➔ Con Hoang đã thức tỉnh bản năng Ma Sói.` : 'Thần tượng đã qua đời ➔ Con Hoang đã thức tỉnh bản năng Ma Sói.'}
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-amber-300 bg-black/40 border border-amber-600/50 px-2.5 py-1 rounded-xl shrink-0 hidden sm:block">
              Quản trò bí mật chạm vai
            </div>
          </div>
        );
      })}

      {/* Devoted Servant Banner (Người Đầy Tớ Tận Tụy) */}
      {livingServants.map(servant => (
        <div key={servant.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-[#041d2d]/90 via-[#08283d] to-[#041d2d]/90 border border-cyan-500/80 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-300 text-lg shrink-0">
              🗝️
            </div>
            <div>
              <h4 className="font-bold text-cyan-100 text-sm font-cinzel flex items-center gap-2">
                <span>Người Đầy Tớ Tận Tụy: #{servant.id} {servant.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  Sẵn Sàng Kế Thừa 🗝️
                </span>
              </h4>
              <p className="text-xs text-cyan-300/80 mt-0.5">
                Khi có người chơi bị treo cổ hôm nay, Người Đầy Tớ có quyền lật bài để kế thừa lá bài vai trò của người vừa chết.
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Discussion Timer Card */}
      <div className="p-4 rounded-2xl bg-[#10121d]/60 backdrop-blur-md border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Thời Gian Thảo Luận
            </div>
            <div className="text-3xl font-black font-cinzel text-amber-300">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GothicButton
            variant={isTimerRunning ? 'gold' : 'witch'}
            size="sm"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            icon={isTimerRunning ? Pause : Play}
          >
            {isTimerRunning ? 'Tạm Dừng' : 'Bắt Đầu Đếm'}
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(60);
            }}
          >
            1 Phút
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(180);
            }}
          >
            3 Phút
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(300);
            }}
          >
            5 Phút
          </GothicButton>
        </div>
      </div>

      {/* Timer Expired Alarm Banner */}
      {timeLeft === 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#33080e] to-rose-950/90 border border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(225,29,72,0.4)] flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-rose-100 text-sm font-cinzel">Hết giờ thảo luận</h4>
              <p className="text-xs text-rose-300/80">Chuyển sang giai đoạn biểu quyết giơ tay</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerHaptic('timer-end')}
            className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 border border-rose-500 text-xs font-bold text-rose-100 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Báo Lại 🔔
          </button>
        </div>
      )}

      {/* BEAR TAMER: NGƯỜI THUẦN PHỤC GẤU */}
      {bearData && (
        <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
          bearData.bearHasWolf
            ? 'bg-gradient-to-r from-amber-950/80 via-[#261508] to-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/40'
            : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🐻</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                  Kỹ Năng Ban Ngày: Người Thuần Phục Gấu
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold">
                  Ghế #{bearData.bearTamer.id} ({bearData.bearTamer.name})
                </span>
              </div>
              {bearData.bearHasWolf ? (
                <div className="mt-1">
                  <h4 className="font-cinzel font-black text-amber-200 text-sm sm:text-base">
                    {bearData.isSelfWolf ? 'Gấu gầm: Người Thuần Hóa bị nhiễm Sói' : 'Gấu gầm: Có Ma Sói ngồi kề bên'}
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    {bearData.isSelfWolf
                      ? `Bản thân Người Thuần Phục Gấu (#${bearData.bearTamer.id} ${bearData.bearTamer.name}) đã bị nhiễm nanh Sói nên Gấu luôn gầm gừ!`
                      : `Phát hiện Ma Sói kề cận (#${bearData.leftNeighbor.id} ${bearData.leftNeighbor.name} hoặc #${bearData.rightNeighbor.id} ${bearData.rightNeighbor.name}).`}
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  <h4 className="font-cinzel font-bold text-slate-200 text-sm">
                    Gấu nằm im ngoan ngoãn
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hai người chơi ngồi cạnh (#{bearData.leftNeighbor.id} và #{bearData.rightNeighbor.id}) không phải Ma Sói.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
