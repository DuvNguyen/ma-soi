import React from 'react';
import { Swords } from 'lucide-react';

export default function DayAvengerBanner({
  pendingAvengerShot,
  onOpenAvengerModal,
  onSkipAvengerShot
}) {
  if (!pendingAvengerShot) return null;

  const factionName = pendingAvengerShot.avengerFaction === 'V'
    ? 'Phe Dân Làng'
    : pendingAvengerShot.avengerFaction === 'W'
    ? 'Phe Ma Sói'
    : 'Chưa rõ';

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#26050a] to-[#120205] border-2 border-rose-500 text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-rose-900/60 border border-rose-500 flex items-center justify-center shrink-0">
          <Swords className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <div className="font-cinzel font-black text-sm text-rose-100 flex items-center gap-2">
            <span>KẺ BÁO THÙ KÍCH HOẠT HẬN THÙ</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 font-sans font-bold">
              Tôn thờ: {factionName}
            </span>
          </div>
          <p className="text-xs text-rose-300/80">
            Kẻ Báo Thù ({pendingAvengerShot.avengerName}) ngã xuống và được quyền chỉ định 1 người trả thù.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenAvengerModal}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Chỉ Điểm Báo Thù 🗡️</span>
        </button>
        <button
          type="button"
          onClick={onSkipAvengerShot}
          className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-rose-400 hover:text-white border border-rose-800 text-xs font-semibold transition-all cursor-pointer"
        >
          Bỏ Qua
        </button>
      </div>
    </div>
  );
}
