import { Player } from './Player.js';
import { getRole, isWolfPlayer } from '../../utils/roleUtils.js';
import { checkGameEnd, resolveNightPhase } from '../../utils/gameLogic.js';

export const GAME_SCHEMA_VERSION = 2;

/**
 * Cỗ máy điều phối ván đấu (WerewolfGame Aggregate Root).
 * Đóng gói toàn bộ trạng thái và các quy tắc chuyển đổi vòng chơi (state machine) của Ma Sói.
 */
export class WerewolfGame {
  constructor(state = {}) {
    this.schemaVersion = state.schemaVersion || GAME_SCHEMA_VERSION;
    this.roundNumber = state.roundNumber || 1;
    this.isNight = state.isNight !== undefined ? Boolean(state.isNight) : true;
    this.activeTab = state.activeTab || (this.isNight ? 'night' : 'day');
    
    // Khởi tạo danh sách Player model
    const rawPlayers = state.players || [];
    this.players = rawPlayers.map(p => p instanceof Player ? p : Player.fromJSON(p));
    
    this.deckRoleIds = state.deckRoleIds || [];
    this.rolesInGameIds = state.rolesInGameIds || [];
    this.nightState = state.nightState || {};
    this.nightLogs = state.nightLogs || [];
    this.gameDiary = state.gameDiary || [];
    this.lynchedTodayPlayerId = state.lynchedTodayPlayerId ?? null;
    this.gameEndResult = state.gameEndResult || null;
    this.currentNightStepIdx = state.currentNightStepIdx || 0;
    this.canWolvesKillTeammates = Boolean(state.canWolvesKillTeammates);
    this.isVillageCursed = Boolean(state.isVillageCursed);
    this.wolfCanKillDouble = Boolean(state.wolfCanKillDouble);
    this.updatedAt = state.updatedAt || new Date().toISOString();
  }

  /**
   * Lấy danh sách người chơi còn sống
   */
  getAlivePlayers() {
    return this.players.filter(p => p.isAlive);
  }

  getLivingPlayers() {
    return this.getAlivePlayers();
  }

  /**
   * Lấy danh sách Ma Sói hiện tại
   */
  getWolves() {
    return this.players.filter(p => p.isWolf());
  }

  /**
   * Tìm người chơi theo ID
   */
  getPlayer(id) {
    return this.players.find(p => p.id === id) || null;
  }

  /**
   * Kiểm tra một vai trò có bị loại khỏi làng (do trúng lời nguyền Sói Nguyền hoặc biến đổi vai) hay không
   */
  isRoleEliminated(roleId) {
    if (!roleId) return false;
    const hasActiveHolders = this.players.some(p => (p.currentRoleId || p.roleId) === roleId);
    const transformedHolder = this.players.find(p => p.originalRoleId === roleId && (p.currentRoleId !== roleId || p.roleId !== roleId));
    return Boolean(transformedHolder) && !hasActiveHolders;
  }

  /**
   * Kiểm tra một vai trò có được phép gán cho người khác hay không
   * (Chặn nếu người giữ vai đã chết hoặc đã biến đổi vai)
   */
  canRoleBeReassigned(roleId, targetPlayerId = null) {
    if (!roleId) return false;
    if (roleId === 'dan-lang' || roleId === 'dan-thuong') return true;
    
    // Nếu có người khác giữ vai này làm vai gốc đã biến đổi (Bán Sói, Sói Nguyền...)
    const transformedHolder = this.players.find(p => 
      p.id !== targetPlayerId && p.originalRoleId === roleId && (p.currentRoleId !== roleId || p.roleId !== roleId)
    );
    if (transformedHolder) return false;

    const roleHolders = this.players.filter(p => p.id !== targetPlayerId && (p.currentRoleId || p.roleId) === roleId);
    if (roleHolders.length > 0) {
      const anyAlive = roleHolders.some(p => p.isAlive);
      if (!anyAlive) return false; // Người giữ vai đã chết
    }
    return true;
  }

  /**
   * Gán vai trò cho người chơi với kiểm tra luật nghiêm ngặt
   */
  assignRole(playerId, roleId) {
    if (!this.canRoleBeReassigned(roleId, playerId)) {
      return { success: false, reason: 'Vai trò này đã bị loại hoặc người giữ vai đã hy sinh/biến đổi, không được gán lại!' };
    }

    const updatedPlayers = this.players.map(p => {
      if (p.id === playerId) {
        return p.assignRole(roleId);
      }
      return p;
    });

    return {
      success: true,
      game: this.clone({ players: updatedPlayers })
    };
  }

