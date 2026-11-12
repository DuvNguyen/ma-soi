import React, { useState, useEffect } from 'react';
import { ROLES, PRESETS } from './data/roles';
import { getRoleCapacity } from './utils/deckUtils';
import { getRole, getPlayerRole, getPlayerOriginalRole, isWolfPlayer, WOLF_ROLE_IDS } from './utils/roleUtils';
import { DEFAULT_PLAYER_NAMES, getDefaultPlayerNames } from './data/defaultPlayers';
import { useGothicDialog } from './context/GothicDialogContext';
import { checkGameEnd, resolveNightPhase } from './utils/gameLogic';
import { Player } from './domain/models/Player.js';
import { WerewolfGame } from './domain/models/WerewolfGame.js';
import triggerHaptic from './utils/haptics';
import { checkNeonConnection, syncGameStateApi, loadGameStateApi, saveMatchRecordApi } from './services/api';
import NightPhaseView from './components/NightPhaseView';
import DayPhaseView from './components/DayPhaseView';
import PlayersGridView from './components/PlayersGridView';
import ActionModal from './components/ActionModal';
import UnifiedGameSetupModal from './components/UnifiedGameSetupModal';
import GameOverModal from './components/GameOverModal';
import SheriffSuccessionModal from './components/SheriffSuccessionModal';
import RoleLibraryModal from './components/RoleLibraryModal';
import DeckTemplateModal from './components/DeckTemplateModal';
import PlayerRosterModal from './components/PlayerRosterModal';
import MatchHistoryModal from './components/MatchHistoryModal';
import CemeteryModal from './components/CemeteryModal';
import GameSettingsModal from './components/GameSettingsModal';
import GothicButton from './components/ui/GothicButton';
import GothicBadge from './components/ui/GothicBadge';
import WolfIcon from './components/ui/WolfIcon';
import { Moon, Sun, Users, BookOpen, RotateCcw, Shield, Eye, Skull, Sparkles, Trophy, Layers, Database, CheckCircle2, RefreshCw, History, Settings, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'werewolf_active_game_state';
export const GAME_SCHEMA_VERSION = 2;

export const DEFAULT_NIGHT_STATE = {
  protectedPlayerId: null,
  lastNightProtectedId: null,
  wolfTargetId: null,
  wolfTargetId2: null,
  wolfSkipped: false,
  isCursedInfect: false,
  cursedUsed: false,
  lastCursedVictimId: null,
  witchSaved: false,
  witchPoisonTargetId: null,
  witchHasHeal: true,
  witchHasPoison: true,
  seerCheckedId: null,
  cupidChosenIds: null,
  skippedRoles: []
};

export const DEFAULT_PLAYER_PROPS = {
  currentRoleId: null,
  roleId: null,
  originalRoleId: null,
  isAlive: true,
  deathReason: null,
  deathPhase: null,
  loverId: null,
  elderLives: undefined,
  isRevealedIdiot: false,
  isSheriff: false
};

const DEFAULT_DECK_ROLE_IDS = [
  "soi-thuong", "soi-thuong", "nua-nguoi-nua-soi", 
  "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc",
  "dan-lang", "dan-lang", "dan-lang", "dan-lang"
];

function getInitialSavedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Schema version check: Clean up legacy or incompatible cache across deployments
    if (parsed && parsed.schemaVersion !== GAME_SCHEMA_VERSION) {
      console.info(`[Storage] Stale schema version detected (stored: ${parsed.schemaVersion}, current: ${GAME_SCHEMA_VERSION}). Clearing cache.`);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('werewolf_current_night_step');
      return null;
    }

    if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved game from localStorage:', err);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }
  return null;
}

