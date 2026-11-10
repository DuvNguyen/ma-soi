import React from 'react';
import { Skull, Clock, Heart, Shield, X } from 'lucide-react';
import GothicModalContainer from './ui/GothicModalContainer';
import GothicButton from './ui/GothicButton';
import WolfHead from './ui/WolfHead';
import { isWolfPlayer, getPlayerRole } from '../utils/roleUtils';

export default function CemeteryModal({ isOpen, onClose, players, roundNumber }) {
  if (!isOpen) return null;

  const deadPlayers = players.filter(p => !p.isAlive);
  const alivePlayers = players.filter(p => p.isAlive);

  return (
    <GothicModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="NGHĨA TRANG NGÔI LÀNG"
      subtitle={`${deadPlayers.length} người đã hy sinh • ${alivePlayers.length} người còn sống`}
      icon={Skull}
      iconColor="text-rose-500"
      maxWidth="max-w-lg"
      showClawMarks={true}
      showWolfWatermark={true}
    >
      <div className="space-y-4">
        {deadPlayers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/60 border border-slate-800 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#2a080c] to-[#140305] border border-rose-600/70 shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center mx-auto">
              <WolfHead size={36} glowingEye={true} />
            </div>
            <div className="font-bold text-sm text-slate-200">Chưa Ai Hy Sinh!</div>
            <p className="text-xs text-slate-400">
              Cả làng vẫn còn sống trọn vẹn {players.length} người. Bầy Sói vẫn chưa cướp đi sinh mạng nào.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {deadPlayers.map(p => {
              const isWolf = isWolfPlayer(p);
              const pRole = getPlayerRole(p);
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isWolf
                      ? 'bg-gradient-to-r from-[#240609] to-[#120204] border-rose-800/80 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                      : 'bg-[#10121f] border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                      isWolf ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      #{p.id}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{p.name}</span>
                        {pRole?.name && (
                          <span className={`text-[10px] px-2 py-0.2 rounded font-bold border ${
                            isWolf 
                              ? 'bg-rose-950 text-rose-300 border-rose-600' 
                              : 'bg-purple-950 text-purple-300 border-purple-700'
                          }`}>
                            {pRole.name}
                          </span>
                        )}
                      </div>

                      {/* Death Reason & When */}
                      <div className="text-xs text-rose-400/90 mt-1 flex items-center gap-1.5 font-medium">
                        <Skull className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.deathReason || 'Bị sát hại trong ván đấu'}</span>
                      </div>

                      {p.deathPhase && (
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Thời điểm: <strong className="text-slate-400">{p.deathPhase}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-900 shrink-0">
                    Đã chết
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <GothicButton variant="dark" size="sm" onClick={onClose}>
            Đóng Lại
          </GothicButton>
        </div>
      </div>
    </GothicModalContainer>
  );
}
