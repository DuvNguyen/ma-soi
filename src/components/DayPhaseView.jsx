import React, { useState, useEffect } from 'react';
import { Sun, Skull, Flame, ShieldAlert, Clock, Moon, AlertTriangle, Check, UserX, RotateCcw, Gavel, Play, Pause, Star, Award, ChevronDown, ChevronUp } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../utils/roleUtils';

export default function DayPhaseView({
  roundNumber,
  nightLogs,
  players,
  onLynchPlayer,
  onUndoLynch,
  onAdvanceToNight,
  onToggleSheriff,
  lynchedTodayPlayerId
}) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes discussion
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedLynchId, setSelectedLynchId] = useState(null);
  const [extraLynchAllowed, setExtraLynchAllowed] = useState(false);
  const [showSheriffSelector, setShowSheriffSelector] = useState(false);

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
  const hasStutteringJudge = players.some(p => getPlayerRole(p)?.id === 'tham-phan-lap-bap' && p.isAlive);

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
      {(() => {
        const deadTonight = players.filter(p => !p.isAlive && p.deathPhase === `Đêm ${roundNumber}`);
        const detailLogs = (nightLogs || []).filter(log => !log.startsWith('Đêm qua có ') && !log.startsWith('Đêm qua bình yên'));

        return (
          <div className="p-4 rounded-2xl bg-[#141624]/60 backdrop-blur-md border border-slate-700/60 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Skull className="w-4 h-4 text-rose-400" />
              Bản Tin Thương Vong Trong Đêm:
            </h3>

            {/* DÒNG ĐẦU TIÊN BẮT BUỘC: SỐ LƯỢNG NGƯỜI CHẾT VÀ TÊN TỪNG NGƯỜI */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 font-cinzel text-sm sm:text-base font-black ${
              deadTonight.length > 0
                ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
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

            {/* CÁC MÔ TẢ CHI TIẾT NẰM Ở DƯỚI */}
            {detailLogs.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                  Chi tiết diễn biến đêm:
                </span>
                {detailLogs.map((log, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/70 text-slate-200 text-xs sm:text-sm flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
                  onClick={() => setShowSheriffSelector(!showSheriffSelector)}
                >
                  {sheriffDead ? 'Chỉ Định Kế Nhiệm' : sheriff ? 'Đổi Người Giữ' : 'Bầu Cảnh Sát Trưởng'}
                  {showSheriffSelector ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </GothicButton>
              </div>
            </div>

            {/* Quick Sheriff Selector Drawer */}
            {showSheriffSelector && (
              <div className="mt-3 pt-3 border-t border-slate-800 animate-fade-in space-y-2">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Chạm vào người chơi còn sống để trao huy hiệu Cảnh Sát Trưởng (phiếu x2):</span>
                  <span className="text-[11px] text-amber-300/80 italic">Chức vụ giữ song song cùng lá nhân vật chính</span>
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
      <div className="p-5 rounded-2xl bg-[#0f111c]/60 backdrop-blur-md border border-purple-900/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
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
                Nạn nhân: {lynchedPlayer?.name || 'Người chơi'} ({getPlayerRole(lynchedPlayer)?.name || 'Chưa lộ vai'})
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
                  Hoàn tác treo cổ
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
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Vai: {p.isCursedWolf && origRole ? (
                            <span className="text-rose-300 font-bold">
                              {pRole?.name} <span className="text-amber-300 font-medium">(Gốc: {origRole.name})</span>
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
          onClick={onAdvanceToNight}
          className="shadow-2xl shadow-purple-950/80"
        >
          <span>Hết ngày ➔ Ban đêm</span>
        </GothicButton>
      </div>
    </div>
  );
}
