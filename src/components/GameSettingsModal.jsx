import React, { useState, useEffect } from 'react';
import { Settings, Shield, Skull, Check, X, AlertTriangle, RefreshCw, Database, Smartphone, Share2, PlusSquare } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import ClawMarks from './ui/ClawMarks';
import WolfIcon from './ui/WolfIcon';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function GameSettingsModal({
  isOpen,
  onClose,
  canWolvesKillTeammates,
  onToggleWolvesKillTeammates
}) {
  const { showConfirm } = useGothicDialog();
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running as iOS Standalone PWA
    const isRunningStandalone = 
      window.navigator.standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(Boolean(isRunningStandalone));
  }, []);

  if (!isOpen) return null;

  const handleToggle = () => {
    const nextState = !canWolvesKillTeammates;
    showConfirm({
      title: 'THIẾT LẬP VÁN CHƠI MỚI?',
      message: `Bạn đang ${nextState ? 'BẬT' : 'TẮT'} luật:\n"Ma Sói Có Thể Cắn Đồng Loại".\n\n⚠️ Theo quy định, mỗi lần thay đổi luật này hệ thống sẽ đặt lại bàn và bắt đầu ván chơi mới từ Đêm 1.\nBạn có chắc chắn muốn áp dụng và bắt đầu game mới?`,
      variant: 'warning',
      confirmText: nextState ? 'Bật Luật & Chơi Game Mới 🐺' : 'Tắt Luật & Chơi Game Mới',
      cancelText: 'Hủy Bỏ',
      onConfirm: () => {
        onToggleWolvesKillTeammates(nextState);
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407]/95 via-[#0d0204]/90 to-[#070102]/95 backdrop-blur-md border-2 border-purple-600/90 rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(168,85,247,0.4)] ring-1 ring-purple-500/50 overflow-hidden">
        {/* Werewolf Claw Marks */}
        <div className="absolute -top-6 -right-6 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={120} color="#a855f7" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-purple-950/80 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500 flex items-center justify-center text-purple-200 shadow-md">
              <Settings className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-cinzel font-black text-base sm:text-xl text-slate-100">
                CÀI ĐẶT LUẬT CHƠI & HỆ THỐNG
              </h3>
              <p className="text-xs text-purple-300/80">
                Tùy chỉnh quy tắc ván đấu và lưu giữ trạng thái
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* RULE TOGGLE: WEREWOLVES CAN BITE TEAMMATES */}
          <div className="p-4 rounded-2xl bg-[#141624] border border-purple-900/70 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0 mt-0.5">
                  <WolfIcon className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Ma Sói Có Thể Cắn Đồng Loại</span>
                    {canWolvesKillTeammates ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300">
                        Đang Bật
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                        Đang Tắt
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Cho phép bầy Ma Sói thống nhất cắn chính đồng bọn trong đêm để lừa Tiên Tri, hoặc loại bỏ đồng bọn khi bị nghi ngờ.
                  </p>
                </div>
              </div>

              {/* iOS-style toggle switch */}
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  canWolvesKillTeammates ? 'bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.6)]' : 'bg-slate-800'
                }`}
                title="Bấm để bật/tắt luật này"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    canWolvesKillTeammates ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300/90 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lưu ý: Mỗi lần bật/tắt luật này sẽ đặt lại bàn và bắt đầu một ván chơi mới.</span>
            </div>
          </div>

          {/* SYSTEM AUTO SAVE STATE STATUS CARD */}
          <div className="p-4 rounded-2xl bg-[#141624] border border-purple-900/70 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                  <Database className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">
                    Lưu Trữ State Game Tự Động
                  </h4>
                  <p className="text-xs text-slate-400">
                    Bảo toàn 100% dữ liệu ván đấu khi F5 / tải lại trang
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hoạt Động</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pl-12">
              Mọi hành động (gán vai, cắn mồi, bảo vệ, treo cổ, nhật ký chặng) được lưu trữ tức thì vào <strong>LocalStorage</strong> và đồng bộ lên <strong>Neon PostgreSQL Cloud</strong>.
            </p>
          </div>

          {/* IPHONE PWA APP INSTALLATION CARD */}
          <div className="p-4 rounded-2xl bg-[#141624] border border-purple-900/70 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                  <Smartphone className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Ứng Dụng PWA Cho iPhone (iOS)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cài vào màn hình chính để dùng toàn màn hình, mượt mà như App Store
                  </p>
                </div>
              </div>

              {isStandalone ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã Cài Đặt</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowIosGuide(!showIosGuide)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-600 text-purple-200 transition-all cursor-pointer"
                >
                  {showIosGuide ? 'Thu Gọn' : 'Xem Hướng Dẫn'}
                </button>
              )}
            </div>

            {(!isStandalone || showIosGuide) && (
              <div className="pt-2 border-t border-purple-950/60 space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 space-y-2">
                  <div className="font-bold text-purple-200 flex items-center gap-1.5">
                    <span>Cách thêm vào màn hình chính iPhone (3 bước):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                    <li>
                      Mở trang web này bằng trình duyệt <strong>Safari</strong> trên iPhone.
                    </li>
                    <li className="flex items-center gap-1.5 flex-wrap">
                      <span>Bấm nút <strong>Chia sẻ</strong> (biểu tượng</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-mono"><Share2 className="w-3 h-3 inline mr-1" /> Share</span>
                      <span>ở thanh công cụ Safari dưới cùng).</span>
                    </li>
                    <li className="flex items-center gap-1.5 flex-wrap">
                      <span>Cuộn xuống và chọn</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-300 text-[11px] font-bold"><PlusSquare className="w-3 h-3 inline mr-1 text-purple-400" /> Thêm vào MH chính</span>
                      <span>(Add to Home Screen).</span>
                    </li>
                  </ol>
                  <p className="text-[11px] text-emerald-400/90 italic pt-1">
                    ✓ Sau khi thêm, icon Ma Sói sẽ xuất hiện ngoài màn hình iPhone. Mở lên sẽ chạy toàn màn hình, không có thanh URL Safari, chạy mượt mà offline!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-purple-950 bg-[#0d0e19] flex justify-end">
          <GothicButton variant="witch" size="sm" onClick={onClose}>
            Đóng Cài Đặt
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
