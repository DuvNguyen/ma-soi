import React, { useState, useEffect, useRef } from 'react';
import { Skull, Clock, Play, Pause, RotateCcw, Send, Settings, Check, Volume2, VolumeX, MessageSquare, ChevronRight, UserCheck, Trash2, AlertCircle, MoreHorizontal } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole } from '../utils/roleUtils';

export default function WolfWhisperBox({
  players,
  nightState,
  onSaveAction,
  defaultTimerDuration = 25
}) {
  // Settings: Timer duration (default 25s, loaded from localStorage if set)
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem('werewolf_wolf_timer');
    return saved ? parseInt(saved, 10) : defaultTimerDuration;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const quickMenuRef = useRef(null);

  // Close quick menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target)) {
        setShowQuickMenu(false);
      }
    };
    if (showQuickMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickMenu]);

  const livingWolves = players.filter(p => p.isAlive && isWolfPlayer(p));
  const aliveVictimCandidates = players.filter(p => p.isAlive);

  // Wolf Stepper & Active Wolf
  const [activeWolfIndex, setActiveWolfIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isRunning, setIsRunning] = useState(false);

  // Active Wolf inputs
  const [proposedTargetId, setProposedTargetId] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Wolf messages log for current night: array of { wolfId, wolfName, targetId, targetName, text, time }
  const [wolfLogs, setWolfLogs] = useState([]);

  // Audio beep generator using Web Audio API (no external sound files required)
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

  // Submit current wolf's whisper and pass to next
  const handleSendAndNextWolf = () => {
    if (!currentWolf) return;

    const targetPlayer = players.find(p => p.id === proposedTargetId);
    const newEntry = {
      id: Date.now(),
      wolfId: currentWolf.id,
      wolfName: currentWolf.name,
      targetId: proposedTargetId,
      targetName: targetPlayer ? targetPlayer.name : null,
      text: messageText.trim() || (proposedTargetId ? `Đề xuất cắn ${targetPlayer?.name}` : 'Đã xem lượt'),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setWolfLogs(prev => [...prev, newEntry]);

    // If a target was proposed, auto-sync as potential night wolf target
    if (proposedTargetId) {
      onSaveAction('wolves', proposedTargetId);
    }

    // Reset inputs for next wolf
    setProposedTargetId(null);
    setMessageText('');

    // Advance to next wolf
    if (activeWolfIndex < livingWolves.length - 1) {
      setActiveWolfIndex(prev => prev + 1);
      setTimeLeft(timerDuration);
      setIsRunning(true); // auto-start for next wolf
    } else {
      // Completed all wolves
      setIsRunning(false);
      setTimeLeft(timerDuration);
    }
  };

  const quickPills = [
    '🐺 Cắn người này đi!',
    '🔮 Nghi Tiên Tri, diệt ngay',
    '🛡️ Tránh Bảo Vệ ra',
    '👍 Đồng ý với Sói trước',
    '🤔 Tôi đang phân vân',
    '🤫 Giữ bí mật, cắn âm thầm'
  ];

  return (
    <div className="rounded-3xl border border-rose-900/80 bg-gradient-to-b from-[#1c0407] via-[#100204] to-[#0a0102] p-4 sm:p-5 shadow-[0_0_35px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/40 space-y-4">
      {/* Box Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.6)]">
            <Skull className="w-5 h-5 animate-pulse text-rose-400" />
          </div>
          <div>
            <h4 className="font-cinzel font-black text-sm sm:text-base text-rose-100 flex items-center gap-2">
              <span>HỘP NHẮN TIN BÍ MẬT CỦA BẦY SÓI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-sans font-bold">
                Chuyền Máy {timerDuration}s
              </span>
            </h4>
            <p className="text-[11px] text-rose-300/70">
              Quản trò chuyền máy cho từng con Sói gửi tin nhắn & chọn mục tiêu trong im lặng
            </p>
          </div>
        </div>

        {/* Quick Settings & Audio Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh đếm ngược' : 'Bật âm thanh đếm ngược'}
            className="p-2 rounded-xl bg-[#260509] border border-rose-800/80 text-rose-300 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            type="button"
            data-testid="wolf-timer-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="py-1.5 px-3 rounded-xl bg-[#260509] hover:bg-[#3d080e] border border-rose-800/80 text-xs font-bold text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{timerDuration}s</span>
          </button>
        </div>
      </div>

      {/* Popover Settings Panel: Timer Duration Change */}
      {showSettings && (
        <div className="p-3.5 rounded-2xl bg-[#200407] border border-rose-700/80 space-y-2.5 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">
              ⚙️ Cài đặt thời gian chuyền máy mỗi con Sói:
            </span>
            <span className="text-xs font-black text-rose-300 font-cinzel">
              Hiện tại: {timerDuration} giây
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[15, 20, 25, 30, 45, 60].map(secs => (
              <button
                key={secs}
                type="button"
                onClick={() => handleUpdateDuration(secs)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  timerDuration === secs
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                    : 'bg-[#150204] text-rose-300 border-rose-900 hover:border-rose-700'
                }`}
              >
                {secs} giây {secs === 25 ? '⭐ (Mặc định)' : ''}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-rose-400/80 italic">
            * Thời gian sẽ được lưu lại tự động cho các ván chơi tiếp theo.
          </div>
        </div>
      )}

      {/* Living Wolves Roster Bar */}
      {livingWolves.length === 0 ? (
        <div className="p-4 rounded-2xl bg-[#140305] border border-rose-900/60 text-center text-xs text-rose-300/80 space-y-1">
          <AlertCircle className="w-5 h-5 mx-auto text-rose-400" />
          <p className="font-bold">Chưa có người chơi nào được gán vai Ma Sói hoặc bầy Sói đã bị tiêu diệt hết!</p>
          <p className="text-[11px] text-slate-400">Hãy gán vai trò Ma Sói cho người chơi ở phần thiết lập.</p>
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
                  className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-800 to-rose-950 text-white border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.6)] ring-1 ring-rose-400 scale-[1.02]'
                      : hasWhispered
                      ? 'bg-[#1c0407] text-rose-300 border-rose-800'
                      : 'bg-[#120204] text-rose-400/60 border-rose-950 hover:border-rose-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
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

          {/* ACTIVE WOLF HAND-OFF CARD WITH 25s COUNTDOWN */}
          {currentWolf && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#240508] to-[#140204] border border-rose-600/90 shadow-2xl relative overflow-hidden space-y-4">
              {/* Pulsing Danger background when <= 5 seconds */}
              {timeLeft <= 5 && isRunning && (
                <div className="absolute inset-0 bg-rose-600/15 animate-ping pointer-events-none"></div>
              )}

              {/* Hand-off Alert Header & Countdown Clock */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-rose-900/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.7)] shrink-0 p-2">
                    <WolfIcon className="w-full h-full" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                      ĐANG CHUYỀN MÁY CHO SÓI {activeWolfIndex + 1}/{livingWolves.length}:
                    </div>
                    <div className="text-lg sm:text-xl font-black font-cinzel text-white flex items-center gap-2">
                      <span>{currentWolf.name}</span>
                      <span className="text-xs text-rose-300 font-sans font-normal">({getPlayerRole(currentWolf)?.name || 'Ma Sói'})</span>
                    </div>
                  </div>
                </div>

                {/* COUNTDOWN TIMER DISPLAY */}
                <div className="flex items-center gap-3 bg-[#0c0103] px-4 py-2 rounded-2xl border border-rose-800/80 shadow-inner">
                  <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Thời Gian</div>
                    <div className={`text-2xl sm:text-3xl font-black font-cinzel tracking-wider tabular-nums ${
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
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                      title={isRunning ? 'Tạm dừng đếm' : 'Bắt đầu đếm'}
                    >
                      {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-rose-300" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="p-1.5 rounded-lg bg-[#1a0406] hover:bg-rose-950 text-slate-400 hover:text-white border border-rose-900 transition-colors cursor-pointer"
                      title="Đặt lại 25s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1: Select Proposed Victim Target (Compact Chips) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-200">
                    1. {currentWolf.name} muốn cắn ai đêm nay?
                  </span>
                  {proposedTargetId && (
                    <span className="text-rose-300 text-[11px] font-bold">
                      Đã chọn: {players.find(p => p.id === proposedTargetId)?.name}
                    </span>
                  )}
                </div>

                {/* Compact Candidate Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {aliveVictimCandidates.map(p => {
                    const isSelected = proposedTargetId === p.id;
                    const isSelfOrWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProposedTargetId(p.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.8)] font-bold'
                            : isSelfOrWolf
                            ? 'bg-[#180306] border-rose-950 text-rose-400/60 hover:border-rose-800'
                            : 'bg-[#0f0103] hover:bg-[#200307] border-rose-900/60 text-slate-200'
                        }`}
                      >
                        <span>{p.name}</span>
                        {isSelfOrWolf && <span className="text-[10px] text-rose-500">(Sói)</span>}
                        {isSelected && <Skull className="w-3 h-3 fill-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Streamlined Chat Box with 3-dots Quick Pills */}
              <div className="space-y-2 pt-1">
                <div className="relative">
                  {/* 3-dots Quick Pills Popover Menu */}
                  {showQuickMenu && (
                    <div 
                      ref={quickMenuRef}
                      className="absolute bottom-full mb-2 left-0 right-0 sm:right-auto sm:w-80 p-2.5 rounded-2xl bg-[#140205] border border-rose-700 shadow-[0_0_25px_rgba(225,29,72,0.5)] backdrop-blur-md z-30 space-y-1.5 animate-fade-in"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 px-1 flex items-center justify-between border-b border-rose-950 pb-1">
                        <span>Gợi ý tin nhắn nhanh:</span>
                        <button 
                          type="button" 
                          onClick={() => setShowQuickMenu(false)}
                          className="text-slate-400 hover:text-white cursor-pointer px-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                        {quickPills.map((pill, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setMessageText(pill);
                              setShowQuickMenu(false);
                            }}
                            className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-[#200306] hover:bg-rose-900/60 border border-rose-950 text-rose-200 hover:text-white transition-colors cursor-pointer truncate"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Chat Input Bar */}
                  <div className="flex items-center gap-1.5 bg-[#0a0102] border border-rose-900/80 rounded-2xl p-1.5 focus-within:border-rose-500 shadow-inner">
                    {/* 3-dots Button for Quick Messages */}
                    <button
                      type="button"
                      onClick={() => setShowQuickMenu(prev => !prev)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        showQuickMenu
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80'
                      }`}
                      title="Bấm để mở tin nhắn nhanh (...)"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Chat Input Field */}
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Nhắn tin bí mật cho bầy Sói..."
                      className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-rose-100 placeholder:text-rose-900/80 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendAndNextWolf();
                        }
                      }}
                    />

                    {/* Send & Next Wolf Action Button */}
                    <button
                      type="button"
                      onClick={handleSendAndNextWolf}
                      className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/80 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {activeWolfIndex < livingWolves.length - 1 ? 'Chuyền tiếp' : 'Hoàn tất'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Next wolf indicator */}
                <div className="text-[11px] text-rose-300/70 px-1 flex items-center justify-between">
                  {activeWolfIndex < livingWolves.length - 1 ? (
                    <span>➔ Sói tiếp theo: <strong className="text-rose-200">{livingWolves[activeWolfIndex + 1]?.name}</strong></span>
                  ) : (
                    <span className="text-emerald-400 font-medium">✓ Sói cuối cùng trong bầy đêm nay.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECRET WOLF WHISPER LOGS (TIMELINE) */}
          {wolfLogs.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0d0103] border border-rose-900/70 space-y-2.5">
              <div className="flex items-center justify-between border-b border-rose-950 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Lịch Sử Nhắn Tin Của Bầy Sói Đêm Nay ({wolfLogs.length} tin):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWolfLogs([])}
                  className="text-[10px] text-rose-500 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  title="Xóa để phi tang chứng cứ trước khi trời sáng"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa lịch sử chat
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {wolfLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-[#190306] border border-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300 flex items-center gap-1">
                        <WolfIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{log.wolfName}:</span>
                      </span>
                      <span className="text-rose-100">{log.text}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[10px] text-rose-400/70">
                      {log.targetName && (
                        <span className="bg-rose-950 px-2 py-0.5 rounded border border-rose-800 text-rose-300 font-semibold">
                          Mục tiêu: {log.targetName}
                        </span>
                      )}
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
