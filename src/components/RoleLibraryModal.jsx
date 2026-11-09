import React, { useState } from 'react';
import { ROLES } from '../data/roles';
import { BookOpen, Search, X, Shield, Eye, Skull } from 'lucide-react';

export default function RoleLibraryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [activeRole, setActiveRole] = useState(ROLES[0]);

  const filteredRoles = ROLES.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'ALL' || r.teamCode === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12141f] border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-lg text-slate-100">
                THƯ VIỆN 48 VAI TRÒ MA SÓI
              </h2>
              <p className="text-xs text-slate-400">
                Tra cứu nhanh kỹ năng, thứ tự gọi và khẩu lệnh Quản trò
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 md:p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vai trò hoặc kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'V', label: 'Phe Dân [V]' },
              { id: 'W', label: 'Phe Sói [W]' },
              { id: '3', label: 'Phe Thứ 3 [3]' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedTeam(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedTeam === f.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Left List, Right Detail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Roles list */}
          <div className="w-full md:w-80 border-r border-slate-800/80 overflow-y-auto p-2 space-y-1.5 max-h-[40vh] md:max-h-none">
            {filteredRoles.map(r => {
              const isActive = activeRole?.id === r.id;
              const isWolf = r.teamCode === 'W';
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between border cursor-pointer ${
                    isActive
                      ? isWolf
                        ? 'bg-gradient-to-r from-rose-950 to-[#2e0509] border-rose-500 text-white shadow-[0_0_18px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                        : 'bg-gradient-to-r from-purple-950 to-[#22073d] border-purple-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.5)] ring-1 ring-purple-400'
                      : isWolf
                      ? 'bg-[#180507] hover:bg-[#26070a] border-rose-800/80 hover:border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.3)] ring-1 ring-rose-600/40 text-slate-200'
                      : 'bg-[#0f111c]/60 hover:bg-[#161828] border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold font-cinzel border ${
                      isWolf ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {r.wakeOrder < 80 ? r.wakeOrder : '☀️'}
                    </div>
                    <div className="truncate">
                      <div className={`font-bold text-xs truncate ${isWolf ? 'text-rose-200' : ''}`}>{r.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{r.enName}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                    isWolf 
                      ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]' 
                      : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    {r.teamCode}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Role Full Spec */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {activeRole && (
              <>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Card Art Preview */}
                  <div className="w-32 sm:w-40 aspect-[4/5] rounded-2xl bg-slate-950 border border-slate-800 p-2 shrink-0 flex items-center justify-center shadow-xl">
                    <img
                      src={activeRole.image}
                      alt={activeRole.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold">
                        {activeRole.expansion}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        activeRole.teamCode === 'W'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        [{activeRole.teamCode}] {activeRole.team}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black font-cinzel text-slate-100">
                      {activeRole.name}
                    </h3>
                    <div className="text-sm text-slate-400 italic">
                      {activeRole.enName} • Thứ tự thức dậy: #{activeRole.wakeOrder} ({activeRole.wakeTime})
                    </div>

                    <p className="text-xs text-rose-300/90 font-medium bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/30">
                      {activeRole.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      📖 Chi Tiết Năng Lực & Luật Chơi:
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeRole.fullDesc}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                      🗣️ Kịch Bản Quản Trò Gọi Thức Dậy:
                    </h4>
                    <p className="text-xs text-purple-200 italic">
                      "{activeRole.gmCall}"
                    </p>
                  </div>

                  {activeRole.notes && activeRole.notes.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                        ⚠️ Lưu Ý Quan Trọng Cho Quản Trò:
                      </h4>
                      <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside">
                        {activeRole.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
