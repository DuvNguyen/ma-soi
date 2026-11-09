import React from 'react';
import { Trophy, RefreshCw, Skull, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import GothicButton from './ui/GothicButton';

export default function GameOverModal({ gameEndResult, onRestartGame }) {
  if (!gameEndResult || !gameEndResult.isEnded) return null;

  const isVillagerWin = gameEndResult.teamCode === 'V';
  const isWolfWin = gameEndResult.teamCode === 'W';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 text-center relative ${
        isWolfWin
          ? 'bg-gradient-to-b from-[#2a0509] to-[#120204] border-rose-600/90 shadow-[0_0_40px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50'
          : isVillagerWin
          ? 'bg-gradient-to-b from-[#0a1428] to-[#040814] border-blue-600/80 shadow-[0_0_35px_rgba(37,99,235,0.4)]'
          : 'bg-gradient-to-b from-[#210838] to-[#0d0317] border-purple-600/80 shadow-[0_0_35px_rgba(147,51,234,0.4)]'
      }`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        {/* Victory Icon */}
        <div className={`mx-auto mb-4 w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border ${
          isWolfWin
            ? 'bg-rose-950/80 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)]'
            : isVillagerWin
            ? 'bg-blue-950/80 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]'
            : 'bg-purple-950/80 border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.5)]'
        }`}>
          {isWolfWin ? (
            <span className="text-4xl animate-bounce">🐺</span>
          ) : isVillagerWin ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
          ) : (
            <Sparkles className="w-10 h-10 text-purple-400" />
          )}
        </div>

        {/* Victory Title */}
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          Trận Đấu Đã Kết Thúc
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-cinzel text-white mb-3">
          {gameEndResult.winnerTitle}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 px-2">
          {gameEndResult.description}
        </p>

        {/* Action button */}
        <div className="pt-2 flex justify-center">
          <GothicButton
            variant={isWolfWin ? 'blood' : 'witch'}
            size="lg"
            icon={RefreshCw}
            onClick={onRestartGame}
            className="shadow-2xl"
          >
            Thiết Lập Ván Chơi Mới
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
