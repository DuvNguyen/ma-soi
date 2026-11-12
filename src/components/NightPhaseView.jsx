import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Eye, Skull, Sparkles, Heart, ChevronRight, ChevronLeft, ArrowRight,
  Sun, Moon, Check, UserCheck, AlertTriangle, AlertCircle, Wand2, Ghost, Flame, MoonStar, X 
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import WolfWhisperBox from './WolfWhisperBox';
import RoleHolderBanner from './RoleHolderBanner';
import RoleClaimBox from './RoleClaimBox';
import DeckInventoryRadar from './DeckInventoryRadar';
import PlayerSeatPicker from './PlayerSeatPicker';
import { getRoleCapacity } from '../utils/deckUtils';
import { useGothicDialog } from '../context/GothicDialogContext';
import { isWolfPlayer, getPlayerRole, getPlayerOriginalRole, getRole, WOLF_ROLE_IDS } from '../utils/roleUtils';
import { Player } from '../domain/models/Player.js';
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
  const originalFooterRef = useRef(null);
  const isInitialMount = useRef(true);
  const prevStepIdxRef = useRef(null);
  const [isOriginalFooterVisible, setIsOriginalFooterVisible] = useState(false);

  // Sort roles according to canonical night wake-up order
  const getOrderedNightRoles = () => {
    // Standard night order priorities matching official rulebook
    const orderPriority = {
      'nguyet-nu': 0.5,
      'cho-soi-soi-lai': 0.8,
      'an-trom': 1,
      'cupid': 2,
      'hai-chi-em': 2.1,
      'ba-anh-em': 2.2,
      'anh-tu': 2.5,
      'dua-tre-hoang-da': 3,
      'nua-nguoi-nua-soi': 3.1,
      'thang-ngoc': 3.2,
      'dien-vien': 3.5,
      'ba-dong': 3.6,
      'bao-ve': 4,
      'nguoi-mua-roi': 4.8,
      'nguoi-cha-cua-soi': 4.9,
      'soi-quy': 4.9,
      'soi-thuong': 5,
      'soi-con': 5.1,
      'soi-lon-xau-xa': 5.2,
      'soi-trang': 5.3,
      'cao-lua': 5.4,
      'tien-tri': 6,
      'cao': 6.1,
      'thay-thoi-mien': 6.5,
      'phu-thuy': 7,
      'duoc-si': 7.5,
      'sat-thu': 7.6,
      'nguoi-thoi-sao': 8,
      'ke-dot-nha': 8.1,
      'con-qua': 9,
      'con-qua-plus': 9.1,
      'nguoi-goi-hon': 10
    };

    // Filter roles that actually wake up during this night
    const activeRoles = rolesInGame.filter(r => {
      // Night 1 only roles (Nửa Người Nửa Sói & Thằng Ngố chỉ gọi nhận diện Đêm 1, từ Đêm 2 không gọi nữa)
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai', 'cho-soi-soi-lai', 'ba-anh-em', 'nua-nguoi-nua-soi', 'thang-ngoc'].includes(r.id) && roundNumber > 1) {
        return false;
      }
      // Cáo nếu đã quét nhóm không có sói thì mất vĩnh viễn năng lực
      if (r.id === 'cao' && nightState?.foxLostPower) {
        return false;
      }
      // Roles that do not wake up at night (Day only, passive, or event-driven)
      if ([
        'dan-lang', 'dan-thuong', 'tho-san', 'gia-lang', 'canh-sat-truong', 
        'nguoi-the-than', 'oan-nhan', 'nguoi-day-to-tan-tuy', 'hiep-si-gia', 'ky-si', 
        'thien-su', 'thien-than', 'bo-lao', 'thang-mo', 'nguoi-thuan-phuc-gau', 'than-gau',
        'co-be', 'canh-sat-characters', 'ki-si', 'thanh-vien-giao-phai'
      ].includes(r.id)) {
        return false;
      }
      return true;
    });

    // Group all werewolf variants into a single unified step if multiple wolf cards exist
    const wolfVariants = ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'nguoi-cha-cua-soi', 'soi-quy'];
    const nonWolfRoles = activeRoles.filter(r => !wolfVariants.includes(r.id) && r.id !== 'soi-trang');
    const hasAnyWolves = activeRoles.some(r => wolfVariants.includes(r.id) || r.id === 'soi-trang');

    let finalRoles = [...nonWolfRoles];
    if (hasAnyWolves) {
      finalRoles.push({
        id: 'soi-thuong',
        name: 'Bầy Ma Sói (Săn Mồi)',
        enName: 'Werewolf Pack',
        teamCode: 'W',
        team: 'Phe Sói',
        shortDesc: 'Toàn bộ bầy Sói mở mắt nhận diện nhau và thống nhất cắn người.',
        gmCall: 'Ma Sói thức dậy. Hãy nhận diện đồng bọn và chọn con mồi đêm nay.',
        image: '/cards/la-bai-ma-soi.jpg'
      });
    }

    // Sói Trắng thức dậy riêng vào các đêm chẵn (Đêm 2, 4, 6...) sau khi bầy Sói đi ngủ
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

    // Append summary step at the end
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

  // Khôi phục bước gọi đêm chính xác nếu F5 / reload
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

  // Đảm bảo không vượt quá độ dài nightSteps
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
  const isWolfStep = ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'nguoi-cha-cua-soi', 'soi-quy'].includes(currentRole.id);
  const isSummaryStep = currentRole.id === 'night-summary';

  // Players assigned to this role
  const assignedPlayers = players.filter(p => (p.currentRoleId || p.roleId) === currentRole.id);
  const alivePlayers = players.filter(p => p.isAlive);

  // Actions state local helpers
  const [selectedSeerTarget, setSelectedSeerTarget] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showWolfWhisper, setShowWolfWhisper] = useState(false);

  // STRICT GATEKEEPER VALIDATION
  const isSkipped = (nightState?.skippedRoles || []).includes(currentRole?.id);
  const roleHolders = isWolfStep ? players.filter(isWolfPlayer) : players.filter(p => (p.currentRoleId || p.roleId) === currentRole?.id);
  const hasHolders = roleHolders.length > 0;

  // Người giữ vai ban đầu đã bị Sói Nguyền lây nhiễm thành Ma Sói (vai trò bị loại khỏi làng)
  const cursedHolder = !isWolfStep && players.find(p => p.isCursedWolf && p.originalRoleId === currentRole?.id);
  const isRoleCursedOut = Boolean(cursedHolder) && !hasHolders;

  const WOLF_ROLE_IDS = [
    'soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang', 
    'nguoi-cha-cua-soi', 'soi-quy', 'soi-lua', 'anh-em-soi'
  ];
  const maxWolves = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const currentWolves = players.filter(isWolfPlayer);

  // Điều kiện kích hoạt Sói Nguyền (Sói Quỷ): Phải có trong bộ bài, còn sống và chưa dùng
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

    // Strict Rule: WEREWOLVES CANNOT BE SKIPPED UNDER ANY CIRCUMSTANCES
    if (isWolfStep) {
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

    // If role is skipped by moderator: allow pass
    if (isSkipped) {
      return { 
        isValid: true, 
        message: `Quản trò đã bỏ qua vai ${shortRoleName}`,
        shortMessage: 'Đã bỏ qua vai ✓'
      };
    }

    // If role has assigned players and all living holders are dead, allow auto-skip
    const hasLivingHolders = roleHolders.some(p => p.isAlive);
    if (roleHolders.length > 0 && !hasLivingHolders) {
      return { 
        isValid: true, 
        isDeadRole: true, 
        message: 'Người giữ vai này đã chết ➔ Có thể bỏ qua',
        shortMessage: 'Người giữ vai đã chết'
      };
    }

    // If role has been eliminated due to original holder being cursed into a werewolf
    if (isRoleCursedOut) {
      return { 
        isValid: true, 
        isCursedRole: true, 
        message: `Vai ${shortRoleName} đã bị loại do người chơi #${cursedHolder.id} (${cursedHolder.name}) bị nguyền thành Sói. Quản trò gọi tên giả vờ theo kịch bản rồi bấm Đi Ngủ.`,
        shortMessage: 'Vai đã bị loại do lời nguyền ✓'
      };
    }

    // If no holders assigned yet: require assignment or skip
    if (!hasHolders) {
      return { 
        isValid: false, 
        message: `Chưa gán ai là ${shortRoleName}! Chạm số ghế người chơi để gán.`,
        shortMessage: `Chưa gán vai ${shortRoleName}`
      };
    }

    switch (currentRole.id) {
      case 'cupid': {
        const count = (nightState.cupidChosenIds || []).length;
        if (count !== 2) {
          return { 
            isValid: false, 
            message: `Bắt buộc chọn đúng 2 người yêu nhau (${count}/2)`,
            shortMessage: `Chọn cặp đôi (${count}/2)`
          };
        }
        return { 
          isValid: true, 
          message: 'Đã ghép đôi 2 người',
          shortMessage: 'Đã ghép đôi ✓'
        };
      }

      case 'bao-ve': {
        if (!nightState.protectedPlayerId && !nightState.protectSkipped) {
          return { 
            isValid: false, 
            message: 'Vui lòng chọn 1 người để bảo vệ hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn bảo vệ'
          };
        }
        if (nightState.protectedPlayerId && nightState.protectedPlayerId === nightState.lastNightProtectedId) {
          return { 
            isValid: false, 
            message: 'Không được bảo vệ người này 2 đêm liên tiếp!',
            shortMessage: 'Trùng đêm trước!'
          };
        }
        return { 
          isValid: true, 
          message: 'Đã chọn người bảo vệ',
          shortMessage: 'Đã bảo vệ ✓'
        };
      }

      case 'tien-tri': {
        return { 
          isValid: true, 
          message: 'Chạm vào người chơi để xem lá bài & ra dấu cho Tiên Tri',
          shortMessage: 'Chạm để xem bài'
        };
      }

      case 'soi-thuong': {
        if (nightState.wolfTargetId === null && !nightState.wolfSkipped) {
          return { 
            isValid: false, 
            message: 'Bầy Sói phải chọn 1 con mồi hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn mục tiêu cắn'
          };
        }
        return { 
          isValid: true, 
          message: 'Bầy Sói đã chọn mục tiêu',
          shortMessage: 'Đã chọn mục tiêu ✓'
        };
      }

      case 'dua-tre-hoang-da': {
        if (!nightState.wildChildIdolId) {
          return { 
            isValid: false, 
            message: 'Đứa Trẻ Hoang Dã bắt buộc chọn 1 Thần Tượng',
            shortMessage: 'Chưa chọn Thần Tượng'
          };
        }
        return { 
          isValid: true, 
          message: 'Đã chọn Thần Tượng',
          shortMessage: 'Đã chọn Thần Tượng ✓'
        };
      }

      case 'anh-tu': {
        if (!nightState.shadowHostId) {
          return {
            isValid: false,
            message: 'Ảnh Tử bắt buộc chọn 1 Bản Thể (chủ thể)',
            shortMessage: 'Chưa chọn Bản Thể'
          };
        }
        return {
          isValid: true,
          message: 'Đã chọn Bản Thể',
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
        if (!nightState.foxCheckedThisNight && !nightState.foxSkipped) {
          return {
            isValid: false,
            message: 'Cáo phải chọn 1 tâm điểm kiểm tra hoặc bấm Bỏ qua',
            shortMessage: 'Chưa chọn tâm điểm'
          };
        }
        return {
          isValid: true,
          message: 'Cáo đã kiểm tra nhóm 3 người',
          shortMessage: 'Đã quét xong ✓'
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

      default:
        return { isValid: true, message: '', shortMessage: '' };
    }
  };

  const stepValidation = getStepValidationState();
  const isDeadRole = Boolean(stepValidation.isDeadRole);

  // Advance to next step with strict validation
  const handleNextStep = (force = false) => {
    // If strict block (e.g. werewolves not assigned enough), NEVER allow skip or bypass!
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

  // Smooth auto-scroll to Tarot Card when advancing or rewinding role steps (skip initial mount & tab switches)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStepIdxRef.current = safeStepIdx;
      return;
    }

    if (prevStepIdxRef.current !== safeStepIdx) {
      prevStepIdxRef.current = safeStepIdx;
      if (cardRef.current) {
        const yOffset = -90; // offset for sticky top header
        const y = cardRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      } else if (topContainerRef.current) {
        const yOffset = -80;
        const y = topContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }, [safeStepIdx]);

  // Observer to track if the bottom original navigation footer is in viewport
  useEffect(() => {
    const el = originalFooterRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOriginalFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [safeStepIdx]);

  const showFloatingAdvanceButton = 
    !isSummaryStep && 
    stepValidation.isValid && 
    !isOriginalFooterVisible;

  // Victim of wolves tonight
  const wolfVictim = players.find(p => p.id === nightState.wolfTargetId);
  const protectedPlayer = players.find(p => p.id === nightState.protectedPlayerId);

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

        {/* Navigation buttons - Hidden on mobile because of sticky bottom nav bar */}
        <div className="hidden sm:flex items-center gap-2">
          <GothicButton
            variant="dark"
            size="sm"
            disabled={safeStepIdx === 0}
            onClick={handlePrevStep}
            icon={ChevronLeft}
          >
            Trước
          </GothicButton>
          
          <GothicButton
            variant={isSummaryStep ? 'gold' : isWolfStep ? 'blood' : 'witch'}
            size="sm"
            disabled={!stepValidation.isValid}
            onClick={() => handleNextStep(false)}
            title={!stepValidation.isValid ? stepValidation.message : ''}
          >
            <span>{isSummaryStep ? '☀️ BẬT TRỜI SÁNG' : 'Đi Ngủ 💤'}</span>
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </GothicButton>
        </div>
      </div>

      {/* DECK INVENTORY RADAR (TRACK REMAINING CARDS IN DECK - AUTO HIDES ONCE ALL ROLES ARE ASSIGNED) */}
      {!players.every(p => (p.currentRoleId || p.roleId)) && (
        <DeckInventoryRadar
          players={players}
          deckRoleIds={deckRoleIds}
          onAutoAssignVillagers={onAutoAssignVillagers}
          onAssignRole={onAssignRole}
        />
      )}

      {/* Stepper Progress Bar (Breadcrumbs) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {nightSteps.map((step, idx) => {
            const isCurrent = idx === safeStepIdx;
            const isPassed = idx < safeStepIdx;
            const isStepWolf = step.teamCode === 'W';
            return (
              <button
                key={`${step.id}-${idx}`}
                onClick={() => {
                  if (idx > safeStepIdx && !stepValidation.isValid) {
                    if (stepValidation.isStrictBlock) {
                      showAlert({
                        title: 'BẮT BUỘC GÁN ĐỦ MA SÓI!',
                        message: stepValidation.message,
                        variant: 'danger',
                        confirmText: 'Đã Hiểu & Đi Chọn Sói'
                      });
                      return;
                    }

                    showConfirm({
                      title: 'BỎ QUA BƯỚC ĐÊM BẮT BUỘC?',
                      message: `Bước hiện tại chưa hoàn thành:\n"${stepValidation.message}"\n\nBạn có chắc muốn bỏ qua để nhảy thẳng sang bước tiếp theo?`,
                      variant: 'warning',
                      confirmText: 'Bỏ Qua & Nhảy Bước',
                      cancelText: 'Ở Lại Hoàn Thành',
                      onConfirm: () => {
                        changeStep(idx);
                        setSelectedSeerTarget(null);
                        setShowAssignDropdown(false);
                      }
                    });
                    return;
                  }
                  changeStep(idx);
                  setSelectedSeerTarget(null);
                  setShowAssignDropdown(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isCurrent
                    ? isStepWolf
                      ? 'bg-gradient-to-r from-rose-900 to-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.5)] ring-1 ring-rose-400'
                      : 'bg-gradient-to-r from-purple-900 to-purple-950 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                    : isPassed
                    ? 'bg-[#0f111c] border-emerald-900/70 text-emerald-400'
                    : 'bg-[#0c0d16]/70 border-slate-800/80 text-slate-500 hover:text-slate-300'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span>{idx + 1}.</span>}
                <span className="truncate max-w-[120px]">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GUIDED CARD HERO AREA */}
      {!isSummaryStep ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Compact Hero Banner for current role */}
          <div className={`p-3 sm:p-4 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-between gap-3 backdrop-blur-sm ${
            isWolfStep
              ? 'bg-gradient-to-r from-[#2a0509]/85 via-[#150204]/80 to-[#250408]/85 border-rose-600/90 shadow-[0_0_25px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50'
              : 'bg-gradient-to-r from-[#170a2c]/80 via-[#0d0e19]/75 to-[#120822]/80 border-purple-900/70 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
          }`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Compact Card Thumbnail */}
              <div ref={cardRef} className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl overflow-hidden border p-1 shadow-lg flex items-center justify-center bg-black/80 shrink-0 ${
                isWolfStep ? 'border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'border-purple-500/80 shadow-[0_0_12px_rgba(147,51,234,0.4)]'
              }`}>
                {currentRole.image ? (
                  <img
                    src={currentRole.image}
                    alt={currentRole.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-2xl flex items-center justify-center">
                    {isWolfStep ? <WolfIcon className="w-8 h-8 text-rose-500" /> : '✨'}
                  </div>
                )}
              </div>

              {/* Role Title + Team Badge + GM Prompt */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-base sm:text-lg md:text-xl font-black font-cinzel leading-tight tracking-wider truncate ${
                    isWolfStep ? 'text-rose-100 drop-shadow-[0_1px_10px_rgba(225,29,72,0.7)]' : 'text-slate-100'
                  }`}>
                    {currentRole.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border uppercase tracking-wider shrink-0 ${
                    isWolfStep ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-purple-950 text-purple-300 border-purple-700'
                  }`}>
                    [{currentRole.teamCode}] {currentRole.team}
                  </span>
                </div>
                {currentRole.gmCall && (
                  <p className="text-[11px] sm:text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                    "{currentRole.gmCall}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GIAO DIỆN GÁN VAI TINH GỌN (HÌNH 4: DÙNG ROLE HOLDER BANNER TỰ MỞ KHI CHƯA GÁN) */}
          {isWolfStep && !hasHolders && !isSkipped ? (
            <RoleClaimBox
              currentRole={currentRole}
              players={players}
              deckRoleIds={deckRoleIds}
              onAssignRole={onAssignRole}
              onAssignRoleToMultiple={onAssignRoleToMultiple}
              onSkipRole={null}
              isWolfStep={isWolfStep}
              isWolfPlayer={isWolfPlayer}
            />
          ) : (
            <RoleHolderBanner
              currentRole={currentRole}
              players={players}
              deckRoleIds={deckRoleIds}
              onAssignRole={onAssignRole}
              onSkipRole={isWolfStep ? null : onSkipRole}
              isWolfStep={isWolfStep}
              isWolfPlayer={isWolfPlayer}
            />
          )}

          {/* STEP SPECIFIC ACTION INTERFACE */}
          <div className="space-y-4">
            
            {/* LỜI NGUYỀN GIÀ LÀNG BANNER NẾU BỊ PHE DÂN HẠI */}
            {isVillageCursed && ['bao-ve', 'tien-tri', 'phu-thuy'].includes(currentRole.id) && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-red-950 to-rose-950 border-2 border-red-500 text-white shadow-xl space-y-1 mb-2 animate-pulse">
                <div className="font-cinzel font-black text-xs sm:text-sm flex items-center gap-2 text-rose-200">
                  <span>⚡ LỜI NGUYỀN CỦA GIÀ LÀNG ĐANG GIÁNG XUỐNG!</span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-200/90 leading-relaxed">
                  Già Làng đã bị chính phe Dân sát hại! Toàn bộ năng lực đặc biệt của vai này đã bị phong ấn vĩnh viễn. Quản trò không thực hiện hành động đêm và bấm <strong>Đi Ngủ 💤</strong> để chuyển tiếp.
                </p>
              </div>
            )}

            {/* VAI TRÒ ĐÃ BỊ LOẠI DO BỊ SÓI NGUYỀN ĐỒNG HÓA */}
            {isRoleCursedOut ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#230933] to-[#140620] border-2 border-purple-500/80 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)] space-y-3 animate-fade-in">
                <div className="flex items-center gap-2.5 font-cinzel font-black text-sm sm:text-base text-purple-100">
                  <span className="text-xl">🔮⚡</span>
                  <span>VAI TRÒ ĐÃ BỊ LOẠI KHỎI LÀNG (TRÚNG LỜI NGUYỀN)</span>
                </div>
                <div className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                  Người giữ vai ban đầu là <strong className="text-white">#{cursedHolder.id} {cursedHolder.name}</strong> đã bị Sói Nguyền đồng hóa thành <strong className="text-rose-300">Ma Sói ({currentRole.name} bị nguyền)</strong>. Toàn bộ năng lực của vai này đã bị loại bỏ vĩnh viễn và không gán cho người khác theo luật chơi.
                </div>
                <div className="p-3 rounded-xl bg-purple-950/90 border border-purple-700/60 text-xs text-amber-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">💡</span>
                  <div className="leading-relaxed">
                    <strong>Hướng dẫn Quản trò:</strong> Vẫn đọc to câu gọi <em>"{currentRole.gmCall}"</em> và đếm thầm 3-5 giây để giữ kín bí mật rằng vai này đã biến mất, sau đó bấm <strong>Đã Gọi Xong & Cho Đi Ngủ 💤</strong> bên dưới để tiếp tục.
                  </div>
                </div>

                <div className="pt-2">
                  <GothicButton
                    variant="gold"
                    size="md"
                    onClick={() => handleNextStep(false)}
                    className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Đã Gọi Xong & Cho Đi Ngủ 💤</span>
                    <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                  </GothicButton>
                </div>
              </div>
            ) : stepValidation.isDeadRole ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#1c0e1e] to-[#120817] border-2 border-rose-500/60 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.25)] space-y-3 animate-fade-in">
                <div className="flex items-center gap-2.5 font-cinzel font-black text-sm sm:text-base text-rose-300">
                  <span className="text-xl">💀💤</span>
                  <span>NGƯỜI GIỮ VAI ĐÃ HY SINH (GỌI CÓ LỆ THEO KỊCH BẢN)</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Người chơi giữ vai <strong className="text-white">{currentRole.name}</strong> ({roleHolders.map(p => `#${p.id} ${p.name}`).join(', ')}) đã qua đời. Theo luật Ma Sói, vai trò này <strong>không được thực hiện chức năng nữa</strong>.
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-amber-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">💡</span>
                  <div className="leading-relaxed">
                    <strong>Hướng dẫn Quản trò:</strong> Vẫn đọc to câu gọi <em>"{currentRole.gmCall}"</em> và đếm thầm 3-5 giây để dân làng không đoán được ai đã chết, sau đó bấm <strong>Đã Gọi Xong & Cho Đi Ngủ 💤</strong> bên dưới để tiếp tục.
                  </div>
                </div>

                <div className="pt-2">
                  <GothicButton
                    variant="gold"
                    size="md"
                    onClick={() => handleNextStep(false)}
                    className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Đã Gọi Xong & Cho Đi Ngủ 💤</span>
                    <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                  </GothicButton>
                </div>
              </div>
            ) : (
              <>
            {/* 1. BẢO VỆ ACTION - SEAT MATRIX LAYOUT */}
            {currentRole.id === 'bao-ve' && (() => {
              const protectedP = players.find(x => x.id === nightState.protectedPlayerId);
              const lastNightP = players.find(x => x.id === nightState.lastNightProtectedId);
              const isProtected = nightState.protectedPlayerId && !nightState.protectSkipped;

              // Người giữ vai Bảo Vệ được ưu tiên đứng ở vị trí đầu tiên (#1) trong ma trận ghế
              const bodyguardPlayers = alivePlayers.filter(p => (p.currentRoleId || p.roleId) === 'bao-ve' || getPlayerRole(p)?.id === 'bao-ve');
              const otherPlayers = alivePlayers.filter(p => !bodyguardPlayers.some(bg => bg.id === p.id));
              const sortedProtectPlayers = [...bodyguardPlayers, ...otherPlayers];

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-sm text-teal-200 font-cinzel">
                      CHỌN 1 NGƯỜI ĐỂ BẢO VỆ ĐÊM NAY:
                    </h4>
                  </div>

                  {/* Summary Box of Protection */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-[#0e2a26] to-[#0a1816] border border-teal-600/70 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                        Mục tiêu bảo vệ ({isProtected ? '1/1' : nightState.protectSkipped ? 'Bỏ qua' : '0/1'}):
                      </span>
                      {isProtected ? (
                        <span className="text-xs font-bold text-teal-300 flex items-center gap-1 animate-pulse">
                          🛡️ Đã chọn người bảo vệ
                        </span>
                      ) : nightState.protectSkipped ? (
                        <span className="text-xs font-bold text-amber-300">
                          🚫 Đêm nay không bảo vệ ai
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          (Chạm số ghế người chơi bên dưới)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-teal-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-teal-400">Đêm nay bảo vệ</div>
                          <div className="font-bold text-sm text-white">
                            {isProtected ? `${protectedP?.name} (#${protectedP?.id})` : nightState.protectSkipped ? 'Không bảo vệ ai' : 'Chưa chọn'}
                          </div>
                        </div>
                        {isProtected && <Shield className="w-5 h-5 text-teal-400 fill-teal-400 animate-bounce" />}
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Đêm trước đã bảo vệ</div>
                          <div className="font-bold text-xs text-slate-300">
                            {lastNightP ? `${lastNightP.name} (#${lastNightP.id})` : 'Chưa có'}
                          </div>
                        </div>
                        {lastNightP && <span className="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">Bị cấm</span>}
                      </div>
                    </div>
                  </div>

                  {/* Seat Picker for Bodyguard (Bodyguard player placed first) */}
                  <PlayerSeatPicker
                    players={sortedProtectPlayers}
                    selectedIds={isProtected ? [nightState.protectedPlayerId] : []}
                    disabledIds={nightState.lastNightProtectedId ? [nightState.lastNightProtectedId] : []}
                    onSelect={(id) => {
                      if (nightState.protectedPlayerId === id && !nightState.protectSkipped) {
                        onSaveAction('protect', null, { protectSkipped: false });
                      } else {
                        onSaveAction('protect', id, { protectSkipped: false });
                      }
                    }}
                    maxSelect={1}
                    variant="protect"
                    isWolfPlayer={isWolfPlayer}
                  />

                  {/* Action Buttons Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onSaveAction('protect', null, { protectSkipped: true })}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.protectSkipped
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🚫 Đêm Nay Không Bảo Vệ Ai
                    </button>

                    {(nightState.protectedPlayerId || nightState.protectSkipped) && (
                      <button
                        type="button"
                        onClick={() => onSaveAction('protect', null, { protectSkipped: false })}
                        className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                      >
                        ✕ Xóa chọn lại
                      </button>
                    )}
                  </div>

                  {/* Inline Quick Advance Button when chosen */}
                  {(nightState.protectedPlayerId || nightState.protectSkipped) && (
                    <div className="pt-2 animate-fade-in">
                      <GothicButton
                        variant="witch"
                        size="md"
                        onClick={() => handleNextStep(false)}
                        className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <span>Xác Nhận & Đi Ngủ 💤</span>
                        <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                      </GothicButton>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. BẦY MA SÓI CẮN NGƯỜI (CRIMSON DANGER ZONE) */}
            {isWolfStep && (
              <div className="space-y-4">
                {/* Collapsible Secret Hand-off Accordion Toggle (Clean & unobtrusive) */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-rose-950/60 via-[#180306] to-[#100103] border border-rose-900/60 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">🤫</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-rose-200 truncate">
                        Chuyền máy bí mật cho bầy Sói
                      </div>
                      <div className="text-[10px] text-rose-400/80 truncate">
                        {showWolfWhisper ? 'Đang mở chế độ chuyền máy' : 'Dùng khi chơi trong im lặng (không mở mắt cùng nhau)'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowWolfWhisper(prev => !prev)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/80 transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>{showWolfWhisper ? 'Thu Gọn ▲' : 'Mở Chuyền Máy ▼'}</span>
                  </button>
                </div>

                {/* Secret Wolf Hand-off Box - Only rendered when user wants it */}
                {showWolfWhisper && (
                  <WolfWhisperBox
                    players={players}
                    nightState={nightState}
                    onSaveAction={onSaveAction}
                  />
                )}

                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-rose-500 animate-bounce" />
                    <h4 className="font-bold text-sm text-rose-300 font-cinzel">
                      QUẢN TRÒ CHỌN MỤC TIÊU BẦY SÓI CẮN:
                    </h4>
                  </div>

                  {/* Summary Box of Wolf Hunt - Red Rose Theme */}
                  {(() => {
                    const target1 = players.find(p => p.id === nightState.wolfTargetId);
                    const target2 = players.find(p => p.id === nightState.wolfTargetId2);
                    const hasTarget = (target1 || target2) && !nightState.wolfSkipped;
                    const selectedWolfTargets = [nightState.wolfTargetId, nightState.wolfTargetId2].filter(Boolean);

                    return (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#26050a] to-[#140205] border border-rose-600/80 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                            Con mồi đêm nay ({hasTarget ? `${selectedWolfTargets.length}/${wolfCanKillDouble ? 2 : 1}` : nightState.wolfSkipped ? 'Không cắn' : `0/${wolfCanKillDouble ? 2 : 1}`}):
                          </span>
                          {hasTarget ? (
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 animate-pulse">
                              🩸 Đã chọn mục tiêu cắn
                            </span>
                          ) : nightState.wolfSkipped ? (
                            <span className="text-xs font-bold text-amber-300">
                              🚫 Bầy Sói không cắn ai
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              (Chạm số ghế con mồi bên dưới)
                            </span>
                          )}
                        </div>

                        <div className={`grid gap-2 ${wolfCanKillDouble ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          <div className="p-2.5 rounded-xl bg-black/50 border border-rose-700/60 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-rose-400">
                                {wolfCanKillDouble ? 'Mục tiêu 1' : 'Con mồi bị cắn'}
                              </div>
                              <div className="font-bold text-sm text-white">
                                {target1 && !nightState.wolfSkipped ? `${target1.name} (#${target1.id})` : nightState.wolfSkipped ? 'Bầy Sói không cắn ai' : 'Chưa chọn'}
                              </div>
                            </div>
                            {target1 && !nightState.wolfSkipped && <Skull className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />}
                          </div>

                          {wolfCanKillDouble && (
                            <div className="p-2.5 rounded-xl bg-black/50 border border-rose-700/60 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] uppercase font-bold text-rose-400">Mục tiêu 2 (Cuồng nộ)</div>
                                <div className="font-bold text-sm text-white">
                                  {target2 && !nightState.wolfSkipped ? `${target2.name} (#${target2.id})` : 'Chưa chọn'}
                                </div>
                              </div>
                              {target2 && !nightState.wolfSkipped && <Skull className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />}
                            </div>
                          )}
                        </div>

                        {/* BÁN SÓI BỊ CẮN BANNER */}
                        {target1 && (target1.currentRoleId === 'nua-nguoi-nua-soi' || target1.roleId === 'nua-nguoi-nua-soi') && !nightState.wolfSkipped && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/80 text-xs text-purple-200 flex items-center gap-2 animate-fade-in shadow-md">
                            <span className="text-base shrink-0">🐺⚡</span>
                            <span><strong>Bán Sói (Nửa Người Nửa Sói)</strong> bị cắn: Sẽ không chết sáng mai mà lập tức thức tỉnh gen Sói, trở thành Ma Sói! (Tiên Tri soi đêm nay sẽ ra Sói).</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* SÓI CUỒNG NỘ (SÓI CON CHẾT) BANNER */}
                  {wolfCanKillDouble && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950 via-red-900/60 to-rose-950 border border-rose-500 text-rose-200 shadow-md flex items-center gap-2.5 animate-pulse">
                      <WolfIcon className="w-6 h-6 shrink-0 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider text-rose-100 font-cinzel">BẦY SÓI CUỒNG NỘ: ĐƯỢC CẮN 2 NẠN NHÂN</div>
                        <div className="text-[11px] text-rose-300">Do Sói Con đã tử trận, bầy Sói được chọn 2 con mồi khác nhau đêm nay.</div>
                      </div>
                    </div>
                  )}

                  {/* Banner when a player has been converted into a Werewolf via Sói Nguyền */}
                  {nightState.lastCursedVictimId && (() => {
                    const cursedP = players.find(p => p.id === nightState.lastCursedVictimId);
                    const origRole = getPlayerOriginalRole(cursedP);
                    return (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#260736] to-[#160421] border border-purple-500/80 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-fade-in">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-400 flex items-center justify-center text-sm shrink-0">
                            🔮
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>Đã nguyền {cursedP?.name} thành Ma Sói</span>
                              <span className="text-[10px] text-amber-300 font-normal">({origRole?.name || 'Chưa lộ vai'})</span>
                            </div>
                            <div className="text-[11px] text-purple-300/80">
                              Bầy Sói chọn tiếp 1 người bên dưới để cắn.
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSaveAction('undo_curse_convert', nightState.lastCursedVictimId)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-900 hover:bg-purple-800 border border-purple-500 text-purple-200 transition-all cursor-pointer self-end sm:self-auto shrink-0 shadow-sm"
                          title="Bấm để hủy nguyền và trả lại vai ban đầu nếu bấm nhầm"
                        >
                          ↩ Hoàn tác nguyền
                        </button>
                      </div>
                    );
                  })()}

                  {/* SÓI CẮN ĐỒNG LOẠI BADGE NẾU BẬT RULE */}
                  {canWolvesKillTeammates && (
                    <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/60 border border-purple-600 text-purple-200 text-xs flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>🐺⚡</span>
                        <span>Đã bật luật: Ma Sói có thể cắn chính đồng loại</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900 border border-purple-500 font-mono text-purple-200">
                        Cắn tự do
                      </span>
                    </div>
                  )}

                  {/* Seat Picker for Werewolves (Seat Matrix / Slider) */}
                  <PlayerSeatPicker
                    players={alivePlayers}
                    selectedIds={!nightState.wolfSkipped ? [nightState.wolfTargetId, nightState.wolfTargetId2].filter(Boolean) : []}
                    disabledIds={canWolvesKillTeammates ? [] : alivePlayers.filter(isWolfPlayer).map(p => p.id)}
                    onSelect={(id) => {
                      const isWolf = isWolfPlayer(players.find(p => p.id === id));
                      if (isWolf && !canWolvesKillTeammates) return;

                      if (!wolfCanKillDouble) {
                        if (nightState.wolfTargetId === id && !nightState.wolfSkipped) {
                          onSaveAction('wolves', null, { wolfSkipped: false });
                        } else {
                          onSaveAction('wolves', id, { wolfSkipped: false });
                        }
                        return;
                      }

                      // Logic chọn 2 mục tiêu khi Sói Con chết
                      if (nightState.wolfTargetId === id) {
                        onSaveAction('wolves', null, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
                      } else if (nightState.wolfTargetId2 === id) {
                        onSaveAction('wolves_second', null);
                      } else if (!nightState.wolfTargetId) {
                        onSaveAction('wolves', id, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
                      } else if (!nightState.wolfTargetId2) {
                        onSaveAction('wolves_second', id);
                      } else {
                        onSaveAction('wolves', id, { wolfTargetId2: nightState.wolfTargetId2, wolfSkipped: false });
                      }
                    }}
                    maxSelect={wolfCanKillDouble ? 2 : 1}
                    variant="wolf"
                    isWolfPlayer={isWolfPlayer}
                  />

                  {/* Action Buttons Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onSaveAction('wolves', null, { wolfSkipped: true })}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.wolfSkipped
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🚫 Đêm Nay Không Cắn Ai
                    </button>

                    {(nightState.wolfTargetId || nightState.wolfTargetId2 || nightState.wolfSkipped) && (
                      <button
                        type="button"
                        onClick={() => {
                          onSaveAction('wolves', null, { wolfSkipped: false });
                          onSaveAction('wolves_second', null);
                        }}
                        className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                      >
                        ✕ Xóa chọn lại
                      </button>
                    )}
                  </div>
                </div>

                {/* SÓI NGUYỀN (NGƯỜI CHA CỦA SÓI) LÂY NHIỄM PANEL - CHỈ HIỆN KHI CÓ SÓI NGUYỀN TRONG BÀI & CÒN SỐNG & CHƯA DÙNG */}
                {wolfVictim && !nightState.wolfSkipped && canCursedWolfInfect && (
                  <div className="p-4 rounded-2xl border transition-all mt-3 bg-gradient-to-r from-[#220736] via-[#160424] to-[#220736] border-purple-600/90 shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border bg-purple-900 border-purple-400 text-purple-200 shadow-md">
                          🔮
                        </div>
                        <div>
                          <div className="font-bold text-sm text-purple-200 flex items-center gap-2">
                            <span>SÓI NGUYỀN (SÓI QUỶ)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-950 text-purple-300 border border-purple-800">
                              1 lần/ván
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Đồng hóa thành Ma Sói (giữ vai gốc). Bầy Sói được chọn cắn tiếp.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSaveAction('curse_convert', wolfVictim.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-300 hover:scale-105 active:scale-95"
                        >
                          <span>🔮 Nguyền thành Sói</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inline Quick Advance for Wolves */}
                {(nightState.wolfTargetId || nightState.wolfSkipped) && (
                  <div className="pt-2 animate-fade-in">
                    <GothicButton
                      variant="blood"
                      size="md"
                      onClick={() => handleNextStep(false)}
                      className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <span>Xác Nhận & Đi Ngủ 💤</span>
                      <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                    </GothicButton>
                  </div>
                )}
              </div>
            )}

            {/* 4. TIÊN TRI SOI (HIỂN THỊ THẺ BÀI NGƯỜI ĐƯỢC CHỌN ĐỂ RA DẤU) */}
            {currentRole.id === 'tien-tri' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-sm text-purple-200 font-cinzel">
                      BẤM VÀO NGƯỜI ĐỂ LẬT THẺ BÀI:
                    </h4>
                  </div>
                </div>

                {/* THE REVEALED CARD OF INSPECTED PLAYER (MINIMALIST & PROMINENT RED X) */}
                {selectedSeerTarget ? (() => {
                  const targetPlayerModel = selectedSeerTarget instanceof Player 
                    ? selectedSeerTarget 
                    : Player.fromJSON(selectedSeerTarget);
                  const targetRole = targetPlayerModel.getRole();
                  const isTargetWolf = targetPlayerModel.getSeerAffiliation(nightState) === 'WOLF';
                  
                  // Bán Sói (Nửa Người Nửa Sói) nếu đã bị bầy Sói cắn trong đêm nay
                  const isBittenHalfWolfTonight = (selectedSeerTarget?.currentRoleId === 'nua-nguoi-nua-soi' || selectedSeerTarget?.roleId === 'nua-nguoi-nua-soi') &&
                    (nightState?.wolfTargetId === selectedSeerTarget?.id || nightState?.wolfTargetId2 === selectedSeerTarget?.id) &&
                    !nightState?.wolfSkipped;

                  return (
                    <div className={`p-4 rounded-2xl border transition-all animate-fade-in flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative ${
                      isTargetWolf
                        ? 'bg-gradient-to-r from-[#3b080c] via-[#200305] to-[#120204] border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.6)]'
                        : 'bg-gradient-to-r from-[#0d1a33] via-[#091224] to-[#050b18] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]'
                    }`}>
                      {/* Big Red X Close Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedSeerTarget(null)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer z-10"
                        title="Đóng thẻ bài"
                      >
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      {/* The Big Card */}
                      <div className="relative shrink-0">
                        <div className={`w-24 h-34 sm:w-28 sm:h-40 rounded-xl overflow-hidden border-2 p-1 shadow-2xl flex items-center justify-center bg-black/90 ${
                          isTargetWolf ? 'border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.8)]' : 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                        }`}>
                          {targetRole?.image ? (
                            <img
                              src={targetRole.image}
                              alt={targetRole.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-4xl flex items-center justify-center">
                              {isTargetWolf ? <WolfIcon className="w-10 h-10" /> : '👨‍🌾'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Info - Clean, direct and minimal */}
                      <div className="flex-1 space-y-2 pr-6">
                        <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                          #{selectedSeerTarget.id} {selectedSeerTarget.name}
                        </div>
                        <h3 className={`text-xl sm:text-2xl font-black font-cinzel ${
                          isTargetWolf ? 'text-rose-100' : 'text-blue-100'
                        }`}>
                          {targetRole?.name || 'Dân Làng'}
                        </h3>

                        {/* Clean Result Badge */}
                        <div className="pt-0.5">
                          {isTargetWolf ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-rose-950/80">
                              <WolfIcon className="w-4 h-4" /> Là Ma Sói
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-blue-950/80">
                              👨‍🌾 Là Dân Làng
                            </span>
                          )}
                        </div>

                        {selectedSeerTarget.isCursedWolf && (
                          <div className="text-[11px] text-purple-300 italic font-medium">
                            (Đã bị Sói Nguyền lây nhiễm thành Sói)
                          </div>
                        )}

                        {isBittenHalfWolfTonight && (
                          <div className="text-[11px] text-rose-300 italic font-medium animate-pulse">
                            (Bán Sói đã bị bầy Sói cắn đêm nay ➔ Đã thức tỉnh thành Ma Sói!)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 text-xs text-purple-300 text-center italic">
                    Chạm vào bất kỳ người chơi nào trong ma trận ghế dưới đây để lật xem thẻ bài của họ.
                  </div>
                )}

                {/* THEATRE SEAT MATRIX / SLIDER PICKER */}
                <PlayerSeatPicker
                  players={alivePlayers}
                  selectedIds={selectedSeerTarget ? [selectedSeerTarget.id] : []}
                  onSelect={(id) => {
                    const target = players.find(x => x.id === id);
                    setSelectedSeerTarget(target);
                    onSaveAction('seer', id);
                  }}
                  maxSelect={1}
                  variant="seer"
                  isWolfPlayer={isWolfPlayer}
                />

                {/* Inline Quick Advance for Seer */}
                {selectedSeerTarget && (
                  <div className="pt-2 animate-fade-in">
                    <GothicButton
                      variant="witch"
                      size="md"
                      onClick={() => handleNextStep(false)}
                      className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <span>Đã Soi Bài & Đi Ngủ 💤</span>
                      <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                    </GothicButton>
                  </div>
                )}
              </div>
            )}

            {/* 5. PHÙ THỦY DƯỢC PHẨM */}
            {currentRole.id === 'phu-thuy' && (() => {
              const handleSelectPoisonTarget = (targetPlayer) => {
                // Nếu bấm lại vào chính người đang bị chọn độc -> Hủy độc ngay không cần confirm
                if (nightState.witchPoisonTargetId === targetPlayer.id) {
                  onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null });
                  return;
                }

                // Modal xác nhận bảo vệ người dùng không bị lỡ tay
                showConfirm({
                  title: 'XÁC NHẬN DÙNG BÌNH ĐỘC?',
                  message: `Bạn có chắc chắn muốn Phù Thủy sử dụng BÌNH ĐỘC để tiêu diệt ${targetPlayer.name} (#${targetPlayer.id}) đêm nay không?\n\n⚠️ Chú ý: Phù Thủy chỉ có DUY NHẤT 1 bình độc trong cả ván đấu. Khi đã dùng thì các đêm sau sẽ không thể đầu độc thêm ai nữa!`,
                  variant: 'blood',
                  confirmText: `Đầu Độc ${targetPlayer.name} ☠️`,
                  cancelText: 'Hủy Bỏ',
                  onConfirm: () => {
                    onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: targetPlayer.id });
                  }
                });
              };

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-sm text-purple-200 font-cinzel">
                      PHÙ THỦY QUYẾT ĐỊNH CỨU / ĐẦU ĐỘC:
                    </h4>
                  </div>

                  {/* Victim Status */}
                  <div className="p-4 rounded-2xl bg-[#0c0d18]/60 backdrop-blur-sm border border-purple-950 flex items-center justify-between shadow-inner">
                    <div>
                      <span className="text-xs text-slate-400 block">Nạn nhân vừa bị Sói cắn đêm nay:</span>
                      {wolfVictim ? (
                        <span className="text-base font-bold text-rose-400">
                          {wolfVictim.name} ({getPlayerRole(wolfVictim)?.name || 'Chưa lộ vai'})
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-emerald-400">
                          Không ai bị cắn
                        </span>
                      )}
                    </div>

                    {wolfVictim && nightState.witchHasHeal && (
                      <GothicButton
                        variant={nightState.witchSaved ? 'blood' : 'witch'}
                        size="sm"
                        onClick={() => onSaveAction('witch', { saved: !nightState.witchSaved, poisonTargetId: nightState.witchPoisonTargetId })}
                      >
                        {nightState.witchSaved ? '✓ Đang Dùng Bình Cứu' : 'Cứu Sống Người Này'}
                      </GothicButton>
                    )}
                  </div>

                  {/* Poison Action */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Dùng Bình Độc (Giết 1 Người):
                      </span>
                      {nightState.witchPoisonTargetId && (
                        <span className="text-[11px] text-rose-400 font-bold animate-pulse">
                          ⚠️ Đã chọn 1 mục tiêu độc
                        </span>
                      )}
                    </div>

                    {nightState.witchHasPoison ? (
                      <div className="space-y-2.5">
                        {/* Active Poison Indicator Banner with Undo */}
                        {nightState.witchPoisonTargetId && (() => {
                          const poisonedP = players.find(p => p.id === nightState.witchPoisonTargetId);
                          return (
                            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-100 text-xs flex items-center justify-between shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                              <div className="flex items-center gap-2">
                                <Skull className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                                <span>
                                  Phù Thủy quyết định đầu độc: <strong className="text-white font-bold">{poisonedP?.name} (#{poisonedP?.id})</strong>
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null })}
                                className="px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-bold text-[11px] border border-rose-400 transition-colors cursor-pointer shrink-0"
                              >
                                ↩ Hủy Dùng Độc
                              </button>
                            </div>
                          );
                        })()}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          <button
                            onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null })}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                              nightState.witchPoisonTargetId === null
                                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                                : 'bg-[#10121d] border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            🚫 Không Dùng Bình Độc
                          </button>

                          {alivePlayers.map(p => {
                            const isWolf = isWolfPlayer(p);
                            const isPoisoned = nightState.witchPoisonTargetId === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => handleSelectPoisonTarget(p)}
                                className={`p-2.5 rounded-xl border text-xs text-left truncate transition-all flex items-center justify-between cursor-pointer ${
                                  isPoisoned
                                    ? 'bg-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                                    : isWolf
                                    ? 'bg-gradient-to-r from-[#200508] to-[#120204] border-rose-600/90 hover:border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50 text-slate-200'
                                    : 'bg-[#10121d] hover:bg-[#1a172c] border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="truncate flex items-center gap-1">
                                  {p.name} <span className="text-slate-500">({getPlayerRole(p)?.name || '❓ Chưa lộ vai'})</span>
                                  {isWolf && <WolfIcon className="w-2.5 h-2.5 inline text-rose-400" />}
                                </span>
                                {isPoisoned && <span className="font-bold text-rose-400 ml-1 shrink-0">☠️ Độc</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Phù thủy đã dùng hết bình độc.</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 6. CUPID GHÉP ĐÔI (ĐÊM 1) - FULL GOTHIC UPGRADE */}
            {currentRole.id === 'cupid' && (() => {
              const chosen = nightState.cupidChosenIds || [];
              const p1 = players.find(x => x.id === chosen[0]);
              const p2 = players.find(x => x.id === chosen[1]);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400 fill-pink-500/40" />
                    <h4 className="font-bold text-sm text-pink-200 font-cinzel">
                      CUPID GHÉP ĐÔI 2 NGƯỜI YÊU NHAU (ĐÊM 1):
                    </h4>
                  </div>

                  {/* SUMMARY COUPLE BOX (Fixed Geometry - Zero Layout Shift) */}
                  <div className="p-3.5 rounded-2xl bg-[#120d20] border border-pink-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Cặp đôi ghép nối ({chosen.length}/2):</span>
                      <span className="text-pink-400 font-bold">
                        {chosen.length === 2 ? (
                          <span className="text-pink-400 font-bold">❤️ Đã chọn đủ 2 người</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Chọn thêm {2 - chosen.length} người</span>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                      <div className={`p-2.5 rounded-xl border text-center transition-colors ${
                        p1 ? 'bg-pink-950/80 border-pink-500 text-pink-100' : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Người Yêu 1</div>
                        <div className="text-sm font-bold truncate mt-0.5">{p1 ? p1.name : '--- Chưa chọn ---'}</div>
                        {p1 && (
                          <div className="text-[10px] text-pink-300">
                            {getPlayerRole(p1)?.name ? `(${getPlayerRole(p1).name})` : '(Chưa lộ vai)'}
                          </div>
                        )}
                      </div>

                      <div className={`p-2.5 rounded-xl border text-center transition-colors ${
                        p2 ? 'bg-pink-950/80 border-pink-500 text-pink-100' : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Người Yêu 2</div>
                        <div className="text-sm font-bold truncate mt-0.5">{p2 ? p2.name : '--- Chưa chọn ---'}</div>
                        {p2 && (
                          <div className="text-[10px] text-pink-300">
                            {getPlayerRole(p2)?.name ? `(${getPlayerRole(p2).name})` : '(Chưa lộ vai)'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEAT MATRIX & CUSTOM SLIDER FOR CUPID (NO SCROLLING AGAIN AND AGAIN) */}
                  <PlayerSeatPicker
                    players={players}
                    selectedIds={chosen}
                    onSelect={(id) => {
                      let next = [];
                      if (chosen.includes(id)) {
                        next = chosen.filter(x => x !== id);
                      } else if (chosen.length < 2) {
                        next = [...chosen, id];
                      } else {
                        next = [chosen[1], id];
                      }
                      onSaveAction('cupid', next);
                    }}
                    maxSelect={2}
                    variant="cupid"
                    isWolfPlayer={isWolfPlayer}
                  />

                  {/* NÚT XÓA CHỌN ĐẶT Ở ĐÁY - KHÔNG LÀM KHỰNG HAY ĐẨY COMPONENT KHÁC */}
                  {chosen.length > 0 && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onSaveAction('cupid', [])}
                        className="text-xs text-slate-400 hover:text-pink-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                      >
                        ✕ Xóa chọn lại
                      </button>
                    </div>
                  )}

                  {/* Inline Quick Advance for Cupid */}
                  {chosen.length === 2 && (
                    <div className="pt-2 animate-fade-in">
                      <GothicButton
                        variant="witch"
                        size="md"
                        onClick={() => handleNextStep(false)}
                        className="w-full h-11 text-xs font-black shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <span>Đã Ghép Đôi & Đi Ngủ 💤</span>
                        <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
                      </GothicButton>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 7. ĐỨA TRẺ HOANG DÃ (WILD CHILD) */}
            {currentRole.id === 'dua-tre-hoang-da' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-amber-200 font-cinzel">
                    ĐỨA TRẺ HOANG DÃ CHỌN 1 THẦN TƯỢNG (IDOL):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isSelf = (p.currentRoleId || p.roleId) === 'dua-tre-hoang-da';
                    const isSelected = nightState.wildChildIdolId === p.id;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        disabled={isSelf}
                        onClick={() => onSaveAction('wildChild', p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelf
                            ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                            : isSelected
                            ? 'bg-amber-950/90 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-1 ring-amber-400'
                            : isWolf
                            ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 text-slate-200'
                            : 'bg-[#121422] hover:bg-[#1a1c30] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            isWolf ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.id}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {isWolf && <WolfIcon className="w-2.5 h-2.5 inline text-rose-400" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              Vai: {getPlayerRole(p)?.name || '❓ Chưa lộ vai'}
                            </div>
                          </div>
                        </div>

                        {isSelf ? (
                          <span className="text-[10px] text-slate-500">Bản thân</span>
                        ) : isSelected ? (
                          <span className="text-xs font-bold text-amber-300">★ Idol</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7.5. ẢNH TỬ (SHADOW / DOPPELGANGER) */}
            {currentRole.id === 'anh-tu' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ghost className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-sm text-purple-200 font-cinzel">
                    ẢNH TỬ CHỌN 1 BẢN THỂ (CHỦ THỂ LIÊN KẾT):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isSelf = (p.currentRoleId || p.roleId) === 'anh-tu' || getPlayerRole(p)?.id === 'anh-tu';
                    const isSelected = nightState.shadowHostId === p.id;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        disabled={isSelf}
                        onClick={() => onSaveAction('shadowHost', p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelf
                            ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                            : isSelected
                            ? 'bg-purple-950/90 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                            : isWolf
                            ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 text-slate-200'
                            : 'bg-[#121422] hover:bg-[#1a1c30] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            isWolf ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.id}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {isWolf && <WolfIcon className="w-2.5 h-2.5 inline text-rose-400" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              Vai: {getPlayerRole(p)?.name || '❓ Chưa lộ vai'}
                            </div>
                          </div>
                        </div>

                        {isSelf ? (
                          <span className="text-[10px] text-slate-500">Bản thân</span>
                        ) : isSelected ? (
                          <span className="text-xs font-bold text-purple-300">👻 Bản Thể</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. NGƯỜI THỔI SÁO (PIED PIPER) */}
            {currentRole.id === 'nguoi-thoi-sao' && (() => {
              const piperChosen = nightState.piperChosenIds || [];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-sm text-indigo-200 font-cinzel">
                        NGƯỜI THỔI SÁO MÊ HOẶC 2 NGƯỜI CHƠI ({piperChosen.length}/2):
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {alivePlayers.map(p => {
                      const isSelected = piperChosen.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            let next = [];
                            if (piperChosen.includes(p.id)) {
                              next = piperChosen.filter(x => x !== p.id);
                            } else if (piperChosen.length < 2) {
                              next = [...piperChosen, p.id];
                            } else {
                              next = [piperChosen[1], p.id];
                            }
                            onSaveAction('piper', next);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950 border-indigo-400 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                              : 'bg-[#121422] hover:bg-[#1a1730] border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs">
                              {p.id}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-sm">{p.name}</div>
                              <div className="text-xs text-slate-400">{getPlayerRole(p)?.name || '❓ Chưa lộ vai'}</div>
                            </div>
                          </div>

                          {isSelected && <span className="text-xs font-bold text-indigo-300">🎶 Thôi miên</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 9. CON QUẠ (RAVEN) */}
            {currentRole.id === 'con-qua' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ghost className="w-5 h-5 text-slate-300" />
                    <h4 className="font-bold text-sm text-slate-200 font-cinzel">
                      CON QUẠ GIEO 2 PHIẾU PHẠT VÀO 1 NGƯỜI:
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveAction('raven', null, { ravenSkipped: true })}
                    className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                      nightState.ravenSkipped
                        ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    🚫 Đêm Nay Bỏ Qua
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isSelected = nightState.ravenTargetId === p.id && !nightState.ravenSkipped;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSaveAction('raven', p.id, { ravenSkipped: false })}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-slate-400 text-white shadow-lg'
                            : 'bg-[#121422] hover:bg-[#1a1730] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs">
                            {p.id}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-sm">{p.name}</div>
                            <div className="text-xs text-slate-400">{getPlayerRole(p)?.name || '❓ Chưa lộ vai'}</div>
                          </div>
                        </div>

                        {isSelected && <span className="text-xs font-bold text-slate-300">🪶 +2 Phiếu</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10. CÁO (THE FOX) - TRINH SÁT 3 NGƯỜI LIỀN KỀ */}
            {currentRole.id === 'cao' && (() => {
              const foxCenterPlayer = players.find(p => p.id === nightState.foxTargetId);
              let triplet = [];
              let tripletHasWolf = false;
              if (foxCenterPlayer && alivePlayers.length >= 3) {
                const sortedAlive = [...alivePlayers].sort((a, b) => a.id - b.id);
                const idx = sortedAlive.findIndex(p => p.id === foxCenterPlayer.id);
                if (idx !== -1) {
                  const left = sortedAlive[(idx - 1 + sortedAlive.length) % sortedAlive.length];
                  const right = sortedAlive[(idx + 1) % sortedAlive.length];
                  triplet = [left, foxCenterPlayer, right];
                  tripletHasWolf = triplet.some(isWolfPlayer);
                }
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-sm text-amber-200 font-cinzel">
                        CÁO CHỌN 1 TÂM ĐIỂM ĐỂ QUÉT NHÓM 3 NGƯỜI:
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSaveAction('fox', null, { foxSkipped: true, foxLostPower: false })}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.foxSkipped
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🚫 Đêm Nay Bỏ Qua
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Cáo chỉ 1 người, Quản trò kiểm tra người đó và 2 người ngồi sát 2 bên. Nếu <span className="text-emerald-300 font-bold">CÓ SÓI</span>: Cáo giữ năng lực. Nếu <span className="text-rose-400 font-bold">KHÔNG CÓ SÓI</span>: Cáo mất vĩnh viễn năng lực!
                  </p>

                  {foxCenterPlayer && triplet.length === 3 && (
                    <div className={`p-4 rounded-2xl border text-center space-y-1.5 backdrop-blur-md animate-fade-in ${
                      tripletHasWolf
                        ? 'bg-gradient-to-r from-emerald-950/90 via-[#062419] to-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-r from-rose-950/90 via-[#26080e] to-rose-950/90 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                    }`}>
                      <div className="text-xs uppercase tracking-wider font-bold">
                        Nhóm 3 người: #{triplet[0].id} {triplet[0].name} — <strong className="underline">#{triplet[1].id} {triplet[1].name}</strong> — #{triplet[2].id} {triplet[2].name}
                      </div>
                      <div className="text-lg font-black font-cinzel">
                        {tripletHasWolf ? '✓ CÓ MA SÓI (Quản trò gật đầu 👍)' : '✗ KHÔNG CÓ MA SÓI (Quản trò lắc đầu 👎)'}
                      </div>
                      <p className="text-xs opacity-90">
                        {tripletHasWolf 
                          ? 'Cáo đã đánh hơi thấy Ma Sói! Cáo tiếp tục giữ năng lực cho các đêm sau.' 
                          : 'Hoàn toàn không có Sói trong nhóm! Cáo MẤT VĨNH VIỄN NĂNG LỰC từ nay về sau.'}
                      </p>
                    </div>
                  )}

                  <PlayerSeatPicker
                    players={alivePlayers}
                    selectedIds={nightState.foxTargetId && !nightState.foxSkipped ? [nightState.foxTargetId] : []}
                    onSelect={(centerId) => {
                      const sortedAlive = [...alivePlayers].sort((a, b) => a.id - b.id);
                      const idx = sortedAlive.findIndex(p => p.id === centerId);
                      let hasWolf = false;
                      if (idx !== -1) {
                        const left = sortedAlive[(idx - 1 + sortedAlive.length) % sortedAlive.length];
                        const right = sortedAlive[(idx + 1) % sortedAlive.length];
                        const center = sortedAlive[idx];
                        hasWolf = [left, center, right].some(isWolfPlayer);
                      }
                      onSaveAction('fox', centerId, { foxLostPower: !hasWolf, foxSkipped: false });
                    }}
                    variant="seer"
                    actionLabel="Chọn tâm điểm"
                  />
                </div>
              );
            })()}

            {/* 11. SÓI TRẮNG (WHITE WEREWOLF) - ĐÊM CHẴN CẮN ĐỒNG BỌN */}
            {currentRole.id === 'soi-trang' && (() => {
              const otherWolves = alivePlayers.filter(p => isWolfPlayer(p) && (p.currentRoleId || p.roleId) !== 'soi-trang');
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skull className="w-5 h-5 text-slate-100" />
                      <h4 className="font-bold text-sm text-slate-100 font-cinzel">
                        SÓI TRẮNG CẮN 1 CON SÓI KHÁC TRONG BẦY:
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSaveAction('whiteWolf', null, { whiteWolfSkipped: true })}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.whiteWolfSkipped
                          ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🚫 Đêm Nay Không Cắn Ai
                    </button>
                  </div>

                  {otherWolves.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs text-center">
                      Không còn con Ma Sói đồng bọn nào khác còn sống trong bầy!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {otherWolves.map(w => {
                        const isSelected = nightState.whiteWolfVictimId === w.id && !nightState.whiteWolfSkipped;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => onSaveAction('whiteWolf', w.id, { whiteWolfSkipped: false })}
                            className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-rose-950 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] ring-1 ring-rose-400'
                                : 'bg-[#18080a] hover:bg-[#220a0d] border-rose-900/80 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-rose-900 border border-rose-700 flex items-center justify-center font-bold text-xs text-rose-100">
                                #{w.id}
                              </div>
                              <div>
                                <div className="font-bold text-sm">{w.name}</div>
                                <div className="text-[11px] text-rose-400">{getPlayerRole(w)?.name || 'Ma Sói'}</div>
                              </div>
                            </div>
                            {isSelected && <span className="text-xs font-bold text-rose-300">💀 Con mồi</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 12. NGUYỆT NỮ (MOON PRIESTESS) - KHÓA PHÉP BAN ĐÊM */}
            {currentRole.id === 'nguyet-nu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MoonStar className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-sm text-indigo-200 font-cinzel">
                      NGUYỆT NỮ CHỌN 1 NGƯỜI ĐỂ KHÓA PHÉP ĐÊM NAY:
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveAction('moonPriestess', null, { moonPriestessSkipped: true })}
                    className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                      nightState.moonPriestessSkipped
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-200 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    🚫 Đêm Nay Bỏ Qua
                  </button>
                </div>

                <PlayerSeatPicker
                  players={alivePlayers}
                  selectedIds={nightState.silencedPlayerId && !nightState.moonPriestessSkipped ? [nightState.silencedPlayerId] : []}
                  onSelect={(id) => {
                    onSaveAction('moonPriestess', id, { moonPriestessSkipped: false });
                  }}
                  variant="default"
                  actionLabel="Khóa phép"
                />
              </div>
            )}
              </>
            )}
          </div>

          {/* STRICT VALIDATION BANNER & STEPPER FOOTER NAV (pb-28 on mobile ensures banner is NEVER cut off by sticky bottom bar) */}
          <div className="space-y-3 pt-2 pb-24 sm:pb-6">
            {/* Optional GM Override button (clean & non-intrusive) */}
            {!stepValidation.isValid && !stepValidation.isStrictBlock && (
              <div className="flex items-center justify-end animate-fade-in pr-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(true)}
                  className="text-xs font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50"
                >
                  <span>Bỏ qua bước này (Quản trò ghi đè)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Stepper Navigation Buttons (Desktop inline) */}
            <div className="hidden md:flex justify-between items-center pt-2">
              <GothicButton
                variant="dark"
                size="md"
                disabled={safeStepIdx === 0}
                onClick={handlePrevStep}
                icon={ChevronLeft}
              >
                Bước Trước
              </GothicButton>

              <GothicButton
                variant={isWolfStep ? 'blood' : 'witch'}
                size="lg"
                disabled={!stepValidation.isValid}
                onClick={() => handleNextStep(false)}
                className={`shadow-2xl transition-all ${
                  !stepValidation.isValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Đi Ngủ 💤</span>
                <ChevronRight className="w-5 h-5 ml-1 inline" />
              </GothicButton>
            </div>
          </div>
        </div>
      ) : (
        /* SUMMARY STEP: READY FOR DAY */
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#141626]/70 to-[#0a0c14]/70 backdrop-blur-md border border-amber-900/60 text-center space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/50 mx-auto flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
            <Sun className="w-8 h-8 animate-spin-slow" />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Đã Hoàn Tất Tất Cả Các Bước Trong Đêm
            </div>
            <h3 className="text-2xl md:text-3xl font-black font-cinzel text-white">
              BÌNH MINH ĐANG ĐẾN VỚI NGÔI LÀNG
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Quản trò đã hoàn tất việc gọi các nhân vật theo đúng thứ tự. Hãy sẵn sàng bấm nút bên dưới để chuyển sang Ban Ngày và công bố kết quả.
            </p>
          </div>

          {/* Actions summary recap card */}
          <div className="p-4 rounded-2xl bg-[#0c0d16]/70 backdrop-blur-sm border border-slate-800 max-w-lg mx-auto text-left space-y-2 text-xs shadow-inner">
            <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Tóm tắt quyết định đêm nay:</span>
              <span className="text-amber-400 font-bold">Đêm {roundNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Người được Bảo Vệ:</span>
              <strong className="text-teal-400">{protectedPlayer?.name || 'Không có'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mục tiêu Sói cắn:</span>
              <strong className="text-rose-400">{wolfVictim?.name || 'Không cắn ai'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phù Thủy cứu nạn nhân:</span>
              <strong className={nightState.witchSaved ? 'text-emerald-400' : 'text-slate-500'}>
                {nightState.witchSaved ? 'Có dùng bình cứu' : 'Không dùng'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phù Thủy đầu độc:</span>
              <strong className={nightState.witchPoisonTargetId ? 'text-rose-400' : 'text-slate-500'}>
                {players.find(x => x.id === nightState.witchPoisonTargetId)?.name || 'Không dùng'}
              </strong>
            </div>
          </div>

          <div className="pt-2">
            <GothicButton
              variant="gold"
              size="lg"
              onClick={() => {
                try {
                  localStorage.removeItem('werewolf_current_night_step');
                } catch (e) {}
                onAdvanceToDay();
              }}
              className="py-4 px-10 text-base md:text-lg shadow-2xl shadow-amber-950/80 mx-auto"
            >
              <Sun className="w-6 h-6 stroke-[3] mr-2" />
              <span>TRỜI SÁNG RỒI! (CẢ LÀNG THỨC GIẤC)</span>
            </GothicButton>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR - ONE-SCREEN MOBILE VIEWPORT */}
      {!isSummaryStep && (
        <div ref={originalFooterRef} className="sticky bottom-0 z-30 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-2.5 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-[#0a0c16]/95 backdrop-blur-md border-t border-purple-900/80 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2">
          <GothicButton
            variant="dark"
            size="sm"
            disabled={safeStepIdx === 0}
            onClick={handlePrevStep}
            icon={ChevronLeft}
            className="h-10 px-2.5 sm:px-3 text-xs shrink-0"
          >
            <span className="hidden sm:inline">Bước Trước</span>
          </GothicButton>

          {/* Validation Feedback in Middle */}
          <div className="flex-1 text-center truncate px-1 sm:px-2">
            {stepValidation.isDeadRole ? (
              <span className="text-[11px] text-rose-300 font-semibold flex items-center justify-center gap-1 truncate">
                <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0 inline" />
                <span className="truncate">{stepValidation.shortMessage || 'Người giữ vai đã chết'}</span>
              </span>
            ) : !stepValidation.isValid ? (
              <span className="text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1 truncate" title={stepValidation.message}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
                <span className="truncate">{stepValidation.shortMessage || stepValidation.message}</span>
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1 truncate" title={stepValidation.message}>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
                <span className="truncate">{stepValidation.shortMessage || stepValidation.message || 'Sẵn sàng tiếp tục'}</span>
              </span>
            )}
          </div>

          <GothicButton
            variant={isWolfStep ? 'blood' : 'witch'}
            size="sm"
            disabled={!stepValidation.isValid}
            onClick={() => handleNextStep(false)}
            className="h-10 px-3 sm:px-4 text-xs font-black shrink-0 shadow-lg"
          >
            <span className="truncate">Đi Ngủ 💤</span>
            <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
          </GothicButton>
        </div>
      )}

      {/* SMART FLOATING ADVANCE BUTTON (Only shows when selection is valid AND user hasn't scrolled down to original footer) */}
      {!isSummaryStep && (
        <div
          className={`md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 transition-all duration-300 transform ${
            showFloatingAdvanceButton
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <GothicButton
            variant={isWolfStep ? 'blood' : 'witch'}
            size="md"
            onClick={() => handleNextStep(false)}
            className="h-11 px-4 text-xs font-black shadow-[0_4px_25px_rgba(0,0,0,0.85)] border border-purple-400/60 ring-2 ring-purple-500/40 rounded-full flex items-center gap-1.5 animate-pulse"
          >
            <span>Đi Ngủ 💤</span>
            <ChevronRight className="w-4 h-4 ml-0.5 inline shrink-0" />
          </GothicButton>
        </div>
      )}
    </div>
  );
}
