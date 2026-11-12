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
  Trash2,
  X,
  Play,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Shield,
  Eye,
  Skull
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
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
  if (!isOpen) return null;

  // Active top-level tab
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data sources
  const [templates, setTemplates] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup tab state
  const [selectedRosterId, setSelectedRosterId] = useState('current');
  const [playerNames, setPlayerNames] = useState(() => {
    if (currentPlayers && currentPlayers.length > 0) {
      return currentPlayers.map(p => p.name);
    }
    return DEFAULT_PLAYER_NAMES.slice(0, 10);
  });
  const [playerCount, setPlayerCount] = useState(() => {
    return (currentPlayers && currentPlayers.length > 0) ? currentPlayers.length : 10;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('preset-9-11');
  const [selectedRoleIds, setSelectedRoleIds] = useState(() => {
    if (currentDeckRoleIds && currentDeckRoleIds.length > 0) {
      return [...currentDeckRoleIds];
    }
    return [...PRESETS[1].roleIds];
  });

  const [isEditingNames, setIsEditingNames] = useState(false);
  const [rawNamesInput, setRawNamesInput] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Roster Manager state
  const [isCreatingRoster, setIsCreatingRoster] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState(null);
  const [rosterFormName, setRosterFormName] = useState('');
  const [rosterFormNamesText, setRosterFormNamesText] = useState('');

  // Template Manager state
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [tplFormName, setTplFormName] = useState('');
  const [tplFormDesc, setTplFormDesc] = useState('');
  const [tplRoleCounts, setTplRoleCounts] = useState({});

  useEffect(() => {
    loadAllData();
  }, []);

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

  // Handle choosing a roster in Unified Setup
  const handleSelectRoster = (rosterId) => {
    setSelectedRosterId(rosterId);
    if (rosterId === 'current') {
      const names = currentPlayers.map(p => p.name);
      setPlayerNames(names);
      updatePlayerCount(names.length, names);
      return;
    }
    const targetRoster = rosters.find(r => r.id === rosterId);
    if (targetRoster && targetRoster.playerNames) {
      const names = targetRoster.playerNames;
      setPlayerNames(names);
      updatePlayerCount(names.length, names);
    }
  };

  // Update player count and adjust names / templates
  const updatePlayerCount = (newCount, explicitNames = null) => {
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

    // Auto-match deck template if an exact match exists
    const exactMatch = allAvailableTemplates.find(
      t => (t.playerCount === count || t.roleIds?.length === count)
    );
    if (exactMatch) {
      setSelectedTemplateId(exactMatch.id);
      setSelectedRoleIds([...exactMatch.roleIds]);
    } else {
      // Adjust roleIds array length by adding/removing dan-lang
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

  // Handle selecting a deck template
  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setSelectedRoleIds([...template.roleIds]);
  };

  // Add a role to the setup deck
  const handleAddRoleToSetup = (roleId) => {
    setSelectedRoleIds(prev => [...prev, roleId]);
  };

  // Remove a role from setup deck by index
  const handleRemoveRoleFromSetup = (index) => {
    setSelectedRoleIds(prev => prev.filter((_, i) => i !== index));
  };

  // Quick edit names textarea submission
  const handleSaveEditedNames = () => {
    const parsed = rawNamesInput
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      updatePlayerCount(parsed.length, parsed);
    }
    setIsEditingNames(false);
  };

  // Final submission of Unified Setup
  const handleApplySetup = () => {
    if (playerCount !== selectedRoleIds.length) {
      showAlert({
        title: 'SỐ LƯỢNG CHƯA KHỚP!',
        message: `Bàn chơi có ${playerCount} người nhưng bộ bài có ${selectedRoleIds.length} lá. Vui lòng thêm/bớt lá bài để số lượng khớp đúng nhau trước khi bắt đầu!`,
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

  const otherCount = selectedRoleIds.length - wolfCount - villagerCount;
  const isCountMatched = playerCount === selectedRoleIds.length;

  // Filtered roles for picker search
  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return ROLES;
    const q = roleSearchQuery.toLowerCase();
    return ROLES.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [roleSearchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f111a] border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header with Bento Navigation */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-600 flex items-center justify-center shadow-lg shadow-purple-950/60">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-base sm:text-lg text-slate-100 flex items-center gap-2">
                THIẾT LẬP PHÒNG CHƠI MA SÓI
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tích hợp đồng bộ Người chơi & Bộ bài trong một màn hình duy nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Top-level Segmented Tabs */}
            <div className="flex items-center bg-[#090a12] p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('setup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Thiết Lập Ván</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rosters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'rosters'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">Nhóm Người</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-purple-900 border border-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden sm:inline">Bộ Bài Mẫu</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: UNIFIED SETUP (NGƯỜI CHƠI + BỘ BÀI ĐỒNG BỘ) */}
        {/* ============================================================== */}
        {activeTab === 'setup' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Grid 2 Cột Bento: Trái là Người Chơi, Phải là Bộ Bài */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* CỘT 1: NHÓM NGƯỜI CHƠI (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-[#141624] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                        1. Danh Sách Người Chơi
                      </span>
                    </div>
                    <span className="font-cinzel font-black text-lg text-purple-400">
                      {playerCount} người
                    </span>
                  </div>

                  {/* Quick Roster Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      Chọn nhóm đã lưu:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                      <button
                        type="button"
                        onClick={() => handleSelectRoster('current')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedRosterId === 'current'
                            ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-sm'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Bàn hiện tại ({currentPlayers.length})
                      </button>

                      {rosters.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleSelectRoster(r.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            selectedRosterId === r.id
                              ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-sm'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {r.name} ({r.playerNames?.length || 0})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player Count Range Slider */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Điều chỉnh số lượng ghế:</span>
                      <span className="font-bold text-slate-200">{playerCount} ghế</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      value={playerCount}
                      onChange={(e) => updatePlayerCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>4 người</span>
                      <span>10 người (chuẩn)</span>
                      <span>24 người</span>
                    </div>
                  </div>

                  {/* Names preview & quick editor */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        Danh sách tên ({playerNames.length} người):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRawNamesInput(playerNames.join('\n'));
                          setIsEditingNames(!isEditingNames);
                        }}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingNames ? 'Đóng' : 'Nhập nhanh'}</span>
                      </button>
                    </div>

                    {isEditingNames ? (
                      <div className="space-y-2 animate-fade-in">
                        <textarea
                          rows={6}
                          value={rawNamesInput}
                          onChange={(e) => setRawNamesInput(e.target.value)}
                          placeholder="Nhập tên người chơi (mỗi dòng một tên hoặc ngăn cách bằng dấu phẩy)..."
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEditedNames}
                          className="w-full py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Lưu & Cập Nhật Tên ({rawNamesInput.split(/[\n,;]+/).filter(Boolean).length} người)
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                        {playerNames.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                          >
                            <span className="text-purple-400 font-mono font-bold">#{i + 1}</span>
                            <span>{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CỘT 2: BỘ BÀI ĐỒNG BỘ (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-[#141624] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                        2. Bộ Bài Tương Ứng
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs flex items-center gap-1 text-rose-400 font-bold">
                        <WolfIcon className="w-3.5 h-3.5" /> {wolfCount} Sói
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-blue-400 font-bold">
                        👨‍🌾 {villagerCount} Dân
                      </span>
                      {otherCount > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-amber-400 font-bold">
                            🃏 {otherCount} Khác
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Templates Matching Filter */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      Bộ bài gợi ý cho {playerCount} người chơi:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
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
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-sm'
                                  : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="truncate mr-2">
                                <div className="font-bold text-xs truncate">{t.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {t.desc || (t.isPreset ? 'Gói gợi ý chuẩn' : 'Bộ bài người dùng lưu')}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                                  tplCount === playerCount ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400'
                                }`}>
                                  {tplCount} lá
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Role Cards in the Setup Deck */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        Danh sách thẻ bài ({selectedRoleIds.length}/{playerCount}):
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Bấm dấu x để bỏ thẻ bài
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 max-h-40 overflow-y-auto">
                      {selectedRoleIds.map((id, index) => {
                        const r = ROLES.find(x => x.id === id);
                        const isWolf = r?.teamCode === 'W';
                        return (
                          <span
                            key={`${id}-${index}`}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${
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

                  {/* Quick Add Role Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400">
                        Thêm vai trò vào bộ bài:
                      </span>
                      <div className="relative w-44">
                        <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
                        <input
                          type="text"
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          placeholder="Tìm vai..."
                          className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1">
                      {filteredRoles.slice(0, 16).map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleAddRoleToSetup(r.id)}
                          className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5 text-slate-500" />
                          <span>{r.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUẢN LÝ NHÓM NGƯỜI (ROSTERS MANAGER) */}
        {/* ============================================================== */}
        {activeTab === 'rosters' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Danh Sách Nhóm Người Chơi Đã Lưu</h3>
                <p className="text-xs text-slate-400">Lưu lại danh sách bạn bè thường chơi để nạp nhanh</p>
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
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Danh sách tên người chơi:</label>
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
                        onClick={async () => {
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Danh Sách Bộ Bài Mẫu</h3>
                <p className="text-xs text-slate-400">Bao gồm bộ bài tiêu chuẩn của game và bộ bài tùy chỉnh</p>
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
        {/* FOOTER ACTION BAR (ALWAYS VISIBLE ON SETUP TAB) */}
        {/* ============================================================== */}
        {activeTab === 'setup' && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0c0d16] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isCountMatched ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Khớp hoàn hảo: {playerCount} người chơi ⟷ {selectedRoleIds.length} lá bài</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-800 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>
                    Chưa khớp: {playerCount} người chơi nhưng bộ bài có {selectedRoleIds.length} lá (Lệch {Math.abs(playerCount - selectedRoleIds.length)})
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
              className="w-full sm:w-auto shadow-xl"
            >
              Áp Dụng & Bắt Đầu Ván Đấu Mới
            </GothicButton>
          </div>
        )}
      </div>
    </div>
  );
}
