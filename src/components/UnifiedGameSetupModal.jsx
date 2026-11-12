import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Undo2,
  Star
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
  currentTemplateId = null,
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

  // Selected template & roles (Exclude appointed titles like Cảnh Sát Trưởng)
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    return currentTemplateId || 'preset-9-11';
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState(() => {
    if (currentDeckRoleIds && currentDeckRoleIds.length > 0) {
      return currentDeckRoleIds.filter(id => id !== 'canh-sat-truong' && id !== 'canh-sat-characters');
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
  const [editingDeckName, setEditingDeckName] = useState(() => PRESETS[1]?.name || '');
  const [editingDeckDesc, setEditingDeckDesc] = useState(() => PRESETS[1]?.desc || '');

  // Bulk edit modal state
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditText, setBulkEditText] = useState('');
  const lineNumbersRef = useRef(null);

  const handleTextareaScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

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

  // Templates directly and exclusively from Database
  const allTemplates = useMemo(() => {
    return (templates || []).map(t => ({
      ...t,
      roleIds: (t.roleIds || []).filter(id => id !== 'canh-sat-truong' && id !== 'canh-sat-characters')
    }));
  }, [templates]);

  // Sync selectedTemplateId when currentTemplateId is updated or modal opens
  useEffect(() => {
    if (isOpen && currentTemplateId) {
      setSelectedTemplateId(currentTemplateId);
    }
  }, [isOpen, currentTemplateId]);

  // When templates load from DB, sync selectedRoleIds with the loaded template if not editing
  useEffect(() => {
    if (templates && templates.length > 0 && !showRoleCustomizer) {
      const match = allTemplates.find(t => t.id === selectedTemplateId);
      if (match && match.roleIds && match.roleIds.length > 0) {
        setSelectedRoleIds(match.roleIds);
        setEditingDeckName(match.name || '');
        setEditingDeckDesc(match.desc || '');
      }
    }
  }, [templates, selectedTemplateId, showRoleCustomizer]);

  // Active template info
  const activeTemplate = useMemo(() => {
    return allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0] || null;
  }, [allTemplates, selectedTemplateId]);

  // Ensure playerNames strictly matches selectedRoleIds.length
  // When count increases, newly added slots are empty '' so user can fill them
  const syncNamesCount = (newRoleIds, baseNames = playerNames) => {
    const count = newRoleIds.length;
    if (baseNames.length === count) return baseNames;
    if (baseNames.length > count) {
      return baseNames.slice(0, count);
    }
    const extended = [...baseNames];
    for (let i = baseNames.length; i < count; i++) {
      extended.push('');
    }
    return extended;
  };

  // Sync editingDeckName with activeTemplate when activeTemplate id changes
  useEffect(() => {
    if (activeTemplate) {
      setEditingDeckName(activeTemplate.name || '');
      setEditingDeckDesc(activeTemplate.desc || '');
    }
  }, [activeTemplate?.id]);

  // Select a deck template
  const handleSelectTemplate = (template) => {
    triggerHaptic('light');
    setSelectedTemplateId(template.id);
    setEditingDeckName(template.name || '');
    setEditingDeckDesc(template.desc || '');
    const newRoleIds = (template.roleIds || []).filter(id => id !== 'canh-sat-truong' && id !== 'canh-sat-characters');
    setSelectedRoleIds(newRoleIds);

    let nextNames = [];
    if (template.playerNames && template.playerNames.length > 0) {
      nextNames = template.playerNames.slice(0, newRoleIds.length);
      while (nextNames.length < newRoleIds.length) {
        nextNames.push('');
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
  // Open bulk edit modal pre-filled with current names
  const handleOpenBulkEdit = () => {
    triggerHaptic('light');
    setBulkEditText(playerNames.join('\n'));
    setIsBulkEditModalOpen(true);
  };

  const bulkLines = useMemo(() => {
    if (!bulkEditText) return [''];
    return bulkEditText.split('\n');
  }, [bulkEditText]);

  const validBulkLinesCount = useMemo(() => {
    return bulkLines.filter(s => s.trim().length > 0).length;
  }, [bulkLines]);

  // Apply bulk edited names and sync roles
  const handleApplyBulkEdit = () => {
    triggerHaptic('success');
    const parsed = bulkEditText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (parsed.length < 4) {
      showAlert({
        title: 'SỐ LƯỢNG QUÁ ÍT',
        message: 'Một ván chơi Ma Sói cần tối thiểu 4 người chơi.',
        variant: 'warning'
      });
      return;
    }

    setPlayerNames(parsed);

    // Sync selectedRoleIds to match the count of parsed players
    if (parsed.length > selectedRoleIds.length) {
      const extraCount = parsed.length - selectedRoleIds.length;
      setSelectedRoleIds(prev => [...prev, ...Array(extraCount).fill('dan-lang')]);
    } else if (parsed.length < selectedRoleIds.length) {
      let updatedRoles = [...selectedRoleIds];
      while (updatedRoles.length > parsed.length) {
        const danLangIdx = updatedRoles.lastIndexOf('dan-lang');
        if (danLangIdx !== -1) {
          updatedRoles.splice(danLangIdx, 1);
        } else {
          updatedRoles.pop();
        }
      }
      setSelectedRoleIds(updatedRoles);
    }

    setIsBulkEditModalOpen(false);
  };

  // Reset all names to defaults
  const handleResetNamesToDefault = () => {
    triggerHaptic('light');
    setPlayerNames(DEFAULT_PLAYER_NAMES.slice(0, selectedRoleIds.length));
  };

  // Save deck configuration and close the inline customizer
  const handleSaveDeckConfig = async () => {
    triggerHaptic('success');
    if (activeTemplate) {
      try {
        const finalName = editingDeckName.trim() || activeTemplate.name || 'Bộ bài';
        const finalDesc = editingDeckDesc.trim() || activeTemplate.desc || '';
        const updatedTemplate = {
          ...activeTemplate,
          id: activeTemplate.id,
          name: finalName,
          desc: finalDesc,
          roleIds: selectedRoleIds,
          playerCount: selectedRoleIds.length,
          playerNames: playerNames.slice(0, selectedRoleIds.length)
        };
        await saveTemplateApi(updatedTemplate);
        await loadTemplatesData();
        showAlert({
          title: 'ĐÃ LƯU BỘ BÀI! ✨',
          message: `Bộ bài "${finalName}" đã được lưu thành công (${selectedRoleIds.length} lá).`,
          variant: 'emerald'
        });
      } catch (err) {
        console.error('Save template error:', err);
        showAlert({
          title: 'LỖI LƯU BỘ BÀI',
          message: err.message,
          variant: 'blood'
        });
      }
    }
    setShowRoleCustomizer(false);
  };

  // Add 1 player slot in Tab 2 (appends empty slot and default Villager card)
  const handleAddPlayer = () => {
    triggerHaptic('selection');
    setPlayerNames(prev => [...prev, '']);
    setSelectedRoleIds(prev => [...prev, 'dan-lang']);
  };

  // Delete 1 specific player slot in Tab 2
  const handleDeletePlayer = (index) => {
    triggerHaptic('light');
    if (playerNames.length <= 4) {
      showAlert({
        title: 'SỐ LƯỢNG QUÁ ÍT',
        message: 'Một ván chơi Ma Sói cần tối thiểu 4 người chơi.',
        variant: 'warning'
      });
      return;
    }
    setPlayerNames(prev => prev.filter((_, i) => i !== index));
    setSelectedRoleIds(prev => {
      const danLangIdx = prev.lastIndexOf('dan-lang');
      if (danLangIdx !== -1) {
        return prev.filter((_, i) => i !== danLangIdx);
      }
      return prev.slice(0, -1);
    });
  };

  // Save current names into the selected template (Neon DB)
  const handleSaveNamesToTemplate = async () => {
    triggerHaptic('success');
    if (!activeTemplate) return;

    try {
      const finalName = editingDeckName.trim() || activeTemplate.name || 'Bộ bài';
      const finalDesc = editingDeckDesc.trim() || activeTemplate.desc || '';
      const updatedTemplate = {
        ...activeTemplate,
        id: activeTemplate.id,
        name: finalName,
        desc: finalDesc,
        roleIds: selectedRoleIds,
        playerCount: selectedRoleIds.length,
        playerNames: playerNames
      };
      await saveTemplateApi(updatedTemplate);
      await loadTemplatesData();
      showAlert({
        title: 'ĐÃ LƯU TÊN VÀO BỘ BÀI! ✨',
        message: `Đã lưu danh sách ${playerNames.length} người chơi vào bộ bài "${finalName}". Lần sau khi chọn bộ bài này, tên sẽ tự động nạp lại!`,
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

  // Delete ANY template straight from DB
  const handleDeleteTemplate = async (template, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'XÓA BỘ BÀI?',
      message: `Bạn có chắc chắn muốn xóa bộ bài "${template.name}" khỏi cơ sở dữ liệu?`,
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        try {
          await deleteTemplateApi(template.id);
          await loadTemplatesData();
          if (selectedTemplateId === template.id) {
            const remaining = (templates || []).filter(t => t.id !== template.id);
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

  // Restore / Seed standard presets into Database
  const handleRestoreDeletedPresets = async () => {
    try {
      for (const p of PRESETS) {
        await saveTemplateApi({
          id: p.id,
          name: p.name,
          desc: p.desc || '',
          playerCount: p.roleIds.length,
          roleIds: p.roleIds
        });
      }
      await loadTemplatesData();
      showAlert({
        title: 'ĐÃ NẠP BỘ BÀI MẪU! ✨',
        message: 'Các bộ bài kịch bản chuẩn đã được lưu thành công vào Database.',
        variant: 'emerald'
      });
    } catch (err) {
      showAlert({
        title: 'LỖI NẠP BỘ BÀI',
        message: err.message,
        variant: 'blood'
      });
    }
  };

  // Final Action: Apply Game Setup and Start Game
  const handleApplySetup = () => {
    triggerHaptic('success');
    const finalNames = playerNames.map((name, i) => {
      const trimmed = name?.trim();
      return trimmed || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`;
    });

    if (onApplyGameSetup) {
      onApplyGameSetup({
        playerNames: finalNames,
        roleIds: selectedRoleIds,
        templateId: selectedTemplateId
      });
    } else if (onApplyTemplate) {
      onApplyTemplate({
        id: selectedTemplateId,
        playerCount: selectedRoleIds.length,
        roleIds: selectedRoleIds,
        playerNames: finalNames
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
    // Only playable character roles dealt into the deck: exclude appointed titles like Cảnh Sát Trưởng
    const deckRoles = ROLES.filter(r => r.isPlayableDeckCard !== false && !r.isAppointedTitle && !r.team?.includes('phong thêm') && r.id !== 'canh-sat-truong' && r.id !== 'canh-sat-characters');
    if (!roleSearchQuery.trim()) return deckRoles;
    const q = roleSearchQuery.toLowerCase();
    return deckRoles.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [roleSearchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-safe-overlay bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden"
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
                    onClick={handleRestoreDeletedPresets}
                    title="Nạp lại các bộ bài mẫu chuẩn vào Database"
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nạp Bộ Mẫu</span>
                  </button>

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

              {allTemplates.length === 0 && !loading && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">Chưa có bộ bài nào trong cơ sở dữ liệu.</p>
                  <button
                    type="button"
                    onClick={handleRestoreDeletedPresets}
                    className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Nạp 3 bộ bài mẫu mặc định vào Database</span>
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
                    const cardCount = isEditing ? selectedRoleIds.length : (t.roleIds?.length || t.playerCount || 0);
                    const tRoleIds = isEditing ? selectedRoleIds : (t.roleIds || []);
                    const tRoles = tRoleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
                    const wolfs = isEditing ? wolfCount : tRoles.filter(r => r.teamCode === 'W').length;
                    const villagers = isEditing ? villagerCount : tRoles.filter(r => r.teamCode === 'V').length;

                    // Group unique roles with accurate counts
                    const deckRoleCountsMap = {};
                    for (const id of tRoleIds) {
                      deckRoleCountsMap[id] = (deckRoleCountsMap[id] || 0) + 1;
                    }
                    const groupedRoles = Object.entries(deckRoleCountsMap)
                      .map(([id, count]) => ({
                        role: ROLES.find(r => r.id === id),
                        count
                      }))
                      .filter(item => Boolean(item.role))
                      .sort((a, b) => {
                        // 1. Sói lên đầu
                        if (a.role.teamCode === 'W' && b.role.teamCode !== 'W') return -1;
                        if (a.role.teamCode !== 'W' && b.role.teamCode === 'W') return 1;
                        // 2. Dân Làng cơ bản
                        if (a.role.id === 'dan-lang' && b.role.id !== 'dan-lang') return -1;
                        if (a.role.id !== 'dan-lang' && b.role.id === 'dan-lang') return 1;
                        // 3. Phe Dân
                        if (a.role.teamCode === 'V' && b.role.teamCode !== 'V') return -1;
                        if (a.role.teamCode !== 'V' && b.role.teamCode === 'V') return 1;
                        return a.role.name.localeCompare(b.role.name);
                      });

                    const displayName = isEditing && editingDeckName.trim() ? editingDeckName.trim() : t.name;
                    const displayDesc = (isEditing && editingDeckDesc.trim()) || t.desc || (t.isPreset ? 'Bộ bài kịch bản tiêu chuẩn' : 'Bộ bài lưu');

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
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            {isEditing ? (
                              <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingDeckName}
                                  onChange={(e) => setEditingDeckName(e.target.value)}
                                  placeholder="Tên bộ bài..."
                                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500 text-sm font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-sm text-slate-100 truncate mr-2">
                                {displayName}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                                {wolfs} Sói • {villagers} Phe Dân
                              </span>
                              <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/80">
                                {cardCount} lá
                              </span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingDeckDesc}
                                onChange={(e) => setEditingDeckDesc(e.target.value)}
                                placeholder="Mô tả bộ bài (không bắt buộc)..."
                                className="w-full px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                              {displayDesc}
                            </p>
                          )}

                          {/* Role badges summary: Only real cards in the deck */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {groupedRoles.map((item) => {
                              const isWolf = item.role.teamCode === 'W';
                              const isVillagerBasic = item.role.id === 'dan-lang';
                              return (
                                <span
                                  key={item.role.id}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                    isWolf
                                      ? 'bg-rose-950/60 text-rose-200 border-rose-900/50'
                                      : isVillagerBasic
                                      ? 'bg-slate-900/90 text-slate-300 border-slate-700'
                                      : 'bg-purple-950/40 text-purple-200 border-purple-800/50'
                                  }`}
                                >
                                  <span>{item.role.name}</span>
                                  {item.count > 1 && (
                                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-black/50 px-1 py-0.2 rounded border border-amber-500/30">
                                      x{item.count}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
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
                                <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300 font-medium text-[11px] flex items-center gap-1" title="Cảnh Sát Trưởng là chức danh mặc định có sẵn trong trận đấu (bầu ban ngày, phiếu x2) và không chiếm slot lá bài">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span>Cảnh Sát Trưởng (Mặc định)</span>
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

                              <button
                                type="button"
                                onClick={handleSaveDeckConfig}
                                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 border border-purple-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <Save className="w-3.5 h-3.5 text-purple-200" />
                                <span>Lưu</span>
                              </button>
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
                                  handleSaveDeckConfig();
                                } else {
                                  handleSelectTemplate(t);
                                  setEditingDeckName(t.name || '');
                                  setEditingDeckDesc(t.desc || '');
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
                              <span>{isEditing ? 'Lưu & Đóng' : 'Sửa Lá Bài'}</span>
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

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/80 text-xs font-bold text-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-300" />
                    <span>Thêm Người</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenBulkEdit}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/80 border border-slate-700 hover:border-purple-500 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Sửa Nhiều</span>
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

              {/* Exact N Slots (1 Column on Mobile, 2 Columns on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {playerNames.map((name, idx) => {
                  const isEmpty = !name.trim();
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                        isEmpty
                          ? 'bg-[#181528] border border-amber-500/50 focus-within:border-amber-400'
                          : 'bg-[#141624] border border-slate-800 focus-within:border-purple-500'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleSlotNameChange(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 font-medium focus:outline-none min-w-0"
                        placeholder={`Tên ghế #${idx + 1}... (trống)`}
                      />
                      {isEmpty && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-medium shrink-0">
                          Trống
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(idx)}
                        title={`Xóa người chơi #${idx + 1}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Append new player dashed button */}
              <button
                type="button"
                onClick={handleAddPlayer}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-purple-800/70 hover:border-purple-500 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 hover:text-purple-200 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Thêm Người Chơi Mới (Ghế #{playerNames.length + 1})</span>
              </button>
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
                {(selectedTemplateId === activeTemplate?.id && editingDeckName.trim()) || activeTemplate?.name || 'Bộ bài'}: {playerNames.length} người ⟷ {selectedRoleIds.length} lá ({wolfCount} Sói, {villagerCount} Dân)
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

      {/* ============================================================== */}
      {/* POPUP MODAL: SỬA NHIỀU NGƯỜI CHƠI (MỖI DÒNG 1 TÊN)            */}
      {/* ============================================================== */}
      {isBulkEditModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBulkEditModalOpen(false);
          }}
        >
          <div
            className="bg-[#121422] border-2 border-purple-500/80 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-3.5 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-purple-900/60">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <h3 className="font-cinzel font-bold text-sm sm:text-base text-purple-200">
                  Sửa Nhiều Người Chơi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[11px] font-bold">
                  {validBulkLinesCount} người
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-line editor: Line numbers column + Textarea with exact pixel lock */}
            <div className="relative flex bg-[#0a0c16] border border-purple-900/80 rounded-xl overflow-hidden focus-within:border-purple-500">
              <div
                ref={lineNumbersRef}
                className="w-12 select-none border-r border-slate-800/80 bg-slate-950/60 shrink-0 overflow-hidden"
                style={{
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  height: '280px',
                  boxSizing: 'border-box'
                }}
              >
                {bulkLines.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: '28px',
                      lineHeight: '28px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                    className="text-right pr-2.5 text-purple-400 font-bold select-none"
                  >
                    #{idx + 1}
                  </div>
                ))}
              </div>
              <textarea
                style={{
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  height: '280px',
                  lineHeight: '28px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                  boxSizing: 'border-box'
                }}
                value={bulkEditText}
                onChange={(e) => setBulkEditText(e.target.value)}
                onScroll={handleTextareaScroll}
                placeholder="Mỗi dòng là một người chơi..."
                className="flex-1 bg-transparent text-slate-100 focus:outline-none resize-none border-none outline-none overflow-y-auto m-0 leading-[28px]"
                autoFocus
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 truncate">
                Tương ứng <strong className="text-purple-300 font-mono">{validBulkLinesCount} slot</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <GothicButton
                  variant="witch"
                  size="sm"
                  onClick={handleApplyBulkEdit}
                  icon={Save}
                >
                  Lưu & Cập Nhật
                </GothicButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
