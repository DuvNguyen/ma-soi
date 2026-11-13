import React from 'react';
import { Check } from 'lucide-react';
import WolfIcon from '../ui/WolfIcon';
import RoleClaimBox from '../RoleClaimBox';
import RoleHolderBanner from '../RoleHolderBanner';

export default function NightStepHeader({
  nightSteps,
  safeStepIdx,
  currentRole,
  isWolfStep,
  hasHolders,
  isSkipped,
  isRoleCursedOut,
  cursedHolder,
  stepValidation,
  roleHolders,
  isVillageCursed,
  players,
  deckRoleIds,
  onAssignRole,
  onAssignRoleToMultiple,
  onSkipRole,
  isWolfPlayer,
  changeStep,
  showConfirm,
  showAlert,
  onSelectSeerTarget,
  onSetShowAssignDropdown,
  cardRef
}) {
  return (
    <>
      {/* Stepper Progress Bar (Breadcrumbs) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {nightSteps.map((step, idx) => {
            const isCurrent = idx === safeStepIdx;
            const isPassed = idx < safeStepIdx;
            const isStepWolf = step.teamCode === 'W';
            return (
              <button
                key={`${step.id}-${idx}`}
                onClick={() => {
                  if (idx > safeStepIdx && !stepValidation.isValid) {
                    if (stepValidation.isStrictBlock) {
                      showAlert({
                        title: 'BẮT BUỘC GÁN ĐỦ MA SÓI!',
                        message: stepValidation.message,
                        variant: 'danger',
                        confirmText: 'Đã Hiểu & Đi Chọn Sói'
                      });
                      return;
                    }

                    showConfirm({
                      title: 'BỎ QUA BƯỚC ĐÊM BẮT BUỘC?',
                      message: `Bước hiện tại chưa hoàn thành:\n"${stepValidation.message}"\n\nBạn có chắc muốn bỏ qua để nhảy thẳng sang bước tiếp theo?`,
                      variant: 'warning',
                      confirmText: 'Bỏ Qua & Nhảy Bước',
                      cancelText: 'Ở Lại Hoàn Thành',
                      onConfirm: () => {
                        changeStep(idx);
                        if (onSelectSeerTarget) onSelectSeerTarget(null);
                        if (onSetShowAssignDropdown) onSetShowAssignDropdown(false);
                      }
                    });
                    return;
                  }
                  changeStep(idx);
                  if (onSelectSeerTarget) onSelectSeerTarget(null);
                  if (onSetShowAssignDropdown) onSetShowAssignDropdown(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isCurrent
                    ? isStepWolf
                      ? 'bg-gradient-to-r from-rose-900 to-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.5)] ring-1 ring-rose-400'
                      : 'bg-gradient-to-r from-purple-900 to-purple-950 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                    : isPassed
                    ? 'bg-[#0f111c] border-emerald-900/70 text-emerald-400'
                    : 'bg-[#0c0d16]/70 border-slate-800/80 text-slate-500 hover:text-slate-300'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span>{idx + 1}.</span>}
                <span className="truncate max-w-[120px]">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Hero Banner for current role */}
      <div className={`p-3 sm:p-4 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-between gap-3 backdrop-blur-sm ${
        isWolfStep
          ? 'bg-gradient-to-r from-[#2a0509]/85 via-[#150204]/80 to-[#250408]/85 border-rose-600/90 shadow-[0_0_25px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50'
          : 'bg-gradient-to-r from-[#170a2c]/80 via-[#0d0e19]/75 to-[#120822]/80 border-purple-900/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
      }`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Compact Card Thumbnail */}
          <div ref={cardRef} className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl overflow-hidden border p-1 shadow-lg flex items-center justify-center bg-black/80 shrink-0 ${
            isWolfStep ? 'border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'border-purple-500/80 shadow-[0_0_12px_rgba(147,51,234,0.4)]'
          }`}>
            {currentRole.image ? (
              <img
                src={currentRole.image}
                alt={currentRole.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-2xl flex items-center justify-center">
                {isWolfStep ? <WolfIcon className="w-8 h-8 text-rose-500" /> : '✨'}
              </div>
            )}
          </div>

          {/* Role Title + Team Badge + GM Prompt */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base sm:text-lg md:text-xl font-black font-cinzel leading-tight tracking-wider truncate ${
                isWolfStep ? 'text-rose-100 drop-shadow-[0_1px_10px_rgba(225,29,72,0.7)]' : 'text-slate-100'
              }`}>
                {currentRole.name}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border uppercase tracking-wider shrink-0 ${
                isWolfStep ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-purple-950 text-purple-300 border-purple-700'
              }`}>
                [{currentRole.teamCode}] {currentRole.team}
              </span>
            </div>
            {currentRole.gmCall && (
              <p className="text-[11px] sm:text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                "{currentRole.gmCall}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Role Assignment Banner */}
      {isWolfStep && !hasHolders && !isSkipped ? (
        <RoleClaimBox
          currentRole={currentRole}
          players={players}
          deckRoleIds={deckRoleIds}
          onAssignRole={onAssignRole}
          onAssignRoleToMultiple={onAssignRoleToMultiple}
          onSkipRole={null}
          isWolfStep={isWolfStep}
          isWolfPlayer={isWolfPlayer}
        />
      ) : (
        <RoleHolderBanner
          currentRole={currentRole}
          players={players}
          deckRoleIds={deckRoleIds}
          onAssignRole={onAssignRole}
          onSkipRole={isWolfStep ? null : onSkipRole}
          isWolfStep={isWolfStep}
          isWolfPlayer={isWolfPlayer}
        />
      )}

      {/* Alert Banners */}
      {isRoleCursedOut ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#230933] to-[#140620] border-2 border-purple-500/80 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)] space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5 font-cinzel font-black text-sm sm:text-base text-purple-100">
            <span className="text-xl">🔮⚡</span>
            <span>VAI TRÒ ĐÃ BỊ LOẠI KHỎI LÀNG (TRÚNG LỜI NGUYỀN)</span>
          </div>
          <div className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
            Người giữ vai ban đầu là <strong className="text-white">#{cursedHolder.id} {cursedHolder.name}</strong> đã bị Sói Nguyền đồng hóa thành <strong className="text-rose-300">Ma Sói ({currentRole.name} bị nguyền)</strong>. Toàn bộ năng lực của vai này đã bị loại bỏ vĩnh viễn và không gán cho người khác theo luật chơi.
          </div>
          <div className="p-3 rounded-xl bg-purple-950/90 border border-purple-700/60 text-xs text-amber-200 flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">🕯️</span>
            <div className="leading-relaxed">
              <strong>Quản trò:</strong> Đọc to <em>"{currentRole.gmCall}"</em> và dừng 3-5 giây để giữ bí mật danh tính.
            </div>
          </div>
        </div>
      ) : stepValidation.isDeadRole ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#1c0e1e] to-[#120817] border-2 border-rose-500/60 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.25)] space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5 font-cinzel font-black text-sm sm:text-base text-rose-300">
            <span className="text-xl">💀💤</span>
            <span>NGƯỜI GIỮ VAI ĐÃ HY SINH (GỌI CÓ LỆ THEO KỊCH BẢN)</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Người chơi giữ vai <strong className="text-white">{currentRole.name}</strong> ({roleHolders.map(p => `#${p.id} ${p.name}`).join(', ')}) đã qua đời. Theo luật Ma Sói, vai trò này <strong>không được thực hiện chức năng nữa</strong>.
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-amber-200 flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">🕯️</span>
            <div className="leading-relaxed">
              <strong>Quản trò:</strong> Đọc to <em>"{currentRole.gmCall}"</em> và dừng 3-5 giây để bảo mật ván đấu.
            </div>
          </div>
        </div>
      ) : isVillageCursed && ['bao-ve', 'tien-tri', 'phu-thuy', 'tho-san', 'hiep-si-kiem-gi'].includes(currentRole.id) ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#240810] to-[#16040a] border-2 border-red-500/80 text-rose-200 shadow-[0_0_30px_rgba(239,68,68,0.3)] space-y-3.5 animate-fade-in">
          <div className="flex items-center gap-2.5 font-cinzel font-black text-sm sm:text-base text-rose-300">
            <span className="text-xl">⚡💤</span>
            <span>GỌI CHO CÓ — PHÉP THUẬT ĐÃ MẤT (LỜI NGUYỀN GIÀ LÀNG)</span>
          </div>
          
          <div className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
            Già Làng đã bị chính phe Dân sát hại! Theo luật Ma Sói, toàn bộ năng lực đặc biệt của vai <strong className="text-white">{currentRole.name}</strong> ({roleHolders.map(p => `#${p.id} ${p.name}`).join(', ')}) đã bị <strong>phong ấn vĩnh viễn</strong>.
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-red-800/60 text-xs text-amber-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">📢</span>
              <div className="leading-relaxed">
                <strong>Khẩu lệnh Quản trò:</strong> Vẫn xướng to câu gọi <em>"{currentRole.gmCall}"</em> và đếm thầm 3-5 giây để bàn chơi và Ma Sói không nhận biết được vai này đã mất năng lực hay Già Làng đã chết.
              </div>
            </div>

            {currentRole.id === 'tien-tri' && (
              <div className="flex items-start gap-2.5 pt-2 border-t border-red-900/40 text-rose-300 text-[11px] leading-relaxed">
                <span className="text-sm shrink-0">🔮</span>
                <div>
                  <strong>Quy tắc Tiên Tri:</strong> Nếu người chơi chỉ tay đòi soi bài, Quản trò xem xong hãy <strong>lắc đầu</strong> hoặc ra dấu <strong>không có kết quả / mù mịt</strong> theo luật Già Làng.
                </div>
              </div>
            )}

            {currentRole.id === 'bao-ve' && (
              <div className="flex items-start gap-2.5 pt-2 border-t border-red-900/40 text-teal-300 text-[11px] leading-relaxed">
                <span className="text-sm shrink-0">🛡️</span>
                <div>
                  <strong>Quy tắc Bảo Vệ:</strong> Nếu Bảo Vệ chỉ tay chọn người bảo vệ đêm nay, Quản trò gật đầu như bình thường nhưng khiên bảo vệ <strong>hoàn toàn vô hiệu</strong> trong tính toán đêm.
                </div>
              </div>
            )}

            {currentRole.id === 'phu-thuy' && (
              <div className="flex items-start gap-2.5 pt-2 border-t border-red-900/40 text-purple-300 text-[11px] leading-relaxed">
                <span className="text-sm shrink-0">🧪</span>
                <div>
                  <strong>Quy tắc Phù Thủy:</strong> Quản trò vẫn ra hiệu nạn nhân bị cắn nhưng xua tay báo <strong>bình thuốc đã mất công hiệu</strong>; Phù Thủy không thể cứu hay đầu độc ai.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