  /**
   * Xử lý giải quyết kết quả Ban Đêm (Sói cắn, Phù Thủy, Bảo Vệ, Sói Nguyền, Cặp đôi)
   */
  resolveNight(nightActions) {
    const rawResult = resolveNightPhase(
      this.players.map(p => p.toJSON()),
      { ...nightActions, isVillageCursed: this.isVillageCursed },
      this.roundNumber
    );

    let updatedPlayers = rawResult.updatedPlayers.map(p => Player.fromJSON(p));
    let logs = [...rawResult.logs];
    let wolfCanKillDouble = this.wolfCanKillDouble;
    let isVillageCursed = rawResult.elderKilledByWitch ? true : this.isVillageCursed;
    let nextNightState = { ...this.nightState };

    // 1. Hoàn trả bình cứu cho Phù Thủy nếu Bảo Vệ đỡ đòn thành công
    if (rawResult.refundWitchHeal) {
      nextNightState.witchHasHeal = true;
    }

    // 2. Sói Con chết trong đêm -> kích hoạt Sói cắn 2 người cho đêm kế tiếp
    const killedWolfPup = updatedPlayers.find(p => rawResult.killedPlayerIds.includes(p.id) && p.getRole()?.id === 'soi-con');
    if (killedWolfPup) {
      wolfCanKillDouble = true;
      logs.push(`🐺 SÓI CON (${killedWolfPup.name}) ĐÃ CHẾT! Bầy Ma Sói nổi cơn cuồng sát: Đêm tiếp theo bầy Sói được cắn 2 người!`);
    }

    // 3. Sói Nguyền đã lây nhiễm trong đêm
    if (nextNightState.isCursedInfect) {
      nextNightState.cursedUsed = true;
      nextNightState.isCursedInfect = false;
    }

    // 4. Kiểm tra Cảnh Sát Trưởng tử trận trong đêm
    const deadSheriff = updatedPlayers.find(p => rawResult.killedPlayerIds.includes(p.id) && p.isSheriff) || null;

    // 5. Kiểm tra Thợ Săn tử trận trong đêm
    let hunterTrigger = null;
    const deadHunter = updatedPlayers.find(p => rawResult.killedPlayerIds.includes(p.id) && p.getRole()?.id === 'tho-san');
    if (deadHunter) {
      const isPoisoned = rawResult.poisonedPlayerIds?.includes(deadHunter.id);
      const isLoverSuicide = deadHunter.deathReason?.includes('đau buồn');
      if (isVillageCursed) {
        logs.push(`⚡ Thợ Săn ${deadHunter.name} tử trận nhưng không thể nổ súng do LỜI NGUYỀN GIÀ LÀNG (phe Dân đã mất sạch kỹ năng)!`);
      } else if (isPoisoned) {
        logs.push(`☠️ Thợ Săn ${deadHunter.name} bị Phù Thủy đầu độc trong lúc ngủ nên bị tê liệt, không thể rút súng bắn!`);
      } else if (isLoverSuicide) {
        logs.push(`🥀 Thợ Săn ${deadHunter.name} quẫn trí chết theo người tình, không thể nổ súng!`);
      } else {
        hunterTrigger = deadHunter;
      }
    }

    // 6. Thiên Sứ bị Ma Sói cắn chết ở Đêm 1 -> THẮNG NGAY LẬP TỨC
    let gameEndResult = null;
    if (this.roundNumber === 1) {
      const deadAngel = updatedPlayers.find(p => rawResult.killedPlayerIds.includes(p.id) && p.getRole()?.id === 'thien-su');
      if (deadAngel && nightActions.wolfTargetId === deadAngel.id) {
        gameEndResult = {
          isEnded: true,
          winner: 'Angel',
          winnerTitle: 'Thiên Sứ Chiến Thắng! 🪽',
          teamCode: '3',
          description: `${deadAngel.name} (Thiên Sứ) đã bị Ma Sói cắn chết vào Đêm 1 đúng như tâm nguyện, đắc đạo thăng thiên và một mình giành chiến thắng trò chơi!`
        };
      }
    }

    if (!gameEndResult) {
      const winResult = checkGameEnd(updatedPlayers);
      if (winResult.isEnded) gameEndResult = winResult;
    }

    const newGame = this.clone({
      players: updatedPlayers,
      isNight: false,
      activeTab: 'day',
      nightState: nextNightState,
      nightLogs: logs,
      gameEndResult: gameEndResult || this.gameEndResult,
      isVillageCursed,
      wolfCanKillDouble,
      lynchedTodayPlayerId: null,
      currentNightStepIdx: 0
    });

    return {
      game: newGame,
      killedPlayerIds: rawResult.killedPlayerIds,
      logs,
      deadSheriff,
      hunterTrigger,
      elderKilledByWitch: rawResult.elderKilledByWitch,
      killedWolfPup: Boolean(killedWolfPup),
      gameEndResult
    };
  }

