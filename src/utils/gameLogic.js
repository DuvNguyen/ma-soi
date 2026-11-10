/**
 * Game logic engine for Werewolf GM
 */

import { getRole, getPlayerRole, getPlayerOriginalRole, isWolfPlayer } from './roleUtils.js';

export function checkGameEnd(players, extraRules = {}) {
  const alivePlayers = players.filter(p => p.isAlive);
  
  // Count teams
  let aliveWolves = 0;
  let aliveVillagers = 0;
  let hasCouple = false;
  let couplePlayers = [];

  alivePlayers.forEach(p => {
    // Check couple
    if (p.loverId) {
      const partner = players.find(x => x.id === p.loverId);
      if (partner && partner.isAlive) {
        hasCouple = true;
        if (!couplePlayers.some(c => c.id === p.id)) {
          couplePlayers.push(p);
        }
      }
    }

    const role = getPlayerRole(p);
    if (isWolfPlayer(p)) {
      aliveWolves++;
    } else if (role?.teamCode === 'V') {
      aliveVillagers++;
    } else {
      // 3rd party or variable
      if (role?.id === 'soi-trang') {
        aliveWolves++; // counts toward wolf count initially
      } else {
        aliveVillagers++; // default to non-wolf
      }
    }
  });

  // 1. Special 3rd party: Pied Piper (Người Thổi Sáo)
  const piedPiper = alivePlayers.find(p => getPlayerRole(p)?.id === 'nguoi-thoi-sao');
  if (piedPiper) {
    const others = alivePlayers.filter(p => p.id !== piedPiper.id);
    if (others.length > 0 && others.every(p => p.isHypnotized)) {
      return {
        isEnded: true,
        winner: 'Pied Piper',
        winnerTitle: 'Người Thổi Sáo Chiến Thắng!',
        teamCode: '3',
        description: 'Tất cả người chơi còn sống đều đã bị mê hoặc bởi tiếng sáo kỳ diệu!'
      };
    }
  }

  // 2. Special 3rd party: Cross-team Couple (Cặp đôi khác phe: 1 Sói + 1 Dân)
  if (couplePlayers.length === 2 && alivePlayers.length === 2) {
    const p1 = couplePlayers[0];
    const p2 = couplePlayers[1];
    const isP1Wolf = isWolfPlayer(p1);
    const isP2Wolf = isWolfPlayer(p2);
    if ((isP1Wolf && !isP2Wolf) || (!isP1Wolf && isP2Wolf)) {
      const p1Role = getPlayerRole(p1);
      const p2Role = getPlayerRole(p2);
      return {
        isEnded: true,
        winner: 'Lovers',
        winnerTitle: 'Cặp Đôi Tình Yêu Khác Phe Chiến Thắng!',
        teamCode: '3',
        description: `${p1.name} (${p1Role?.name || 'Chưa rõ'}) và ${p2.name} (${p2Role?.name || 'Chưa rõ'}) là hai người duy nhất sống sót vượt qua mọi định kiến!`
      };
    }
  }

  // 3. Special 3rd party: White Werewolf (Sói Trắng)
  const whiteWolf = alivePlayers.find(p => getPlayerRole(p)?.id === 'soi-trang');
  if (whiteWolf && alivePlayers.length === 1) {
    return {
      isEnded: true,
      winner: 'White Werewolf',
      winnerTitle: 'Sói Trắng Độc Chiếm Ngôi Làng!',
      teamCode: '3',
      description: 'Sói Trắng đã tiêu diệt cả bầy Sói lẫn toàn bộ Dân Làng để trở thành kẻ duy nhất sống sót!'
    };
  }

  // 4. Werewolves win: Number of wolves >= Number of villagers (or villagers = 0)
  if (aliveWolves > 0 && aliveWolves >= aliveVillagers) {
    return {
      isEnded: true,
      winner: 'Werewolves',
      winnerTitle: 'Phe Ma Sói Chiến Thắng!',
      teamCode: 'W',
      description: `Số lượng Ma Sói (${aliveWolves}) đã áp đảo hoặc ngang bằng số Dân Làng (${aliveVillagers}). Đêm tối vĩnh hằng bao trùm ngôi làng!`
    };
  }

  // 5. Villagers win: All werewolves are eliminated
  if (aliveWolves === 0) {
    return {
      isEnded: true,
      winner: 'Villagers',
      winnerTitle: 'Phe Dân Làng Chiến Thắng!',
      teamCode: 'V',
      description: 'Toàn bộ Ma Sói độc ác đã bị thanh trừng! Ngôi làng đã tìm lại được ánh bình minh yên bình.'
    };
  }

  // Game continues
  return {
    isEnded: false,
    aliveWolves,
    aliveVillagers,
    totalAlive: alivePlayers.length
  };
}

/**
 * Resolve Night Phase kills and protections
 */
