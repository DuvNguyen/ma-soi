import React from 'react';
import NightBodyguardStep from './NightBodyguardStep';
import NightWerewolvesStep from './NightWerewolvesStep';
import NightSeerStep from './NightSeerStep';
import NightWitchStep from './NightWitchStep';
import NightCupidStep from './NightCupidStep';
import NightSpecialRolesStep from './NightSpecialRolesStep';

export default function NightRoleAction({
  currentRole,
  isWolfStep,
  players,
  alivePlayers,
  nightState,
  wolfCanKillDouble,
  canWolvesKillTeammates,
  canCursedWolfInfect,
  wolfVictim,
  showWolfWhisper,
  setShowWolfWhisper,
  wolfLogs,
  setWolfLogs,
  selectedSeerTarget,
  setSelectedSeerTarget,
  onSaveAction,
  isWolfPlayer,
  showConfirm
}) {
  if (currentRole.id === 'bao-ve') {
    return (
      <NightBodyguardStep
        players={players}
        alivePlayers={alivePlayers}
        nightState={nightState}
        onSaveAction={onSaveAction}
      />
    );
  }

  if (isWolfStep) {
    return (
      <NightWerewolvesStep
        players={players}
        alivePlayers={alivePlayers}
        nightState={nightState}
        wolfCanKillDouble={wolfCanKillDouble}
        canWolvesKillTeammates={canWolvesKillTeammates}
        canCursedWolfInfect={canCursedWolfInfect}
        wolfVictim={wolfVictim}
        showWolfWhisper={showWolfWhisper}
        setShowWolfWhisper={setShowWolfWhisper}
        wolfLogs={wolfLogs}
        setWolfLogs={setWolfLogs}
        onSaveAction={onSaveAction}
        isWolfPlayer={isWolfPlayer}
      />
    );
  }

  if (currentRole.id === 'tien-tri') {
    return (
      <NightSeerStep
        players={players}
        alivePlayers={alivePlayers}
        nightState={nightState}
        selectedSeerTarget={selectedSeerTarget}
        setSelectedSeerTarget={setSelectedSeerTarget}
        onSaveAction={onSaveAction}
        isWolfPlayer={isWolfPlayer}
      />
    );
  }

  if (currentRole.id === 'phu-thuy') {
    return (
      <NightWitchStep
        players={players}
        alivePlayers={alivePlayers}
        nightState={nightState}
        wolfVictim={wolfVictim}
        onSaveAction={onSaveAction}
        showConfirm={showConfirm}
      />
    );
  }

  if (currentRole.id === 'cupid') {
    return (
      <NightCupidStep
        players={players}
        nightState={nightState}
        onSaveAction={onSaveAction}
        isWolfPlayer={isWolfPlayer}
      />
    );
  }

  return (
    <NightSpecialRolesStep
      currentRole={currentRole}
      players={players}
      alivePlayers={alivePlayers}
      nightState={nightState}
      canWolvesKillTeammates={canWolvesKillTeammates}
      onSaveAction={onSaveAction}
      isWolfPlayer={isWolfPlayer}
    />
  );
}
