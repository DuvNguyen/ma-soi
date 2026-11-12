import React, { useState, useEffect } from 'react';
import { Skull, Clock, Play, Pause, RotateCcw, Settings, Check, Volume2, VolumeX, AlertCircle, X, MessageSquare } from 'lucide-react';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole } from '../utils/roleUtils';

const QUICK_NOTES = [
  'Đã chỉ tay thống nhất',
  'Nghi là Bảo Vệ',
  'Nghi là Thợ Săn',
  'Ngày mai tôi giả Tiên Tri',
  'Tập trung cắn người này'
];

export default function WolfWhisperBox({
  players,
  nightState,
  canWolvesKillTeammates = false,
  onSaveAction,
  onClose,
  defaultTimerDuration = 25
}) {
  // Prevent background scrolling while pass-phone mode is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Settings: Timer duration (default 25s, loaded from localStorage if set)
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem('werewolf_wolf_timer');
    return saved ? parseInt(saved, 10) : defaultTimerDuration;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const livingWolves = players.filter(p => p.isAlive && isWolfPlayer(p));
  const aliveVictimCandidates = players.filter(p => p.isAlive);

  // Wolf Stepper & Active Wolf
  const [activeWolfIndex, setActiveWolfIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isRunning, setIsRunning] = useState(false);

  // Active Wolf inputs
  const [proposedTargetId, setProposedTargetId] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Wolf messages log for current night: array of { id, wolfId, wolfName, text, targetId, targetName, time }
  const [wolfLogs, setWolfLogs] = useState([]);

  // Audio beep generator using Web Audio API
  const playBeep = (freq = 600, duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext might be blocked before user gesture
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 6 && prev > 1) {
            playBeep(440, 0.08); // warning beep for last 5 seconds
          } else if (prev === 1) {
            playBeep(880, 0.25); // final beep
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, soundEnabled]);

  // When timer duration setting changes
  const handleUpdateDuration = (newSecs) => {
    const val = Math.max(5, Math.min(180, newSecs));
    setTimerDuration(val);
    localStorage.setItem('werewolf_wolf_timer', val.toString());
    setTimeLeft(val);
    setIsRunning(false);
  };

  const handleStartTimer = () => setIsRunning(true);
  const handlePauseTimer = () => setIsRunning(false);
  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDuration);
  };

  const currentWolf = livingWolves[activeWolfIndex] || null;

  const isTargetAllowed = (player) => {
    if (!player || !player.isAlive) return false;
    if (canWolvesKillTeammates) return true;
    return !isWolfPlayer(player);
  };

  // Submit current wolf's whisper and pass to next
  const handleSendAndNextWolf = () => {
    if (!currentWolf) return;

    const targetPlayer = proposedTargetId ? players.find(p => p.id === proposedTargetId) : null;
    const cleanText = messageText.trim();

    if (cleanText || targetPlayer) {
      const newEntry = {
        id: Date.now(),
        wolfId: currentWolf.id,
        wolfName: currentWolf.name,
        text: cleanText || null,
        targetId: targetPlayer ? targetPlayer.id : null,
        targetName: targetPlayer ? targetPlayer.name : null,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setWolfLogs(prev => [...prev, newEntry]);
    }

    // If a valid target was proposed, auto-sync as potential night wolf target
    if (targetPlayer && isTargetAllowed(targetPlayer)) {
      onSaveAction('wolves', targetPlayer.id);
    }

    // Reset inputs for next wolf
    setProposedTargetId(null);
    setMessageText('');

    // Advance to next wolf
    if (activeWolfIndex < livingWolves.length - 1) {
      setActiveWolfIndex(prev => prev + 1);
      setTimeLeft(timerDuration);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      setTimeLeft(timerDuration);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080102]/98 backdrop-blur-md flex flex-col justify-between overflow-y-auto p-3 sm:p-6 animate-fade-in text-slate-100">
      <div className="max-w-xl w-full mx-auto space-y-4 my-auto py-2">
        <div className="rounded-3xl border border-rose-900/80 bg-gradient-to-b from-[#1c0407] via-[#100204] to-[#0a0102] p-4 sm:p-5 shadow-[0_0_35px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/40 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.6)]">
                <Skull className="w-5 h-5 animate-pulse text-rose-400" />
              </div>
              <div>
                <h4 className="font-cinzel font-black text-sm sm:text-base text-rose-100 flex items-center gap-2">
                  <span>HỘP NHẮN TIN BÍ MẬT CỦA BẦY SÓI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-sans font-bold">
                    {timerDuration}s
                  </span>
                </h4>
                <p className="text-[11px] text-rose-300/70">
                  Chuyền máy cho từng con Sói chọn mục tiêu & nhắn tin trong im lặng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                className="p-2 rounded-xl bg-[#260509] border border-rose-800/80 text-rose-300 hover:text-white transition-colors cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button
                type="button"
                data-testid="wolf-timer-settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                className="py-1.5 px-2.5 rounded-xl bg-[#260509] hover:bg-[#3d080e] border border-rose-800/80 text-xs font-bold text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{timerDuration}s</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 hover:text-white transition-colors cursor-pointer ml-1"
                  title="Đóng chuyền máy / Trở về quản trò"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          {/* Popover Settings Panel: Timer Duration Change */}
          {showSettings && (
            <div className="p-3 rounded-2xl bg-[#200407] border border-rose-700/80 space-y-2.5 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                  Thời gian chuyền máy:
                </span>
                <span className="text-xs font-black text-rose-300 font-cinzel">
                  {timerDuration}s
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[15, 20, 25, 30, 45, 60].map(secs => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => handleUpdateDuration(secs)}
                    className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      timerDuration === secs
                        ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                        : 'bg-[#150204] text-rose-300 border-rose-900 hover:border-rose-700'
                    }`}
                  >
                    {secs}s {secs === 25 ? '⭐' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Living Wolves Roster Bar */}
          {livingWolves.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#140305] border border-rose-900/60 text-center text-xs text-rose-300/80 space-y-2">
              <AlertCircle className="w-5 h-5 mx-auto text-rose-400" />
              <p className="font-bold">Bầy Ma Sói không còn thành viên nào còn sống!</p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-xl bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer"
                >
                  Đóng Chuyền Máy
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Wolves Stepper Indicators */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {livingWolves.map((wolf, idx) => {
                  const isActive = idx === activeWolfIndex;
                  const hasWhispered = wolfLogs.some(log => log.wolfId === wolf.id);

                  return (
                    <button
                      key={wolf.id}
                      type="button"
                      onClick={() => {
                        setActiveWolfIndex(idx);
                        setTimeLeft(timerDuration);
                        setIsRunning(false);
                      }}
                      className={`py-1.5 px-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-800 to-rose-950 text-white border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.6)] ring-1 ring-rose-400 scale-[1.02]'
                          : hasWhispered
                          ? 'bg-[#1c0407] text-rose-300 border-rose-800'
                          : 'bg-[#120204] text-rose-400/60 border-rose-950 hover:border-rose-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{wolf.name}</span>
                      {hasWhispered && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE WOLF HAND-OFF CARD */}
              {currentWolf && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#240508] to-[#140204] border border-rose-600/90 shadow-2xl relative overflow-hidden space-y-3.5">
                  {timeLeft <= 5 && isRunning && (
                    <div className="absolute inset-0 bg-rose-600/15 animate-ping pointer-events-none"></div>
                  )}

                  {/* Header & Countdown Clock */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-rose-900/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-950 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.7)] shrink-0 p-2">
                        <WolfIcon className="w-full h-full" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                          ĐANG CHUYỀN MÁY CHO SÓI {activeWolfIndex + 1}/{livingWolves.length}:
                        </div>
                        <div className="text-base sm:text-lg font-black font-cinzel text-white flex items-center gap-2">
                          <span>{currentWolf.name}</span>
                          <span className="text-xs text-rose-300 font-sans font-normal">({getPlayerRole(currentWolf)?.name || 'Ma Sói'})</span>
                        </div>
                      </div>
                    </div>

                    {/* COUNTDOWN TIMER DISPLAY */}
                    <div className="flex items-center gap-2.5 bg-[#0c0103] px-3.5 py-1.5 rounded-2xl border border-rose-800/80 shadow-inner">
                      <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                      <div className="text-center">
                        <div className={`text-xl sm:text-2xl font-black font-cinzel tracking-wider tabular-nums ${
                          timeLeft <= 5 ? 'text-rose-400 animate-pulse drop-shadow-[0_0_10px_rgba(225,29,72,0.9)]' : 'text-amber-300'
                        }`}>
                          {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                        </div>
                      </div>

                      {/* Timer Quick Actions */}
                      <div className="flex items-center gap-1 pl-2 border-l border-rose-950">
                        <button
                          type="button"
                          onClick={isRunning ? handlePauseTimer : handleStartTimer}
                          className="p-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                          title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}
                        >
                          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-rose-300" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetTimer}
                          className="p-1 rounded-lg bg-[#1a0406] hover:bg-rose-950 text-slate-400 hover:text-white border border-rose-900 transition-colors cursor-pointer"
                          title="Đặt lại"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Previous Wolf Whispers Thread */}
                  {wolfLogs.length > 0 && (
                    <div className="space-y-1.5 rounded-xl bg-[#0c0103]/80 border border-rose-950 p-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Lời nhắn từ bầy đêm nay ({wolfLogs.length})</span>
                      </div>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {wolfLogs.map(log => (
                          <div key={log.id} className="text-xs bg-[#190306] border border-rose-900/40 rounded-lg p-2 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-rose-200">{log.wolfName}</span>
                              <span className="text-rose-400/60 text-[10px]">{log.time}</span>
                            </div>
                            {log.text && (
                              <p className="text-rose-100 font-sans text-xs break-words">{log.text}</p>
                            )}
                            {log.targetName && (
                              <div className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
                                <span>🎯 Mục tiêu đề xuất:</span>
                                <span className="font-bold text-rose-100 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                                  {log.targetName}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Text message / Secret note input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-200 block">
                      Nhắn tin bí mật cho bầy Sói
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendAndNextWolf();
                          }
                        }}
                        placeholder="Nhập tin nhắn bí mật (VD: cắn người này, tôi giả Tiên Tri...)"
                        className="flex-1 bg-[#120204] border border-rose-800/80 rounded-xl px-3 py-2 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400 transition-colors"
                      />
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                      {QUICK_NOTES.map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => setMessageText(prev => prev ? `${prev} - ${note}` : note)}
                          className="shrink-0 px-2 py-0.5 rounded-lg bg-[#180306] hover:bg-[#25050a] border border-rose-900/60 text-[10px] text-rose-300/80 transition-colors cursor-pointer"
                        >
                          + {note}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Proposed Victim Target (Optional, can also point fingers) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-200">
                        Mục tiêu muốn cắn <span className="text-[11px] text-rose-400/70 font-normal">(tùy chọn hoặc chỉ tay)</span>
                      </span>
                      {proposedTargetId && (
                        <button
                          type="button"
                          onClick={() => setProposedTargetId(null)}
                          className="text-rose-400 text-[11px] hover:text-rose-200 underline cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    {/* Candidate Chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {aliveVictimCandidates.map(p => {
                        const isSelected = proposedTargetId === p.id;
                        const isSelfOrWolf = isWolfPlayer(p);
                        const isBlocked = isSelfOrWolf && !canWolvesKillTeammates;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => {
                              if (isBlocked) return;
                              setProposedTargetId(isSelected ? null : p.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isBlocked
                                ? 'bg-[#120204]/60 border-rose-950/40 text-rose-800/60 cursor-not-allowed opacity-40 line-through'
                                : isSelected
                                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.8)] font-bold cursor-pointer active:scale-95'
                                : isSelfOrWolf
                                ? 'bg-[#180306] border-rose-950 text-rose-400/80 hover:border-rose-800 cursor-pointer active:scale-95'
                                : 'bg-[#0f0103] hover:bg-[#200307] border-rose-900/60 text-slate-200 cursor-pointer active:scale-95'
                            }`}
                          >
                            <span>{p.name}</span>
                            {isSelfOrWolf && (
                              <span className="text-[10px] text-rose-400 font-bold">
                                {isBlocked ? '(Sói - Khóa)' : '(Sói)'}
                              </span>
                            )}
                            {isSelected && <Skull className="w-3.5 h-3.5 fill-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Confirm and pass */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-rose-900/60">
                    <div className="text-xs text-rose-300/80">
                      {activeWolfIndex < livingWolves.length - 1 ? (
                        <span>➔ Chuyền tiếp cho: <strong className="text-rose-100">{livingWolves[activeWolfIndex + 1]?.name}</strong></span>
                      ) : (
                        <span className="text-emerald-400 font-bold">✓ Sói cuối cùng trong bầy đêm nay</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSendAndNextWolf}
                      className="h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white cursor-pointer active:scale-95 shadow-md shadow-rose-950/80 transition-all"
                    >
                      <span>
                        {activeWolfIndex < livingWolves.length - 1 ? 'Chuyền Sang Sói Kế Tiếp ➔' : 'Chốt Con Mồi / Hoàn Tất 🩸'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Votes tally & Close button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                {wolfLogs.length > 0 ? (
                  <div className="p-2 rounded-xl bg-[#0d0103] border border-rose-900/60 flex items-center gap-2 flex-wrap text-xs text-rose-200 flex-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-rose-400">Đã gửi ({wolfLogs.length}/{livingWolves.length}):</span>
                    {wolfLogs.map(log => (
                      <span key={log.id} className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-[11px] flex items-center gap-1">
                        <strong>{log.wolfName}</strong>
                        {log.targetName && <span className="text-white font-bold">➔ {log.targetName}</span>}
                        {log.text && <span className="text-rose-300 italic truncate max-w-[120px]">({log.text})</span>}
                      </span>
                    ))}
                  </div>
                ) : <div />}

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-bold text-xs border border-rose-600 transition-colors cursor-pointer shrink-0"
                  >
                    Trở Về Quản Trò ↩
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