  /**
   * Xử lý biểu quyết treo cổ người chơi ban ngày
   */
  lynchPlayer(playerId) {
    const target = this.getPlayer(playerId);
    if (!target || !target.isAlive) {
      return { success: false, reason: 'Người chơi không tồn tại hoặc đã qua đời' };
    }

    const targetRole = target.getRole();

    // 1. Thiên Sứ (Angel) bị treo cổ Ngày 1 -> Thắng ngay lập tức
    if (targetRole?.id === 'thien-su' && this.roundNumber === 1) {
      const deadTarget = target.kill('Được dân làng biểu quyết đưa lên giàn treo cổ Ngày 1 đúng như tâm nguyện', `Ngày ${this.roundNumber}`);
      const updatedPlayers = this.players.map(p => p.id === playerId ? deadTarget : p);
      const gameEndResult = {
        isEnded: true,
        winner: 'Angel',
        winnerTitle: 'Thiên Sứ Chiến Thắng! 🪽',
        teamCode: '3',
        description: `${target.name} (Thiên Sứ) đã bị dân làng treo cổ vào ngày đầu tiên đúng như tâm nguyện, đắc đạo thăng thiên và giành chiến thắng trò chơi!`
      };
      return {
        success: true,
        isIdiotWin: false,
        isAngelWin: true,
        gameEndResult,
        game: this.clone({ players: updatedPlayers, lynchedTodayPlayerId: playerId, gameEndResult })
      };
    }

    // 2. Thằng Ngốc (Idiot / Tanner) bị treo cổ -> Thắng luôn theo User Rule!
    if (targetRole?.id === 'thang-ngoc') {
      const updatedPlayers = this.players.map(p => {
        if (p.id === playerId) {
          return p.clone({
            isAlive: true,
            deathReason: 'Bị dân làng treo cổ và đạt mục tiêu chiến thắng ván đấu!',
            deathPhase: `Ngày ${this.roundNumber}`
          });
        }
        return p;
      });

      const idiotWinResult = {
        isEnded: true,
        winner: 'Idiot',
        winnerTitle: 'Thằng Ngố Đơn Độc Chiến Thắng! 🃏',
        teamCode: '3',
        description: `${target.name} (Thằng Ngố) đã thành công lừa toàn bộ dân làng biểu quyết treo cổ mình và một mình giành chiến thắng chung cuộc!`
      };

      return {
        success: true,
        isIdiotWin: true,
        isAngelWin: false,
        gameEndResult: idiotWinResult,
        game: this.clone({ players: updatedPlayers, lynchedTodayPlayerId: playerId, gameEndResult: idiotWinResult })
      };
    }

    // 3. Già Làng (Elder) bị Dân Làng treo cổ -> Lời Nguyền Già Làng giáng xuống
    let isVillageCursed = this.isVillageCursed;
    let elderCurseTriggered = false;
    if (targetRole?.id === 'gia-lang') {
      isVillageCursed = true;
      elderCurseTriggered = true;
    }

    // 4. Sói Con (Wolf Pup) bị treo cổ -> Đêm tới bầy Sói cắn 2 người
    let wolfCanKillDouble = this.wolfCanKillDouble;
    let wolfPupKilled = false;
    if (targetRole?.id === 'soi-con') {
      wolfCanKillDouble = true;
      wolfPupKilled = true;
    }

    // 5. Treo cổ người chơi
    const deadTarget = target.kill('Bị dân làng biểu quyết treo cổ trên giàn thiêu', `Ngày ${this.roundNumber}`);
    let updatedPlayers = this.players.map(p => p.id === playerId ? deadTarget : p);
    let deadSheriff = deadTarget.isSheriff ? deadTarget : null;
    let loverPartnerDied = null;
    let hunterTrigger = null;

    if (targetRole?.id === 'tho-san') {
      if (isVillageCursed) {
        hunterTrigger = null;
      } else {
        hunterTrigger = deadTarget;
      }
    }

    // 6. Cặp đôi Cupid chết chùm nếu có
    if (deadTarget.loverId) {
      const partner = updatedPlayers.find(p => p.id === deadTarget.loverId);
      if (partner && partner.isAlive) {
        const deadPartner = partner.kill(`Chết vì quá đau buồn khi người yêu (${deadTarget.name}) bị treo cổ`, `Ngày ${this.roundNumber}`);
        updatedPlayers = updatedPlayers.map(p => p.id === deadPartner.id ? deadPartner : p);
        loverPartnerDied = deadPartner;
        if (deadPartner.isSheriff) deadSheriff = deadPartner;

        // Luật Ma Sói chuẩn: Nếu người yêu chết theo là Thợ Săn và chưa mất phép -> Kích hoạt phát súng hấp hối
        if (deadPartner.getRole()?.id === 'tho-san' && !isVillageCursed) {
          hunterTrigger = deadPartner;
        }
      }
    }

    // 7. Kiểm tra Ảnh Tử kế thừa linh hồn nếu chủ thể chết
    const shadowRes1 = this._checkShadowInheritance(updatedPlayers, deadTarget);
    updatedPlayers = shadowRes1.updatedPlayers;
    let transformedShadows = [...shadowRes1.transformedShadows];
    if (loverPartnerDied) {
      const shadowRes2 = this._checkShadowInheritance(updatedPlayers, loverPartnerDied);
      updatedPlayers = shadowRes2.updatedPlayers;
      transformedShadows.push(...shadowRes2.transformedShadows);
    }

    const winResult = checkGameEnd(updatedPlayers);
    const gameEndResult = winResult.isEnded ? winResult : null;

    const nextGame = this.clone({
      players: updatedPlayers,
      lynchedTodayPlayerId: playerId,
      isVillageCursed,
      wolfCanKillDouble,
      gameEndResult: gameEndResult || this.gameEndResult
    });

    return {
      success: true,
      target,
      isIdiotWin: false,
      isAngelWin: false,
      elderCurseTriggered,
      wolfPupKilled,
      deadSheriff,
      loverPartnerDied,
      hunterTrigger,
      transformedShadows,
      gameEndResult,
      game: nextGame
    };
  }