export function resolveNightPhase(players, nightActions, roundNumber) {
  let updatedPlayers = players.map(p => ({ ...p }));
  let killedPlayerIds = new Set();
  let deathReasons = {};
  let logs = [];

  const {
    wolfTargetId,
    protectedPlayerId,
    witchSaved,
    witchPoisonTargetId,
    isCursedInfect,
    lastCursedVictimId
  } = nightActions;

  // 0. Process Immediate Cursed Wolf Infection if occurred in current round
  if (lastCursedVictimId) {
    const cursedTarget = updatedPlayers.find(p => p.id === lastCursedVictimId);
    if (cursedTarget) {
      const origRole = getPlayerOriginalRole(cursedTarget);
      logs.push(`🔮 SÓI NGUYỀN ĐÃ LÂY NHIỄM: ${cursedTarget.name} (vốn giữ vai ${origRole?.name || 'Chưa lộ vai'}) không bị cắn chết mà đã được Sói Nguyền lây nhiễm, gia nhập bầy Ma Sói của làng!`);
    }
  }

  // 1. Process Werewolf Kill or Cursed Wolf Infection
  if (wolfTargetId) {
    const target = updatedPlayers.find(p => p.id === wolfTargetId);
    if (target && target.isAlive) {
      if (isCursedInfect) {
        // SÓI NGUYỀN (NGƯỜI CHA CỦA SÓI) ĐỒNG HÓA LÂY NHIỄM
        // Người này không chết, lưu ID vai trò cũ và nhận vai trò Ma Sói
        const oldRoleId = target.currentRoleId || target.roleId;
        target.originalRoleId = target.originalRoleId || oldRoleId;
        target.isCursedWolf = true;
        target.curseNight = roundNumber;
        target.currentRoleId = 'soi-thuong';
        target.roleId = 'soi-thuong';
        delete target.role;
        delete target.originalRole;
        const origRole = getPlayerOriginalRole(target);
        logs.push(`🔮 SÓI NGUYỀN ĐÃ LÂY NHIỄM: ${target.name} (vốn giữ vai ${origRole?.name || 'Chưa lộ vai'}) không bị cắn chết mà đã được Sói Nguyền lây nhiễm, trở thành Ma Sói mới của làng!`);
      } else {
        const isProtected = protectedPlayerId === target.id;
        const isSavedByWitch = witchSaved;

        if (isProtected || isSavedByWitch) {
          let reason = isProtected ? 'được Bảo Vệ che chở' : 'được Phù Thủy dùng bình thần dược cứu sống';
          logs.push(`${target.name} bị Ma Sói tấn công nhưng may mắn ${reason}!`);
        } else {
          const targetRole = getPlayerRole(target);
          // Check Elder (Già Làng - 2 lives against wolves)
          if (targetRole?.id === 'gia-lang' && (target.elderLives || 2) > 1) {
            target.elderLives = (target.elderLives || 2) - 1;
            logs.push(`Già Làng ${target.name} bị Ma Sói cắn nhưng đã kiên cường sống sót nhờ mạng sống thứ nhất (Còn 1 mạng)!`);
          } else if (targetRole?.id === 'nua-nguoi-nua-soi') {
            // Nửa Người Nửa Sói turns into werewolf - preserve original role
            const oldRoleId = target.currentRoleId || target.roleId;
            target.originalRoleId = target.originalRoleId || oldRoleId;
            target.isCursedWolf = true;
            target.curseNight = roundNumber;
            target.currentRoleId = 'soi-thuong';
            target.roleId = 'soi-thuong';
            delete target.role;
            delete target.originalRole;
            logs.push(`Nửa Người Nửa Sói ${target.name} bị Ma Sói cắn và đã chính thức thức tỉnh gen Sói, gia nhập đàn Sói!`);
          } else {
            killedPlayerIds.add(target.id);
            deathReasons[target.id] = 'Bị Ma Sói cắn chết trong đêm';
          }
        }
      }
    }
  }

  // 2. Process Witch Poison
  if (witchPoisonTargetId) {
    const poisonTarget = updatedPlayers.find(p => p.id === witchPoisonTargetId);
    if (poisonTarget && poisonTarget.isAlive) {
      killedPlayerIds.add(poisonTarget.id);
      deathReasons[poisonTarget.id] = 'Bị Phù Thủy đầu độc chết trong đêm';
      logs.push(`${poisonTarget.name} đã bị Phù Thủy sử dụng bình thuốc độc tiêu diệt!`);
    }
  }

  // 3. Mark dead players
  killedPlayerIds.forEach(id => {
    const p = updatedPlayers.find(x => x.id === id);
    if (p) {
      p.isAlive = false;
      p.deathReason = deathReasons[id];
      p.deathPhase = `Đêm ${roundNumber}`;
    }
  });

  // 4. Cascade deaths: Lovers (Cupid)
  let loverCascade = true;
  while (loverCascade) {
    loverCascade = false;
    for (let p of updatedPlayers) {
      if (!p.isAlive && p.loverId) {
        const lover = updatedPlayers.find(x => x.id === p.loverId);
        if (lover && lover.isAlive) {
          lover.isAlive = false;
          lover.deathReason = `Chết vì quá đau buồn khi người yêu (${p.name}) qua đời`;
          lover.deathPhase = `Đêm ${roundNumber}`;
          killedPlayerIds.add(lover.id);
          logs.push(`${lover.name} đau đớn gục ngã chết theo người tình ${p.name}!`);
          loverCascade = true; // Check if lover had another link
        }
      }
    }
  }

  // 5. Check Wild Child (Đứa Trẻ Hoang Dã) idol death
  updatedPlayers.forEach(p => {
    if (p.isAlive && getPlayerRole(p)?.id === 'dua-tre-hoang-da' && p.idolId) {
      const idol = updatedPlayers.find(x => x.id === p.idolId);
      if (idol && !idol.isAlive) {
        const oldRoleId = p.currentRoleId || p.roleId;
        p.originalRoleId = p.originalRoleId || oldRoleId;
        p.isCursedWolf = true;
        p.curseNight = roundNumber;
        p.currentRoleId = 'soi-thuong';
        p.roleId = 'soi-thuong';
        delete p.role;
        delete p.originalRole;
        logs.push(`Thần tượng (${idol.name}) của Đứa Trẻ Hoang Dã (${p.name}) đã chết! Đứa Trẻ nổi giận biến thành Ma Sói!`);
      }
    }
  });

  return {
    updatedPlayers,
    killedPlayerIds: Array.from(killedPlayerIds),
    logs
  };
}
