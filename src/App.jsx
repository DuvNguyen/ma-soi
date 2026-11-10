import React, { useState, useEffect } from 'react';
import { ROLES, PRESETS } from './data/roles';
import { getRoleCapacity } from './utils/deckUtils';
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
import GothicButton from './components/ui/GothicButton';
import GothicBadge from './components/ui/GothicBadge';
import { Moon, Sun, Users, BookOpen, RotateCcw, Shield, Eye, Skull, Sparkles, Trophy, Layers, Database, CheckCircle2, RefreshCw, History } from 'lucide-react';

export default function App() {
  const { showConfirm, showAlert } = useGothicDialog();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('night'); // 'night', 'day', 'table'

  // Neon DB Connection Status
  const [neonStatus, setNeonStatus] = useState({ ok: false, checked: false, branch: 'production' });

  // Game state
  const [deckRoleIds, setDeckRoleIds] = useState([
    "soi-thuong", "soi-thuong", "nua-nguoi-nua-soi", 
    "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc",
    "dan-lang", "dan-lang", "dan-lang", "dan-lang"
  ]);
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
    wolfSkipped: false,
    isCursedInfect: false,
    cursedUsed: false,
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCemeteryOpen, setIsCemeteryOpen] = useState(false);
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
    setDeckRoleIds(defaultRoleIds);
    
    // MẶC ĐỊNH BẮT ĐẦU: 14 NGƯỜI CHƠI VỚI TÊN THỰC TẾ, ROLE = NULL (CHƯA CÓ ROLE NGAY TỪ ĐẦU)
    // QUẢN TRÒ BẮT ĐẦU GỌI TỪNG VAI TRONG ĐÊM 1 ĐỂ GÁN DẦN TỪNG NGƯỜI
    const initialPlayers = Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      name: DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`,
      roleId: null, // Chưa có role ngay từ đầu
      role: null,
      isAlive: true,
      deathReason: null,
      deathPhase: null,
      loverId: null,
      elderLives: undefined,
      isRevealedIdiot: false
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
        setPlayers(prev => prev.map((p, i) => ({
          ...p,
          roleId: null,
          role: null,
          isAlive: true,
          deathReason: null,
          deathPhase: null,
          loverId: null,
          elderLives: undefined,
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
          cupidChosenIds: null,
          skippedRoles: []
        });
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
      roleId: null, // Mặc định chưa có role, gán dần từng đêm
      role: null,
      isAlive: true,
      deathReason: null,
      deathPhase: null,
      loverId: null,
      elderLives: undefined,
      isRevealedIdiot: false
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
        roleId: null, // Mặc định chưa có role, gán dần từng đêm
        role: null,
        isAlive: true,
        deathReason: null,
        deathPhase: null,
        loverId: null,
        elderLives: undefined,
        isRevealedIdiot: false
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
        playersSnapshot: currentPlayers,
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
        if (extra.isCursedInfect !== undefined) {
          next.isCursedInfect = !!extra.isCursedInfect;
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
      // Toggle unassign if clicking current holder
      if (targetPlayer?.roleId === role.id) {
        return prev.map(p => p.id === playerId ? { ...p, roleId: null, role: null } : p);
      }

      // Single role capacity (capacity === 1): STRICTLY REVOKE FROM ANY OTHER HOLDER
      if (capacity === 1) {
        return prev.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              roleId: role.id,
              role: role,
              elderLives: role.id === 'gia-lang' ? 2 : p.elderLives
            };
          }
          if (p.roleId === role.id) {
            return {
              ...p,
              roleId: null,
              role: null,
              elderLives: undefined
            };
          }
          return p;
        });
      }

      // Multi-capacity role (e.g. werewolves / villagers):
      const currentHolders = prev.filter(p => p.roleId === role.id);
      if (currentHolders.length >= capacity && capacity > 1) {
        const oldestHolder = currentHolders[0];
        return prev.map(p => {
          if (p.id === playerId) {
            return { ...p, roleId: role.id, role: role };
          }
          if (p.id === oldestHolder.id) {
            return { ...p, roleId: null, role: null };
          }
          return p;
        });
      }

      return prev.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            roleId: role.id,
            role: role,
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
    const WOLF_ROLE_IDS = [
      'soi-thuong', 'soi-con', 'soi-lon-xau-xa', 
      'soi-trang', 'nguoi-cha-cua-soi', 'soi-lua', 'anh-em-soi'
    ];
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
          roleId: assignedRole.id,
          role: assignedRole,
          elderLives: assignedRole.id === 'gia-lang' ? 2 : p.elderLives
        };
      }
      // If someone was previously assigned this role or wolf role but was removed from allowedIds
      if (isWolf && (p.role?.teamCode === 'W' || WOLF_ROLE_IDS.includes(p.roleId)) && !allowedIds.includes(p.id)) {
        return { ...p, roleId: null, role: null };
      }
      if (!isWolf && p.roleId === role.id && !allowedIds.includes(p.id)) {
        return { ...p, roleId: null, role: null };
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
    const villagerRole = ROLES.find(r => r.id === 'dan-lang') || {
      id: 'dan-lang',
      name: 'Dân Làng',
      enName: 'Simple Villager',
      teamCode: 'V',
      team: 'Phe Dân Làng'
    };

    setPlayers(prev => prev.map(p => {
      if (!p.roleId) {
        return {
          ...p,
          roleId: 'dan-lang',
          role: villagerRole
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

    // If Cursed Wolf infected someone this night, mark cursedUsed = true
    if (nightState.isCursedInfect) {
      setNightState(prev => ({
        ...prev,
        cursedUsed: true,
        isCursedInfect: false
      }));
    }

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

  const WOLF_ROLE_IDS = [
    'soi-thuong', 'soi-con', 'soi-lon-xau-xa', 
    'soi-trang', 'nguoi-cha-cua-soi', 'soi-lua', 'anh-em-soi'
  ];
  const isWolfPlayer = (p) => p?.isCursedWolf || p?.role?.teamCode === 'W' || WOLF_ROLE_IDS.includes(p?.role?.id);
  const alivePlayers = players.filter(p => p.isAlive);
  const aliveWolves = alivePlayers.filter(isWolfPlayer).length;
  const totalWolvesInDeck = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const aliveVillagers = alivePlayers.filter(p => !isWolfPlayer(p) && p.role?.teamCode !== '3').length;

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col font-sans selection:bg-purple-900 selection:text-white">
      {/* Top Navigation Bar - Consistent Gothic Dark & Mobile One-Screen */}
      <header className="sticky top-0 z-40 bg-[#0c0d16]/95 backdrop-blur-md border-b border-purple-950/80 px-3 sm:px-4 py-2 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Mini Status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-800 to-rose-900 border border-purple-600/60 flex items-center justify-center font-cinzel font-black text-white text-base shadow-[0_0_12px_rgba(147,51,234,0.4)] shrink-0">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-cinzel font-black text-xs sm:text-sm md:text-base tracking-wider text-slate-100 leading-tight">
                  QUẢN TRÒ MA SÓI
                </h1>
                {neonStatus.ok && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Đã kết nối Neon DB"></span>
                )}
              </div>
              <div className="text-[10px] text-purple-300/70 font-medium hidden sm:block">
                {players.length} người chơi • Kịch bản đêm lần lượt
              </div>
            </div>
          </div>

          {/* Quick Actions & Modals Triggers - EXACTLY CONSISTENT SIZES */}
          <div className="flex items-center gap-1.5">
            {/* RESET GAME BUTTON */}
            <button
              type="button"
              onClick={handleResetGame}
              title="Reset toàn bộ ván chơi về 0 để chơi lại từ đầu"
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/80 hover:border-rose-400 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4 shrink-0 text-rose-300" />
              <span className="hidden sm:inline">Reset Về 0</span>
            </button>

            {/* Bộ Bài */}
            <button
              type="button"
              onClick={() => setIsTemplatesOpen(true)}
              title="Chọn hoặc tạo template bộ bài"
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4 shrink-0 text-purple-300" />
              <span className="hidden sm:inline">Bộ Bài</span>
            </button>

            {/* Tên Người Chơi */}
            <button
              type="button"
              onClick={() => setIsRostersOpen(true)}
              title="Danh sách người chơi đã lưu"
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Users className="w-4 h-4 shrink-0 text-purple-300" />
              <span className="hidden sm:inline">Tên Người Chơi</span>
            </button>

            {/* Lịch Sử */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              title="Xem lịch sử các trận đấu đã lưu trên Neon DB"
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-[#141628] hover:bg-[#1e2038] border border-slate-800 hover:border-purple-600 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <History className="w-4 h-4 shrink-0 text-slate-300" />
              <span className="hidden md:inline">Lịch Sử</span>
            </button>

            {/* Thư viện */}
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              title="Thư viện hướng dẫn các vai trò"
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-[#141628] hover:bg-[#1e2038] border border-slate-800 hover:border-purple-600 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-slate-300" />
              <span className="hidden md:inline">Thư Viện</span>
            </button>
          </div>
        </div>

        {/* Row 2: Unified Segmented Tabs & Live Game Stats */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-purple-950/50">
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
              <span>🐺 {aliveWolves}/{totalWolvesInDeck} Sói</span>
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
    </div>
  );
}
