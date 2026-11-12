import React, { useState, useEffect } from 'react';
import { fetchRosters, saveRosterApi, deleteRosterApi } from '../services/api';
import { Users, Plus, Trash2, Check, X, ArrowRight, Clipboard, UserCheck, Edit3, AlertCircle } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function PlayerRosterModal({
  isOpen,
  onClose,
  currentPlayers,
  deckSize = 0,
  onApplyRoster
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  if (!isOpen) return null;

  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState(null);

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

  const handleOpenCreate = () => {
    setEditingRosterId(null);
    setRosterName('');
    setRawNamesText('');
    setIsCreating(true);
  };

  const handleStartEdit = (roster, e) => {
    if (e) e.stopPropagation();
    setEditingRosterId(roster.id);
    setRosterName(roster.name || '');
    setRawNamesText((roster.playerNames || []).join('\n'));
    setIsCreating(true);
  };

  const handleSaveRoster = async (e) => {
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
        message: 'Vui lòng nhập danh sách tên người chơi.',
        variant: 'warning'
      });
      return;
    }

    // User Rule: số tên điền phải ăn theo số thẻ bài
    if (deckSize > 0 && parsedNames.length !== deckSize) {
      showAlert({
        title: 'SỐ LƯỢNG NGƯỜI CHƠI KHÔNG KHỚP',
        message: `Số tên bạn đã điền là ${parsedNames.length} người, nhưng bộ bài hiện tại có đúng ${deckSize} lá bài!\nVui lòng điền đủ ${deckSize} người chơi để khớp với bộ bài.`,
        variant: 'warning'
      });
      return;
    }

    const rosterData = {
      id: editingRosterId || `roster-${Date.now()}`,
      name: rosterName.trim(),
      playerNames: parsedNames
    };

    try {
      await saveRosterApi(rosterData);
      await loadRosters();
      setIsCreating(false);
      setEditingRosterId(null);
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

  const handleApply = (roster) => {
    if (deckSize > 0 && roster.playerNames.length !== deckSize) {
      showAlert({
        title: 'SỐ LƯỢNG KHÔNG KHỚP VỚI BỘ BÀI',
        message: `Nhóm "${roster.name}" có ${roster.playerNames.length} người, trong khi bộ bài hiện tại yêu cầu đúng ${deckSize} lá bài!\nVui lòng bấm nút "Sửa" ở nhóm này để chỉnh cho đủ ${deckSize} người trước khi áp dụng.`,
        variant: 'warning'
      });
      return;
    }
    onApplyRoster(roster);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407]/90 via-[#0d0204]/85 to-[#070102]/90 backdrop-blur-md border-2 border-rose-600/90 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 flex flex-col h-[85vh]">
        {/* Werewolf Claw Marks on Corners */}
        <div className="absolute -top-5 -right-5 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={120} color="#e11d48" />
        </div>
        <div className="absolute -bottom-6 -left-6 -rotate-45 opacity-50 pointer-events-none">
          <ClawMarks size={100} color="#be123c" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-3 sm:p-4 md:p-5 border-b border-rose-950/80 flex items-center justify-between gap-2 bg-gradient-to-r from-[#200508]/90 via-[#100204]/80 to-transparent">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-center text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.6)] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-cinzel font-black text-sm sm:text-base md:text-xl text-rose-100 tracking-wider drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)] truncate">
                QUẢN LÝ NHÓM NGƯỜI CHƠI
              </h2>
              <p className="text-[11px] sm:text-xs text-rose-300/80 truncate hidden sm:block">
                Ghi nhớ tên người chơi theo nhóm để không cần nhập lại mỗi lần chơi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isCreating && (
              <GothicButton
                variant="witch"
                size="sm"
                icon={Plus}
                onClick={handleOpenCreate}
                className="h-8.5 px-2.5 sm:px-3 text-xs whitespace-nowrap shrink-0"
              >
                <span>Thêm Nhóm</span>
              </GothicButton>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {isCreating ? (
            /* CREATE / EDIT ROSTER FORM */
            <form onSubmit={handleSaveRoster} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-200">
                  {editingRosterId ? 'Chỉnh Sửa Nhóm Người Chơi' : 'Nhập Danh Sách Người Chơi Mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRosterId(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
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
                  placeholder="VD: Hội chơi Ma Sói Thứ Bảy, Nhóm Bạn Đại Học..."
                  value={rosterName}
                  onChange={(e) => setRosterName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block">
                      Danh Sách Tên Người Chơi ({parsedNames.length} người):
                    </label>
                    {deckSize > 0 && (
                      <span className="text-[11px] text-amber-400 font-medium">
                        (Bộ bài hiện tại yêu cầu đúng {deckSize} người chơi)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCurrentGameNames}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline font-medium cursor-pointer"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-400">
                      Xem trước ({parsedNames.length} người):
                    </span>
                    {deckSize > 0 && (
                      parsedNames.length === deckSize ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          ✓ Khớp đúng {deckSize} lá bài
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          ⚠️ Đang lệch {Math.abs(parsedNames.length - deckSize)} người (cần đúng {deckSize})
                        </span>
                      )
                    )}
                  </div>
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
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRosterId(null);
                  }}
                >
                  Hủy
                </GothicButton>
                <GothicButton
                  variant="witch"
                  size="sm"
                  type="submit"
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  <span>{editingRosterId ? 'Lưu Thay Đổi Nhóm' : 'Lưu Danh Sách Vào Neon DB'}</span>
                </GothicButton>
              </div>
            </form>
          ) : (
            /* ROSTERS LIST */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs text-slate-400">
                  Danh sách nhóm người chơi ({rosters.length}):
                </p>
                {deckSize > 0 && (
                  <span className="text-xs text-amber-400 font-medium">
                    (Bộ bài hiện tại: <strong>{deckSize} lá</strong>)
                  </span>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Đang tải danh sách người chơi từ Neon Postgres...
                </div>
              ) : rosters.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Chưa có nhóm người chơi nào được lưu.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {rosters.map(r => {
                    const isMatched = deckSize === 0 || r.playerNames.length === deckSize;

                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-2xl bg-[#141624] border transition-all flex flex-col justify-between shadow-lg ${
                          isMatched ? 'border-slate-800 hover:border-slate-700' : 'border-amber-900/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-sm text-slate-100">
                              {r.name}
                            </h4>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                              isMatched 
                                ? 'text-indigo-400 bg-indigo-950/80 border-indigo-800/40' 
                                : 'text-amber-400 bg-amber-950/80 border-amber-800/60'
                            }`}>
                              {r.playerNames.length} người
                            </span>
                          </div>

                          {/* Names preview */}
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 mb-2">
                            {r.playerNames.map((name, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                {name}
                              </span>
                            ))}
                          </div>

                          {!isMatched && (
                            <p className="text-[11px] text-amber-400/90 flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{r.playerNames.length}/{deckSize} người (Lệch số lượng)</span>
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-purple-950/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRoster(r.id, e)}
                              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Xóa nhóm này khỏi Neon DB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(r, e)}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Chỉnh sửa danh sách nhóm này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                          </div>

                          <GothicButton
                            variant={isMatched ? "witch" : "dark"}
                            size="sm"
                            onClick={() => handleApply(r)}
                          >
                            <span>Dùng Nhóm Này</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                          </GothicButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
