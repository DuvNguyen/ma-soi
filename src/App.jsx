import React, { useState, useEffect } from 'react';
import { ROLES, PRESETS } from './data/roles';
import { getRoleCapacity } from './utils/deckUtils';
import { getRole, getPlayerRole, getPlayerOriginalRole, isWolfPlayer, WOLF_ROLE_IDS } from './utils/roleUtils';
import { DEFAULT_PLAYER_NAMES, getDefaultPlayerNames } from './data/defaultPlayers';
import { useGothicDialog } from './context/GothicDialogContext';
import { checkGameEnd, resolveNightPhase } from './utils/gameLogic';
import { checkNeonConnection, syncGameStateApi, loadGameStateApi, saveMatchRecordApi } from './services/api';
import NightPhaseView from './components/NightPhaseView';
import DayPhaseView from './components/DayPhaseView';
import PlayersGridView from './components/PlayersGridView';
import ActionModal from './components/ActionModal';
import SetupGameModal from './components/SetupGameModal';
import GameOverModal from './components/GameOverModal';
import RoleLibraryModal from './components/RoleLibraryModal';
import DeckTemplateModal from './components/DeckTemplateModal';
import PlayerRosterModal from './components/PlayerRosterModal';
import MatchHistoryModal from './components/MatchHistoryModal';
import CemeteryModal from './components/CemeteryModal';
import GameGuideModal from './components/GameGuideModal';
import GothicButton from './components/ui/GothicButton';
import GothicBadge from './components/ui/GothicBadge';
import WolfIcon from './components/ui/WolfIcon';
import { Moon, Sun, Users, BookOpen, RotateCcw, Shield, Eye, Skull, Sparkles, Trophy, Layers, Database, CheckCircle2, RefreshCw, History, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'werewolf_active_game_state';

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
    if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved game from localStorage:', err);
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
      return savedInitial.players;
    }
    return Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      name: DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`,
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
    }));
  });

  const [nightLogs, setNightLogs] = useState(() => savedInitial?.nightLogs || []);
  const [gameEndResult, setGameEndResult] = useState(() => savedInitial?.gameEndResult || null);
  const [lynchedTodayPlayerId, setLynchedTodayPlayerId] = useState(() => savedInitial?.lynchedTodayPlayerId ?? null);
  const [isVillageCursed, setIsVillageCursed] = useState(() => savedInitial?.isVillageCursed || false);
  const [wolfCanKillDouble, setWolfCanKillDouble] = useState(() => savedInitial?.wolfCanKillDouble || false);

  // Night action state
  const [nightState, setNightState] = useState(() => {
    return savedInitial?.nightState || {
      protectedPlayerId: null,
      lastNightProtectedId: null,
      wolfTargetId: null,
      wolfTargetId2: null,
      wolfSkipped: false,
      isCursedInfect: false,
      cursedUsed: false,
      witchSaved: false,
      witchPoisonTargetId: null,
      witchHasHeal: true,
      witchHasPoison: true,
      seerCheckedId: null,
      cupidChosenIds: null,
      skippedRoles: []
    };
  });

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCemeteryOpen, setIsCemeteryOpen] = useState(false);
  const [isRostersOpen, setIsRostersOpen] = useState(false);
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
        roundNumber,
        isNight,
        activeTab,
        players,
        deckRoleIds,
        rolesInGameIds: rolesInGame.map(r => r.id),
        nightState,
        nightLogs,
        lynchedTodayPlayerId,
        gameEndResult,
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
  }, [roundNumber, isNight, activeTab, players, deckRoleIds, rolesInGame, nightState, lynchedTodayPlayerId, gameEndResult]);

  const initDefaultGame = () => {
    const defaultRoleIds = [
      "soi-thuong", "soi-thuong", "nua-nguoi-nua-soi", 
      "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc",
      "dan-lang", "dan-lang", "dan-lang", "dan-lang"
    ];
    setDeckRoleIds(defaultRoleIds);
    
    // MẶC ĐỊNH BẮT ĐẦU: 14 NGƯỜI CHƠI VỚI TÊN THỰC TẾ, ROLE = NULL (CHƯA CÓ ROLE NGAY TỪ ĐẦU)
    // QUẢN TRÒ BẮT ĐẦU GỌI TỪNG VAI TRONG ĐÊM 1 ĐỂ GÁN DẦN TỪNG NGƯỜI
    const initialPlayers = Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      name: DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`,
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
      cupidChosenIds: null,
      skippedRoles: []
    });
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
        setPlayers(prev => prev.map((p) => ({
          ...p,
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
          isCursedWolf: false
        })));

        setRoundNumber(1);
        setIsNight(true);
        setActiveTab('night');
        setNightLogs([]);
        setGameEndResult(null);
        setLynchedTodayPlayerId(null);
        setIsVillageCursed(false);
        setWolfCanKillDouble(false);
        setNightState({
          protectedPlayerId: null,
          lastNightProtectedId: null,
          wolfTargetId: null,
          wolfTargetId2: null,
          wolfSkipped: false,
          isCursedInfect: false,
          cursedUsed: false,
          witchSaved: false,
          witchPoisonTargetId: null,
          witchHasHeal: true,
          witchHasPoison: true,
          seerCheckedId: null,
          cupidChosenIds: null,
          skippedRoles: []
        });

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

    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: (playerNames && playerNames[i]) || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`,
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
    }));

    setPlayers(newPlayers);
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
      cupidChosenIds: null,
      skippedRoles: []
    });
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
      return {
        id: i + 1,
        name: tplName || existingName || DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`,
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
    });

    setPlayers(newPlayers);
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
      cupidChosenIds: null,
      skippedRoles: []
    });
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
        return {
          id: i + 1,
          name: names[i] || `Người chơi ${i + 1}`,
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

  const evaluateGameEnd = (currentPlayers) => {
    const result = checkGameEnd(currentPlayers);
    if (result.isEnded) {
      setGameEndResult(result);
      // Auto save match record to Neon Database
      const matchData = {
        roundNumber,
        winnerTeam: result.winner,
        winnerDesc: result.reason,
        playerCount: players.length,
        aliveCount: currentPlayers.filter(p => p.isAlive).length,
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
        nightLogs: nightLogs
      };
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

        setPlayers(current => current.map(p => {
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
        }));
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
      } else if (type === 'piper') {
        next.piperChosenIds = payload;
      } else if (type === 'raven') {
        next.ravenTargetId = payload;
        next.ravenSkipped = !!extra.ravenSkipped;
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
    const capacity = getRoleCapacity(role.id, deckRoleIds);

    setPlayers(prev => {
      const targetPlayer = prev.find(p => p.id === playerId);
      const targetCurrentId = targetPlayer?.currentRoleId || targetPlayer?.roleId;
      // Toggle unassign if clicking current holder
      if (targetCurrentId === role.id) {
        return prev.map(p => p.id === playerId ? { ...p, currentRoleId: null, roleId: null, role: null } : p);
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
            return {
              ...p,
              currentRoleId: role.id,
              roleId: role.id,
              role: null,
              elderLives: role.id === 'gia-lang' ? 2 : p.elderLives
            };
          }
          const pCurrentId = p.currentRoleId || p.roleId;
          if (pCurrentId === role.id) {
            return {
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
            return { ...p, currentRoleId: role.id, roleId: role.id, role: null };
          }
          if (p.id === oldestHolder.id) {
            return { ...p, currentRoleId: null, roleId: null, role: null };
          }
          return p;
        });
      }

      return prev.map(p => {
        if (p.id === playerId) {
          return {
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

    setPlayers(prev => prev.map(p => {
      const targetIdx = allowedIds.indexOf(p.id);
      if (targetIdx !== -1) {
        const assignedRole = (isWolf && wolfRolesInDeck[targetIdx]) ? wolfRolesInDeck[targetIdx] : role;
        return {
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
        return { ...p, currentRoleId: null, roleId: null, role: null };
      }
      if (!isWolf && pCurrentId === role.id && !allowedIds.includes(p.id)) {
        return { ...p, currentRoleId: null, roleId: null, role: null };
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
        return {
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
    const { 
      updatedPlayers, 
      killedPlayerIds, 
      poisonedPlayerIds = [], 
      refundWitchHeal, 
      elderKilledByWitch, 
      logs 
    } = resolveNightPhase(
      players,
      nightState,
      roundNumber
    );

    setPlayers(updatedPlayers);
    setNightLogs(logs);
    setIsNight(false);
    setActiveTab('day');
    setLynchedTodayPlayerId(null);

    // RULE CONFLICT FIX #3: Hoàn trả bình cứu cho Phù Thủy nếu Bảo Vệ đã đỡ đòn thành công
    if (refundWitchHeal) {
      setNightState(prev => ({
        ...prev,
        witchHasHeal: true
      }));
    }

    // RULE CONFLICT FIX #2: Nếu Già Làng bị Phù Thủy đầu độc chết trong đêm
    if (elderKilledByWitch) {
      setIsVillageCursed(true);
      showAlert({
        title: 'LỜI NGUYỀN CỦA GIÀ LÀNG! ⚡',
        message: 'Phù Thủy đã dùng thuốc độc giết hại GIÀ LÀNG!\n\nNỗi oán hận biến thành lời nguyền: Toàn bộ phe Dân Làng bị tước đoạt toàn bộ chức năng đặc biệt từ nay về sau!',
        variant: 'destructive',
        confirmText: 'Chấp Nhận Lời Nguyền ⚡'
      });
    }

    // RULE CONFLICT FIX #4: Nếu Sói Con chết trong đêm, kích hoạt cắn 2 người cho đêm kế tiếp
    const killedWolfPup = updatedPlayers.find(p => killedPlayerIds.includes(p.id) && getPlayerRole(p)?.id === 'soi-con');
    if (killedWolfPup) {
      setWolfCanKillDouble(true);
      logs.push(`🐺 SÓI CON (${killedWolfPup.name}) ĐÃ CHẾT! Bầy Ma Sói nổi cơn cuồng sát: Đêm tiếp theo bầy Sói được cắn 2 người!`);
      setNightLogs([...logs]);
    }

    // RULE CONFLICT FIX #8: Nếu Cảnh Sát Trưởng tử trận trong đêm
    const deadSheriff = updatedPlayers.find(p => killedPlayerIds.includes(p.id) && p.isSheriff);
    if (deadSheriff) {
      showAlert({
        title: 'CẢNH SÁT TRƯỞNG ĐÃ QUA ĐỜI! ⭐',
        message: `${deadSheriff.name} (Cảnh Sát Trưởng) đã hy sinh trong đêm qua!\n\nTrước khi nhắm mắt, Cảnh Sát Trưởng hãy chỉ định 1 người chơi còn sống bất kỳ làm Cảnh Sát Trưởng kế nhiệm qua Sơ Đồ Bàn.`,
        variant: 'warning',
        confirmText: 'Đã Hiểu & Chuyển Giao Sao ⭐'
      });
    }

    // If Cursed Wolf infected someone this night, mark cursedUsed = true
    if (nightState.isCursedInfect) {
      setNightState(prev => ({
        ...prev,
        cursedUsed: true,
        isCursedInfect: false
      }));
    }

    const end = evaluateGameEnd(updatedPlayers);

    // RULE CONFLICT FIX #1: Thợ Săn chết do Thuốc Độc Phù Thủy hoặc chết theo người yêu KHÔNG ĐƯỢC BẮN
    if (!end.isEnded) {
      const deadHunter = updatedPlayers.find(p => killedPlayerIds.includes(p.id) && getPlayerRole(p)?.id === 'tho-san');
      if (deadHunter) {
        const isPoisoned = poisonedPlayerIds.includes(deadHunter.id);
        const isLoverSuicide = deadHunter.deathReason?.includes('đau buồn');
        if (isPoisoned) {
          logs.push(`☠️ Thợ Săn ${deadHunter.name} bị Phù Thủy đầu độc trong lúc ngủ nên bị tê liệt, không thể rút súng bắn!`);
          setNightLogs([...logs]);
        } else if (isLoverSuicide) {
          logs.push(`🥀 Thợ Săn ${deadHunter.name} quẫn trí chết theo người tình, không thể nổ súng!`);
          setNightLogs([...logs]);
        } else {
          setActionModal({
            isOpen: true,
            actionType: 'hunter',
            role: getPlayerRole(deadHunter),
            player: deadHunter
          });
        }
      }
    }
  };

  const handleLynchPlayer = (playerId) => {
    const target = players.find(p => p.id === playerId);
    if (!target) return;
    const targetRole = getPlayerRole(target);

    // RULE CONFLICT FIX #7: Thiên Sứ (Angel) bị treo cổ Ngày 1 thắng ngay lập tức
    if (targetRole?.id === 'thien-su' && roundNumber === 1) {
      const updated = players.map(p => p.id === playerId ? {
        ...p,
        isAlive: false,
        deathReason: 'Được dân làng biểu quyết đưa lên giàn treo cổ Ngày 1 đúng như tâm nguyện',
        deathPhase: `Ngày ${roundNumber}`
      } : p);
      setPlayers(updated);
      setLynchedTodayPlayerId(playerId);
      setGameEndResult({
        isEnded: true,
        winner: 'Angel',
        winnerTitle: 'Thiên Sứ Chiến Thắng! 🪽',
        teamCode: '3',
        description: `${target.name} (Thiên Sứ) đã bị dân làng treo cổ vào ngày đầu tiên đúng như tâm nguyện, đắc đạo thăng thiên và giành chiến thắng trò chơi!`
      });
      return;
    }

    // RULE CONFLICT FIX #2: Già Làng (Elder) bị Dân Làng treo cổ -> Lời Nguyền Già Làng giáng xuống
    if (targetRole?.id === 'gia-lang') {
      setIsVillageCursed(true);
      showAlert({
        title: 'LỜI NGUYỀN CỦA GIÀ LÀNG! ⚡',
        message: `Dân làng đã xử tử nhầm GIÀ LÀNG ${target.name}!\n\nLời nguyền giáng xuống: Toàn bộ phe Dân Làng bị tước đoạt toàn bộ năng lực đặc biệt (Bảo Vệ, Tiên Tri, Phù Thủy mất bình phép)!`,
        variant: 'destructive',
        confirmText: 'Chấp Nhận Lời Nguyền ⚡'
      });
    }

    // RULE CONFLICT FIX #4: Sói Con (Wolf Pup) bị treo cổ -> Đêm tới bầy Sói cắn 2 người
    if (targetRole?.id === 'soi-con') {
      setWolfCanKillDouble(true);
      showAlert({
        title: 'SÓI CON BỊ TREO CỔ! 🐺',
        message: `Sói Con (${target.name}) đã bị dân làng xử tử!\n\nBầy Ma Sói nổi cơn cuồng nộ: Đêm tiếp theo bầy Sói được quyền cắn 2 người chơi!`,
        variant: 'warning',
        confirmText: 'Ghi Nhận Cuồng Nộ 🔥'
      });
    }

    // RULE CONFLICT FIX #8: Cảnh Sát Trưởng bị treo cổ
    if (target.isSheriff) {
      showAlert({
        title: 'CẢNH SÁT TRƯỞNG BỊ XỬ TỬ! ⭐',
        message: `${target.name} (Cảnh Sát Trưởng) đã qua đời!\n\nTrước khi trút hơi thở cuối cùng, Cảnh Sát Trưởng hãy chỉ định 1 người chơi còn sống bất kỳ để di chúc trao lại huy hiệu.`,
        variant: 'warning',
        confirmText: 'Chỉ Định Kế Nhiệm ⭐'
      });
    }

    if (targetRole?.id === 'thang-ngoc' && !target.isRevealedIdiot) {
      showAlert({
        title: 'THẰNG NGỐC ĐÃ LẬT BÀI!',
        message: `${target.name} là THẰNG NGỐC!\n\nNgười này được cả làng tha thứ và không bị treo cổ. Tuy nhiên sẽ mất hoàn toàn quyền biểu quyết từ nay về sau!`,
        variant: 'warning',
        confirmText: 'Cả Làng Tha Thứ ✓'
      });
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
        showAlert({
          title: 'TÌNH YÊU BI KỊCH 💔',
          message: `${partner.name} đau đớn gục ngã chết theo người tình ${target.name}!\n\nSố phận của họ đã gắn kết với nhau từ khi Cupid ban phát mũi tên tình yêu.`,
          variant: 'tragedy',
          confirmText: 'Ghi Nhận Chết Theo 🥀'
        });
      }
    }

    setPlayers(updated);
    setLynchedTodayPlayerId(playerId);
    const end = evaluateGameEnd(updated);

    if (!end.isEnded && targetRole?.id === 'tho-san') {
      setActionModal({
        isOpen: true,
        actionType: 'hunter',
        role: targetRole,
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
  const totalWolvesInDeck = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const aliveVillagers = alivePlayers.filter(p => !isWolfPlayer(p) && getPlayerRole(p)?.teamCode !== '3').length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07080d] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-white">
      {/* Top Navigation Bar - Consistent Gothic Dark & Mobile One-Screen */}
      <header className="sticky top-0 z-40 bg-[#0c0d16]/95 backdrop-blur-md border-b border-purple-950/80 px-2 sm:px-4 py-1.5 sm:py-2 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
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

          {/* Quick Actions & Modals Triggers - EXACTLY ONE LINE ON ALL SCREENS */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Hướng Dẫn Sử Dụng (Dấu chấm hỏi hình tròn nhỏ) */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              title="Cẩm nang hướng dẫn sử dụng & quy trình Quản trò"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 hover:border-amber-400 text-amber-200 text-xs font-black transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
            </button>

            {/* RESET GAME BUTTON */}
            <button
              type="button"
              onClick={handleResetGame}
              title="Reset toàn bộ ván chơi về 0 để chơi lại từ đầu"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/80 hover:border-rose-400 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-300" />
              <span className="hidden sm:inline">Reset Về 0</span>
            </button>

            {/* Bộ Bài */}
            <button
              type="button"
              onClick={() => setIsTemplatesOpen(true)}
              title="Chọn hoặc tạo template bộ bài"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-purple-300" />
              <span className="hidden sm:inline">Bộ Bài</span>
            </button>

            {/* Tên Người Chơi */}
            <button
              type="button"
              onClick={() => setIsRostersOpen(true)}
              title="Danh sách người chơi đã lưu"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-purple-300" />
              <span className="hidden sm:inline">Tên</span>
            </button>

            {/* Lịch Sử */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              title="Xem lịch sử các trận đấu đã lưu trên Neon DB"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-[#141628] hover:bg-[#1e2038] border border-slate-800 hover:border-purple-600 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-300" />
              <span className="hidden md:inline">Lịch Sử</span>
            </button>

            {/* Thư viện */}
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              title="Thư viện hướng dẫn 48 vai trò Ma Sói"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-[#141628] hover:bg-[#1e2038] border border-slate-800 hover:border-purple-600 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-300" />
              <span className="hidden md:inline">Thư Viện</span>
            </button>
          </div>
        </div>

        {/* Row 2: Unified Segmented Tabs & Live Game Stats */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mt-1.5 pt-1.5 border-t border-purple-950/50">
          {/* Left: Tab Switcher (Unified 32px height) */}
          <div className="flex items-center gap-1.5 bg-[#0a0c16] p-0.5 rounded-xl border border-purple-950/80">
            <button
              type="button"
              onClick={() => setActiveTab(isNight ? 'night' : 'day')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'night' || activeTab === 'day'
                  ? 'bg-gradient-to-r from-purple-900 to-[#2c084d] border-purple-500 text-white shadow-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {isNight ? <Moon className="w-3.5 h-3.5 fill-purple-400 text-purple-400" /> : <Sun className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
              <span>{isNight ? `Kịch Bản Đêm ${roundNumber}` : `Ban Ngày ${roundNumber}`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-gradient-to-r from-purple-900 to-[#2c084d] border-purple-500 text-white shadow-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-300" />
              <span>Sơ Đồ Bàn</span>
            </button>
          </div>

          {/* Right: Unified Live Game Stats (All exactly 32px height) */}
          <div className="flex items-center gap-1.5">
            {/* Werewolf count out of total alive */}
            <div 
              className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-[#240609] to-[#160204] border border-rose-600/90 text-rose-200 text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.4)]"
              title={`Số Ma Sói còn sống: ${aliveWolves} / ${totalWolvesInDeck} Sói theo bộ bài`}
            >
              <WolfIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>{aliveWolves}/{totalWolvesInDeck} Sói</span>
            </div>

            {/* Villagers alive */}
            <div 
              className="h-8 px-2.5 rounded-xl bg-[#09152a] border border-blue-700/80 text-blue-200 text-xs font-bold flex items-center gap-1.5"
              title="Số Dân Làng còn sống"
            >
              <span>👨‍🌾 {aliveVillagers} Dân</span>
            </div>

            {/* Dead Players (Clickable to view who are they and when) */}
            <button
              type="button"
              onClick={() => setIsCemeteryOpen(true)}
              className="h-8 px-2.5 rounded-xl bg-[#1b0826] hover:bg-[#280c38] border border-purple-700/80 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Bấm để xem danh sách ai đã chết, chết vì sao và khi nào"
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>{players.length - alivePlayers.length} Chết ➔</span>
            </button>
          </div>
        </div>
      </header>

            {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 pb-20 sm:pb-24">
        {activeTab === 'night' && (
          <NightPhaseView
            roundNumber={roundNumber}
            rolesInGame={rolesInGame}
            players={players}
            deckRoleIds={deckRoleIds}
            nightState={nightState}
            isVillageCursed={isVillageCursed}
            wolfCanKillDouble={wolfCanKillDouble}
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
                role: getPlayerRole(p),
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

      {/* Game Guide & Rules Modal (Parchment Theme) */}
      <GameGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