  /**
   * Helper kiểm tra và chuyển đổi linh hồn cho Ảnh Tử (Private)
   */
  _checkShadowInheritance(playerList, deadPlayer) {
    if (!deadPlayer) return { updatedPlayers: playerList, transformedShadows: [] };
    const transformedShadows = [];
    const updatedPlayers = playerList.map(p => {
      if (p.isAlive && (p.currentRoleId === 'anh-tu' || p.roleId === 'anh-tu') && p.shadowHostId === deadPlayer.id) {
        const inheritRoleId = deadPlayer.originalRoleId || deadPlayer.currentRoleId || deadPlayer.roleId || 'dan-lang';
        const updated = p.clone({
          originalRoleId: 'anh-tu',
          currentRoleId: inheritRoleId,
          roleId: inheritRoleId,
          elderLives: inheritRoleId === 'gia-lang' ? 2 : p.elderLives
        });
        transformedShadows.push({
          shadow: updated,
          host: deadPlayer,
          inheritRoleId
        });
        return updated;
      }
      return p;
    });
    return { updatedPlayers, transformedShadows };
  }

  /**
   * Kị Sĩ Thách Đấu (Knight Duel)
   */
  knightDuel(knightId, targetId) {
    const knight = this.getPlayer(knightId);
    const target = this.getPlayer(targetId);
    if (!knight || !target || !knight.isAlive || !target.isAlive) {
      return { success: false, reason: 'Kị Sĩ hoặc mục tiêu không hợp lệ' };
    }

    const isWolf = target.isWolf();
    let updatedPlayers = [...this.players];
    let logs = [];
    let deadSheriff = null;
    let transformedShadows = [];

    // Đánh dấu Kị Sĩ đã dùng lượt lật bài
    const usedKnight = knight.clone({ hasUsedKnightDuel: true });
    updatedPlayers = updatedPlayers.map(p => p.id === knightId ? usedKnight : p);

    if (isWolf) {
      // Sói chết tại chỗ
      const deadTarget = target.kill('Bị Kị Sĩ lật bài chém chết tại chỗ vì là Ma Sói', `Ngày ${this.roundNumber}`);
      updatedPlayers = updatedPlayers.map(p => p.id === targetId ? deadTarget : p);
      if (deadTarget.isSheriff) deadSheriff = deadTarget;
      logs.push(`⚔️ Kị Sĩ ${knight.name} lật bài thách đấu thành công: Đã chém chết Ma Sói ${target.name} (#${target.id})!`);
      const shadowRes = this._checkShadowInheritance(updatedPlayers, deadTarget);
      updatedPlayers = shadowRes.updatedPlayers;
      transformedShadows = shadowRes.transformedShadows;
    } else {
      // Kị Sĩ chết vì phán đoán sai
      const deadKnight = usedKnight.kill('Chết gục tại chỗ vì phán đoán sai lầm khi thách đấu người lương thiện', `Ngày ${this.roundNumber}`);
      updatedPlayers = updatedPlayers.map(p => p.id === knightId ? deadKnight : p);
      if (deadKnight.isSheriff) deadSheriff = deadKnight;
      logs.push(`💀 Kị Sĩ ${knight.name} thách đấu sai lầm: ${target.name} vô tội. Kị Sĩ tử trận!`);
      const shadowRes = this._checkShadowInheritance(updatedPlayers, deadKnight);
      updatedPlayers = shadowRes.updatedPlayers;
      transformedShadows = shadowRes.transformedShadows;
    }

    const winResult = checkGameEnd(updatedPlayers);
    const gameEndResult = winResult.isEnded ? winResult : null;

    const nextGame = this.clone({
      players: updatedPlayers,
      lynchedTodayPlayerId: isWolf ? targetId : this.lynchedTodayPlayerId,
      gameEndResult: gameEndResult || this.gameEndResult
    });

    return {
      success: true,
      knight: usedKnight,
      target,
      isWolf,
      deadSheriff,
      transformedShadows,
      logs,
      gameEndResult,
      game: nextGame
    };
  }

