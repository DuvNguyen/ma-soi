import React, { useState, useEffect } from 'react';
import { ROLES } from '../data/roles';
import { DEFAULT_PLAYER_NAMES } from '../data/defaultPlayers';
import { fetchTemplates, saveTemplateApi, deleteTemplateApi } from '../services/api';
import { Layers, Plus, Trash2, Check, X, Sparkles, Shield, Eye, Skull, ArrowRight } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function DeckTemplateModal({
  isOpen,
  onClose,
  onApplyTemplate
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  if (!isOpen) return null;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [customNamesText, setCustomNamesText] = useState('');
  // Map of roleId -> count
  const [roleCounts, setRoleCounts] = useState({
    'dan-lang': 4,
    'soi-thuong': 2,
    'nua-nguoi-nua-soi': 1,
    'tien-tri': 1,
    'bao-ve': 1,
    'phu-thuy': 1,
    'tho-san': 1,
    'cupid': 1,
    'gia-lang': 1,
    'thang-ngoc': 1
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await fetchTemplates();
    setTemplates(data || []);
    setLoading(false);
  };

  const updateRoleCount = (roleId, delta) => {
    setRoleCounts(prev => {
      const current = prev[roleId] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[roleId];
      } else {
        copy[roleId] = next;
      }
      return copy;
    });
  };

  // Convert roleCounts to flattened roleIds array
  const getFlattenedRoleIds = () => {
    const ids = [];
    Object.entries(roleCounts).forEach(([roleId, count]) => {
      for (let i = 0; i < count; i++) ids.push(roleId);
    });
    return ids;
  };

  const totalCards = Object.values(roleCounts).reduce((a, b) => a + b, 0);

  const wolfCount = Object.entries(roleCounts).reduce((sum, [roleId, count]) => {
    const r = ROLES.find(x => x.id === roleId);
    return r?.teamCode === 'W' ? sum + count : sum;
  }, 0);

  const handleSaveNewTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      showAlert({
        title: 'THIẾU THÔNG TIN BỘ BÀI',
        message: 'Vui lòng nhập tên cho bộ bài template trước khi lưu.',
        variant: 'warning'
      });
      return;
    }
    const roleIds = getFlattenedRoleIds();
    if (roleIds.length === 0) {
      showAlert({
        title: 'BỘ BÀI ĐANG TRỐNG',
        message: 'Vui lòng chọn số lượng ít nhất 1 lá bài cho bộ bài.',
        variant: 'warning'
      });
      return;
    }

    const parsedNames = customNamesText
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const playerNames = parsedNames.length > 0
      ? parsedNames
      : DEFAULT_PLAYER_NAMES.slice(0, totalCards);

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      desc: newTemplateDesc.trim() || `${totalCards} lá bài tự chọn (${totalCards} người chơi)`,
      playerCount: totalCards,
      roleIds: roleIds,
      playerNames: playerNames
    };

    try {
      await saveTemplateApi(newTemplate);
      await loadTemplates();
      setIsCreating(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
    } catch (err) {
      showAlert({
        title: 'LỖI LƯU BỘ BÀI',
        message: 'Không thể lưu template vào Neon DB: ' + err.message,
        variant: 'blood'
      });
    }
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'XÓA BỘ BÀI KHỎI NEON DB?',
      message: 'Bạn có chắc muốn xóa vĩnh viễn template bộ bài này?\nHành động này không thể hoàn tác.',
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        try {
          await deleteTemplateApi(id);
          setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
          showAlert({
            title: 'LỖI XÓA BỘ BÀI',
            message: 'Không thể xóa template: ' + err.message,
            variant: 'blood'
          });
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407] via-[#0d0204] to-[#070102] border-2 border-rose-600/90 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 flex flex-col h-[90vh]">
        {/* Werewolf Claw Marks Decorations on Corners */}
        <div className="absolute -top-6 -right-6 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={130} color="#e11d48" />
        </div>
        <div className="absolute -bottom-8 -left-8 -rotate-45 opacity-50 pointer-events-none">
          <ClawMarks size={120} color="#be123c" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 p-4 md:p-5 border-b border-rose-950/80 flex items-center justify-between bg-gradient-to-r from-[#22060a]/90 via-[#120306]/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-center text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-lg md:text-xl text-rose-100 tracking-wider drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)]">
                QUẢN LÝ BỘ BÀI & TEMPLATE (NEON CLOUD)
              </h2>
              <p className="text-xs text-rose-300/80">
                Lưu trữ các mẫu bộ bài tùy chỉnh theo số lượng người chơi
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
                Tạo Bộ Bài Mới
              </GothicButton>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isCreating ? (
            /* CREATE CUSTOM DECK TEMPLATE FORM */
            <form onSubmit={handleSaveNewTemplate} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Soạn Bộ Bài Tùy Chỉnh Mới
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Quay lại danh sách
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Tên Bộ Bài:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Bàn 14 người (4 Dân, 2 Sói, 1 Sói nguyền...)"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Mô Tả / Ghi Chú:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nhóm thứ 7, nhiều vai trò kịch tính"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Total counter banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tổng số lá bài đã chọn:
                  </span>
                  <span className="text-2xl font-black font-cinzel text-amber-400">
                    {totalCards} lá
                  </span>
                </div>
                <div className="text-xs flex items-center gap-2 font-bold">
                  <span className="text-rose-400">🐺 {wolfCount} Sói</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400">👨‍🌾 {totalCards - wolfCount} Dân / Khác</span>
                </div>
              </div>

              {/* Card Pickers Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Chọn Số Lượng Từng Lá Bài:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {ROLES.map(role => {
                    const count = roleCounts[role.id] || 0;
                    const isWolf = role.teamCode === 'W';

                    return (
                      <div
                        key={role.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          count > 0
                            ? isWolf
                              ? 'bg-rose-950/40 border-rose-800/80 text-rose-100'
                              : 'bg-blue-950/40 border-blue-800/80 text-blue-100'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img
                            src={role.image}
                            alt=""
                            className="w-7 h-9 object-contain rounded shrink-0 bg-black/40"
                          />
                          <div className="truncate">
                            <div className="font-bold text-xs truncate">{role.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold truncate">
                              [{role.teamCode}] {role.team}
                            </div>
                          </div>
                        </div>

                        {/* +/- counter */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => updateRoleCount(role.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-amber-300">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateRoleCount(role.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player Names Input Section */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      👥 Danh Sách Tên Người Chơi Tương Ứng Bộ Bài:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Cần đúng <strong className="text-amber-400">{totalCards} người chơi</strong> cho {totalCards} lá bài
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = DEFAULT_PLAYER_NAMES.slice(0, totalCards).join('\n');
                      setCustomNamesText(sample);
                    }}
                    className="text-xs px-2.5 py-1 rounded-xl border border-purple-700/80 bg-purple-950/60 hover:bg-purple-900 text-purple-200 transition-all font-semibold cursor-pointer self-start sm:self-auto"
                  >
                    ⚡ Điền {totalCards} Tên Mẫu Tiếng Việt
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={customNamesText}
                  onChange={(e) => setCustomNamesText(e.target.value)}
                  placeholder="Nhập tên người chơi (mỗi người 1 dòng hoặc cách nhau dấu phẩy)... Nếu để trống sẽ tự động dùng danh sách tên chuẩn tiếng Việt."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Submit Button */}
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
                  Lưu Template Vào Neon DB ({totalCards} Người)
                </GothicButton>
              </div>
            </form>
          ) : (
            /* TEMPLATES LIST */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Chọn một template bộ bài để bắt đầu chơi ngay lập tức:
                </p>
                <span className="text-xs text-amber-400 font-semibold">
                  {templates.length} bộ bài đã lưu
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Đang tải danh sách bộ bài từ Neon Postgres...
                </div>
              ) : templates.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Chưa có template nào. Hãy bấm "Tạo Bộ Bài Mới" ở trên!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {templates.map(tpl => {
                    const rolesList = tpl.roleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
                    const wolfs = rolesList.filter(r => r.teamCode === 'W').length;
                    const villagers = rolesList.filter(r => r.teamCode === 'V').length;

                    return (
                      <div
                        key={tpl.id}
                        className="p-4 rounded-2xl bg-[#141624] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors">
                                {tpl.name}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                {tpl.desc}
                              </p>
                            </div>
                            <span className="font-cinzel font-black text-sm text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/40 shrink-0">
                              {tpl.playerCount} người
                            </span>
                          </div>

                          {/* Stats & Preview */}
                          <div className="flex items-center gap-2 text-xs mb-3 font-semibold">
                            <span className="text-rose-400">🐺 {wolfs} Sói</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-blue-400">👨‍🌾 {villagers} Dân</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-purple-400">✨ {tpl.playerCount - wolfs - villagers} Đặc biệt</span>
                          </div>

                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                            {tpl.roleIds.map((rId, i) => {
                              const r = ROLES.find(x => x.id === rId);
                              return (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                                >
                                  {r?.name || rId}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-purple-950/60 flex items-center justify-between">
                          <button
                            onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>

                          <GothicButton
                            variant="witch"
                            size="sm"
                            onClick={() => {
                              onApplyTemplate(tpl);
                              onClose();
                            }}
                          >
                            <span>Chọn Bộ Bài Này</span>
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
