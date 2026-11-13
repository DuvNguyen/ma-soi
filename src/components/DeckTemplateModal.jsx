import React, { useState, useEffect } from 'react';
import { ROLES } from '../data/roles';
import { DEFAULT_PLAYER_NAMES } from '../data/defaultPlayers';
import { fetchTemplates, saveTemplateApi, deleteTemplateApi, setDefaultTemplateApi } from '../services/api';
import { Layers, Plus, Trash2, Check, X, Sparkles, Shield, Eye, Skull, ArrowRight, Edit3, Search, Star } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import WolfIcon from './ui/WolfIcon';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function DeckTemplateModal({
  isOpen,
  onClose,
  currentDeckRoleIds = [],
  onApplyTemplate
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  if (!isOpen) return null;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // New/Edit template form state
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

  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setCustomNamesText('');
    setRoleCounts({
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
    setIsCreating(true);
  };

  const handleStartEditTemplate = (tpl, e) => {
    e.stopPropagation();
    setEditingTemplateId(tpl.id);
    setNewTemplateName(tpl.name || '');
    setNewTemplateDesc(tpl.desc || '');
    setCustomNamesText((tpl.playerNames || []).join('\n'));

    // Count roles from tpl.roleIds
    const counts = {};
    (tpl.roleIds || []).forEach(rId => {
      counts[rId] = (counts[rId] || 0) + 1;
    });
    setRoleCounts(counts);
    setIsCreating(true);
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

    const templateToSave = {
      id: editingTemplateId || `template-${Date.now()}`,
      name: newTemplateName.trim(),
      desc: newTemplateDesc.trim() || `${totalCards} lá bài tự chọn (${totalCards} người chơi)`,
      playerCount: totalCards,
      roleIds: roleIds,
      playerNames: playerNames
    };

    try {
      await saveTemplateApi(templateToSave);
      await loadTemplates();
      setIsCreating(false);
      setEditingTemplateId(null);
      setNewTemplateName('');
      setNewTemplateDesc('');
      setCustomNamesText('');
    } catch (err) {
      showAlert({
        title: 'LỖI LƯU BỘ BÀI',
        message: 'Không thể lưu template vào Neon DB: ' + err.message,
        variant: 'blood'
      });
    }
  };

  const handleSetDefaultTemplate = async (id, e) => {
    e.stopPropagation();
    try {
      await setDefaultTemplateApi(id);
      setTemplates(prev => prev.map(t => ({
        ...t,
        isDefault: t.id === id
      })));
    } catch (err) {
      console.error('Failed to set default template:', err);
      showAlert({
        title: 'LỖI CẬP NHẬT',
        message: err.message || 'Không thể đặt bộ bài mặc định.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407]/90 via-[#0d0204]/85 to-[#070102]/90 backdrop-blur-md border-2 border-rose-600/90 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 flex flex-col h-[90vh]">
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
        <div className="relative z-10 p-3 sm:p-4 md:p-5 border-b border-rose-950/80 flex items-center justify-between gap-2 bg-gradient-to-r from-[#22060a]/90 via-[#120306]/80 to-transparent">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-center text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.6)] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-cinzel font-black text-sm sm:text-base md:text-xl text-rose-100 tracking-wider drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)] truncate">
                QUẢN LÝ BỘ BÀI & TEMPLATE
              </h2>
              <p className="text-[11px] sm:text-xs text-rose-300/80 truncate hidden sm:block">
                Lưu trữ các mẫu bộ bài tùy chỉnh theo số lượng người chơi
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
                <span>Tạo Mới</span>
              </GothicButton>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isCreating ? (
            /* CREATE / EDIT CUSTOM DECK TEMPLATE FORM */
            <form onSubmit={handleSaveNewTemplate} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                  {editingTemplateId ? (
                    <>
                      <Edit3 className="w-4 h-4 text-purple-400" />
                      Chỉnh Sửa Bộ Bài Template
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Soạn Bộ Bài Tùy Chỉnh Mới
                    </>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTemplateId(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
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
                  <span className="text-rose-400 flex items-center gap-1"><WolfIcon className="w-3.5 h-3.5" /> {wolfCount} Sói</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400">👨‍🌾 {totalCards - wolfCount} Dân / Khác</span>
                </div>
              </div>

              {/* Card Pickers Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chọn Số Lượng Từng Lá Bài:
                  </label>
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      placeholder="Tìm vai..."
                      className="w-28 sm:w-36 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {ROLES.filter(r => (!roleSearchQuery || r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())) && r.isPlayableDeckCard !== false && !r.isAppointedTitle && r.id !== 'canh-sat-truong' && r.id !== 'canh-sat-characters').map(role => {
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
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTemplateId(null);
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
                  {editingTemplateId ? 'Lưu Thay Đổi Bộ Bài' : `Lưu Template Vào Neon DB (${totalCards} Người)`}
                </GothicButton>
              </div>
            </form>
          ) : (
            /* TEMPLATES LIST */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Chọn một template bộ bài để bắt đầu chơi ngay lập tức:
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm bộ bài..."
                      className="w-32 sm:w-44 text-xs py-1 pl-7 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <span className="text-xs text-amber-400 font-semibold whitespace-nowrap">
                    {templates.length} bộ bài
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Đang tải danh sách bộ bài từ Neon Postgres...
                </div>
              ) : templates.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Chưa có bộ bài mẫu nào
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {templates
                    .filter(tpl => !searchQuery || tpl.name?.toLowerCase().includes(searchQuery.toLowerCase()) || tpl.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(tpl => {
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
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors">
                                  {tpl.name}
                                </h4>
                                {tpl.isDefault && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-600/60 px-1.5 py-0.5 rounded shrink-0">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    Mặc định
                                  </span>
                                )}
                              </div>
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
                            <span className="text-rose-400 flex items-center gap-1"><WolfIcon className="w-3.5 h-3.5" /> {wolfs} Sói</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-blue-400">👨‍🌾 {villagers} Dân</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-purple-400">✨ {tpl.playerCount - wolfs - villagers} Đặc biệt</span>
                          </div>

                          {/* Group duplicate roles: hiển thị Dân Làng x4 thay vì lặp lại 4 lần */}
                          {(() => {
                            const countsMap = {};
                            (tpl.roleIds || []).forEach(rId => {
                              countsMap[rId] = (countsMap[rId] || 0) + 1;
                            });

                            const grouped = Object.entries(countsMap).map(([rId, count]) => {
                              const r = ROLES.find(x => x.id === rId);
                              return {
                                id: rId,
                                name: r?.name || rId,
                                teamCode: r?.teamCode || 'V',
                                count
                              };
                            }).sort((a, b) => {
                              if (a.teamCode === 'W' && b.teamCode !== 'W') return -1;
                              if (a.teamCode !== 'W' && b.teamCode === 'W') return 1;
                              return 0;
                            });

                            return (
                              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                {grouped.map(item => (
                                  <span
                                    key={item.id}
                                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                                      item.teamCode === 'W'
                                        ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                                        : item.teamCode === '3'
                                        ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                                        : 'bg-slate-900 border-slate-800 text-slate-300'
                                    }`}
                                  >
                                    <span>{item.name}</span>
                                    {item.count > 1 && (
                                      <span className="font-bold text-amber-300 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-700/50 text-[9px]">
                                        x{item.count}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-purple-950/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleSetDefaultTemplate(tpl.id, e)}
                              className={`text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                                tpl.isDefault ? 'text-amber-400 font-semibold' : 'text-slate-500 hover:text-amber-300'
                              }`}
                              title={tpl.isDefault ? 'Bộ bài mặc định' : 'Đặt làm bộ bài mặc định'}
                            >
                              <Star className={`w-3.5 h-3.5 ${tpl.isDefault ? 'fill-amber-400 text-amber-400' : ''}`} />
                              <span>{tpl.isDefault ? 'Mặc định' : 'Đặt mặc định'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Xóa bộ bài khỏi Neon DB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleStartEditTemplate(tpl, e)}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Chỉnh sửa cấu hình bộ bài này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                          </div>

                          {(() => {
                            const activeTplId = (() => {
                              try {
                                return localStorage.getItem('werewolf_active_template_id');
                              } catch (e) {
                                return null;
                              }
                            })();

                            const isRoleIdsMatch = Array.isArray(currentDeckRoleIds) && currentDeckRoleIds.length > 0 &&
                              [...tpl.roleIds].sort().join(',') === [...currentDeckRoleIds].sort().join(',');

                            const isCurrent = (activeTplId && activeTplId === tpl.id) || isRoleIdsMatch;

                            if (isCurrent) {
                              return (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Đang Dùng</span>
                                </div>
                              );
                            }

                            return (
                              <GothicButton
                                variant="witch"
                                size="sm"
                                onClick={() => {
                                  try {
                                    localStorage.setItem('werewolf_active_template_id', tpl.id);
                                  } catch (e) {}
                                  onApplyTemplate(tpl);
                                  onClose();
                                }}
                              >
                                <span>Chọn Bộ Bài Này</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                              </GothicButton>
                            );
                          })()}
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
