import React, { useState, useRef, useEffect } from 'react';
import { Moon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import DeckInventoryRadar from './DeckInventoryRadar';
import NightStepHeader from './night/NightStepHeader';
import NightRoleAction from './night/NightRoleAction';
import NightStickyFooter from './night/NightStickyFooter';
import NightSummaryStep from './night/NightSummaryStep';
import { useGothicDialog } from '../context/GothicDialogContext';
import { isWolfPlayer, getPlayerRole, getRole, WOLF_ROLE_IDS } from '../utils/roleUtils';
import triggerHaptic from '../utils/haptics';

export default function NightPhaseView({
  roundNumber,
  rolesInGame,
  players,
  deckRoleIds = [],
  nightState,
  isVillageCursed = false,
  wolfCanKillDouble = false,
  canWolvesKillTeammates = false,
  onSaveAction,
  onAssignRole,
  onAssignRoleToMultiple,
  onAutoAssignVillagers,
  onSkipRole,
  onAdvanceToDay,
  currentStepIdx: externalStepIdx = 0,
  onStepChange
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  const topContainerRef = useRef(null);
  const cardRef = useRef(null);
  const isInitialMount = useRef(true);
  const prevStepIdxRef = useRef(null);

  // Sort roles according to canonical night wake-up order
  const getOrderedNightRoles = () => {
    const orderPriority = {
      'nguyet-nu': 0.2,
      'thanh-vien-giao-phai': 0.3,
      'anh-tu': 0.4,
      'dien-vien': 0.5,
      'ke-bao-thu': 0.6,
      'cho-soi-soi-lai': 0.8,
      'an-trom': 1,
      'cupid': 2,
      'hai-chi-em': 2.1,
      'ba-anh-em': 2.2,
      'tham-phan-lap-bap': 2.3,
      'dua-tre-hoang-da': 3,
      'tho-san': 3.3,
      'ki-si': 3.4,
      'ba-dong': 3.5,
      'nguoi-goi-hon': 3.8,
      'bao-ve': 4,
      'cao': 4.1,
      'nguoi-mua-roi': 4.8,
      'nguoi-cha-cua-soi': 4.9,
      'soi-quy': 4.9,
      'anh-em-soi': 4.95,
      'soi-thuong': 5,
      'soi-con': 5.1,
      'soi-lon-xau-xa': 5.2,
      'soi-trang': 5.3,
      'soi-lua': 5.4,
      'cao-lua': 5.4,
      'tien-tri': 6,
      'thay-thoi-mien': 6.5,
      'phu-thuy': 7,
      'duoc-si': 7.5,
      'sat-thu': 7.6,
      'nguoi-thoi-sao': 8,
      'ke-dot-nha': 8.1,
      'con-qua': 9,
      'con-qua-plus': 9.1
    };

    const activeRoles = rolesInGame.filter(r => {
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai', 'cho-soi-soi-lai', 'ba-anh-em', 'hai-chi-em', 'tham-phan-lap-bap', 'tho-san', 'anh-em-soi', 'ki-si', 'thanh-vien-giao-phai'].includes(r.id) && roundNumber > 1) {
        return false;
      }
      if (r.id === 'dien-vien' && roundNumber > 3) {
        return false;
      }
      if (r.id === 'nguoi-goi-hon' && (roundNumber === 1 || players.filter(p => !p.isAlive).length === 0)) {
        return false;
      }
      if ([
        'dan-lang', 'dan-thuong', 'gia-lang', 'canh-sat-truong', 
        'nguoi-the-than', 'oan-nhan', 'nguoi-day-to-tan-tuy', 'hiep-si-gia', 
        'thien-su', 'thien-than', 'bo-lao', 'thang-mo', 'nguoi-thuan-phuc-gau', 'than-gau',
        'co-be', 'canh-sat-characters', 'hiep-si-kiem-gi', 'nua-nguoi-nua-soi', 'thang-ngoc'
      ].includes(r.id)) {
        return false;
      }
      return true;
    });

    const wolfVariants = ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'nguoi-cha-cua-soi', 'soi-quy', 'soi-bi-nguyen', 'soi-lua', 'anh-em-soi'];
    const nonWolfRoles = activeRoles.filter(r => !wolfVariants.includes(r.id) && r.id !== 'soi-trang');
    const hasAnyWolves = activeRoles.some(r => wolfVariants.includes(r.id) || r.id === 'soi-trang');

    let finalRoles = nonWolfRoles.map(r => {
      if (r.id === 'tho-san' && roundNumber === 1) {
        return {
          ...r,
          shortDesc: 'Thức dậy trong Đêm 1 để Quản trò nhận diện người nắm giữ vai.',
          gmCall: 'Thợ Săn thức dậy nhận diện Quản Trò.'
        };
      }
      if (r.id === 'ki-si' && roundNumber === 1) {
        return {
          ...r,
          shortDesc: 'Thức dậy trong Đêm 1 để Quản trò nhận diện và gán người nắm giữ vai Kị Sĩ.',
          gmCall: 'Kị Sĩ thức dậy nhận diện Quản Trò.'
        };
      }
      if (r.id === 'cao' && nightState?.foxLostPower) {
        return {
          ...r,
          isPowerLost: true,
          shortDesc: 'Cáo đã mất năng lực đánh hơi. Gọi thức dậy cho có để bảo toàn bí mật thân phận.',
          gmCall: 'Cáo thức dậy. (Quản trò gọi giả vờ để không làm lộ Cáo đã mất phép). Cáo nhắm mắt lại.'
        };
      }
      if (r.id === 'ba-dong' && (nightState?.soothsayerCount || 0) >= 5) {
        return {
          ...r,
          isPowerLost: true,
          powerLostReason: 'Đã sử dụng hết 5 lượt linh cảm tâm linh trong ván',
          shortDesc: 'Đã hết 5 lượt trong ván. Quản trò gọi cho có để bảo toàn bí mật thân phận.',
          gmCall: 'Bà Đồng thức dậy. (Quản trò gọi cho có). Bà Đồng nhắm mắt lại.'
        };
      }
      if (r.id === 'nguoi-mua-roi' && nightState?.puppeteerUsed) {
        return {
          ...r,
          isPowerLost: true,
          powerLostReason: 'Đã sử dụng quyền năng thao túng bầy Sói (chỉ dùng 1 lần/ván)',
          shortDesc: 'Đã dùng quyền năng thao túng bầy Sói trong ván.',
          gmCall: 'Người Múa Rối thức dậy. (Quản trò gọi cho có). Người Múa Rối nhắm mắt lại.'
        };
      }
      if (r.id === 'duoc-si' && nightState?.apothecaryHasSleep === false && nightState?.apothecaryHasAntidote === false) {
        return {
          ...r,
          isPowerLost: true,
          powerLostReason: 'Đã sử dụng hết cả 2 bình thuốc trong ván (Thuốc Mê & Hồi Phục)',
          shortDesc: 'Đã dùng hết cả 2 bình thuốc trong ván.',
          gmCall: 'Dược Sĩ thức dậy. (Quản trò gọi cho có). Dược Sĩ nhắm mắt lại.'
        };
      }
      return r;
    });

    // Anh Em Sói Đêm 1: Nhận diện riêng trước khi vào lượt cắn chung
    if (rolesInGame.some(r => r.id === 'anh-em-soi') && roundNumber === 1) {
      finalRoles.push({
        id: 'anh-em-soi',
        name: 'Anh Em Sói (Đêm 1 Nhận Diện)',
        enName: 'Wolf Brothers',
        teamCode: 'W',
        team: 'Phe Sói',
        shortDesc: 'Sói Anh và Sói Em thức dậy nhận diện nhau. Phân định rõ Sói Anh và Sói Em.',
        gmCall: 'Hai Anh Em Sói thức dậy nhận biết nhau. Quản trò phân định Sói Anh và Sói Em.',
        image: '/cards/anh_em_soi.png'
      });
    }

    const livingWolvesCount = players.filter(p => p.isAlive && isWolfPlayer(p)).length;
    if (hasAnyWolves) {
      finalRoles.push({
        id: 'soi-thuong',
        name: 'Bầy Ma Sói (Săn Mồi)',
        enName: 'Werewolf Pack',
        teamCode: 'W',
        team: 'Phe Sói',
        isPowerLost: livingWolvesCount === 0,
        powerLostReason: livingWolvesCount === 0 ? 'Toàn bộ Ma Sói đã bị tiêu diệt. Gọi có lệ để giữ bí mật số lượng Sói.' : null,
        shortDesc: livingWolvesCount === 0 
          ? 'Toàn bộ Ma Sói đã bị tiêu diệt. Gọi thức dậy có lệ để giữ bí mật thông tin.' 
          : 'Toàn bộ bầy Sói mở mắt nhận diện nhau và thống nhất cắn người.',
        gmCall: livingWolvesCount === 0
          ? 'Ma Sói thức dậy. (Quản trò gọi có lệ). Ma Sói nhắm mắt lại.'
          : 'Ma Sói thức dậy. Hãy nhận diện đồng bọn và chọn con mồi đêm nay.',
        image: '/cards/la-bai-ma-soi.jpg'
      });
    }

    // Sói Lửa thức dậy khi có đồng bọn hy sinh
    const fireWolfPlayer = players.find(p => p.isAlive && ((p.currentRoleId || p.roleId) === 'soi-lua' || getPlayerRole(p)?.id === 'soi-lua'));
    const deadWolvesCount = players.filter(p => !p.isAlive && isWolfPlayer(p)).length;
    const maxBurns = deadWolvesCount >= 2 ? 2 : 1;
    const canFireWolfWake = fireWolfPlayer && deadWolvesCount > 0 && (nightState?.fireWolfBurnCount || 0) < maxBurns;

    if (rolesInGame.some(r => r.id === 'soi-lua') && (canFireWolfWake || nightState?.fireWolfActive)) {
      finalRoles.push({
        id: 'soi-lua',
        name: 'Sói Lửa (Thiêu Rụi Kỹ Năng)',
        enName: 'Fire Werewolf',
        teamCode: 'W',
        team: 'Phe Sói',
        shortDesc: 'Đồng bọn tử trận kích hoạt ngọn lửa hận thù. Sói Lửa thức dậy thiêu rụi vĩnh viễn năng lực của 1 người.',
        gmCall: 'Sói Lửa thức dậy một mình. Hãy chọn người bạn muốn thiêu rụi năng lực vĩnh viễn.',
        image: '/cards/Cao_lua.png'
      });
    }

    if (rolesInGame.some(r => r.id === 'soi-lon-xau-xa')) {
      const bigBadWolfPlayer = players.find(p => (p.currentRoleId || p.roleId) === 'soi-lon-xau-xa');
      const deadWolves = players.filter(p => !p.isAlive && isWolfPlayer(p));
      const isPowerActive = bigBadWolfPlayer && bigBadWolfPlayer.isAlive && deadWolves.length === 0;

      finalRoles.push({
        id: 'soi-lon-xau-xa',
        name: 'Sói Lớn Xấu Xa (Cắn Thêm)',
        enName: 'Big Bad Wolf',
        teamCode: 'W',
        team: 'Phe Sói',
        isPowerLost: !isPowerActive,
        powerLostReason: !bigBadWolfPlayer?.isAlive
          ? 'Sói Lớn Xấu Xa đã tử trận'
          : deadWolves.length > 0
          ? `Đã mất năng lực cắn thêm vì có Ma Sói (${deadWolves.map(w => w.name).join(', ')}) đã chết`
          : null,
        shortDesc: 'Mỗi đêm cắn thêm 1 nạn nhân khi chưa có bất kỳ Ma Sói nào trong bầy bị tiêu diệt.',
        gmCall: 'Sói Lớn Xấu Xa thức dậy một mình. Bạn có muốn cắn thêm nạn nhân nào không?',
        image: '/cards/Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG'
      });
    }

    if (rolesInGame.some(r => r.id === 'soi-trang') && roundNumber % 2 === 0) {
      finalRoles.push({
        id: 'soi-trang',
        name: 'Sói Trắng (Đêm Chẵn Sát Hại Đồng Bọn)',
        enName: 'White Werewolf',
        teamCode: '3',
        team: 'Phe Thứ Ba',
        shortDesc: 'Cứ 2 đêm 1 lần, Sói Trắng thức dậy riêng và có thể chọn cắn chết 1 con Sói khác trong bầy.',
        gmCall: 'Sói Trắng thức dậy một mình. Bạn có muốn chọn giết 1 con Ma Sói nào khác trong bầy không?',
        image: '/cards/Nhan_vat_Ma_soi___Soi_trang.PNG'
      });
    }

    finalRoles.sort((a, b) => (orderPriority[a.id] || 99) - (orderPriority[b.id] || 99));

    finalRoles.push({
      id: 'night-summary',
      name: 'Tổng Kết Đêm & Chuẩn Bị Trời Sáng',
      enName: 'Night Summary',
      teamCode: 'V',
      shortDesc: 'Kiểm tra toàn bộ diễn biến trước khi Quản trò tuyên bố trời sáng.',
      gmCall: 'Tất cả mọi người ngủ say... Quản trò chuẩn bị công bố kết quả.'
    });

    return finalRoles;
  };

  const nightSteps = getOrderedNightRoles();

  // Step state
  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    try {
      const local = localStorage.getItem('werewolf_current_night_step');
      if (local !== null) {
        const parsed = parseInt(local, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return typeof externalStepIdx === 'number' ? externalStepIdx : 0;
  });

  useEffect(() => {
    if (typeof externalStepIdx === 'number' && externalStepIdx !== currentStepIdx) {
      setCurrentStepIdx(externalStepIdx);
    }
  }, [externalStepIdx]);

  const safeStepIdx = Math.min(currentStepIdx, Math.max(0, nightSteps.length - 1));

  const changeStep = (newIdx) => {
    const bounded = Math.max(0, Math.min(newIdx, nightSteps.length - 1));
    setCurrentStepIdx(bounded);
    if (onStepChange) onStepChange(bounded);
    try {
      localStorage.setItem('werewolf_current_night_step', String(bounded));
    } catch (e) {}
  };

  // Active step
  const currentRole = nightSteps[safeStepIdx] || nightSteps[0];
  const isWolfStep = currentRole.id === 'soi-thuong';
  const isSummaryStep = currentRole.id === 'night-summary';

  const alivePlayers = players.filter(p => p.isAlive);

  // Local state helpers
  const [selectedSeerTarget, setSelectedSeerTarget] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showWolfWhisper, setShowWolfWhisper] = useState(false);
  const [wolfLogs, setWolfLogs] = useState([]);

  // Gatekeeper validation
  const isSkipped = (nightState?.skippedRoles || []).includes(currentRole?.id);
  const roleHolders = isWolfStep ? players.filter(isWolfPlayer) : players.filter(p => (p.currentRoleId || p.roleId) === currentRole?.id);
  const hasHolders = roleHolders.length > 0;

  const cursedHolder = !isWolfStep && players.find(p => p.isCursedWolf && p.originalRoleId === currentRole?.id);
  const isRoleCursedOut = Boolean(cursedHolder) && !hasHolders;
  const isCurrentRoleSilencedByMoon = !isWolfStep && roleHolders.some(p => p.id === nightState?.silencedPlayerId && !nightState?.moonPriestessSkipped);

  const maxWolves = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const currentWolves = players.filter(isWolfPlayer);

  const CURSED_WOLF_IDS = ['soi-quy', 'nguoi-cha-cua-soi', 'soi-nguyen', 'cha-cho-soi'];
  const hasCursedWolfInDeck = (deckRoleIds || []).some(id => CURSED_WOLF_IDS.includes(id)) ||
    (rolesInGame || []).some(r => CURSED_WOLF_IDS.includes(r.id));
  const cursedWolfPlayer = players.find(p => {
    const rId = p.currentRoleId || p.roleId;
    return CURSED_WOLF_IDS.includes(rId);
  });
  const canCursedWolfInfect = hasCursedWolfInDeck && cursedWolfPlayer && cursedWolfPlayer.isAlive && !nightState.cursedUsed;

  const getStepValidationState = () => {
    if (!currentRole || isSummaryStep) return { isValid: true, message: '', shortMessage: '' };

    const shortRoleName = (currentRole.name || '').split(' (')[0].split('/')[0].trim();

    if (isWolfStep) {
      const livingWolves = currentWolves.filter(p => p.isAlive);
      if (livingWolves.length === 0) {
        return {
          isValid: true,
          message: 'Toàn bộ Ma Sói đã bị tiêu diệt (Gọi thức dậy có lệ)',
          shortMessage: 'Sói đã chết hết ✓'
        };
      }
      if (currentWolves.length < maxWolves) {
        return {
          isValid: false,
          isStrictBlock: true,
          message: `BẮT BUỘC gán đủ ${maxWolves} Ma Sói theo bộ bài! (Hiện có ${currentWolves.length}/${maxWolves} Sói).`,
          shortMessage: `Chưa đủ ${currentWolves.length}/${maxWolves} Sói`
        };
      }
      if (nightState.wolfTargetId === null && !nightState.wolfSkipped) {
        return { 
          isValid: false, 
          message: 'Bầy Sói phải chọn 1 con mồi hoặc bấm Bầy Sói Không Cắn Ai',
          shortMessage: 'Chưa chọn mục tiêu cắn'
        };
      }
      return { 
        isValid: true, 
        message: 'Bầy Sói đã chọn mục tiêu',
        shortMessage: 'Đã chọn mục tiêu ✓'
      };
    }

    if (isSkipped) {
      return { 
        isValid: true, 
        message: `Quản trò đã bỏ qua vai ${shortRoleName}`,
        shortMessage: 'Đã bỏ qua vai ✓'
      };
    }

    const hasLivingHolders = roleHolders.some(p => p.isAlive);
    if (roleHolders.length > 0 && !hasLivingHolders) {
      return { 
        isValid: true, 
        isDeadRole: true, 
        message: 'Người giữ vai này đã chết ➔ Có thể bỏ qua',
        shortMessage: 'Người giữ vai đã chết'
      };
    }

    if (isRoleCursedOut) {
      return { 
        isValid: true, 
        isDeadRole: true, 
        message: `Đã bị Sói Nguyền lây nhiễm (${cursedHolder?.name}) ➔ Mất phép thuật`,
        shortMessage: 'Bị nguyền mất phép'
      };
    }

    if (isVillageCursed && ['bao-ve', 'tien-tri', 'phu-thuy', 'tho-san', 'hiep-si-kiem-gi'].includes(currentRole.id)) {
      return { 
        isValid: true, 
        isDeadRole: true, 
        message: 'Lời nguyền Già Làng: Mất toàn bộ phép thuật',
        shortMessage: 'Trúng lời nguyền Già Làng'
      };
    }

    if (currentRole.isPowerLost) {
      return {
        isValid: true,
        message: currentRole.powerLostReason || 'Năng lực của vai trò này đã mất',
        shortMessage: 'Đã mất năng lực'
      };
    }

    if (isCurrentRoleSilencedByMoon) {
      return {
        isValid: true,
        message: 'Người giữ vai này đã bị Nguyệt Nữ phong ấn năng lực đêm nay',
        shortMessage: 'Bị phong ấn ✓'
      };
    }

    switch (currentRole.id) {
      case 'bao-ve': {
        if (!nightState.protectedPlayerId && !nightState.protectSkipped) {
          return { 
            isValid: false, 
            message: 'Bảo Vệ phải chọn 1 người hoặc bấm Không Bảo Vệ Ai',
            shortMessage: 'Chưa chọn người bảo vệ'
          };
        }
        return { 
          isValid: true, 
          message: 'Bảo Vệ đã hành động',
          shortMessage: 'Đã chọn bảo vệ ✓'
        };
      }

      case 'tien-tri': {
        if (!nightState.seerTargetId) {
          return { 
            isValid: false, 
            message: 'Tiên Tri phải chọn 1 người để soi bài',
            shortMessage: 'Chưa soi ai'
          };
        }
        return { 
          isValid: true, 
          message: 'Tiên Tri đã soi bài',
          shortMessage: 'Đã soi bài ✓'
        };
      }

      case 'phu-thuy': {
        return { 
          isValid: true, 
          message: 'Phù Thủy đã quyết định (Bình cứu & Bình độc)',
          shortMessage: 'Đã quyết định thuốc ✓'
        };
      }

      case 'cupid': {
        const cupidHolder = players.find(p => (p.currentRoleId || p.roleId) === 'cupid' || p.originalRoleId === 'cupid' || getPlayerRole(p)?.id === 'cupid');
        if (!cupidHolder) {
          return {
            isValid: false,
            message: 'Chưa gán người chơi nào cho vai Cupid',
            shortMessage: 'Chưa gán Cupid'
          };
        }
        const count = (nightState.cupidChosenIds || []).length;
        if (count !== 2) {
          return { 
            isValid: false, 
            message: `Cupid phải chọn đúng 2 người ghép đôi (${count}/2)`,
            shortMessage: `Chọn ghép đôi (${count}/2)`
          };
        }
        return { 
          isValid: true, 
          message: 'Cupid đã chọn 2 người yêu nhau',
          shortMessage: 'Đã ghép đôi ✓'
        };
      }

      case 'hai-chi-em': {
        const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'hai-chi-em');
        if (holders.length < 2) {
          return {
            isValid: false,
            message: `Bắt buộc gán đủ đúng 2 người chơi cho vai Hai Chị Em (Hiện có ${holders.length}/2)`,
            shortMessage: `Chưa đủ 2 Chị Em (${holders.length}/2)`
          };
        }
        return {
          isValid: true,
          message: 'Hai Chị Em đã nhận diện nhau',
          shortMessage: 'Đã nhận diện (2/2) ✓'
        };
      }

      case 'ba-anh-em': {
        const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'ba-anh-em');
        if (holders.length < 3) {
          return {
            isValid: false,
            message: `Bắt buộc gán đủ đúng 3 người chơi cho vai Ba Anh Em (Hiện có ${holders.length}/3)`,
            shortMessage: `Chưa đủ 3 Anh Em (${holders.length}/3)`
          };
        }
        return {
          isValid: true,
          message: 'Ba Anh Em đã nhận diện nhau',
          shortMessage: 'Đã nhận diện (3/3) ✓'
        };
      }

      case 'dua-tre-hoang-da': {
        const wildChildHolder = players.find(p => (p.currentRoleId || p.roleId) === 'dua-tre-hoang-da' || p.originalRoleId === 'dua-tre-hoang-da' || getPlayerRole(p)?.id === 'dua-tre-hoang-da');
        if (!wildChildHolder) {
          return {
            isValid: false,
            message: 'Chưa gán người chơi nào cho vai Đứa Trẻ Hoang Dã (Tarzan)',
            shortMessage: 'Chưa gán Con Hoang'
          };
        }
        if (!nightState.wildChildIdolId) {
          return { 
            isValid: false, 
            message: 'Đứa Trẻ Hoang Dã phải chọn 1 Thần Tượng (Idol)',
            shortMessage: 'Chưa chọn Thần Tượng'
          };
        }
        return { 
          isValid: true, 
          message: 'Đứa Trẻ Hoang Dã đã chọn Thần Tượng',
          shortMessage: 'Đã chọn Thần Tượng ✓'
        };
      }

      case 'anh-tu': {
        const shadowHolder = players.find(p => (p.currentRoleId || p.roleId) === 'anh-tu' || p.originalRoleId === 'anh-tu' || getPlayerRole(p)?.id === 'anh-tu');
        if (!shadowHolder) {
          return {
            isValid: false,
            message: 'Chưa gán người chơi nào cho vai Ảnh Tử',
            shortMessage: 'Chưa gán vai Ảnh Tử'
          };
        }
        if (!nightState.shadowHostId) {
          return { 
            isValid: false, 
            message: 'Ảnh Tử phải chọn 1 Bản Thể liên kết',
            shortMessage: 'Chưa chọn Bản Thể'
          };
        }
        return { 
          isValid: true, 
          message: 'Ảnh Tử đã chọn Bản Thể',
          shortMessage: 'Đã chọn Bản Thể ✓'
        };
      }

      case 'nguoi-thoi-sao': {
        const count = (nightState.piperChosenIds || []).length;
        if (count !== 2) {
          return { 
            isValid: false, 
            message: `Thổi Sáo phải chọn đúng 2 người (${count}/2)`,
            shortMessage: `Chọn mê hoặc (${count}/2)`
          };
        }
        return { 
          isValid: true, 
          message: 'Đã chọn 2 người mê hoặc',
          shortMessage: 'Đã mê hoặc ✓'
        };
      }

      case 'con-qua': {
        if (!nightState.ravenTargetId && !nightState.ravenSkipped) {
          return { 
            isValid: false, 
            message: 'Quạ phải chọn 1 người để gieo 2 phiếu phạt',
            shortMessage: 'Chưa chọn người tố cáo'
          };
        }
        return { 
          isValid: true, 
          message: 'Đã chọn người tố cáo',
          shortMessage: 'Đã tố cáo ✓'
        };
      }

      case 'cao': {
        if (nightState?.foxLostPower) {
          return {
            isValid: true,
            message: 'Cáo đã mất năng lực (Gọi thức dậy cho có để bảo toàn bí mật)',
            shortMessage: 'Gọi cho có ✓'
          };
        }
        if (!nightState?.foxCheckedThisNight && !nightState?.foxSkipped) {
          return { 
            isValid: false, 
            message: 'Cáo: Chọn kết quả "Soi ra Sói" hoặc "Không ra Sói" (hoặc Bỏ qua)',
            shortMessage: 'Chưa chọn kết quả'
          };
        }
        return { 
          isValid: true, 
          message: 'Cáo đã thực hiện đánh hơi',
          shortMessage: 'Đã đánh hơi ✓'
        };
      }

      case 'soi-lon-xau-xa': {
        if (currentRole.isPowerLost) {
          return {
            isValid: true,
            message: currentRole.powerLostReason || 'Năng lực cắn thêm đã mất',
            shortMessage: 'Mất năng lực'
          };
        }
        if (nightState.bigBadWolfTargetId === null && !nightState.bigBadWolfSkipped) {
          return { 
            isValid: false, 
            message: 'Sói Lớn Xấu Xa chọn 1 nạn nhân cắn thêm hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { 
          isValid: true, 
          message: 'Sói Lớn Xấu Xa đã đưa ra lựa chọn',
          shortMessage: 'Đã chọn ✓'
        };
      }

      case 'soi-trang': {
        if (nightState.whiteWolfVictimId === null && !nightState.whiteWolfSkipped) {
          return { 
            isValid: false, 
            message: 'Sói Trắng chọn 1 Ma Sói để cắn hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { 
          isValid: true, 
          message: 'Sói Trắng đã đưa ra lựa chọn',
          shortMessage: 'Đã chọn ✓'
        };
      }

      case 'nguyet-nu': {
        if (nightState.silencedPlayerId === null && !nightState.moonPriestessSkipped) {
          return { 
            isValid: false, 
            message: 'Nguyệt Nữ chọn 1 người để khóa phép hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn người khóa phép'
          };
        }
        return { 
          isValid: true, 
          message: 'Đã chọn người khóa phép',
          shortMessage: 'Đã khóa phép ✓'
        };
      }

      case 'tho-san': {
        const hasHunter = players.some(p => (p.currentRoleId || p.roleId) === 'tho-san');
        if (!hasHunter) {
          return {
            isValid: true,
            message: 'Chưa gán người giữ vai Thợ Săn (có thể gán sau khi chết)',
            shortMessage: 'Chưa gán vai'
          };
        }
        return {
          isValid: true,
          message: 'Thợ Săn đã nhận diện Quản Trò',
          shortMessage: 'Đã nhận diện ✓'
        };
      }

      case 'thay-thoi-mien': {
        if (!nightState.hypnotistTargetId && !nightState.hypnotistSkipped) {
          return {
            isValid: false,
            message: 'Thầy Thôi Miên phải chọn 1 người để thế mạng hoặc bấm Không Mê Hoặc',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { isValid: true, message: 'Đã chọn người thế mạng', shortMessage: 'Đã mê hoặc ✓' };
      }

      case 'sat-thu': {
        if (!nightState.assassinTargetId && !nightState.assassinSkipped) {
          return {
            isValid: false,
            message: 'Sát Thủ phải chọn 1 mục tiêu ám sát hoặc bấm Không Ám Sát',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { isValid: true, message: 'Sát Thủ đã chọn mục tiêu', shortMessage: 'Đã chọn ám sát ✓' };
      }

      case 'ke-dot-nha': {
        if (!nightState.pyroTargetId && !nightState.pyroSkipped) {
          return {
            isValid: false,
            message: 'Kẻ Đốt Nhà phải chọn 1 ngôi nhà phóng hỏa hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn nhà'
          };
        }
        return { isValid: true, message: 'Đã chọn ngôi nhà phóng hỏa', shortMessage: 'Đã phóng hỏa ✓' };
      }

      case 'an-trom': {
        if (!nightState.thiefChosenRoleId) {
          return {
            isValid: false,
            message: 'Ăn Trộm phải chọn 1 vai trò mới hoặc bấm Giữ Nguyên Dân Thường',
            shortMessage: 'Chưa chọn vai'
          };
        }
        return { isValid: true, message: 'Ăn Trộm đã chọn vai', shortMessage: 'Đã đổi vai ✓' };
      }

      case 'ba-dong': {
        if ((nightState.soothsayerCount || 0) >= 5) {
          return { isValid: true, message: 'Bà Đồng đã sử dụng hết 5 lượt hỏi trong ván', shortMessage: 'Hết 5 lượt ✓' };
        }
        if (!nightState.soothsayerTargetId && !nightState.soothsayerSkipped) {
          return {
            isValid: false,
            message: 'Bà Đồng phải chỉ định 1 người trả lời hoặc bấm Bỏ Qua Đêm Nay',
            shortMessage: 'Chưa chọn người'
          };
        }
        return { isValid: true, message: 'Bà Đồng đã đặt câu hỏi', shortMessage: 'Đã chỉ định ✓' };
      }

      case 'nguoi-mua-roi': {
        if (nightState.puppeteerUsed) {
          return { isValid: true, message: 'Đã sử dụng quyền năng múa rối trong ván', shortMessage: 'Đã dùng 1 lần/ván ✓' };
        }
        if (!nightState.puppeteerTargetId && !nightState.puppeteerSkipped) {
          return {
            isValid: false,
            message: 'Người Múa Rối phải chọn 1 người để ép Sói cắn hoặc bấm Không Can Thiệp',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { isValid: true, message: 'Đã chọn mục tiêu thao túng', shortMessage: 'Đã chọn ✓' };
      }

      case 'duoc-si': {
        const hasSleep = nightState.apothecaryHasSleep !== false;
        const hasAntidote = nightState.apothecaryHasAntidote !== false;
        if (!hasSleep && !hasAntidote) {
          return { isValid: true, message: 'Dược Sĩ đã dùng hết cả 2 bình thuốc', shortMessage: 'Hết thuốc ✓' };
        }
        if (!nightState.apothecarySleepTargetId && !nightState.apothecaryCurePoison && !nightState.apothecarySkipped) {
          return {
            isValid: false,
            message: 'Dược Sĩ phải chọn dùng bình thuốc hoặc bấm Bỏ Qua Đêm Nay',
            shortMessage: 'Chưa chọn bình'
          };
        }
        return { isValid: true, message: 'Dược Sĩ đã sử dụng thuốc', shortMessage: 'Đã chọn ✓' };
      }

      case 'nguoi-goi-hon': {
        if (!nightState.spiritualistSuspectId && !nightState.spiritualistSkipped) {
          return {
            isValid: false,
            message: 'Người Gọi Hồn phải ghi nhận người bị hồn ma nghi ngờ hoặc chọn Bỏ Qua',
            shortMessage: 'Chưa ghi nhận'
          };
        }
        return { isValid: true, message: 'Người Gọi Hồn đã ghi nhận', shortMessage: 'Đã ghi nhận ✓' };
      }

      case 'ke-bao-thu': {
        if (!nightState.avengerChosenFaction) {
          return {
            isValid: false,
            message: 'Kẻ Báo Thù phải chọn phe tôn thờ (Phe Dân Làng hoặc Phe Ma Sói)',
            shortMessage: 'Chưa chọn phe'
          };
        }
        return { isValid: true, message: 'Kẻ Báo Thù đã chọn phe', shortMessage: 'Đã chọn phe ✓' };
      }

      case 'anh-em-soi': {
        const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'anh-em-soi');
        if (holders.length < 2) {
          return {
            isValid: false,
            message: `Bắt buộc gán đủ đúng 2 người chơi cho vai Anh Em Sói (Hiện có ${holders.length}/2)`,
            shortMessage: `Chưa đủ 2 Anh Em (${holders.length}/2)`
          };
        }
        return { isValid: true, message: 'Hai Anh Em Sói đã nhận diện nhau', shortMessage: 'Đã nhận diện (2/2) ✓' };
      }

      case 'soi-lua': {
        if (!nightState.fireWolfTargetId && !nightState.fireWolfSkipped) {
          return {
            isValid: false,
            message: 'Sói Lửa phải chọn 1 người để thiêu rụi năng lực hoặc bấm Bỏ Qua',
            shortMessage: 'Chưa chọn mục tiêu'
          };
        }
        return { isValid: true, message: 'Sói Lửa đã đưa ra lựa chọn', shortMessage: 'Đã thiêu rụi ✓' };
      }

      default:
        return { isValid: true, message: '', shortMessage: '' };
    }
  };

  const stepValidation = getStepValidationState();

  const handleNextStep = (force = false) => {
    if (stepValidation.isStrictBlock) {
      showAlert({
        title: 'BẮT BUỘC GÁN ĐỦ MA SÓI!',
        message: stepValidation.message,
        variant: 'danger',
        confirmText: 'Đã Hiểu & Đi Chọn Sói'
      });
      return;
    }

    if (!stepValidation.isValid && !force) {
      showAlert({
        title: 'HÀNH ĐỘNG CHƯA HỢP LỆ!',
        message: stepValidation.message,
        variant: 'warning',
        confirmText: 'Kiểm Tra Lại'
      });
      return;
    }

    // Nếu vai trò chưa được gán cho người chơi nào (chưa có ai giữ vai, chưa xác nhận bỏ qua)
    if (!hasHolders && !isSkipped && !isRoleCursedOut && !isWolfStep && !force) {
      showConfirm({
        title: 'VAI TRÒ CHƯA CÓ NGƯỜI GIỮ!',
        message: `Vai trò "${currentRole?.name || 'này'}" hiện chưa được gán cho bất kỳ người chơi nào trong làng.\n\nBạn có muốn bỏ qua lượt này để đi tiếp, hay quay lại để gán vai?`,
        variant: 'warning',
        confirmText: 'Bỏ Qua & Đi Tiếp ➔',
        cancelText: 'Quay Lại Gán Vai',
        onConfirm: () => {
          if (onSkipRole && currentRole) onSkipRole(currentRole.id);
          handleNextStep(true);
        }
      });
      return;
    }

    triggerHaptic('confirm');
    if (safeStepIdx < nightSteps.length - 1) {
      changeStep(safeStepIdx + 1);
      setSelectedSeerTarget(null);
      setShowAssignDropdown(false);
    } else {
      try {
        localStorage.removeItem('werewolf_current_night_step');
      } catch (e) {}
      onAdvanceToDay();
    }
  };

  const handlePrevStep = () => {
    if (safeStepIdx > 0) {
      changeStep(safeStepIdx - 1);
      setSelectedSeerTarget(null);
      setShowAssignDropdown(false);
    }
  };

  // Smooth auto-scroll to Tarot Card when advancing or rewinding role steps
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStepIdxRef.current = safeStepIdx;
      return;
    }

    if (prevStepIdxRef.current !== safeStepIdx) {
      prevStepIdxRef.current = safeStepIdx;
      if (cardRef.current) {
        const yOffset = -90;
        const y = cardRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      } else if (topContainerRef.current) {
        const yOffset = -80;
        const y = topContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }, [safeStepIdx]);

  const wolfVictim = players.find(p => p.id === nightState.wolfTargetId);

  return (
    <div 
      ref={topContainerRef}
      className="space-y-6 max-w-5xl w-full mx-auto"
    >
      {/* Top Header & Round Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-white/10 pb-3 sm:pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
              isWolfStep 
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' 
                : 'bg-indigo-950 text-indigo-300 border-indigo-800'
            }`}>
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              Đêm {roundNumber}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400">
              Bước {safeStepIdx + 1} / {nightSteps.length}
            </span>
          </div>
        </div>

        {/* Navigation buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <GothicButton
            variant="dark"
            size="sm"
            disabled={safeStepIdx === 0}
            onClick={handlePrevStep}
            icon={ChevronLeft}
            aria-label="Bước trước"
          >
            Trước
          </GothicButton>
          
          <GothicButton
            variant={isSummaryStep ? 'gold' : isWolfStep ? 'blood' : 'witch'}
            size="sm"
            disabled={!stepValidation.isValid}
            onClick={() => handleNextStep(false)}
            title={!stepValidation.isValid ? stepValidation.message : ''}
            aria-label={isSummaryStep ? 'Bật trời sáng' : 'Đi ngủ (chuyển bước)'}
          >
            <span>{isSummaryStep ? '☀️ BẬT TRỜI SÁNG' : 'Đi Ngủ 💤'}</span>
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </GothicButton>
        </div>
      </div>

      {/* Deck Inventory Radar (auto hides once all roles are assigned) */}
      {!players.every(p => (p.currentRoleId || p.roleId)) && (
        <DeckInventoryRadar
          players={players}
          deckRoleIds={deckRoleIds}
          onAutoAssignVillagers={onAutoAssignVillagers}
          onAssignRole={onAssignRole}
        />
      )}

      {!isSummaryStep ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Night Step Header (Breadcrumb, Hero Card, Assignment Banner, Alert Banners) */}
          <NightStepHeader
            nightSteps={nightSteps}
            safeStepIdx={safeStepIdx}
            currentRole={currentRole}
            isWolfStep={isWolfStep}
            hasHolders={hasHolders}
            isSkipped={isSkipped}
            isRoleCursedOut={isRoleCursedOut}
            cursedHolder={cursedHolder}
            isSilencedByMoon={isCurrentRoleSilencedByMoon}
            stepValidation={stepValidation}
            roleHolders={roleHolders}
            isVillageCursed={isVillageCursed}
            players={players}
            deckRoleIds={deckRoleIds}
            onAssignRole={onAssignRole}
            onAssignRoleToMultiple={onAssignRoleToMultiple}
            onSkipRole={onSkipRole}
            isWolfPlayer={isWolfPlayer}
            changeStep={changeStep}
            showConfirm={showConfirm}
            showAlert={showAlert}
            onSelectSeerTarget={setSelectedSeerTarget}
            onSetShowAssignDropdown={setShowAssignDropdown}
            cardRef={cardRef}
          />

          {/* Step Specific Action Interface */}
          <div className="space-y-4">
            <NightRoleAction
              currentRole={currentRole}
              isWolfStep={isWolfStep}
              players={players}
              alivePlayers={alivePlayers}
              nightState={nightState}
              deckRoleIds={deckRoleIds}
              roundNumber={roundNumber}
              wolfCanKillDouble={wolfCanKillDouble}
              canWolvesKillTeammates={canWolvesKillTeammates}
              canCursedWolfInfect={canCursedWolfInfect}
              wolfVictim={wolfVictim}
              showWolfWhisper={showWolfWhisper}
              setShowWolfWhisper={setShowWolfWhisper}
              wolfLogs={wolfLogs}
              setWolfLogs={setWolfLogs}
              selectedSeerTarget={selectedSeerTarget}
              setSelectedSeerTarget={setSelectedSeerTarget}
              onSaveAction={onSaveAction}
              onAssignRole={onAssignRole}
              onAssignRoleToMultiple={onAssignRoleToMultiple}
              isWolfPlayer={isWolfPlayer}
              showConfirm={showConfirm}
            />
          </div>

          {/* GM Override Button (Optional & non-intrusive) */}
          <div className="space-y-3 pt-2 pb-24 sm:pb-6">
            {!stepValidation.isValid && !stepValidation.isStrictBlock && (
              <div className="flex items-center justify-end animate-fade-in pr-1">
                <button
                  type="button"
                  onClick={() => {
                    showConfirm({
                      title: 'QUẢN TRÒ BỎ QUA BƯỚC NÀY?',
                      message: `Bạn đang chọn ghi đè bỏ qua lượt của vai "${currentRole?.name || 'này'}".\n\nBạn có chắc chắn muốn bỏ qua và chuyển sang bước tiếp theo?`,
                      variant: 'warning',
                      confirmText: 'Bỏ Qua & Đi Tiếp ➔',
                      cancelText: 'Quay Lại',
                      onConfirm: () => {
                        if (onSkipRole && currentRole) onSkipRole(currentRole.id);
                        handleNextStep(true);
                      }
                    });
                  }}
                  className="text-xs font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50"
                >
                  <span>Bỏ qua bước này (Quản trò ghi đè)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Summary Step: Ready for Dawn */
        <NightSummaryStep
          roundNumber={roundNumber}
          players={players}
          nightState={nightState}
          onAdvanceToDay={onAdvanceToDay}
        />
      )}

      {/* Sticky Bottom Navigation Bar */}
      {!isSummaryStep && (
        <NightStickyFooter
          safeStepIdx={safeStepIdx}
          isWolfStep={isWolfStep}
          stepValidation={stepValidation}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
        />
      )}
    </div>
  );
}
