import React from 'react';
import { Moon } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import triggerHaptic from '../../utils/haptics';

export default function DayNightTransition({
  pendingHunterShot,
  pendingAvengerShot,
  sheriffDead,
  sheriff,
  hasLynchedToday,
  onOpenHunterModal,
  onOpenAvengerModal,
  onOpenSheriffModal,
  onAdvanceToNight,
  showAlert,
  showConfirm
}) {
  const handleTransition = () => {
    if (pendingHunterShot) {
      triggerHaptic('error');
      showAlert({
        title: 'THỢ SĂN CHƯA BẮN!',
        message: `Thợ Săn (${pendingHunterShot.hunterName}) đã ngã xuống nhưng chưa thực hiện phát súng cuối cùng.\n\nVui lòng giải quyết phát súng hoặc bấm Bỏ Qua trước khi sang đêm.`,
        variant: 'warning'
      });
      if (onOpenHunterModal) onOpenHunterModal();
      return;
    }

    if (pendingAvengerShot) {
      triggerHaptic('error');
      showAlert({
        title: 'KẺ BÁO THÙ CHƯA CHỈ ĐIỂM!',
        message: `Kẻ Báo Thù (${pendingAvengerShot.avengerName}) đã ngã xuống nhưng chưa kích hoạt chỉ điểm trả thù.\n\nVui lòng giải quyết báo thù hoặc bấm Bỏ Qua trước khi sang đêm.`,
        variant: 'warning'
      });
      if (onOpenAvengerModal) onOpenAvengerModal();
      return;
    }

    if (sheriffDead) {
      triggerHaptic('error');
      if (onOpenSheriffModal) {
        onOpenSheriffModal(sheriff, true);
      }
      return;
    }

    if (!hasLynchedToday && typeof showConfirm === 'function') {
      showConfirm({
        title: 'HÔM NAY CHƯA TREO CỔ AI!',
        message: 'Làng chưa thực hiện biểu quyết treo cổ người chơi nào hôm nay.\n\nBạn có chắc chắn muốn kết thúc ngày và chuyển sang ban đêm tiếp theo không?',
        variant: 'warning',
        confirmText: 'Vào Ban Đêm ➔',
        cancelText: 'Quay Lại Biểu Quyết',
        onConfirm: () => {
          onAdvanceToNight();
        }
      });
      return;
    }

    onAdvanceToNight();
  };

  return (
    <div className="flex justify-center pt-2 pb-6">
      <GothicButton
        variant={hasLynchedToday ? 'witch' : 'secondary'}
        size={hasLynchedToday ? 'lg' : 'md'}
        icon={Moon}
        onClick={handleTransition}
        className={hasLynchedToday ? 'shadow-2xl shadow-purple-950/80' : 'opacity-90'}
      >
        <span>Hết ngày ➔ Ban đêm</span>
      </GothicButton>
    </div>
  );
}
