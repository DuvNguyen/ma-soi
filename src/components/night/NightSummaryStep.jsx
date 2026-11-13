import React from 'react';
import { Sun } from 'lucide-react';
import GothicButton from '../ui/GothicButton';

export default function NightSummaryStep({
  roundNumber,
  players,
  nightState,
  onAdvanceToDay
}) {
  const protectedPlayer = players.find(p => p.id === nightState.protectedPlayerId);
  const wolfVictim = players.find(p => p.id === nightState.wolfTargetId);
  const bigBadWolfVictim = players.find(p => p.id === nightState.bigBadWolfTargetId);
  const witchPoisonVictim = players.find(p => p.id === nightState.witchPoisonTargetId);

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#141626]/70 to-[#0a0c14]/70 backdrop-blur-md border border-amber-900/60 text-center space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/50 mx-auto flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
        <Sun className="w-8 h-8 animate-spin-slow" />
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          Đã Hoàn Tất Tất Cả Các Bước Trong Đêm
        </div>
        <h3 className="text-2xl md:text-3xl font-black font-cinzel text-white">
          BÌNH MINH ĐANG ĐẾN VỚI NGÔI LÀNG
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Tất cả nhân vật trong đêm đã hoàn thành lượt gọi.
        </p>
      </div>

      {/* Actions summary recap card */}
      <div className="p-4 rounded-2xl bg-[#0c0d16]/70 backdrop-blur-sm border border-slate-800 max-w-lg mx-auto text-left space-y-2 text-xs shadow-inner">
        <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>Tóm tắt quyết định đêm nay:</span>
          <span className="text-amber-400 font-bold">Đêm {roundNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Người được Bảo Vệ:</span>
          <strong className="text-teal-400">{protectedPlayer?.name || 'Không có'}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Mục tiêu Sói cắn:</span>
          <strong className="text-rose-400">{wolfVictim?.name || 'Không cắn ai'}</strong>
        </div>
        {nightState.bigBadWolfTargetId && !nightState.bigBadWolfSkipped && (
          <div className="flex justify-between">
            <span className="text-slate-400">Sói Lớn cắn thêm:</span>
            <strong className="text-rose-400">{bigBadWolfVictim?.name || 'Không có'}</strong>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Phù Thủy cứu nạn nhân:</span>
          <strong className={nightState.witchSaved ? 'text-emerald-400' : 'text-slate-500'}>
            {nightState.witchSaved ? 'Có dùng bình cứu' : 'Không dùng'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Phù Thủy đầu độc:</span>
          <strong className={witchPoisonVictim ? 'text-rose-400' : 'text-slate-500'}>
            {witchPoisonVictim?.name || 'Không dùng'}
          </strong>
        </div>
      </div>

      <div className="pt-2">
        <GothicButton
          variant="gold"
          size="lg"
          onClick={() => {
            try {
              localStorage.removeItem('werewolf_current_night_step');
            } catch (e) {}
            onAdvanceToDay();
          }}
          className="py-4 px-10 text-base md:text-lg shadow-2xl shadow-amber-950/80 mx-auto"
        >
          <Sun className="w-6 h-6 stroke-[3] mr-2" />
          <span>TRỜI SÁNG RỒI! (CẢ LÀNG THỨC GIẤC)</span>
        </GothicButton>
      </div>
    </div>
  );
}
