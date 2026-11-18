import React, { useState, useEffect } from 'react';
import { Sun, Scale } from 'lucide-react';
import triggerHaptic from '../utils/haptics';
import { useGothicDialog } from '../context/GothicDialogContext';
import { getPlayerRole } from '../utils/roleUtils';
import GothicButton from './ui/GothicButton';

// Modularized Day Subcomponents
import DayCasualtyAnnouncement from './day/DayCasualtyAnnouncement';
import DaySheriffBanner from './day/DaySheriffBanner';
import DayHunterBanner from './day/DayHunterBanner';
import DayAvengerBanner from './day/DayAvengerBanner';
import DayDiscussionTimer from './day/DayDiscussionTimer';
import DayKnightDuel from './day/DayKnightDuel';
import DayVotingSection from './day/DayVotingSection';
import DayNightTransition from './day/DayNightTransition';

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
  onOpenAssignRole,
  pendingHunterShot = null,
  onOpenHunterModal,
  onSkipHunterShot,
  pendingAvengerShot = null,
  onOpenAvengerModal,
  onSkipAvengerShot,
  scapegoatBannedVoterIds = [],
  scapegoatNominatedId = null,
  onEditScapegoatDecree,
  onClearScapegoatDecree,
  rolesInGame = [],
  deckRoleIds = [],
  onAssignRole
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes discussion
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedLynchId, setSelectedLynchId] = useState(null);
  const [extraLynchAllowed, setExtraLynchAllowed] = useState(false);
  const [showSheriffSelector, setShowSheriffSelector] = useState(false);

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
  const hasLynchedToday = Boolean(lynchedTodayPlayerId && !extraLynchAllowed);
  const sheriff = players.find(p => p.isSheriff);
  const sheriffDead = Boolean(sheriff && !sheriff.isAlive);
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

      {/* 1. Casualty Announcement Card */}
      <DayCasualtyAnnouncement
        players={players}
        roundNumber={roundNumber}
        nightLogs={nightLogs}
      />

      {/* 2. Priority Day Event Actions Container */}
      <div className="space-y-3">
        {/* Public Office: Sheriff Banner */}
        <DaySheriffBanner
          players={players}
          alivePlayers={alivePlayers}
          onOpenSheriffModal={onOpenSheriffModal}
          onToggleSheriff={onToggleSheriff}
          showSheriffSelector={showSheriffSelector}
          setShowSheriffSelector={setShowSheriffSelector}
        />

        {/* Pending Hunter Shot Warning Banner */}
        <DayHunterBanner
          pendingHunterShot={pendingHunterShot}
          onOpenHunterModal={onOpenHunterModal}
          onSkipHunterShot={onSkipHunterShot}
        />

        {/* Pending Avenger Retaliation Warning Banner */}
        <DayAvengerBanner
          pendingAvengerShot={pendingAvengerShot}
          onOpenAvengerModal={onOpenAvengerModal}
          onSkipAvengerShot={onSkipAvengerShot}
        />

        {/* Special Day Action: Knight Duel */}
        <DayKnightDuel
          players={players}
          alivePlayers={alivePlayers}
          hasLynchedToday={hasLynchedToday}
          onKnightDuel={onKnightDuel}
          showConfirm={showConfirm}
          showAlert={showAlert}
          rolesInGame={rolesInGame}
          deckRoleIds={deckRoleIds}
          onAssignRole={onAssignRole}
        />
      </div>

      {/* 3. Discussion Timer & Bear Tamer Warning */}
      <DayDiscussionTimer
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isTimerRunning={isTimerRunning}
        setIsTimerRunning={setIsTimerRunning}
        formatTime={formatTime}
        alivePlayers={alivePlayers}
        players={players}
        nightState={nightState}
      />

      {/* Scapegoat Nominated Player Banner (Lên giàn nghi vấn / giàn treo) */}
      {scapegoatNominatedId && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#26050a]/60 to-slate-900/60 border border-rose-600/60 flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-600/80 flex items-center justify-center text-rose-300 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-rose-200 uppercase tracking-wide text-[11px] font-cinzel">
                Oan Nhân Chỉ Định Lên Giàn Nghi Vấn (Ngày {roundNumber})
              </div>
              <div className="text-slate-300 truncate text-[11px]">
                Người chơi bị chỉ định: <span className="font-bold text-rose-300">
                  {(() => {
                    const np = players.find(p => p.id === scapegoatNominatedId);
                    return np ? `#${np.id} ${np.name}` : `#${scapegoatNominatedId}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <GothicButton
              type="button"
              variant="blood"
              size="sm"
              onClick={() => setSelectedLynchId(scapegoatNominatedId)}
            >
              Chọn Treo Cổ 🔥
            </GothicButton>
            {onEditScapegoatDecree && (
              <GothicButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onEditScapegoatDecree}
              >
                Sửa
              </GothicButton>
            )}
            {onClearScapegoatDecree && (
              <GothicButton
                type="button"
                variant="dark"
                size="sm"
                onClick={() => {
                  showConfirm({
                    title: 'GỠ BỎ CHỈ ĐỊNH OAN NHÂN',
                    message: 'Bạn có chắc chắn muốn hủy bỏ chỉ định lên giàn nghi vấn hôm nay?',
                    variant: 'dark',
                    confirmText: 'Gỡ Bỏ ⚖️',
                    onConfirm: onClearScapegoatDecree
                  });
                }}
              >
                Gỡ
              </GothicButton>
            )}
          </div>
        </div>
      )}

      {/* Scapegoat Decree Banner */}
      {scapegoatBannedVoterIds && scapegoatBannedVoterIds.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1a0f04]/60 to-slate-900/60 border border-amber-700/60 flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-600/80 flex items-center justify-center text-amber-300 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-amber-200 uppercase tracking-wide text-[11px] font-cinzel">
                Sắc Lệnh Oan Nhân (Ngày {roundNumber})
              </div>
              <div className="text-slate-300 truncate text-[11px]">
                Cấm biểu quyết: <span className="font-semibold text-amber-300">
                  {players.filter(p => scapegoatBannedVoterIds.includes(p.id)).map(p => `#${p.id} ${p.name}`).join(', ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEditScapegoatDecree && (
              <GothicButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onEditScapegoatDecree}
              >
                Sửa Di Ngôn
              </GothicButton>
            )}
            {onClearScapegoatDecree && (
              <GothicButton
                type="button"
                variant="dark"
                size="sm"
                onClick={() => {
                  showConfirm({
                    title: 'GỠ BỎ SẮC LỆNH OAN NHÂN',
                    message: 'Bạn có chắc chắn muốn hủy bỏ toàn bộ danh sách cấm biểu quyết ngày hôm nay?',
                    variant: 'dark',
                    confirmText: 'Gỡ Bỏ ⚖️',
                    onConfirm: onClearScapegoatDecree
                  });
                }}
              >
                Gỡ Bỏ
              </GothicButton>
            )}
          </div>
        </div>
      )}

      {/* 6. Voting & Lynching Execution Section */}
      <DayVotingSection
        alivePlayers={alivePlayers}
        hasLynchedToday={hasLynchedToday}
        lynchedPlayer={lynchedPlayer}
        lynchedTodayPlayerId={lynchedTodayPlayerId}
        onUndoLynch={onUndoLynch}
        onOpenAssignRole={onOpenAssignRole}
        hasStutteringJudge={hasStutteringJudge}
        setExtraLynchAllowed={setExtraLynchAllowed}
        selectedLynchId={selectedLynchId}
        setSelectedLynchId={setSelectedLynchId}
        nightState={nightState}
        onLynchPlayer={onLynchPlayer}
        showConfirm={showConfirm}
        scapegoatBannedVoterIds={scapegoatBannedVoterIds}
        scapegoatNominatedId={scapegoatNominatedId}
      />

      {/* 7. Night Transition Footer Button */}
      <DayNightTransition
        pendingHunterShot={pendingHunterShot}
        pendingAvengerShot={pendingAvengerShot}
        sheriffDead={sheriffDead}
        sheriff={sheriff}
        hasLynchedToday={hasLynchedToday}
        onOpenHunterModal={onOpenHunterModal}
        onOpenAvengerModal={onOpenAvengerModal}
        onOpenSheriffModal={onOpenSheriffModal}
        onAdvanceToNight={onAdvanceToNight}
        showAlert={showAlert}
        showConfirm={showConfirm}
      />
    </div>
  );
}
