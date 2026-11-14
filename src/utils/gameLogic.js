/**
 * Game logic engine for Werewolf GM
 */

import { getRole, getPlayerRole, getPlayerOriginalRole, isWolfPlayer } from './roleUtils.js';

export function checkGameEnd(players, extraRules = {}) {
  const alivePlayers = players.filter(p => p.isAlive);
  
  // 0. Special case: All players died simultaneously (Draw / Tie)
  if (alivePlayers.length === 0) {
    return {
      isEnded: true,
      winner: 'Draw',
      winnerTitle: 'Cả Làng Diệt Vong (Hòa Cờ)! 🪦',
      teamCode: '?',
      description: 'Không một ai sống sót sau cuộc tàn sát đẫm máu. Ngôi làng chìm trong bóng tối vĩnh hằng!'
    };
  }

  // Count teams
  let aliveWolves = 0;
  let aliveVillagers = 0;
  let aliveThirdParty = 0;
  let totalWolves = 0;
  let hasCouple = false;
  let couplePlayers = [];

  players.forEach(p => {
    if (isWolfPlayer(p)) {
      totalWolves++;
    }
  });

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
    } else if (role?.teamCode === '3') {
      aliveThirdParty++;
    } else {
      // Biến đổi / chưa lộ vai ('?')
      aliveVillagers++;
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

  // 2. Special 3rd party: Surviving Couple (Cặp đôi sống sót cuối cùng)
  if (couplePlayers.length === 2 && alivePlayers.length === 2) {
    const p1 = couplePlayers[0];
    const p2 = couplePlayers[1];
    const p1Role = getPlayerRole(p1);
    const p2Role = getPlayerRole(p2);
    return {
      isEnded: true,
      winner: 'Lovers',
      winnerTitle: 'Cặp Đôi Tình Yêu Chiến Thắng! 💘',
      teamCode: '3',
      description: `${p1.name} (${p1Role?.name || 'Chưa rõ'}) và ${p2.name} (${p2Role?.name || 'Chưa rõ'}) là hai người duy nhất sống sót bảo vệ tình yêu đến cùng!`
    };
  }

  // 3. Special 3rd party: White Werewolf (Sói Trắng)
  const whiteWolf = alivePlayers.find(p => getPlayerRole(p)?.id === 'soi-trang');
  if (whiteWolf && alivePlayers.length === 1) {
    return {
      isEnded: true,
      winner: 'White Werewolf',
      winnerTitle: 'Sói Trắng Độc Chiếm Ngôi Làng! 🐺👑',
      teamCode: '3',
      description: 'Sói Trắng là kẻ duy nhất sống sót sau khi thanh trừng cả Dân Làng lẫn bầy Ma Sói!'
    };
  }

  // 3.1. Special 3rd party: Bất kỳ người chơi Phe Thứ Ba nào là người duy nhất sống sót (Sát Thủ, v.v.)
  if (alivePlayers.length === 1 && aliveThirdParty === 1) {
    const solo = alivePlayers[0];
    const soloRole = getPlayerRole(solo);
    return {
      isEnded: true,
      winner: soloRole?.name || 'Third Party',
      winnerTitle: `${soloRole?.name || 'Phe Thứ 3'} Đơn Độc Chiến Thắng! 👑`,
      teamCode: '3',
      description: `${solo.name} (${soloRole?.name || 'Phe Thứ 3'}) là kẻ duy nhất sống sót vượt qua mọi thế lực trong làng!`
    };
  }

  // Nếu Sói Trắng còn sống và tất cả Dân Làng đã chết, nhưng vẫn còn Ma Sói thường:
  // Ván đấu PHẢI TIẾP TỤC để Sói Trắng và Sói thường thanh trừng lẫn nhau!
  const hasOtherWolves = alivePlayers.some(p => isWolfPlayer(p) && getPlayerRole(p)?.id !== 'soi-trang');
  if (whiteWolf && hasOtherWolves && aliveVillagers === 0) {
    return {
      isEnded: false,
      aliveWolves,
      aliveVillagers,
      aliveThirdParty,
      totalAlive: alivePlayers.length
    };
  }

  // 4. Werewolves win: Số Sói >= Số người đối địch (Dân + Phe 3) VÀ không còn Sói Trắng tranh chấp
  const nonWolves = aliveVillagers + aliveThirdParty;
  if (!whiteWolf && aliveWolves > 0 && aliveWolves >= nonWolves) {
    return {
      isEnded: true,
      winner: 'Werewolves',
      winnerTitle: 'Phe Ma Sói Chiến Thắng!',
      teamCode: 'W',
      description: `Số Ma Sói (${aliveWolves}) đã áp đảo hoặc bằng toàn bộ phe đối địch (${nonWolves}).`
    };
  }

  // 5. Villagers win: Có Ma Sói trong ván, toàn bộ Ma Sói đã bị tiêu diệt, còn ít nhất 1 dân sống VÀ không còn Phe 3 đối địch
  if (totalWolves > 0 && aliveWolves === 0 && aliveVillagers > 0 && aliveThirdParty === 0) {
    return {
      isEnded: true,
      winner: 'Villagers',
      winnerTitle: 'Phe Dân Làng Chiến Thắng!',
      teamCode: 'V',
      description: 'Toàn bộ Ma Sói độc ác đã bị thanh trừng sạch!'
    };
  }

  // Game continues
  return {
    isEnded: false,
    aliveWolves,
    aliveVillagers,
    aliveThirdParty,
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
  let refundWitchHeal = false;
  let elderKilledByWitch = false;

  const {
    wolfTargetId,
    wolfTargetId2,
    bigBadWolfTargetId,
    protectedPlayerId,
    witchSaved,
    witchPoisonTargetId,
    whiteWolfVictimId,
    isCursedInfect,
    lastCursedVictimId,
    isVillageCursed = false
  } = nightActions;

  // 0. Process Immediate Cursed Wolf Infection if occurred in current round
  if (lastCursedVictimId) {
    const cursedTarget = updatedPlayers.find(p => p.id === lastCursedVictimId);
    if (cursedTarget) {
      const origRole = getPlayerOriginalRole(cursedTarget);
      logs.push(`🔮 SÓI NGUYỀN ĐÃ LÂY NHIỄM: ${cursedTarget.name} (vốn giữ vai ${origRole?.name || 'Chưa lộ vai'}) không bị cắn chết mà đã được Sói Nguyền lây nhiễm, gia nhập bầy Ma Sói của làng!`);
    }
  }

  // 0.1 Process Rusty Sword Poison from previous night
  updatedPlayers.forEach(p => {
    if (p.isAlive && p.poisonedByRustySword && roundNumber >= (p.rustySwordPoisonRound || 1)) {
      killedPlayerIds.add(p.id);
      deathReasons[p.id] = 'Chết vì vết thương nhiễm trùng từ thanh kiếm gỉ của Hiệp Sĩ';
      logs.push(`🗡️ VẾT THƯƠNG PHÁT TÁC: Ma Sói ${p.name} (#${p.id}) đã gục chết trong đêm do nhát chém gỉ sét của Hiệp Sĩ từ trước!`);
      p.poisonedByRustySword = false;
    }
  });

  // Helper to process wolf bite on a target
  const processWolfBite = (targetId, isSecondTarget = false) => {
    const target = updatedPlayers.find(p => p.id === targetId);
    if (!target || !target.isAlive) return;

    const isProtected = !isVillageCursed && protectedPlayerId === target.id;
    const isSavedByWitch = !isVillageCursed && !isSecondTarget && witchSaved;

    // RULE CONFLICT FIX #3: Nếu cả Bảo Vệ và Phù Thủy cùng cứu 1 người, Bảo Vệ đỡ đòn thành công -> hoàn trả bình cứu cho Phù Thủy
    if (isProtected && isSavedByWitch) {
      refundWitchHeal = true;
      logs.push(`🛡️ ${target.name} bị Ma Sói tấn công nhưng đã được BẢO VỆ che chở an toàn! Phù Thủy không bị tiêu hao bình cứu (đã hoàn trả lại bình thần dược)!`);
      return;
    }

    if (isProtected || isSavedByWitch) {
      let reason = isProtected ? 'được Bảo Vệ che chở' : 'được Phù Thủy dùng bình thần dược cứu sống';
      logs.push(`${target.name} bị Ma Sói tấn công nhưng may mắn ${reason}!`);
      return;
    }

    if (isCursedInfect && !isSecondTarget) {
      // SÓI NGUYỀN (NGƯỜI CHA CỦA SÓI) ĐỒNG HÓA LÂY NHIỄM
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
      return;
    }

    const targetRole = getPlayerRole(target);
    // Check Elder (Già Làng - 2 lives against wolves)
    if (targetRole?.id === 'gia-lang' && (target.elderLives || 2) > 1) {
      target.elderLives = (target.elderLives || 2) - 1;
      logs.push(`Già Làng ${target.name} bị Ma Sói cắn nhưng đã kiên cường sống sót nhờ mạng sống thứ nhất (Còn 1 mạng)!`);
    } else if (targetRole?.id === 'nua-nguoi-nua-soi' || target.currentRoleId === 'nua-nguoi-nua-soi' || target.roleId === 'nua-nguoi-nua-soi') {
      // Nửa Người Nửa Sói turns into werewolf - preserve original role
      const oldRoleId = target.currentRoleId || target.roleId;
      target.originalRoleId = target.originalRoleId || oldRoleId;
      target.isCursedWolf = true;
      target.curseNight = roundNumber;
      target.currentRoleId = 'soi-thuong';
      target.roleId = 'soi-thuong';
      delete target.role;
      delete target.originalRole;
      logs.push(`🐺 BÁN SÓI THỨC TỈNH: ${target.name} (Nửa Người Nửa Sói) bị Ma Sói cắn trong đêm không chết mà đã chính thức thức tỉnh gen Sói, gia nhập đàn Ma Sói của làng!`);
    } else {
      killedPlayerIds.add(target.id);
      deathReasons[target.id] = isSecondTarget 
        ? 'Bị Ma Sói cuồng nộ (Sói Con chết) cắn chết trong đêm'
        : 'Bị Ma Sói cắn chết trong đêm';

      // Hiệp Sĩ Kiếm Gỉ: Nhiễm độc con Ma Sói sống gần nhất bên trái theo vòng tròn ghế ngồi
      if (targetRole?.id === 'hiep-si-kiem-gi' && !isVillageCursed) {
        const targetIdx = updatedPlayers.findIndex(p => p.id === target.id);
        const aliveWolves = updatedPlayers.filter(p => p.isAlive && isWolfPlayer(p) && p.id !== target.id);
        if (aliveWolves.length > 0 && targetIdx !== -1) {
          aliveWolves.sort((a, b) => {
            const idxA = updatedPlayers.findIndex(p => p.id === a.id);
            const idxB = updatedPlayers.findIndex(p => p.id === b.id);
            const distA = (idxA - targetIdx + updatedPlayers.length) % updatedPlayers.length;
            const distB = (idxB - targetIdx + updatedPlayers.length) % updatedPlayers.length;
            return distA - distB;
          });
          const targetWolf = aliveWolves[0];
          targetWolf.poisonedByRustySword = true;
          targetWolf.rustySwordPoisonRound = roundNumber + 1;
          logs.push(`🗡️ KIẾM GỈ NHIỄM ĐỘC: Hiệp Sĩ Kiếm Gỉ (${target.name}) bị Sói cắn chết, nhưng thanh kiếm gỉ đã chém nhiễm độc con Sói ngồi gần nhất bên trái (${targetWolf.name} #${targetWolf.id})! Con Sói này sẽ phát độc chết vào đêm tiếp theo!`);
        }
      }
    }
  };

  // 1. Process Primary Werewolf Kill
  if (wolfTargetId) {
    processWolfBite(wolfTargetId, false);
  }

  // 1.1 Process Secondary Werewolf Kill (RULE CONFLICT FIX #4: Khi Sói Con chết đêm trước)
  if (wolfTargetId2 && wolfTargetId2 !== wolfTargetId) {
    processWolfBite(wolfTargetId2, true);
  }

  // 1.2 Process Big Bad Wolf (Sói Lớn Xấu Xa) Extra Bite
  const bigBadWolfPlayer = updatedPlayers.find(p => (p.currentRoleId || p.roleId) === 'soi-lon-xau-xa');
  const deadWolves = updatedPlayers.filter(p => !p.isAlive && isWolfPlayer(p));
  const canBigBadWolfBite = Boolean(bigBadWolfPlayer && bigBadWolfPlayer.isAlive && deadWolves.length === 0);

  if (canBigBadWolfBite && bigBadWolfTargetId && bigBadWolfTargetId !== wolfTargetId && bigBadWolfTargetId !== wolfTargetId2) {
    const bbTarget = updatedPlayers.find(p => p.id === bigBadWolfTargetId);
    if (bbTarget && bbTarget.isAlive) {
      const isProtected = !isVillageCursed && protectedPlayerId === bbTarget.id;
      if (isProtected) {
        logs.push(`🛡️ ${bbTarget.name} bị Sói Lớn Xấu Xa cắn thêm nhưng đã được BẢO VỆ che chở an toàn!`);
      } else {
        const targetRole = getPlayerRole(bbTarget);
        if (targetRole?.id === 'gia-lang' && (bbTarget.elderLives || 2) > 1) {
          bbTarget.elderLives = (bbTarget.elderLives || 2) - 1;
          logs.push(`Già Làng ${bbTarget.name} bị Sói Lớn Xấu Xa cắn nhưng sống sót nhờ mạng sống thứ nhất (Còn 1 mạng)!`);
        } else if (targetRole?.id === 'nua-nguoi-nua-soi' || bbTarget.currentRoleId === 'nua-nguoi-nua-soi' || bbTarget.roleId === 'nua-nguoi-nua-soi') {
          const oldRoleId = bbTarget.currentRoleId || bbTarget.roleId;
          bbTarget.originalRoleId = bbTarget.originalRoleId || oldRoleId;
          bbTarget.isCursedWolf = true;
          bbTarget.curseNight = roundNumber;
          bbTarget.currentRoleId = 'soi-thuong';
          bbTarget.roleId = 'soi-thuong';
          delete bbTarget.role;
          delete bbTarget.originalRole;
          logs.push(`🐺 BÁN SÓI THỨC TỈNH: ${bbTarget.name} bị Sói Lớn Xấu Xa cắn và đã thức tỉnh gen Sói, gia nhập phe Sói!`);
        } else {
          killedPlayerIds.add(bbTarget.id);
          deathReasons[bbTarget.id] = 'Bị Sói Lớn Xấu Xa cắn chết trong đêm';
          logs.push(`🐺💀 SÓI LỚN XẤU XA RA TAY: ${bbTarget.name} (#${bbTarget.id}) đã bị Sói Lớn Xấu Xa cắn chết trong lượt săn đêm bổ sung!`);
        }
      }
    }
  }

  // 2. Process Witch Poison
  if (witchPoisonTargetId && !isVillageCursed) {
    const poisonTarget = updatedPlayers.find(p => p.id === witchPoisonTargetId);
    if (poisonTarget && poisonTarget.isAlive) {
      killedPlayerIds.add(poisonTarget.id);
      deathReasons[poisonTarget.id] = 'Bị Phù Thủy đầu độc chết trong đêm';
      logs.push(`${poisonTarget.name} đã bị Phù Thủy sử dụng bình thuốc độc tiêu diệt!`);
      
      // RULE CONFLICT FIX #2: Nếu Già Làng chết do độc Phù Thủy (phe Dân)
      const poisonRole = getPlayerRole(poisonTarget);
      if (poisonRole?.id === 'gia-lang') {
        elderKilledByWitch = true;
      }
    }
  }

  // 2.1 Process White Werewolf Kill (Sói Trắng giết đồng bọn cứ 2 đêm 1 lần)
  if (whiteWolfVictimId) {
    const whiteWolfTarget = updatedPlayers.find(p => p.id === whiteWolfVictimId);
    if (whiteWolfTarget && whiteWolfTarget.isAlive) {
      killedPlayerIds.add(whiteWolfTarget.id);
      deathReasons[whiteWolfTarget.id] = 'Bị Sói Trắng bí mật sát hại trong đêm để độc chiếm ngôi làng';
      logs.push(`🐺 SÓI TRẮNG TÀN SÁT: Sói Trắng đã bí mật xé xác Ma Sói ${whiteWolfTarget.name} (#${whiteWolfTarget.id}) trong đêm!`);
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

  // 4.1. Process Pied Piper (Người Thổi Sáo) charm
  if (nightActions.piperChosenIds && Array.isArray(nightActions.piperChosenIds)) {
    nightActions.piperChosenIds.forEach(id => {
      const p = updatedPlayers.find(x => x.id === id);
      if (p && p.isAlive) {
        p.isHypnotized = true;
      }
    });
  }

  // 5. Check Wild Child (Đứa Trẻ Hoang Dã) idol death
  let transformedWildChildren = [];
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
        transformedWildChildren.push({
          wildChild: p,
          idol
        });
        logs.push(`Thần tượng (${idol.name}) của Đứa Trẻ Hoang Dã (${p.name}) đã chết! Đứa Trẻ nổi giận biến thành Ma Sói!`);
      }
    }
  });

  // 6. Check Shadow (Ảnh Tử) host death
  let transformedShadows = [];
  updatedPlayers.forEach(p => {
    if (p.isAlive && (p.currentRoleId === 'anh-tu' || p.roleId === 'anh-tu' || getPlayerRole(p)?.id === 'anh-tu') && p.shadowHostId) {
      if (killedPlayerIds.has(p.shadowHostId)) {
        const host = updatedPlayers.find(x => x.id === p.shadowHostId);
        if (host) {
          const inheritRoleId = host.originalRoleId || host.currentRoleId || host.roleId || 'dan-lang';
          p.originalRoleId = 'anh-tu';
          p.currentRoleId = inheritRoleId;
          p.roleId = inheritRoleId;
          if (inheritRoleId === 'gia-lang') p.elderLives = 2;
          delete p.role;
          delete p.originalRole;
          const newRole = getRole(inheritRoleId);
          transformedShadows.push({
            shadow: p,
            host,
            inheritRoleId
          });
          logs.push(`👻 ẢNH TỬ THỨC TỈNH: Bản thể (${host.name}) của Ảnh Tử (${p.name}) đã qua đời! Ảnh Tử hấp thu linh hồn và trở thành ${newRole?.name || inheritRoleId}!`);
        }
      }
    }
  });

  // TỔNG KẾT THƯƠNG VONG ĐẦU BẢN TIN (BẮT BUỘC IN ĐẦU TIÊN)
  const deadCount = killedPlayerIds.size;
  let summaryLog = '';
  if (deadCount === 0) {
    summaryLog = 'Đêm qua bình yên, không có ai chết!';
  } else {
    const deadListStr = Array.from(killedPlayerIds).map(id => {
      const p = updatedPlayers.find(x => x.id === id);
      return `${p?.name || 'Người chơi'} (#${id})`;
    }).join(', ');
    summaryLog = `Đêm qua có ${deadCount} người chết: ${deadListStr}.`;
  }
  logs.unshift(summaryLog);

  return {
    updatedPlayers,
    killedPlayerIds: Array.from(killedPlayerIds),
    poisonedPlayerIds: witchPoisonTargetId ? [witchPoisonTargetId] : [],
    refundWitchHeal,
    elderKilledByWitch,
    transformedShadows,
    transformedWildChildren,
    logs
  };
}
