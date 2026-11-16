import React, { useState } from 'react';
import { Flame, Ghost, Wand2, Eye, EyeOff, Check, Skull, MoonStar, Crosshair, Users, Search, Swords, Theater, RefreshCw, Sparkles, Shield, Zap } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import WolfIcon from '../ui/WolfIcon';
import { getPlayerRole, matchesSearch, removeVietnameseTones } from '../../utils/roleUtils';
import { ROLES } from '../../data/roles';

export default function NightSpecialRolesStep({
  currentRole,
  players,
  alivePlayers,
  nightState,
  deckRoleIds = [],
  roundNumber = 1,
  canWolvesKillTeammates,
  onSaveAction,
  onAssignRole,
  onAssignRoleToMultiple,
  isWolfPlayer
}) {
  const [roleActionSearch, setRoleActionSearch] = useState('');
  // 1. ĐỨA TRẺ HOANG DÃ (TARZAN / CON HOANG)
  if (currentRole.id === 'dua-tre-hoang-da') {
    const wildChildHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'dua-tre-hoang-da' || p.originalRoleId === 'dua-tre-hoang-da');
    const wildChildPlayer = wildChildHolders[0] || null;
    const selectedIdolId = nightState.wildChildIdolId || wildChildPlayer?.idolId;
    const selectedIdolPlayer = players.find(p => p.id === selectedIdolId);

    return (
      <div className="space-y-4">
        {/* SUMMARY CARD */}
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm font-cinzel">
                Liên Kết Con Hoang & Mẹ (Thần Tượng)
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Khi Mẹ chết vì bất kỳ lý do gì, Con Hoang lập tức phẫn nộ hóa thành Ma Sói.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {wildChildPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200">
                Con Hoang: #{wildChildPlayer.id} {wildChildPlayer.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán Con Hoang
              </span>
            )}
            <span className="text-slate-500 font-bold">➔</span>
            {selectedIdolPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200">
                Mẹ: #{selectedIdolPlayer.id} {selectedIdolPlayer.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn Mẹ
              </span>
            )}
          </div>
        </div>

        {/* 1. ASSIGN CON HOANG (TARZAN) IF NOT YET ASSIGNED */}
        {!wildChildPlayer && typeof onAssignRole === 'function' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                1. Chọn Người Giữ Vai Con Hoang (Tarzan):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {alivePlayers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAssignRole(p.id, currentRole.id)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-[#121422] hover:bg-[#1a1c30] hover:border-amber-500/50 text-slate-200 text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="truncate">
                    <span className="font-bold text-xs">#{p.id} {p.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {getPlayerRole(p)?.name || 'Chưa gán'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold shrink-0">Chọn vai</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. CHỌN MẸ (THẦN TƯỢNG) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {wildChildPlayer ? `2. Chọn Mẹ Của #${wildChildPlayer.id}:` : '2. Chọn Mẹ (Thần Tượng):'}
            </span>

            <div className="flex items-center gap-2">
              {/* Compact Search Input */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={roleActionSearch}
                  onChange={(e) => setRoleActionSearch(e.target.value)}
                  placeholder="Tìm tên..."
                  className="w-24 sm:w-32 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {wildChildPlayer && typeof onAssignRole === 'function' && (
                <button
                  type="button"
                  onClick={() => onAssignRole(wildChildPlayer.id, currentRole.id)}
                  className="text-[11px] underline text-slate-400 hover:text-amber-300 cursor-pointer"
                >
                  Đổi vai
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {alivePlayers
              .filter(p => {
                if (!roleActionSearch) return true;
                const q = removeVietnameseTones(roleActionSearch);
                return matchesSearch(p.name, q) || String(p.id).includes(q);
              })
              .map(p => {
              const isSelf = wildChildPlayer ? p.id === wildChildPlayer.id : (p.currentRoleId || p.roleId) === 'dua-tre-hoang-da';
              const isSelected = selectedIdolId === p.id;
              const isWolf = isWolfPlayer(p);

              return (
                <button
                  key={p.id}
                  disabled={isSelf}
                  type="button"
                  onClick={() => onSaveAction('wildChild', p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    isSelf
                      ? 'opacity-35 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
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
                    <span className="text-[10px] text-amber-500/80 font-bold">Con Hoang</span>
                  ) : isSelected ? (
                    <span className="text-xs font-bold text-amber-300">★ Mẹ</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. ẢNH TỬ (SHADOW / DOPPELGANGER)
  if (currentRole.id === 'anh-tu') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-sm text-purple-200 font-cinzel">
              Bản Thể liên kết
            </h4>
          </div>

          {/* Compact Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={roleActionSearch}
              onChange={(e) => setRoleActionSearch(e.target.value)}
              placeholder="Tìm tên..."
              className="w-24 sm:w-32 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {alivePlayers
            .filter(p => {
              if (!roleActionSearch) return true;
              const q = removeVietnameseTones(roleActionSearch);
              return matchesSearch(p.name, q) || String(p.id).includes(q);
            })
            .map(p => {
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
    );
  }

  // 3. NGƯỜI THỔI SÁO (PIED PIPER)
  if (currentRole.id === 'nguoi-thoi-sao') {
    const piperChosen = nightState.piperChosenIds || [];
    const piperPlayer = players.find(p => (p.currentRoleId || p.roleId) === 'nguoi-thoi-sao' || getPlayerRole(p)?.id === 'nguoi-thoi-sao');
    const hypnotizedCount = alivePlayers.filter(p => p.isHypnotized && p.id !== piperPlayer?.id).length;
    const targetVictimsCount = Math.max(0, alivePlayers.length - (piperPlayer?.isAlive ? 1 : 0));

    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-sm text-indigo-200 font-cinzel">
              Mê hoặc Người Thổi Sáo ({piperChosen.length}/2)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={roleActionSearch}
                onChange={(e) => setRoleActionSearch(e.target.value)}
                placeholder="Tìm tên..."
                className="w-24 sm:w-32 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-bold shrink-0">
              Tiến độ: {hypnotizedCount}/{targetVictimsCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {alivePlayers
            .filter(p => {
              if (!roleActionSearch) return true;
              const q = removeVietnameseTones(roleActionSearch);
              return matchesSearch(p.name, q) || String(p.id).includes(q);
            })
            .map(p => {
            const isSelf = p.id === piperPlayer?.id;
            const isSelected = piperChosen.includes(p.id);
            const isAlreadyHypnotized = Boolean(p.isHypnotized);

            return (
              <button
                key={p.id}
                disabled={isSelf}
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
                  isSelf
                    ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                    : isSelected
                    ? 'bg-indigo-950 border-indigo-400 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-1 ring-indigo-400'
                    : isAlreadyHypnotized
                    ? 'bg-[#18102a] border-purple-800/80 text-purple-200'
                    : 'bg-[#121422] hover:bg-[#1a1730] border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs">
                    {p.id}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-slate-400 truncate">{getPlayerRole(p)?.name || '❓ Chưa lộ vai'}</div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {isSelf ? (
                    <span className="text-[10px] text-slate-500">Bản thân</span>
                  ) : isSelected ? (
                    <span className="text-xs font-bold text-indigo-300">🎶 Đêm nay</span>
                  ) : isAlreadyHypnotized ? (
                    <span className="text-[10px] font-bold text-purple-300">🎵 Đã mê</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. CON QUẠ (RAVEN)
  if (currentRole.id === 'con-qua' || currentRole.id === 'con-qua-plus') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-slate-300" />
            <h4 className="font-bold text-sm text-slate-200 font-cinzel">
              Dấu ấn Quạ
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={roleActionSearch}
                onChange={(e) => setRoleActionSearch(e.target.value)}
                placeholder="Tìm tên..."
                className="w-24 sm:w-32 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => onSaveAction('raven', null, { ravenSkipped: true })}
              className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer shrink-0 ${
                nightState.ravenSkipped
                  ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🚫 Bỏ Qua
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {alivePlayers
            .filter(p => {
              if (!roleActionSearch) return true;
              const q = removeVietnameseTones(roleActionSearch);
              return matchesSearch(p.name, q) || String(p.id).includes(q);
            })
            .map(p => {
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
    );
  }

  // 5. CÁO (THE FOX)
  if (currentRole.id === 'cao') {
    const isLostPower = Boolean(nightState.foxLostPower);
    const isFoundWolf = nightState.foxFoundWolf === true;
    const isNotFoundWolf = nightState.foxFoundWolf === false;
    const isSkipped = Boolean(nightState.foxSkipped);

    if (isLostPower) {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#180a14] via-[#120710] to-[#0a050a] border border-amber-900/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
                  <EyeOff className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-amber-200 text-sm font-cinzel">
                      CÁO (ĐÃ MẤT NĂNG LỰC)
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-300 border border-amber-700/80">
                      Gọi cho có
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gọi Cáo thức dậy để che giấu thân phận trước làng. Cáo không còn quyền đánh hơi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-amber-900/40 text-xs text-amber-200/90 font-mono">
              Quản trò hô: &ldquo;Cáo thức dậy.&rdquo; ➔ Đợi 3 giây ➔ &ldquo;Cáo nhắm mắt lại.&rdquo;
            </div>

            <div className="pt-1 flex items-center justify-between border-t border-amber-950/60">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Đã sẵn sàng chuyển bước
              </span>

              <button
                type="button"
                onClick={() => onSaveAction('fox', null, { foxLostPower: false, foxSkipped: false, foxCheckedThisNight: false, foxFoundWolf: null })}
                className="text-[11px] text-slate-500 hover:text-amber-300 underline cursor-pointer transition-colors"
              >
                Phục hồi năng lực (Nếu bấm nhầm)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm text-amber-200 font-cinzel">
              ĐÁNH HƠI CỦA CÁO
            </h4>
          </div>

          <button
            type="button"
            onClick={() => onSaveAction('fox', null, { foxSkipped: true, foxLostPower: false, foxFoundWolf: null })}
            className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
              isSkipped
                ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            🚫 Đêm Nay Bỏ Qua
          </button>
        </div>

        {/* 2 Primary Decision Case Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Case 1: Soi ra Sói */}
          <button
            type="button"
            onClick={() => onSaveAction('fox', null, { foxLostPower: false, foxSkipped: false, foxCheckedThisNight: true, foxFoundWolf: true })}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 cursor-pointer ${
              isFoundWolf && !isSkipped
                ? 'bg-gradient-to-r from-emerald-950/90 via-[#07271b] to-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400'
                : 'bg-[#0e161a] hover:bg-[#132225] border-emerald-900/60 hover:border-emerald-600/80 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <WolfIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <span className="font-black text-sm sm:text-base font-cinzel text-emerald-200">
                  SOI RA SÓI
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                isFoundWolf && !isSkipped
                  ? 'bg-emerald-900 text-emerald-200 border-emerald-400 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
              }`}>
                Giữ năng lực
              </span>
            </div>

            <div className="text-xs text-emerald-300/80 mt-1">
              Có ít nhất 1 Ma Sói trong nhóm 3 người. Đêm sau Cáo vẫn đánh hơi bình thường.
            </div>

            {isFoundWolf && !isSkipped && (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1 pt-1 border-t border-emerald-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã chọn: Có Sói (Đêm sau soi tiếp)</span>
              </div>
            )}
          </button>

          {/* Case 2: Không ra Sói */}
          <button
            type="button"
            onClick={() => onSaveAction('fox', null, { foxLostPower: true, foxSkipped: false, foxCheckedThisNight: true, foxFoundWolf: false })}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 cursor-pointer ${
              isNotFoundWolf && !isSkipped
                ? 'bg-gradient-to-r from-rose-950/90 via-[#26080e] to-rose-950/90 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.4)] ring-1 ring-rose-400'
                : 'bg-[#180e14] hover:bg-[#25121b] border-rose-900/60 hover:border-rose-600/80 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-600/60 flex items-center justify-center text-rose-400 shrink-0 font-bold text-sm">
                  ✕
                </div>
                <span className="font-black text-sm sm:text-base font-cinzel text-rose-200">
                  KHÔNG RA SÓI
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                isNotFoundWolf && !isSkipped
                  ? 'bg-rose-900 text-rose-200 border-rose-400 shadow-sm'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800'
              }`}>
                Mất năng lực
              </span>
            </div>

            <div className="text-xs text-rose-300/80 mt-1">
              Không có Ma Sói nào trong nhóm. Cáo mất phép vĩnh viễn (đêm sau gọi cho có).
            </div>

            {isNotFoundWolf && !isSkipped && (
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1 mt-1 pt-1 border-t border-rose-800/60">
                <Check className="w-3.5 h-3.5 text-rose-400" />
                <span>Đã chọn: Không có Sói (Đêm sau gọi cho có)</span>
              </div>
            )}
          </button>
        </div>

        {/* Status bar */}
        {isSkipped && (
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-200 text-xs flex items-center justify-between">
            <span>Đã chọn: Bỏ qua không đánh hơi trong đêm nay.</span>
            <span className="text-[10px] font-mono text-amber-300">Đêm sau vẫn giữ năng lực</span>
          </div>
        )}
      </div>
    );
  }

  // 6. SÓI LỚN XẤU XA (BIG BAD WOLF)
  if (currentRole.id === 'soi-lon-xau-xa') {
    if (currentRole.isPowerLost) {
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-[#200407] to-[#120204] border border-rose-800 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-cinzel font-black text-sm text-rose-300">
            <Skull className="w-4 h-4 text-rose-400" />
            <span>NĂNG LỰC CẮN THÊM ĐÃ MẤT</span>
          </div>
          <p className="text-xs text-rose-300/80 leading-relaxed">
            {currentRole.powerLostReason}
          </p>
        </div>
      );
    }

    const bigBadWolfPlayer = players.find(p => (p.currentRoleId || p.roleId) === 'soi-lon-xau-xa');
    const validVictims = alivePlayers.filter(p => {
      if (p.id === nightState.wolfTargetId || p.id === nightState.wolfTargetId2) return false;
      return canWolvesKillTeammates ? p.id !== bigBadWolfPlayer?.id : !isWolfPlayer(p);
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-rose-400 animate-pulse" />
            <h4 className="font-bold text-sm text-rose-200 font-cinzel">
              Lượt cắn Sói Lớn Xấu Xa
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onSaveAction('bigBadWolf', null, { bigBadWolfSkipped: true })}
            className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
              nightState.bigBadWolfSkipped
                ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-md'
                : 'bg-black/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Bỏ Qua (Không Cắn)
          </button>
        </div>

        <PlayerSeatPicker
          players={validVictims}
          selectedIds={!nightState.bigBadWolfSkipped && nightState.bigBadWolfTargetId ? [nightState.bigBadWolfTargetId] : []}
          onSelect={(id) => {
            if (nightState.bigBadWolfTargetId === id && !nightState.bigBadWolfSkipped) {
              onSaveAction('bigBadWolf', null, { bigBadWolfSkipped: false });
            } else {
              onSaveAction('bigBadWolf', id, { bigBadWolfSkipped: false });
            }
          }}
          variant="blood"
          actionLabel="Cắn thêm"
        />
      </div>
    );
  }

  // 7. SÓI TRẮNG (WHITE WEREWOLF)
  if (currentRole.id === 'soi-trang') {
    const otherWolves = alivePlayers
      .filter(p => isWolfPlayer(p) && (p.currentRoleId || p.roleId) !== 'soi-trang')
      .filter(p => {
        if (!roleActionSearch) return true;
        const q = removeVietnameseTones(roleActionSearch);
        return matchesSearch(p.name, q) || String(p.id).includes(q);
      });
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-slate-100" />
            <h4 className="font-bold text-sm text-slate-100 font-cinzel">
              Lượt cắn Sói Trắng
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={roleActionSearch}
                onChange={(e) => setRoleActionSearch(e.target.value)}
                placeholder="Tìm tên..."
                className="w-24 sm:w-32 text-xs py-0.5 pl-6 pr-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={() => onSaveAction('whiteWolf', null, { whiteWolfSkipped: true })}
              className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer shrink-0 ${
                nightState.whiteWolfSkipped
                  ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🚫 Không Cắn
            </button>
          </div>
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
  }

  // 8. NGUYỆT NỮ (MOON PRIESTESS)
  if (currentRole.id === 'nguyet-nu') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoonStar className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-sm text-indigo-200 font-cinzel">
              Khóa phép Nguyệt Nữ
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
    );
  }

  // 8.1 THẦY THÔI MIÊN (HYPNOTIST - MÊ HOẶC THẾ MẠNG)
  if (currentRole.id === 'thay-thoi-mien') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-sm text-blue-200 font-cinzel">
              Mê hoặc Thế Mạng
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onSaveAction('hypnotist', null, { hypnotistSkipped: true })}
            className={`text-xs px-3 py-1 rounded-xl border transition-all font-bold cursor-pointer ${
              nightState.hypnotistSkipped
                ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            🚫 Không Mê Hoặc
          </button>
        </div>

        <PlayerSeatPicker
          players={alivePlayers}
          selectedIds={nightState.hypnotistTargetId && !nightState.hypnotistSkipped ? [nightState.hypnotistTargetId] : []}
          disabledIds={[
            ...alivePlayers.filter(p => (p.currentRoleId || p.roleId) === 'thay-thoi-mien' || getPlayerRole(p)?.id === 'thay-thoi-mien').map(p => p.id),
            ...(nightState.lastNightHypnotistId ? [nightState.lastNightHypnotistId] : [])
          ]}
          onSelect={(id) => {
            onSaveAction('hypnotist', id, { hypnotistSkipped: false });
          }}
          variant="default"
          actionLabel="Mê hoặc"
        />
      </div>
    );
  }

  // 9. THỢ SĂN (HUNTER - ĐÊM 1 NHẬN DIỆN)
  if (currentRole.id === 'tho-san') {
    const hunterPlayer = players.find(p => (p.currentRoleId || p.roleId) === 'tho-san' || getPlayerRole(p)?.id === 'tho-san');
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#14121e] border border-amber-500/30 text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-300 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm font-cinzel">Nhận Diện Thợ Săn</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Thức dậy nhận diện Đêm 1 • Tự động kích hoạt phát súng khi tử trận
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {hunterPlayer ? (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 shadow-sm">
                #{hunterPlayer.id} {hunterPlayer.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>

        {!hunterPlayer && typeof onAssignRole === 'function' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Chỉ định người giữ vai Thợ Săn:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {alivePlayers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAssignRole(p.id, currentRole)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-[#121422] hover:bg-[#1a1c30] hover:border-amber-500/50 text-slate-200 text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="truncate">
                    <span className="font-bold text-xs">#{p.id} {p.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {getPlayerRole(p)?.name || 'Chưa gán'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold shrink-0">Chọn vai</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 9.5. KỊ SĨ (KNIGHT - ĐÊM 1 NHẬN DIỆN & GÁN VAI)
  if (currentRole.id === 'ki-si') {
    const knightHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'ki-si' || getPlayerRole(p)?.id === 'ki-si');
    const knightPlayer = knightHolders[0] || null;
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#0c1424] border border-blue-500/40 text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-600/50 text-blue-300 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-blue-200 text-sm font-cinzel">Nhận Diện Kị Sĩ</div>
              <div className="text-xs text-blue-300/80 mt-0.5">
                Thức dậy trong Đêm 1 để nhận diện • Ban ngày có thể lật bài quyết đấu 1 lần duy nhất
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {knightPlayer ? (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-950/90 border border-blue-500 text-blue-200 shadow-sm">
                #{knightPlayer.id} {knightPlayer.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>

        {!knightPlayer && typeof onAssignRole === 'function' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Chỉ định người giữ vai Kị Sĩ:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {alivePlayers.map(p => {
                const pRole = getPlayerRole(p);
                const hasOther = Boolean(pRole && pRole.id !== 'ki-si');
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={hasOther}
                    onClick={() => onAssignRole(p.id, currentRole)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      hasOther
                        ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                        : 'bg-[#101424] hover:bg-blue-950/60 border-slate-800 hover:border-blue-500 text-slate-200 cursor-pointer active:scale-95'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">#{p.id} {p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {hasOther ? pRole.name : 'Chưa có vai'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 10. HAI CHỊ EM (TWO SISTERS - ĐÊM 1 NHẬN DIỆN & GÁN VAI TRỰC TIẾP)
  if (currentRole.id === 'hai-chi-em') {
    const sisters = players.filter(p => (p.currentRoleId || p.roleId) === 'hai-chi-em' || getPlayerRole(p)?.id === 'hai-chi-em');
    const sisterIds = sisters.map(s => s.id);

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#14121e] border border-pink-500/30 text-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-950/60 border border-pink-600/40 text-pink-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-pink-200 text-sm font-cinzel">Hai Chị Em Nhận Diện Nhau</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Thức dậy trong Đêm 1 để biết mặt nhau ({sisters.length}/2 người)
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sisters.length > 0 ? (
              sisters.map(s => (
                <span key={s.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-pink-950/80 border border-pink-600 text-pink-200">
                  #{s.id} {s.name}
                </span>
              ))
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>

        {/* Seat Picker for Hai Chị Em (Hỗ trợ gán / đổi người khi gán nhầm) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
              Chọn Đúng 2 Ghế Cho Vai Hai Chị Em ({sisterIds.length}/2):
            </span>
            {sisterIds.length > 0 && typeof onAssignRoleToMultiple === 'function' && (
              <button
                type="button"
                onClick={() => onAssignRoleToMultiple([], 'hai-chi-em')}
                className="text-[11px] text-slate-400 hover:text-pink-300 cursor-pointer"
              >
                ✕ Xóa gán lại
              </button>
            )}
          </div>
          <PlayerSeatPicker
            players={players}
            selectedIds={sisterIds}
            onSelect={(id) => {
              let next = [];
              if (sisterIds.includes(id)) {
                next = sisterIds.filter(x => x !== id);
              } else if (sisterIds.length < 2) {
                next = [...sisterIds, id];
              } else {
                next = [sisterIds[1], id];
              }
              if (typeof onAssignRoleToMultiple === 'function') {
                onAssignRoleToMultiple(next, 'hai-chi-em');
              }
            }}
            maxSelect={2}
            variant="cupid"
            isWolfPlayer={isWolfPlayer}
          />
        </div>
      </div>
    );
  }

  // 11. BA ANH EM (THREE BROTHERS - ĐÊM 1 NHẬN DIỆN & GÁN VAI TRỰC TIẾP)
  if (currentRole.id === 'ba-anh-em') {
    const brothers = players.filter(p => (p.currentRoleId || p.roleId) === 'ba-anh-em' || getPlayerRole(p)?.id === 'ba-anh-em');
    const brotherIds = brothers.map(b => b.id);

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#14121e] border border-blue-500/30 text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-600/40 text-blue-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-blue-200 text-sm font-cinzel">Ba Anh Em Nhận Diện Nhau</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Thức dậy trong Đêm 1 để biết mặt nhau ({brothers.length}/3 người)
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {brothers.length > 0 ? (
              brothers.map(b => (
                <span key={b.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-600 text-blue-200">
                  #{b.id} {b.name}
                </span>
              ))
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>

        {/* Seat Picker for Ba Anh Em (Hỗ trợ gán / đổi người khi gán nhầm) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Chọn Đúng 3 Ghế Cho Vai Ba Anh Em ({brotherIds.length}/3):
            </span>
            {brotherIds.length > 0 && typeof onAssignRoleToMultiple === 'function' && (
              <button
                type="button"
                onClick={() => onAssignRoleToMultiple([], 'ba-anh-em')}
                className="text-[11px] text-slate-400 hover:text-blue-300 cursor-pointer"
              >
                ✕ Xóa gán lại
              </button>
            )}
          </div>
          <PlayerSeatPicker
            players={players}
            selectedIds={brotherIds}
            onSelect={(id) => {
              let next = [];
              if (brotherIds.includes(id)) {
                next = brotherIds.filter(x => x !== id);
              } else if (brotherIds.length < 3) {
                next = [...brotherIds, id];
              } else {
                next = [...brotherIds.slice(1), id];
              }
              if (typeof onAssignRoleToMultiple === 'function') {
                onAssignRoleToMultiple(next, 'ba-anh-em');
              }
            }}
            maxSelect={3}
            variant="villager"
            isWolfPlayer={isWolfPlayer}
          />
        </div>
      </div>
    );
  }

  // 12. CHÓ SÓI / SÓI LAI (WOLF-DOG - ĐÊM 1 TỰ CHỌN PHE)
  if (currentRole.id === 'cho-soi-soi-lai') {
    const dogHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'cho-soi-soi-lai' || p.originalRoleId === 'cho-soi-soi-lai');
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-amber-500/30 text-amber-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm">Chó Sói / Sói Lai Chọn Phe</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Vào Đêm 1, người chơi tự chọn theo phe Dân Làng hay gia nhập Phe Sói vĩnh viễn.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dogHolders.length > 0 ? (
              dogHolders.map(d => {
                const isWolf = isWolfPlayer(d);
                return (
                  <div key={d.id} className="flex items-center gap-2 bg-[#0c0d14] p-1.5 px-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-white">#{d.id} {d.name}:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof onAssignRole === 'function') onAssignRole(d.id, 'dan-lang');
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                        !isWolf
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Phe Dân 👨‍🌾
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof onAssignRole === 'function') onAssignRole(d.id, 'soi-thuong');
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                        isWolf
                          ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Phe Sói 🐺
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>

        {dogHolders.length === 0 && typeof onAssignRole === 'function' && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-300">Gán vai Chó Sói / Sói Lai:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {alivePlayers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAssignRole(p.id, 'cho-soi-soi-lai')}
                  className="p-2 rounded-xl border border-slate-800 bg-[#101424] hover:border-amber-500 text-xs text-left text-slate-200 cursor-pointer"
                >
                  #{p.id} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 12.1 THẨM PHÁN LẮP BẮP (ĐÊM 1 THỐNG NHẤT ÁM HIỆU)
  if (currentRole.id === 'tham-phan-lap-bap') {
    const judgeHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'tham-phan-lap-bap' || getPlayerRole(p)?.id === 'tham-phan-lap-bap');
    const currentSignal = nightState.stutteringJudgeSignal || 'Gãi tai';
    const SIGNALS = ['Gãi tai', 'Chớp mắt hai lần', 'Vỗ tay nhẹ', 'Xoa cằm'];
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-blue-500/30 text-blue-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-600/40 text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-blue-200 text-sm">Thẩm Phán Lắp Bắp — Thống Nhất Ám Hiệu</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Thống nhất một ký hiệu bí mật để kích hoạt vòng biểu quyết lần 2 vào ban ngày
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {judgeHolders.length > 0 ? (
              judgeHolders.map(j => (
                <span key={j.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-600 text-blue-200">
                  #{j.id} {j.name}
                </span>
              ))
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                Chưa gán vai
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {SIGNALS.map(sig => (
            <button
              key={sig}
              type="button"
              onClick={() => onSaveAction('stuttering_judge_signal', sig)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                currentSignal === sig
                  ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-md'
                  : 'bg-[#101424] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 12.2 ANH EM SÓI (ĐÊM 1 NHẬN DIỆN & PHÂN VAI)
  if (currentRole.id === 'anh-em-soi') {
    const brothers = players.filter(p => (p.currentRoleId || p.roleId) === 'anh-em-soi' || getPlayerRole(p)?.id === 'anh-em-soi');
    const bigBroId = nightState.wolfBigBrotherId || brothers.find(b => !b.isLittleBrother)?.id;
    const littleBroId = nightState.wolfLittleBrotherId || brothers.find(b => b.isLittleBrother)?.id;
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-rose-500/30 text-rose-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 shrink-0">
              <WolfIcon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="font-bold text-rose-200 text-sm">Anh Em Sói — Nhận Diện & Phân Vai</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Đêm 1 thức dậy nhận mặt nhau. Sói Em soi ra Dân Làng cho đến khi Sói Anh ngã xuống!
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {brothers.map(b => {
            const isBig = bigBroId === b.id;
            const isLittle = littleBroId === b.id;
            return (
              <div key={b.id} className="p-3 rounded-2xl bg-[#0e101c] border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-200">#{b.id} {b.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {isLittle ? 'Sói Em (Tiên Tri soi ra Dân)' : isBig ? 'Sói Anh (Đi săn cùng bầy)' : 'Chưa phân vai'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const otherBro = brothers.find(x => x.id !== b.id);
                      onSaveAction('wolf_brothers_designate', { bigBrotherId: b.id, littleBrotherId: otherBro?.id || null });
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isBig ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Sói Anh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const otherBro = brothers.find(x => x.id !== b.id);
                      onSaveAction('wolf_brothers_designate', { bigBrotherId: otherBro?.id || null, littleBrotherId: b.id });
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isLittle ? 'bg-indigo-950 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Sói Em
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 12.3 SÓI LỬA (CÁO LỬA - THIÊU RỤI NĂNG LỰC)
  if (currentRole.id === 'soi-lua') {
    const fireTargetId = nightState.fireWolfTargetId;
    const fireTarget = players.find(p => p.id === fireTargetId);
    const isSkipped = nightState.fireWolfSkipped;
    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 shrink-0">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="font-bold text-rose-200 text-sm font-cinzel">Sói Lửa (Thiêu Rụi Năng Lực)</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Chọn 1 người để tước đoạt vĩnh viễn năng lực đặc biệt
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {fireTarget ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200">
                Thiêu rụi: #{fireTarget.id} {fireTarget.name}
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn
              </span>
            )}
          </div>
        </div>
        <PlayerSeatPicker
          players={alivePlayers.filter(p => !isWolfPlayer(p))}
          selectedIds={fireTargetId ? [fireTargetId] : []}
          onSelect={(id) => {
            const nextId = fireTargetId === id ? null : id;
            onSaveAction('fire_wolf', nextId, { fireWolfSkipped: false });
          }}
          variant="wolf"
          actionLabel="Thiêu rụi"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveAction('fire_wolf', null, { fireWolfSkipped: true })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSkipped
                ? 'bg-rose-950 border-rose-500 text-rose-200'
                : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚫 Bỏ Qua Đêm Nay
          </button>
        </div>
      </div>
    );
  }

  // 15. SÁT THỦ (THÍCH KHÁCH)
  if (currentRole.id === 'sat-thu') {
    const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'sat-thu' || getPlayerRole(p)?.id === 'sat-thu');
    const targetId = nightState.assassinTargetId;
    const targetPlayer = players.find(p => p.id === targetId);
    const isSkipped = nightState.assassinSkipped;
    const holderIds = holders.map(h => h.id);

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/40 text-purple-300 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-purple-200 text-sm font-cinzel">Sát Thủ (Thích Khách)</div>
              <div className="text-xs text-slate-400 mt-0.5">Mục tiêu ám sát bí mật trong đêm</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {targetPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500 text-purple-200">
                Ám sát: #{targetPlayer.id} {targetPlayer.name}
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn
              </span>
            )}
          </div>
        </div>

        <PlayerSeatPicker
          players={alivePlayers}
          selectedIds={targetId ? [targetId] : []}
          disabledIds={holderIds}
          onSelect={(id) => {
            if (targetId === id) {
              onSaveAction('assassin', null, { assassinSkipped: false });
            } else {
              onSaveAction('assassin', id, { assassinSkipped: false });
            }
          }}
          variant="wolf"
          actionLabel="Ám sát"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveAction('assassin', null, { assassinSkipped: true })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSkipped
                ? 'bg-purple-950 border-purple-500 text-purple-200'
                : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚫 Không Ám Sát Đêm Nay
          </button>
        </div>
      </div>
    );
  }

  // 16. KẺ ĐỐT NHÀ (HỎA HOẠN)
  if (currentRole.id === 'ke-dot-nha') {
    const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'ke-dot-nha' || getPlayerRole(p)?.id === 'ke-dot-nha');
    const targetId = nightState.pyroTargetId;
    const targetPlayer = players.find(p => p.id === targetId);
    const isSkipped = nightState.pyroSkipped;
    const holderIds = holders.map(h => h.id);

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm font-cinzel">Kẻ Đốt Nhà (Hỏa Hoạn)</div>
              <div className="text-xs text-slate-400 mt-0.5">Tẩm dầu phóng hỏa nhà người chơi</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {targetPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200">
                Phóng hỏa: #{targetPlayer.id} {targetPlayer.name}
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn nhà
              </span>
            )}
          </div>
        </div>

        <PlayerSeatPicker
          players={alivePlayers}
          selectedIds={targetId ? [targetId] : []}
          disabledIds={holderIds}
          onSelect={(id) => {
            if (targetId === id) {
              onSaveAction('pyro', null, { pyroSkipped: false });
            } else {
              onSaveAction('pyro', id, { pyroSkipped: false });
            }
          }}
          variant="protect"
          actionLabel="Tẩm dầu"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveAction('pyro', null, { pyroSkipped: true })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSkipped
                ? 'bg-amber-950 border-amber-500 text-amber-200'
                : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚫 Không Phóng Hỏa Đêm Nay
          </button>
        </div>
      </div>
    );
  }

  // 17. ĂN TRỘM
  if (currentRole.id === 'an-trom') {
    const thiefHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'an-trom' || p.originalRoleId === 'an-trom');
    const thiefPlayer = thiefHolders[0] || null;
    const chosenRoleId = nightState.thiefChosenRoleId;
    const chosenRole = chosenRoleId ? ROLES.find(r => r.id === chosenRoleId) : null;

    const assignedCounts = {};
    players.forEach(p => {
      const rid = p.currentRoleId || p.roleId;
      if (rid) assignedCounts[rid] = (assignedCounts[rid] || 0) + 1;
    });
    const unassignedDeckRoles = [];
    const deckCounts = {};
    (deckRoleIds || []).forEach(rid => {
      deckCounts[rid] = (deckCounts[rid] || 0) + 1;
    });
    Object.entries(deckCounts).forEach(([rid, count]) => {
      const left = Math.max(0, count - (assignedCounts[rid] || 0));
      for (let i = 0; i < left; i++) {
        unassignedDeckRoles.push(rid);
      }
    });
    const candidateRoleIds = unassignedDeckRoles.length >= 2 
      ? unassignedDeckRoles.slice(0, 2) 
      : (deckRoleIds.length >= 2 ? deckRoleIds.slice(0, 2) : ['soi-thuong', 'dan-lang']);
    
    const candidateRoles = candidateRoleIds.map(rid => ROLES.find(r => r.id === rid) || { id: rid, name: rid, teamCode: 'V' });
    const hasWolfCard = candidateRoles.some(r => r.teamCode === 'W' || r.id.startsWith('soi-'));

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-300 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200 text-sm font-cinzel">Ăn Trộm — Xem Bài Thừa & Đổi Vai</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {hasWolfCard ? 'Có lá Ma Sói — Bắt buộc phải chọn Ma Sói' : 'Chọn 1 lá bài thừa hoặc giữ nguyên Dân Làng'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {chosenRole ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500 text-indigo-200">
                Đã nhận: {chosenRole.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa đổi
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {candidateRoles.map((role) => {
            const isSelected = chosenRoleId === role.id;
            const isWolf = role.teamCode === 'W' || role.id.startsWith('soi-');
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onSaveAction('thief_swap', role.id);
                  if (thiefPlayer && typeof onAssignRole === 'function') {
                    onAssignRole(thiefPlayer.id, role.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'bg-[#121422] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${isWolf ? 'bg-rose-950/50 border-rose-600 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                    {isWolf ? <WolfIcon className="w-5 h-5 text-rose-400" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">{role.name}</div>
                    <div className="text-xs text-slate-400">{role.team || (isWolf ? 'Phe Ma Sói' : 'Phe Dân Làng')}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {isSelected ? 'Đang giữ vai' : 'Chọn vai'}
                </span>
              </button>
            );
          })}
        </div>

        {!hasWolfCard && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onSaveAction('thief_swap', 'dan-lang');
                if (thiefPlayer && typeof onAssignRole === 'function') {
                  onAssignRole(thiefPlayer.id, 'dan-lang');
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-[#121422] text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Giữ Nguyên Dân Thường
            </button>
          </div>
        )}
      </div>
    );
  }

  // 18. DIỄN VIÊN
  if (currentRole.id === 'dien-vien') {
    const actorHolders = players.filter(p => (p.currentRoleId || p.roleId) === 'dien-vien' || p.originalRoleId === 'dien-vien');
    const actorPlayer = actorHolders[0] || null;
    const chosenRoleId = nightState.actorChosenRoleId;
    const chosenRole = chosenRoleId ? ROLES.find(r => r.id === chosenRoleId) : null;

    const assignedCounts = {};
    players.forEach(p => {
      const rid = p.currentRoleId || p.roleId;
      if (rid) assignedCounts[rid] = (assignedCounts[rid] || 0) + 1;
    });
    const unassignedDeckRoles = [];
    const deckCounts = {};
    (deckRoleIds || []).forEach(rid => {
      deckCounts[rid] = (deckCounts[rid] || 0) + 1;
    });
    Object.entries(deckCounts).forEach(([rid, count]) => {
      const left = Math.max(0, count - (assignedCounts[rid] || 0));
      for (let i = 0; i < left; i++) {
        unassignedDeckRoles.push(rid);
      }
    });
    const candidateRoleIds = unassignedDeckRoles.length >= 3 
      ? unassignedDeckRoles.slice(0, 3) 
      : (deckRoleIds.length >= 3 ? deckRoleIds.slice(0, 3) : ['bao-ve', 'phu-thuy', 'tho-san']);
    const candidateRoles = candidateRoleIds.map(rid => ROLES.find(r => r.id === rid) || { id: rid, name: rid, teamCode: 'V' });

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shrink-0">
              <Theater className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm font-cinzel">Diễn Viên (3 Đêm Đầu) — Đêm {roundNumber}</div>
              <div className="text-xs text-slate-400 mt-0.5">Chọn 1 vai diễn để hóa thân hoặc giữ nguyên</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {chosenRole ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200">
                Đang diễn: {chosenRole.name}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                {roundNumber <= 3 ? 'Chưa chọn vai' : 'Thành Dân Thường'}
              </span>
            )}
          </div>
        </div>

        {roundNumber <= 3 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {candidateRoles.map((role) => {
              const isSelected = chosenRoleId === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    onSaveAction('actor_swap', role.id);
                    if (actorPlayer && typeof onAssignRole === 'function') {
                      onAssignRole(actorPlayer.id, role.id);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-400'
                      : 'bg-[#121422] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-200">{role.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{role.team || 'Phe Dân Làng'}</div>
                  </div>
                  <span className={`text-[11px] font-bold self-end px-2 py-0.5 rounded-lg ${isSelected ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isSelected ? 'Đang nhận' : 'Hóa thân'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
            Đã qua 3 đêm đầu. Diễn Viên tiếp tục chơi như một Dân Làng bình thường.
          </div>
        )}
      </div>
    );
  }

  // 19. DƯỢC SĨ
  if (currentRole.id === 'duoc-si') {
    const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'duoc-si' || getPlayerRole(p)?.id === 'duoc-si');
    const sleepTargetId = nightState.apothecarySleepTargetId;
    const curePoison = !!nightState.apothecaryCurePoison;
    const sleepTargetPlayer = players.find(p => p.id === sleepTargetId);
    const isSkipped = nightState.apothecarySkipped;
    const hasSleep = nightState.apothecaryHasSleep !== false;
    const hasAntidote = nightState.apothecaryHasAntidote !== false;

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-600/40 text-teal-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-teal-200 text-sm font-cinzel">Dược Sĩ — 2 Bình Thuốc</div>
              <div className="text-xs text-slate-400 mt-0.5">Thuốc mê câm lặng/cấm vote & Giải độc Phù Thủy</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {sleepTargetPlayer && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-950/80 border border-teal-500 text-teal-200">
                Thuốc mê: #{sleepTargetPlayer.id} {sleepTargetPlayer.name}
              </span>
            )}
            {curePoison && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200">
                Hồi Phục: Đang kích hoạt
              </span>
            )}
            {!hasSleep && !hasAntidote && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Đã hết 2 bình
              </span>
            )}
          </div>
        </div>

        {!hasSleep && !hasAntidote ? (
          <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-700/60 text-teal-200 text-center space-y-2">
            <div className="text-xl">🧪✨</div>
            <div className="font-bold text-sm">Đã Dùng Hết 2 Bình Thuốc</div>
            <div className="text-xs text-slate-400">
              Dược Sĩ đã sử dụng cả Bình Thuốc Mê và Bình Hồi Phục trong ván đấu.
            </div>
          </div>
        ) : (
          <>
            {/* Bình Hồi Phục */}
            <div className="p-3 rounded-2xl bg-[#121422] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-200">Bình Hồi Phục (Cứu Độc Phù Thủy)</div>
                <div className="text-xs text-slate-400">
                  {hasAntidote ? 'Hóa giải bình thuốc độc của Phù Thủy trong đêm nay (1 lần/ván)' : 'Đã sử dụng trong các đêm trước'}
                </div>
              </div>
              {hasAntidote ? (
                <button
                  type="button"
                  onClick={() => {
                    onSaveAction('apothecary', null, {
                      sleepTargetId,
                      curePoison: !curePoison,
                      apothecarySkipped: false
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    curePoison
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curePoison ? '✓ Đang Dùng Cứu' : 'Dùng Bình'}
                </button>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-bold">
                  Đã sử dụng
                </span>
              )}
            </div>

            {/* Bình Thuốc Mê */}
            {hasSleep ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Bình Thuốc Mê (Cấm Nói & Cấm Biểu Quyết Ngày Mai — 1 lần/ván):
                </div>
                <PlayerSeatPicker
                  players={alivePlayers}
                  selectedIds={sleepTargetId ? [sleepTargetId] : []}
                  onSelect={(id) => {
                    const nextSleepId = sleepTargetId === id ? null : id;
                    onSaveAction('apothecary', null, {
                      sleepTargetId: nextSleepId,
                      curePoison,
                      apothecarySkipped: false
                    });
                  }}
                  variant="seer"
                  actionLabel="Gây mê"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                💤 Bình Thuốc Mê: Đã sử dụng trong các đêm trước.
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSaveAction('apothecary', null, { sleepTargetId: null, curePoison: false, apothecarySkipped: true })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSkipped
                    ? 'bg-teal-950 border-teal-500 text-teal-200'
                    : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚫 Không Dùng Thuốc Đêm Nay
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 20. NGƯỜI MÚA RỐI
  if (currentRole.id === 'nguoi-mua-roi') {
    const holders = players.filter(p => (p.currentRoleId || p.roleId) === 'nguoi-mua-roi' || getPlayerRole(p)?.id === 'nguoi-mua-roi');
    const targetId = nightState.puppeteerTargetId;
    const targetPlayer = players.find(p => p.id === targetId);
    const isSkipped = nightState.puppeteerSkipped;
    const isAlreadyUsed = nightState.puppeteerUsed && !targetId;

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-600/40 text-indigo-300 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-indigo-200 text-sm font-cinzel">Người Múa Rối (Thao Túng Đàn Sói)</div>
              <div className="text-xs text-slate-400 mt-0.5">Ép bầy Sói đổi mục tiêu cắn (1 lần / ván)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {targetPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500 text-indigo-200">
                Rối điều khiển: #{targetPlayer.id} {targetPlayer.name}
              </span>
            ) : isAlreadyUsed ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Đã dùng 1 lần/ván
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa kích hoạt
              </span>
            )}
          </div>
        </div>

        {isAlreadyUsed ? (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 text-indigo-200 text-center space-y-2">
            <div className="text-xl">🎭✨</div>
            <div className="font-bold text-sm">Đã Sử Dụng Quyền Năng Múa Rối</div>
            <div className="text-xs text-slate-400">
              Người Múa Rối đã kích hoạt năng lực thao túng bầy Sói trước đó (chỉ sử dụng 1 lần duy nhất trong cả ván).
            </div>
          </div>
        ) : (
          <>
            <PlayerSeatPicker
              players={alivePlayers}
              selectedIds={targetId ? [targetId] : []}
              onSelect={(id) => {
                if (targetId === id) {
                  onSaveAction('puppeteer', null, { puppeteerSkipped: false });
                } else {
                  onSaveAction('puppeteer', id, { puppeteerSkipped: false });
                }
              }}
              variant="wolf"
              actionLabel="Thao túng"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSaveAction('puppeteer', null, { puppeteerSkipped: true })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSkipped
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚫 Không Can Thiệp Đêm Nay
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 21. BÀ ĐỒNG
  if (currentRole.id === 'ba-dong') {
    const targetId = nightState.soothsayerTargetId;
    const targetPlayer = players.find(p => p.id === targetId);
    const selectedQuestion = nightState.soothsayerQuestion || 'Có ít nhất 1 Ma Sói ngồi cạnh người này không?';
    const soothsayerCount = nightState.soothsayerCount || 0;
    const isSkipped = nightState.soothsayerSkipped;
    const isExhausted = soothsayerCount >= 5;

    const QUESTIONS = [
      'Có ít nhất 1 Ma Sói ngồi cạnh người này không?',
      'Người này thuộc phe Dân Làng hay phe Đối Nghịch?',
      'Đêm nay có ai bị phù phép hoặc trúng độc không?',
      'Người này có từng biến đổi vai trò chưa?'
    ];

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-600/40 text-blue-300 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-blue-200 text-sm font-cinzel">Bà Đồng — Linh Cảm Tâm Linh ({Math.min(soothsayerCount, 5)}/5 lần)</div>
              <div className="text-xs text-slate-400 mt-0.5">Đặt câu hỏi tâm linh cho 1 người chơi trả lời sáng mai</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {targetPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-950/80 border border-blue-500 text-blue-200">
                Chỉ định: #{targetPlayer.id} {targetPlayer.name}
              </span>
            ) : isExhausted ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Đã hết 5 lượt
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn
              </span>
            )}
          </div>
        </div>

        {isExhausted ? (
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-700/60 text-blue-200 text-center space-y-2">
            <div className="text-xl">🔮✨</div>
            <div className="font-bold text-sm">Đã Dùng Hết 5 Lượt Hỏi Tâm Linh</div>
            <div className="text-xs text-slate-400">
              Bà Đồng đã hoàn thành tối đa 5 lần gọi hồn trong ván đấu.
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">Chọn Câu Hỏi Tâm Linh:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSaveAction('soothsayer', targetId, { question: q, soothsayerSkipped: false })}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      selectedQuestion === q
                        ? 'bg-blue-950/70 border-blue-500 text-blue-200 font-bold'
                        : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <PlayerSeatPicker
              players={alivePlayers}
              selectedIds={targetId ? [targetId] : []}
              onSelect={(id) => {
                const nextTarget = targetId === id ? null : id;
                onSaveAction('soothsayer', nextTarget, { question: selectedQuestion, soothsayerSkipped: false });
              }}
              variant="seer"
              actionLabel="Chỉ định"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSaveAction('soothsayer', null, { question: selectedQuestion, soothsayerSkipped: true })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSkipped
                    ? 'bg-blue-950 border-blue-500 text-blue-200'
                    : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚫 Bỏ Qua Đêm Nay
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 22. NGƯỜI GỌI HỒN
  if (currentRole.id === 'nguoi-goi-hon') {
    const suspectId = nightState.spiritualistSuspectId;
    const suspectPlayer = players.find(p => p.id === suspectId);
    const deadPlayers = players.filter(p => !p.isAlive);
    const lastDead = deadPlayers[deadPlayers.length - 1];
    const isSkipped = nightState.spiritualistSkipped;

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-cyan-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-600/40 text-cyan-300 shrink-0">
              <Ghost className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-cyan-200 text-sm font-cinzel">Người Gọi Hồn (Chỉ Điểm Hồn Ma)</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {lastDead ? `Hồn ma gần nhất: #${lastDead.id} ${lastDead.name}` : 'Chưa có người chết'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {suspectPlayer ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-200">
                Hồn ma nghi ngờ: #{suspectPlayer.id} {suspectPlayer.name}
              </span>
            ) : isSkipped ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Bỏ qua đêm nay
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa ghi nhận
              </span>
            )}
          </div>
        </div>

        <PlayerSeatPicker
          players={alivePlayers}
          selectedIds={suspectId ? [suspectId] : []}
          onSelect={(id) => {
            const nextId = suspectId === id ? null : id;
            onSaveAction('spiritualist', nextId, { spiritualistSkipped: false });
          }}
          variant="seer"
          actionLabel="Nghi ngờ"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveAction('spiritualist', null, { spiritualistSkipped: true })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSkipped
                ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                : 'bg-[#121422] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚫 Bỏ Qua Đêm Nay
          </button>
        </div>
      </div>
    );
  }

  // 23. KẺ BÁO THÙ
  if (currentRole.id === 'ke-bao-thu') {
    const chosenFaction = nightState.avengerChosenFaction;

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-rose-200 text-sm font-cinzel">Kẻ Báo Thù — Chọn Phe Tôn Thờ</div>
              <div className="text-xs text-slate-400 mt-0.5">Bí mật chọn theo phe Dân Làng hoặc Ma Sói</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {chosenFaction === 'V' ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-sky-950/80 border border-sky-500 text-sky-200">
                🛡️ Phe Dân Làng
              </span>
            ) : chosenFaction === 'W' ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200">
                🐺 Phe Ma Sói
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400">
                Chưa chọn phe
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSaveAction('avenger_allegiance', 'V')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              chosenFaction === 'V'
                ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-[#121422] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-600/40 text-sky-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-sky-200">Phe Dân Làng</div>
                <div className="text-xs text-slate-400 mt-0.5">Khi chết, kích hoạt báo thù nếu bị phe Sói giết</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSaveAction('avenger_allegiance', 'W')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              chosenFaction === 'W'
                ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-[#121422] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300">
                <WolfIcon className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="font-bold text-sm text-rose-200">Phe Ma Sói</div>
                <div className="text-xs text-slate-400 mt-0.5">Khi chết, kích hoạt báo thù nếu bị phe Dân giết</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 24. THÀNH VIÊN GIÁO PHÁI
  if (currentRole.id === 'thanh-vien-giao-phai') {
    const cultMap = nightState.cultGroupMap || {};
    const groupACount = alivePlayers.filter(p => (cultMap[p.id] || p.cultGroup) === 'A').length;
    const groupBCount = alivePlayers.filter(p => (cultMap[p.id] || p.cultGroup) === 'B').length;

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#14121e] border border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/40 text-purple-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-purple-200 text-sm font-cinzel">Thành Viên Giáo Phái — Phân Chia Nhóm</div>
              <div className="text-xs text-slate-400 mt-0.5">Thắng khi toàn bộ phe đối địch bị tiêu diệt</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500 text-purple-200">
              Phái A: {groupACount} sống
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200">
              Phái B: {groupBCount} sống
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {alivePlayers.map(p => {
            const currentGroup = cultMap[p.id] || p.cultGroup || null;
            return (
              <div key={p.id} className="p-2.5 rounded-xl border border-slate-800 bg-[#121422] flex flex-col justify-between gap-2">
                <div className="truncate">
                  <span className="font-bold text-xs text-slate-200">#{p.id} {p.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{getPlayerRole(p)?.name || 'Chưa gán'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const nextMap = { ...cultMap, [p.id]: currentGroup === 'A' ? null : 'A' };
                      onSaveAction('cult_setup', nextMap);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentGroup === 'A'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Phái A
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMap = { ...cultMap, [p.id]: currentGroup === 'B' ? null : 'B' };
                      onSaveAction('cult_setup', nextMap);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      currentGroup === 'B'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Phái B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Giao diện dự phòng tiêu chuẩn cho các vai trò đêm khác
  const assignedHolders = players.filter(p => (p.currentRoleId || p.roleId) === currentRole.id || getPlayerRole(p)?.id === currentRole.id);
  return (
    <div className="p-4 rounded-2xl bg-[#14121e] border border-purple-500/30 text-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/40 text-purple-300 shrink-0">
          <MoonStar className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-purple-200 text-sm">{currentRole.name}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {currentRole.shortDesc || currentRole.gmCall || 'Gọi thức dậy trong đêm theo diễn biến ván đấu.'}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {assignedHolders.length > 0 ? (
          assignedHolders.map(h => (
            <span key={h.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-600 text-purple-200">
              #{h.id} {h.name}
            </span>
          ))
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
            Chưa gán vai
          </span>
        )}
      </div>
    </div>
  );
}
