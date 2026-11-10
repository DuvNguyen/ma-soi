import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Eye, Skull, Sparkles, Heart, ChevronRight, ChevronLeft, 
  Sun, Moon, Check, UserCheck, AlertTriangle, AlertCircle, Wand2, Ghost, Flame, MoonStar 
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

export default function NightPhaseView({
  roundNumber,
  rolesInGame,
  players,
  deckRoleIds = [],
  nightState,
  onSaveAction,
  onAssignRole,
  onAssignRoleToMultiple,
  onAutoAssignVillagers,
  onSkipRole,
  onAdvanceToDay
}) {
  const { showConfirm, showAlert } = useGothicDialog();
  const topContainerRef = useRef(null);
  const cardRef = useRef(null);

  // Sort roles according to canonical night wake-up order
  const getOrderedNightRoles = () => {
    // Standard night order priorities matching official rulebook
    const orderPriority = {
      'nguyet-nu': 0.5,
      'an-trom': 1,
      'cupid': 2,
      'anh-tu': 2.5,
      'dua-tre-hoang-da': 3,
      'nua-nguoi-nua-soi': 3.1,
      'dien-vien': 3.5,
      'bao-ve': 4,
      'nguoi-cha-cua-soi': 4.9,
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
      'nguoi-thoi-sao': 8,
      'con-qua': 9,
      'nguoi-goi-hon': 10
    };

    // Filter roles that actually wake up during this night
    const activeRoles = rolesInGame.filter(r => {
      // Night 1 only roles
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai'].includes(r.id) && roundNumber > 1) {
        return false;
      }
      // Roles that do not wake up at night (Day only, passive, or event-driven)
      if ([
        'dan-lang', 'dan-thuong', 'tho-san', 'gia-lang', 'thang-ngoc', 'canh-sat-truong', 
        'nguoi-the-than', 'oan-nhan', 'nguoi-day-to-tan-tuy', 'hiep-si-gia', 'ky-si', 
        'thien-su', 'thien-than', 'bo-lao', 'thang-mo', 'nguoi-thuan-phuc-gau', 'than-gau'
      ].includes(r.id)) {
        return false;
      }
      return true;
    });

    // Group all werewolf variants into a single unified step if multiple wolf cards exist
    const nonWolfRoles = activeRoles.filter(r => !['soi-thuong', 'soi-con', 'soi-lon-xau-xa'].includes(r.id));
    const hasAnyWolves = activeRoles.some(r => ['soi-thuong', 'soi-con', 'soi-lon-xau-xa'].includes(r.id));

    let finalRoles = [...nonWolfRoles];
    if (hasAnyWolves) {
      finalRoles.push({
        id: 'soi-thuong',
        name: 'Bầy Ma Sói (Săn Mồi)',
        enName: 'Werewolf Pack',
        teamCode: 'W',
        team: 'Phe Sói',
        shortDesc: 'Toàn bộ bầy Sói mở mắt nhận diện nhau và thống nhất cắn 1 người.',
        gmCall: 'Ma Sói thức dậy. Hãy nhận diện đồng bọn và chọn con mồi đêm nay.',
        image: '/cards/la-bai-ma-soi.jpg'
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
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Active step
  const currentRole = nightSteps[currentStepIdx] || nightSteps[0];
  const isWolfStep = ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'nguoi-cha-cua-soi'].includes(currentRole.id);
  const isSummaryStep = currentRole.id === 'night-summary';

  // Players assigned to this role
  const assignedPlayers = players.filter(p => (p.currentRoleId || p.roleId) === currentRole.id);
  const alivePlayers = players.filter(p => p.isAlive);

  // Actions state local helpers
  const [selectedSeerTarget, setSelectedSeerTarget] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // STRICT GATEKEEPER VALIDATION
  const isSkipped = (nightState?.skippedRoles || []).includes(currentRole?.id);
  const roleHolders = isWolfStep ? players.filter(isWolfPlayer) : players.filter(p => (p.currentRoleId || p.roleId) === currentRole?.id);
  const hasHolders = roleHolders.length > 0;

  const WOLF_ROLE_IDS = [
    'soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang', 
    'nguoi-cha-cua-soi', 'soi-lua', 'anh-em-soi'
  ];
  const maxWolves = deckRoleIds.filter(id => WOLF_ROLE_IDS.includes(id)).length || 2;
  const currentWolves = players.filter(isWolfPlayer);

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

      default:
        return { isValid: true, message: '', shortMessage: '' };
    }
  };

  const stepValidation = getStepValidationState();

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
    if (currentStepIdx < nightSteps.length - 1) {
      setCurrentStepIdx(c => c + 1);
      setSelectedSeerTarget(null);
      setShowAssignDropdown(false);
    } else {
      onAdvanceToDay();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(c => c - 1);
      setSelectedSeerTarget(null);
      setShowAssignDropdown(false);
    }
  };

  // Smooth auto-scroll to Tarot Card when advancing or rewinding role steps
  useEffect(() => {
    if (cardRef.current) {
      const yOffset = -90; // offset for sticky top header
      const y = cardRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else if (topContainerRef.current) {
      const yOffset = -80;
      const y = topContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [currentStepIdx]);

  // Victim of wolves tonight
  const wolfVictim = players.find(p => p.id === nightState.wolfTargetId);
  const protectedPlayer = players.find(p => p.id === nightState.protectedPlayerId);

  return (
    <div 
      ref={topContainerRef}
      className={`space-y-6 max-w-5xl w-full mx-auto transition-colors duration-500 rounded-3xl p-4 md:p-6 border shadow-2xl overflow-x-clip ${
      isWolfStep
        ? 'bg-gradient-to-b from-[#2a080c] via-[#150406] to-[#090203] border-rose-900/80 shadow-rose-950/70'
        : 'bg-[#10121d] border-slate-800 shadow-slate-950/80'
    }`}>
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
              Bước {currentStepIdx + 1} / {nightSteps.length}
            </span>
          </div>
          <h2 className="text-base sm:text-xl md:text-2xl font-cinzel font-black tracking-wide text-slate-100 mt-1 hidden sm:block">
            QUY TRÌNH QUẢN TRÒ GỌI ĐÊM (LẦN LƯỢT)
          </h2>
        </div>

        {/* Navigation buttons - Hidden on mobile because of sticky bottom nav bar */}
        <div className="hidden sm:flex items-center gap-2">
          <GothicButton
            variant="dark"
            size="sm"
            disabled={currentStepIdx === 0}
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

      {/* DECK INVENTORY RADAR (TRACK REMAINING CARDS IN DECK) */}
      <DeckInventoryRadar
        players={players}
        deckRoleIds={deckRoleIds}
        onAutoAssignVillagers={onAutoAssignVillagers}
        onAssignRole={onAssignRole}
      />

      {/* Stepper Progress Bar (Breadcrumbs) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {nightSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isPassed = idx < currentStepIdx;
            const isStepWolf = step.teamCode === 'W';
            return (
              <button
                key={`${step.id}-${idx}`}
                onClick={() => {
                  if (idx > currentStepIdx && !stepValidation.isValid) {
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
                        setCurrentStepIdx(idx);
                        setSelectedSeerTarget(null);
                        setShowAssignDropdown(false);
                      }
                    });
                    return;
                  }
                  setCurrentStepIdx(idx);
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
          {/* Hero Banner for current role - Card as Main Center, Name Underneath */}
          <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all relative overflow-hidden flex flex-col items-center justify-center text-center ${
            isWolfStep
              ? 'bg-gradient-to-b from-[#2a0509] via-[#150204] to-[#250408] border-rose-600/90 shadow-[0_0_35px_rgba(225,29,72,0.4)] ring-1 ring-rose-500/50'
              : 'bg-gradient-to-b from-[#170a2c] via-[#0d0e19] to-[#120822] border-purple-900/70 shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
          }`}>
            {/* Ambient Background Glow */}
            {isWolfStep && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
            )}

            {/* The Main Center Card */}
            <div ref={cardRef} className="relative shrink-0 scroll-mt-24">
              <div className={`w-28 h-40 sm:w-36 sm:h-50 md:w-40 md:h-56 rounded-2xl overflow-hidden border-2 p-1.5 shadow-2xl flex items-center justify-center bg-black/80 transition-transform duration-300 hover:scale-105 ${
                isWolfStep ? 'border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.7)] animate-pulse' : 'border-purple-500/80 shadow-[0_0_25px_rgba(147,51,234,0.45)]'
              }`}>
                {currentRole.image ? (
                  <img
                    src={currentRole.image}
                    alt={currentRole.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-5xl flex items-center justify-center">
                    {isWolfStep ? <WolfIcon className="w-16 h-16 text-rose-500" /> : '✨'}
                  </div>
                )}
              </div>

              {/* Tactical Badges on artwork */}
              {currentRole.id === 'bao-ve' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 animate-bounce">
                  <Shield className="w-5 h-5 fill-slate-950" />
                </div>
              )}
              {currentRole.id === 'tien-tri' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 animate-pulse">
                  <Eye className="w-5 h-5" />
                </div>
              )}
              {isWolfStep && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.8)] border-2 border-slate-900 animate-pulse">
                  <Skull className="w-5 h-5" />
                </div>
              )}
              {currentRole.id === 'phu-thuy' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Name Under the Card */}
            <div className="mt-3.5 space-y-1.5 max-w-md mx-auto">
              {/* Prominent Role Name */}
              <h3 className={`text-xl sm:text-2xl md:text-3xl font-black font-cinzel leading-tight tracking-wider ${
                isWolfStep ? 'text-rose-100 drop-shadow-[0_2px_15px_rgba(225,29,72,0.8)]' : 'text-slate-100'
              }`}>
                {currentRole.name}
              </h3>

              {/* Compact Badge: Team */}
              <div className="flex items-center justify-center pt-0.5">
                <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${
                  isWolfStep ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-purple-950 text-purple-300 border-purple-700'
                }`}>
                  [{currentRole.teamCode}] {currentRole.team}
                </span>
              </div>
            </div>
          </div>

          {/* 1-TAP ROLE CLAIM BOX (IF NO HOLDER HAS BEEN ASSIGNED YET) */}
          {!hasHolders && !isSkipped ? (
            <RoleClaimBox
              currentRole={currentRole}
              players={players}
              deckRoleIds={deckRoleIds}
              onAssignRole={onAssignRole}
              onAssignRoleToMultiple={onAssignRoleToMultiple}
              onSkipRole={isWolfStep ? null : onSkipRole}
              isWolfStep={isWolfStep}
              isWolfPlayer={isWolfPlayer}
            />
          ) : (
            <RoleHolderBanner
              currentRole={currentRole}
              players={players}
              deckRoleIds={deckRoleIds}
              onAssignRole={onAssignRole}
              isWolfStep={isWolfStep}
              isWolfPlayer={isWolfPlayer}
            />
          )}

          {/* STEP SPECIFIC ACTION INTERFACE */}
          <div className="p-5 rounded-3xl bg-[#0f111c] border border-purple-950/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
            {/* 1. BẢO VỆ ACTION */}
            {currentRole.id === 'bao-ve' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-sm text-teal-200 font-cinzel">
                      CHỌN 1 NGƯỜI ĐỂ BẢO VỆ ĐÊM NAY:
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {nightState.lastNightProtectedId && (
                      <span className="text-[11px] text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
                        Đêm trước đã bảo vệ: {players.find(x => x.id === nightState.lastNightProtectedId)?.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSaveAction('protect', null, { protectSkipped: true })}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.protectSkipped
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      🚫 Đêm Nay Không Bảo Vệ Ai
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isLastNight = p.id === nightState.lastNightProtectedId;
                    const isSelected = nightState.protectedPlayerId === p.id && !nightState.protectSkipped;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        disabled={isLastNight}
                        onClick={() => onSaveAction('protect', p.id, { protectSkipped: false })}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isLastNight
                            ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                            : isSelected
                            ? 'bg-teal-950/90 border-teal-400 text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.4)] ring-1 ring-teal-400'
                            : isWolf
                            ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                            : 'bg-[#121422] hover:bg-[#181a2e] border-slate-800 hover:border-teal-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            isWolf ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.id}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-1.5">
                              <span className={isWolf ? 'text-rose-200 font-black' : 'text-slate-100'}>{p.name}</span>
                              {isWolf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                                  🐺 Sói
                                </span>
                              )}
                              {isSelected && <Shield className="w-4 h-4 text-teal-400 fill-teal-400 ml-1" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              Vai: <span className="text-slate-300 font-medium">{getPlayerRole(p)?.name || '❓ Chưa lộ vai'}</span>
                            </div>
                          </div>
                        </div>

                        {isLastNight ? (
                          <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-900">
                            Bị cấm
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs font-bold text-teal-300">Được che chở ✓</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SÓI NGUYỀN (CHA SÓI / NỬA NGƯỜI NỬA SÓI) */}
            {['nguoi-cha-cua-soi', 'nua-nguoi-nua-soi'].includes(currentRole.id) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-amber-200 font-cinzel">
                    QUYỀN NĂNG SÓI NGUYỀN (1 LẦN DUY NHẤT CẢ VÁN):
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Sói nguyền có muốn lây nhiễm / thức tỉnh ai đêm nay không? Có thể bỏ qua nếu chưa muốn dùng.
                </p>

                <div className="flex items-center gap-3">
                  <GothicButton
                    variant="dark"
                    size="sm"
                    onClick={() => showAlert({
                      title: 'QUYỀN NĂNG SÓI NGUYỀN',
                      message: 'Đã ghi nhận bỏ qua đêm nay! Sói nguyền vẫn giữ nguyên quyền năng lây nhiễm cho các đêm tiếp theo.',
                      variant: 'info',
                      confirmText: 'Đã Ghi Nhận ✓'
                    })}
                  >
                    Bỏ qua
                  </GothicButton>
                </div>
              </div>
            )}

            {/* 3. BẦY MA SÓI CẮN NGƯỜI (CRIMSON DANGER ZONE) */}
            {isWolfStep && (
              <div className="space-y-4">
                {/* Secret Wolf Hand-off Box */}
                <WolfWhisperBox
                  players={players}
                  nightState={nightState}
                  onSaveAction={onSaveAction}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-rose-500 animate-bounce" />
                    <h4 className="font-bold text-sm text-rose-300 font-cinzel">
                      QUẢN TRÒ CHỌN MỤC TIÊU BẦY SÓI CẮN:
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {wolfVictim && !nightState.wolfSkipped && (
                      <span className="text-xs font-black text-rose-300 bg-rose-950 px-3 py-1 rounded-xl border border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.5)]">
                        Mục tiêu: {wolfVictim.name} 🩸
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSaveAction('wolves', null, { wolfSkipped: true })}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
                        nightState.wolfSkipped
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      Đêm nay không cắn
                    </button>
                  </div>
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isSelected = nightState.wolfTargetId === p.id && !nightState.wolfSkipped;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        disabled={isWolf}
                        onClick={() => onSaveAction('wolves', p.id, { wolfSkipped: false })}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isWolf
                            ? 'opacity-40 cursor-not-allowed bg-[#180407] border-rose-950 text-slate-500'
                            : isSelected
                            ? 'bg-gradient-to-r from-rose-950 via-[#3b090e] to-rose-950 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] ring-1 ring-rose-400'
                            : 'bg-[#121422] hover:bg-[#1e1524] border-slate-800 hover:border-rose-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                            isWolf ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.id}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-1.5">
                              <span className={isWolf ? 'text-rose-400 font-bold' : 'text-slate-100'}>{p.name}</span>
                              {isWolf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-400 border border-rose-800">
                                  🐺 Đồng bọn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              Vai: <span className="text-slate-300 font-medium">{getPlayerRole(p)?.name || '❓ Chưa lộ vai'}</span>
                            </div>
                          </div>
                        </div>

                        {isWolf ? (
                          <span className="text-[10px] text-rose-400/80 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-950">
                            Không thể cắn
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs font-black text-rose-400 flex items-center gap-1 animate-pulse">
                            <Skull className="w-4 h-4 fill-rose-500 text-rose-500" /> Bị cắn
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* SÓI NGUYỀN (NGƯỜI CHA CỦA SÓI) LÂY NHIỄM PANEL */}
                {wolfVictim && !nightState.wolfSkipped && !nightState.cursedUsed && (
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
                  {selectedSeerTarget && (
                    <button
                      type="button"
                      onClick={() => setSelectedSeerTarget(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Đóng thẻ bài ✕
                    </button>
                  )}
                </div>

                {/* THE REVEALED CARD OF INSPECTED PLAYER */}
                {selectedSeerTarget ? (() => {
                  const targetRole = getPlayerRole(selectedSeerTarget);
                  const targetOrigRole = getPlayerOriginalRole(selectedSeerTarget);
                  const isTargetWolf = isWolfPlayer(selectedSeerTarget);

                  return (
                    <div className={`p-4 rounded-2xl border transition-all animate-fade-in flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left ${
                      isTargetWolf
                        ? 'bg-gradient-to-r from-[#3b080c] via-[#200305] to-[#120204] border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.6)]'
                        : 'bg-gradient-to-r from-[#0d1a33] via-[#091224] to-[#050b18] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]'
                    }`}>
                      {/* The Big Card */}
                      <div className="relative shrink-0">
                        <div className={`w-24 h-34 sm:w-28 sm:h-40 rounded-xl overflow-hidden border-2 p-1 shadow-2xl flex items-center justify-center bg-black/80 ${
                          isTargetWolf ? 'border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.8)]' : 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                        }`}>
                          {targetRole?.image ? (
                            <img
                              src={targetRole.image}
                              alt={targetRole.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-4xl">
                              {isTargetWolf ? '🐺' : '👨‍🌾'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Info & GM Signal Instruction */}
                      <div className="flex-1 space-y-1.5">
                        <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                          Thẻ bài của #{selectedSeerTarget.id} {selectedSeerTarget.name}:
                        </div>
                        <h3 className={`text-xl sm:text-2xl font-black font-cinzel ${
                          isTargetWolf ? 'text-rose-100' : 'text-blue-100'
                        }`}>
                          {targetRole?.name || 'Chưa lộ vai'}
                        </h3>
                        <div className="text-xs text-slate-300">
                          Phe: <strong>[{targetRole?.teamCode || '?'}] {targetRole?.team || 'Chưa lộ phe'}</strong>
                        </div>

                        {/* Display both original role and wolf role if infected by Cursed Wolf */}
                        {selectedSeerTarget.isCursedWolf && targetOrigRole && (
                          <div className="mt-1 p-2 rounded-xl bg-purple-950/80 border border-purple-500/80 text-xs text-purple-200 shadow-sm">
                            🔮 <strong>SÓI NGUYỀN ĐỒNG HÓA:</strong> Người này vốn giữ vai <u>{targetOrigRole.name}</u>, đã bị Sói Nguyền lây nhiễm thành Ma Sói!
                          </div>
                        )}

                        {/* Explicit Hand Signal Instruction for GM */}
                        <div className={`mt-2 p-2 rounded-xl text-xs font-black inline-block uppercase tracking-wider border shadow-md ${
                          isTargetWolf
                            ? 'bg-rose-950 text-rose-200 border-rose-600'
                            : 'bg-blue-950 text-blue-200 border-blue-600'
                        }`}>
                          {isTargetWolf 
                            ? '👉 RA DẤU CHO TIÊN TRI: LÀ MA SÓI! 🐺' 
                            : '👉 RA DẤU CHO TIÊN TRI: LÀ DÂN LÀNG (Lương thiện)! 👨‍🌾'}
                        </div>
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
              </div>
            )}

            {/* 5. PHÙ THỦY DƯỢC PHẨM */}
            {currentRole.id === 'phu-thuy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-sm text-purple-200 font-cinzel">
                    PHÙ THỦY QUYẾT ĐỊNH CỨU / ĐẦU ĐỘC:
                  </h4>
                </div>

                {/* Victim Status */}
                <div className="p-4 rounded-2xl bg-[#0c0d18] border border-purple-950 flex items-center justify-between shadow-inner">
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
                <div>
                  <span className="text-xs font-bold text-purple-300 uppercase block mb-2 tracking-wider">
                    Dùng Bình Độc (Giết 1 Người):
                  </span>
                  {nightState.witchHasPoison ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: null })}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          nightState.witchPoisonTargetId === null
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                            : 'bg-[#10121d] border-slate-800 text-slate-400'
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
                            onClick={() => onSaveAction('witch', { saved: nightState.witchSaved, poisonTargetId: p.id })}
                            className={`p-2.5 rounded-xl border text-xs text-left truncate transition-all flex items-center justify-between cursor-pointer ${
                              isPoisoned
                                ? 'bg-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                                : isWolf
                                ? 'bg-gradient-to-r from-[#200508] to-[#120204] border-rose-600/90 hover:border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.35)] ring-1 ring-rose-500/50 text-slate-200'
                                : 'bg-[#10121d] hover:bg-[#1a172c] border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              {p.name} <span className="text-slate-500">({getPlayerRole(p)?.name || '❓ Chưa lộ vai'})</span>
                              {isWolf && <span className="text-[9px] text-rose-400 font-bold">🐺</span>}
                            </span>
                            {isPoisoned && <span className="font-bold text-rose-400 ml-1 shrink-0">☠️ Độc</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Phù thủy đã dùng hết bình độc.</p>
                  )}
                </div>
              </div>
            )}

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

                  <p className="text-xs text-slate-400">
                    Chọn đúng 2 người chơi bất kỳ trong danh sách bên dưới để kết duyên. Hai người yêu nhau sẽ cùng sống cùng chết!
                  </p>

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
                        className="text-xs text-slate-400 hover:text-pink-300 underline font-medium cursor-pointer"
                      >
                        ✕ Xóa chọn lại
                      </button>
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
                <p className="text-xs text-slate-400">
                  Chọn 1 người chơi làm Thần Tượng. Nếu người này chết trong ván đấu, Đứa Trẻ Hoang Dã sẽ lập tức hóa thành <span className="text-rose-400 font-bold uppercase">MA SÓI</span>!
                </p>

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
                              {isWolf && <span className="text-[9px] text-rose-400 font-bold">🐺</span>}
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
                  <p className="text-xs text-slate-400">
                    Người Thổi Sáo thôi miên 2 người sống đêm nay. Khi toàn bộ người sống đều bị thôi miên, Người Thổi Sáo thắng đơn độc!
                  </p>

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
          </div>

          {/* STRICT VALIDATION BANNER & STEPPER FOOTER NAV (pb-28 on mobile ensures banner is NEVER cut off by sticky bottom bar) */}
          <div className="space-y-3 pt-2 pb-24 sm:pb-6">
            {/* Gatekeeper Status Bar */}
            {!stepValidation.isValid ? (
              <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/80 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{stepValidation.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNextStep(true)}
                  className="text-[11px] underline text-amber-400 hover:text-amber-300 font-bold self-end sm:self-auto cursor-pointer"
                >
                  Bỏ qua bắt buộc (Quản trò ghi đè) ➔
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{stepValidation.message || 'Hành động hợp lệ. Sẵn sàng tiếp tục.'}</span>
              </div>
            )}

            {/* Stepper Navigation Buttons (Desktop inline) */}
            <div className="hidden md:flex justify-between items-center pt-2">
              <GothicButton
                variant="dark"
                size="md"
                disabled={currentStepIdx === 0}
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
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#141626] to-[#0a0c14] border border-amber-900/60 text-center space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] animate-fade-in">
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
          <div className="p-4 rounded-2xl bg-[#0c0d16] border border-slate-800 max-w-lg mx-auto text-left space-y-2 text-xs shadow-inner">
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
              onClick={onAdvanceToDay}
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
        <div className="sticky bottom-0 z-30 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-2.5 sm:p-3 bg-[#0a0c16]/95 backdrop-blur-md border-t border-purple-900/80 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2">
          <GothicButton
            variant="dark"
            size="sm"
            disabled={currentStepIdx === 0}
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
    </div>
  );
}
