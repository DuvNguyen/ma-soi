import React, { useState, useEffect } from 'react';
import { ROLES, PRESETS } from './data/roles';
import { checkGameEnd, resolveNightPhase } from './utils/gameLogic';
import { checkNeonConnection, syncGameStateApi, loadGameStateApi } from './services/api';
import NightPhaseView from './components/NightPhaseView';
import DayPhaseView from './components/DayPhaseView';
import PlayersGridView from './components/PlayersGridView';
import ActionModal from './components/ActionModal';
import SetupGameModal from './components/SetupGameModal';
import GameOverModal from './components/GameOverModal';
import RoleLibraryModal from './components/RoleLibraryModal';
import DeckTemplateModal from './components/DeckTemplateModal';
import PlayerRosterModal from './components/PlayerRosterModal';
import GothicButton from './components/ui/GothicButton';
import GothicBadge from './components/ui/GothicBadge';
import { Moon, Sun, Users, BookOpen, RotateCcw, Shield, Eye, Skull, Sparkles, Trophy, Layers, Database, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('night'); // 'night', 'day', 'table'

  // Neon DB Connection Status
  const [neonStatus, setNeonStatus] = useState({ ok: false, checked: false, branch: 'production' });

  // Game state
  const [roundNumber, setRoundNumber] = useState(1);
  const [isNight, setIsNight] = useState(true);
  const [rolesInGame, setRolesInGame] = useState([]);
  const [players, setPlayers] = useState([]);
  const [nightLogs, setNightLogs] = useState([]);
  const [gameEndResult, setGameEndResult] = useState(null);
  const [lynchedTodayPlayerId, setLynchedTodayPlayerId] = useState(null);

  // Night action state
  const [nightState, setNightState] = useState({
    protectedPlayerId: null,
    lastNightProtectedId: null,
    wolfTargetId: null,
    witchSaved: false,
    witchPoisonTargetId: null,
    witchHasHeal: true,
    witchHasPoison: true,
    seerCheckedId: null,
    cupidChosenIds: null
  });

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isRostersOpen, setIsRostersOpen] = useState(false);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    actionType: null,
    role: null,
    player: null
  });

  // Initial load
  useEffect(() => {
    checkNeonConnection().then(res => {
      setNeonStatus({
        ok: res.ok,
        checked: true,
        branch: res.branch || 'production',
        dbName: res.connection?.db_name
      });
    });

    initDefaultGame();
  }, []);

  // Auto-sync game state to Neon DB
  useEffect(() => {
    if (players.length > 0) {
      const stateToSave = {
        roundNumber,
        isNight,
        players,
        rolesInGameIds: rolesInGame.map(r => r.id),
        nightState,
        nightLogs,
        lynchedTodayPlayerId,
        gameEndResult,
        updatedAt: new Date().toISOString()
      };
      syncGameStateApi(stateToSave);
    }
  }, [roundNumber, isNight, players, nightState, lynchedTodayPlayerId, gameEndResult]);

  const initDefaultGame = () => {
    const defaultRoleIds = [
      "soi-thuong", "soi-thuong", "nua-nguoi-nua-soi", 
      "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc",
      "dan-lang", "dan-lang", "dan-lang", "dan-lang"
    ];
    const initialRoles = defaultRoleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
    
    const initialPlayers = Array.from({ length: 14 }, (_, i) => {
      const assignedRole = initialRoles[i] || null;
      return {
        id: i + 1,
        name: `Người chơi ${i + 1}`,
        roleId: assignedRole?.id || null,
        role: assignedRole,
        isAlive: true,
        deathReason: null,
        deathPhase: null,
        loverId: null,
        elderLives: assignedRole?.id === 'gia-lang' ? 2 : undefined,
        isRevealedIdiot: false
      };
    });

    setPlayers(initialPlayers);
    const uniqueRoles = Array.from(new Set(defaultRoleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);
    setRolesInGame(uniqueRoles);

    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setNightState({
      protectedPlayerId: null,
      lastNightProtectedId: null,
      wolfTargetId: null,
      witchSaved: false,
      witchPoisonTargetId: null,
      witchHasHeal: true,
      witchHasPoison: true,
      seerCheckedId: null,
      cupidChosenIds: null
    });
  };

  // RESET GAME DATA TO 0 (CHƠI LẠI TỪ ĐẦU)
  const handleResetGame = () => {
    if (!confirm('Bạn có chắc muốn RESET toàn bộ ván chơi về 0 để chơi lại từ đầu?')) return;
    
    setPlayers(prev => prev.map((p, i) => ({
      ...p,
      isAlive: true,
      deathReason: null,
      deathPhase: null,
      loverId: null,
      elderLives: p.role?.id === 'gia-lang' ? 2 : undefined,
      isRevealedIdiot: false
    })));

    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setNightState({
      protectedPlayerId: null,
      lastNightProtectedId: null,
      wolfTargetId: null,
      witchSaved: false,
      witchPoisonTargetId: null,
      witchHasHeal: true,
      witchHasPoison: true,
      seerCheckedId: null,
      cupidChosenIds: null
    });
  };

  // Start custom game from SetupModal or Template
  const handleStartCustomGame = ({ playerCount, roleIds, playerNames }) => {
    const selectedRoles = roleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
    
    const newPlayers = Array.from({ length: playerCount }, (_, i) => {
      const assignedRole = selectedRoles[i] || null;
      return {
        id: i + 1,
        name: (playerNames && playerNames[i]) || `Người chơi ${i + 1}`,
        roleId: assignedRole?.id || null,
        role: assignedRole,
        isAlive: true,
        deathReason: null,
        deathPhase: null,
        loverId: null,
        elderLives: assignedRole?.id === 'gia-lang' ? 2 : undefined,
        isRevealedIdiot: false
      };
    });

    const uniqueRoles = Array.from(new Set(roleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);

    setPlayers(newPlayers);
    setRolesInGame(uniqueRoles);
    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setNightState({
      protectedPlayerId: null,
      lastNightProtectedId: null,
      wolfTargetId: null,
      witchSaved: false,
      witchPoisonTargetId: null,
      witchHasHeal: true,
      witchHasPoison: true,
      seerCheckedId: null,
      cupidChosenIds: null
    });
  };

  const handleApplyTemplate = (template) => {
    const selectedRoles = template.roleIds.map(id => ROLES.find(r => r.id === id)).filter(Boolean);
    const count = template.playerCount;

    const newPlayers = Array.from({ length: count }, (_, i) => {
      const assignedRole = selectedRoles[i] || null;
      const existingName = players[i]?.name;
      return {
        id: i + 1,
        name: existingName || `Người chơi ${i + 1}`,
        roleId: assignedRole?.id || null,
        role: assignedRole,
        isAlive: true,
        deathReason: null,
        deathPhase: null,
        loverId: null,
        elderLives: assignedRole?.id === 'gia-lang' ? 2 : undefined,
        isRevealedIdiot: false
      };
    });

    const uniqueRoles = Array.from(new Set(template.roleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);

    setPlayers(newPlayers);
    setRolesInGame(uniqueRoles);
    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
  };

  const handleApplyRoster = (roster) => {
    const names = roster.playerNames;
    setPlayers(prev => {
      const targetCount = Math.max(prev.length, names.length);
      return Array.from({ length: targetCount }, (_, i) => {
        const existing = prev[i] || {
          id: i + 1,
          roleId: null,
          role: null,
          isAlive: true,
          deathReason: null,
          deathPhase: null,
          loverId: null,
          isRevealedIdiot: false
        };
        return {
          ...existing,
          name: names[i] || existing.name || `Người chơi ${i + 1}`
        };
      });
    });
  };

  const evaluateGameEnd = (currentPlayers) => {
    const result = checkGameEnd(currentPlayers);
    if (result.isEnded) {
      setGameEndResult(result);
    }
    return result;
  };

  const handleSaveAction = (type, payload) => {
    setNightState(prev => {
      const next = { ...prev };
      if (type === 'protect') {
        next.protectedPlayerId = payload;
      } else if (type === 'seer') {
        next.seerCheckedId = payload;
      } else if (type === 'wolves') {
        next.wolfTargetId = payload;
      } else if (type === 'witch') {
        next.witchSaved = payload.saved;
        next.witchPoisonTargetId = payload.poisonTargetId;
        if (payload.saved) next.witchHasHeal = false;
        if (payload.poisonTargetId) next.witchHasPoison = false;
      } else if (type === 'cupid') {
        next.cupidChosenIds = payload;
        setPlayers(current => current.map(p => {
          if (p.id === payload[0]) return { ...p, loverId: payload[1] };
          if (p.id === payload[1]) return { ...p, loverId: payload[0] };
          return p;
        }));
      } else if (type === 'hunter') {
        setPlayers(current => {
          const updated = current.map(p => {
            if (p.id === payload) {
              return {
                ...p,
                isAlive: false,
                deathReason: 'Bị Thợ Săn nổ súng bắn chết',
                deathPhase: isNight ? `Đêm ${roundNumber}` : `Ngày ${roundNumber}`
              };
            }
            return p;
          });
          evaluateGameEnd(updated);
          return updated;
        });
      }
      return next;
    });
  };

  const handleAssignRole = (playerId, role) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          roleId: role.id,
          role: role,
          elderLives: role.id === 'gia-lang' ? 2 : p.elderLives
        };
      }
      return p;
    }));

    setRolesInGame(prev => {
      if (!prev.some(r => r.id === role.id)) {
        return [...prev, role];
      }
      return prev;
    });
  };

  const handleAdvanceToDay = () => {
    const { updatedPlayers, killedPlayerIds, logs } = resolveNightPhase(
      players,
      nightState,
      roundNumber
    );

    setPlayers(updatedPlayers);
    setNightLogs(logs);
    setIsNight(false);
    setActiveTab('day');
    setLynchedTodayPlayerId(null);

    const end = evaluateGameEnd(updatedPlayers);

    if (!end.isEnded) {
      const deadHunter = updatedPlayers.find(p => killedPlayerIds.includes(p.id) && p.role?.id === 'tho-san');
      if (deadHunter) {
        setActionModal({
          isOpen: true,
          actionType: 'hunter',
          role: deadHunter.role,
          player: deadHunter
        });
      }
    }
  };

  const handleLynchPlayer = (playerId) => {
    const target = players.find(p => p.id === playerId);
    if (!target) return;

    if (target.role?.id === 'thang-ngoc' && !target.isRevealedIdiot) {
      alert(`[THÔNG BÁO QUẢN TRÒ]\n${target.name} là THẰNG NGỐC! Người này được cả làng tha thứ và không bị treo cổ. Tuy nhiên sẽ mất hoàn toàn quyền biểu quyết từ nay về sau!`);
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isRevealedIdiot: true } : p));
      setLynchedTodayPlayerId(playerId);
      return;
    }

    let updated = players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          isAlive: false,
          deathReason: 'Bị dân làng biểu quyết treo cổ trên giàn thiêu',
          deathPhase: `Ngày ${roundNumber}`
        };
      }
      return p;
    });

    if (target.loverId) {
      const partner = updated.find(x => x.id === target.loverId);
      if (partner && partner.isAlive) {
        partner.isAlive = false;
        partner.deathReason = `Chết vì quá đau buồn khi người yêu (${target.name}) bị treo cổ`;
        partner.deathPhase = `Ngày ${roundNumber}`;
        alert(`[TÌNH YÊU BI KỊCH]\n${partner.name} đau đớn gục ngã chết theo người tình ${target.name}!`);
      }
    }

    setPlayers(updated);
    setLynchedTodayPlayerId(playerId);
    const end = evaluateGameEnd(updated);

    if (!end.isEnded && target.role?.id === 'tho-san') {
      setActionModal({
        isOpen: true,
        actionType: 'hunter',
        role: target.role,
        player: target
      });
    }
  };

  const handleUndoLynch = (playerId) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, isAlive: true, deathReason: null, deathPhase: null };
      }
      return p;
    }));
    setLynchedTodayPlayerId(null);
  };

  const handleAdvanceToNight = () => {
    setRoundNumber(r => r + 1);
    setIsNight(true);
    setActiveTab('night');
    setLynchedTodayPlayerId(null);

    setNightState(prev => ({
      protectedPlayerId: null,
      lastNightProtectedId: prev.protectedPlayerId,
      wolfTargetId: null,
      witchSaved: false,
      witchPoisonTargetId: null,
      witchHasHeal: prev.witchHasHeal,
      witchHasPoison: prev.witchHasPoison,
      seerCheckedId: null,
      cupidChosenIds: prev.cupidChosenIds
    }));
  };

  const handleOpenAction = (actionType, role, player = null) => {
    setActionModal({
      isOpen: true,
      actionType,
      role,
      player
    });
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const aliveWolves = alivePlayers.filter(p => p.role?.teamCode === 'W').length;
  const aliveVillagers = alivePlayers.filter(p => p.role?.teamCode === 'V').length;

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-white">
      {/* Top Navigation Bar - Dark Gothic & Occult Witch */}
      <header className="sticky top-0 z-40 bg-[#0c0d16]/95 backdrop-blur-md border-b border-purple-950/80 px-4 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Neon Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-800 to-rose-900 border border-purple-600/60 flex items-center justify-center font-cinzel font-black text-white text-base shadow-[0_0_15px_rgba(147,51,234,0.4)]">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel font-black text-sm md:text-base tracking-wider text-slate-100 leading-tight">
                  QUẢN TRÒ MA SÓI
                </h1>
                {neonStatus.ok && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-700/60 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    Neon Cloud
                  </span>
                )}
              </div>
              <div className="text-[10px] text-purple-300/70 font-medium">
                {players.length} người chơi • Kịch bản đêm lần lượt
              </div>
            </div>
          </div>

          {/* Game Stats Tracker (Center) - WITH WEREWOLF HIGHLIGHT GLOW */}
          <div className="hidden lg:flex items-center gap-2.5 bg-[#10121d] border border-purple-950/80 px-3.5 py-1.5 rounded-2xl text-xs shadow-inner">
            <div className="flex items-center gap-1.5 font-bold">
              {isNight ? (
                <span className="text-purple-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 fill-purple-400 text-purple-400" /> Đêm {roundNumber}
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Ngày {roundNumber}
                </span>
              )}
            </div>
            <span className="text-slate-700">•</span>
            {/* Werewolf Highlight Glow */}
            <GothicBadge variant="wolf">
              🐺 {aliveWolves} Sói sống
            </GothicBadge>
            <span className="text-slate-700">•</span>
            <GothicBadge variant="villager">
              👨‍🌾 {aliveVillagers} Dân sống
            </GothicBadge>
            <span className="text-slate-700">•</span>
            <div className="text-slate-400 font-semibold">Tổng: {alivePlayers.length}/{players.length}</div>
          </div>

          {/* Quick Actions & Modals Triggers - GOTHIC CUSTOM BUTTONS */}
          <div className="flex items-center gap-2">
            {/* RESET GAME BUTTON - BLOOD DANGER */}
            <GothicButton
              variant="blood"
              size="sm"
              icon={RefreshCw}
              onClick={handleResetGame}
              title="Reset toàn bộ ván chơi về 0 để chơi lại"
            >
              <span className="hidden sm:inline">Reset Về 0</span>
            </GothicButton>

            {/* Templates button - WITCH PURPLE */}
            <GothicButton
              variant="witch"
              size="sm"
              icon={Layers}
              onClick={() => setIsTemplatesOpen(true)}
              title="Chọn hoặc tạo template bộ bài"
            >
              <span className="hidden sm:inline">Bộ Bài</span>
            </GothicButton>

            {/* Rosters button - WITCH PURPLE */}
            <GothicButton
              variant="witch"
              size="sm"
              icon={Users}
              onClick={() => setIsRostersOpen(true)}
              title="Danh sách người chơi đã lưu"
            >
              <span className="hidden sm:inline">Tên Người Chơi</span>
            </GothicButton>

            {/* Thư viện */}
            <GothicButton
              variant="dark"
              size="sm"
              icon={BookOpen}
              onClick={() => setIsLibraryOpen(true)}
            >
              <span className="hidden md:inline">Thư viện</span>
            </GothicButton>
          </div>
        </div>

        {/* Tab switcher - Custom Witch Dark */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 mt-2 pt-2 border-t border-purple-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(isNight ? 'night' : 'day')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeTab === 'night' || activeTab === 'day'
                  ? 'bg-gradient-to-r from-purple-950 to-[#22073d] border-purple-600 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
              }`}
            >
              {isNight ? <Moon className="w-3.5 h-3.5 fill-purple-400 text-purple-400" /> : <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
              <span>{isNight ? `Kịch Bản Đêm ${roundNumber} (Lần Lượt)` : `Ban Ngày ${roundNumber}`}</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeTab === 'table'
                  ? 'bg-gradient-to-r from-purple-950 to-[#22073d] border-purple-600 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Sơ Đồ Bàn Chơi ({alivePlayers.length} sống)</span>
            </button>
          </div>

          <div className="lg:hidden text-[11px] font-bold text-slate-400 flex items-center gap-2">
            <GothicBadge variant="wolf">
              🐺 {aliveWolves} Sói
            </GothicBadge>
            <span>•</span>
            <GothicBadge variant="villager">
              👨‍🌾 {aliveVillagers} Dân
            </GothicBadge>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'night' && (
          <NightPhaseView
            roundNumber={roundNumber}
            rolesInGame={rolesInGame}
            players={players}
            nightState={nightState}
            onSaveAction={handleSaveAction}
            onAssignRole={handleAssignRole}
            onAdvanceToDay={handleAdvanceToDay}
          />
        )}

        {activeTab === 'day' && (
          <DayPhaseView
            roundNumber={roundNumber}
            nightLogs={nightLogs}
            players={players}
            onLynchPlayer={handleLynchPlayer}
            onUndoLynch={handleUndoLynch}
            onAdvanceToNight={handleAdvanceToNight}
            lynchedTodayPlayerId={lynchedTodayPlayerId}
          />
        )}

        {activeTab === 'table' && (
          <PlayersGridView
            players={players}
            onOpenAssignRole={(p) => {
              setActionModal({
                isOpen: true,
                actionType: 'assign_role',
                role: p.role,
                player: p
              });
            }}
          />
        )}
      </main>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        actionType={actionModal.actionType}
        role={actionModal.role}
        players={players}
        nightState={nightState}
        onSaveAction={handleSaveAction}
        onAssignRole={handleAssignRole}
      />

      {/* Setup Game Modal */}
      <SetupGameModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartGame={handleStartCustomGame}
      />

      {/* Deck Template Manager Modal */}
      <DeckTemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Player Roster Manager Modal */}
      <PlayerRosterModal
        isOpen={isRostersOpen}
        onClose={() => setIsRostersOpen(false)}
        currentPlayers={players}
        onApplyRoster={handleApplyRoster}
      />

      {/* Game Over Banner */}
      <GameOverModal
        gameEndResult={gameEndResult}
        onRestartGame={handleResetGame}
      />

      {/* Role Library Modal */}
      <RoleLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
}
