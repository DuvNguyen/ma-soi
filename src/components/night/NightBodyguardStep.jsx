import React from 'react';
import { Shield } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import { getPlayerRole, isWolfPlayer } from '../../utils/roleUtils';

export default function NightBodyguardStep({
  players,
  alivePlayers,
  nightState,
  onSaveAction
}) {
  const protectedP = players.find(x => x.id === nightState.protectedPlayerId);
  const lastNightP = players.find(x => x.id === nightState.lastNightProtectedId);
  const isProtected = nightState.protectedPlayerId && !nightState.protectSkipped;

  // Người giữ vai Bảo Vệ được ưu tiên đứng ở vị trí đầu tiên (#1) trong ma trận ghế
  const bodyguardPlayers = alivePlayers.filter(p => (p.currentRoleId || p.roleId) === 'bao-ve' || getPlayerRole(p)?.id === 'bao-ve');
  const otherPlayers = alivePlayers.filter(p => !bodyguardPlayers.some(bg => bg.id === p.id));
  const sortedProtectPlayers = [...bodyguardPlayers, ...otherPlayers];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-teal-400" />
        <h4 className="font-bold text-sm text-teal-200 font-cinzel">
          Mục tiêu bảo vệ đêm nay
        </h4>
      </div>

      {/* Summary Box of Protection */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-[#0e2a26] to-[#0a1816] border border-teal-600/70 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Mục tiêu bảo vệ ({isProtected ? '1/1' : nightState.protectSkipped ? 'Bỏ qua' : '0/1'}):
          </span>
          {isProtected ? (
            <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
              🛡️ Đã chọn người bảo vệ
            </span>
          ) : nightState.protectSkipped ? (
            <span className="text-xs font-bold text-amber-300">
              🚫 Đêm nay không bảo vệ ai
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Chưa chọn
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-black/50 border border-teal-700/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-teal-400">Đêm nay bảo vệ</div>
              <div className="font-bold text-sm text-white">
                {isProtected ? `${protectedP?.name} (#${protectedP?.id})` : nightState.protectSkipped ? 'Không bảo vệ ai' : 'Chưa chọn'}
              </div>
            </div>
            {isProtected && <Shield className="w-5 h-5 text-teal-400 fill-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" />}
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Đêm trước đã bảo vệ</div>
              <div className="font-bold text-xs text-slate-300">
                {lastNightP ? `${lastNightP.name} (#${lastNightP.id})` : 'Chưa có'}
              </div>
            </div>
            {lastNightP && <span className="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">Bị cấm</span>}
          </div>
        </div>
      </div>

      {/* Seat Picker for Bodyguard (Bodyguard player placed first) */}
      <PlayerSeatPicker
        players={sortedProtectPlayers}
        selectedIds={isProtected ? [nightState.protectedPlayerId] : []}
        disabledIds={nightState.lastNightProtectedId ? [nightState.lastNightProtectedId] : []}
        onSelect={(id) => {
          if (nightState.protectedPlayerId === id && !nightState.protectSkipped) {
            onSaveAction('protect', null, { protectSkipped: false });
          } else {
            onSaveAction('protect', id, { protectSkipped: false });
          }
        }}
        maxSelect={1}
        variant="protect"
        isWolfPlayer={isWolfPlayer}
      />

      {/* Action Buttons Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onSaveAction('protect', null, { protectSkipped: true })}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-bold cursor-pointer ${
            nightState.protectSkipped
              ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          🚫 Đêm Nay Không Bảo Vệ Ai
        </button>

        {(nightState.protectedPlayerId || nightState.protectSkipped) && (
          <button
            type="button"
            onClick={() => onSaveAction('protect', null, { protectSkipped: false })}
            className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
          >
            ✕ Xóa chọn lại
          </button>
        )}
      </div>
    </div>
  );
}
