import React from 'react';
import { Star, Award, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import { getPlayerRole } from '../../utils/roleUtils';

export default function DaySheriffBanner({
  players,
  alivePlayers,
  onOpenSheriffModal,
  onToggleSheriff,
  showSheriffSelector,
  setShowSheriffSelector
}) {
  const sheriff = players.find(p => p.isSheriff);
  const sheriffDead = sheriff && !sheriff.isAlive;

  return (
    <div className={`p-4 rounded-2xl border transition-all backdrop-blur-md ${
      sheriffDead
        ? 'bg-rose-950/50 border-rose-600/90 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
        : sheriff
        ? 'bg-[#151226]/60 border-amber-600/60 shadow-[0_2px_15px_rgba(245,158,11,0.2)]'
        : 'bg-[#10121d]/60 border-purple-900/60'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
            sheriffDead
              ? 'bg-rose-900 border-rose-500 text-rose-200'
              : sheriff
              ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'bg-purple-950 border-purple-800 text-purple-300'
          }`}>
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                Cảnh Sát Trưởng
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold">
                Phiếu vote x2
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black font-cinzel text-white">
              {sheriff ? (
                <span>
                  Cảnh Sát Trưởng: <strong className="text-amber-300">{sheriff.name} (#{sheriff.id})</strong>
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (Vai: {getPlayerRole(sheriff)?.name || 'Chưa lộ vai'})
                  </span>
                </span>
              ) : (
                <span>Chưa Bầu Cảnh Sát Trưởng</span>
              )}
            </h4>
            {sheriffDead && (
              <p className="text-xs text-rose-300 font-bold mt-0.5">
                ⚠️ Cảnh Sát Trưởng đã hy sinh — Cần chỉ định người kế nhiệm.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <GothicButton
            variant={sheriffDead ? 'blood' : sheriff ? 'gold' : 'witch'}
            size="sm"
            icon={sheriffDead ? RotateCcw : Award}
            onClick={() => {
              if (onOpenSheriffModal) {
                onOpenSheriffModal(sheriffDead ? sheriff : null, false);
              } else {
                setShowSheriffSelector(!showSheriffSelector);
              }
            }}
          >
            {sheriffDead ? 'Chỉ Định Kế Nhiệm' : sheriff ? 'Đổi Người Giữ' : 'Bầu Cảnh Sát Trưởng'}
            {!onOpenSheriffModal && (showSheriffSelector ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />)}
          </GothicButton>
        </div>
      </div>

      {/* Quick Sheriff Selector Drawer */}
      {showSheriffSelector && (
        <div className="mt-3 pt-3 border-t border-slate-800 animate-fade-in space-y-2">
          <div className="text-xs text-slate-300 flex items-center justify-between">
            <span>Chỉ định Cảnh Sát Trưởng (phiếu x2):</span>
            <span className="text-[11px] text-amber-300/80">Chức vụ song song</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {alivePlayers.map(p => {
              const isCurrentSheriff = p.isSheriff;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (onToggleSheriff) onToggleSheriff(p.id);
                    setShowSheriffSelector(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                    isCurrentSheriff
                      ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-1 ring-amber-300'
                      : 'bg-[#10121d] hover:bg-[#1a172e] text-slate-300 border-slate-800 hover:border-amber-600/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate">
                    <div className="font-bold truncate text-slate-100 flex items-center gap-1">
                      <span>#{p.id} {p.name}</span>
                      {isCurrentSheriff && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Vai: {getPlayerRole(p)?.name || 'Chưa lộ'}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    isCurrentSheriff
                      ? 'bg-amber-900 text-amber-200 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {isCurrentSheriff ? 'Đang giữ' : 'Trao'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
