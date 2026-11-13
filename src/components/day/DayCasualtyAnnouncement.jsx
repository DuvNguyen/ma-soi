import React from 'react';
import { Skull, AlertTriangle, Crosshair } from 'lucide-react';

export default function DayCasualtyAnnouncement({
  players,
  roundNumber,
  nightLogs
}) {
  const deadTonight = players.filter(p => !p.isAlive && p.deathPhase === `Đêm ${roundNumber}`);
  const deadFromHunter = players.filter(
    p => !p.isAlive &&
    p.deathReason?.toLowerCase().includes('thợ săn') &&
    (p.deathPhase === `Đêm ${roundNumber}` || p.deathPhase === `Ngày ${roundNumber}`)
  );
  const detailLogs = (nightLogs || []).filter(log => !log.startsWith('Đêm qua có ') && !log.startsWith('Đêm qua bình yên'));

  return (
    <div className="space-y-2">
      {/* SỐ LƯỢNG NGƯỜI CHẾT VÀ TÊN TỪNG NGƯỜI */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 font-cinzel text-sm sm:text-base font-black ${
        deadTonight.length > 0
          ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.35)]'
          : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-md'
      }`}>
        <Skull className={`w-5 h-5 shrink-0 ${deadTonight.length > 0 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : 'text-emerald-400'}`} />
        <div className="flex-1">
          {deadTonight.length > 0 ? (
            <span>
              Đêm qua có <span className="text-rose-300 underline font-black">{deadTonight.length} người chết</span>: {deadTonight.map(p => `${p.name} (#${p.id})`).join(', ')}.
            </span>
          ) : (
            <span className="text-emerald-300">
              Đêm qua bình yên, không có ai chết!
            </span>
          )}
        </div>
      </div>

      {/* NẠN NHÂN TỪ PHÁT SÚNG THỢ SĂN */}
      {deadFromHunter.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/80 bg-gradient-to-r from-amber-950/90 via-[#261205] to-[#120802] text-amber-100 flex items-center gap-3 font-cinzel text-sm sm:text-base font-black shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Crosshair className="w-5 h-5 shrink-0 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <div className="flex-1">
            <span>
              Phát súng Thợ Săn tiêu diệt <span className="text-amber-300 underline font-black">{deadFromHunter.length} người</span>: {deadFromHunter.map(p => `${p.name} (#${p.id})`).join(', ')}.
            </span>
          </div>
        </div>
      )}

      {/* CÁC MÔ TẢ CHI TIẾT */}
      {detailLogs.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {detailLogs.map((log, index) => (
            <div 
              key={index}
              className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 text-slate-200 text-xs sm:text-sm flex items-start gap-2"
            >
              {log.includes('🎯') ? (
                <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
