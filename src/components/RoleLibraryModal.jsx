import React, { useState, useMemo } from 'react';
import { ROLES } from '../data/roles';
import { 
  BookOpen, Search, X, Shield, Eye, Skull, ChevronLeft, ChevronRight, 
  LayoutGrid, List, Sparkles, Sun, Moon, ArrowLeft, Info
} from 'lucide-react';
import WolfIcon from './ui/WolfIcon';

export default function RoleLibraryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [activeRole, setActiveRole] = useState(ROLES[0]);
  const [mobileView, setMobileView] = useState('grid'); // 'grid' | 'detail'
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' | 'list'

  const filteredRoles = useMemo(() => {
    return ROLES.filter(r => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        r.name.toLowerCase().includes(q) ||
        r.enName.toLowerCase().includes(q) ||
        (r.shortDesc && r.shortDesc.toLowerCase().includes(q)) ||
        (r.fullDesc && r.fullDesc.toLowerCase().includes(q));
      const matchesTeam = selectedTeam === 'ALL' || r.teamCode === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [searchTerm, selectedTeam]);

  // Current index in filtered list for Next / Prev navigation
  const currentIndex = filteredRoles.findIndex(r => r.id === activeRole?.id);

  const handleSelectRole = (role) => {
    setActiveRole(role);
    setMobileView('detail');
  };

  const handlePrevRole = () => {
    if (filteredRoles.length === 0) return;
    const nextIdx = (currentIndex - 1 + filteredRoles.length) % filteredRoles.length;
    setActiveRole(filteredRoles[nextIdx]);
  };

  const handleNextRole = () => {
    if (filteredRoles.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredRoles.length;
    setActiveRole(filteredRoles[nextIdx]);
  };

  const teamCounts = useMemo(() => ({
    ALL: ROLES.length,
    V: ROLES.filter(r => r.teamCode === 'V').length,
    W: ROLES.filter(r => r.teamCode === 'W').length,
    3: ROLES.filter(r => r.teamCode === '3').length,
    '?': ROLES.filter(r => r.teamCode === '?').length,
  }), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-sm animate-fade-in touch-manipulation">
      <div className="bg-[#0e101a]/90 border border-purple-950/80 rounded-2xl sm:rounded-3xl w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.95)] backdrop-blur-md flex flex-col h-[94vh] max-h-[94vh] overflow-hidden text-slate-100">
        
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="p-3 sm:p-4 border-b border-purple-950/60 bg-[#090b14]/95 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Back button when inside detail inspector */}
            <div className="md:hidden">
              {mobileView === 'detail' ? (
                <button
                  type="button"
                  onClick={() => setMobileView('grid')}
                  className="h-9 px-2.5 rounded-xl bg-purple-950/80 border border-purple-700/80 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Bộ Sưu Tập</span>
                </button>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Desktop Brand Icon */}
            <div className="hidden md:flex w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-700/60 items-center justify-center text-purple-300 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h2 className="font-cinzel font-black text-sm sm:text-base md:text-lg text-slate-100 tracking-wide truncate">
                THƯ VIỆN {ROLES.length} VAI TRÒ
              </h2>
              <p className="text-[10px] sm:text-xs text-purple-300/70 truncate hidden sm:block">
                Bách khoa toàn thư kỹ năng, thứ tự gọi đêm và khẩu lệnh Quản trò
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Toggle on Mobile (Grid 3 cols vs List) */}
            <div className="flex md:hidden items-center bg-[#07080e] border border-purple-950/80 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => { setDisplayMode('grid'); setMobileView('grid'); }}
                title="Dạng lưới thẻ bài"
                aria-label="Chuyển chế độ xem dạng lưới thẻ bài"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  displayMode === 'grid' && mobileView === 'grid' ? 'bg-purple-900/80 text-white' : 'text-slate-400'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setDisplayMode('list'); setMobileView('grid'); }}
                title="Dạng danh sách"
                aria-label="Chuyển chế độ xem dạng danh sách"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  displayMode === 'list' && mobileView === 'grid' ? 'bg-purple-900/80 text-white' : 'text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng thư viện vai trò"
              className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= SEARCH & FACTION TABS (HIDDEN IN MOBILE DETAIL) ================= */}
        <div className={`p-2.5 sm:p-3 border-b border-purple-950/50 bg-[#07080f]/90 shrink-0 ${
          mobileView === 'detail' ? 'hidden md:block' : 'block'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-purple-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên vai trò, tiếng Anh hoặc kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0f1b] border border-purple-950/90 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Faction Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 scrollbar-none shrink-0">
              {[
                { id: 'ALL', label: `Tất Cả (${teamCounts.ALL})` },
                { id: 'V', label: `Phe Dân (${teamCounts.V})`, color: 'text-blue-300' },
                { id: 'W', label: `Phe Sói (${teamCounts.W})`, color: 'text-rose-300' },
                { id: '3', label: `Phe Thứ 3 (${teamCounts['3']})`, color: 'text-amber-300' },
                { id: '?', label: `Tùy Biến (${teamCounts['?']})`, color: 'text-emerald-300' }
              ].map(f => {
                const isSelected = selectedTeam === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedTeam(f.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 border ${
                      isSelected
                        ? f.id === 'W'
                          ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                          : f.id === '3'
                          ? 'bg-amber-950 text-amber-200 border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : f.id === '?'
                          ? 'bg-emerald-950 text-emerald-200 border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'bg-purple-950 text-purple-200 border-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-[#0d0f1b] border-purple-950/80 text-slate-400 hover:text-slate-200 hover:border-purple-800'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT SPLIT VIEW ================= */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* ---------------- LEFT: CODEX INVENTORY (ROLES LIST/GRID) ---------------- */}
          <div className={`w-full md:w-80 lg:w-96 md:border-r border-purple-950/70 overflow-y-auto p-2 sm:p-2.5 bg-[#0b0c15] ${
            mobileView === 'detail' ? 'hidden md:block' : 'block'
          }`}>
            {filteredRoles.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                <p className="text-xs">Không tìm thấy vai trò nào phù hợp</p>
              </div>
            ) : displayMode === 'grid' ? (
              /* RPG CARD INVENTORY GRID (3 Columns on Mobile, 3 on Tablet/Desktop) */
              <div className="grid grid-cols-3 gap-2">
                {filteredRoles.map(r => {
                  const isActive = activeRole?.id === r.id;
                  const isWolf = r.teamCode === 'W';
                  const isNeutral = r.teamCode === '3';
                  const isVariable = r.teamCode === '?';

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`group relative rounded-xl border p-1.5 transition-all flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 ${
                        isActive
                          ? isWolf
                            ? 'bg-gradient-to-b from-[#38090f] to-[#1c0407] border-rose-500 shadow-[0_0_18px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                            : isNeutral
                            ? 'bg-gradient-to-b from-[#382009] to-[#1c1004] border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.6)] ring-1 ring-amber-400'
                            : isVariable
                            ? 'bg-gradient-to-b from-[#06301d] to-[#03190e] border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400'
                            : 'bg-gradient-to-b from-[#280d47] to-[#140624] border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.6)] ring-1 ring-purple-400'
                          : isWolf
                          ? 'bg-[#150406] hover:bg-[#23060a] border-rose-900/60 hover:border-rose-600 text-slate-200'
                          : isNeutral
                          ? 'bg-[#170e04] hover:bg-[#241606] border-amber-900/60 hover:border-amber-600 text-slate-200'
                          : isVariable
                          ? 'bg-[#04160e] hover:bg-[#072517] border-emerald-900/60 hover:border-emerald-600 text-slate-200'
                          : 'bg-[#0f111d] hover:bg-[#171a2e] border-purple-950/70 hover:border-purple-600 text-slate-300'
                      }`}
                    >
                      {/* Top Badges: Wake order & Team */}
                      <div className="w-full flex items-center justify-between mb-1 px-0.5">
                        <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                          isWolf ? 'bg-rose-950/80 text-rose-300' : isNeutral ? 'bg-amber-950/80 text-amber-300' : isVariable ? 'bg-emerald-950/80 text-emerald-300' : 'bg-purple-950/80 text-purple-300'
                        }`}>
                          {r.wakeOrder < 80 ? `#${r.wakeOrder}` : '☀️'}
                        </span>

                        {isWolf ? (
                          <WolfIcon className="w-2.5 h-2.5 text-rose-400" />
                        ) : isNeutral ? (
                          <span className="text-[9px] text-amber-400 font-black">3</span>
                        ) : isVariable ? (
                          <span className="text-[9px] text-emerald-400 font-black" title={r.team}>?</span>
                        ) : (
                          <span className="text-[9px] text-blue-400 font-bold">V</span>
                        )}
                      </div>

                      {/* Tarot Card Artwork Thumbnail */}
                      <div className="w-full aspect-[3/4] rounded-lg bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center mb-1 relative shadow-inner">
                        {r.image ? (
                          <img
                            src={r.image}
                            alt={r.name}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-xl flex items-center justify-center">{isWolf ? <WolfIcon className="w-6 h-6" /> : isNeutral ? '🎭' : isVariable ? '🔮' : '👨‍🌾'}</span>
                        )}
                      </div>

                      {/* Role Name */}
                      <div className={`w-full text-[11px] font-bold truncate leading-tight ${
                        isWolf ? 'text-rose-200' : isNeutral ? 'text-amber-200' : isVariable ? 'text-emerald-200' : 'text-slate-200'
                      }`}>
                        {r.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* COMPACT LIST VIEW */
              <div className="space-y-1.5">
                {filteredRoles.map(r => {
                  const isActive = activeRole?.id === r.id;
                  const isWolf = r.teamCode === 'W';
                  const isNeutral = r.teamCode === '3';
                  const isVariable = r.teamCode === '?';

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-95 ${
                        isActive
                          ? isWolf
                            ? 'bg-gradient-to-r from-rose-950 to-[#280509] border-rose-500 text-white shadow-md'
                            : isNeutral
                            ? 'bg-gradient-to-r from-amber-950 to-[#281705] border-amber-500 text-white shadow-md'
                            : isVariable
                            ? 'bg-gradient-to-r from-emerald-950 to-[#042816] border-emerald-500 text-white shadow-md'
                            : 'bg-gradient-to-r from-purple-950 to-[#200638] border-purple-500 text-white shadow-md'
                          : isWolf
                          ? 'bg-[#160406] hover:bg-[#24060a] border-rose-900/60 text-slate-200'
                          : isNeutral
                          ? 'bg-[#180e04] hover:bg-[#261706] border-amber-900/60 text-slate-200'
                          : isVariable
                          ? 'bg-[#04180e] hover:bg-[#062617] border-emerald-900/60 text-slate-200'
                          : 'bg-[#0f111d] hover:bg-[#16192c] border-purple-950/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold font-cinzel border ${
                          isWolf 
                            ? 'bg-rose-950 text-rose-300 border-rose-800' 
                            : isNeutral 
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : isVariable
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-900 text-slate-300 border-purple-950'
                        }`}>
                          {r.wakeOrder < 80 ? r.wakeOrder : '☀️'}
                        </div>
                        <div className="truncate">
                          <div className={`font-bold text-xs truncate ${isWolf ? 'text-rose-200' : isNeutral ? 'text-amber-200' : isVariable ? 'text-emerald-200' : 'text-slate-100'}`}>
                            {r.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{r.enName}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                        isWolf
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : isNeutral
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : isVariable
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}>
                        {r.teamCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------------- RIGHT: RPG CARD INSPECTOR (FULL DETAIL) ---------------- */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4 bg-[#0a0c14] ${
            mobileView === 'grid' ? 'hidden md:block' : 'block'
          }`}>
            {activeRole ? (
              <div className="max-w-2xl mx-auto space-y-4">
                
                {/* Mobile Sub-Navigation Bar: Previous / Next Card Navigation */}
                <div className="flex items-center justify-between border-b border-purple-950/60 pb-3">
                  <button
                    type="button"
                    onClick={handlePrevRole}
                    className="h-8 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Trước</span>
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] font-mono text-purple-300/80 font-bold">
                      {currentIndex + 1} / {filteredRoles.length} Thẻ Bài
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextRole}
                    className="h-8 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Hero Card Showcase: Card Artwork & Main Badges */}
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
                  {/* Tarot Card Artwork */}
                  <div className="relative shrink-0">
                    <div className={`w-36 h-52 sm:w-44 sm:h-64 rounded-2xl bg-black border-2 p-1.5 shadow-2xl flex items-center justify-center transition-all ${
                      activeRole.teamCode === 'W'
                        ? 'border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                        : activeRole.teamCode === '3'
                        ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.6)] ring-1 ring-amber-400'
                        : 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] ring-1 ring-purple-400'
                    }`}>
                      {activeRole.image ? (
                        <img
                          src={activeRole.image}
                          alt={activeRole.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-6xl flex items-center justify-center">
                          {activeRole.teamCode === 'W' ? <WolfIcon className="w-16 h-16" /> : activeRole.teamCode === '3' ? '🎭' : '👨‍🌾'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Character Header Info */}
                  <div className="space-y-2 flex-1 w-full">
                    {/* Faction & Expansion Chips */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                        activeRole.teamCode === 'W'
                          ? 'bg-rose-950 text-rose-300 border-rose-700 shadow-sm'
                          : activeRole.teamCode === '3'
                          ? 'bg-amber-950 text-amber-300 border-amber-700 shadow-sm'
                          : 'bg-blue-950 text-blue-300 border-blue-700 shadow-sm'
                      }`}>
                        [{activeRole.teamCode}] {activeRole.team}
                      </span>

                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-medium">
                        {activeRole.expansion || 'Ma Sói Cơ Bản'}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black font-cinzel text-slate-100 tracking-wide">
                      {activeRole.name}
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-400 italic">
                      {activeRole.enName} • Thứ tự thức dậy: #{activeRole.wakeOrder} ({activeRole.wakeTime})
                    </div>

                    {/* Quick Tactical Quote */}
                    {activeRole.shortDesc && (
                      <p className={`text-xs p-2.5 rounded-xl border font-medium leading-relaxed ${
                        activeRole.teamCode === 'W'
                          ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                          : activeRole.teamCode === '3'
                          ? 'bg-amber-950/30 border-amber-900/50 text-amber-200'
                          : 'bg-purple-950/30 border-purple-900/50 text-purple-200'
                      }`}>
                        {activeRole.shortDesc}
                      </p>
                    )}
                  </div>
                </div>

                {/* RPG Lore & Mechanics Bento Panels */}
                <div className="space-y-2.5 pt-1 text-left">
                  {/* Detailed Description */}
                  <div className="p-3 sm:p-4 rounded-xl bg-[#0f111d] border border-purple-950/80 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
                      <span>📖 Chi Tiết Năng Lực & Luật Chơi:</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeRole.fullDesc}
                    </p>
                  </div>

                  {/* GM Script */}
                  {activeRole.gmCall && (
                    <div className="p-3 sm:p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                        <span>🗣️ Kịch Bản Quản Trò Gọi Thức Dậy:</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-200 italic leading-relaxed">
                        "{activeRole.gmCall}"
                      </p>
                    </div>
                  )}

                  {/* Important Notes */}
                  {activeRole.notes && activeRole.notes.length > 0 && (
                    <div className="p-3 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
                        <span>⚠️ Lưu Ý Quan Trọng Cho Quản Trò:</span>
                      </h4>
                      <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside leading-relaxed">
                        {activeRole.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p className="text-xs">Chọn vai trò để xem chi tiết</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