  /**
   * Hoàn tác biểu quyết treo cổ (Undo Lynch)
   */
  undoLynch(playerId) {
    const target = this.getPlayer(playerId);
    if (!target) return this;

    const updatedPlayers = this.players.map(p => {
      // Hồi sinh người bị treo, người yêu chết chùm, và nạn nhân bị Thợ Săn bắn trong chuỗi lynch ngày hôm nay
      if (
        p.id === playerId || 
        p.loverId === playerId ||
        (p.deathReason && p.deathReason.includes('Thợ Săn') && p.deathPhase === `Ngày ${this.roundNumber}`) ||
        (p.deathReason && p.deathReason.includes('đau buồn') && p.deathPhase === `Ngày ${this.roundNumber}`)
      ) {
        return p.clone({ isAlive: true, deathReason: null, deathPhase: null });
      }
      return p;
    });

    return this.clone({
      players: updatedPlayers,
      lynchedTodayPlayerId: null,
      gameEndResult: null
    });
  }

  /**
   * Đánh giá điều kiện thắng cuộc
   */
  checkWinCondition(extraRules = {}) {
    return checkGameEnd(this.players, extraRules);
  }

  /**
   * Tạo bản sao bất biến của Game Engine
   */
  clone(patch = {}) {
    return new WerewolfGame({
      ...this.toJSON(),
      ...patch,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Xuất plain JSON để serialize lưu trữ vào localStorage và Neon DB
   */
  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      roundNumber: this.roundNumber,
      isNight: this.isNight,
      activeTab: this.activeTab,
      players: this.players.map(p => p.toJSON()),
      deckRoleIds: this.deckRoleIds,
      rolesInGameIds: this.rolesInGameIds,
      nightState: this.nightState,
      nightLogs: this.nightLogs,
      gameDiary: this.gameDiary,
      lynchedTodayPlayerId: this.lynchedTodayPlayerId,
      gameEndResult: this.gameEndResult,
      currentNightStepIdx: this.currentNightStepIdx,
      canWolvesKillTeammates: this.canWolvesKillTeammates,
      isVillageCursed: this.isVillageCursed,
      wolfCanKillDouble: this.wolfCanKillDouble,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Tái tạo WerewolfGame instance từ plain object trong cache hoặc Neon DB
   */
  static fromJSON(raw = {}) {
    return new WerewolfGame(raw);
  }
}
