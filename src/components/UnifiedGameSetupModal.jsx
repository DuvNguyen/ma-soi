import React, { useState, useEffect, useMemo } from 'react';
import { ROLES, PRESETS } from '../data/roles';
import { DEFAULT_PLAYER_NAMES } from '../data/defaultPlayers';
import { fetchTemplates, saveTemplateApi, deleteTemplateApi, fetchRosters, saveRosterApi, deleteRosterApi } from '../services/api';
import {
  SlidersHorizontal,
  Users,
  Layers,
  Sparkles,
  Check,
  Plus,
  Minus,
  Trash2,
  X,
  Play,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function UnifiedGameSetupModal({
  isOpen,
  onClose,
  initialTab = 'setup',
  currentPlayers = [],
  currentDeckRoleIds = [],
  onApplyGameSetup,
  onApplyTemplate,
  onApplyRoster
}) {
  const { showConfirm, showAlert } = useGothicDialog();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data sources
  const [templates, setTemplates] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup tab states
  const [playerMode, setPlayerMode] = useState('quick'); // 'quick' | 'roster'
  const [selectedRosterId, setSelectedRosterId] = useState('current');
  const [playerCount, setPlayerCount] = useState(() => {
    return (currentPlayers && currentPlayers.length > 0) ? currentPlayers.length : 10;
  });

  const [playerNames, setPlayerNames] = useState(() => {
    if (currentPlayers && currentPlayers.length > 0) {
      return currentPlayers.map(p => p.name);
    }
    return DEFAULT_PLAYER_NAMES.slice(0, 10);
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('preset-9-11');
  const [selectedRoleIds, setSelectedRoleIds] = useState(() => {
    if (currentDeckRoleIds && currentDeckRoleIds.length > 0) {
      return [...currentDeckRoleIds];
    }
    return [...PRESETS[1].roleIds];
  });

  // Toggles for optional advanced panels
  const [showAdvancedRoles, setShowAdvancedRoles] = useState(false);
  const [showNamesList, setShowNamesList] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [rawNamesInput, setRawNamesInput] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Roster Manager form
  const [isCreatingRoster, setIsCreatingRoster] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState(null);
  const [rosterFormName, setRosterFormName] = useState('');
  const [rosterFormNamesText, setRosterFormNamesText] = useState('');

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tplData, rosterData] = await Promise.all([
        fetchTemplates(),
        fetchRosters()
      ]);
      setTemplates(tplData || []);
      setRosters(rosterData || []);
    } catch (err) {
      console.warn('Failed to load templates or rosters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine built-in presets with user saved templates
  const allAvailableTemplates = useMemo(() => {
    const list = [...PRESETS.map(p => ({ ...p, isPreset: true }))];
    templates.forEach(t => {
      if (!list.some(item => item.id === t.id)) {
        list.push({ ...t, isPreset: false });
      }
    });
    return list;
  }, [templates]);

  // Adjust player count and sync role deck
  const handleCountChange = (newCount, explicitNames = null) => {
    const count = Math.max(4, Math.min(24, newCount));
    setPlayerCount(count);

    let updatedNames = explicitNames ? [...explicitNames] : [...playerNames];
    if (count > updatedNames.length) {
      for (let i = updatedNames.length; i < count; i++) {
        updatedNames.push(DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`);
      }
    } else {
      updatedNames = updatedNames.slice(0, count);
    }
    setPlayerNames(updatedNames);

    // Auto-select exact matching template if available
    const exactMatch = allAvailableTemplates.find(
      t => (t.playerCount === count || t.roleIds?.length === count)
    );
    if (exactMatch) {
      setSelectedTemplateId(exactMatch.id);
      setSelectedRoleIds([...exactMatch.roleIds]);
    } else {
      // Keep deck length matched by adjusting dan-lang count
      setSelectedRoleIds(prev => {
        let next = [...prev];
        while (next.length < count) next.push('dan-lang');
        while (next.length > count && next.includes('dan-lang')) {
          const idx = next.lastIndexOf('dan-lang');
          next.splice(idx, 1);
        }
        if (next.length > count) next = next.slice(0, count);
        return next;
      });
    }
  };

  // Handle selecting a saved roster
  const handleSelectRoster = (rosterId) => {
    setSelectedRosterId(rosterId);
    if (rosterId === 'current') {
      const names = currentPlayers.map(p => p.name);
      handleCountChange(names.length, names);
      return;
    }
    const target = rosters.find(r => r.id === rosterId);
    if (target && target.playerNames) {
      handleCountChange(target.playerNames.length, target.playerNames);
    }
  };

  // Handle selecting a deck template
  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setSelectedRoleIds([...template.roleIds]);
  };

  // Add/remove individual roles
  const handleAddRoleToSetup = (roleId) => {
    setSelectedRoleIds(prev => [...prev, roleId]);
  };

  const handleRemoveRoleFromSetup = (index) => {
    setSelectedRoleIds(prev => prev.filter((_, i) => i !== index));
  };

  // Save manual names from textarea
  const handleSaveEditedNames = () => {
    const parsed = rawNamesInput
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      handleCountChange(parsed.length, parsed);
    }
    setIsEditingNames(false);
  };

  // Start the match with unified setup
  const handleApplySetup = () => {
    if (playerCount !== selectedRoleIds.length) {
      showAlert({
        title: 'SỐ LƯỢNG CHƯA KHỚP!',
        message: `Bàn chơi có ${playerCount} người nhưng bộ bài có ${selectedRoleIds.length} lá. Vui lòng thêm/bớt lá bài để số lượng khớp trước khi bắt đầu!`,
        variant: 'warning'
      });
      return;
    }

    onApplyGameSetup({
      playerNames,
      roleIds: selectedRoleIds
    });
    onClose();
  };

  // Stats calculation
  const wolfCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'W';
  }).length;

  const villagerCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'V';
  }).length;

  const isCountMatched = playerCount === selectedRoleIds.length;

  // Filter roles for custom search
  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return ROLES;
    const q = roleSearchQuery.toLowerCase();
    return ROLES.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [roleSearchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-safe-overlay bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0f111a] border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-full relative my-auto">
        {/* ============================================================== */}
        {/* HEADER: TITLE + NAVIGATION + PROMINENT CLOSE BUTTON */}
        {/* ============================================================== */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-[#121422] shrink-0 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-600 flex items-center justify-center shadow-lg shadow-purple-950/60 shrink-0">
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="font-cinzel font-black text-sm sm:text-lg text-slate-100 flex items-center gap-2">
                  THIẾT LẬP VÁN CHƠI
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                  Chọn người chơi và bộ bài phù hợp để bắt đầu ván đấu
                </p>
              </div>
            </div>

            {/* Close button on mobile sits in row 1 top-right */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              title="Đóng cửa sổ (Esc)"
              className="sm:hidden w-8 h-8 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-600/80 text-slate-300 hover:text-rose-200 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-sm active:scale-95"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Segmented Top Tabs */}
            <div className="flex items-center bg-[#090a12] p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setActiveTab('setup')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Thiết Lập</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rosters')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'rosters'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>Nhóm Người</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span>Bộ Bài</span>
              </button>
            </div>

            {/* Close button on desktop sits beside tabs */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              title="Đóng cửa sổ (Esc)"
              className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-600/80 text-slate-300 hover:text-rose-200 transition-all items-center justify-center cursor-pointer shrink-0 shadow-sm active:scale-95 ml-1"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: UNIFIED SETUP (CLEAN & INTUITIVE 2-STEP UX) */}
        {/* ============================================================== */}
        {activeTab === 'setup' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* ------------------------------------------------------------ */}
            {/* BƯỚC 1: SỐ LƯỢNG & DANH SÁCH NGƯỜI CHƠI */}
            {/* ------------------------------------------------------------ */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141624] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-700/60 flex items-center justify-center text-xs font-bold text-purple-300">
                    1
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Số Lượng Người Chơi
                  </span>
                </div>

                <div className="flex items-center bg-[#090a12] p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPlayerMode('quick')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      playerMode === 'quick' ? 'bg-purple-900 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Chọn Nhanh
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerMode('roster')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      playerMode === 'roster' ? 'bg-purple-900 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Nhóm Đã Lưu ({rosters.length})
                  </button>
                </div>
              </div>

              {playerMode === 'quick' ? (
                /* Chế độ chọn nhanh bằng nút +/- và thanh kéo */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCountChange(playerCount - 1)}
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="min-w-28 text-center">
                      <span className="font-cinzel font-black text-3xl text-purple-400 block leading-none">
                        {playerCount}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Người chơi
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCountChange(playerCount + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 max-w-md space-y-1.5">
                    <input
                      type="range"
                      min="4"
                      max="24"
                      value={playerCount}
                      onChange={(e) => handleCountChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>4 người</span>
                      <span>8</span>
                      <span>10 (chuẩn)</span>
                      <span>12</span>
                      <span>16</span>
                      <span>24</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chế độ chọn nhóm bạn bè đã lưu */
                <div className="space-y-2 py-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectRoster('current')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRosterId === 'current'
                          ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                          : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">Bàn Hiện Tại</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{currentPlayers.length} người</div>
                    </button>

                    {rosters.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectRoster(r.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedRosterId === r.id
                            ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                            : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.playerNames?.length || 0} người</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tên người chơi preview & quick edit toggle */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate mr-2">
                  Danh sách: <strong className="text-slate-200">{playerNames.slice(0, 5).join(', ')}</strong>
                  {playerNames.length > 5 && ` và ${playerNames.length - 5} người khác`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNamesList(!showNamesList)}
                  className="text-purple-400 hover:text-purple-300 font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showNamesList ? 'Ẩn tên' : 'Sửa tên'}</span>
                </button>
              </div>

              {/* Expanded name editor */}
              {showNamesList && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 animate-fade-in">
                  {isEditingNames ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={rawNamesInput}
                        onChange={(e) => setRawNamesInput(e.target.value)}
                        placeholder="Mỗi dòng một tên người chơi..."
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingNames(false)}
                          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-400"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEditedNames}
                          className="px-3 py-1 rounded-md bg-purple-700 hover:bg-purple-600 text-xs font-bold text-white"
                        >
                          Cập Nhật Tên
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400">Tên ghế ngồi:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRawNamesInput(playerNames.join('\n'));
                            setIsEditingNames(true);
                          }}
                          className="text-[11px] text-purple-400 hover:underline font-bold"
                        >
                          Nhập hàng loạt (Copy/Paste)
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                        {playerNames.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                          >
                            <span className="text-purple-400 font-bold">#{i + 1}</span>
                            <span>{name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* BƯỚC 2: CHỌN BỘ BÀI PHÙ HỢP */}
            {/* ------------------------------------------------------------ */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141624] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-700/60 flex items-center justify-center text-xs font-bold text-amber-300">
                    2
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Bộ Bài Cho {playerCount} Người Chơi
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-rose-400 flex items-center gap-1">
                    <WolfIcon className="w-3.5 h-3.5" /> {wolfCount} Sói
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400">
                    👨‍🌾 {villagerCount} Dân
                  </span>
                </div>
              </div>

              {/* Template cards: Highlight exact matches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {allAvailableTemplates
                  .filter(t => Math.abs((t.playerCount || t.roleIds?.length || 0) - playerCount) <= 2)
                  .map(t => {
                    const isSelected = selectedTemplateId === t.id;
                    const tplCount = t.playerCount || t.roleIds?.length || 0;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTemplate(t)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40'
                            : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs truncate">{t.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            tplCount === playerCount
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {tplCount} lá
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">
                          {t.desc || (t.isPreset ? 'Bộ bài kịch bản chuẩn' : 'Bộ bài lưu')}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Collapsible custom role tweak drawer */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowAdvancedRoles(!showAdvancedRoles)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 py-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem & Tùy chỉnh chi tiết từng lá bài ({selectedRoleIds.length} lá)</span>
                  </div>
                  {showAdvancedRoles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedRoles && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                        Lá bài trong bộ hiện tại (bấm x để bỏ):
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                        {selectedRoleIds.map((id, index) => {
                          const r = ROLES.find(x => x.id === id);
                          const isWolf = r?.teamCode === 'W';
                          return (
                            <span
                              key={`${id}-${index}`}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${
                                isWolf
                                  ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                                  : 'bg-blue-950/80 border-blue-800 text-blue-200'
                              }`}
                            >
                              <span>{r?.name || id}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRoleFromSetup(index)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Thêm vai trò khác:</span>
                        <div className="relative w-40">
                          <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
                          <input
                            type="text"
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full pl-6 pr-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {filteredRoles.slice(0, 16).map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleAddRoleToSetup(r.id)}
                            className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 text-slate-500" />
                            <span>{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUẢN LÝ NHÓM NGƯỜI (ROSTERS MANAGER) */}
        {/* ============================================================== */}
        {activeTab === 'rosters' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-6 sm:pb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Danh Sách Nhóm Người Chơi</h3>
                <p className="text-xs text-slate-400">Tạo nhóm để nạp tên bạn bè vào ván chơi nhanh chóng</p>
              </div>
              <GothicButton
                variant="gold"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingRosterId(null);
                  setRosterFormName('');
                  setRosterFormNamesText('');
                  setIsCreatingRoster(true);
                }}
              >
                Tạo Nhóm Mới
              </GothicButton>
            </div>

            {isCreatingRoster && (
              <div className="p-4 rounded-2xl bg-[#141624] border border-purple-500/50 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-purple-300">
                    {editingRosterId ? 'Chỉnh Sửa Nhóm' : 'Tạo Nhóm Mới'}
                  </span>
                  <button onClick={() => setIsCreatingRoster(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Tên nhóm:</label>
                    <input
                      type="text"
                      value={rosterFormName}
                      onChange={(e) => setRosterFormName(e.target.value)}
                      placeholder="VD: Nhóm Thứ 7, Bạn Đại Học..."
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Danh sách tên (mỗi dòng 1 tên):</label>
                    <textarea
                      rows={4}
                      value={rosterFormNamesText}
                      onChange={(e) => setRosterFormNamesText(e.target.value)}
                      placeholder="Mỗi dòng một tên hoặc ngăn cách bằng dấu phẩy..."
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRoster(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!rosterFormName.trim()) return;
                      const names = rosterFormNamesText.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
                      if (names.length === 0) return;
                      const rosterData = {
                        id: editingRosterId || `roster-${Date.now()}`,
                        name: rosterFormName.trim(),
                        playerNames: names
                      };
                      await saveRosterApi(rosterData);
                      await loadAllData();
                      setIsCreatingRoster(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-bold text-white cursor-pointer"
                  >
                    Lưu Nhóm
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rosters.map(r => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-[#141624] border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-200 truncate">{r.name}</span>
                      <span className="text-[11px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-800">
                        {r.playerNames?.length || 0} người
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {(r.playerNames || []).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectRoster(r.id);
                        setActiveTab('setup');
                      }}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chọn cho ván</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRosterId(r.id);
                          setRosterFormName(r.name);
                          setRosterFormNamesText((r.playerNames || []).join('\n'));
                          setIsCreatingRoster(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showConfirm({
                            title: 'XÓA NHÓM NGƯỜI CHƠI?',
                            message: `Bạn có chắc muốn xóa nhóm "${r.name}"?`,
                            variant: 'destructive',
                            onConfirm: async () => {
                              await deleteRosterApi(r.id);
                              await loadAllData();
                            }
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: QUẢN LÝ BỘ BÀI MẪU (DECK TEMPLATES) */}
        {/* ============================================================== */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-6 sm:pb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Danh Sách Bộ Bài Mẫu</h3>
                <p className="text-xs text-slate-400">Bao gồm bộ bài kịch bản chuẩn và bộ bài tùy chỉnh</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allAvailableTemplates.map(t => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-[#141624] border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-200 truncate">{t.name}</span>
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                        {t.playerCount || t.roleIds?.length || 0} lá
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {t.desc || (t.isPreset ? 'Bộ bài tiêu chuẩn' : 'Bộ bài lưu')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTemplate(t);
                        setActiveTab('setup');
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chọn cho ván</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FOOTER: LIVE MATCH SUMMARY & 1-CLICK START */}
        {/* ============================================================== */}
        {activeTab === 'setup' && (
          <div className="p-3.5 sm:p-5 border-t border-slate-800 bg-[#0c0d16] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center justify-center sm:justify-start">
              {isCountMatched ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Khớp hoàn hảo: {playerCount} người ⟷ {selectedRoleIds.length} lá bài ({wolfCount} Sói, {villagerCount} Dân)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-800 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Lệch {Math.abs(playerCount - selectedRoleIds.length)} lá: {playerCount} người nhưng có {selectedRoleIds.length} lá bài
                  </span>
                </div>
              )}
            </div>

            <GothicButton
              variant="witch"
              size="md"
              icon={Play}
              onClick={handleApplySetup}
              disabled={!isCountMatched}
              className="w-full sm:w-auto shadow-xl h-11 text-xs sm:text-sm font-bold"
            >
              Áp Dụng & Bắt Đầu Ván Đấu Mới
            </GothicButton>
          </div>
        )}
      </div>
    </div>
  );
}
