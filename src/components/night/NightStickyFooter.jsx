import React from 'react';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Skull } from 'lucide-react';
import GothicButton from '../ui/GothicButton';

export default function NightStickyFooter({
  safeStepIdx,
  isWolfStep,
  stepValidation,
  onPrevStep,
  onNextStep
}) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-2.5 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-[#0a0c16]/95 backdrop-blur-md border-t border-purple-900/80 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2">
      <GothicButton
        variant="dark"
        size="sm"
        disabled={safeStepIdx === 0}
        onClick={onPrevStep}
        icon={ChevronLeft}
        className="h-10 px-2.5 sm:px-3 text-xs shrink-0"
      >
        <span className="hidden sm:inline">Bước Trước</span>
      </GothicButton>

      {/* Validation Feedback in Middle */}
      <div className="flex-1 text-center truncate px-1 sm:px-2">
        {stepValidation.isDeadRole ? (
          <span className="text-[11px] text-rose-300 font-semibold flex items-center justify-center gap-1 truncate">
            <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0 inline" />
            <span className="truncate">{stepValidation.shortMessage || 'Người giữ vai đã chết'}</span>
          </span>
        ) : !stepValidation.isValid ? (
          <span className="text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1 truncate" title={stepValidation.message}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
            <span className="truncate">{stepValidation.shortMessage || stepValidation.message}</span>
          </span>
        ) : (
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1 truncate" title={stepValidation.message}>
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
            <span className="truncate">{stepValidation.shortMessage || stepValidation.message || 'Sẵn sàng tiếp tục'}</span>
          </span>
        )}
      </div>

      <GothicButton
        variant={isWolfStep ? 'blood' : 'witch'}
        size="sm"
        disabled={!stepValidation.isValid}
        onClick={() => onNextStep(false)}
        className="h-10 px-3 sm:px-4 text-xs font-black shrink-0 shadow-lg"
      >
        <span className="truncate">Đi Ngủ 💤</span>
        <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
      </GothicButton>
    </div>
  );
}
