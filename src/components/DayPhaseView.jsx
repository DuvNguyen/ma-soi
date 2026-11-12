import React, { useState, useEffect } from 'react';
import { Sun, Skull, Flame, ShieldAlert, Clock, Moon, AlertTriangle, Check, UserX, RotateCcw, Gavel, Play, Pause, Star, Award, ChevronDown, ChevronUp, Swords, Bell, Volume2, Sparkles, Edit3 } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../utils/roleUtils';
import triggerHaptic from '../utils/haptics';
import { useGothicDialog } from '../context/GothicDialogContext';

export default function DayPhaseView({
  roundNumber,
  nightLogs,
  players,
  onLynchPlayer,
  onUndoLynch,
  onAdvanceToNight,
  onToggleSheriff,
  onKnightDuel,
  nightState,
  lynchedTodayPlayerId,
  onOpenSheriffModal,
  onOpenAssignRole
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes discussion
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedLynchId, setSelectedLynchId] = useState(null);
  const [extraLynchAllowed, setExtraLynchAllowed] = useState(false);
  const [showSheriffSelector, setShowSheriffSelector] = useState(false);
  const [showKnightDuelModal, setShowKnightDuelModal] = useState(false);
  const [selectedKnightTargetId, setSelectedKnightTargetId] = useState(null);

  // Timer effect with Haptic & Audio feedback
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 5 && t > 1) {
            triggerHaptic('timer-tick');
          }
          if (t === 1) {
            // Trigger haptic alarm when timer hits 0
            triggerHaptic('timer-end');
          }
          return t - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const lynchedPlayer = players.find(p => p.id === lynchedTodayPlayerId);
  const hasLynchedToday = !!lynchedTodayPlayerId && !extraLynchAllowed;
  const sheriff = players.find(p => p.isSheriff);
  const sheriffDead = sheriff && !sheriff.isAlive;

  // Stuttering judge exists in game
  const hasStutteringJudge = players.some(p => getPlayerRole(p)?.id === 'tham-phan-lap-bap' && p.isAlive);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Day Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Sun className="w-4 h-4 text-amber-400" />
          Ban Ngày - Ngày Thứ {roundNumber}
        </div>
        <h2 className="text-2xl sm:text-3xl font-cinzel font-black tracking-wider text-slate-100">
          LÀNG THỨC GIẤC & BIỂU QUYẾT
        </h2>
      </div>

      {/* Night Casualty Announcement Card - Streamlined */}
      {(() => {
        const deadTonight = players.filter(p => !p.isAlive && p.deathPhase === `Đêm ${roundNumber}`);
        const detailLogs = (nightLogs || []).filter(log => !log.startsWith('Đêm qua có ') && !log.startsWith('Đêm qua bình yên'));

        return (
          <div className="space-y-2">
            {/* DÒNG ĐẦU TIÊN: SỐ LƯỢNG NGƯỜI CHẾT VÀ TÊN TỪNG NGƯỜI */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 font-cinzel text-sm sm:text-base font-black ${
              deadTonight.length > 0
                ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-md'
            }`}>
              <Skull className={`w-5 h-5 shrink-0 ${deadTonight.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <div className="flex-1">
                {deadTonight.length > 0 ? (
                  <span>
                    Đêm qua có <span className="text-rose-300 underline font-black">{deadTonight.length} người chết</span>: {deadTonight.map(p => `${p.name} (#${p.id})`).join(', ')}.
                  </span>
                ) : (
                  <span className="text-emerald-300">
                    Đêm qua bình yên, không có ai chết!
                  </span>
                )}
              </div>
            </div>

            {/* CÁC MÔ TẢ CHI TIẾT NẰM Ở DƯỚI NẾU CÓ */}
            {detailLogs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {detailLogs.map((log, index) => (
                  <div 
                    key={index}
                    className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 text-slate-200 text-xs sm:text-sm flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* PUBLIC OFFICE: SHERIFF (CẢNH SÁT TRƯỞNG / TRƯỞNG LÀNG - #09) */}
      {(() => {
        const sheriff = players.find(p => p.isSheriff);
        const sheriffDead = sheriff && !sheriff.isAlive;

        return (
          <div className={`p-4 rounded-2xl border transition-all backdrop-blur-md ${
            sheriffDead
              ? 'bg-rose-950/50 border-rose-600/90 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
              : sheriff
              ? 'bg-[#151226]/60 border-amber-600/60 shadow-[0_2px_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#10121d]/60 border-purple-900/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                  sheriffDead
                    ? 'bg-rose-900 border-rose-500 text-rose-200'
                    : sheriff
                    ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-purple-950 border-purple-800 text-purple-300'
                }`}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                      Chức Vụ Công Khai (#09)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold">
                      Phiếu vote x2
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black font-cinzel text-white">
                    {sheriff ? (
                      <span>
                        Cảnh Sát Trưởng: <strong className="text-amber-300">{sheriff.name} (#{sheriff.id})</strong>
                        <span className="text-xs text-slate-400 font-normal ml-2">
                          (Vai: {getPlayerRole(sheriff)?.name || 'Chưa lộ vai'})
                        </span>
                      </span>
                    ) : (
                      <span>CHƯA BẦU CẢNH SÁT TRƯỞNG</span>
                    )}
                  </h4>
                  {sheriffDead && (
                    <p className="text-xs text-rose-300 font-bold mt-0.5">
                      ⚠️ Cảnh Sát Trưởng đã hy sinh! Theo luật, người chết phải chỉ định người kế nhiệm huy hiệu.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <GothicButton
                  variant={sheriffDead ? 'blood' : sheriff ? 'gold' : 'witch'}
                  size="sm"
                  icon={sheriffDead ? RotateCcw : Award}
                  onClick={() => {
                    if (onOpenSheriffModal) {
                      onOpenSheriffModal(sheriffDead ? sheriff : null, false);
                    } else {
                      setShowSheriffSelector(!showSheriffSelector);
                    }
                  }}
                >
                  {sheriffDead ? 'Chỉ Định Kế Nhiệm' : sheriff ? 'Đổi Người Giữ' : 'Bầu Cảnh Sát Trưởng'}
                  {!onOpenSheriffModal && (showSheriffSelector ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />)}
                </GothicButton>
              </div>
            </div>

            {/* Quick Sheriff Selector Drawer */}
            {showSheriffSelector && (
              <div className="mt-3 pt-3 border-t border-slate-800 animate-fade-in space-y-2">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Chỉ định Cảnh Sát Trưởng (phiếu x2):</span>
                  <span className="text-[11px] text-amber-300/80">Chức vụ song song</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {alivePlayers.map(p => {
                    const isCurrentSheriff = p.isSheriff;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (onToggleSheriff) onToggleSheriff(p.id);
                          setShowSheriffSelector(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                          isCurrentSheriff
                            ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-1 ring-amber-300'
                            : 'bg-[#10121d] hover:bg-[#1a172e] text-slate-300 border-slate-800 hover:border-amber-600/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 truncate">
                          <div className="font-bold truncate text-slate-100 flex items-center gap-1">
                            <span>#{p.id} {p.name}</span>
                            {isCurrentSheriff && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Vai: {getPlayerRole(p)?.name || 'Chưa lộ'}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                          isCurrentSheriff
                            ? 'bg-amber-900 text-amber-200 border-amber-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {isCurrentSheriff ? 'Đang giữ' : 'Trao'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Discussion Timer */}
      <div className="p-4 rounded-2xl bg-[#10121d]/60 backdrop-blur-md border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Thời Gian Thảo Luận
            </div>
            <div className="text-3xl font-black font-cinzel text-amber-300">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GothicButton
            variant={isTimerRunning ? 'gold' : 'witch'}
            size="sm"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            icon={isTimerRunning ? Pause : Play}
          >
            {isTimerRunning ? 'Tạm Dừng' : 'Bắt Đầu Đếm'}
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(60);
            }}
          >
            1 Phút
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(180);
            }}
          >
            3 Phút
          </GothicButton>
          <GothicButton
            variant="dark"
            size="sm"
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(300);
            }}
          >
            5 Phút
          </GothicButton>
        </div>
      </div>

      {/* Timer Expired Haptic Alarm Banner */}
      {timeLeft === 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#33080e] to-rose-950/90 border border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(225,29,72,0.4)] flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-rose-100 text-sm font-cinzel">HẾT GIỜ THẢO LUẬN! (RUNG & CHUÔNG BÁO)</h4>
              <p className="text-xs text-rose-300/80">Làng dừng tranh cãi và chuyển sang giai đoạn biểu quyết giơ tay!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerHaptic('timer-end')}
            className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 border border-rose-500 text-xs font-bold text-rose-100 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Rung Lại 🔔
          </button>
        </div>
      )}

      {/* BEAR TAMER (NGƯỜI THUẦN PHỤC GẤU - GẤU GẦM BAN NGÀY) */}
      {(() => {
        const bearTamer = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'nguoi-thuan-phuc-gau' || getPlayerRole(p)?.id === 'nguoi-thuan-phuc-gau' || (p.currentRoleId || p.roleId) === 'than-gau'));
        if (!bearTamer || alivePlayers.length <= 2) return null;

        const sortedAlive = [...alivePlayers].sort((a, b) => a.id - b.id);
        const idx = sortedAlive.findIndex(p => p.id === bearTamer.id);
        if (idx === -1) return null;

        const leftNeighbor = sortedAlive[(idx - 1 + sortedAlive.length) % sortedAlive.length];
        const rightNeighbor = sortedAlive[(idx + 1) % sortedAlive.length];
        const bearHasWolf = isWolfPlayer(leftNeighbor) || isWolfPlayer(rightNeighbor);

        return (
          <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
            bearHasWolf
              ? 'bg-gradient-to-r from-amber-950/80 via-[#261508] to-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-pulse'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">🐻</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                    Kỹ Năng Ban Ngày: Người Thuần Phục Gấu
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold">
                    Ghế #{bearTamer.id} ({bearTamer.name})
                  </span>
                </div>
                {bearHasWolf ? (
                  <div className="mt-1">
                    <h4 className="font-cinzel font-black text-amber-200 text-sm sm:text-base">
                      GẤU GẦM GỪZZZZ! CÓ MA SÓI NGỒI SÁT CẠNH!
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      Quản trò hãy gầm lớn: Gấu phát hiện ít nhất 1 Ma Sói đang ngồi kề bên ({leftNeighbor.name} #{leftNeighbor.id} hoặc {rightNeighbor.name} #{rightNeighbor.id})!
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <h4 className="font-cinzel font-bold text-slate-200 text-sm">
                      Gấu nằm im ngoan ngoãn.
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hai người chơi ngồi cạnh ({leftNeighbor.name} #{leftNeighbor.id} và {rightNeighbor.name} #{rightNeighbor.id}) đều không phải Ma Sói.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* KNIGHT DUEL (KỊ SĨ LẬT BÀI THÁCH ĐẤU) */}
      {(() => {
        const knight = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'ki-si' || getPlayerRole(p)?.id === 'ki-si'));
        if (!knight || knight.hasUsedKnightDuel || hasLynchedToday) return null;

        const validTargets = alivePlayers.filter(p => p.id !== knight.id);

        const handleConfirmKnightDuel = () => {
          if (!selectedKnightTargetId) {
            showAlert({
              title: 'CHƯA CHỌN MỤC TIÊU!',
              message: 'Vui lòng chọn 1 người chơi để Kị Sĩ thách đấu.',
              variant: 'warning'
            });
            return;
          }
          const target = players.find(p => p.id === selectedKnightTargetId);
          showConfirm({
            title: '⚔️ KỊ SĨ QUYẾT ĐẤU?',
            message: `Kị Sĩ ${knight.name} (#${knight.id}) sẽ lật bài thách đấu ${target.name} (#${target.id})!\n\n• Nếu là MA SÓI: Sói chết ngay lập tức, ngày kết thúc không cần vote tiếp.\n• Nếu là DÂN LÀNG: Kị Sĩ tự sát tại chỗ vì thách đấu sai!\n\nBạn có chắc muốn tiến hành?`,
            variant: 'blood',
            confirmText: 'Lật Bài Quyết Đấu ⚔️',
            onConfirm: () => {
              if (onKnightDuel) {
                onKnightDuel(knight.id, selectedKnightTargetId);
                setSelectedKnightTargetId(null);
              }
            }
          });
        };

        return (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0d1629] to-blue-950/80 border border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 border border-blue-500 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)] shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-300">
                      Kỹ Năng Đặc Biệt Ban Ngày
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900 border border-blue-600 text-blue-200 font-bold">
                      1 lần duy nhất
                    </span>
                  </div>
                  <h4 className="font-cinzel font-black text-white text-sm sm:text-base">
                    KỊ SĨ LẬT BÀI THÁCH ĐẤU: {knight.name} (#{knight.id})
                  </h4>
                </div>
              </div>
              <GothicButton
                variant="blood"
                size="sm"
                disabled={!selectedKnightTargetId}
                onClick={handleConfirmKnightDuel}
                icon={Swords}
              >
                Quyết Đấu Ngay ⚔️
              </GothicButton>
            </div>

            <p className="text-xs text-blue-200/80">
              Chọn 1 người chơi để Kị Sĩ lật bài chỉ mặt điểm tên trước giờ biểu quyết:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {validTargets.map(p => {
                const isSelected = selectedKnightTargetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedKnightTargetId(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-900/90 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-blue-400'
                        : 'bg-[#101424] hover:bg-[#181e35] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold text-xs truncate">#{p.id} {p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {getPlayerRole(p)?.name || 'Chưa lộ'}
                      </div>
                    </div>
                    {isSelected && <span className="text-xs text-blue-300 font-bold">⚔️</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Voting & Lynching Section - STRICT SINGLE LYNCH RULE */}
      <div className="p-5 rounded-2xl bg-[#0f111c]/60 backdrop-blur-md border border-purple-900/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-cinzel">
              <Flame className="w-5 h-5 text-orange-400" />
              BIỂU QUYẾT TREO CỔ (BỎ PHIẾU BAN NGÀY)
            </h3>
          </div>

          {hasLynchedToday && (
            <GothicBadge variant="wolf">
              <Check className="w-3.5 h-3.5" />
              Đã xong biểu quyết sáng nay
            </GothicBadge>
          )}
        </div>

        {/* LOCKED BANNER WHEN 1 PERSON IS ALREADY LYNCHED */}
        {hasLynchedToday ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#290508]/80 via-[#120305] to-[#290508]/80 border border-rose-600/80 text-center space-y-3 shadow-[0_0_25px_rgba(225,29,72,0.35)]">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-600 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
                Án Treo Cổ Đã Được Thực Hiện
              </div>
              <div className="text-xl font-black font-cinzel text-white">
                Nạn nhân: {lynchedPlayer?.name || 'Người chơi'} ({getPlayerRole(lynchedPlayer)?.name || 'Chưa lộ vai'})
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {onUndoLynch && (
                <GothicButton
                  variant="dark"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => onUndoLynch(lynchedTodayPlayerId)}
                >
                  Hoàn tác treo cổ
                </GothicButton>
              )}

              {/* SỬA / GÁN VAI TRÒ CHO NẠN NHÂN TRỰC TIẾP TẠI CHỖ */}
              {onOpenAssignRole && lynchedPlayer && (
                <GothicButton
                  variant="witch"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => onOpenAssignRole(lynchedPlayer)}
                >
                  {getPlayerRole(lynchedPlayer) ? 'Đổi Vai Trò Nạn Nhân' : 'Gán / Lộ Vai Cho Nạn Nhân'}
                </GothicButton>
              )}

              {/* ĐỔI NGƯỜI BỊ TREO CỔ (CHỌN LẠI NGƯỜI KHÁC) */}
              {onUndoLynch && (
                <GothicButton
                  variant="gold"
                  size="sm"
                  icon={Edit3}
                  onClick={() => {
                    onUndoLynch(lynchedTodayPlayerId);
                    setExtraLynchAllowed(false);
                  }}
                >
                  Đổi Người Khác
                </GothicButton>
              )}

              {hasStutteringJudge && (
                <GothicButton
                  variant="witch"
                  size="sm"
                  icon={Gavel}
                  onClick={() => setExtraLynchAllowed(true)}
                >
                  Thẩm Phán kích hoạt
                </GothicButton>
              )}
            </div>
          </div>
        ) : (
          /* VOTING GRID - ALLOW SELECTING ONLY 1 PERSON - WITH WEREWOLF RED BORDERS */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {alivePlayers.map(p => {
                const isSelected = selectedLynchId === p.id;
                const isWolf = isWolfPlayer(p);
                const pRole = getPlayerRole(p);
                const origRole = getPlayerOriginalRole(p);

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedLynchId(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-950 via-[#3a080c] to-rose-950 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] ring-1 ring-rose-400'
                        : isWolf
                        ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                        : 'bg-[#121422] hover:bg-[#181a2e] border-slate-800 hover:border-purple-600/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-400'
                          : isWolf
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        {p.id}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          <span className={isWolf ? 'text-rose-200 font-black' : isSelected ? 'text-white' : 'text-slate-100'}>
                            {p.name}
                          </span>
                          {p.isSheriff && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-950 text-amber-300 border border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Trưởng Làng (x2)
                            </span>
                          )}
                          {isWolf && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center gap-1">
                              <WolfIcon className="w-2.5 h-2.5" /> Sói
                            </span>
                          )}
                          {nightState?.ravenTargetId === p.id && !nightState?.ravenSkipped && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-purple-950 text-purple-300 border border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.5)] flex items-center gap-0.5">
                              🪶 Quạ phạt (+2)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Vai: {p.isCursedWolf && origRole ? (
                            <span className="text-rose-300 font-bold">
                              {pRole?.name}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">{pRole?.name || 'Chưa lộ vai'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-xs font-black text-rose-300 bg-rose-950 px-2.5 py-1 rounded-xl border border-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.6)]">
                        Treo Cổ 🔥
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TIE VOTE ACTION FOR SCAPEGOAT (NGƯỜI THẾ THÂN CHẾT THAY KHI HÒA PHIẾU) */}
            {(() => {
              const scapegoat = alivePlayers.find(p => (p.currentRoleId || p.roleId) === 'nguoi-the-than' || getPlayerRole(p)?.id === 'nguoi-the-than');
              if (!scapegoat) return null;

              return (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    ⚖️ Trong bàn có <strong className="text-amber-300">Người Thế Thân</strong>: Nếu biểu quyết giơ tay hòa phiếu, Người Thế Thân sẽ chết thay.
                  </div>
                  <GothicButton
                    variant="witch"
                    size="sm"
                    onClick={() => {
                      showConfirm({
                        title: '⚖️ BỎ PHIẾU HÒA (NGƯỜI THẾ THÂN CHẾT THAY)?',
                        message: `Khi số phiếu biểu quyết cao nhất bị hòa nhau:\n\nNgười Thế Thân (${scapegoat.name} #${scapegoat.id}) bị đưa lên giàn treo cổ chết thay ngay lập tức!\n\nBạn có muốn thực hiện án phạt này?`,
                        variant: 'blood',
                        confirmText: 'Xử Tử Người Thế Thân ⚖️',
                        onConfirm: () => {
                          onLynchPlayer(scapegoat.id);
                        }
                      });
                    }}
                  >
                    Hòa Phiếu: Người Thế Thân Chết Thay ⚖️
                  </GothicButton>
                </div>
              );
            })()}

            {selectedLynchId && (
              <div className="pt-2 flex justify-end">
                <GothicButton
                  variant="blood"
                  size="md"
                  icon={UserX}
                  onClick={() => {
                    onLynchPlayer(selectedLynchId);
                    setSelectedLynchId(null);
                    setExtraLynchAllowed(false);
                  }}
                  className="shadow-2xl shadow-rose-950/80"
                >
                  Xác nhận treo cổ
                </GothicButton>
              </div>
            )}
          </>
        )}
      </div>

      {/* Button To Go Back to Night */}
      <div className="flex justify-center pt-2">
        <GothicButton
          variant="witch"
          size="lg"
          icon={Moon}
          onClick={() => {
            if (sheriffDead) {
              triggerHaptic('error');
              if (onOpenSheriffModal) {
                onOpenSheriffModal(sheriff, true);
              }
              return;
            }
            onAdvanceToNight();
          }}
          className="shadow-2xl shadow-purple-950/80"
        >
          <span>Hết ngày ➔ Ban đêm</span>
        </GothicButton>
      </div>
    </div>
  );
}
