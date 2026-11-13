import React from 'react';
import { Moon } from 'lucide-react';
import GothicButton from '../ui/GothicButton';
import triggerHaptic from '../../utils/haptics';

export default function DayNightTransition({
  pendingHunterShot,
  sheriffDead,
  sheriff,
  onOpenHunterModal,
  onOpenSheriffModal,
  onAdvanceToNight,
  showAlert
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

    if (sheriffDead) {
      triggerHaptic('error');
      if (onOpenSheriffModal) {
        onOpenSheriffModal(sheriff, true);
      }
      return;
    }

    onAdvanceToNight();
  };

  return (
    <div className="flex justify-center pt-2 pb-6">
      <GothicButton
        variant="witch"
        size="lg"
        icon={Moon}
        onClick={handleTransition}
        className="shadow-2xl shadow-purple-950/80"
      >
        <span>Hết ngày ➔ Ban đêm</span>
      </GothicButton>
    </div>
  );
}
