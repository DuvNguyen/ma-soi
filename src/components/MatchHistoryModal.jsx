import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Users, Trophy, Moon, Sun, Heart, Skull, 
  Trash2, Eye, Shield, AlertCircle, RefreshCw, ChevronRight 
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import ClawMarks from './ui/ClawMarks';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function MatchHistoryModal({ isOpen, onClose }) {
  const { showConfirm, showAlert } = useGothicDialog();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.ok) {
        setMatches(data.matches || []);
      } else {
        setErrorMessage(data.error || 'Không thể tải lịch sử trận đấu');
      }
    } catch (err) {
      setErrorMessage('Lỗi kết nối tới cơ sở dữ liệu Neon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = async (id) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/matches/${id}`);
      const data = await res.json();
      if (data.ok) {
        setSelectedMatch(data.match);
      } else {
        showAlert({
          title: 'CHI TIẾT VÁN ĐẤU',
          message: data.error || 'Không tìm thấy chi tiết ván đấu',
          variant: 'warning'
        });
      }
    } catch (err) {
      showAlert({
        title: 'LỖI TẢI DỮ LIỆU',
        message: 'Lỗi tải chi tiết trận đấu: ' + err.message,
        variant: 'blood'
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDeleteMatch = async (id, e) => {
    e.stopPropagation();
    showConfirm({
      title: 'XÓA LỊCH SỬ TRẬN ĐẤU?',
      message: 'Bạn có chắc muốn xóa bản ghi trận đấu này khỏi cơ sở dữ liệu Neon?\nHành động này không thể hoàn tác.',
      variant: 'blood',
      confirmText: 'Xóa Vĩnh Viễn 🩸',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.ok) {
            setMatches(prev => prev.filter(m => m.id !== id));
            if (selectedMatch?.id === id) {
              setSelectedMatch(null);
            }
          }
        } catch (err) {
          showAlert({
            title: 'LỖI XÓA TRẬN ĐẤU',
            message: 'Không thể xóa: ' + err.message,
            variant: 'blood'
          });
        }
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMatches();
      setSelectedMatch(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#180407] via-[#0d0204] to-[#070102] border-2 border-rose-600/90 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(225,29,72,0.5)] ring-1 ring-rose-500/50 overflow-hidden">
        {/* Werewolf Claw Marks on Corners */}
        <div className="absolute -top-6 -right-6 rotate-12 opacity-80 pointer-events-none">
          <ClawMarks size={130} color="#e11d48" />
        </div>
        <div className="absolute -bottom-8 -left-8 -rotate-45 opacity-50 pointer-events-none">
          <ClawMarks size={120} color="#be123c" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-purple-950 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-500/60 flex items-center justify-center text-purple-200 shadow-md">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cinzel font-black text-lg sm:text-xl text-slate-100 flex items-center gap-2">
                LỊCH SỬ CÁC VÁN ĐẤU MA SÓI
              </h3>
              <p className="text-xs text-slate-400">
                Dữ liệu được lưu trữ vĩnh viễn trên Neon PostgreSQL Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-purple-950">
          
          {/* Left Column: Match list */}
          <div className="md:col-span-5 p-4 overflow-y-auto max-h-[40vh] md:max-h-none space-y-2.5">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                Đang tải lịch sử đấu...
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Chưa có trận đấu nào được lưu trong hệ thống.
              </div>
            ) : (
              matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                const formattedDate = new Date(m.createdAt || m.startedAt).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMatch(m.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                        : 'bg-[#10121d] hover:bg-[#161828] border-slate-800 hover:border-purple-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-100 truncate pr-2">
                        {m.roomName}
                      </span>
                      {getWinnerBadge(m.winnerTeam)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-400" /> {m.playerCount} người
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-400" /> {m.totalRounds} vòng
                      </span>
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                      {m.cupidPair && m.cupidPair.length === 2 ? (
                        <span className="text-pink-300 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                          Cupid: #{m.cupidPair[0]} & #{m.cupidPair[1]}
                        </span>
                      ) : (
                        <span className="text-slate-500">Không có Cupid</span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteMatch(m.id, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="Xóa trận này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Match detail view */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {isLoadingDetail ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                Đang tải chi tiết ván đấu...
              </div>
            ) : !selectedMatch ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-400">Chọn một ván đấu ở danh sách bên trái để xem lại diễn biến chi tiết</p>
                <p className="text-xs text-slate-600 mt-1">Bao gồm danh sách người chơi, ai bị Sói cắn, ai bị treo cổ, cặp đôi tình nhân...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Header Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#121422] border border-purple-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base text-white">{selectedMatch.roomName}</h4>
                    {getWinnerBadge(selectedMatch.winnerTeam)}
                  </div>
                  <p className="text-xs text-emerald-300 font-semibold mb-2">
                    {selectedMatch.winnerDescription || 'Ván đấu đã kết thúc.'}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-2 border-t border-purple-900/60">
                    <div>Sĩ số: <strong>{selectedMatch.playerCount} người</strong></div>
                    <div>Số vòng: <strong>{selectedMatch.totalRounds} đêm/ngày</strong></div>
                    <div>Cặp đôi: <strong>{selectedMatch.cupidPair ? `#${selectedMatch.cupidPair[0]} & #${selectedMatch.cupidPair[1]}` : 'Không có'}</strong></div>
                  </div>
                </div>

                {/* Players Snapshot Grid */}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
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
                            <span>{p.role?.name || p.roleId || 'Dân làng'}</span>
                            {isLover && <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Night Events Timeline */}
                {selectedMatch.nightLogs && selectedMatch.nightLogs.length > 0 && (
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      Nhật Ký Các Đêm (Night Logs):
                    </h5>
                    <div className="p-3 bg-[#0a0c16] rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300 max-h-40 overflow-y-auto">
                      {selectedMatch.nightLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 font-mono text-[10px] mt-0.5">•</span>
                          <span>{typeof log === 'string' ? log : JSON.stringify(log)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day Events Timeline */}
                {selectedMatch.dayLogs && selectedMatch.dayLogs.length > 0 && (
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Nhật Ký Ban Ngày (Day Logs):
                    </h5>
                    <div className="p-3 bg-[#0a0c16] rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300 max-h-40 overflow-y-auto">
                      {selectedMatch.dayLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-mono text-[10px] mt-0.5">•</span>
                          <span>{typeof log === 'string' ? log : JSON.stringify(log)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-purple-950 bg-[#0d0e19] flex justify-end">
          <GothicButton variant="dark" size="sm" onClick={onClose}>
            Đóng Cửa Sổ
          </GothicButton>
        </div>
      </div>
    </div>
  );
}
