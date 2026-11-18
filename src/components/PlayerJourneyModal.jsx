import React, { useState } from 'react';
import { History, X, Clock, ArrowRight, Sparkles, Heart, Shield, Skull, Star, CheckCircle2, User, Workflow, GitFork, ArrowDown } from 'lucide-react';
import GothicModalContainer from './ui/GothicModalContainer';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';
import { getRole, isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../utils/roleUtils';

export default function PlayerJourneyModal({ isOpen, onClose, player: initialPlayer, players = [] }) {
  if (!isOpen || !initialPlayer) return null;

  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayer.id);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'timeline'

  // Hỗ trợ chuyển đổi nhanh giữa các người chơi đã biến đổi nếu danh sách players được truyền vào
  const transformedPlayers = Array.isArray(players) && players.length > 0
    ? players.filter(p => p.roleHistory && p.roleHistory.length > 0)
    : [];

  const player = (Array.isArray(players) && players.find(p => p.id === selectedPlayerId)) || initialPlayer;

  const currentRole = getPlayerRole(player);
  const originalRole = getPlayerOriginalRole(player);
  const isWolf = isWolfPlayer(player);
  const history = Array.isArray(player.roleHistory) ? player.roleHistory : [];

  const getEventIcon = (type = '') => {
    switch (type) {
      case 'WILD_CHILD_TRANSFORM':
      case 'HALF_WOLF_AWAKEN':
      case 'WOLF_DOG_CHOICE':
        return <WolfIcon className="w-4 h-4 text-rose-400" />;
      case 'SHADOW_INHERIT':
        return <span className="text-sm">👻</span>;
      case 'SERVANT_INHERIT':
        return <span className="text-sm">🗝️</span>;
      case 'CURSED_WOLF_INFECT':
        return <span className="text-sm">🔮</span>;
      case 'IDIOT_PARDON':
        return <span className="text-sm">🃏</span>;
      case 'ANGEL_DEMOTE':
        return <span className="text-sm">👨‍🌾</span>;
      case 'CUPID_LOVERS':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-500" />;
      case 'ELDER_LOST_LIFE':
      case 'ELDER_CURSE_TRIGGER':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'KNIGHT_DUEL':
      case 'RUSTY_SWORD_POISON_DEATH':
        return <span className="text-sm">⚔️</span>;
      case 'HYPNOTIZED':
        return <span className="text-sm">🎵</span>;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  // Xây dựng các Nodes và Edges cho sơ đồ đồ thị chuỗi biến đổi
  const buildGraphData = () => {
    if (history.length === 0) {
      const singleRole = currentRole || getRole('dan-lang');
      return {
        nodes: [{
          roleId: singleRole?.id || 'dan-lang',
          role: singleRole,
          isCurrent: true,
          stageLabel: 'Thân phận ban đầu'
        }],
        edges: []
      };
    }

    const nodes = [];
    const edges = [];

    // Node khởi đầu
    const firstEvent = history[0];
    const initialRoleId = firstEvent.fromRole || player.originalRoleId || currentRole?.id || 'dan-lang';
    const initialRoleObj = getRole(initialRoleId);

    nodes.push({
      roleId: initialRoleId,
      role: initialRoleObj,
      isCurrent: false,
      stageLabel: 'Khởi đầu'
    });

    history.forEach((evt, idx) => {
      const toRoleId = evt.toRole || player.currentRoleId || 'dan-lang';
      const toRoleObj = getRole(toRoleId);
      const isCurrent = idx === history.length - 1;

      edges.push({
        fromIndex: idx,
        toIndex: idx + 1,
        phase: evt.phase || `Giai đoạn #${idx + 1}`,
        title: evt.title || 'Biến đổi',
        detail: evt.detail || '',
        type: evt.type
      });

      nodes.push({
        roleId: toRoleId,
        role: toRoleObj,
        isCurrent,
        stageLabel: isCurrent ? 'Hiện tại' : `Giai đoạn ${idx + 2}`
      });
    });

    return { nodes, edges };
  };

  const { nodes, edges } = buildGraphData();

  return (
    <GothicModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="CHUỖI BIẾN ĐỔI VAI TRÒ"
      subtitle={`Hành trình thân phận của #${player.id} ${player.name}`}
      icon={Workflow}
      iconColor="text-purple-400"
      maxWidth="max-w-2xl"
      showClawMarks={true}
      showWolfWatermark={true}
    >
      <div className="space-y-4">
        {/* Bộ lọc nhanh giữa các người chơi biến đổi trong làng */}
        {transformedPlayers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {transformedPlayers.map(p => {
              const isSelected = p.id === player.id;
              const pWolf = isWolfPlayer(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${pWolf ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                  <span>#{p.id} {p.name}</span>
                  <span className="text-[10px] opacity-75">({p.roleHistory.length})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Player Profile & Mode Toggle */}
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          !player.isAlive
            ? 'bg-[#0e0f17] border-slate-800'
            : isWolf
            ? 'bg-gradient-to-r from-[#240609] to-[#120204] border-rose-800/80 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
            : 'bg-[#101222] border-purple-900/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isWolf ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-purple-950 text-purple-300 border-purple-700'
            }`}>
              #{player.id}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-100">{player.name}</span>
                {!player.isAlive ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                    Đã hy sinh
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Còn sống
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>Hiện tại: <strong className={isWolf ? 'text-rose-300' : 'text-purple-300'}>{currentRole?.name || 'Chưa gán vai'}</strong></span>
                {originalRole && originalRole.id !== currentRole?.id && (
                  <span className="text-[11px] text-slate-400">
                    (Ban đầu: <strong className="text-slate-300">{originalRole.name}</strong>)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle View Mode: Sơ Đồ Đồ Thị vs Dòng Thời Gian */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-800 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-purple-900/80 border border-purple-500/80 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Sơ Đồ Chuỗi</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-purple-900/80 border border-purple-500/80 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Dòng Thời Gian ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Chế độ hiển thị 1: SƠ ĐỒ CHUỖI ĐỒ THỊ (VISUAL GRAPH FLOW) */}
        {viewMode === 'graph' ? (
          history.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-black/40 border border-slate-800/80 text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-300">Thân Phận Đồng Nhất</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Người chơi này giữ nguyên vai trò từ đầu ván đấu và chưa trải qua biến cố chuyển đổi vai trò nào.
              </p>
            </div>
          ) : (
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#090b14] border border-slate-800/80 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-purple-400" />
                <span>SƠ ĐỒ TIẾN HÓA VAI TRÒ ({nodes.length} NÚT THÂN PHẬN)</span>
              </div>

              {/* Graph flow container: cuộn ngang mượt mà trên desktop & tablet, xếp cột linh hoạt trên mobile */}
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-3 overflow-x-auto py-2 custom-scrollbar">
                {nodes.map((node, idx) => {
                  const edge = edges[idx];
                  const isNodeWolf = node.role?.teamCode === 'W';
                  const isNodeThird = node.role?.teamCode === '3';

                  return (
                    <React.Fragment key={idx}>
                      {/* ROLE NODE CARD */}
                      <div className={`flex flex-col items-center justify-between p-3 rounded-2xl border min-w-[150px] max-w-[170px] w-full md:w-auto shrink-0 text-center relative transition-all ${
                        node.isCurrent
                          ? isNodeWolf
                            ? 'bg-gradient-to-b from-[#26050b] to-[#120205] border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)] ring-1 ring-rose-500/50'
                            : 'bg-gradient-to-b from-[#1c142c] to-[#0d0c18] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
                          : 'bg-[#101220] border-slate-800/90'
                      }`}>
                        {/* Giai đoạn */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 border ${
                          node.isCurrent
                            ? isNodeWolf
                              ? 'bg-rose-950 text-rose-200 border-rose-700 font-bold'
                              : 'bg-purple-950 text-purple-200 border-purple-700 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {node.stageLabel}
                        </span>

                        {/* Thẻ Card Thumbnail */}
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-slate-700/80 bg-black/60 shadow-inner flex items-center justify-center my-1 relative">
                          {node.role?.image ? (
                            <img
                              src={node.role.image}
                              alt={node.role.name}
                              width="80"
                              height="96"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🃏</span>
                          )}
                          {node.isCurrent && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black"></div>
                          )}
                        </div>

                        {/* Tên Vai Trò & Phe */}
                        <div className="mt-2 w-full">
                          <div className="font-bold text-xs sm:text-sm text-slate-100 font-cinzel truncate" title={node.role?.name}>
                            {node.role?.name || node.roleId}
                          </div>
                          <div className={`text-[10px] mt-0.5 font-mono ${
                            isNodeWolf ? 'text-rose-400' : isNodeThird ? 'text-purple-400' : 'text-slate-400'
                          }`}>
                            {node.role?.team || 'Phe Dân Làng'}
                          </div>
                        </div>
                      </div>

                      {/* CONNECTING ARROW & CAUSE ON PATH */}
                      {edge && (
                        <div className="flex md:flex-col items-center justify-center gap-1.5 shrink-0 my-2 md:my-0 px-2 py-1 w-full md:w-auto">
                          {/* Thời điểm (Phase) */}
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-purple-950/90 border border-purple-800 text-purple-300 shrink-0">
                            {edge.phase}
                          </span>

                          {/* Mũi tên chỉ hướng */}
                          <div className="flex items-center justify-center gap-1 text-purple-400 my-0.5">
                            <div className="hidden md:block w-8 sm:w-12 h-0.5 bg-gradient-to-r from-purple-800 to-purple-500"></div>
                            <ArrowRight className="hidden md:block w-4 h-4 shrink-0" />
                            <ArrowDown className="block md:hidden w-4 h-4 shrink-0 text-purple-400" />
                          </div>

                          {/* Nguyên nhân biến đổi trên đường mũi tên */}
                          <div className="max-w-[150px] text-center p-2 rounded-xl bg-black/80 border border-purple-800/60 shadow-sm" title={edge.detail}>
                            <div className="text-[11px] font-bold text-amber-200 leading-tight">
                              {edge.title}
                            </div>
                            {edge.detail && (
                              <div className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                {edge.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Chế độ hiển thị 2: DÒNG THỜI GIAN VĂN BẢN (TIMELINE LIST) */
          history.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-black/40 border border-slate-800/80 text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-300">Thân Phận Đồng Nhất</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Người chơi này giữ nguyên vai trò từ đầu ván đấu và chưa trải qua biến cố chuyển đổi vai trò nào.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              {history.map((event, idx) => {
                const fromRoleObj = event.fromRole ? getRole(event.fromRole) : null;
                const toRoleObj = event.toRole ? getRole(event.toRole) : null;
                const hasTransition = fromRoleObj && toRoleObj && fromRoleObj.id !== toRoleObj.id;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#0f111d] border border-purple-900/50 hover:border-purple-700/70 transition-all space-y-2 relative shadow-sm"
                  >
                    {/* Step Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-200">
                          {event.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300 font-mono shrink-0">
                        {event.phase || `Sự kiện #${idx + 1}`}
                      </span>
                    </div>

                    {/* Detailed Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0a0c16]/70 p-2.5 rounded-xl border border-slate-800/80 font-sans">
                      {event.detail}
                    </p>

                    {/* Role Transition Badges if available */}
                    {hasTransition && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {fromRoleObj.name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700 text-purple-200 font-bold">
                          {toRoleObj.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 italic">
            Dùng làm căn cứ giải thích cho làng khi kết thúc ván đấu
          </span>
          <GothicButton variant="dark" size="sm" onClick={onClose}>
            Đóng Lại
          </GothicButton>
        </div>
      </div>
    </GothicModalContainer>
  );
}
