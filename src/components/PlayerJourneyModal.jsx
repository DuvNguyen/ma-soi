import React from 'react';
import { History, X, Clock, ArrowRight, Sparkles, Heart, Shield, Skull, Star, CheckCircle2, User } from 'lucide-react';
import GothicModalContainer from './ui/GothicModalContainer';
import GothicButton from './ui/GothicButton';
import WolfIcon from './ui/WolfIcon';
import { getRole, isWolfPlayer, getPlayerRole, getPlayerOriginalRole } from '../utils/roleUtils';

export default function PlayerJourneyModal({ isOpen, onClose, player }) {
  if (!isOpen || !player) return null;

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

  return (
    <GothicModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="NHẬT KÝ BIẾN ĐỔI VAI TRÒ"
      subtitle={`Hành trình thân phận của #${player.id} ${player.name}`}
      icon={History}
      iconColor="text-purple-400"
      maxWidth="max-w-lg"
      showClawMarks={true}
      showWolfWatermark={true}
    >
      <div className="space-y-4">
        {/* Player Profile Card */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
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

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">
              {history.length} sự kiện
            </span>
          </div>
        </div>

        {/* Timeline Events */}
        {history.length === 0 ? (
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

                  {/* Detailed Explanation For The Village */}
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