export default function App() {
  const { showConfirm, showAlert } = useGothicDialog();

  // Load saved state synchronously on first render to prevent any layout flash
  const savedInitial = getInitialSavedState();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState(() => savedInitial?.activeTab || (savedInitial?.isNight === false ? 'day' : 'night'));

  // Neon DB Connection Status
  const [neonStatus, setNeonStatus] = useState({ ok: false, checked: false, branch: 'production' });

  // Game state
  const [deckRoleIds, setDeckRoleIds] = useState(() => savedInitial?.deckRoleIds || DEFAULT_DECK_ROLE_IDS);
  const [roundNumber, setRoundNumber] = useState(() => savedInitial?.roundNumber || 1);
  const [isNight, setIsNight] = useState(() => savedInitial?.isNight !== undefined ? savedInitial.isNight : true);
  
  const [rolesInGame, setRolesInGame] = useState(() => {
    const ids = savedInitial?.rolesInGameIds || savedInitial?.deckRoleIds || DEFAULT_DECK_ROLE_IDS;
    return Array.from(new Set(ids)).map(id => ROLES.find(r => r.id === id)).filter(Boolean);
  });

  const [players, setPlayers] = useState(() => {
    if (savedInitial?.players && savedInitial.players.length > 0) {
      return savedInitial.players.map((p, idx) => {
        // Loại bỏ triệt để tên Thu Hà tồn lưu từ cache cũ
        const cleanName = p.name === 'Thu Hà' ? `Người chơi ${p.id || idx + 1}` : (p.name || `Người chơi ${p.id || idx + 1}`);
        return Player.fromJSON({
          ...p,
          name: cleanName
        });
      });
    }
    return Array.from({ length: 14 }, (_, i) => Player.fromJSON({
      id: i + 1,
      name: DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`
    }));
  });

  const [nightLogs, setNightLogs] = useState(() => savedInitial?.nightLogs || []);
  const [gameDiary, setGameDiary] = useState(() => savedInitial?.gameDiary || []);
  const [gameEndResult, setGameEndResult] = useState(() => savedInitial?.gameEndResult || null);
  const [lynchedTodayPlayerId, setLynchedTodayPlayerId] = useState(() => savedInitial?.lynchedTodayPlayerId ?? null);
  const [isVillageCursed, setIsVillageCursed] = useState(() => savedInitial?.isVillageCursed || false);
  const [wolfCanKillDouble, setWolfCanKillDouble] = useState(() => savedInitial?.wolfCanKillDouble || false);
  const [canWolvesKillTeammates, setCanWolvesKillTeammates] = useState(() => {
    try {
      const saved = localStorage.getItem('werewolf_rule_wolves_can_kill_teammates');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return savedInitial?.canWolvesKillTeammates || false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence of current night step (survival across F5 / reload)
  const [currentNightStepIdx, setCurrentNightStepIdx] = useState(() => {
    try {
      const savedStep = localStorage.getItem('werewolf_current_night_step');
      if (savedStep !== null) {
        const parsed = parseInt(savedStep, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch (e) {}
    return savedInitial?.currentNightStepIdx || 0;
  });

  // Night action state: shallow merge with defaults to ensure newly added properties are never undefined
  const [nightState, setNightState] = useState(() => {
    return {
      ...DEFAULT_NIGHT_STATE,
      ...(savedInitial?.nightState || {})
    };
  });

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupModalTab, setSetupModalTab] = useState('setup');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCemeteryOpen, setIsCemeteryOpen] = useState(false);
  const [isRostersOpen, setIsRostersOpen] = useState(false);
  const [sheriffModalState, setSheriffModalState] = useState({
    isOpen: false,
    deadSheriff: null,
    isMandatory: false
  });
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    actionType: null,
    role: null,
    player: null
  });

  // Initial load: Check Neon DB connection
  useEffect(() => {
    checkNeonConnection().then(res => {
      setNeonStatus({
        ok: res.ok,
        checked: true,
        branch: res.branch || 'production',
        dbName: res.connection?.db_name
      });
    });
  }, []);

  // Auto-sync game state to localStorage & Neon DB
  useEffect(() => {
    if (players.length > 0) {
      const stateToSave = {
        schemaVersion: GAME_SCHEMA_VERSION,
        roundNumber,
        isNight,
        activeTab,
        players,
        deckRoleIds,
        rolesInGameIds: rolesInGame.map(r => r.id),
        nightState,
        nightLogs,
        gameDiary,
        lynchedTodayPlayerId,
        gameEndResult,
        currentNightStepIdx,
        canWolvesKillTeammates,
        updatedAt: new Date().toISOString()
      };

      // 1. Instant local persistence (survival across F5 / reload)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.warn('Failed to save state to localStorage:', err);
      }

      // 2. Cloud DB sync (Neon)
      syncGameStateApi(stateToSave);
    }
  }, [roundNumber, isNight, activeTab, players, deckRoleIds, rolesInGame, nightState, lynchedTodayPlayerId, gameEndResult, currentNightStepIdx, gameDiary, canWolvesKillTeammates]);

  // Helper canonical diary chronologist: merges & sorts chapters strictly by round number and phase (Night before Day)
  const appendToDiary = (prevDiary, newEntry) => {
    const filtered = (prevDiary || []).filter(d => d.phase !== newEntry.phase);
    const updated = [...filtered, newEntry];
    return updated.sort((a, b) => {
      const extractRound = (item) => {
        if (typeof item.round === 'number') return item.round;
        const match = String(item.phase || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 1;
      };
      const rA = extractRound(a);
      const rB = extractRound(b);
      if (rA !== rB) return rA - rB;
      const isNightA = a.type === 'night' || (a.phase && a.phase.includes('Đêm'));
      const isNightB = b.type === 'night' || (b.phase && b.phase.includes('Đêm'));
      return isNightA ? -1 : isNightB ? 1 : 0;
    });
  };

  const handleToggleWolvesKillTeammates = (nextVal) => {
    setCanWolvesKillTeammates(nextVal);
    try {
      localStorage.setItem('werewolf_rule_wolves_can_kill_teammates', JSON.stringify(nextVal));
    } catch (e) {}
    handleResetGame();
  };

  const initDefaultGame = () => {
    const defaultRoleIds = [
      "soi-thuong", "soi-thuong", "nua-nguoi-nua-soi", 
      "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc",
      "dan-lang", "dan-lang", "dan-lang", "dan-lang"
    ];
    setDeckRoleIds(defaultRoleIds);
    
    // MẶC ĐỊNH BẮT ĐẦU: 14 NGƯỜI CHƠI VỚI TÊN THỰC TẾ, ROLE = NULL (CHƯA CÓ ROLE NGAY TỪ ĐẦU)
    // QUẢN TRÒ BẮT ĐẦU GỌI TỪNG VAI TRONG ĐÊM 1 ĐỂ GÁN DẦN TỪNG NGƯỜI
    const initialPlayers = Array.from({ length: 14 }, (_, i) => Player.fromJSON({
      id: i + 1,
      name: DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`
    }));

    setPlayers(initialPlayers);
    const uniqueRoles = Array.from(new Set(defaultRoleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);
    setRolesInGame(uniqueRoles);

    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameDiary([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}
    setNightState({ ...DEFAULT_NIGHT_STATE });
  };

  // RESET GAME DATA TO 0 (CHƠI LẠI TỪ ĐẦU)
  const handleResetGame = () => {
    showConfirm({
      title: 'HỦY DIỆT VÁN ĐẤU & RESET?',
      message: 'Bạn có chắc muốn RESET toàn bộ ván chơi về 0 để bắt đầu lại từ đầu?\n\nToàn bộ vai trò sẽ được xóa về trạng thái ẩn danh để Quản trò gọi gán dần từ Đêm 1. Tên người chơi và thứ tự ghế ngồi sẽ được giữ nguyên.',
      variant: 'blood',
      confirmText: 'Reset Về 0 Ngay 🩸',
      cancelText: 'Giữ Lại Ván Chơi',
      onConfirm: () => {
        setPlayers(prev => prev.map((p) => {
          const resetProps = {
            currentRoleId: null,
            roleId: null,
            originalRoleId: null,
            role: null,
            isAlive: true,
            deathReason: null,
            deathPhase: null,
            loverId: null,
            elderLives: undefined,
            isRevealedIdiot: false,
            isSheriff: false,
            isCursedWolf: false,
            curseNight: null,
            poisonedByRustySword: false,
            rustySwordPoisonRound: null,
            hasUsedKnightDuel: false,
            shadowHostId: null
          };
          return p instanceof Player ? p.clone(resetProps) : new Player({ ...p, ...resetProps });
        }));

        setRoundNumber(1);
        setIsNight(true);
        setActiveTab('night');
        setNightLogs([]);
        setGameEndResult(null);
        setLynchedTodayPlayerId(null);
        setIsVillageCursed(false);
        setWolfCanKillDouble(false);
        setNightState({ ...DEFAULT_NIGHT_STATE });

        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  // Start custom game from SetupModal or Template
  const handleStartCustomGame = ({ playerCount, roleIds, playerNames }) => {
    setDeckRoleIds(roleIds);
    const uniqueRoles = Array.from(new Set(roleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);
    setRolesInGame(uniqueRoles);

    const newPlayers = Array.from({ length: playerCount }, (_, i) => Player.fromJSON({
      id: i + 1,
      name: (playerNames && playerNames[i]) || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`
    }));

    setPlayers(newPlayers);
    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameDiary([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}
    setNightState({ ...DEFAULT_NIGHT_STATE });
  };

  const handleApplyGameSetup = ({ playerNames, roleIds }) => {
    const finalRoleIds = roleIds && roleIds.length > 0 ? roleIds : deckRoleIds;
    const count = playerNames?.length || finalRoleIds.length;

    setDeckRoleIds(finalRoleIds);
    const uniqueRoles = Array.from(new Set(finalRoleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);
    setRolesInGame(uniqueRoles);

    const newPlayers = Array.from({ length: count }, (_, i) => {
      const name = playerNames?.[i] || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`;
      return Player.fromJSON({
        id: i + 1,
        name
      });
    });

    setPlayers(newPlayers);
    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameDiary([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}
    setNightState({ ...DEFAULT_NIGHT_STATE });
  };

  const handleApplyTemplate = (template) => {
    setDeckRoleIds(template.roleIds);
    const uniqueRoles = Array.from(new Set(template.roleIds))
      .map(id => ROLES.find(r => r.id === id))
      .filter(Boolean);
    setRolesInGame(uniqueRoles);
    const count = template.playerCount || template.roleIds.length;

    const newPlayers = Array.from({ length: count }, (_, i) => {
      const existingName = players[i]?.name;
      const tplName = template.playerNames?.[i];
      return Player.fromJSON({
        id: i + 1,
        name: tplName || existingName || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`
      });
    });

    setPlayers(newPlayers);
    setRoundNumber(1);
    setIsNight(true);
    setActiveTab('night');
    setNightLogs([]);
    setGameDiary([]);
    setGameEndResult(null);
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}
    setNightState({ ...DEFAULT_NIGHT_STATE });
  };

  const handleApplyRoster = (roster) => {
    const names = roster.playerNames;
    if (!names || names.length === 0) return;

    // Set the table size to match exactly the roster count
    const targetCount = names.length;

    setPlayers(prev => {
      return Array.from({ length: targetCount }, (_, i) => {
        const existing = prev[i];
        if (existing) {
          return {
            ...existing,
            id: i + 1,
            name: names[i] || `Người chơi ${i + 1}`,
            loverId: existing.loverId && existing.loverId <= targetCount ? existing.loverId : null
          };
        }
        return Player.fromJSON({
          id: i + 1,
          name: names[i] || `Người chơi ${i + 1}`
        });
      });
    });

    // Automatically adjust deck size to match the new player count
    setDeckRoleIds(prevDeck => {
      let nextDeck = [...prevDeck];
      if (nextDeck.length > targetCount) {
        // If deck has more cards than players, remove excess "dan-lang" first
        while (nextDeck.length > targetCount && nextDeck.includes('dan-lang')) {
          const idx = nextDeck.lastIndexOf('dan-lang');
          nextDeck.splice(idx, 1);
        }
        // If still more cards than players, slice to targetCount
        if (nextDeck.length > targetCount) {
          nextDeck = nextDeck.slice(0, targetCount);
        }
      } else if (nextDeck.length < targetCount) {
        // If deck has fewer cards than players, pad with "dan-lang"
        while (nextDeck.length < targetCount) {
          nextDeck.push('dan-lang');
        }
      }
      return nextDeck;
    });

    // Sanitize night state for targets beyond targetCount
    setNightState(prev => ({
      ...prev,
      cupidChosenIds: (prev.cupidChosenIds || []).filter(id => id <= targetCount),
      wolfTargetId: prev.wolfTargetId && prev.wolfTargetId <= targetCount ? prev.wolfTargetId : null,
      protectedPlayerId: prev.protectedPlayerId && prev.protectedPlayerId <= targetCount ? prev.protectedPlayerId : null,
      seerCheckedId: prev.seerCheckedId && prev.seerCheckedId <= targetCount ? prev.seerCheckedId : null,
    }));
  };

  // Reactive Game End Evaluator: Tự động kiểm tra điều kiện kết thúc ván đấu ngay khi players thay đổi
  useEffect(() => {
    if (!players || players.length === 0) return;
    if (gameEndResult?.isEnded) return;

    const hasActiveGame = players.some(p => p.roleId || p.currentRoleId || p.isCursedWolf || !p.isAlive);
    if (!hasActiveGame) return;

    const result = checkGameEnd(players);
    if (result.isEnded) {
      setGameEndResult(result);
    }
  }, [players, gameEndResult]);

  const handleOpenSheriffModal = (deadSheriff = null, isMandatory = false) => {
    setSheriffModalState({
      isOpen: true,
      deadSheriff: deadSheriff || players.find(p => p.isSheriff) || null,
      isMandatory: !!isMandatory
    });
  };

  const handleCloseSheriffModal = () => {
    setSheriffModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectSheriffSuccessor = (newSheriffId) => {
    handleToggleSheriff(newSheriffId);
    handleCloseSheriffModal();
  };

  const evaluateGameEnd = (currentPlayers) => {
    const result = checkGameEnd(currentPlayers);
    if (result.isEnded) {
      setGameEndResult(result);
      // Auto save match record to Neon Database
      // Quyển nhật ký biên niên sử đầy đủ từng đêm / ngày
      let fullTimeline = [...gameDiary];
      if (!isNight) {
        const lynchedP = players.find(p => p.id === lynchedTodayPlayerId);
        fullTimeline = appendToDiary(fullTimeline, {
          phase: `Ngày ${roundNumber}`,
          type: 'day',
          round: roundNumber,
          logs: [
            lynchedP ? `Dân làng biểu quyết treo cổ ${lynchedP.name} (#${lynchedP.id}).` : 'Ban ngày trôi qua, không ai bị treo cổ.'
          ]
        });
      }

      const totalNights = fullTimeline.filter(d => d.type === 'night' || d.phase?.includes('Đêm')).length;
      const totalDays = fullTimeline.filter(d => d.type === 'day' || d.phase?.includes('Ngày')).length;
      const totalRounds = Math.max(roundNumber, totalNights, totalDays, 1);

      const matchData = {
        id: `match-${Date.now()}`,
        roomName: `Ván đấu Ma Sói (${players.length} người)`,
        roundNumber,
        totalRounds,
        totalNights,
        totalDays,
        winnerTeam: result.winner,
        winnerDesc: result.description || result.reason,
        winnerDescription: result.description || result.reason,
        playerCount: players.length,
        aliveCount: currentPlayers.filter(p => p.isAlive).length,
        cupidPair: nightState.cupidChosenIds || null,
        cupidLovers: nightState.cupidChosenIds && nightState.cupidChosenIds.length === 2 ? {
          player1: currentPlayers.find(p => p.id === nightState.cupidChosenIds[0]),
          player2: currentPlayers.find(p => p.id === nightState.cupidChosenIds[1])
        } : null,
        playersSnapshot: currentPlayers.map(p => ({
          id: p.id,
          name: p.name,
          currentRoleId: p.currentRoleId || p.roleId,
          roleId: p.currentRoleId || p.roleId,
          originalRoleId: p.originalRoleId || null,
          isAlive: p.isAlive,
          isCursedWolf: p.isCursedWolf || false,
          deathReason: p.deathReason || null,
          deathPhase: p.deathPhase || null,
          loverId: p.loverId || null
        })),
        nightLogs: fullTimeline,
        dayLogs: fullTimeline.filter(d => d.type === 'day'),
        createdAt: new Date().toISOString()
      };

      // 1. Lưu tức thì tiến trình vào LocalStorage (JSON) cho bảng lịch sử đấu
      try {
        const savedHistory = JSON.parse(localStorage.getItem('werewolf_match_history') || '[]');
        savedHistory.unshift(matchData);
        localStorage.setItem('werewolf_match_history', JSON.stringify(savedHistory.slice(0, 50)));
      } catch (err) {
        console.warn('Failed to save match to localStorage:', err);
      }

      // 2. Tự động lưu lên Neon Database
      saveMatchRecordApi(matchData).catch(err => console.error("Auto save match failed:", err));
    }
    return result;
  };

  const handleSaveAction = (type, payload, extra = {}) => {
    setNightState(prev => {
      const next = { ...prev };
      if (type === 'protect') {
        next.protectedPlayerId = payload;
        next.protectSkipped = !!extra.protectSkipped;
      } else if (type === 'seer') {
        next.seerCheckedId = payload;
      } else if (type === 'wolves') {
        next.wolfTargetId = payload;
        next.wolfSkipped = !!extra.wolfSkipped;
        if (extra.wolfTargetId2 !== undefined) {
          next.wolfTargetId2 = extra.wolfTargetId2;
        }
        if (extra.isCursedInfect !== undefined) {
          next.isCursedInfect = !!extra.isCursedInfect;
        }
      } else if (type === 'wolves_second') {
        next.wolfTargetId2 = payload;
      } else if (type === 'curse_convert') {
        // Immediately convert victim into Werewolf and clear bite target so wolves can pick again
        const victimId = payload;
        next.wolfTargetId = null;
        next.isCursedInfect = false;
        next.cursedUsed = true;
        next.lastCursedVictimId = victimId;

        setPlayers(current => {
          const updated = current.map(p => {
            if (p.id === victimId) {
              const origId = p.originalRoleId || p.currentRoleId || p.roleId || 'dan-lang';
              return {
                ...p,
                originalRoleId: origId,
                currentRoleId: 'soi-thuong',
                roleId: 'soi-thuong',
                role: null,
                isCursedWolf: true,
                curseNight: roundNumber
              };
            }
            return p;
          });
          evaluateGameEnd(updated);
          return updated;
        });
      } else if (type === 'undo_curse_convert') {
        // Revert cursed werewolf back to original role
        const victimId = payload || prev.lastCursedVictimId;
        if (victimId) {
          next.cursedUsed = false;
          next.lastCursedVictimId = null;
          next.wolfTargetId = victimId;

          setPlayers(current => current.map(p => {
            if (p.id === victimId) {
              const origId = p.originalRoleId || null;
              return {
                ...p,
                currentRoleId: origId,
                roleId: origId,
                originalRoleId: null,
                isCursedWolf: false,
                curseNight: undefined
              };
            }
            return p;
          }));
        }
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
      } else if (type === 'wildChild') {
        next.wildChildIdolId = payload;
      } else if (type === 'shadowHost') {
        next.shadowHostId = payload;
        setPlayers(current => current.map(p => {
          if ((p.currentRoleId || p.roleId) === 'anh-tu' || getPlayerRole(p)?.id === 'anh-tu') {
            return { ...p, shadowHostId: payload };
          }
          return p;
        }));
      } else if (type === 'piper') {
        next.piperChosenIds = payload;
      } else if (type === 'raven') {
        next.ravenTargetId = payload;
        next.ravenSkipped = !!extra.ravenSkipped;
      } else if (type === 'fox') {
        next.foxTargetId = payload;
        next.foxLostPower = !!extra.foxLostPower;
        next.foxCheckedThisNight = true;
      } else if (type === 'whiteWolf') {
        next.whiteWolfVictimId = payload;
        next.whiteWolfSkipped = !!extra.whiteWolfSkipped;
      } else if (type === 'moonPriestess') {
        next.silencedPlayerId = payload;
        next.moonPriestessSkipped = !!extra.moonPriestessSkipped;
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
    if (!role) return;

    const game = new WerewolfGame({
      roundNumber,
      isNight,
      players,
      deckRoleIds,
      rolesInGameIds: rolesInGame.map(r => r.id),
      nightState,
      nightLogs,
      gameDiary,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult
    });

    // Rule: Nếu vai này đã có người giữ và người đó bị Sói Nguyền lây nhiễm thành Sói -> vai đã bị loại khỏi làng, không gán cho người khác
    if (game.isRoleEliminated(role.id)) {
      showAlert({
        title: 'VAI TRÒ ĐÃ BỊ LOẠI!',
        message: `Vai trò "${role.name}" đã bị loại khỏi làng vì người giữ vai ban đầu đã bị Sói Nguyền đồng hóa thành Ma Sói. Theo luật chơi, lá bài này không được gán cho người khác!`,
        variant: 'warning'
      });
      return;
    }

    // Rule: Nếu tất cả người giữ vai này trước đó đã chết -> vai đã mất, không gán cho người khác
    if (!game.canRoleBeReassigned(role.id)) {
      const deadHolders = players.filter(p => (p.currentRoleId || p.roleId) === role.id && !p.isAlive);
      showAlert({
        title: 'NGƯỜI GIỮ VAI ĐÃ HY SINH!',
        message: `Vai trò "${role.name}" đã bị mất vì người giữ vai (${deadHolders.map(p => `#${p.id} ${p.name}`).join(', ')}) đã qua đời. Theo luật chơi, vai này không được gán lại cho người khác!`,
        variant: 'warning'
      });
      return;
    }

    const capacity = getRoleCapacity(role.id, deckRoleIds);

    setPlayers(prev => {
      const targetPlayer = prev.find(p => p.id === playerId);
      const targetCurrentId = targetPlayer?.currentRoleId || targetPlayer?.roleId;
      // Toggle unassign if clicking current holder
      if (targetCurrentId === role.id) {
        return prev.map(p => p.id === playerId ? (p instanceof Player ? p.unassignRole() : { ...p, currentRoleId: null, roleId: null, role: null }) : p);
      }

      // STRICT "ONE PERSON 1 ROLE" RULE:
      // If target player already has ANOTHER character role, block assigning!
      if (targetCurrentId && targetCurrentId !== role.id) {
        return prev;
      }

      // Single role capacity (capacity === 1): STRICTLY REVOKE FROM ANY OTHER HOLDER
      if (capacity === 1) {
        return prev.map(p => {
          if (p.id === playerId) {
            return p instanceof Player ? p.assignRole(role.id) : {
              ...p,
              currentRoleId: role.id,
              roleId: role.id,
              role: null,
              elderLives: role.id === 'gia-lang' ? 2 : p.elderLives
            };
          }
          const pCurrentId = p.currentRoleId || p.roleId;
          if (pCurrentId === role.id) {
            return p instanceof Player ? p.unassignRole() : {
              ...p,
              currentRoleId: null,
              roleId: null,
              role: null,
              elderLives: undefined
            };
          }
          return p;
        });
      }

      // Multi-capacity role (e.g. werewolves / villagers):
      const currentHolders = prev.filter(p => (p.currentRoleId || p.roleId) === role.id);
      if (currentHolders.length >= capacity && capacity > 1) {
        const oldestHolder = currentHolders[0];
        return prev.map(p => {
          if (p.id === playerId) {
            return p instanceof Player ? p.assignRole(role.id) : { ...p, currentRoleId: role.id, roleId: role.id, role: null };
          }
          if (p.id === oldestHolder.id) {
            return p instanceof Player ? p.unassignRole() : { ...p, currentRoleId: null, roleId: null, role: null };
          }
          return p;
        });
      }

      return prev.map(p => {
        if (p.id === playerId) {
          return p instanceof Player ? p.assignRole(role.id) : {
            ...p,
            currentRoleId: role.id,
            roleId: role.id,
            role: null,
            elderLives: role.id === 'gia-lang' ? 2 : p.elderLives
          };
        }
        return p;
      });
    });

    setRolesInGame(prev => {
      if (!prev.some(r => r.id === role.id)) {
        return [...prev, role];
      }
      return prev;
    });
  };

  const handleAssignRoleToMultiple = (playerIds, role) => {
    if (!role) return;
    const isWolf = WOLF_ROLE_IDS.includes(role.id);
    
    // For werewolves, maximum capacity is strictly configured by the deck
    const capacity = isWolf
      ? (deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2)
      : getRoleCapacity(role.id, deckRoleIds);

    const allowedIds = capacity > 1 ? playerIds.slice(0, capacity) : playerIds.slice(0, 1);

    // If it's a wolf pack, grab the available wolf roles from deckRoleIds to assign correctly
    const wolfRolesInDeck = isWolf
      ? deckRoleIds
          .filter(id => WOLF_ROLE_IDS.includes(id))
          .map(id => ROLES.find(r => r.id === id))
          .filter(Boolean)
      : [];

    // User Rule: Người được chọn đầu tiên thì là Sói Nguyền (nếu bộ bài có Sói Nguyền/Sói Quỷ)
    if (isWolf && wolfRolesInDeck.length > 0) {
      const cursedIdx = wolfRolesInDeck.findIndex(r => ['soi-quy', 'nguoi-cha-cua-soi', 'soi-nguyen'].includes(r.id));
      if (cursedIdx > 0) {
        const [cursedRole] = wolfRolesInDeck.splice(cursedIdx, 1);
        wolfRolesInDeck.unshift(cursedRole);
      }
    }

    setPlayers(prev => prev.map(p => {
      const targetIdx = allowedIds.indexOf(p.id);
      if (targetIdx !== -1) {
        const assignedRole = (isWolf && wolfRolesInDeck[targetIdx]) ? wolfRolesInDeck[targetIdx] : role;
        return p instanceof Player ? p.assignRole(assignedRole.id) : {
          ...p,
          currentRoleId: assignedRole.id,
          roleId: assignedRole.id,
          role: null,
          elderLives: assignedRole.id === 'gia-lang' ? 2 : p.elderLives
        };
      }
      // If someone was previously assigned this role or wolf role but was removed from allowedIds
      const pCurrentId = p.currentRoleId || p.roleId;
      if (isWolf && (isWolfPlayer(p) || WOLF_ROLE_IDS.includes(pCurrentId)) && !allowedIds.includes(p.id)) {
        return p instanceof Player ? p.unassignRole() : { ...p, currentRoleId: null, roleId: null, role: null };
      }
      if (!isWolf && pCurrentId === role.id && !allowedIds.includes(p.id)) {
        return p instanceof Player ? p.unassignRole() : { ...p, currentRoleId: null, roleId: null, role: null };
      }
      return p;
    }));

    setRolesInGame(prev => {
      const rolesToAdd = isWolf && wolfRolesInDeck.length > 0 ? wolfRolesInDeck : [role];
      let updated = [...prev];
      rolesToAdd.forEach(r => {
        if (!updated.some(existing => existing.id === r.id)) {
          updated.push(r);
        }
      });
      return updated;
    });
  };

  const handleAutoAssignVillagers = () => {
    setPlayers(prev => prev.map(p => {
      const pCurrentId = p.currentRoleId || p.roleId;
      if (!pCurrentId) {
        return p instanceof Player ? p.assignRole('dan-lang') : {
          ...p,
          currentRoleId: 'dan-lang',
          roleId: 'dan-lang',
          role: null
        };
      }
      return p;
    }));
  };

  const handleSkipRole = (roleId) => {
    setNightState(prev => ({
      ...prev,
      skippedRoles: [...(prev.skippedRoles || []), roleId]
    }));
  };

  const handleToggleSheriff = (playerId) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, isSheriff: !p.isSheriff };
      }
      return { ...p, isSheriff: false };
    }));
  };

  const handleAdvanceToDay = () => {
    const game = new WerewolfGame({
      roundNumber,
      isNight,
      players,
      deckRoleIds,
      rolesInGameIds: rolesInGame.map(r => r.id),
      nightState,
      nightLogs,
      gameDiary,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult
    });

    const result = game.resolveNight(nightState);
    const { game: nextGame, deadSheriff, hunterTrigger, elderKilledByWitch, logs, gameEndResult: endResult } = result;

    setPlayers(nextGame.players);
    setNightLogs(logs);
    setIsNight(false);
    setActiveTab('day');
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    setNightState(nextGame.nightState);
    setWolfCanKillDouble(nextGame.wolfCanKillDouble);
    setIsVillageCursed(nextGame.isVillageCursed);

    // Ghi nhật ký Đêm vừa qua vào quyển nhật ký biên niên sử
    const nightEntry = {
      phase: `Đêm ${roundNumber}`,
      type: 'night',
      round: roundNumber,
      logs: [...logs]
    };
    setGameDiary(prev => appendToDiary(prev, nightEntry));

    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}

    // Lời Nguyền Già Làng
    if (elderKilledByWitch) {
      showAlert({
        title: 'LỜI NGUYỀN CỦA GIÀ LÀNG! ⚡',
        message: 'Phù Thủy đã dùng thuốc độc giết hại GIÀ LÀNG!\n\nNỗi oán hận biến thành lời nguyền: Toàn bộ phe Dân Làng bị tước đoạt toàn bộ chức năng đặc biệt từ nay về sau!',
        variant: 'destructive',
        confirmText: 'Chấp Nhận Lời Nguyền ⚡'
      });
    }

    // Cảnh Sát Trưởng tử trận trong đêm
    if (deadSheriff) {
      handleOpenSheriffModal(deadSheriff, false);
    }

    if (endResult) {
      setGameEndResult(endResult);
      return;
    }

    // Thợ Săn bắn trả
    if (hunterTrigger) {
      setActionModal({
        isOpen: true,
        actionType: 'hunter',
        role: hunterTrigger.getRole(),
        player: hunterTrigger
      });
    }
  };

  const handleLynchPlayer = (playerId) => {
    const game = new WerewolfGame({
      roundNumber,
      isNight,
      players,
      deckRoleIds,
      rolesInGameIds: rolesInGame.map(r => r.id),
      nightState,
      nightLogs,
      gameDiary,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult
    });

    const result = game.lynchPlayer(playerId);
    if (!result.success) return;

    const {
      game: nextGame,
      target,
      isIdiotWin,
      isAngelWin,
      elderCurseTriggered,
      wolfPupKilled,
      deadSheriff,
      loverPartnerDied,
      hunterTrigger,
      gameEndResult: endResult
    } = result;

    setPlayers(nextGame.players);
    setLynchedTodayPlayerId(playerId);

    if (isAngelWin && endResult) {
      setGameEndResult(endResult);
      return;
    }

    if (elderCurseTriggered) {
      setIsVillageCursed(true);
      showAlert({
        title: 'LỜI NGUYỀN CỦA GIÀ LÀNG! ⚡',
        message: `Dân làng đã xử tử nhầm GIÀ LÀNG ${target.name}!\n\nLời nguyền giáng xuống: Toàn bộ phe Dân Làng bị tước đoạt toàn bộ năng lực đặc biệt (Bảo Vệ, Tiên Tri, Phù Thủy mất bình phép)!`,
        variant: 'destructive',
        confirmText: 'Chấp Nhận Lời Nguyền ⚡'
      });
    }

    if (wolfPupKilled) {
      setWolfCanKillDouble(true);
      showAlert({
        title: 'SÓI CON BỊ TREO CỔ! 🐺',
        message: `Sói Con (${target.name}) đã bị dân làng xử tử!\n\nBầy Ma Sói nổi cơn cuồng nộ: Đêm tiếp theo bầy Sói được quyền cắn 2 người chơi!`,
        variant: 'warning',
        confirmText: 'Ghi Nhận Cuồng Nộ 🔥'
      });
    }

    if (deadSheriff) {
      handleOpenSheriffModal(deadSheriff, false);
    }

    if (isIdiotWin && endResult) {
      setGameEndResult(endResult);
      const dayEndEntry = {
        phase: `Ngày ${roundNumber}`,
        type: 'day',
        round: roundNumber,
        logs: [
          `Dân làng đã biểu quyết treo cổ ${target.name} (#${target.id}) - Thằng Ngố!`,
          `Thằng Ngố đã đạt mục tiêu bị treo cổ và MỘT MÌNH GIÀNH CHIẾN THẮNG TRẬN ĐẤU! 🃏🎉`
        ]
      };
      const fullTimeline = appendToDiary(gameDiary, dayEndEntry);
      setGameDiary(fullTimeline);
      return;
    }

    if (loverPartnerDied) {
      showAlert({
        title: 'TÌNH YÊU BI KỊCH 💔',
        message: `${loverPartnerDied.name} đau đớn gục ngã chết theo người tình ${target.name}!\n\nSố phận của họ đã gắn kết với nhau từ khi Cupid ban phát mũi tên tình yêu.`,
        variant: 'tragedy',
        confirmText: 'Ghi Nhận Chết Theo 🥀'
      });
    }

    if (result.transformedShadows && result.transformedShadows.length > 0) {
      result.transformedShadows.forEach(({ shadow, host, inheritRoleId }) => {
        const newRole = getRole(inheritRoleId);
        triggerHaptic('confirm');
        showAlert({
          title: '👻 ẢNH TỬ KẾ THỪA LINH HỒN!',
          message: `Chủ thể của Ảnh Tử (${host.name} #${host.id}) đã qua đời!\n\nẢnh Tử (${shadow.name} #${shadow.id}) lập tức hấp thu linh hồn và chính thức trở thành: ${newRole?.name || inheritRoleId}!`,
          variant: 'purple'
        });
      });
    }

    if (endResult) {
      setGameEndResult(endResult);
      return;
    }

    if (hunterTrigger) {
      setActionModal({
        isOpen: true,
        actionType: 'hunter',
        role: hunterTrigger.getRole(),
        player: hunterTrigger
      });
    }
  };

  // Kị Sĩ Thách Đấu Quyết Đấu Ban Ngày (Kị Sĩ lật bài 1 lần duy nhất)
  const handleKnightDuel = (knightId, targetId) => {
    const game = new WerewolfGame({
      roundNumber,
      isNight,
      players,
      deckRoleIds,
      rolesInGameIds: rolesInGame.map(r => r.id),
      nightState,
      nightLogs,
      gameDiary,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult
    });

    const result = game.knightDuel(knightId, targetId);
    if (!result.success) return;

    const { game: nextGame, knight, target, isWolf, deadSheriff, transformedShadows, logs, gameEndResult: endResult } = result;

    if (isWolf) {
      setLynchedTodayPlayerId(targetId);
      triggerHaptic('danger');
      showAlert({
        title: '⚔️ KỊ SĨ CHÉM CHẾT MA SÓI!',
        message: `Kị Sĩ ${knight.name} dũng cảm lật bài thách đấu ${target.name}!\n\nKết quả: ${target.name} ĐÚNG LÀ MA SÓI (${target.getRole()?.name || 'Ma Sói'}) và đã bị Kị Sĩ chém gục tại chỗ!\n\nLàng hoàn thành công lý hôm nay, không cần biểu quyết treo cổ nữa!`,
        variant: 'blood'
      });
    } else {
      triggerHaptic('danger');
      showAlert({
        title: '💀 KỊ SĨ PHÁN ĐOÁN SAI LẦM & TỬ TRẬN!',
        message: `Kị Sĩ ${knight.name} lật bài thách đấu ${target.name}!\n\nKết quả: ${target.name} KHÔNG PHẢI MA SÓI (${target.getRole()?.name || 'Dân Làng'})!\n\nKị Sĩ ${knight.name} ngã gục tử trận vì nông nổi! Làng tiếp tục tiến hành tranh luận và biểu quyết treo cổ như thường lệ.`,
        variant: 'destructive'
      });
    }

    // Thông báo nếu có Ảnh Tử kế thừa linh hồn
    if (transformedShadows && transformedShadows.length > 0) {
      transformedShadows.forEach(({ shadow, host, inheritRoleId }) => {
        const newRole = getRole(inheritRoleId);
        triggerHaptic('confirm');
        showAlert({
          title: '👻 ẢNH TỬ KẾ THỪA LINH HỒN!',
          message: `Chủ thể của Ảnh Tử (${host.name} #${host.id}) đã qua đời!\n\nẢnh Tử (${shadow.name} #${shadow.id}) lập tức hấp thu linh hồn và chính thức trở thành: ${newRole?.name || inheritRoleId}!`,
          variant: 'purple'
        });
      });
    }

    setPlayers(nextGame.players);
    setNightLogs(prev => [...prev, ...logs]);
    if (deadSheriff) {
      handleOpenSheriffModal(deadSheriff, false);
    }
    if (endResult) {
      setGameEndResult(endResult);
    }
  };

  const handleUndoLynch = (playerId) => {
    const game = new WerewolfGame({
      roundNumber,
      isNight,
      players,
      deckRoleIds,
      rolesInGameIds: rolesInGame.map(r => r.id),
      nightState,
      nightLogs,
      gameDiary,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult
    });
    const nextGame = game.undoLynch(playerId);
    setPlayers(nextGame.players);
    setLynchedTodayPlayerId(null);
    setGameEndResult(nextGame.gameEndResult);
  };

  const handleAdvanceToNight = () => {
    // Chặn nếu Cảnh Sát Trưởng đã hy sinh mà chưa chỉ định người kế nhiệm
    const sheriff = players.find(p => p.isSheriff);
    const sheriffDead = sheriff && !sheriff.isAlive;
    if (sheriffDead) {
      triggerHaptic('error');
      handleOpenSheriffModal(sheriff, true);
      return;
    }

    // Ghi nhận nhật ký Ban Ngày vừa qua vào quyển nhật ký
    const lynchedP = players.find(p => p.id === lynchedTodayPlayerId);
    const dayEvents = [];
    if (sheriff) {
      dayEvents.push(`Cảnh Sát Trưởng: ${sheriff.name} (#${sheriff.id})`);
    }
    if (lynchedP) {
      dayEvents.push(`Dân làng biểu quyết treo cổ ${lynchedP.name} (#${lynchedP.id}) - Vai: ${getPlayerRole(lynchedP)?.name || 'Chưa lộ vai'}.`);
    } else {
      dayEvents.push('Ban ngày trôi qua trong tranh luận. Không có ai bị xử tử.');
    }

    const dayEntry = {
      phase: `Ngày ${roundNumber}`,
      type: 'day',
      round: roundNumber,
      logs: dayEvents
    };
    setGameDiary(prev => appendToDiary(prev, dayEntry));

    setRoundNumber(r => r + 1);
    setIsNight(true);
    setActiveTab('night');
    setLynchedTodayPlayerId(null);
    setCurrentNightStepIdx(0);
    try {
      localStorage.removeItem('werewolf_current_night_step');
    } catch (e) {}

    // Nếu đêm trước đã kích hoạt quyền cắn 2 người thì tắt cờ cuồng sát cho đêm tiếp sau
    if (wolfCanKillDouble) {
      setWolfCanKillDouble(false);
    }

    setNightState(prev => ({
      protectedPlayerId: null,
      lastNightProtectedId: prev.protectedPlayerId,
      wolfTargetId: null,
      wolfTargetId2: null,
      wolfSkipped: false,
      isCursedInfect: false,
      cursedUsed: prev.cursedUsed || false,
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
  const aliveWolves = alivePlayers.filter(isWolfPlayer).length;
  const initialWolvesInDeck = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const allCurrentWolves = players.filter(isWolfPlayer).length;
  const totalWolvesInGame = Math.max(initialWolvesInDeck, allCurrentWolves);
  const aliveVillagers = alivePlayers.filter(p => !isWolfPlayer(p) && getPlayerRole(p)?.teamCode !== '3').length;

  const isDayTime = activeTab === 'day' || (!isNight && activeTab === 'table');

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07080d] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-white relative">
      {/* Dynamic Day/Night Gothic Background Artwork */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none"
      >
        {/* Day Background - Hình 2 (Mặt trời vàng xoắn ốc) */}
        <div
          className={`absolute inset-0 bg-center bg-no-repeat bg-contain sm:bg-cover transition-opacity duration-1000 ease-in-out ${
            isDayTime ? 'opacity-45 sm:opacity-55' : 'opacity-0'
          }`}
          style={{
            backgroundImage: "url('/bg-day-sun.jpg')"
          }}
        />

        {/* Night Background - Hình 3 (Mặt trăng bạc xoắn ốc) */}
        <div
          className={`absolute inset-0 bg-center bg-no-repeat bg-contain sm:bg-cover transition-opacity duration-1000 ease-in-out ${
            !isDayTime ? 'opacity-40 sm:opacity-50' : 'opacity-0'
          }`}
          style={{
            backgroundImage: "url('/bg-night-moon.jpg')"
          }}
        />

        {/* Subtle Dark Vignette Gradients for High Readability & Artwork Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080d]/50 via-transparent to-[#07080d]/65 pointer-events-none" />
      </div>

      {/* Top Navigation Bar - Consistent Gothic Dark & Mobile One-Screen */}
      <header className="sticky top-0 z-40 bg-[#0c0d16]/90 backdrop-blur-md border-b border-purple-950/80 px-2 sm:px-4 py-1.5 sm:py-2 ios-safe-top shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand & Mini Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-800 to-rose-900 border border-purple-600/60 flex items-center justify-center font-cinzel font-black text-white text-base shadow-[0_0_12px_rgba(147,51,234,0.4)] shrink-0">
              <WolfIcon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <h1 className="font-cinzel font-black text-xs sm:text-sm md:text-base tracking-wider text-slate-100 leading-tight whitespace-nowrap">
                  QUẢN TRÒ MA SÓI
                </h1>
                {neonStatus.ok && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Đã kết nối Neon DB"></span>
                )}
              </div>
              <div className="text-[10px] text-purple-300/70 font-medium hidden sm:block">
                {players.length} người chơi • Kịch bản đêm lần lượt
              </div>
            </div>
          </div>

          {/* Quick Actions & Modals Triggers */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* RESET GAME BUTTON */}
            <button
              type="button"
              onClick={handleResetGame}
              title="Reset toàn bộ ván chơi về 0 để chơi lại từ đầu"
              className="h-7 px-2 sm:h-8 sm:px-2.5 rounded-lg sm:rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/80 hover:border-rose-400 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0 text-rose-300" />
              <span className="hidden sm:inline">Reset Về 0</span>
            </button>

            {/* Unified Setup Group: Thiết Lập Ván Chơi (Tích hợp Người Chơi + Bộ Bài) */}
            <div className="flex items-center gap-0.5 bg-[#101220]/80 p-0.5 rounded-lg sm:rounded-xl border border-purple-950/80">
              <button
                type="button"
                onClick={() => {
                  setSetupModalTab('setup');
                  setIsSetupOpen(true);
                }}
                title="Thiết lập phòng chơi: Tùy chỉnh danh sách người chơi & bộ bài đồng bộ"
                className="h-6 sm:h-7 px-2 sm:px-2.5 rounded-md sm:rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-600/70 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span>Thiết Lập Ván</span>
              </button>

              {/* Quick shortcut to Rosters */}
              <button
                type="button"
                onClick={() => {
                  setSetupModalTab('rosters');
                  setIsSetupOpen(true);
                }}
                title="Quản lý danh sách nhóm người chơi"
                className="h-6 w-6.5 sm:h-7 sm:w-auto sm:px-1.5 rounded-md sm:rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-200 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Quick shortcut to Templates */}
              <button
                type="button"
                onClick={() => {
                  setSetupModalTab('templates');
                  setIsSetupOpen(true);
                }}
                title="Quản lý bộ bài mẫu"
                className="h-6 w-6.5 sm:h-7 sm:w-auto sm:px-1.5 rounded-md sm:rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-200 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            {/* Tools Group: Cài Đặt, Lịch Sử, Thư Viện */}
            <div className="flex items-center gap-0.5 bg-[#101220]/80 p-0.5 rounded-lg sm:rounded-xl border border-slate-800">
              {/* Cài Đặt Luật Chơi */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Cài đặt luật chơi (Bật/tắt Sói cắn đồng loại, lưu state game...)"
                className="h-6 w-6.5 sm:h-7 sm:w-auto sm:px-2 rounded-md sm:rounded-lg hover:bg-slate-800 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span className="hidden md:inline">Cài Đặt</span>
              </button>

              {/* Lịch Sử */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                title="Xem lịch sử các trận đấu đã lưu trên Neon DB"
                className="h-6 w-6.5 sm:h-7 sm:w-auto sm:px-2 rounded-md sm:rounded-lg hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden md:inline">Lịch Sử</span>
              </button>

              {/* Thư viện */}
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                title="Thư viện hướng dẫn 48 vai trò Ma Sói"
                className="h-6 w-6.5 sm:h-7 sm:w-auto sm:px-2 rounded-md sm:rounded-lg hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden md:inline">Thư Viện</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Unified Segmented Tabs & Live Game Stats (STRICTLY ONE ROW, NO WRAP) */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2 mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-purple-950/50">
          {/* Left: Tab Switcher (Unified 28px/32px height) */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#0a0c16] p-0.5 rounded-lg sm:rounded-xl border border-purple-950/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(isNight ? 'night' : 'day')}
              className={`h-7 sm:h-8 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'night' || activeTab === 'day'
                  ? 'bg-gradient-to-r from-purple-900 to-[#2c084d] border-purple-500 text-white shadow-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {isNight ? <Moon className="w-3.5 h-3.5 fill-purple-400 text-purple-400 shrink-0" /> : <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
              <span>
                <span className="sm:hidden">{isNight ? `Đêm ${roundNumber}` : `Ngày ${roundNumber}`}</span>
                <span className="hidden sm:inline">{isNight ? `Kịch Bản Đêm ${roundNumber}` : `Ban Ngày ${roundNumber}`}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`h-7 sm:h-8 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-gradient-to-r from-purple-900 to-[#2c084d] border-purple-500 text-white shadow-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>
                <span className="sm:hidden">Sơ Đồ</span>
                <span className="hidden sm:inline">Sơ Đồ Bàn</span>
              </span>
            </button>
          </div>

          {/* Right: Unified Live Game Stats (Matching height, strictly one line) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Werewolf count out of total alive */}
            <div 
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#240609] to-[#160204] border border-rose-600/80 text-rose-200 text-xs font-black flex items-center gap-1 shadow-[0_0_10px_rgba(225,29,72,0.3)] shrink-0"
              title={`Số Ma Sói còn sống: ${aliveWolves} / ${totalWolvesInGame} Sói`}
            >
              <WolfIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{aliveWolves}/{totalWolvesInGame}</span>
              <span className="hidden sm:inline text-rose-300 font-semibold ml-0.5">Sói</span>
            </div>

            {/* Villagers alive */}
            <div 
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-[#09152a] border border-blue-700/80 text-blue-200 text-xs font-bold flex items-center gap-1 shrink-0"
              title="Số Dân Làng còn sống"
            >
              <span>👨‍🌾 {aliveVillagers}</span>
              <span className="hidden sm:inline text-blue-300 ml-0.5">Dân</span>
            </div>

            {/* Dead Players (Clickable to view who are they and when) */}
            <button
              type="button"
              onClick={() => setIsCemeteryOpen(true)}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-[#1b0826] hover:bg-[#280c38] border border-purple-700/80 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
              title="Bấm để xem danh sách ai đã chết, chết vì sao và khi nào"
            >
              <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{players.length - alivePlayers.length}</span>
              <span className="hidden sm:inline ml-0.5">Chết</span>
              <span className="text-[10px] text-purple-400">➔</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 pb-24 sm:pb-28 ios-safe-bottom">
        {activeTab === 'night' && (
          <NightPhaseView
            roundNumber={roundNumber}
            rolesInGame={rolesInGame}
            players={players}
            deckRoleIds={deckRoleIds}
            nightState={nightState}
            isVillageCursed={isVillageCursed}
            wolfCanKillDouble={wolfCanKillDouble}
            canWolvesKillTeammates={canWolvesKillTeammates}
            currentStepIdx={currentNightStepIdx}
            onStepChange={(newIdx) => {
              setCurrentNightStepIdx(newIdx);
              try {
                localStorage.setItem('werewolf_current_night_step', String(newIdx));
              } catch (e) {}
            }}
            onSaveAction={handleSaveAction}
            onAssignRole={handleAssignRole}
            onAssignRoleToMultiple={handleAssignRoleToMultiple}
            onAutoAssignVillagers={handleAutoAssignVillagers}
            onSkipRole={handleSkipRole}
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
            onToggleSheriff={handleToggleSheriff}
            onKnightDuel={handleKnightDuel}
            nightState={nightState}
            lynchedTodayPlayerId={lynchedTodayPlayerId}
            onOpenSheriffModal={handleOpenSheriffModal}
          />
        )}

        {activeTab === 'table' && (
          <PlayersGridView
            players={players}
            onOpenRosters={() => {
              setSetupModalTab('rosters');
              setIsSetupOpen(true);
            }}
            onOpenAssignRole={(p) => {
              setActionModal({
                isOpen: true,
                actionType: 'assign_role',
                role: getPlayerRole(p),
                player: p
              });
            }}
          />
        )}
      </main>

      {/* 1-Step Sheriff Succession Modal */}
      <SheriffSuccessionModal
        isOpen={sheriffModalState.isOpen}
        onClose={handleCloseSheriffModal}
        deadSheriff={sheriffModalState.deadSheriff}
        alivePlayers={players.filter(p => p.isAlive)}
        onSelectSuccessor={handleSelectSheriffSuccessor}
        isMandatory={sheriffModalState.isMandatory}
      />

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

      {/* Unified Game Setup Modal (Tích hợp Người chơi + Bộ bài) */}
      <UnifiedGameSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        initialTab={setupModalTab}
        currentPlayers={players}
        currentDeckRoleIds={deckRoleIds}
        onApplyGameSetup={handleApplyGameSetup}
        onApplyTemplate={handleApplyTemplate}
        onApplyRoster={handleApplyRoster}
      />

      {/* Deck Template Manager Modal */}
      <DeckTemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        currentDeckRoleIds={deckRoleIds}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Player Roster Manager Modal */}
      <PlayerRosterModal
        isOpen={isRostersOpen}
        onClose={() => setIsRostersOpen(false)}
        currentPlayers={players}
        deckSize={deckRoleIds.length}
        onApplyRoster={handleApplyRoster}
      />

      {/* Game Over Banner */}
      <GameOverModal
        gameEndResult={gameEndResult}
        onRestartGame={handleResetGame}
      />

      {/* Match History Modal */}
      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Cemetery Modal: Who are they and when */}
      <CemeteryModal
        isOpen={isCemeteryOpen}
        onClose={() => setIsCemeteryOpen(false)}
        players={players}
        roundNumber={roundNumber}
      />

      {/* Role Library Modal */}
      <RoleLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      {/* Game Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        canWolvesKillTeammates={canWolvesKillTeammates}
        onToggleWolvesKillTeammates={handleToggleWolvesKillTeammates}
      />
    </div>
  );
}
