import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Skull, Shield, Eye, Flame, Check } from 'lucide-react';
import WolfIcon from './ui/WolfIcon';
import { getPlayerRole } from '../utils/roleUtils';
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
  const sliderRef = useRef(null);
  const [slidePage, setSlidePage] = useState(0);

  const pageSize = 6;
  const totalPages = Math.ceil(players.length / pageSize);

  const scrollSlider = (direction) => {
    if (direction === 'prev') {
      const prev = Math.max(0, slidePage - 1);
      setSlidePage(prev);
    } else {
      const next = Math.min(totalPages - 1, slidePage + 1);
      setSlidePage(next);
    }
  };

  const getVariantStyles = (isSelected, isWolf, isDisabled) => {
    if (isDisabled) {
      return 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600';
    }

    if (isSelected) {
      switch (variant) {
        case 'cupid':
          return 'bg-gradient-to-r from-pink-950 via-[#3b124d] to-pink-950 border-pink-500 text-white shadow-[0_0_18px_rgba(236,72,153,0.6)] ring-1 ring-pink-400 scale-[1.03]';
        case 'protect':
          return 'bg-teal-950 border-teal-400 text-teal-100 shadow-[0_0_18px_rgba(20,184,166,0.6)] ring-1 ring-teal-400 scale-[1.03]';
        case 'wolf':
          return 'bg-gradient-to-r from-rose-950 via-[#3b090e] to-rose-950 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.7)] ring-1 ring-rose-400 scale-[1.03]';
        case 'seer':
          return 'bg-purple-950 border-purple-400 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.6)] ring-1 ring-purple-400 scale-[1.03]';
        default:
          return 'bg-purple-950 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.03]';
      }
    }

    if (isWolf && variant !== 'wolf') {
      return 'bg-gradient-to-b from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 text-slate-200 shadow-sm';
    }

    return 'bg-[#101322] hover:bg-[#181c33] border-slate-800 hover:border-purple-600 text-slate-300 shadow-sm';
  };

  const renderSeatItem = (p) => {
    const isSelected = selectedIds.includes(p.id);
    const isDisabled = disabledIds.includes(p.id);
    const isWolf = isWolfPlayer(p);

    return (
      <button
        key={p.id}
        type="button"
        disabled={isDisabled}
        onClick={() => {
          triggerHaptic('tap');
          onSelect(p.id);
        }}
        className={`p-2 rounded-xl border text-left transition-all duration-75 select-none touch-manipulation active:scale-95 cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[72px] relative overflow-hidden ${getVariantStyles(
          isSelected,
          isWolf,
          isDisabled
        )}`}
      >
        {/* Top seat bar indicator */}
        <div className={`w-6 h-0.5 rounded-full mb-1 ${
          isSelected ? 'bg-white' : isWolf ? 'bg-rose-500' : 'bg-purple-500/60'
        }`}></div>

        {/* Seat Header: Seat Number + Status Icon */}
        <div className="flex items-center justify-between w-full">
          <span className={`font-mono font-black text-xs sm:text-sm ${
            isSelected ? 'text-white' : isWolf ? 'text-rose-300' : 'text-purple-300'
          }`}>
            #{p.id}
          </span>

          {isSelected && (
            variant === 'cupid' ? (
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500 animate-bounce" />
            ) : variant === 'protect' ? (
              <Shield className="w-3.5 h-3.5 text-teal-300 fill-teal-400" />
            ) : variant === 'wolf' ? (
              <Skull className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" />
            ) : variant === 'seer' ? (
              <Eye className="w-3.5 h-3.5 text-purple-300" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )
          )}
          {!isSelected && isWolf && (
            <WolfIcon className="w-3 h-3 text-rose-400 inline" />
          )}
        </div>

        {/* Player Name */}
        <div className="font-bold text-xs truncate w-full mt-0.5">
          <span className={isSelected ? 'text-white font-black' : isWolf ? 'text-rose-200' : 'text-slate-100'}>
            {p.name}
          </span>
        </div>

        {/* Role or Action hint */}
        {showRole && (
          <div className="text-[9px] text-slate-400 truncate w-full mt-0.5">
            {getPlayerRole(p)?.name || (isDisabled ? 'Bị cấm' : 'Chưa lộ vai')}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Control Switcher Bar: Theatre Matrix vs Slider */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
          <span>Ghế Ngồi: {selectedIds.length}/{maxSelect} đã chọn</span>
        </span>

        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
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
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
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
          {players.map(p => renderSeatItem(p))}
        </div>
      )}

      {/* MODE 2: CUSTOM HORIZONTAL SLIDER (SLIDE WITHOUT VERTICAL SCROLL) */}
      {viewMode === 'slider' && (
        <div className="space-y-2 animate-fade-in">
          {/* Slider Content */}
          <div className="grid grid-cols-3 gap-2">
            {players
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