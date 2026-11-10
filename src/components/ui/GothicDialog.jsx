import React from 'react';
import { Skull, AlertTriangle, AlertCircle, HeartCrack, Flame, Check, X, ShieldAlert } from 'lucide-react';
import GothicModalContainer from './GothicModalContainer';
import GothicButton from './GothicButton';
import WolfHead from './WolfHead';

/**
 * Gothic Alert & Confirm Dialog Component
 * Thay thế hoàn toàn alert() và confirm() mặc định của browser
 * Giao diện Dark Horror Werewolf với biểu tượng Đầu Chó Sói và vết móng vuốt cào rách đỏ máu
 */
export default function GothicDialog({
  isOpen,
  onClose,
  type = 'confirm', // 'confirm' | 'alert'
  variant = 'blood', // 'blood' | 'warning' | 'tragedy' | 'info'
  title = 'XÁC NHẬN HÀNH ĐỘNG',
  message = '',
  confirmText = 'Xác Nhận 🩸',
  cancelText = 'Hủy Bỏ / Quay Lại',
  useWolfHeadIcon = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  // Determine icon & header style based on variant
  const getVariantConfig = () => {
    switch (variant) {
      case 'tragedy':
        return {
          icon: HeartCrack,
          iconColor: 'text-pink-400',
          titleColor: 'text-pink-200'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          titleColor: 'text-amber-200'
        };
      case 'info':
        return {
          icon: ShieldAlert,
          iconColor: 'text-purple-400',
          titleColor: 'text-purple-200'
        };
      case 'blood':
      default:
        return {
          icon: Skull,
          iconColor: 'text-rose-500',
          titleColor: 'text-rose-100'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <GothicModalContainer
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      icon={useWolfHeadIcon ? null : config.icon}
      useWolfHeadIcon={useWolfHeadIcon}
      iconColor={config.iconColor}
      maxWidth="max-w-md"
      showClawMarks={true}
      showWolfWatermark={true}
    >
      <div className="space-y-5 relative">
        {/* Message Content with Internal Wolf Glow */}
        <div className="relative p-4 rounded-2xl bg-black/70 border border-rose-950/90 text-sm leading-relaxed text-slate-200 whitespace-pre-line shadow-inner overflow-hidden">
          {/* Subtle Wolf Head Watermark behind text */}
          <div className="absolute -bottom-6 -right-6 opacity-[0.12] pointer-events-none select-none">
            <WolfHead size={140} eyeGlow={true} />
          </div>

          <div className="relative z-10 font-medium">
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {type === 'confirm' && (
            <GothicButton
              variant="dark"
              size="md"
              onClick={handleCancel}
              className="flex-1 sm:flex-initial"
            >
              <X className="w-4 h-4 mr-1 inline" />
              <span>{cancelText}</span>
            </GothicButton>
          )}

          <GothicButton
            variant={variant === 'blood' ? 'blood' : variant === 'tragedy' ? 'blood' : 'witch'}
            size="md"
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial shadow-[0_0_20px_rgba(225,29,72,0.6)]"
          >
            <Check className="w-4 h-4 mr-1 inline" />
            <span>{confirmText}</span>
          </GothicButton>
        </div>
      </div>
    </GothicModalContainer>
  );
}
