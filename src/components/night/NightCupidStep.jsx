import React from 'react';
import { Heart } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import { getPlayerRole } from '../../utils/roleUtils';

export default function NightCupidStep({
  players,
  nightState,
  onSaveAction,
  isWolfPlayer
}) {
  const chosen = nightState.cupidChosenIds || [];
  const p1 = players.find(x => x.id === chosen[0]);
  const p2 = players.find(x => x.id === chosen[1]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-pink-400 fill-pink-500/40" />
        <h4 className="font-bold text-sm text-pink-200 font-cinzel">
          Ghép đôi Cupid
        </h4>
      </div>

      {/* SUMMARY COUPLE BOX */}
      <div className="p-3.5 rounded-2xl bg-[#120d20] border border-pink-900/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Cặp đôi ghép nối ({chosen.length}/2):</span>
          <span className="text-pink-400 font-bold">
            {chosen.length === 2 ? (
              <span className="text-pink-400 font-bold">❤️ Đã chọn đủ 2 người</span>
            ) : (
              <span className="text-slate-400 font-normal">Chọn thêm {2 - chosen.length} người</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <div className={`p-2.5 rounded-xl border text-center transition-colors ${
            p1 ? 'bg-pink-950/80 border-pink-500 text-pink-100' : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] uppercase font-bold text-slate-400">Người Yêu 1</div>
            <div className="text-sm font-bold truncate mt-0.5">{p1 ? p1.name : '--- Chưa chọn ---'}</div>
            {p1 && (
              <div className="text-[10px] text-pink-300">
                {getPlayerRole(p1)?.name ? `(${getPlayerRole(p1).name})` : '(Chưa lộ vai)'}
              </div>
            )}
          </div>

          <div className={`p-2.5 rounded-xl border text-center transition-colors ${
            p2 ? 'bg-pink-950/80 border-pink-500 text-pink-100' : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <div className="text-[10px] uppercase font-bold text-slate-400">Người Yêu 2</div>
            <div className="text-sm font-bold truncate mt-0.5">{p2 ? p2.name : '--- Chưa chọn ---'}</div>
            {p2 && (
              <div className="text-[10px] text-pink-300">
                {getPlayerRole(p2)?.name ? `(${getPlayerRole(p2).name})` : '(Chưa lộ vai)'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEAT MATRIX FOR CUPID */}
      <PlayerSeatPicker
        players={players}
        selectedIds={chosen}
        onSelect={(id) => {
          let next = [];
          if (chosen.includes(id)) {
            next = chosen.filter(x => x !== id);
          } else if (chosen.length < 2) {
            next = [...chosen, id];
          } else {
            next = [chosen[1], id];
          }
          onSaveAction('cupid', next);
        }}
        maxSelect={2}
        variant="cupid"
        isWolfPlayer={isWolfPlayer}
      />

      {chosen.length > 0 && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onSaveAction('cupid', [])}
            className="text-xs text-slate-400 hover:text-pink-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
          >
            ✕ Xóa chọn lại
          </button>
        </div>
      )}
    </div>
  );
}
