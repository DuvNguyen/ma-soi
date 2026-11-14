import React, { useState, useEffect } from 'react';
import { Sun, Scale } from 'lucide-react';
import triggerHaptic from '../utils/haptics';
import { useGothicDialog } from '../context/GothicDialogContext';
import { getPlayerRole } from '../utils/roleUtils';

// Modularized Day Subcomponents
import DayCasualtyAnnouncement from './day/DayCasualtyAnnouncement';
import DaySheriffBanner from './day/DaySheriffBanner';
import DayHunterBanner from './day/DayHunterBanner';
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
  scapegoatBannedVoterIds = []
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

      {/* 2. Public Office: Sheriff Banner */}
      <DaySheriffBanner
        players={players}
        alivePlayers={alivePlayers}
        onOpenSheriffModal={onOpenSheriffModal}
        onToggleSheriff={onToggleSheriff}
        showSheriffSelector={showSheriffSelector}
        setShowSheriffSelector={setShowSheriffSelector}
      />

      {/* 3. Pending Hunter Shot Warning Banner */}
      <DayHunterBanner
        pendingHunterShot={pendingHunterShot}
        onOpenHunterModal={onOpenHunterModal}
        onSkipHunterShot={onSkipHunterShot}
      />

      {/* 4. Discussion Timer & Bear Tamer Warning */}
      <DayDiscussionTimer
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isTimerRunning={isTimerRunning}
        setIsTimerRunning={setIsTimerRunning}
        formatTime={formatTime}
        alivePlayers={alivePlayers}
        players={players}
      />

      {/* 5. Special Day Action: Knight Duel */}
      <DayKnightDuel
        players={players}
        alivePlayers={alivePlayers}
        hasLynchedToday={hasLynchedToday}
        onKnightDuel={onKnightDuel}
        showConfirm={showConfirm}
        showAlert={showAlert}
      />

      {/* Scapegoat Decree Banner */}
      {scapegoatBannedVoterIds && scapegoatBannedVoterIds.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1a0f04]/60 to-slate-900/60 border border-amber-700/60 flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-600/80 flex items-center justify-center text-amber-300 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-amber-200 uppercase tracking-wide text-[11px] font-cinzel">
                Di Ngôn Người Thế Thân Có Hiệu Lực
              </div>
              <div className="text-slate-300 truncate text-[11px]">
                Người bị cấm biểu quyết: <span className="font-semibold text-amber-300">
                  {players.filter(p => scapegoatBannedVoterIds.includes(p.id)).map(p => `#${p.id} ${p.name}`).join(', ')}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-700/70 shrink-0">
            Ngày {roundNumber}
          </span>
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
      />

      {/* 7. Night Transition Footer Button */}
      <DayNightTransition
        pendingHunterShot={pendingHunterShot}
        sheriffDead={sheriffDead}
        sheriff={sheriff}
        onOpenHunterModal={onOpenHunterModal}
        onOpenSheriffModal={onOpenSheriffModal}
        onAdvanceToNight={onAdvanceToNight}
        showAlert={showAlert}
      />
    </div>
  );
}
