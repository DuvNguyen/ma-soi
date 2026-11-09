import React from 'react';
import { Heart, Skull, Shield, Eye, UserCheck, AlertCircle } from 'lucide-react';
import GothicBadge from './ui/GothicBadge';
import GothicButton from './ui/GothicButton';

export default function PlayersGridView({ players, onOpenAssignRole }) {
  const aliveCount = players.filter(p => p.isAlive).length;
  const wolfCount = players.filter(p => p.isAlive && p.role?.teamCode === 'W').length;
  const villagerCount = players.filter(p => p.isAlive && p.role?.teamCode === 'V').length;

  const isWolfPlayer = (p) => {
    return p.role?.teamCode === 'W' || ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang'].includes(p.role?.id);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Overview Stat Badges - Unified Gothic Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0f111a] border border-slate-800 flex items-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
            {aliveCount}/{players.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Còn sống</div>
            <div className="text-sm font-black text-slate-100">{aliveCount} người</div>
          </div>
        </div>

        {/* Werewolves Alive Badge - HIGH-VISIBILITY GLOWING RED BORDER */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#240508] to-[#120204] border border-rose-600/90 shadow-[0_0_18px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 font-black shadow-[0_0_10px_rgba(225,29,72,0.6)]">
            🐺 {wolfCount}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Phe Ma Sói</div>
            <div className="text-sm font-black text-rose-200">{wolfCount} con sống</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0a1224] border border-blue-900/60 shadow-[0_0_12px_rgba(37,99,235,0.2)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-300 font-black">
            👨‍🌾 {villagerCount}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Phe Dân Làng</div>
            <div className="text-sm font-black text-blue-200">{villagerCount} người sống</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#170826] border border-purple-900/60 shadow-[0_0_12px_rgba(147,51,234,0.2)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-black">
            💀 {players.length - aliveCount}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Đã hy sinh</div>
            <div className="text-sm font-black text-purple-200">{players.length - aliveCount} người</div>
          </div>
        </div>
      </div>

      {/* Players Grid with HIGHLIGHT RED BORDERS FOR WEREWOLVES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map(p => {
          const partner = p.loverId ? players.find(x => x.id === p.loverId) : null;
          const isWolf = isWolfPlayer(p);

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                !p.isAlive
                  ? 'bg-[#090a10]/60 border-slate-900/80 opacity-50 text-slate-600'
                  : isWolf
                  ? 'bg-gradient-to-b from-[#240609] via-[#140305] to-[#0c0203] border-rose-600/90 shadow-[0_0_20px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50'
                  : 'bg-[#101320] border-slate-800/90 hover:border-purple-600/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                      isWolf
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : p.isAlive
                        ? 'bg-slate-900 text-slate-300 border-slate-800'
                        : 'bg-black text-slate-700 border-slate-950'
                    }`}>
                      {p.id}
                    </div>
                    <span className={`font-bold text-sm ${
                      !p.isAlive
                        ? 'text-slate-600 line-through'
                        : isWolf
                        ? 'text-rose-200 font-black'
                        : 'text-slate-100'
                    }`}>
                      {p.name}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {p.isAlive ? (
                    isWolf ? (
                      <GothicBadge variant="wolf">
                        🐺 Sói sống
                      </GothicBadge>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                        Còn sống
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-900 flex items-center gap-1">
                      <Skull className="w-3 h-3" /> Đã chết
                    </span>
                  )}
                </div>

                {/* Role Details */}
                <div className={`p-2.5 rounded-xl border mb-2 ${
                  isWolf
                    ? 'bg-black/60 border-rose-900/60'
                    : 'bg-black/40 border-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Vai trò:</span>
                    {p.role?.teamCode && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${
                        isWolf
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}>
                        [{p.role.teamCode}] {p.role.team}
                      </span>
                    )}
                  </div>
                  <div className={`font-black text-sm mt-0.5 ${
                    isWolf ? 'text-rose-300 font-cinzel' : 'text-slate-200'
                  }`}>
                    {p.role?.name || (
                      <span className="text-slate-500 italic font-normal text-xs">Chưa gán vai</span>
                    )}
                  </div>
                </div>

                {/* Badges / Links (Lovers, Idiot, Elder...) */}
                <div className="space-y-1">
                  {partner && (
                    <div className="text-[11px] text-pink-300 bg-purple-950/40 border border-pink-700/50 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                      <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500 shrink-0" />
                      <span>Yêu: <strong>{partner.name}</strong> ({partner.isAlive ? 'Sống' : 'Chết'})</span>
                    </div>
                  )}

                  {p.role?.id === 'gia-lang' && p.isAlive && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mạng Già Làng: <strong>{p.elderLives || 2}/2</strong></span>
                    </div>
                  )}

                  {p.isRevealedIdiot && (
                    <div className="text-[11px] text-orange-300 bg-orange-950/40 border border-orange-800/40 px-2 py-1 rounded-lg flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                      <span>Thằng ngốc đã lật bài (Mất quyền vote)</span>
                    </div>
                  )}

                  {!p.isAlive && p.deathReason && (
                    <div className="text-[11px] text-rose-400/90 italic px-1 pt-1">
                      {p.deathReason} ({p.deathPhase})
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                <button
                  onClick={() => onOpenAssignRole(p)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors"
                >
                  Đổi vai trò ▾
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
