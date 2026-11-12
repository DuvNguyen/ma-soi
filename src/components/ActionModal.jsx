import React, { useState } from 'react';
import { Shield, Eye, Skull, Sparkles, Heart, Crosshair, AlertTriangle, Check, X, User } from 'lucide-react';
import GothicButton from './ui/GothicButton';
import GothicBadge from './ui/GothicBadge';
import WolfIcon from './ui/WolfIcon';
import { isWolfPlayer, getPlayerRole } from '../utils/roleUtils';
import { ROLES } from '../data/roles';

export default function ActionModal({
  isOpen,
  onClose,
  actionType,
  role,
  player,
  players = [],
  deckRoleIds = [],
  rolesInGame = [],
  nightState,
  onSaveAction,
  onAssignRole
}) {
  if (!isOpen) return null;

  const alivePlayers = players.filter(p => p.isAlive);
  const [selectedPair, setSelectedPair] = useState(nightState?.cupidChosenIds || []);
  const [seerResult, setSeerResult] = useState(null);
  const [witchSaved, setWitchSaved] = useState(nightState?.witchSaved || false);
  const [witchPoisonId, setWitchPoisonId] = useState(nightState?.witchPoisonTargetId || null);

  const wolfVictim = players.find(p => p.id === nightState?.wolfTargetId);

  const renderContent = () => {
    switch (actionType) {
      // ================= BẢO VỆ =================
      case 'protect': {
        const lastProtectedId = nightState?.lastNightProtectedId;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-teal-950/60 to-purple-950/40 border border-teal-800/70 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-600 flex items-center justify-center text-teal-400 shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <Shield className="w-5 h-5 fill-teal-400" />
              </div>
              <div>
                <h4 className="font-bold text-teal-200 text-sm font-cinzel">BẢO VỆ CHE CHỞ</h4>
                <p className="text-xs text-teal-300/80 mt-0.5">
                  Chọn 1 người để bảo hộ. <span className="text-rose-400 font-semibold">Cấm bảo vệ người của đêm trước.</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
              {alivePlayers.map(p => {
                const isLastNight = p.id === lastProtectedId;
                const isCurrentProtected = nightState?.protectedPlayerId === p.id;
                const isWolf = isWolfPlayer(p);

                return (
                  <button
                    key={p.id}
                    disabled={isLastNight}
                    onClick={() => {
                      onSaveAction('protect', p.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 ${
                      isLastNight
                        ? 'opacity-30 cursor-not-allowed bg-black/40 border-slate-900 text-slate-600'
                        : isCurrentProtected
                        ? 'bg-teal-950/90 border-teal-400 text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                        : isWolf
                        ? 'bg-[#18080a] border-rose-800/80 hover:border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.35)] text-slate-200'
                        : 'bg-[#111320] hover:bg-[#181a2e] border-slate-800 hover:border-purple-600/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isWolf ? 'bg-rose-950/80 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        {p.id}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span className={isWolf ? 'text-rose-200 font-black' : 'text-slate-100'}>{p.name}</span>
                          {isWolf && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)] flex items-center gap-1">
                              <WolfIcon className="w-3 h-3" /> Phe Sói
                            </span>
                          )}
                          {isCurrentProtected && (
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.2 rounded-full border border-teal-400">
                              Đang bảo vệ
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Vai: <span className="text-slate-300 font-medium">{getPlayerRole(p)?.name || 'Chưa lộ vai'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isLastNight ? (
                        <span className="text-[11px] text-rose-400/90 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-900">
                          Đã bảo vệ đêm trước
                        </span>
                      ) : (
                        <span className="text-xs text-teal-300 font-semibold px-3 py-1.5 rounded-xl bg-teal-950/60 border border-teal-800/60 hover:bg-teal-700 hover:text-white transition-colors">
                          Bảo vệ ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ================= TIÊN TRI =================
      case 'seer': {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-purple-950/80 via-[#1c0836] to-slate-950 border border-purple-800/80 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-purple-200 text-sm font-cinzel">TIÊN TRI SOI THẤU LINH HỒN</h4>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Chọn 1 người chơi để soi danh tính thực sự.
                </p>
              </div>
            </div>

            {seerResult && (
              <div className={`p-5 rounded-2xl border text-center animate-fade-in shadow-2xl ${
                seerResult.isWolf
                  ? 'bg-gradient-to-b from-[#3b080c] to-[#1c0205] border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.6)] text-rose-100'
                  : 'bg-gradient-to-b from-[#091b36] to-[#040d1c] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] text-blue-100'
              }`}>
                <div className="text-xs uppercase tracking-widest font-black opacity-80 mb-1">
                  KẾT QUẢ SOI
                </div>
                <div className="text-3xl font-black font-cinzel tracking-wider flex items-center justify-center gap-2">
                  {seerResult.isWolf ? (
                    <>
                      <WolfIcon className="w-8 h-8" />
                      <span>LÀ MA SÓI !</span>
                    </>
                  ) : (
                    <span>👨‍🌾 LÀ DÂN LÀNG (Lương thiện)</span>
                  )}
                </div>
                <p className="text-xs mt-2 opacity-90">
                  Mục tiêu: <strong>{seerResult.player.name}</strong> ({getPlayerRole(seerResult.player)?.name || 'Chưa lộ vai'})
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {alivePlayers.map(p => {
                const isWolf = isWolfPlayer(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSeerResult({ player: p, isWolf });
                      onSaveAction('seer', p.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isWolf
                        ? 'bg-[#18080a] border-rose-700/80 hover:border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.35)] text-slate-200'
                        : 'bg-[#111320] hover:bg-[#181a2e] border-slate-800 hover:border-purple-600/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isWolf ? 'bg-rose-950/80 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        {p.id}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span className={isWolf ? 'text-rose-200 font-bold' : 'text-slate-100'}>{p.name}</span>
                          {isWolf && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)] flex items-center gap-1">
                              <WolfIcon className="w-3 h-3" /> Phe Sói
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Vai trò thực: <span className="text-slate-300 font-medium">{getPlayerRole(p)?.name || 'Chưa lộ vai'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-purple-300 font-bold px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/80 hover:bg-purple-700 hover:text-white transition-colors">
                      Soi người này
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ================= MA SÓI CẮN =================
      case 'wolves': {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-rose-950 via-[#260508] to-black border border-rose-700 rounded-2xl shadow-[0_0_25px_rgba(225,29,72,0.4)] animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.6)]">
                <Skull className="w-5 h-5 fill-rose-500 text-rose-300" />
              </div>
              <div>
                <h4 className="font-bold text-rose-200 text-sm font-cinzel">BẦY MA SÓI KHÁT MÁU</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Thống nhất chọn con mồi bị cắn xé đêm nay.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
              {alivePlayers.map(p => {
                const isSelected = nightState?.wolfTargetId === p.id;
                const isWolf = isWolfPlayer(p);

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSaveAction('wolves', p.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-950 to-black border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.7)] text-white'
                        : isWolf
                        ? 'bg-[#18080a] border-rose-800/80 hover:border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.35)] text-slate-200'
                        : 'bg-[#111320] hover:bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isWolf ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        {p.id}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span className={isWolf ? 'text-rose-200 font-black' : 'text-slate-100'}>{p.name}</span>
                          {isWolf && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)] flex items-center gap-1">
                              <WolfIcon className="w-3 h-3" /> Đồng bọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Vai: <span className="text-slate-300 font-medium">{getPlayerRole(p)?.name || 'Chưa lộ vai'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-rose-400 font-bold px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 hover:bg-rose-600 hover:text-white transition-colors">
                      {isSelected ? 'Đang chọn cắn ✓' : 'Chọn cắn 🩸'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ================= PHÙ THỦY =================
      case 'witch': {
        const hasHeal = nightState?.witchHasHeal !== false;
        const hasPoison = nightState?.witchHasPoison !== false;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-purple-950/80 via-[#250938] to-slate-950 border border-purple-800/80 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-purple-200 text-sm font-cinzel">PHÙ THỦY DƯỢC PHẨM</h4>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Bình cứu người & bình đầu độc kẻ thù.
                </p>
              </div>
            </div>

            {/* Victim Status */}
            <div className="p-4 rounded-2xl bg-[#0d0f1a] border border-slate-800 space-y-2">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Tình hình nạn nhân bị Sói cắn đêm nay:
              </div>
              {wolfVictim ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base text-rose-400">{wolfVictim.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({getPlayerRole(wolfVictim)?.name || 'Chưa lộ vai'})</span>
                    <div className="text-xs text-rose-300/80">Sẽ chết vào sáng mai nếu không được cứu!</div>
                  </div>
                  {hasHeal ? (
                    <GothicButton
                      variant={witchSaved ? 'blood' : 'witch'}
                      size="sm"
                      onClick={() => setWitchSaved(!witchSaved)}
                    >
                      {witchSaved ? '✓ Đang dùng bình cứu' : 'Dùng bình cứu'}
                    </GothicButton>
                  ) : (
                    <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Hết bình cứu
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Đêm nay không ai bị Sói cắn.
                </div>
              )}
            </div>

            {/* Poison Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Bình Thuốc Độc (Giết 1 người):
                </span>
                <span className="text-[11px] text-purple-400 font-semibold">
                  {hasPoison ? 'Còn 1 lần dùng' : 'Đã dùng hết'}
                </span>
              </div>

              {hasPoison ? (
                <div className="space-y-1.5 max-h-[35vh] overflow-y-auto pr-1">
                  <button
                    onClick={() => setWitchPoisonId(null)}
                    className={`w-full p-2.5 text-xs rounded-xl border text-left font-bold transition-colors ${
                      witchPoisonId === null
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-[#10121d] border-slate-800 text-slate-400'
                    }`}
                  >
                    🚫 Không dùng bình độc đêm nay
                  </button>

                  {alivePlayers.map(p => {
                    const isWolf = isWolfPlayer(p);
                    const isSelected = witchPoisonId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setWitchPoisonId(p.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                            : isWolf
                            ? 'bg-[#18080a] border-rose-800/80 text-slate-200'
                            : 'bg-[#10121d] hover:bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          {p.name} <span className="text-slate-500 font-normal">({getPlayerRole(p)?.name || 'Chưa lộ vai'})</span>
                          {isWolf && <span className="text-[9px] text-rose-400 font-bold">[SÓI]</span>}
                        </span>
                        {isSelected && <span className="text-rose-400 font-bold">☠️ Đầu độc</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Đã hết thuốc độc.</p>
              )}
            </div>

            <div className="pt-2">
              <GothicButton
                variant="witch"
                size="lg"
                className="w-full"
                onClick={() => {
                  onSaveAction('witch', { saved: witchSaved, poisonTargetId: witchPoisonId });
                  onClose();
                }}
              >
                Xác Nhận Hành Động Phù Thủy
              </GothicButton>
            </div>
          </div>
        );
      }

      // ================= CUPID GHÉP ĐÔI (CỐT LÕI ĐƯỢC CHĂM CHÚT NHƯ USER ĐƯA ẢNH) =================
      case 'cupid': {
        const togglePair = (id) => {
          if (selectedPair.includes(id)) {
            setSelectedPair(selectedPair.filter(x => x !== id));
          } else {
            if (selectedPair.length < 2) {
              setSelectedPair([...selectedPair, id]);
            } else {
              setSelectedPair([selectedPair[1], id]);
            }
          }
        };

        const p1 = players.find(x => x.id === selectedPair[0]);
        const p2 = players.find(x => x.id === selectedPair[1]);
        const isCrossTeam = p1 && p2 && (
          (isWolfPlayer(p1) && !isWolfPlayer(p2)) ||
          (!isWolfPlayer(p1) && isWolfPlayer(p2))
        );

        return (
          <div className="space-y-4">
            {/* Header with Dark Witch / Occult Heart theme */}
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-purple-950/80 via-[#26092d] to-slate-950 border border-purple-800/80 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-pink-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <Heart className="w-5 h-5 fill-pink-500 text-pink-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-pink-200 text-sm font-cinzel">CUPID KẾT DUYÊN ÁI TÌNH (ĐÊM 1)</h4>
                <p className="text-xs text-pink-300/80 mt-0.5">
                  Chọn đúng 2 người chơi. Nếu 1 Sói + 1 Dân thì thành <strong>PHE THỨ BA</strong>!
                </p>
              </div>
            </div>

            {/* Custom Dark Grid with HIGHLIGHT RED BORDER for Wolves */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
              {players.map(p => {
                const isSelected = selectedPair.includes(p.id);
                const isWolf = isWolfPlayer(p);

                return (
                  <button
                    key={p.id}
                    onClick={() => togglePair(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
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
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center gap-1">
                              <WolfIcon className="w-2.5 h-2.5" /> Sói
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          Vai: <span className="font-medium text-slate-300">{getPlayerRole(p)?.name || 'Chưa lộ vai'}</span>
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

            {/* Confirm Button */}
            <div className="pt-2">
              <GothicButton
                variant="witch"
                size="lg"
                disabled={selectedPair.length !== 2}
                className="w-full"
                onClick={() => {
                  onSaveAction('cupid', selectedPair);
                  onClose();
                }}
              >
                Ghép Đôi 2 Người Này ({selectedPair.length}/2) ❤️
              </GothicButton>
            </div>
          </div>
        );
      }

      // ================= THỢ SĂN BẮN =================
      case 'hunter': {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-amber-950 via-[#2a1306] to-black border border-amber-700 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Crosshair className="w-6 h-6 text-amber-400 shrink-0 animate-spin-slow" />
              <div>
                <h4 className="font-bold text-amber-200 text-sm font-cinzel">PHÁT SÚNG CUỐI CÙNG CỦA THỢ SĂN</h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Thợ Săn ngã xuống và được kéo theo 1 người bất kỳ cùng chết.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {alivePlayers.map(p => {
                const isWolf = isWolfPlayer(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSaveAction('hunter', p.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isWolf
                        ? 'bg-[#18080a] border-rose-700/90 hover:border-rose-500 shadow-[0_0_14px_rgba(225,29,72,0.4)] text-slate-200'
                        : 'bg-[#111320] hover:bg-[#181a2e] border-slate-800 hover:border-amber-600 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{p.name}</span>
                        {isWolf && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center gap-1">
                            <WolfIcon className="w-2.5 h-2.5 shrink-0" /> Phe Sói
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Vai: <span className="font-medium text-slate-300">{getPlayerRole(p)?.name || 'Chưa lộ vai'}</span>
                      </div>
                    </div>

                    <span className="text-xs text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 hover:bg-amber-600 hover:text-white transition-colors">
                      Nổ súng tiêu diệt 🎯
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ================= GÁN / LỘ VAI TRÒ CHO NGƯỜI CHƠI =================
      case 'assign_role': {
        const targetPlayer = player;
        const targetCurrentRoleId = targetPlayer?.currentRoleId || targetPlayer?.roleId;
        const targetCurrentRole = targetPlayer ? getPlayerRole(targetPlayer) : null;

        // Fallback: nếu gọi không kèm player mà chỉ có role
        if (!targetPlayer && role) {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-purple-950/80 to-slate-950 border border-purple-800/80 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <User className="w-5 h-5 text-purple-300" />
                <div>
                  <h4 className="font-bold text-purple-200 text-sm font-cinzel">GÁN VAI TRÒ CHO NGƯỜI CHƠI</h4>
                  <p className="text-xs text-purple-300/80 mt-0.5">
                    Vai trò: <strong className="text-white">{role?.name}</strong> ([{role?.teamCode}] {role?.team})
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                {players.map(p => {
                  const pCurrentId = p.currentRoleId || p.roleId;
                  const isAssigned = pCurrentId === role?.id;
                  const hasOtherRole = Boolean(pCurrentId && !isAssigned);
                  const isWolf = isWolfPlayer(p);

                  return (
                    <button
                      key={p.id}
                      disabled={hasOtherRole}
                      onClick={() => {
                        onAssignRole(p.id, role);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isAssigned
                          ? 'bg-purple-950 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer'
                          : hasOtherRole
                          ? 'bg-[#0a0c16] border-slate-900/90 text-slate-500 opacity-40 cursor-not-allowed select-none'
                          : isWolf
                          ? 'bg-[#18080a] border-rose-800/80 hover:border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.35)] text-slate-200 cursor-pointer'
                          : 'bg-[#111320] hover:bg-slate-900 border-slate-800 text-slate-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          {p.id}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-100">{p.name}</div>
                          <div className="text-xs text-slate-400">
                            Đang giữ: {hasOtherRole ? `🔒 ${getPlayerRole(p)?.name || pCurrentId}` : isAssigned ? `✓ ${role?.name}` : 'Chưa có vai'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-lg border text-purple-300 bg-purple-950/60 border-purple-800/60">
                        Chọn người này
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // CHẾ ĐỘ CHÍNH: FETCH CÁC VAI TRÒ CHƯA GÁN TẠI STATE HIỆN TẠI CỦA TRẬN ĐẤU
        const totalCardsInDeck = deckRoleIds?.length || players.length;

        // Đếm số lượng từng lá bài trong bộ bài ván đấu
        const deckCounts = {};
        (deckRoleIds || []).forEach(id => {
          deckCounts[id] = (deckCounts[id] || 0) + 1;
        });

        // Đếm số lượng vai đã được gán cho các người chơi KHÁC (loại trừ targetPlayer)
        const assignedToOthersCounts = {};
        (players || []).forEach(p => {
          if (!targetPlayer || p.id !== targetPlayer.id) {
            const rid = p.currentRoleId || p.roleId;
            if (rid) {
              assignedToOthersCounts[rid] = (assignedToOthersCounts[rid] || 0) + 1;
            }
          }
        });

        // Danh sách các vai trò còn lại trong kho bài chưa có chủ
        const uniqueDeckRoleIds = Array.from(new Set(deckRoleIds || []));
        const availableRoleEntries = [];

        uniqueDeckRoleIds.forEach(roleId => {
          const totalInDeck = deckCounts[roleId] || 0;
          const takenByOthers = assignedToOthersCounts[roleId] || 0;
          const remainingCount = Math.max(0, totalInDeck - takenByOthers);

          const roleObj = ROLES.find(r => r.id === roleId) || {
            id: roleId,
            name: roleId === 'dan-lang' ? 'Dân Làng' : roleId,
            teamCode: 'V',
            team: 'Phe Dân Làng'
          };

          const isCurrent = targetCurrentRoleId === roleId;
          const isFunctional = roleId !== 'dan-lang' && roleId !== 'dan-thuong';

          if (remainingCount > 0 || isCurrent) {
            availableRoleEntries.push({
              role: roleObj,
              totalInDeck,
              remainingCount,
              isCurrent,
              isFunctional
            });
          }
        });

        // Sắp xếp: vai chức năng (Già Làng, Thợ Săn, Bảo Vệ, Tiên Tri, Sói...) trước, Dân Làng sau
        availableRoleEntries.sort((a, b) => {
          if (a.isFunctional && !b.isFunctional) return -1;
          if (!a.isFunctional && b.isFunctional) return 1;
          return a.role.name.localeCompare(b.role.name);
        });

        const remainingFunctionalCount = availableRoleEntries
          .filter(e => e.isFunctional && !e.isCurrent)
          .reduce((sum, e) => sum + e.remainingCount, 0);

        const villagerEntry = availableRoleEntries.find(e => !e.isFunctional);
        const remainingVillagersCount = villagerEntry ? villagerEntry.remainingCount : 0;

        return (
          <div className="space-y-4">
            {/* Header: Thông tin người chơi được gán */}
            <div className="p-3.5 bg-gradient-to-r from-purple-950/90 via-[#1d0d2a] to-slate-950 border border-purple-700/80 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.25)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/80 border border-purple-500 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
                    #{targetPlayer?.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base font-cinzel flex items-center gap-2">
                      <span>{targetPlayer?.name}</span>
                      {!targetPlayer?.isAlive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-700 text-rose-300 font-sans font-bold">
                          💀 Đã chết
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-purple-200/80">
                      Hiện tại: <strong className={targetCurrentRole ? 'text-amber-300' : 'text-slate-400'}>
                        {targetCurrentRole ? `${targetCurrentRole.name} ([${targetCurrentRole.teamCode}])` : 'Chưa có vai trò'}
                      </strong>
                    </p>
                  </div>
                </div>

                {targetCurrentRoleId && (
                  <button
                    type="button"
                    onClick={() => {
                      onAssignRole(targetPlayer.id, null);
                      onClose();
                    }}
                    title="Gỡ vai trò này"
                    className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/80 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Gỡ vai</span>
                  </button>
                )}
              </div>

              {/* Status Hint */}
              <div className="pt-1.5 border-t border-purple-900/50 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-300">
                <span>Kho bài: <strong>{totalCardsInDeck} lá</strong></span>
                {remainingFunctionalCount > 0 ? (
                  <span className="text-amber-300 font-medium">
                    Còn <strong>{remainingFunctionalCount}</strong> vai chức năng chưa gán
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✓ Đã gán hết chức năng! Còn lại là Dân Làng ({remainingVillagersCount} lá)
                  </span>
                )}
              </div>
            </div>

            {/* Thông báo nếu đã hết vai chức năng */}
            {remainingFunctionalCount === 0 && (
              <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/60 text-blue-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Các vai chức năng trong bộ bài đã có chủ. Tất cả slot còn lại đều là <strong>Dân Làng</strong>.
                </span>
              </div>
            )}

            {/* Danh sách các vai trò còn khả dụng trong kho bài */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {availableRoleEntries.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Toàn bộ lá bài trong bộ bài ván đấu đã được gán đầy đủ.
                </div>
              ) : (
                availableRoleEntries.map(({ role: r, remainingCount, isCurrent, isFunctional }) => {
                  const isWolf = r.teamCode === 'W';
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onAssignRole(targetPlayer.id, r);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : isWolf
                          ? 'bg-[#18080a] hover:bg-[#250c10] border-rose-900/80 hover:border-rose-500 text-slate-200'
                          : isFunctional
                          ? 'bg-[#111320] hover:bg-[#1a1e35] border-purple-900/80 hover:border-purple-500 text-slate-200'
                          : 'bg-[#0f111a] hover:bg-[#151928] border-slate-800 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2 flex-1">
                        {/* HÌNH ẢNH LÁ BÀI MINI Ở AVATAR */}
                        <div className={`w-11 h-14 sm:w-12 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 border relative shadow-md ${
                          isWolf
                            ? 'bg-rose-950 border-rose-700/80'
                            : isFunctional
                            ? 'bg-purple-950 border-purple-700/80'
                            : 'bg-slate-900 border-slate-700/80'
                        }`}>
                          {r.image ? (
                            <img
                              src={r.image}
                              alt={r.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            isWolf ? <WolfIcon className="w-5 h-5 text-rose-400" /> : isFunctional ? <Sparkles className="w-5 h-5 text-purple-400" /> : <span className="text-xl">👨‍🌾</span>
                          )}
                          <div className={`absolute bottom-0 inset-x-0 text-[9px] font-black font-mono text-center py-0.5 uppercase ${
                            isWolf ? 'bg-rose-950/90 text-rose-300' : 'bg-purple-950/90 text-purple-300'
                          }`}>
                            {r.teamCode}
                          </div>
                        </div>

                        {/* TÊN VAI TRÒ & MÔ TẢ */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm sm:text-base text-white font-cinzel leading-tight">
                              {r.name}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 border ${
                              isWolf
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : 'bg-purple-950/80 text-purple-300 border-purple-800'
                            }`}>
                              [{r.teamCode}] {isWolf ? 'Phe Sói' : r.teamCode === '3' ? 'Phe 3' : 'Dân Làng'}
                            </span>
                          </div>

                          <div className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">
                            {r.shortDesc || (isFunctional ? 'Vai trò có kỹ năng đặc biệt' : 'Dân thường không có kỹ năng đặc biệt')}
                          </div>
                        </div>
                      </div>

                      {/* NÚT THAO TÁC BÊN PHẢI */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                          isCurrent
                            ? 'bg-amber-950 border-amber-700 text-amber-300 font-bold'
                            : remainingCount > 0
                            ? 'bg-slate-900 border-slate-800 text-slate-300'
                            : 'bg-slate-950 border-slate-900 text-slate-600'
                        }`}>
                          {isCurrent ? 'Đang giữ' : `Còn ${remainingCount} lá`}
                        </span>

                        <span className={`text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-all shrink-0 ${
                          isCurrent
                            ? 'bg-amber-500 text-black border-amber-400 font-black'
                            : 'bg-purple-950/80 hover:bg-purple-600 text-purple-200 hover:text-white border-purple-800'
                        }`}>
                          {isCurrent ? '✓ Đang chọn' : 'Gán vai ➔'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b0c14]/90 border border-purple-900/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(46,16,101,0.5)] backdrop-blur-md flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-900/40 bg-[#0d0e1a]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse"></div>
            <h3 className="font-cinzel font-black text-sm md:text-base text-slate-100 uppercase tracking-wider">
              QUẢN TRÒ THAO TÁC BÍ MẬT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
