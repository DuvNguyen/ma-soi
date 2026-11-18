import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PlayerSeatCard from './ui/PlayerSeatCard';
import SearchInput from './ui/SearchInput';
import { getPlayerRole, matchesSearch, removeVietnameseTones } from '../utils/roleUtils';
import triggerHaptic from '../utils/haptics';

export default function PlayerSeatPicker({
  players = [],
  selectedIds = [],
  onSelect,
  maxSelect = 1,
  disabledIds = [],
  variant = 'default', // 'cupid' | 'protect' | 'wolf' | 'seer' | 'witch' | 'default'
  isWolfPlayer = () => false,
  showRole = true,
  actionLabel = 'Chọn'
}) {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'slider'
  const [searchQuery, setSearchQuery] = useState('');
  const sliderRef = useRef(null);
  const [slidePage, setSlidePage] = useState(0);

  const filteredPlayers = players.filter(p => {
    if (!searchQuery) return true;
    const q = removeVietnameseTones(searchQuery);
    return matchesSearch(p.name, q) || String(p.id).includes(q);
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));

  const scrollSlider = (direction) => {
    if (direction === 'prev') {
      const prev = Math.max(0, slidePage - 1);
      setSlidePage(prev);
    } else {
      const next = Math.min(totalPages - 1, slidePage + 1);
      setSlidePage(next);
    }
  };

  const renderSeatItem = (p) => {
    const isSelected = selectedIds.includes(p.id);
    const isDisabled = disabledIds.includes(p.id);

    return (
      <PlayerSeatCard
        key={p.id}
        player={p}
        mode="pick"
        selected={isSelected}
        disabled={isDisabled}
        variant={variant}
        showRole={showRole}
        onClick={() => {
          triggerHaptic('tap');
          onSelect(p.id);
        }}
      />
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Control Switcher Bar: Theatre Matrix vs Slider + Compact Search Input */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5 shrink-0">
            <span>Ghế: {selectedIds.length}/{maxSelect}</span>
          </span>

          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Tìm tên..."
            className="w-28 sm:w-36"
          />
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`hit-44 px-2.5 py-1 rounded text-caption font-bold transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-purple-900 border border-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ma Trận Ghế
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`hit-44 px-2.5 py-1 rounded text-caption font-bold transition-all cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-purple-900 border border-purple-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thanh Trượt (Slider)
          </button>
        </div>
      </div>

      {/* MODE 1: THEATRE SEAT MATRIX (ALL SEATS VISIBLE IN 1 SCREEN) */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 animate-fade-in">
          {filteredPlayers.map(p => renderSeatItem(p))}
        </div>
      )}

      {/* MODE 2: CUSTOM HORIZONTAL SLIDER (SLIDE WITHOUT VERTICAL SCROLL) */}
      {viewMode === 'slider' && (
        <div className="space-y-2 animate-fade-in">
          {/* Slider Content */}
          <div className="grid grid-cols-3 gap-2">
            {filteredPlayers
              .slice(slidePage * pageSize, slidePage * pageSize + pageSize)
              .map(p => renderSeatItem(p))}
          </div>

          {/* Slider Navigation Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={slidePage === 0}
              onClick={() => scrollSlider('prev')}
              className="h-8 px-2.5 rounded-lg bg-[#141628] hover:bg-[#1e2038] disabled:opacity-30 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trang trước</span>
            </button>

            {/* Dots Pagination */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlidePage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    slidePage === i
                      ? 'bg-purple-500 w-5'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Trang ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={slidePage >= totalPages - 1}
              onClick={() => scrollSlider('next')}
              className="h-8 px-2.5 rounded-lg bg-[#141628] hover:bg-[#1e2038] disabled:opacity-30 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>Trang sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}