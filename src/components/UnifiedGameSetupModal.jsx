import React, { useState, useEffect, useMemo } from 'react';
import { ROLES, PRESETS } from '../data/roles';
import { DEFAULT_PLAYER_NAMES } from '../data/defaultPlayers';
import { fetchTemplates, saveTemplateApi, deleteTemplateApi } from '../services/api';
import {
  Layers,
  Users,
  Plus,
  Minus,
  Trash2,
  X,
  Play,
  ArrowRight,
  Search,
  Check,
  CheckCircle2,
  AlertCircle,
  Edit3,
  SlidersHorizontal,
  Save,
  RotateCcw,
  Sparkles,
  Undo2
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';
import { useGothicDialog } from '../context/GothicDialogContext';
import triggerHaptic from '../utils/haptics';

export default function UnifiedGameSetupModal({
  isOpen,
  onClose,
  initialTab = 'deck',
  currentPlayers = [],
  currentDeckRoleIds = [],
  onApplyGameSetup,
  onApplyTemplate
}) {
  const { showConfirm, showAlert } = useGothicDialog();

  // Normalize initial tab: 'deck' (Tab 1: Bộ bài) or 'players' (Tab 2: Người chơi)
  const [activeTab, setActiveTab] = useState(() => {
    return initialTab === 'players' || initialTab === 'rosters' ? 'players' : 'deck';
  });

  // DB templates & loading
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deleted presets persisted in localStorage
  const [deletedPresetIds, setDeletedPresetIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('werewolf_deleted_presets') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Selected template & roles
  const [selectedTemplateId, setSelectedTemplateId] = useState('preset-9-11');
  const [selectedRoleIds, setSelectedRoleIds] = useState(() => {
    if (currentDeckRoleIds && currentDeckRoleIds.length > 0) {
      return [...currentDeckRoleIds];
    }
    return [...PRESETS[1].roleIds];
  });

  // Player names: STRICT 1:1 mapping with selectedRoleIds.length
  const [playerNames, setPlayerNames] = useState(() => {
    const targetCount = (currentDeckRoleIds && currentDeckRoleIds.length > 0)
      ? currentDeckRoleIds.length
      : PRESETS[1].roleIds.length;
    if (currentPlayers && currentPlayers.length >= targetCount) {
      return currentPlayers.slice(0, targetCount).map(p => p.name);
    }
    const baseNames = currentPlayers.map(p => p.name);
    return [...baseNames, ...DEFAULT_PLAYER_NAMES].slice(0, targetCount);
  });

  // Search & customizer states
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [showRoleCustomizer, setShowRoleCustomizer] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Bulk paste names tool state
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkNamesInput, setBulkNamesInput] = useState('');

  // Template creation/saving state
  const [isSavingAsNew, setIsSavingAsNew] = useState(false);
  const [newTemplateNameInput, setNewTemplateNameInput] = useState('');

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      loadTemplatesData();
      setActiveTab(initialTab === 'players' || initialTab === 'rosters' ? 'players' : 'deck');
    }
  }, [isOpen, initialTab]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadTemplatesData = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data || []);
    } catch (e) {
      console.error('Error fetching templates:', e);
    } finally {
      setLoading(false);
    }
  };

  // Combine Presets (excluding deleted ones) + Custom templates into one list
  const allTemplates = useMemo(() => {
    const formattedPresets = PRESETS
      .filter(p => !deletedPresetIds.includes(p.id))
      .map(p => ({
        ...p,
        isPreset: true,
        playerNames: DEFAULT_PLAYER_NAMES.slice(0, p.playerCount || p.roleIds.length)
      }));
    return [...(templates || []), ...formattedPresets];
  }, [templates, deletedPresetIds]);

  // Active template info
  const activeTemplate = useMemo(() => {
    return allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0] || null;
  }, [allTemplates, selectedTemplateId]);

  // Ensure playerNames strictly matches selectedRoleIds.length
  const syncNamesCount = (newRoleIds, baseNames = playerNames) => {
    const count = newRoleIds.length;
    if (baseNames.length === count) return baseNames;
    if (baseNames.length > count) {
      return baseNames.slice(0, count);
    }
    const extended = [...baseNames];
    for (let i = baseNames.length; i < count; i++) {
      extended.push(DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`);
    }
    return extended;
  };

  // Select a deck template
  const handleSelectTemplate = (template) => {
    triggerHaptic('light');
    setSelectedTemplateId(template.id);
    const newRoleIds = [...template.roleIds];
    setSelectedRoleIds(newRoleIds);

    let nextNames = [];
    if (template.playerNames && template.playerNames.length > 0) {
      nextNames = template.playerNames.slice(0, newRoleIds.length);
      while (nextNames.length < newRoleIds.length) {
        nextNames.push(DEFAULT_PLAYER_NAMES[nextNames.length] || `Người chơi ${nextNames.length + 1}`);
      }
    } else {
      nextNames = syncNamesCount(newRoleIds, playerNames);
    }
    setPlayerNames(nextNames);
  };

  // Modify roles in the selected deck: +1 or -1
  const handleModifyRoleCount = (roleId, delta) => {
    triggerHaptic('selection');
    if (delta > 0) {
      const updatedRoles = [...selectedRoleIds, roleId];
      setSelectedRoleIds(updatedRoles);
      setPlayerNames(syncNamesCount(updatedRoles, playerNames));
    } else {
      const idx = selectedRoleIds.lastIndexOf(roleId);
      if (idx !== -1) {
        const updatedRoles = selectedRoleIds.filter((_, i) => i !== idx);
        if (updatedRoles.length >= 4) {
          setSelectedRoleIds(updatedRoles);
          setPlayerNames(syncNamesCount(updatedRoles, playerNames));
        } else {
          showAlert({
            title: 'SỐ LƯỢNG QUÁ ÍT',
            message: 'Một ván chơi Ma Sói cần tối thiểu 4 người chơi.',
            variant: 'warning'
          });
        }
      }
    }
  };

  // Change individual slot name in Tab 2
  const handleSlotNameChange = (index, newName) => {
    setPlayerNames(prev => {
      const copy = [...prev];
      copy[index] = newName;
      return copy;
    });
  };

  // Live split lines for bulk paste with circle number badges
  const bulkLines = useMemo(() => {
    if (!bulkNamesInput) return [''];
    return bulkNamesInput.split('\n');
  }, [bulkNamesInput]);

  const validBulkLinesCount = useMemo(() => {
    return bulkLines.filter(s => s.trim().length > 0).length;
  }, [bulkLines]);

  // Bulk paste names in Tab 2
  const handleApplyBulkNames = () => {
    triggerHaptic('success');
    const parsed = bulkNamesInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      setShowBulkPaste(false);
      return;
    }

    const updated = [...playerNames];
    for (let i = 0; i < updated.length; i++) {
      if (parsed[i]) {
        updated[i] = parsed[i];
      }
    }
    setPlayerNames(updated);
    setShowBulkPaste(false);
    setBulkNamesInput('');
  };

  // Reset all names to defaults
  const handleResetNamesToDefault = () => {
    triggerHaptic('light');
    setPlayerNames(DEFAULT_PLAYER_NAMES.slice(0, selectedRoleIds.length));
  };

  // Save deck configuration and move to Tab 2 to add players
  const handleSaveAndGoToPlayers = async () => {
    triggerHaptic('success');
    if (activeTemplate && !activeTemplate.isPreset) {
      try {
        const updatedTemplate = {
          ...activeTemplate,
          roleIds: selectedRoleIds,
          playerCount: selectedRoleIds.length,
          playerNames: playerNames.slice(0, selectedRoleIds.length)
        };
        await saveTemplateApi(updatedTemplate);
        await loadTemplatesData();
      } catch (err) {
        console.error('Auto save template error:', err);
      }
    }
    setActiveTab('players');
  };

  // Save current names into the selected template (Neon DB)
  const handleSaveNamesToTemplate = async () => {
    triggerHaptic('success');
    if (!activeTemplate || activeTemplate.isPreset) {
      setNewTemplateNameInput(`${activeTemplate?.name || 'Bộ bài'} (Tùy chỉnh)`);
      setIsSavingAsNew(true);
      return;
    }

    try {
      const updatedTemplate = {
        ...activeTemplate,
        roleIds: selectedRoleIds,
        playerCount: selectedRoleIds.length,
        playerNames: playerNames
      };
      await saveTemplateApi(updatedTemplate);
      await loadTemplatesData();
      showAlert({
        title: 'ĐÃ LƯU TÊN VÀO BỘ BÀI! ✨',
        message: `Đã lưu danh sách ${playerNames.length} người chơi vào bộ bài "${activeTemplate.name}". Lần sau khi chọn bộ bài này, tên sẽ tự động nạp lại!`,
        variant: 'emerald'
      });
    } catch (err) {
      showAlert({
        title: 'LỖI LƯU BỘ BÀI',
        message: err.message,
        variant: 'blood'
      });
    }
  };

  // Save as new custom template
  const handleSaveAsNewTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplateNameInput.trim()) return;

    try {
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: newTemplateNameInput.trim(),
        desc: `${selectedRoleIds.length} lá bài tự chọn (${selectedRoleIds.length} người chơi)`,
        playerCount: selectedRoleIds.length,
        roleIds: selectedRoleIds,
        playerNames: playerNames
      };
      await saveTemplateApi(newTemplate);
      await loadTemplatesData();
      setSelectedTemplateId(newTemplate.id);
      setIsSavingAsNew(false);
      setNewTemplateNameInput('');
      showAlert({
        title: 'ĐÃ TẠO BỘ BÀI MỚI! ✨',
        message: `Bộ bài "${newTemplate.name}" gồm ${selectedRoleIds.length} lá và danh sách người chơi đã được lưu thành công!`,
        variant: 'emerald'
      });
    } catch (err) {
      showAlert({
        title: 'LỖI TẠO BỘ BÀI',
        message: err.message,
        variant: 'blood'
      });
    }
  };

  // Delete ANY template (custom or preset)
  const handleDeleteTemplate = async (template, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'XÓA BỘ BÀI?',
      message: `Bạn có chắc chắn muốn xóa bộ bài "${template.name}" khỏi danh sách?`,
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        try {
          if (template.isPreset) {
            const nextDeleted = [...deletedPresetIds, template.id];
            setDeletedPresetIds(nextDeleted);
            try {
              localStorage.setItem('werewolf_deleted_presets', JSON.stringify(nextDeleted));
            } catch (err) {}
          } else {
            await deleteTemplateApi(template.id);
            setTemplates(prev => prev.filter(t => t.id !== template.id));
          }

          if (selectedTemplateId === template.id) {
            const remaining = allTemplates.filter(t => t.id !== template.id);
            if (remaining.length > 0) {
              handleSelectTemplate(remaining[0]);
            }
          }
        } catch (err) {
          showAlert({ title: 'LỖI XÓA BỘ BÀI', message: err.message, variant: 'blood' });
        }
      }
    });
  };

  // Restore deleted presets
  const handleRestoreDeletedPresets = () => {
    setDeletedPresetIds([]);
    try {
      localStorage.removeItem('werewolf_deleted_presets');
    } catch (err) {}
    showAlert({
      title: 'ĐÃ KHÔI PHỤC BỘ BÀI MẶC ĐỊNH! ✨',
      message: 'Các bộ bài kịch bản chuẩn của hệ thống đã được khôi phục đầy đủ.',
      variant: 'emerald'
    });
  };

  // Final Action: Apply Game Setup and Start Game
  const handleApplySetup = () => {
    triggerHaptic('success');
    if (onApplyGameSetup) {
      onApplyGameSetup({
        playerNames,
        roleIds: selectedRoleIds
      });
    } else if (onApplyTemplate) {
      onApplyTemplate({
        playerCount: selectedRoleIds.length,
        roleIds: selectedRoleIds,
        playerNames
      });
    }
    onClose();
  };

  // Stats on selected deck
  const wolfCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'W';
  }).length;

  const villagerCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'V';
  }).length;

  const roleCountsMap = useMemo(() => {
    const counts = {};
    selectedRoleIds.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [selectedRoleIds]);

  const filteredTemplates = useMemo(() => {
    if (!templateSearchQuery.trim()) return allTemplates;
    const q = templateSearchQuery.toLowerCase();
    return allTemplates.filter(t => t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q)));
  }, [allTemplates, templateSearchQuery]);

  const filteredAvailableRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return ROLES;
    const q = roleSearchQuery.toLowerCase();
    return ROLES.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [roleSearchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-safe-overlay bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#121422] border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-full max-h-full sm:max-h-[90vh] overflow-hidden relative my-auto">
        {/* ============================================================== */}
        {/* PHYSICAL FOLDER TOP TABS: TAB 1 (BỘ BÀI) & TAB 2 (NGƯỜI CHƠI)  */}
        {/* ============================================================== */}
        <div className="bg-[#090a12] px-3 sm:px-6 pt-2.5 sm:pt-3 border-b border-slate-800 flex items-end justify-between shrink-0">
          <div className="flex items-end gap-1.5 sm:gap-2 -mb-[1px]">
            {/* Tab 1: Folder Ear for Deck Selection */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('deck');
              }}
              className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-t-xl sm:rounded-t-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border-t-2 ${
                activeTab === 'deck'
                  ? 'bg-[#121422] text-amber-300 border-amber-500 border-x border-slate-800 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.6)]'
                  : 'bg-[#0a0c16]/90 text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#101220]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>1. Chọn Bộ Bài</span>
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/80 text-amber-300 font-mono">
                {selectedRoleIds.length} lá
              </span>
            </button>

            {/* Tab 2: Folder Ear for Players & Names (1 Deck = 1 Group) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('players');
              }}
              className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-t-xl sm:rounded-t-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border-t-2 ${
                activeTab === 'players'
                  ? 'bg-[#121422] text-purple-200 border-purple-500 border-x border-slate-800 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.6)]'
                  : 'bg-[#0a0c16]/90 text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#101220]'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>2. Người Chơi</span>
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-purple-300 font-mono">
                {playerNames.length} slot
              </span>
            </button>
          </div>

          {/* Close button X */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng cửa sổ (Esc)"
            className="mb-1.5 sm:mb-2 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-600/80 text-slate-300 hover:text-rose-200 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-sm active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* FOLDER BODY CONTAINER (STRICTLY VERTICAL SCROLL, MIN-H-0)       */}
        {/* ============================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 pb-6 space-y-4">
          {/* ------------------------------------------------------------ */}
          {/* TAB 1: BỘ BÀI (DECK TEMPLATES & ROLE CUSTOMIZATION)          */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'deck' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Bar: Search & Create New Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm bộ bài..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTemplateNameInput(`Bộ bài ${selectedRoleIds.length} lá mới`);
                      setIsSavingAsNew(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-purple-950/80 border border-slate-700 hover:border-purple-500 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tạo Bộ Bài Mới</span>
                  </button>
                </div>
              </div>

              {/* Restore default presets if any were deleted */}
              {deletedPresetIds.length > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                  <span>Bạn đã xóa {deletedPresetIds.length} bộ bài mặc định của hệ thống.</span>
                  <button
                    type="button"
                    onClick={handleRestoreDeletedPresets}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Khôi phục bộ bài mặc định</span>
                  </button>
                </div>
              )}

              {/* Form Save New Template Modal Box */}
              {isSavingAsNew && (
                <form onSubmit={handleSaveAsNewTemplate} className="p-3.5 rounded-2xl bg-[#161828] border border-purple-500/60 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">Lưu cấu hình hiện tại thành bộ bài mới:</span>
                    <button type="button" onClick={() => setIsSavingAsNew(false)} className="text-slate-400 hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTemplateNameInput}
                      onChange={(e) => setNewTemplateNameInput(e.target.value)}
                      placeholder="Đặt tên bộ bài..."
                      className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <GothicButton variant="gold" size="sm" type="submit" icon={Save}>
                      Lưu Bộ Bài
                    </GothicButton>
                  </div>
                </form>
              )}

              {/* Deck Templates List (1 Column on Mobile, 2 on Desktop) */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn Bộ Bài Phù Hợp Cho Trận Đấu ({filteredTemplates.length} bộ):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTemplates.map(t => {
                    const isSelected = selectedTemplateId === t.id;
                    const isEditing = isSelected && showRoleCustomizer;
                    const cardCount = isSelected ? selectedRoleIds.length : (t.roleIds?.length || t.playerCount || 0);
                    const tRoleIds = isSelected ? selectedRoleIds : (t.roleIds || []);
                    const tRoles = tRoleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
                    const wolfs = isSelected ? wolfCount : tRoles.filter(r => r.teamCode === 'W').length;
                    const villagers = isSelected ? villagerCount : tRoles.filter(r => r.teamCode === 'V').length;

                    return (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          if (e.target.closest('button') || e.target.closest('input')) return;
                          handleSelectTemplate(t);
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          isEditing
                            ? 'col-span-full bg-gradient-to-br from-purple-950/80 via-[#131525] to-amber-950/50 border-amber-500 shadow-xl shadow-purple-950/50 ring-1 ring-amber-500/50'
                            : isSelected
                            ? 'bg-gradient-to-br from-purple-950/70 via-[#181a2e] to-amber-950/40 border-amber-500 shadow-lg shadow-purple-950/50'
                            : 'bg-[#141624] hover:bg-[#1a1c2e] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-sm text-slate-100 truncate mr-2">
                              {t.name}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/80 shrink-0">
                              {cardCount} lá
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                            {t.desc || (t.isPreset ? 'Bộ bài kịch bản tiêu chuẩn' : 'Bộ bài lưu')}
                          </p>

                          {/* Role badges summary */}
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                            {wolfs > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-900/60 font-medium">
                                🐺 {wolfs} Sói
                              </span>
                            )}
                            {villagers > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-900/60 font-medium">
                                🛡️ {villagers} Dân
                              </span>
                            )}
                            {tRoles.slice(0, 4).map((r, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                {r.name}
                              </span>
                            ))}
                            {tRoles.length > 4 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                                +{tRoles.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Inline Role Customizer inside the deck card */}
                        {isEditing && (
                          <div className="mt-4 pt-3.5 border-t border-amber-900/60 space-y-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            {/* Header for role cards inside editor */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-amber-300">Chỉnh Sửa Lá Bài:</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono font-bold text-xs flex items-center gap-1 shadow-sm">
                                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{selectedRoleIds.length} lá bài</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-[11px] flex items-center gap-1">
                                  <WolfIcon className="w-3 h-3 text-rose-400" />
                                  <span>{wolfCount} Sói</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[11px] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>{villagerCount} Dân</span>
                                </span>
                              </div>

                              <div className="relative w-full sm:w-44 shrink-0">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={roleSearchQuery}
                                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                                  placeholder="Tìm vai trò..."
                                  className="w-full pl-7 pr-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Vertical wrap grid of roles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                              {filteredAvailableRoles.map(role => {
                                const count = roleCountsMap[role.id] || 0;
                                const isWolf = role.teamCode === 'W';
                                return (
                                  <div
                                    key={role.id}
                                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                                      count > 0
                                        ? isWolf
                                          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                                          : 'bg-purple-950/40 border-purple-800/80 text-purple-200'
                                        : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate mr-2">
                                      {isWolf ? <WolfIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                                      <span className="text-xs font-bold truncate">{role.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleModifyRoleCount(role.id, -1)}
                                        disabled={count === 0}
                                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs flex items-center justify-center cursor-pointer active:scale-95"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs font-mono font-bold text-white">
                                        {count}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleModifyRoleCount(role.id, 1)}
                                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-purple-900 text-white text-xs flex items-center justify-center cursor-pointer active:scale-95"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Action Bar inside card editor */}
                            <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#0b0c16]/90 p-2.5 rounded-xl border border-purple-900/50">
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>
                                  Cấu hình: <strong className="text-amber-300 font-mono">{selectedRoleIds.length} lá</strong> ⟷ <strong className="text-purple-300 font-mono">{selectedRoleIds.length} slot người chơi</strong>
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewTemplateNameInput(`Bộ bài ${selectedRoleIds.length} người mới`);
                                    setIsSavingAsNew(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <Save className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Lưu Mẫu Mới</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleSaveAndGoToPlayers}
                                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 border border-purple-400 text-white text-xs font-black shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                                >
                                  <Save className="w-3.5 h-3.5 text-purple-200" />
                                  <span>Lưu & Sang Thêm Người ➔</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Selection indicator, Sửa Lá Bài & Delete button */}
                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(t);
                            }}
                            className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${isSelected ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Đang Chọn Cho Ván</span>
                              </>
                            ) : (
                              <>
                                <span>Chọn bộ này</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {/* Nút Sửa Lá Bài trực tiếp trên từng bộ bài */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected && showRoleCustomizer) {
                                  setShowRoleCustomizer(false);
                                } else {
                                  handleSelectTemplate(t);
                                  setShowRoleCustomizer(true);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isEditing
                                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                                  : 'bg-slate-900 hover:bg-amber-950/50 border-slate-700 hover:border-amber-500/80 text-slate-300 hover:text-amber-300'
                              }`}
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isEditing ? 'Đóng Sửa' : 'Sửa Lá Bài'}</span>
                            </button>

                            {/* Delete button available on ALL cards */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(t, e)}
                              title={`Xóa bộ bài "${t.name}"`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 2: NGƯỜI CHƠI (EXACT N SLOTS FOR N CARDS)                */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'players' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Box: 1 Deck = 1 Group Explanation & Tools */}
              <div className="p-3.5 rounded-2xl bg-[#0f111d] border border-purple-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>DANH SÁCH {playerNames.length} NGƯỜI CHƠI ({selectedRoleIds.length} LÁ BÀI)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Danh sách người chơi theo từng vị trí ghế.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBulkPaste(!showBulkPaste)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Dán Tên (Copy/Paste)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetNamesToDefault}
                    title="Đặt lại tên mặc định"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNamesToTemplate}
                    title="Lưu danh sách tên vào bộ bài này"
                    className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-xs font-bold text-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-purple-300" />
                    <span className="hidden sm:inline">Lưu Vào Bộ Này</span>
                  </button>
                </div>
              </div>

              {/* Bulk Paste Multi-line Box WITH NUMBERED CIRCLE BADGES ON THE RIGHT */}
              {showBulkPaste && (
                <div className="p-3.5 rounded-2xl bg-[#161828] border border-purple-500/60 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300">Dán danh sách tên (mỗi dòng một tên):</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-bold text-[11px]">
                        Đã nhập: {validBulkLinesCount} / {playerNames.length} người
                      </span>
                    </div>
                    <button type="button" onClick={() => setShowBulkPaste(false)} className="text-slate-400 hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Textarea + Numbered Circle Tags Column on the Right */}
                  <div className="relative flex gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 focus-within:border-purple-500">
                    <textarea
                      rows={Math.max(5, Math.min(12, bulkLines.length))}
                      value={bulkNamesInput}
                      onChange={(e) => setBulkNamesInput(e.target.value)}
                      placeholder="Vĩ&#10;Tiến&#10;Phú..."
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 focus:outline-none font-mono resize-none leading-7 tracking-wide"
                    />

                    {/* Numbered circle tags column on the right for easy line counting */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5 border-l border-slate-800/80 pl-2.5 max-h-56 overflow-y-auto">
                      {bulkLines.map((line, idx) => {
                        const hasText = line.trim().length > 0;
                        return (
                          <div
                            key={idx}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                              hasText
                                ? 'bg-purple-900 border-purple-500 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title={`Dòng #${idx + 1}: ${line.trim() || 'Chưa nhập'}`}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkPaste(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <GothicButton variant="witch" size="sm" onClick={handleApplyBulkNames}>
                        Cập Nhật ({validBulkLinesCount} Tên)
                      </GothicButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Exact N Slots (1 Column on Mobile, 2 Columns on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {playerNames.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#141624] border border-slate-800 focus-within:border-purple-500 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleSlotNameChange(idx, e.target.value)}
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 font-medium focus:outline-none min-w-0"
                      placeholder={`Tên người chơi #${idx + 1}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* MODAL FOOTER: ALWAYS PINNED, PROPER SAFE BOTTOM PADDING        */}
        {/* ============================================================== */}
        <div className="p-2.5 sm:p-4 border-t border-slate-800 bg-[#0d0e17] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 z-20">
          <div className="flex items-center justify-center sm:justify-start min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl max-w-full truncate">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                {activeTemplate?.name || 'Bộ bài'}: {playerNames.length} người ⟷ {selectedRoleIds.length} lá ({wolfCount} Sói, {villagerCount} Dân)
              </span>
            </div>
          </div>

          <GothicButton
            variant="witch"
            size="md"
            icon={Play}
            onClick={handleApplySetup}
            className="w-full sm:w-auto shadow-xl h-10 sm:h-11 text-xs sm:text-sm font-bold cursor-pointer shrink-0"
          >
            Áp Dụng & Bắt Đầu Ván Đấu Mới
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
