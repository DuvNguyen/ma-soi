import React from 'react';
import { Flame, Ghost, Wand2, Eye, Skull, MoonStar, Crosshair, Users } from 'lucide-react';
import PlayerSeatPicker from '../PlayerSeatPicker';
import WolfIcon from '../ui/WolfIcon';
import { getPlayerRole } from '../../utils/roleUtils';

export default function NightSpecialRolesStep({
  currentRole,
  players,
  alivePlayers,
  nightState,
  canWolvesKillTeammates,
  onSaveAction,
  isWolfPlayer
}) {
  // 1. ĐỨA TRẺ HOANG DÃ (WILD CHILD)
  if (currentRole.id === 'dua-tre-hoang-da') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-sm text-amber-200 font-cinzel">
            Thần Tượng liên kết
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
    );
  }

  // 2. ẢNH TỬ (SHADOW / DOPPELGANGER)
  if (currentRole.id === 'anh-tu') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ghost className="w-5 h-5 text-purple-400" />
          <h4 className="font-bold text-sm text-purple-200 font-cinzel">
            Bản Thể liên kết
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
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-bold">
            Tiến độ: {hypnotizedCount}/{targetVictimsCount} người bị mê hoặc
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {alivePlayers.map(p => {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-slate-300" />
            <h4 className="font-bold text-sm text-slate-200 font-cinzel">
              Dấu ấn Quạ
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
    );
  }

  // 5. CÁO (THE FOX)
  if (currentRole.id === 'cao') {
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
              Đánh hơi của Cáo
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
          Kiểm tra tâm điểm và 2 người ngồi kề cận. Có Sói: giữ phép; Không có Sói: mất phép.
        </p>

        {foxCenterPlayer && triplet.length === 3 && (
          <div className={`p-3.5 rounded-2xl border text-center space-y-1 backdrop-blur-md animate-fade-in ${
            tripletHasWolf
              ? 'bg-gradient-to-r from-emerald-950/90 via-[#062419] to-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(168,85,129,0.3)]'
              : 'bg-gradient-to-r from-rose-950/90 via-[#26080e] to-rose-950/90 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
          }`}>
            <div className="text-xs uppercase tracking-wider font-bold">
              Nhóm 3 người: #{triplet[0].id} {triplet[0].name} — <strong className="underline">#{triplet[1].id} {triplet[1].name}</strong> — #{triplet[2].id} {triplet[2].name}
            </div>
            <div className="text-base font-black font-cinzel">
              {tripletHasWolf ? '✓ CÓ MA SÓI (Giữ năng lực)' : '✗ KHÔNG CÓ MA SÓI (Mất năng lực)'}
            </div>
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
    const otherWolves = alivePlayers.filter(p => isWolfPlayer(p) && (p.currentRoleId || p.roleId) !== 'soi-trang');
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-slate-100" />
            <h4 className="font-bold text-sm text-slate-100 font-cinzel">
              Lượt cắn Sói Trắng
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

  // 9. THỢ SĂN (HUNTER - ĐÊM 1 NHẬN DIỆN)
  if (currentRole.id === 'tho-san') {
    const hunterPlayer = players.find(p => (p.currentRoleId || p.roleId) === 'tho-san');
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-amber-500/30 text-amber-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-amber-200 text-sm">Nhận Diện Thợ Săn</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Thức dậy nhận diện Đêm 1 • Tự động kích hoạt phát súng khi tử trận
            </div>
          </div>
        </div>
        <div>
          {hunterPlayer ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300">
              #{hunterPlayer.id} {hunterPlayer.name}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
              Chưa gán
            </span>
          )}
        </div>
      </div>
    );
  }

  // 10. HAI CHỊ EM (TWO SISTERS - ĐÊM 1 NHẬN DIỆN)
  if (currentRole.id === 'hai-chi-em') {
    const sisters = players.filter(p => (p.currentRoleId || p.roleId) === 'hai-chi-em' || getPlayerRole(p)?.id === 'hai-chi-em');
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-pink-500/30 text-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-950/60 border border-pink-600/40 text-pink-300 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-pink-200 text-sm">Hai Chị Em Nhận Diện Nhau</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Thức dậy trong Đêm 1 để biết mặt nhau và cùng thuộc phe Dân Làng
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
    );
  }

  // 11. BA ANH EM (THREE BROTHERS - ĐÊM 1 NHẬN DIỆN)
  if (currentRole.id === 'ba-anh-em') {
    const brothers = players.filter(p => (p.currentRoleId || p.roleId) === 'ba-anh-em' || getPlayerRole(p)?.id === 'ba-anh-em');
    return (
      <div className="p-4 rounded-2xl bg-[#14121e] border border-blue-500/30 text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-600/40 text-blue-300 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-blue-200 text-sm">Ba Anh Em Nhận Diện Nhau</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Thức dậy trong Đêm 1 để biết mặt nhau và cùng thuộc phe Dân Làng
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
