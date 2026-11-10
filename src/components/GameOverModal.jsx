import React from 'react';
import { Trophy, RefreshCw, Skull, Sparkles } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';

export default function GameOverModal({ gameEndResult, onRestartGame }) {
  if (!gameEndResult || !gameEndResult.isEnded) return null;

  const isVillagerWin = gameEndResult.teamCode === 'V';
  const isWolfWin = gameEndResult.teamCode === 'W';

  // Derive the faction name to stamp onto the banner
  const factionName = isWolfWin
    ? 'MA SÓI'
    : isVillagerWin
    ? 'DÂN LÀNG'
    : gameEndResult.winner === 'Lovers'
    ? 'CẶP ĐÔI'
    : gameEndResult.winner === 'Idiot'
    ? 'THẰNG NGỐ'
    : gameEndResult.winner?.toUpperCase() || 'PHE THỨ 3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Container holding the victory banner & actions */}
      <div className="relative flex flex-col items-center justify-center my-auto max-w-md w-full">
        {/* Ambient Glow behind banner */}
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isWolfWin
            ? 'bg-rose-600/35'
            : isVillagerWin
            ? 'bg-amber-500/25'
            : 'bg-purple-600/30'
        }`} />

        {/* The Hanging Victory Battle Banner */}
        <div className="relative w-[300px] sm:w-[340px] md:w-[360px] animate-banner-drop select-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]">
          {/* Banner Asset Image */}
          <img
            src="/victory-banner.png"
            alt="Cờ Chiến Thắng"
            className="w-full h-auto object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none"
          />

          {/* Stamped Content Over Parchment Area - Bó gọn trong phần vải trung tâm */}
          <div className="absolute top-[20%] bottom-[18%] left-[18%] right-[18%] flex flex-col items-center justify-between text-center p-1 overflow-hidden pointer-events-none">
            
            {/* Top Emblem stamped on parchment (No blurry frame, nicely spaced from top pole) */}
            <div className="animate-stamp-in flex items-center justify-center pt-2 shrink-0">
              {isWolfWin ? (
                <WolfIcon className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] filter" />
              ) : isVillagerWin ? (
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-900 drop-shadow-[0_3px_6px_rgba(120,53,15,0.8)]" />
              ) : (
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-900 drop-shadow-[0_3px_6px_rgba(88,28,135,0.8)]" />
              )}
            </div>

            {/* Stamped Inscribed Text - In lên cờ với font TH Kinhdi 1 */}
            <div className="animate-stamp-in my-auto space-y-1 w-full px-1">
              <div 
                className="font-kinhdi text-[11px] sm:text-xs tracking-widest uppercase font-black"
                style={{
                  color: isWolfWin ? '#58080f' : isVillagerWin ? '#3d2508' : '#320b4a',
                  textShadow: isWolfWin
                    ? '0 0 6px rgba(225,29,72,0.6), 0 1px 2px rgba(0,0,0,0.8)'
                    : '0 0 4px rgba(180,83,9,0.4), 0 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                PHE THẮNG LÀ:
              </div>

              <div 
                className="font-kinhdi text-xl sm:text-2xl md:text-3xl font-black tracking-wider leading-none py-1 break-words"
                style={{
                  color: isWolfWin ? '#700913' : isVillagerWin ? '#452003' : '#450a5e',
                  textShadow: isWolfWin
                    ? '0 0 10px rgba(225,29,72,0.8), 0 2px 4px rgba(0,0,0,0.9)'
                    : isVillagerWin
                    ? '0 0 8px rgba(217,119,6,0.6), 0 2px 4px rgba(0,0,0,0.8)'
                    : '0 0 8px rgba(168,85,247,0.6), 0 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {factionName}
              </div>

              <div 
                className="text-[9px] sm:text-[10px] font-cinzel font-bold uppercase tracking-wide px-1 line-clamp-2"
                style={{
                  color: isWolfWin ? '#7f1d1d' : isVillagerWin ? '#78350f' : '#581c87'
                }}
              >
                {gameEndResult.winnerTitle}
              </div>
            </div>

            {/* Description inscribed on parchment lower section - Bold, centered, compact and readable */}
            <div 
              className="animate-stamp-in text-[10px] sm:text-[11px] font-bold font-serif leading-snug w-full px-1 pb-1 line-clamp-4"
              style={{
                color: isWolfWin ? '#3b0509' : isVillagerWin ? '#2d1603' : '#230433',
                textShadow: '0 1px 1px rgba(255,255,255,0.5)'
              }}
            >
              {gameEndResult.description}
            </div>

          </div>
        </div>

        {/* Restart / New Game Action Button */}
        <div className="mt-5 flex justify-center z-20 animate-fade-in">
          <GothicButton
            variant={isWolfWin ? 'blood' : 'witch'}
            size="md"
            icon={RefreshCw}
            onClick={onRestartGame}
            className="shadow-[0_0_25px_rgba(0,0,0,0.8)]"
          >
            Thiết Lập Ván Chơi Mới
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
