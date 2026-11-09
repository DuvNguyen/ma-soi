import React, { useState, useEffect } from 'react';
import { Sun, Skull, Flame, ShieldAlert, Clock, Moon, AlertTriangle, Check, UserX, RotateCcw, Gavel, Play, Pause } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';

export default function DayPhaseView({
  roundNumber,
  nightLogs,
  players,
  onLynchPlayer,
  onUndoLynch,
  onAdvanceToNight,
  lynchedTodayPlayerId
}) {
  const isWolfPlayer = (p) => {
    return p?.role?.teamCode === 'W' || ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang'].includes(p?.role?.id);
  };
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes discussion
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedLynchId, setSelectedLynchId] = useState(null);
  const [extraLynchAllowed, setExtraLynchAllowed] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
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

  // Stuttering judge exists in game
  const hasStutteringJudge = players.some(p => p.role?.id === 'tham-phan-lap-bap' && p.isAlive);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Day Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Sun className="w-4 h-4 text-amber-400" />
          Ban Ngày - Ngày Thứ {roundNumber}
        </div>
        <h2 className="text-3xl font-cinzel font-black tracking-wider text-slate-100">
          LÀNG THỨC GIẤC & BIỂU QUYẾT
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Quản trò công bố thương vong đêm qua, mở thảo luận và tiến hành bỏ phiếu (Quy tắc: tối đa 1 người bị treo cổ mỗi ngày).
        </p>
      </div>

      {/* Night Casualty Announcement Card */}
      <div className="p-4 rounded-2xl bg-[#141624] border border-slate-800 shadow-xl">
        <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2 mb-3">
          <Skull className="w-4 h-4 text-rose-400" />
          Bản Tin Thương Vong Trong Đêm:
        </h3>
        {nightLogs && nightLogs.length > 0 ? (
          <div className="space-y-2">
            {nightLogs.map((log, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-200 text-sm flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-sm flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Một đêm bình yên trôi qua! Không có người dân nào thiệt mạng.</span>
          </div>
        )}
      </div>

      {/* Discussion Timer */}
      <div className="p-4 rounded-2xl bg-[#10121d] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
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

      {/* Voting & Lynching Section - STRICT SINGLE LYNCH RULE */}
      <div className="p-5 rounded-2xl bg-[#0f111c] border border-purple-950/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-cinzel">
              <Flame className="w-5 h-5 text-orange-400" />
              BIỂU QUYẾT TREO CỔ (BỎ PHIẾU BAN NGÀY)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mỗi sáng dân làng chỉ được biểu quyết treo cổ <strong className="text-amber-300 font-bold">tối đa 1 người</strong>.
            </p>
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
                Nạn nhân: {lynchedPlayer?.name || 'Người chơi'} ({lynchedPlayer?.role?.name || 'Dân'})
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Làng đã hoàn tất xử tử 1 người trong ngày hôm nay. Không thể treo cổ thêm người nào khác!
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {onUndoLynch && (
                <GothicButton
                  variant="dark"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => onUndoLynch(lynchedTodayPlayerId)}
                >
                  Hoàn tác lượt treo cổ này
                </GothicButton>
              )}

              {hasStutteringJudge && (
                <GothicButton
                  variant="witch"
                  size="sm"
                  icon={Gavel}
                  onClick={() => setExtraLynchAllowed(true)}
                >
                  Thẩm Phán Lắp Bắp kích hoạt (Treo thêm lượt 2)
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
                          {isWolf && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                              🐺 Sói
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Vai: <span className="text-slate-300 font-medium">{p.role?.name || 'Dân'}</span>
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
                  Xác Nhận Treo Cổ Người Này (Chỉ 1 người)
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
          onClick={onAdvanceToNight}
          className="shadow-2xl shadow-purple-950/80"
        >
          <span>HẾT NGÀY - ĐÊM BUÔNG XUỐNG</span>
        </GothicButton>
      </div>
    </div>
  );
}
