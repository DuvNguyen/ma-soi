import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, Trophy, Moon, Sun, Heart, Skull, 
  Trash2, Eye, Shield, AlertCircle, RefreshCw, ChevronRight, ArrowLeft
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import { useGothicDialog } from '../context/GothicDialogContext';
import { getPlayerRole, getRole } from '../utils/roleUtils';

export default function MatchHistoryModal({ isOpen, onClose }) {
  const { showConfirm, showAlert } = useGothicDialog();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // 1. Đọc dữ liệu đã lưu trong localStorage
    let localMatches = [];
    try {
      localMatches = JSON.parse(localStorage.getItem('werewolf_match_history') || '[]');
    } catch (e) {
      console.warn('Could not read match history from localStorage:', e);
    }

    // 2. Thử fetch từ Neon Database
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.ok && Array.isArray(data.matches)) {
        const combined = [...data.matches];
        // Hợp nhất dữ liệu nếu có trận mới trong localStorage chưa lên server
        localMatches.forEach(lm => {
          if (!combined.some(m => String(m.id) === String(lm.id))) {
            combined.unshift(lm);
          }
        });
        setMatches(combined);
      } else {
        setMatches(localMatches);
      }
    } catch (err) {
      // Offline fallback: Dùng dữ liệu localStorage
      setMatches(localMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (matchItem) => {
    // Nếu ván đấu đã có sẵn chi tiết playersSnapshot & nightLogs (như lưu từ localStorage)
    if (matchItem.playersSnapshot || matchItem.nightLogs) {
      setSelectedMatch(matchItem);
      setIsDetailOpen(true);
      return;
    }

    // Nếu chỉ là tóm tắt từ API, fetch chi tiết
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/matches/${matchItem.id}`);
      const data = await res.json();
      if (data.ok && data.match) {
        setSelectedMatch(data.match);
        setIsDetailOpen(true);
      } else {
        setSelectedMatch(matchItem);
        setIsDetailOpen(true);
      }
    } catch (err) {
      setSelectedMatch(matchItem);
      setIsDetailOpen(true);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDeleteMatch = async (id, e) => {
    if (e) e.stopPropagation();
    showConfirm({
      title: 'XÓA LỊCH SỬ TRẬN ĐẤU?',
      message: 'Bạn có chắc muốn xóa bản ghi trận đấu này khỏi lịch sử?\nHành động này không thể hoàn tác.',
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        // Xóa trong LocalStorage
        try {
          const localMatches = JSON.parse(localStorage.getItem('werewolf_match_history') || '[]');
          const updated = localMatches.filter(m => String(m.id) !== String(id));
          localStorage.setItem('werewolf_match_history', JSON.stringify(updated));
        } catch (e) {}

        // Cập nhật state UI ngay lập tức
        setMatches(prev => prev.filter(m => String(m.id) !== String(id)));
        if (selectedMatch && String(selectedMatch.id) === String(id)) {
          setSelectedMatch(null);
          setIsDetailOpen(false);
        }

        // Xóa trên Neon API (nếu có kết nối)
        try {
          await fetch(`/api/matches/${id}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('API delete failed, deleted from local only:', err);
        }
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMatches();
      setSelectedMatch(null);
      setIsDetailOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getWinnerBadge = (team) => {
    switch (team) {
      case 'V':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-600">🔵 Phe Dân Làng Thắng</span>;
      case 'W':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-600">🔴 Phe Ma Sói Thắng</span>;
      case '3':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500">🟣 Phe Thứ Ba Thắng</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">Chưa Hoàn Thành</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407]/90 via-[#0d0204]/85 to-[#070102]/90 backdrop-blur-md border-2 border-rose-600/90 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 overflow-hidden">
        {/* Werewolf Claw Marks on Corners */}
        <div className="absolute -top-6 -right-6 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={130} color="#e11d48" />
        </div>
        <div className="absolute -bottom-8 -left-8 -rotate-45 opacity-50 pointer-events-none">
          <ClawMarks size={120} color="#be123c" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-950/80 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-500/60 flex items-center justify-center text-purple-200 shadow-md shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cinzel font-black text-base sm:text-xl text-slate-100 flex items-center gap-2">
                LỊCH SỬ CÁC VÁN ĐẤU MA SÓI
              </h3>
              <p className="text-xs text-rose-300/80">
                Lưu trữ các diễn biến ván đấu (LocalStorage & Neon DB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchMatches}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matches List Body (Full Width, No cramped columns) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Lịch sử các ván đấu:</span>
            <span className="text-amber-400 font-semibold">{matches.length} ván đấu</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              Đang tải lịch sử đấu...
            </div>
          ) : errorMessage && matches.length === 0 ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm italic">
              Chưa có trận đấu nào được lưu. Khi một ván đấu kết thúc, hệ thống sẽ tự động lưu lại tại đây!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matches.map((m) => {
                const formattedDate = new Date(m.createdAt || m.startedAt || Date.now()).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div
                    key={m.id}
                    onClick={() => handleOpenDetail(m)}
                    className="p-4 rounded-2xl bg-[#141624] border border-slate-800 hover:border-rose-600/80 transition-all cursor-pointer flex flex-col justify-between shadow-lg group hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors truncate">
                          {m.roomName || `Ván đấu Ma Sói (${m.playerCount || 0} người)`}
                        </span>
                        {getWinnerBadge(m.winnerTeam)}
                      </div>

                      {m.winnerDescription && (
                        <p className="text-xs text-emerald-400/90 mb-2 line-clamp-1 font-medium">
                          {m.winnerDescription}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-400" /> {m.playerCount} người
                        </span>
                        <span className="flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-indigo-400" /> {m.totalRounds || m.roundNumber || 1} vòng
                        </span>
                        <span className="text-[11px] text-slate-500">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-purple-950/60 text-xs">
                      <div className="text-[11px]">
                        {m.cupidPair && m.cupidPair.length === 2 ? (
                          <span className="text-pink-300 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                            Cupid: #{m.cupidPair[0]} & #{m.cupidPair[1]}
                          </span>
                        ) : (
                          <span className="text-slate-500">Không có Cupid</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMatch(m.id, e)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                          title="Xóa trận này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold text-rose-300 group-hover:text-rose-200 flex items-center gap-0.5">
                          Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-purple-950 bg-[#0d0e19] flex justify-end">
          <GothicButton variant="dark" size="sm" onClick={onClose}>
            Đóng Cửa Sổ
          </GothicButton>
        </div>
      </div>

      {/* SEPARATE MATCH DETAIL MODAL (MODAL CHI TIẾT RIÊNG CHO TỪNG VÁN ĐẤU) */}
      {isDetailOpen && selectedMatch && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative bg-gradient-to-b from-[#190408]/95 via-[#0e0205]/95 to-[#080103]/95 border-2 border-rose-500/90 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-[0_0_60px_rgba(225,29,72,0.6)] ring-1 ring-rose-400/50 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-rose-950/90 flex items-center justify-between bg-gradient-to-r from-rose-950/60 to-transparent">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/80 cursor-pointer transition-colors shrink-0"
                  title="Quay lại danh sách"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="font-cinzel font-black text-sm sm:text-base text-rose-100 truncate">
                    {selectedMatch.roomName || 'Chi Tiết Ván Đấu'}
                  </h3>
                  <p className="text-[11px] text-rose-300/80">
                    {new Date(selectedMatch.createdAt || Date.now()).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getWinnerBadge(selectedMatch.winnerTeam)}
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-4">
              {/* Winner Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#121422] border border-purple-800/80 shadow-md">
                <p className="text-xs sm:text-sm text-emerald-300 font-bold mb-2">
                  {selectedMatch.winnerDescription || selectedMatch.winnerDesc || 'Ván đấu đã kết thúc.'}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-2 border-t border-purple-900/60">
                  <div>Sĩ số: <strong>{selectedMatch.playerCount} người</strong></div>
                  <div>
                    Số vòng: <strong>{selectedMatch.totalRounds || selectedMatch.roundNumber || 1} vòng</strong>
                    {selectedMatch.totalDays || selectedMatch.totalNights ? (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({selectedMatch.totalNights || 1} đêm, {selectedMatch.totalDays || 1} ngày)
                      </span>
                    ) : null}
                  </div>
                  <div>Cặp đôi: <strong>{selectedMatch.cupidPair ? `#${selectedMatch.cupidPair[0]} & #${selectedMatch.cupidPair[1]}` : 'Không có'}</strong></div>
                </div>
              </div>

              {/* Players Snapshot Grid */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5 font-cinzel">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Danh Sách Người Chơi Lúc Kết Thúc Ván:
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(selectedMatch.playersSnapshot || []).map((p) => {
                    const isLover = selectedMatch.cupidPair?.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                          p.isAlive
                            ? 'bg-[#101322] border-slate-800 text-slate-200'
                            : 'bg-black/50 border-rose-950 text-slate-500 line-through'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">#{p.id} {p.name}</span>
                          {p.isAlive ? (
                            <span className="text-[9px] text-emerald-400 font-bold">Sống</span>
                          ) : (
                            <span className="text-[9px] text-rose-500 font-bold">Chết</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                          <span>{getPlayerRole(p)?.name || p.role?.name || p.currentRoleId || p.roleId || 'Chưa gán vai'}</span>
                          {isLover && <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronicle Diary */}
              {(() => {
                let diaryChapters = [];

                if (Array.isArray(selectedMatch.nightLogs) && selectedMatch.nightLogs.length > 0) {
                  const firstItem = selectedMatch.nightLogs[0];
                  if (typeof firstItem === 'object' && firstItem !== null && (firstItem.phase || firstItem.logs)) {
                    diaryChapters = selectedMatch.nightLogs;
                  } else {
                    diaryChapters.push({
                      phase: 'Đêm 1',
                      type: 'night',
                      round: 1,
                      logs: selectedMatch.nightLogs
                    });
                    if (Array.isArray(selectedMatch.dayLogs) && selectedMatch.dayLogs.length > 0) {
                      diaryChapters.push({
                        phase: 'Ngày 1',
                        type: 'day',
                        round: 1,
                        logs: selectedMatch.dayLogs
                      });
                    }
                  }
                } else if (Array.isArray(selectedMatch.dayLogs) && selectedMatch.dayLogs.length > 0) {
                  diaryChapters.push({
                    phase: 'Ngày 1',
                    type: 'day',
                    round: 1,
                    logs: selectedMatch.dayLogs
                  });
                }

                if (diaryChapters.length === 0) return null;

                // Sắp xếp thứ tự thời gian chuẩn xác: Đêm 1 -> Ngày 1 -> Đêm 2 -> Ngày 2...
                const sortedChapters = [...diaryChapters].sort((a, b) => {
                  const extractRound = (item) => {
                    if (typeof item.round === 'number') return item.round;
                    const match = String(item.phase || '').match(/\d+/);
                    return match ? parseInt(match[0], 10) : 1;
                  };
                  const rA = extractRound(a);
                  const rB = extractRound(b);
                  if (rA !== rB) return rA - rB;
                  const isNightA = a.type === 'night' || (a.phase && a.phase.includes('Đêm'));
                  const isNightB = b.type === 'night' || (b.phase && b.phase.includes('Đêm'));
                  return isNightA ? -1 : isNightB ? 1 : 0;
                });

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-amber-200 font-cinzel flex items-center gap-2">
                        <span>📖</span>
                        QUYỂN NHẬT KÝ VÁN ĐẤU (DIARY CHRONICLES):
                      </h5>
                      <span className="text-[11px] text-slate-400 italic">
                        Diễn biến từng đêm & ngày
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                      {sortedChapters.map((chapter, cIdx) => {
                        const isDay = chapter.type === 'day' || (chapter.phase && chapter.phase.includes('Ngày'));
                        const logsList = Array.isArray(chapter.logs) ? chapter.logs : [chapter.logs].filter(Boolean);

                        return (
                          <div 
                            key={cIdx}
                            className={`p-3 rounded-2xl border transition-all ${
                              isDay
                                ? 'bg-gradient-to-r from-[#201507]/70 to-[#120c04]/70 border-amber-700/60 shadow-sm'
                                : 'bg-gradient-to-r from-[#170a2a]/70 to-[#0e061a]/70 border-purple-800/60 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                              {isDay ? (
                                <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/80 flex items-center justify-center text-amber-400 shadow-sm">
                                  <Sun className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-500/80 flex items-center justify-center text-purple-300 shadow-sm">
                                  <Moon className="w-3.5 h-3.5 fill-current" />
                                </div>
                              )}
                              <span className={`font-cinzel font-black text-xs tracking-wide ${
                                isDay ? 'text-amber-200' : 'text-purple-200'
                              }`}>
                                {chapter.phase || (isDay ? `Ban Ngày ${chapter.round || cIdx + 1}` : `Ban Đêm ${chapter.round || cIdx + 1}`)}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-2 text-xs">
                              {logsList.map((log, lIdx) => (
                                <div key={lIdx} className="flex items-start gap-2 text-slate-300">
                                  <span className={`text-[10px] mt-0.5 shrink-0 ${isDay ? 'text-amber-400 font-bold' : 'text-purple-400 font-bold'}`}>
                                    ✦
                                  </span>
                                  <span className="leading-relaxed">
                                    {typeof log === 'string' ? log : JSON.stringify(log)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-rose-950/80 bg-[#0d0205] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="text-xs text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại danh sách</span>
              </button>
              <GothicButton variant="dark" size="sm" onClick={() => setIsDetailOpen(false)}>
                Đóng Chi Tiết
              </GothicButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
