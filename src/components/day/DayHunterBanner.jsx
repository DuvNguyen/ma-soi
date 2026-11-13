import React from 'react';
import { Crosshair } from 'lucide-react';

export default function DayHunterBanner({
  pendingHunterShot,
  onOpenHunterModal,
  onSkipHunterShot
}) {
  if (!pendingHunterShot) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#261205] to-[#120802] border-2 border-amber-500 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-900/60 border border-amber-500 flex items-center justify-center shrink-0">
          <Crosshair className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="font-cinzel font-black text-sm text-amber-100 flex items-center gap-2">
            <span>PHÁT SÚNG THỢ SĂN ĐANG CHỜ</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-600 text-amber-300 font-sans font-bold">
              Bắt buộc
            </span>
          </div>
          <p className="text-xs text-amber-300/80">
            Thợ Săn ({pendingHunterShot.hunterName}) ngã xuống và đang chờ bắn 1 người trước khi sang đêm.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenHunterModal}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Chọn Mục Tiêu Bắn 🎯</span>
        </button>
        <button
          type="button"
          onClick={onSkipHunterShot}
          className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-amber-400 hover:text-white border border-amber-800 text-xs font-semibold transition-all cursor-pointer"
        >
          Bỏ Qua
        </button>
      </div>
    </div>
  );
}
