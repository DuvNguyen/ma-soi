import React, { useState } from 'react';
import { 
  Shield, Eye, Skull, Sparkles, Heart, ChevronRight, ChevronLeft, 
  Sun, Moon, Check, UserCheck, AlertTriangle, AlertCircle, Wand2, Ghost, Flame, MoonStar 
} from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfWhisperBox from './WolfWhisperBox';

export default function NightPhaseView({
  roundNumber,
  rolesInGame,
  players,
  nightState,
  onSaveAction,
  onAssignRole,
  onAdvanceToDay
}) {
  const isWolfPlayer = (p) => {
    return p?.role?.teamCode === 'W' || ['soi-thuong', 'soi-con', 'soi-lon-xau-xa', 'soi-trang'].includes(p?.role?.id);
  };
  // Sort roles according to canonical night wake-up order
  const getOrderedNightRoles = () => {
    // Standard night order priorities
    const orderPriority = {
      'anh-tu': 1,
      'cupid': 2,
      'dua-tre-hoang-da': 3,
      'bao-ve': 4,
      'nguoi-cha-cua-soi': 5,
      'nua-nguoi-nua-soi': 5.1,
      'soi-thuong': 6,
      'soi-con': 6.1,
      'soi-lon-xau-xa': 6.2,
      'soi-trang': 6.3,
      'tien-tri': 7,
      'cao': 7.1,
      'phu-thuy': 8,
      'duoc-si': 8.1,
      'nguoi-thoi-sao': 9,
      'con-qua': 10,
      'nguoi-goi-hon': 11
    };

    // Filter roles that actually wake up during this night
    const activeRoles = rolesInGame.filter(r => {
      // Cupid & Đứa trẻ only wake on Night 1
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu'].includes(r.id) && roundNumber > 1) {
        return false;
      }
      // Dân thường, Thợ săn, Già làng, Thằng ngốc do not wake up at night
      if (['dan-lang', 'dan-thuong', 'tho-san', 'gia-lang', 'thang-ngoc', 'canh-sat-truong', 'nguoi-the-than'].includes(r.id)) {
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
  const assignedPlayers = players.filter(p => p.roleId === currentRole.id);
  const alivePlayers = players.filter(p => p.isAlive);

  // Actions state local helpers
  const [selectedSeerTarget, setSelectedSeerTarget] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // Advance to next step
  const handleNextStep = () => {
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

  // Victim of wolves tonight
  const wolfVictim = players.find(p => p.id === nightState.wolfTargetId);
  const protectedPlayer = players.find(p => p.id === nightState.protectedPlayerId);

  return (
    <div className={`space-y-6 max-w-5xl mx-auto transition-colors duration-500 rounded-3xl p-4 md:p-6 border shadow-2xl ${
      isWolfStep
        ? 'bg-gradient-to-b from-[#2a080c] via-[#150406] to-[#090203] border-rose-900/80 shadow-rose-950/70'
        : 'bg-[#10121d] border-slate-800 shadow-slate-950/80'
    }`}>
      {/* Top Header & Round Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
              isWolfStep 
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' 
                : 'bg-indigo-950 text-indigo-300 border-indigo-800'
            }`}>
              <Moon className="w-3.5 h-3.5 fill-current" />
              Đêm Thứ {roundNumber}
            </span>
            <span className="text-xs text-slate-400">
              Bước {currentStepIdx + 1} / {nightSteps.length}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-cinzel font-black tracking-wide text-slate-100 mt-1">
            QUY TRÌNH QUẢN TRÒ GỌI ĐÊM (LẦN LƯỢT)
          </h2>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
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
            onClick={handleNextStep}
          >
            <span>{isSummaryStep ? '☀️ BẬT TRỜI SÁNG' : `Cho ${currentRole.name} Ngủ & Tiếp`}</span>
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </GothicButton>
        </div>
      </div>

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
                  setCurrentStepIdx(idx);
                  setSelectedSeerTarget(null);
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
        <div className="space-y-6">
          {/* Hero Banner for current role */}
          <div className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-center gap-6 relative overflow-hidden ${
            isWolfStep
              ? 'bg-gradient-to-r from-[#2a0509] via-[#150204] to-[#250408] border-rose-600/90 shadow-[0_0_35px_rgba(225,29,72,0.4)] ring-1 ring-rose-500/50'
              : 'bg-gradient-to-r from-[#170a2c] via-[#0d0e19] to-[#120822] border-purple-900/70 shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
          }`}>
            {/* Ambient Background Glow */}
            {isWolfStep && (
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
            )}

            {/* Visual Avatar / Card Art / Icon */}
            <div className="relative shrink-0">
              <div className={`w-32 h-44 rounded-2xl overflow-hidden border-2 p-1.5 shadow-2xl flex items-center justify-center bg-black/60 ${
                isWolfStep ? 'border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.6)] animate-pulse' : 'border-purple-600/70 shadow-[0_0_20px_rgba(147,51,234,0.35)]'
              }`}>
                {currentRole.image ? (
                  <img
                    src={currentRole.image}
                    alt={currentRole.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-4xl">
                    {isWolfStep ? '🐺' : '✨'}
                  </div>
                )}
              </div>

              {/* Badges on artwork */}
              {currentRole.id === 'bao-ve' && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 animate-bounce">
                  <Shield className="w-5 h-5 fill-slate-950" />
                </div>
              )}
              {currentRole.id === 'tien-tri' && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 animate-pulse">
                  <Eye className="w-5 h-5" />
                </div>
              )}
              {isWolfStep && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.8)] border-2 border-slate-900 animate-pulse">
                  <Skull className="w-5 h-5" />
                </div>
              )}
              {currentRole.id === 'phu-thuy' && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Role Header Info & Voice Call */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <GothicBadge variant={isWolfStep ? 'wolf' : 'witch'}>
                  [{currentRole.teamCode}] {currentRole.team}
                </GothicBadge>

                {/* Assigned players badge */}
                <div className="text-xs text-slate-300 bg-[#0b0c15] px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 shadow-inner">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Người giữ vai: </span>
                  {assignedPlayers.length > 0 ? (
                    <strong className="text-white">{assignedPlayers.map(p => p.name).join(', ')}</strong>
                  ) : (
                    <span className="text-amber-400 italic font-medium">Chưa gán (Bấm chọn bên dưới)</span>
                  )}
                </div>
              </div>

              <h3 className={`text-2xl md:text-3xl font-black font-cinzel ${
                isWolfStep ? 'text-rose-100 drop-shadow-[0_2px_15px_rgba(225,29,72,0.8)]' : 'text-slate-100'
              }`}>
                {currentRole.name}
              </h3>

              {/* GM Voice Script Box */}
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed italic ${
                isWolfStep 
                  ? 'bg-[#1e0407]/80 border-rose-800/80 text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.25)]' 
                  : 'bg-[#180a2b]/80 border-purple-800/70 text-purple-200'
              }`}>
                <span className="font-bold not-italic uppercase tracking-wider block text-[10px] text-slate-400 mb-0.5">
                  🗣️ Lời Thoại Quản Trò Đọc Lên:
                </span>
                "{currentRole.gmCall || 'Gọi vai trò này thức dậy và thực hiện hành động.'}"
              </div>

              {/* Quick Assign Player Dropdown button */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                >
                  {showAssignDropdown ? '▲ Ẩn chọn người giữ vai' : '▼ Nhấn vào đây để gán ai là ' + currentRole.name}
                </button>

                {showAssignDropdown && (
                  <div className="mt-2 p-3 bg-[#0c0e18] border border-purple-900/60 rounded-2xl space-y-1.5 max-h-44 overflow-y-auto shadow-2xl">
                    <div className="text-[11px] text-slate-400 mb-1">
                      Chọn người chơi đang giơ tay nhận vai <strong>{currentRole.name}</strong>:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {players.map(p => {
                        const isWolf = isWolfPlayer(p);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onAssignRole(p.id, currentRole);
                              setShowAssignDropdown(false);
                            }}
                            className={`p-2 rounded-xl text-xs font-semibold text-left truncate border transition-all cursor-pointer ${
                              p.roleId === currentRole.id
                                ? 'bg-purple-800 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                                : isWolf
                                ? 'bg-[#1c0507] text-rose-300 border-rose-800/80 hover:border-rose-500'
                                : 'bg-[#121422] hover:bg-[#1c1e33] text-slate-300 border-slate-800'
                            }`}
                          >
                            <span>{p.name}</span>
                            {isWolf && <span className="text-[9px] text-rose-400 ml-1 font-bold">🐺</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP SPECIFIC ACTION INTERFACE */}
          <div className="p-5 rounded-3xl bg-[#0f111c] border border-purple-950/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)] space-y-4">
            {/* 1. BẢO VỆ ACTION */}
            {currentRole.id === 'bao-ve' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-sm text-teal-200 font-cinzel">
                      CHỌN 1 NGƯỜI ĐỂ BẢO VỆ ĐÊM NAY:
                    </h4>
                  </div>
                  {nightState.lastNightProtectedId && (
                    <span className="text-[11px] text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
                      Đêm trước đã bảo vệ: {players.find(x => x.id === nightState.lastNightProtectedId)?.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isLastNight = p.id === nightState.lastNightProtectedId;
                    const isSelected = nightState.protectedPlayerId === p.id;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        disabled={isLastNight}
                        onClick={() => onSaveAction('protect', p.id)}
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
                              Vai: <span className="text-slate-300 font-medium">{p.role?.name || 'Dân'}</span>
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
                    onClick={() => alert('Đã ghi nhận bỏ qua đêm nay!')}
                  >
                    🚫 Đêm Nay Bỏ Qua (Chưa Dùng)
                  </GothicButton>
                </div>
              </div>
            )}

            {/* 3. BẦY MA SÓI CẮN NGƯỜI (CRIMSON DANGER ZONE) */}
            {isWolfStep && (
              <div className="space-y-4">
                {/* Secret Wolf Hand-off Box with 25s Countdown (Customizable in Settings) */}
                <WolfWhisperBox
                  players={players}
                  nightState={nightState}
                  onSaveAction={onSaveAction}
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-rose-500 animate-bounce" />
                    <h4 className="font-bold text-sm text-rose-300 font-cinzel">
                      HOẶC QUẢN TRÒ BẤM CHỌN TRỰC TIẾP MỤC TIÊU BẦY SÓI CẮN:
                    </h4>
                  </div>
                  {wolfVictim && (
                    <span className="text-xs font-black text-rose-300 bg-rose-950 px-3 py-1 rounded-xl border border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.5)]">
                      Mục tiêu cắn: {wolfVictim.name} 🩸
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isSelected = nightState.wolfTargetId === p.id;
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        onClick={() => onSaveAction('wolves', p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-950 via-[#3b090e] to-rose-950 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] ring-1 ring-rose-400'
                            : isWolf
                            ? 'bg-gradient-to-r from-[#24070a] to-[#140305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
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
                              <span className={isWolf ? 'text-rose-200 font-black' : 'text-slate-100'}>{p.name}</span>
                              {isWolf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                                  🐺 Đồng bọn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              Vai: <span className="text-slate-300 font-medium">{p.role?.name || 'Dân'}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-xs font-black text-rose-400 flex items-center gap-1 animate-pulse">
                            <Skull className="w-4 h-4 fill-rose-500 text-rose-500" /> Bị cắn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. TIÊN TRI SOI */}
            {currentRole.id === 'tien-tri' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-sm text-purple-200 font-cinzel">
                    CHỌN NGƯỜI TIÊN TRI MUỐN SOI:
                  </h4>
                </div>

                {selectedSeerTarget && (
                  <div className={`p-4 rounded-2xl border text-center animate-fade-in ${
                    isWolfPlayer(selectedSeerTarget)
                      ? 'bg-gradient-to-b from-[#3b080c] to-[#1c0205] border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.6)] text-rose-100'
                      : 'bg-gradient-to-b from-[#091b36] to-[#040d1c] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] text-blue-100'
                  }`}>
                    <div className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">
                      Kết quả Quản trò ra dấu bí mật cho Tiên Tri:
                    </div>
                    <div className="text-3xl font-black font-cinzel">
                      {isWolfPlayer(selectedSeerTarget) ? '🐺 LÀ MA SÓI !' : '👨‍🌾 LÀ DÂN LÀNG (Lương thiện)'}
                    </div>
                    <p className="text-xs mt-1.5 opacity-90">
                      Mục tiêu: <strong>{selectedSeerTarget.name}</strong> ({selectedSeerTarget.role?.name || 'Dân'})
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {alivePlayers.map(p => {
                    const isWolf = isWolfPlayer(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedSeerTarget(p);
                          onSaveAction('seer', p.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isWolf
                            ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                            : 'bg-[#121422] hover:bg-[#1a1730] border-slate-800 hover:border-purple-600 text-slate-300'
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
                            </div>
                            <div className="text-xs text-slate-400">
                              Thực tế: <span className="font-medium text-slate-300">{p.role?.name || 'Dân'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-purple-300 bg-purple-950/70 px-2.5 py-1 rounded-xl border border-purple-800/60">
                          Soi
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                        {wolfVictim.name} ({wolfVictim.role?.name || 'Dân'})
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
                              {p.name} <span className="text-slate-500">({p.role?.name || 'Dân'})</span>
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

            {/* 6. CUPID GHÉP ĐÔI (ĐÊM 1) - FULL GOTHIC UPGRADE WITH WEREWOLF RED BORDERS */}
            {currentRole.id === 'cupid' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400 fill-pink-500/40" />
                  <h4 className="font-bold text-sm text-pink-200 font-cinzel">
                    CUPID GHÉP ĐÔI 2 NGƯỜI YÊU NHAU (ĐÊM 1):
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Chọn đúng 2 người chơi. Nếu 1 Sói + 1 Dân thì trở thành <span className="text-rose-400 font-bold uppercase">PHE THỨ BA</span>!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {players.map(p => {
                    const isSelected = (nightState.cupidChosenIds || []).includes(p.id);
                    const isWolf = isWolfPlayer(p);

                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          const current = nightState.cupidChosenIds || [];
                          let next = [];
                          if (current.includes(p.id)) {
                            next = current.filter(x => x !== p.id);
                          } else if (current.length < 2) {
                            next = [...current, p.id];
                          } else {
                            next = [current[1], p.id];
                          }
                          onSaveAction('cupid', next);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-950 via-[#3b124d] to-pink-950/80 border-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] ring-1 ring-pink-400'
                            : isWolf
                            ? 'bg-gradient-to-r from-[#22070a] to-[#120305] border-rose-600/90 hover:border-rose-400 shadow-[0_0_16px_rgba(225,29,72,0.45)] ring-1 ring-rose-500/50 text-slate-200'
                            : 'bg-[#101322] hover:bg-[#161a30] border-slate-800 hover:border-purple-600/80 text-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isSelected
                              ? 'bg-pink-600 text-white border-pink-400'
                              : isWolf
                              ? 'bg-rose-950 text-rose-300 border-rose-600'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.id}
                          </div>

                          <div className="truncate">
                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                              <span className={isWolf ? 'text-rose-200 font-black' : isSelected ? 'text-white' : 'text-slate-100'}>
                                {p.name}
                              </span>
                              {isWolf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]">
                                  🐺 Phe Sói
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Vai: <span className="font-medium text-slate-300">{p.role?.name || 'Dân làng'}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Heart className="w-5 h-5 text-pink-400 fill-pink-500 shrink-0 animate-bounce" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Nav */}
          <div className="flex justify-between items-center pt-2">
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
              onClick={handleNextStep}
              className="shadow-2xl"
            >
              <span>Cho {currentRole.name} Ngủ & Tiếp Tục 💤</span>
              <ChevronRight className="w-5 h-5 ml-1 inline" />
            </GothicButton>
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
    </div>
  );
}
