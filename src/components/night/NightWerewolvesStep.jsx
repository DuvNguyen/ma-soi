import React from 'react';
import { Skull } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import WolfIcon from '../ui/WolfIcon';
import WolfWhisperBox from '../WolfWhisperBox';
import { getPlayerOriginalRole } from '../../utils/roleUtils';

export default function NightWerewolvesStep({
  players,
  alivePlayers,
  nightState,
  wolfCanKillDouble,
  canWolvesKillTeammates,
  canCursedWolfInfect,
  wolfVictim,
  showWolfWhisper,
  setShowWolfWhisper,
  wolfLogs,
  setWolfLogs,
  onSaveAction,
  isWolfPlayer
}) {
  const target1 = players.find(p => p.id === nightState.wolfTargetId);
  const target2 = players.find(p => p.id === nightState.wolfTargetId2);
  const hasTarget = (target1 || target2) && !nightState.wolfSkipped;
  const selectedWolfTargets = [nightState.wolfTargetId, nightState.wolfTargetId2].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Collapsible Secret Hand-off Accordion Toggle (Clean & unobtrusive) */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-rose-950/60 via-[#180306] to-[#100103] border border-rose-900/60 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">🤫</span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-rose-200 truncate">
              Chuyền máy bí mật cho bầy Sói
            </div>
            <div className="text-[10px] text-rose-400/80 truncate">
              {showWolfWhisper ? 'Chế độ chuyền máy đang mở' : 'Chế độ chuyền máy bí mật'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWolfWhisper(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/80 transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
        >
          <span>Mở Chuyền Máy 📱</span>
        </button>
      </div>

      {/* Secret Wolf Hand-off Box - Full-screen modal to isolate secrets */}
      {showWolfWhisper && (
        <WolfWhisperBox
          players={players}
          nightState={nightState}
          canWolvesKillTeammates={canWolvesKillTeammates}
          wolfLogs={wolfLogs}
          setWolfLogs={setWolfLogs}
          onClose={() => setShowWolfWhisper(false)}
        />
      )}

      {/* Wolf Discussion Results Summary for Game Master */}
      {wolfLogs.length > 0 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#180306] to-[#0d0103] border border-rose-900/80 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-rose-400">
              <span>🐺 Thảo luận từ bầy Sói ({wolfLogs.length}):</span>
            </span>
            <button
              type="button"
              onClick={() => setWolfLogs([])}
              className="text-[10px] text-rose-500 hover:text-rose-300 underline cursor-pointer"
            >
              Xóa lịch sử
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {wolfLogs.map(log => (
              <div key={log.id} className="text-xs bg-[#240509]/80 border border-rose-950 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-rose-200 shrink-0">{log.wolfName}:</span>
                  {log.text && <span className="text-rose-100 truncate">{log.text}</span>}
                </div>
                {log.targetName && (
                  <span className="text-[11px] font-bold text-rose-200 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 shrink-0">
                    🎯 Đề xuất: {log.targetName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.7)]" />
          <h4 className="font-bold text-sm text-rose-300 font-cinzel">
            Mục tiêu bầy Sói cắn
          </h4>
        </div>

        {/* Summary Box of Wolf Hunt - Red Rose Theme */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#26050a] to-[#140205] border border-rose-600/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Con mồi đêm nay ({hasTarget ? `${selectedWolfTargets.length}/${wolfCanKillDouble ? 2 : 1}` : nightState.wolfSkipped ? 'Không cắn' : `0/${wolfCanKillDouble ? 2 : 1}`}):
            </span>
            {hasTarget ? (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                🩸 Đã chọn mục tiêu cắn
              </span>
            ) : nightState.wolfSkipped ? (
              <span className="text-xs font-bold text-amber-300">
                🚫 Bầy Sói không cắn ai
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Chưa chọn
              </span>
            )}
          </div>

          <div className={`grid gap-2 ${wolfCanKillDouble ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="p-2.5 rounded-xl bg-black/50 border border-rose-700/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-rose-400">
                  {wolfCanKillDouble ? 'Mục tiêu 1' : 'Con mồi bị cắn'}
                </div>
                <div className="font-bold text-sm text-white">
                  {target1 && !nightState.wolfSkipped ? `${target1.name} (#${target1.id})` : nightState.wolfSkipped ? 'Bầy Sói không cắn ai' : 'Chưa chọn'}
                </div>
              </div>
              {target1 && !nightState.wolfSkipped && <Skull className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />}
            </div>

            {wolfCanKillDouble && (
              <div className="p-2.5 rounded-xl bg-black/50 border border-rose-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-400">Mục tiêu 2 (Cuồng nộ)</div>
                  <div className="font-bold text-sm text-white">
                    {target2 && !nightState.wolfSkipped ? `${target2.name} (#${target2.id})` : 'Chưa chọn'}
                  </div>
                </div>
                {target2 && !nightState.wolfSkipped && <Skull className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />}
              </div>
            )}
          </div>

          {/* BÁN SÓI BỊ CẮN BANNER */}
          {target1 && (target1.currentRoleId === 'nua-nguoi-nua-soi' || target1.roleId === 'nua-nguoi-nua-soi') && !nightState.wolfSkipped && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/80 text-xs text-purple-200 flex items-center gap-2 animate-fade-in shadow-md">
              <span className="text-base shrink-0">🐺⚡</span>
              <span><strong>Bán Sói (Nửa Người Nửa Sói)</strong> bị cắn: Sẽ không chết sáng mai mà lập tức thức tỉnh gen Sói, trở thành Ma Sói! (Tiên Tri soi đêm nay sẽ ra Sói).</span>
            </div>
          )}
        </div>

        {/* SÓI CUỒNG NỘ (SÓI CON CHẾT) BANNER */}
        {wolfCanKillDouble && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950 via-red-900/60 to-rose-950 border border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50 flex items-center gap-2.5">
            <WolfIcon className="w-6 h-6 shrink-0 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-rose-100 font-cinzel">BẦY SÓI CUỒNG NỘ: ĐƯỢC CẮN 2 NẠN NHÂN</div>
              <div className="text-[11px] text-rose-300">Do Sói Con đã tử trận, bầy Sói được chọn 2 con mồi khác nhau đêm nay.</div>
            </div>
          </div>
        )}

        {/* Banner when a player has been converted into a Werewolf via Sói Nguyền */}
        {nightState.lastCursedVictimId && (() => {
          const cursedP = players.find(p => p.id === nightState.lastCursedVictimId);
          const origRole = getPlayerOriginalRole(cursedP);
          return (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#260736] to-[#160421] border border-purple-500/80 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-400 flex items-center justify-center text-sm shrink-0">
                  🔮
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Đã nguyền {cursedP?.name} thành Ma Sói</span>
                    <span className="text-[10px] text-amber-300 font-normal">({origRole?.name || 'Chưa lộ vai'})</span>
                  </div>
                  <div className="text-[11px] text-purple-300/80">
                    Bầy Sói chọn tiếp 1 người bên dưới để cắn.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSaveAction('undo_curse_convert', nightState.lastCursedVictimId)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-200 transition-all cursor-pointer self-end sm:self-auto shrink-0 shadow-sm"
                title="Hủy nguyền & phục hồi vai ban đầu"
              >
                ↩ Hoàn tác nguyền
              </button>
            </div>
          );
        })()}

        {/* SÓI CẮN ĐỒNG LOẠI BADGE NẾU BẬT RULE */}
        {canWolvesKillTeammates && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/60 border border-purple-600 text-purple-200 text-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🐺⚡</span>
              <span>Đã bật luật: Ma Sói có thể cắn chính đồng loại</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900 border border-purple-500 font-mono text-purple-200">
              Cắn tự do
            </span>
          </div>
        )}

        {/* Seat Picker for Werewolves */}
        <PlayerSeatPicker
          players={alivePlayers}
          selectedIds={!nightState.wolfSkipped ? [nightState.wolfTargetId, nightState.wolfTargetId2].filter(Boolean) : []}
          disabledIds={canWolvesKillTeammates ? [] : alivePlayers.filter(isWolfPlayer).map(p => p.id)}
          onSelect={(id) => {
            const isWolf = isWolfPlayer(players.find(p => p.id === id));
            if (isWolf && !canWolvesKillTeammates) return;

            if (!wolfCanKillDouble) {
              if (nightState.wolfTargetId === id && !nightState.wolfSkipped) {
                onSaveAction('wolves', null, { wolfSkipped: false });
              } else {
                onSaveAction('wolves', id, { wolfSkipped: false });
              }
              return;
            }

            // Logic chọn 2 mục tiêu khi Sói Con chết
            if (nightState.wolfTargetId === id) {
              onSaveAction('wolves', null, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
            } else if (nightState.wolfTargetId2 === id) {
              onSaveAction('wolves_second', null);
            } else if (!nightState.wolfTargetId) {
              onSaveAction('wolves', id, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
            } else if (!nightState.wolfTargetId2) {
              onSaveAction('wolves_second', id);
            } else {
              onSaveAction('wolves', id, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
            }
          }}
          maxSelect={wolfCanKillDouble ? 2 : 1}
          variant="wolf"
          isWolfPlayer={isWolfPlayer}
        />

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onSaveAction('wolves', null, { wolfSkipped: true })}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-bold cursor-pointer ${
              nightState.wolfSkipped
                ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            🚫 Đêm Nay Không Cắn Ai
          </button>

          {(nightState.wolfTargetId || nightState.wolfTargetId2 || nightState.wolfSkipped) && (
            <button
              type="button"
              onClick={() => {
                onSaveAction('wolves', null, { wolfSkipped: false });
                onSaveAction('wolves_second', null);
              }}
              className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
            >
              ✕ Xóa chọn lại
            </button>
          )}
        </div>
      </div>

      {/* SÓI NGUYỀN LÂY NHIỄM PANEL */}
      {wolfVictim && !isWolfPlayer(wolfVictim) && !nightState.wolfSkipped && canCursedWolfInfect && (
        <div className="p-4 rounded-2xl border transition-all mt-3 bg-gradient-to-r from-[#220736] via-[#160424] to-[#220736] border-purple-600/90 shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border bg-purple-900 border-purple-400 text-purple-200 shadow-md">
                🔮
              </div>
              <div>
                <div className="font-bold text-sm text-purple-200 flex items-center gap-2">
                  <span>SÓI NGUYỀN (SÓI QUỶ)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    1 lần/ván
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Đồng hóa thành Ma Sói (giữ vai gốc). Bầy Sói được chọn cắn tiếp.
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSaveAction('curse_convert', wolfVictim.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-300 hover:scale-105 active:scale-95"
              >
                <span>🔮 Nguyền thành Sói</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
