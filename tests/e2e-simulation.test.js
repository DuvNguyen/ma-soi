import assert from 'node:assert';
import test from 'node:test';
import { Player } from '../src/domain/models/Player.js';
import { WerewolfGame } from '../src/domain/models/WerewolfGame.js';

test('E2E Full Match Simulation: 8 Players, Night 1 -> Day 1 -> Night 2 -> Win Condition', () => {
  console.log('🎮 [E2E] Starting Full Werewolf Game Simulation...');

  // 1. Initial Roster Setup
  const initialPlayers = [
    new Player({ id: 1, name: 'Alpha Wolf', currentRoleId: 'soi-thuong', roleId: 'soi-thuong' }),
    new Player({ id: 2, name: 'Pup Wolf', currentRoleId: 'soi-con', roleId: 'soi-con' }),
    new Player({ id: 3, name: 'Lycan Half-Wolf', currentRoleId: 'nua-nguoi-nua-soi', roleId: 'nua-nguoi-nua-soi' }),
    new Player({ id: 4, name: 'Wise Elder', currentRoleId: 'gia-lang', roleId: 'gia-lang', elderLives: 2 }),
    new Player({ id: 5, name: 'Clairvoyant Seer', currentRoleId: 'tien-tri', roleId: 'tien-tri' }),
    new Player({ id: 6, name: 'Shield Bodyguard', currentRoleId: 'bao-ve', roleId: 'bao-ve' }),
    new Player({ id: 7, name: 'Alchemist Witch', currentRoleId: 'phu-thuy', roleId: 'phu-thuy' }),
    new Player({ id: 8, name: 'Marksman Hunter', currentRoleId: 'tho-san', roleId: 'tho-san' })
  ];

  let game = new WerewolfGame({
    roundNumber: 1,
    isNight: true,
    players: initialPlayers,
    nightState: {
      witchHasHeal: true,
      witchHasPoison: true
    }
  });

  assert.strictEqual(game.players.length, 8);
  assert.strictEqual(game.getLivingPlayers().length, 8);
  assert.strictEqual(game.getWolves().length, 2); // Player 1 and 2

  // Verify Seer inspection BEFORE Half-Wolf is bitten
  const halfWolfBeforeBite = game.getPlayer(3);
  assert.strictEqual(halfWolfBeforeBite.getSeerAffiliation({}), 'VILLAGER');
  console.log('  ✓ Step 1: Initial roster verified. Seer sees unbitten Half-Wolf as VILLAGER.');

  // 2. Night 1 Actions:
  // - Bodyguard protects Elder (#4)
  // - Wolves attack Elder (#4) -> Saved by Bodyguard!
  // - Seer inspects Seer Target #1 -> WOLF
  const seerTarget1 = game.getPlayer(1);
  assert.strictEqual(seerTarget1.getSeerAffiliation({}), 'WOLF');

  const night1Actions = {
    protectedPlayerId: 4,
    wolfTargetId: 4,
    seerCheckedId: 1
  };

  const night1Resolution = game.resolveNight(night1Actions);
  game = night1Resolution.game;

  // Verify Night 1 outcome: Nobody dies
  assert.strictEqual(night1Resolution.killedPlayerIds.length, 0);
  assert.strictEqual(game.getPlayer(4).isAlive, true);
  assert.strictEqual(game.getPlayer(4).elderLives, 2); // Bodyguard protected, shield not lost
  assert.strictEqual(game.isNight, false);
  console.log('  ✓ Step 2: Night 1 resolved cleanly. Bodyguard protected Elder. 0 casualties.');

  // 3. Day 1 Phase:
  // Villagers decide to lynch the suspicious Pup Wolf (#2)
  const lynchResult = game.lynchPlayer(2);
  assert.strictEqual(lynchResult.success, true);
  assert.strictEqual(lynchResult.wolfPupKilled, true);
  game = lynchResult.game;

  assert.strictEqual(game.getPlayer(2).isAlive, false);
  assert.strictEqual(game.wolfCanKillDouble, true); // Wolf Pup death triggers double kill next night!
  console.log('  ✓ Step 3: Day 1 Wolf Pup lynched. Cuồng nộ triggered (wolfCanKillDouble = true).');

  // 4. Advance to Night 2
  game = game.clone({
    roundNumber: 2,
    isNight: true,
    activeTab: 'night',
    nightState: {
      ...game.nightState,
      lastNightProtectedId: 4,
      protectedPlayerId: null,
      wolfTargetId: null,
      wolfTargetId2: null
    }
  });

  // 5. Night 2 Actions:
  // - Bodyguard cannot protect Elder 2 nights in a row, protects Seer (#5)
  // - Wolves (cuồng nộ) attack Target 1: Half-Wolf (#3) and Target 2: Bodyguard (#6)
  // - Witch uses Poison on nobody
  const night2Actions = {
    protectedPlayerId: 5,
    wolfTargetId: 3, // Bán Sói
    wolfTargetId2: 6 // Bảo Vệ
  };

  const night2Resolution = game.resolveNight(night2Actions);
  game = night2Resolution.game;

  // Verify Night 2 outcome:
  // - Bodyguard (#6) is dead
  // - Half-Wolf (#3) is NOT dead! Instead, awakened as Werewolf!
  assert.strictEqual(game.getPlayer(6).isAlive, false);
  assert.strictEqual(game.getPlayer(3).isAlive, true);
  assert.strictEqual(game.getPlayer(3).isWolf(), true);
  assert.strictEqual(game.getPlayer(3).currentRoleId, 'soi-thuong');
  assert.strictEqual(game.getPlayer(3).originalRoleId, 'nua-nguoi-nua-soi');

  // Now when Seer inspects Half-Wolf (#3), it MUST return WOLF!
  assert.strictEqual(game.getPlayer(3).getSeerAffiliation(), 'WOLF');
  console.log('  ✓ Step 4: Night 2 resolved. Half-Wolf bitten -> awakened as WOLF. Seer now detects as WOLF.');

  // 6. Day 2: Test Reassignment Blocks
  // Rule A: Bodyguard (#6) is dead -> role "bao-ve" can NOT be reassigned
  assert.strictEqual(game.canRoleBeReassigned('bao-ve'), false);
  const reassignDeadRes = game.assignRole(7, 'bao-ve');
  assert.strictEqual(reassignDeadRes.success, false);
  console.log('  ✓ Step 5: Dead role reassignment strictly blocked.');

  // Rule B: Half-Wolf (#3) has transformed into Wolf -> role "nua-nguoi-nua-soi" can NOT be reassigned
  assert.strictEqual(game.canRoleBeReassigned('nua-nguoi-nua-soi'), false);
  const reassignCursedRes = game.assignRole(7, 'nua-nguoi-nua-soi');
  assert.strictEqual(reassignCursedRes.success, false);
  console.log('  ✓ Step 6: Transformed / cursed role reassignment strictly blocked.');

  // 7. Day 2: Knight Duel
  // Create a scenario where a Knight duels the awakened Half-Wolf
  game = game.clone({
    players: game.players.map(p => p.id === 8 ? p.assignRole('ki-si') : p)
  });
  const knightDuelRes = game.knightDuel(8, 3);
  assert.strictEqual(knightDuelRes.success, true);
  assert.strictEqual(knightDuelRes.isWolf, true);
  assert.strictEqual(knightDuelRes.game.getPlayer(3).isAlive, false); // Half-wolf killed by Knight!
  assert.strictEqual(knightDuelRes.game.getPlayer(8).isAlive, true);
  assert.strictEqual(knightDuelRes.game.getPlayer(8).hasUsedKnightDuel, true);
  game = knightDuelRes.game;
  console.log('  ✓ Step 7: Knight successfully executed the awakened Half-Wolf.');

  // 8. Day 3: Villagers lynch the last remaining wolf (Alpha Wolf #1)
  const finalLynch = game.lynchPlayer(1);
  game = finalLynch.game;
  assert.strictEqual(game.getPlayer(1).isAlive, false);

  // Win condition check: All wolves eliminated -> Villagers Win!
  const winStatus = game.checkWinCondition();
  assert.strictEqual(winStatus.isEnded, true);
  assert.strictEqual(winStatus.winner, 'Villagers');
  console.log('  ✓ Step 8: Final wolf lynched. Villagers Win condition verified!');

  console.log('🎉 [E2E] Full Match Simulation Passed 100% with Zero Errors!\n');
});
