import React from 'react';
import { Eye, X, AlertCircle } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import WolfIcon from '../ui/WolfIcon';
import { Player } from '../../domain/models/Player.js';

export default function NightSeerStep({
  players,
  alivePlayers,
  nightState,
  selectedSeerTarget,
  setSelectedSeerTarget,
  onSaveAction,
  isWolfPlayer
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h4 className="font-bold text-sm text-purple-200 font-cinzel">
            Mục tiêu soi đêm nay
          </h4>
        </div>
      </div>

      {/* THE REVEALED CARD OF INSPECTED PLAYER */}
      {selectedSeerTarget ? (() => {
        const livePlayer = players.find(p => p.id === selectedSeerTarget.id) || selectedSeerTarget;
        const targetPlayerModel = livePlayer instanceof Player 
          ? livePlayer 
          : Player.fromJSON(livePlayer);
        const isUnassigned = !targetPlayerModel.currentRoleId && !targetPlayerModel.roleId;
        const targetRole = targetPlayerModel.getRole();
        const isTargetWolf = !isUnassigned && targetPlayerModel.getSeerAffiliation(nightState) === 'WOLF';
        
        // Bán Sói (Nửa Người Nửa Sói) nếu đã bị bầy Sói cắn trong đêm nay
        const isBittenHalfWolfTonight = (livePlayer?.currentRoleId === 'nua-nguoi-nua-soi' || livePlayer?.roleId === 'nua-nguoi-nua-soi') &&
          (nightState?.wolfTargetId === livePlayer?.id || nightState?.wolfTargetId2 === livePlayer?.id) &&
          !nightState?.wolfSkipped;

        return (
          <div className={`p-4 rounded-2xl border transition-all animate-fade-in flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative ${
            isUnassigned
              ? 'bg-gradient-to-r from-[#181520] via-[#100e17] to-[#08070c] border-amber-600/70 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
              : isTargetWolf
              ? 'bg-gradient-to-r from-[#3b080c] via-[#200305] to-[#120204] border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.6)]'
              : 'bg-gradient-to-r from-[#0d1a33] via-[#091224] to-[#050b18] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]'
          }`}>
            {/* Big Red X Close Button */}
            <button
              type="button"
              onClick={() => setSelectedSeerTarget(null)}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer z-10"
              title="Đóng thẻ bài"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* The Big Card */}
            <div className="relative shrink-0">
              <div className={`w-24 h-34 sm:w-28 sm:h-40 rounded-xl overflow-hidden border-2 p-1 shadow-2xl flex items-center justify-center bg-black/90 ${
                isUnassigned
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : isTargetWolf
                  ? 'border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.8)]'
                  : 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
              }`}>
                {targetRole?.image ? (
                  <img
                    src={targetRole.image}
                    alt={targetRole.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-4xl flex items-center justify-center">
                    {isUnassigned ? '❓' : isTargetWolf ? <WolfIcon className="w-10 h-10" /> : '👨‍🌾'}
                  </div>
                )}
              </div>
            </div>

            {/* Card Info */}
            <div className="flex-1 space-y-2 pr-6">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                #{livePlayer.id} {livePlayer.name}
              </div>
              <h3 className={`text-xl sm:text-2xl font-black font-cinzel ${
                isUnassigned
                  ? 'text-amber-200'
                  : isTargetWolf
                  ? 'text-rose-100'
                  : 'text-blue-100'
              }`}>
                {isUnassigned ? 'Chưa Lộ Vai / Chưa Gán' : (targetRole?.name || 'Dân Làng')}
              </h3>

              {/* Clean Result Badge */}
              <div className="pt-0.5">
                {isUnassigned ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-600 text-amber-300 font-bold text-xs uppercase tracking-wide shadow-md">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Chưa Xác Định
                  </span>
                ) : isTargetWolf ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-rose-950/80">
                    <WolfIcon className="w-4 h-4" /> Là Ma Sói
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-blue-950/80">
                    👨‍🌾 Phe Dân Làng
                  </span>
                )}
              </div>

              {isUnassigned && (
                <div className="text-[11px] text-amber-300/80 italic font-medium">
                  Người chơi chưa được gán vai trò. Quản trò cần gán vai trước khi ra dấu cho Tiên Tri.
                </div>
              )}

              {livePlayer.isCursedWolf && (
                <div className="text-[11px] text-purple-300 italic font-medium">
                  (Đã bị Sói Nguyền lây nhiễm thành Sói)
                </div>
              )}

              {isBittenHalfWolfTonight && (
                <div className="text-[11px] text-rose-300 italic font-medium animate-pulse">
                  (Bán Sói đã bị bầy Sói cắn đêm nay ➔ Đã thức tỉnh thành Ma Sói!)
                </div>
              )}
            </div>
          </div>
        );
      })() : (
        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50 text-xs text-purple-300 text-center">
          Chọn người chơi trong danh sách để soi vai trò:
        </div>
      )}

      {/* THEATRE SEAT MATRIX / SLIDER PICKER */}
      <PlayerSeatPicker
        players={alivePlayers}
        selectedIds={selectedSeerTarget ? [selectedSeerTarget.id] : []}
        onSelect={(id) => {
          const target = players.find(x => x.id === id);
          setSelectedSeerTarget(target);
          onSaveAction('seer', id);
        }}
        maxSelect={1}
        variant="seer"
        isWolfPlayer={isWolfPlayer}
      />
    </div>
  );
}
