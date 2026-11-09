import React, { useState } from 'react';
import { ROLES, PRESETS } from '../data/roles';
import { Users, Sparkles, Check, Play, RefreshCw, X } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';

export default function SetupGameModal({ isOpen, onClose, onStartGame }) {
  if (!isOpen) return null;

  const [selectedPresetId, setSelectedPresetId] = useState('preset-9-11');
  const [playerCount, setPlayerCount] = useState(10);
  const [selectedRoleIds, setSelectedRoleIds] = useState(PRESETS[1].roleIds);
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 10 }, (_, i) => `Người chơi ${i + 1}`)
  );

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setPlayerCount(preset.playerCount);
    setSelectedRoleIds(preset.roleIds);
    setPlayerNames(Array.from({ length: preset.playerCount }, (_, i) => `Người chơi ${i + 1}`));
  };

  const toggleRole = (roleId) => {
    // add or remove one instance
    setSelectedRoleIds(prev => [...prev, roleId]);
  };

  const removeRole = (index) => {
    setSelectedRoleIds(prev => prev.filter((_, i) => i !== index));
  };

  const updatePlayerCount = (newCount) => {
    const val = Math.max(4, Math.min(30, newCount));
    setPlayerCount(val);
    setPlayerNames(prev => {
      const arr = [...prev];
      if (val > arr.length) {
        for (let i = arr.length; i < val; i++) arr.push(`Người chơi ${i + 1}`);
      } else {
        arr.length = val;
      }
      return arr;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame({
      playerCount,
      roleIds: selectedRoleIds,
      playerNames
    });
    onClose();
  };

  // Stats on selected roles
  const wolfRolesCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'W';
  }).length;

  const villagerRolesCount = selectedRoleIds.filter(id => {
    const r = ROLES.find(x => x.id === id);
    return r?.teamCode === 'V';
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12141f] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-950/60">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-lg text-slate-100">
                THIẾT LẬP VÁN CHƠI MỚI
              </h2>
              <p className="text-xs text-slate-400">
                Chọn gói gợi ý có sẵn hoặc tùy chỉnh số lượng người chơi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* 1. Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              1. Chọn Gói Cấu Hình Có Sẵn (Presets):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESETS.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40 text-rose-100'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {preset.desc}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-rose-400 mt-2">
                      {preset.playerCount} người chơi
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Player count slider */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Số Lượng Người Chơi:
              </span>
              <span className="font-black font-cinzel text-xl text-rose-400">
                {playerCount} người
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="24"
              value={playerCount}
              onChange={(e) => updatePlayerCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>4 người</span>
              <span>10 người (chuẩn)</span>
              <span>24 người (lớn)</span>
            </div>
          </div>

          {/* 3. Selected roles summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Danh Sách Thẻ Bài ({selectedRoleIds.length}/{playerCount}):
              </span>
              <div className="text-xs flex items-center gap-2">
                <span className="text-rose-400 font-bold">🐺 {wolfRolesCount} Sói</span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-400 font-bold">👨‍🌾 {villagerRolesCount} Dân</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 min-h-[70px]">
              {selectedRoleIds.map((id, index) => {
                const r = ROLES.find(x => x.id === id);
                return (
                  <span
                    key={`${id}-${index}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                      r?.teamCode === 'W'
                        ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                        : 'bg-blue-950/80 border-blue-800 text-blue-200'
                    }`}
                  >
                    <span>{r?.name}</span>
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="hover:text-white text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-purple-950/60 bg-[#0d0e18] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {selectedRoleIds.length !== playerCount ? (
              <span className="text-amber-400 font-medium">
                ⚠️ Số thẻ ({selectedRoleIds.length}) chưa khớp số người ({playerCount})
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                ✓ Đã khớp số lượng người chơi
              </span>
            )}
          </div>

          <GothicButton
            variant="witch"
            size="lg"
            icon={Play}
            onClick={handleSubmit}
            className="shadow-2xl"
          >
            Bắt Đầu Ván Chơi Ngay
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
