import React, { useState, useEffect } from 'react';
import { fetchRosters, saveRosterApi, deleteRosterApi } from '../services/api';
import { Users, Plus, Trash2, Check, X, ArrowRight, Clipboard, UserCheck } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function PlayerRosterModal({
  isOpen,
  onClose,
  currentPlayers,
  onApplyRoster
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  if (!isOpen) return null;

  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [rosterName, setRosterName] = useState('');
  const [rawNamesText, setRawNamesText] = useState('');

  useEffect(() => {
    loadRosters();
  }, []);

  const loadRosters = async () => {
    setLoading(true);
    const data = await fetchRosters();
    setRosters(data || []);
    setLoading(false);
  };

  const parsedNames = rawNamesText
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const handleCreateRoster = async (e) => {
    e.preventDefault();
    if (!rosterName.trim()) {
      showAlert({
        title: 'THIẾU TÊN NHÓM',
        message: 'Vui lòng nhập tên nhóm người chơi trước khi lưu.',
        variant: 'warning'
      });
      return;
    }
    if (parsedNames.length === 0) {
      showAlert({
        title: 'DANH SÁCH TRỐNG',
        message: 'Vui lòng nhập ít nhất 1 tên người chơi.',
        variant: 'warning'
      });
      return;
    }

    const newRoster = {
      id: `roster-${Date.now()}`,
      name: rosterName.trim(),
      playerNames: parsedNames
    };

    try {
      await saveRosterApi(newRoster);
      await loadRosters();
      setIsCreating(false);
      setRosterName('');
      setRawNamesText('');
    } catch (err) {
      showAlert({
        title: 'LỖI LƯU NHÓM',
        message: 'Không thể lưu danh sách người chơi: ' + err.message,
        variant: 'blood'
      });
    }
  };

  const handleDeleteRoster = async (id, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'XÓA NHÓM NGƯỜI CHƠI?',
      message: 'Bạn có chắc muốn xóa nhóm người chơi này khỏi cơ sở dữ liệu?',
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        try {
          await deleteRosterApi(id);
          setRosters(prev => prev.filter(r => r.id !== id));
        } catch (err) {
          showAlert({
            title: 'LỖI XÓA NHÓM',
            message: 'Không thể xóa: ' + err.message,
            variant: 'blood'
          });
        }
      }
    });
  };

  // Copy current names from active game
  const handleCopyCurrentGameNames = () => {
    const names = currentPlayers.map(p => p.name).join('\n');
    setRawNamesText(names);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407] via-[#0d0204] to-[#070102] border-2 border-rose-600/90 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 flex flex-col h-[85vh]">
        {/* Werewolf Claw Marks on Corners */}
        <div className="absolute -top-5 -right-5 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={120} color="#e11d48" />
        </div>
        <div className="absolute -bottom-6 -left-6 -rotate-45 opacity-50 pointer-events-none">
          <ClawMarks size={100} color="#be123c" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-4 md:p-5 border-b border-rose-950/80 flex items-center justify-between bg-gradient-to-r from-[#200508]/90 via-[#100204]/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-center text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-lg md:text-xl text-rose-100 tracking-wider drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)]">
                LƯU TRỮ DANH SÁCH NGƯỜI CHƠI (NEON CLOUD)
              </h2>
              <p className="text-xs text-rose-300/80">
                Ghi nhớ tên người chơi theo nhóm để không cần nhập lại mỗi lần chơi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <GothicButton
                variant="witch"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreating(true)}
              >
                Thêm Nhóm Mới
              </GothicButton>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isCreating ? (
            /* CREATE ROSTER FORM */
            <form onSubmit={handleCreateRoster} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-200">
                  Nhập Danh Sách Người Chơi Mới
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Quay lại danh sách
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Tên Nhóm / Buổi Chơi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hội chơi Ma Sói 14 người Thứ Bảy, Team Dev..."
                  value={rosterName}
                  onChange={(e) => setRosterName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Danh Sách Tên Người Chơi ({parsedNames.length} người):
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyCurrentGameNames}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline font-medium"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Lấy tên từ ván chơi hiện tại
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Nhập tên người chơi, mỗi tên trên một dòng hoặc cách nhau bằng dấu phẩy:
Ví dụ:
Ngọc, Hoàng, Minh, Linh, Tuấn, Hương, Đạt, Phương, Quân, Trang, Việt, Anh, Long, Duy"
                  value={rawNamesText}
                  onChange={(e) => setRawNamesText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Có thể dán trực tiếp danh sách tên từ Messenger / Zalo / Excel.
                </p>
              </div>

              {/* Preview Chips */}
              {parsedNames.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1.5">
                    Xem trước ({parsedNames.length} người):
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 max-h-28 overflow-y-auto">
                    {parsedNames.map((name, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/70 text-indigo-200 border border-indigo-800/60 font-medium"
                      >
                        {idx + 1}. {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <GothicButton
                  variant="dark"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreating(false)}
                >
                  Hủy
                </GothicButton>
                <GothicButton
                  variant="witch"
                  size="sm"
                  type="submit"
                >
                  Lưu Danh Sách Vào Neon DB
                </GothicButton>
              </div>
            </form>
          ) : (
            /* ROSTERS LIST */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Chọn một nhóm người chơi đã lưu để tự động gán tên vào bàn:
                </p>
                <span className="text-xs text-indigo-400 font-semibold">
                  {rosters.length} nhóm đã lưu
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Đang tải danh sách người chơi từ Neon Postgres...
                </div>
              ) : rosters.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Chưa có nhóm người chơi nào được lưu. Bấm "Thêm Nhóm Mới" ở góc phải để tạo!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {rosters.map(r => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-[#141624] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm text-slate-100">
                            {r.name}
                          </h4>
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800/40">
                            {r.playerNames.length} người
                          </span>
                        </div>

                        {/* Names preview */}
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {r.playerNames.map((name, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-purple-950/60 flex items-center justify-between">
                        <button
                          onClick={(e) => handleDeleteRoster(r.id, e)}
                          className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>

                        <GothicButton
                          variant="witch"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => {
                            onApplyRoster(r);
                            onClose();
                          }}
                        >
                          <span>Dùng Nhóm Này ({r.playerNames.length} Người)</span>
                        </GothicButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
