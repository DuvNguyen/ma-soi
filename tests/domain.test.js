import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ROLES } from '../src/data/roles.js';
import { Player } from '../src/domain/models/Player.js';
import { getRoleStrategy } from '../src/domain/strategies/RoleStrategies.js';
import { getRoleCapacity } from '../src/utils/deckUtils.js';
import { checkGameEnd, resolveNightPhase } from '../src/utils/gameLogic.js';
import { matchesSearch, removeVietnameseTones, FACTION_TYPES, getPlayerFactionType, getPlayerFaction, isHostileThirdParty, isNeutralObjective } from '../src/utils/roleUtils.js';

console.log('🧪 Starting Phase 1 Domain Model & Strategy Tests...\n');

// 1. Basic Player Creation & Serialization
{
  const p1 = new Player({ id: 1, name: 'Quốc Bảo', currentRoleId: 'tien-tri' });
  assert.strictEqual(p1.id, 1);
  assert.strictEqual(p1.name, 'Quốc Bảo');
  assert.strictEqual(p1.currentRoleId, 'tien-tri');
  assert.strictEqual(p1.isAlive, true);
  assert.strictEqual(p1.isWolf(), false);

  const json = p1.toJSON();
  const restored = Player.fromJSON(json);
  assert.strictEqual(restored.id, p1.id);
  assert.strictEqual(restored.name, p1.name);
  assert.strictEqual(restored.currentRoleId, p1.currentRoleId);
  assert.strictEqual(restored.isAlive, true);
  console.log('✅ Test 1: Player Creation & JSON Roundtrip passed.');
}

// 2. Werewolf Detection
{
  const wolf = new Player({ id: 2, name: 'Văn Sói', currentRoleId: 'soi-thuong' });
  assert.strictEqual(wolf.isWolf(), true);

  const bigWolf = new Player({ id: 3, name: 'Sói Lớn', currentRoleId: 'soi-lon-xau-xa' });
  assert.strictEqual(bigWolf.isWolf(), true);

  const villager = new Player({ id: 4, name: 'Dân', currentRoleId: 'dan-lang' });
  assert.strictEqual(villager.isWolf(), false);
  console.log('✅ Test 2: Werewolf Detection passed.');
}

// 3. Half-Wolf (Bán Sói) Behaviors
{
  const halfWolf = new Player({ id: 5, name: 'Thanh Hà', currentRoleId: 'nua-nguoi-nua-soi' });
  assert.strictEqual(halfWolf.isWolf(), false);

  // A. Seer inspection when NOT targeted by wolves
  assert.strictEqual(halfWolf.getSeerAffiliation({ wolfTargetId: 99 }), 'VILLAGER');

  // B. Seer inspection when BITTEN tonight (wolves act before seer)
  assert.strictEqual(halfWolf.getSeerAffiliation({ wolfTargetId: 5 }), 'WOLF');
  assert.strictEqual(halfWolf.getSeerAffiliation({ isTargetedByWolves: (id) => id === 5 }), 'WOLF');

  // C. Receiving Wolf Bite
  const biteResult = halfWolf.receiveWolfBite({ roundNumber: 1 });
  assert.strictEqual(biteResult.died, false);
  assert.strictEqual(biteResult.transformedTo, 'soi-thuong');
  assert.strictEqual(biteResult.isCursedWolf, true);

  // D. Awakening Half-Wolf
  const awakened = halfWolf.awakenHalfWolf(1);
  assert.strictEqual(awakened.isWolf(), true);
  assert.strictEqual(awakened.currentRoleId, 'soi-thuong');
  assert.strictEqual(awakened.originalRoleId, 'nua-nguoi-nua-soi');
  assert.strictEqual(awakened.getSeerAffiliation(), 'WOLF');
  console.log('✅ Test 3: Half-Wolf (Bán Sói) Seer & Awakening passed.');
}

// 4. Elder (Già Làng) 2-Lives Mechanics
{
  const elder = new Player({ id: 6, name: 'Cụ Già', currentRoleId: 'gia-lang', elderLives: 2 });
  
  // First bite: survives with 1 remaining life
  const bite1 = elder.receiveWolfBite({ roundNumber: 1 });
  assert.strictEqual(bite1.died, false);
  assert.strictEqual(bite1.remainingLives, 1);

  // Second bite: dies
  const elderInjured = elder.clone({ elderLives: 1 });
  const bite2 = elderInjured.receiveWolfBite({ roundNumber: 2 });
  assert.strictEqual(bite2.died, true);
  console.log('✅ Test 4: Elder (Già Làng) 2-Lives Mechanics passed.');
}

// 5. Cursed Wolf Infection & Role Elimination
{
  const seer = new Player({ id: 7, name: 'Tiên Tri Thảo', currentRoleId: 'tien-tri' });
  assert.strictEqual(seer.canBeReassigned(), true);

  // Seer gets infected by Cursed Wolf
  const cursedSeer = seer.infectByCursedWolf(1);
  assert.strictEqual(cursedSeer.isWolf(), true);
  assert.strictEqual(cursedSeer.isCursedWolf, true);
  assert.strictEqual(cursedSeer.originalRoleId, 'tien-tri');
  assert.strictEqual(cursedSeer.currentRoleId, 'soi-bi-nguyen');
  assert.strictEqual(cursedSeer.getRole().name, 'Sói (Tiên Tri bị nguyền)');
  assert.strictEqual(cursedSeer.getSeerAffiliation(), 'WOLF');

  // Strict Rule: Cursed role CANNOT be reassigned to someone else
  assert.strictEqual(cursedSeer.canBeReassigned(), false);
  console.log('✅ Test 5: Cursed Wolf Infection & Reassignment Block passed.');
}

// 6. Dead Role Reassignment Block
{
  const guard = new Player({ id: 8, name: 'Bảo Vệ Minh', currentRoleId: 'bao-ve' });
  assert.strictEqual(guard.canBeReassigned(), true);

  const deadGuard = guard.kill('Bị Ma Sói cắn chết trong đêm', 'Đêm 1');
  assert.strictEqual(deadGuard.isAlive, false);
  // Strict Rule: Dead player's role CANNOT be reassigned
  assert.strictEqual(deadGuard.canBeReassigned(), false);
  console.log('✅ Test 6: Dead Role Reassignment Block passed.');
}

// 7. Thằng Ngốc (Idiot) Pardon
{
  const idiot = new Player({ id: 9, name: 'Ngốc', currentRoleId: 'thang-ngoc' });
  const strategy = getRoleStrategy('thang-ngoc');
  
  // First lynch: survived
  const lynch1 = strategy.onLynched(idiot);
  assert.strictEqual(lynch1.survived, true);
  assert.strictEqual(lynch1.isRevealedIdiot, true);

  // Second lynch: dead
  const revealedIdiot = idiot.clone({ isRevealedIdiot: true });
  const lynch2 = strategy.onLynched(revealedIdiot);
  assert.strictEqual(lynch2.survived, false);
  console.log('✅ Test 7: Idiot (Thằng Ngốc) Pardon passed.');
}

// 8. WerewolfGame Engine & State Machine
{
  import('../src/domain/models/WerewolfGame.js').then(({ WerewolfGame }) => {
    const game = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [
        { id: 1, name: 'Sói 1', currentRoleId: 'soi-thuong', isAlive: true },
        { id: 2, name: 'Bán Sói', currentRoleId: 'nua-nguoi-nua-soi', isAlive: true },
        { id: 3, name: 'Dân', currentRoleId: 'dan-lang', isAlive: true },
        { id: 4, name: 'Tiên Tri', currentRoleId: 'tien-tri', isAlive: true }
      ]
    });

    assert.strictEqual(game.getWolves().length, 1);
    assert.strictEqual(game.canRoleBeReassigned('tien-tri'), true);

    // Resolve night: Wolves bite Half-wolf (#2)
    const nightResult = game.resolveNight({ wolfTargetId: 2 });
    const dayGame = nightResult.game;
    assert.strictEqual(dayGame.isNight, false);
    assert.strictEqual(dayGame.activeTab, 'day');
    // Half-wolf should awaken, not die
    const halfWolfAfter = dayGame.getPlayer(2);
    assert.strictEqual(halfWolfAfter.isAlive, true);
    assert.strictEqual(halfWolfAfter.isWolf(), true);
    assert.strictEqual(halfWolfAfter.currentRoleId, 'soi-thuong');
    assert.strictEqual(halfWolfAfter.originalRoleId, 'nua-nguoi-nua-soi');
    assert.strictEqual(dayGame.canRoleBeReassigned('nua-nguoi-nua-soi'), false);
    assert.strictEqual(dayGame.isRoleEliminated('nua-nguoi-nua-soi'), true);
    assert.strictEqual(dayGame.getWolves().length, 2);
    console.log('✅ Test 8: WerewolfGame Resolve Night & Half-wolf Awakening passed.');

    // Lynch player #3
    const lynchResult = dayGame.lynchPlayer(3);
    const postLynchGame = lynchResult.game;
    assert.strictEqual(postLynchGame.getPlayer(3).isAlive, false);
    // Win condition: Wolves (2) >= Villagers (1) -> Wolves win
    const win = postLynchGame.checkWinCondition();
    assert.strictEqual(win.isEnded, true);
    assert.strictEqual(win.winner, 'Werewolves');
    console.log('✅ Test 9: WerewolfGame Day Lynch & Win Condition passed.');

    // JSON roundtrip of complete game
    const gameJson = postLynchGame.toJSON();
    const restoredGame = WerewolfGame.fromJSON(gameJson);
    assert.strictEqual(restoredGame.roundNumber, postLynchGame.roundNumber);
    assert.strictEqual(restoredGame.players.length, 4);
    assert.strictEqual(restoredGame.getPlayer(2).isWolf(), true);
    console.log('✅ Test 10: WerewolfGame JSON Roundtrip passed.');

    // Test 11: Knight Duel against wolf
    const knightGame = new WerewolfGame({
      roundNumber: 2,
      isNight: false,
      players: [
        new Player({ id: 1, name: 'Knight', currentRoleId: 'ki-si', roleId: 'ki-si' }),
        new Player({ id: 2, name: 'Wolf', currentRoleId: 'soi-thuong', roleId: 'soi-thuong' }),
        new Player({ id: 3, name: 'Villager', currentRoleId: 'dan-lang', roleId: 'dan-lang' })
      ]
    });
    const duelRes = knightGame.knightDuel(1, 2);
    assert.strictEqual(duelRes.success, true);
    assert.strictEqual(duelRes.isWolf, true);
    assert.strictEqual(duelRes.game.getPlayer(2).isAlive, false);
    assert.strictEqual(duelRes.game.getPlayer(1).isAlive, true);
    assert.strictEqual(duelRes.game.getPlayer(1).hasUsedKnightDuel, true);
    console.log('✅ Test 11: Knight Duel against wolf passed.');

    // Test 12: Undo Lynch
    const lynchToUndo = knightGame.lynchPlayer(3);
    assert.strictEqual(lynchToUndo.game.getPlayer(3).isAlive, false);
    const undoneGame = lynchToUndo.game.undoLynch(3);
    assert.strictEqual(undoneGame.getPlayer(3).isAlive, true);
    assert.strictEqual(undoneGame.lynchedTodayPlayerId, null);
    console.log('✅ Test 12: Undo Lynch restores player passed.');

    // Test 13: Assigning Cupid on Night 1 with unassigned players does NOT trigger Villagers win
    const setupGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [
        new Player({ id: 1, name: 'P1', currentRoleId: 'cupid', roleId: 'cupid' }),
        new Player({ id: 2, name: 'P2' }),
        new Player({ id: 3, name: 'P3' }),
        new Player({ id: 4, name: 'P4' })
      ]
    });
    const setupWinCheck = setupGame.checkWinCondition();
    assert.strictEqual(setupWinCheck.isEnded, false, 'Game should NOT end when only Cupid is assigned and totalWolves === 0');
    console.log('✅ Test 13: Night 1 Cupid assignment does not trigger false Villagers win.');

    // Test 14: Elder lynch triggers Village Curse -> Bodyguard protection fails, Witch poison fails, Hunter cannot shoot
    const cursedGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [
        new Player({ id: 1, name: 'Sói', currentRoleId: 'soi-thuong', roleId: 'soi-thuong' }),
        new Player({ id: 2, name: 'Già Làng', currentRoleId: 'gia-lang', roleId: 'gia-lang', elderLives: 2 }),
        new Player({ id: 3, name: 'Bảo Vệ', currentRoleId: 'bao-ve', roleId: 'bao-ve' }),
        new Player({ id: 4, name: 'Phù Thủy', currentRoleId: 'phu-thuy', roleId: 'phu-thuy' }),
        new Player({ id: 5, name: 'Thợ Săn', currentRoleId: 'tho-san', roleId: 'tho-san' }),
        new Player({ id: 6, name: 'Dân', currentRoleId: 'dan-lang', roleId: 'dan-lang' })
      ]
    });

    // 1. Lynch Elder -> triggers Village Curse
    const lynchRes = cursedGame.lynchPlayer(2);
    assert.strictEqual(lynchRes.elderCurseTriggered, true, 'Elder curse should trigger');
    assert.strictEqual(lynchRes.game.isVillageCursed, true, 'Village should be cursed');

    // 2. Night resolution under Village Curse:
    // Wolves target Dân (#6). Bảo Vệ tries to protect #6. Witch tries to poison Sói (#1).
    const nightRes = lynchRes.game.resolveNight({
      wolfTargetId: 6,
      protectedPlayerId: 6, // Bodyguard tries to protect
      witchPoisonTargetId: 1 // Witch tries to poison wolf
    });

    // Bodyguard protection should FAIL under Village Curse -> Player 6 dies
    const deadDan = nightRes.game.getPlayer(6);
    assert.strictEqual(deadDan.isAlive, false, 'Protection must fail under Elder Curse');

    // Witch poison should FAIL under Village Curse -> Wolf (#1) survives
    const aliveWolf = nightRes.game.getPlayer(1);
    assert.strictEqual(aliveWolf.isAlive, true, 'Witch poison must fail under Elder Curse');

    // 3. Hunter dies under Village Curse -> Hunter cannot shoot
    const hunterLynch = nightRes.game.lynchPlayer(5);
    assert.strictEqual(hunterLynch.hunterTrigger, null, 'Hunter cannot shoot when village is cursed');
    console.log('✅ Test 14: Elder lynch triggers Village Curse -> Powers sealed (Protection fails, Witch poison fails, Hunter trigger blocked).');

    // Test 15: Hunter dies from lover death -> triggers hunterTrigger
    const loverGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [
        new Player({ id: 1, name: 'Bảo Ngọc (Hunter)', currentRoleId: 'tho-san', roleId: 'tho-san', loverId: 2 }),
        new Player({ id: 2, name: 'Anh Quân (Villager)', currentRoleId: 'dan-lang', roleId: 'dan-lang', loverId: 1 }),
        new Player({ id: 3, name: 'Minh Hùng (Wolf)', currentRoleId: 'soi-thuong', roleId: 'soi-thuong' })
      ]
    });
    const loverLynch = loverGame.lynchPlayer(2); // Lynch Villager
    assert.strictEqual(loverLynch.target.id, 2);
    assert.strictEqual(loverLynch.loverPartnerDied?.id, 1, 'Hunter partner should die of heartbreak');
    assert.strictEqual(loverLynch.hunterTrigger?.id, 1, 'Hunter must trigger dying shot even when dying from heartbreak');
    console.log('✅ Test 15: Hunter dying from lover heartbreak triggers hunter shot passed.');

    // Test 16: Undo Lynch restores full chain: Lynched lover + Hunter lover + Hunter shot victim
    const chainGame = loverLynch.game;
    // Simulate Hunter shot killed Wolf (#3)
    const afterHunterShotGame = chainGame.clone({
      players: chainGame.players.map(p => {
        if (p.id === 3) {
          return p.clone({ isAlive: false, deathReason: 'Bị Thợ Săn nổ súng bắn chết', deathPhase: 'Ngày 1' });
        }
        return p;
      })
    });
    assert.strictEqual(afterHunterShotGame.getPlayer(1).isAlive, false);
    assert.strictEqual(afterHunterShotGame.getPlayer(2).isAlive, false);
    assert.strictEqual(afterHunterShotGame.getPlayer(3).isAlive, false);

    const undoneChain = afterHunterShotGame.undoLynch(2);
    assert.strictEqual(undoneChain.getPlayer(2).isAlive, true, 'Lynched lover resurrected');
    assert.strictEqual(undoneChain.getPlayer(1).isAlive, true, 'Heartbroken hunter resurrected');
    assert.strictEqual(undoneChain.getPlayer(3).isAlive, true, 'Hunter victim resurrected');
    console.log('✅ Test 16: Undo lynch restores full chain of lover and hunter casualties.');

    // Test 17: Big Bad Wolf (Sói Lớn Xấu Xa) extra bite and protection
    const bbwGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [
        new Player({ id: 1, name: 'Sói Lớn', currentRoleId: 'soi-lon-xau-xa', roleId: 'soi-lon-xau-xa' }),
        new Player({ id: 2, name: 'Sói Thường', currentRoleId: 'soi-thuong', roleId: 'soi-thuong' }),
        new Player({ id: 3, name: 'Dân 1', currentRoleId: 'dan-lang', roleId: 'dan-lang' }),
        new Player({ id: 4, name: 'Dân 2', currentRoleId: 'dan-lang', roleId: 'dan-lang' }),
        new Player({ id: 5, name: 'Bảo Vệ', currentRoleId: 'bao-ve', roleId: 'bao-ve' })
      ]
    });
    // Night 1: Pack targets P3, Big Bad Wolf targets P4. Bodyguard protects P4.
    const bbwRes1 = bbwGame.resolveNight({
      wolfTargetId: 3,
      bigBadWolfTargetId: 4,
      protectedPlayerId: 4
    });
    assert.strictEqual(bbwRes1.game.getPlayer(3).isAlive, false, 'Dân 1 killed by wolf pack');
    assert.strictEqual(bbwRes1.game.getPlayer(4).isAlive, true, 'Dân 2 protected by Bodyguard against Big Bad Wolf');

    // Without protection, Big Bad Wolf kills target
    const bbwRes2 = bbwGame.resolveNight({
      wolfTargetId: 3,
      bigBadWolfTargetId: 4,
      protectedPlayerId: null
    });
    assert.strictEqual(bbwRes2.game.getPlayer(3).isAlive, false);
    assert.strictEqual(bbwRes2.game.getPlayer(4).isAlive, false, 'Dân 2 killed by Big Bad Wolf extra bite');

    // When another werewolf dies, Big Bad Wolf loses extra bite power
    const bbwGameWithDeadWolf = bbwGame.clone({
      players: [
        bbwGame.getPlayer(1), // Big Bad Wolf (alive)
        bbwGame.getPlayer(2).clone({ isAlive: false, deathReason: 'Treo cổ' }), // Sói Thường (dead)
        bbwGame.getPlayer(3),
        bbwGame.getPlayer(4),
        bbwGame.getPlayer(5)
      ]
    });
    const bbwResWithDeadWolf = bbwGameWithDeadWolf.resolveNight({
      wolfTargetId: 3,
      bigBadWolfTargetId: 4,
      protectedPlayerId: null
    });
    assert.strictEqual(bbwResWithDeadWolf.game.getPlayer(3).isAlive, false, 'Pack victim killed');
    assert.strictEqual(bbwResWithDeadWolf.game.getPlayer(4).isAlive, true, 'Big Bad Wolf cannot kill when another wolf is dead');
    console.log('✅ Test 17: Big Bad Wolf extra bite, protection, and power loss upon wolf casualty verified.');

    // Test 18: Assigning functional role to player previously infected by Cursed Wolf
    const unassignedPlayer = new Player({ id: 12, name: 'Duyên', currentRoleId: null, roleId: null });
    // Duyên gets infected by Cursed Wolf during Night 1
    const infectedDuyen = unassignedPlayer.infectByCursedWolf(1);
    assert.strictEqual(infectedDuyen.isWolf(), true);
    assert.strictEqual(infectedDuyen.isCursedWolf, true);
    assert.strictEqual(infectedDuyen.currentRoleId, 'soi-bi-nguyen');
    assert.strictEqual(infectedDuyen.getRole().name, 'Sói Bị Nguyền');

    // Later in Night 1, Game Master wakes Seer and assigns 'tien-tri' to Duyên
    const seerDuyen = infectedDuyen.assignRole('tien-tri');
    assert.strictEqual(seerDuyen.originalRoleId, 'tien-tri', 'Original role set to Seer');
    assert.strictEqual(seerDuyen.currentRoleId, 'soi-bi-nguyen', 'Still a werewolf');
    assert.strictEqual(seerDuyen.isCursedWolf, true, 'Maintains cursed wolf status');
    assert.strictEqual(seerDuyen.isWolf(), true, 'Affiliated with wolf team');
    assert.strictEqual(seerDuyen.getRole().name, 'Sói (Tiên Tri bị nguyền)');

    // In WerewolfGame, Seer role is now eliminated from village and cannot be given to someone else
    const gameWithCursedSeer = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [
        seerDuyen,
        new Player({ id: 13, name: 'Đức', currentRoleId: null, roleId: null })
      ]
    });
    assert.strictEqual(gameWithCursedSeer.isRoleEliminated('tien-tri'), true, 'Seer role is eliminated from village');
    assert.strictEqual(gameWithCursedSeer.canRoleBeReassigned('tien-tri', 13), false, 'Cannot be given to another player');
    console.log('✅ Test 18: Cursed player assigned functional role remains a wolf and seals the role.');

    // Test 19: Hai Chị Em (capacity 2) and Ba Anh Em (capacity 3)
    assert.strictEqual(getRoleCapacity('hai-chi-em', ['hai-chi-em']), 2, 'Hai Chị Em has capacity 2 even with 1 card in deck');
    assert.strictEqual(getRoleCapacity('hai-chi-em', []), 2, 'Hai Chị Em default capacity is 2');
    assert.strictEqual(getRoleCapacity('ba-anh-em', ['ba-anh-em']), 3, 'Ba Anh Em has capacity 3 even with 1 card in deck');
    assert.strictEqual(getRoleCapacity('ba-anh-em', []), 3, 'Ba Anh Em default capacity is 3');
    console.log('✅ Test 19: Hai Chị Em (capacity 2) and Ba Anh Em (capacity 3) multi-capacity verified.');

    // Test 20: Thợ Săn (Hunter) Night 1 Wakeup vs Night 2+ Exclusion
    const testDeck = [
      { id: 'tho-san', name: 'Thợ Săn' },
      { id: 'tien-tri', name: 'Tiên Tri' },
      { id: 'soi-thuong', name: 'Ma Sói' }
    ];
    const filterNightRoles = (roles, round) => roles.filter(r => {
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai', 'cho-soi-soi-lai', 'ba-anh-em', 'nua-nguoi-nua-soi', 'thang-ngoc', 'tho-san'].includes(r.id) && round > 1) {
        return false;
      }
      if (['dan-lang', 'dan-thuong', 'gia-lang'].includes(r.id)) {
        return false;
      }
      return true;
    });

    const night1Roles = filterNightRoles(testDeck, 1);
    assert.strictEqual(night1Roles.some(r => r.id === 'tho-san'), true, 'Hunter is called on Night 1 for identification');

    const night2Roles = filterNightRoles(testDeck, 2);
    assert.strictEqual(night2Roles.some(r => r.id === 'tho-san'), false, 'Hunter sleeps on Night 2 and onwards');
    console.log('✅ Test 20: Hunter (Thợ Săn) Night 1 call vs Night 2+ exclusion verified.');

    // Test 21: Hunter death trigger on retroactive role assignment
    const lynchedPlayer = new Player({ id: 14, name: 'Hùng', isAlive: false, deathReason: 'Dân làng biểu quyết treo cổ' });
    const assignedHunter = lynchedPlayer.assignRole('tho-san');
    assert.strictEqual(assignedHunter.currentRoleId, 'tho-san');
    assert.strictEqual(assignedHunter.isAlive, false);

    // Verify shot activation condition: dead Hunter + not poisoned + village not cursed
    const canShootWhenLynched = !assignedHunter.isAlive && !assignedHunter.deathReason.includes('độc');
    assert.strictEqual(canShootWhenLynched, true, 'Lynched Hunter can fire death shot upon role assignment');

    // If poisoned by witch, hunter cannot shoot
    const poisonedPlayer = new Player({ id: 15, name: 'Bình', isAlive: false, deathReason: 'Phù Thủy hạ độc' });
    const canShootWhenPoisoned = !poisonedPlayer.isAlive && !poisonedPlayer.deathReason.includes('độc');
    assert.strictEqual(canShootWhenPoisoned, false, 'Poisoned Hunter cannot fire death shot');
    console.log('✅ Test 21: Hunter retroactive role assignment & poison check verified.');

    // Test 22: Scapegoat (Người Thế Thân) tie-vote lynch detection & decree serialization
    const scapegoat = new Player({ id: 16, name: 'Khánh', currentRoleId: 'nguoi-the-than', isAlive: true });
    const villagerOther = new Player({ id: 17, name: 'Mai', currentRoleId: 'dan-lang', isAlive: true });
    const wolfOther = new Player({ id: 18, name: 'Tùng', currentRoleId: 'soi-thuong', isAlive: true });

    const scapegoatGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [scapegoat, villagerOther, wolfOther],
      deckRoleIds: ['nguoi-the-than', 'dan-lang', 'soi-thuong']
    });

    const scapegoatLynchRes = scapegoatGame.lynchPlayer(16);
    assert.strictEqual(scapegoatLynchRes.success, true);
    assert.strictEqual(scapegoatLynchRes.isScapegoatLynch, true, 'Lynching Scapegoat must flag isScapegoatLynch');
    assert.strictEqual(scapegoatLynchRes.game.getPlayer(16).isAlive, false);

    // Test Scapegoat decree state persistence in game JSON roundtrip
    const gameWithDecree = scapegoatLynchRes.game.clone({
      scapegoatBannedVoterIds: [17],
      scapegoatBannedRound: 2
    });
    const serialized = gameWithDecree.toJSON();
    assert.deepStrictEqual(serialized.scapegoatBannedVoterIds, [17]);
    assert.strictEqual(serialized.scapegoatBannedRound, 2);

    const deserialized = WerewolfGame.fromJSON(serialized);
    assert.deepStrictEqual(deserialized.scapegoatBannedVoterIds, [17]);
    assert.strictEqual(deserialized.scapegoatBannedRound, 2);
    console.log('✅ Test 22: Scapegoat (Người Thế Thân) tie-vote lynch & decree persistence verified.');

    // Test 23: Knight Duel cascade with Lover, Hunter shot, and Wolf Pup cuồng nộ
    const duelKnight = new Player({ id: 19, name: 'Kị Sĩ', currentRoleId: 'ky-si', roleId: 'ky-si', isAlive: true });
    const duelWolfPup = new Player({ id: 20, name: 'Sói Con', currentRoleId: 'soi-con', roleId: 'soi-con', loverId: 21, isAlive: true });
    const duelLoverHunter = new Player({ id: 21, name: 'Thợ Săn Người Yêu', currentRoleId: 'tho-san', roleId: 'tho-san', loverId: 20, isAlive: true });
    const duelOtherWolf = new Player({ id: 22, name: 'Sói Khác', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const duelGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [duelKnight, duelWolfPup, duelLoverHunter, duelOtherWolf]
    });

    const duelCascadeRes = duelGame.knightDuel(19, 20);
    assert.strictEqual(duelCascadeRes.success, true);
    assert.strictEqual(duelCascadeRes.isWolf, true);
    assert.strictEqual(duelCascadeRes.game.getPlayer(20).isAlive, false, 'Sói Con killed by Knight');
    assert.strictEqual(duelCascadeRes.game.getPlayer(21).isAlive, false, 'Hunter lover died of heartbreak');
    assert.strictEqual(duelCascadeRes.hunterTrigger?.id, 21, 'Heartbroken Hunter triggers death shot');
    assert.strictEqual(duelCascadeRes.wolfCanKillDouble, true, 'Wolf Pup casualty triggers double kill for next night');
    console.log('✅ Test 23: Knight Duel cascade (Lover heartbreak, Hunter trigger, Wolf Pup rage) verified.');

    // Test 24: Shadow night inheritance upon host casualty verified.
    const nightShadowHost = new Player({ id: 23, name: 'Chủ Thể', currentRoleId: 'tien-tri', roleId: 'tien-tri', isAlive: true });
    const nightShadow = new Player({ id: 24, name: 'Ảnh Tử', currentRoleId: 'anh-tu', roleId: 'anh-tu', shadowHostId: 23, isAlive: true });
    const nightWolf = new Player({ id: 25, name: 'Sói', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const shadowNightGame = new WerewolfGame({
      roundNumber: 2,
      isNight: true,
      players: [nightShadowHost, nightShadow, nightWolf]
    });
    const shadowNightRes = shadowNightGame.resolveNight({ wolfTargetId: 23 });
    assert.strictEqual(shadowNightRes.game.getPlayer(23).isAlive, false);
    assert.strictEqual(shadowNightRes.game.getPlayer(24).currentRoleId, 'tien-tri', 'Shadow inherited Seer role from dead host');
    assert.strictEqual(shadowNightRes.transformedShadows.length, 1);
    console.log('✅ Test 24: Shadow night inheritance upon host casualty verified.');

    // Test 25: Wolf Pup rage kill (wolfCanKillDouble) resets to false after rage night finishes
    const rageWolf = new Player({ id: 26, name: 'Sói', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const victimA = new Player({ id: 27, name: 'Nạn Nhân 1', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const victimB = new Player({ id: 28, name: 'Nạn Nhân 2', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const villagerC = new Player({ id: 29, name: 'Dân Làng C', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const rageGame = new WerewolfGame({
      roundNumber: 2,
      isNight: true,
      wolfCanKillDouble: true, // Rage active
      players: [rageWolf, victimA, victimB, villagerC]
    });

    const rageNightRes = rageGame.resolveNight({ wolfTargetId: 27, wolfTargetId2: 28 });
    assert.strictEqual(rageNightRes.game.getPlayer(27).isAlive, false, 'Victim 1 killed');
    assert.strictEqual(rageNightRes.game.getPlayer(28).isAlive, false, 'Victim 2 killed');
    assert.strictEqual(rageNightRes.wolfCanKillDouble, false, 'Rage must reset to false after the night');
    assert.strictEqual(rageNightRes.game.wolfCanKillDouble, false, 'Next game instance must have wolfCanKillDouble = false');
    console.log('✅ Test 25: Wolf Pup rage kill properly consumes after 1 night.');

    // Test 26: Pied Piper (nguoi-thoi-sao) charms players and triggers solo win
    const piper = new Player({ id: 30, name: 'Thổi Sáo', currentRoleId: 'nguoi-thoi-sao', roleId: 'nguoi-thoi-sao', isAlive: true });
    const targetP1 = new Player({ id: 31, name: 'Người A', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true, isHypnotized: true });
    const targetP2 = new Player({ id: 32, name: 'Người B', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const piperGame = new WerewolfGame({
      roundNumber: 2,
      isNight: true,
      players: [piper, targetP1, targetP2]
    });

    const piperNightRes = piperGame.resolveNight({ piperChosenIds: [32] });
    assert.strictEqual(piperNightRes.game.getPlayer(32).isHypnotized, true, 'Player 32 must be hypnotized');
    assert.strictEqual(piperNightRes.gameEndResult?.winner, 'Pied Piper', 'All living non-piper players hypnotized -> Pied Piper wins!');
    console.log('✅ Test 26: Pied Piper hypnosis and win condition verified.');

    // Test 27: Wild Child (dua-tre-hoang-da) transforms when idol is lynched or challenged
    const wildChild = new Player({ id: 33, name: 'Đứa Trẻ', currentRoleId: 'dua-tre-hoang-da', roleId: 'dua-tre-hoang-da', idolId: 34, isAlive: true });
    const idolPlayer = new Player({ id: 34, name: 'Thần Tượng', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const otherVillager = new Player({ id: 35, name: 'Dân Làng Khác', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const wolf36 = new Player({ id: 36, name: 'Sói', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const wildChildGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [wildChild, idolPlayer, otherVillager, wolf36]
    });

    const lynchIdolRes = wildChildGame.lynchPlayer(34);
    assert.strictEqual(lynchIdolRes.game.getPlayer(34).isAlive, false, 'Idol lynched');
    const transformedWc = lynchIdolRes.game.getPlayer(33);
    assert.strictEqual(transformedWc.isWolf(), true, 'Wild Child must become a Werewolf upon idol lynch');
    assert.strictEqual(transformedWc.isCursedWolf, true);
    assert.strictEqual(lynchIdolRes.transformedWildChildren.length, 1);
    console.log('✅ Test 27: Wild Child idol death cascade on lynch verified.');

    // Test 28: Bear Tamer growl when Bear Tamer himself is infected/wolf
    const infectedBearTamer = new Player({ id: 37, name: 'Thuần Thú Gấu', currentRoleId: 'soi-thuong', originalRoleId: 'nguoi-thuan-phuc-gau', isCursedWolf: true, isAlive: true });
    const leftNeighbor = new Player({ id: 38, name: 'Hàng Xóm Trái', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const rightNeighbor = new Player({ id: 39, name: 'Hàng Xóm Phải', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    assert.strictEqual(infectedBearTamer.isWolf(), true, 'Infected Bear Tamer is a wolf');
    const bearHasWolf = infectedBearTamer.isWolf() || leftNeighbor.isWolf() || rightNeighbor.isWolf();
    assert.strictEqual(bearHasWolf, true, 'Bear growls when Bear Tamer himself is a werewolf');
    console.log('✅ Test 28: Infected Bear Tamer growl logic verified.');

    // Test 29: White Werewolf (soi-trang) duel with normal Werewolf does not end game prematurely
    const whiteWolfPlayer = new Player({ id: 40, name: 'Sói Trắng', currentRoleId: 'soi-trang', roleId: 'soi-trang', isAlive: true });
    const normalWolfPlayer = new Player({ id: 41, name: 'Sói Thường', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const deadVillager = new Player({ id: 42, name: 'Dân Chết', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: false });

    const whiteWolfDuelRes = checkGameEnd([whiteWolfPlayer, normalWolfPlayer, deadVillager]);
    assert.strictEqual(whiteWolfDuelRes.isEnded, false, 'Game must not end when White Werewolf is still dueling the last wolf');

    const whiteWolfSoloRes = checkGameEnd([whiteWolfPlayer]);
    assert.strictEqual(whiteWolfSoloRes.isEnded, true);
    assert.strictEqual(whiteWolfSoloRes.winner, 'White Werewolf', 'White Werewolf wins when sole survivor');
    console.log('✅ Test 29: White Werewolf 1v1 duel & solo win verified.');

    // Test 30: All players dying simultaneously triggers Draw / Tie
    const dead1 = new Player({ id: 43, name: 'Người 1', currentRoleId: 'dan-lang', isAlive: false });
    const dead2 = new Player({ id: 44, name: 'Sói 1', currentRoleId: 'soi-thuong', isAlive: false });
    const allDeadRes = checkGameEnd([dead1, dead2]);
    assert.strictEqual(allDeadRes.isEnded, true);
    assert.strictEqual(allDeadRes.winner, 'Draw', 'All dead triggers Draw / Tie');
    console.log('✅ Test 30: Simultaneous total casualty Draw / Tie verified.');

    // Test 31: Cross-faction / 3rd party lovers surviving as final 2 triggers Lovers win
    const villagerLover = new Player({ id: 45, name: 'Dân Tình', currentRoleId: 'dan-lang', loverId: 46, isAlive: true });
    const piperLover = new Player({ id: 46, name: 'Thổi Sáo Tình', currentRoleId: 'nguoi-thoi-sao', loverId: 45, isAlive: true });
    const loversRes = checkGameEnd([villagerLover, piperLover]);
    assert.strictEqual(loversRes.isEnded, true);
    assert.strictEqual(loversRes.winner, 'Lovers', 'Cross-faction lovers with 3rd party win together');
    console.log('✅ Test 31: Cross-faction lovers win condition verified.');

    // Test 32: Two Sisters & Stuttering Judge excluded in Night 2+
    const night2RolesDeck = [
      { id: 'hai-chi-em', name: 'Hai Chị Em' },
      { id: 'tham-phan-lap-bap', name: 'Thẩm Phán Lắp Bắp' },
      { id: 'tien-tri', name: 'Tiên Tri' }
    ];
    const night2Filter = (roles, round) => roles.filter(r => {
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai', 'cho-soi-soi-lai', 'ba-anh-em', 'hai-chi-em', 'tham-phan-lap-bap', 'nua-nguoi-nua-soi', 'thang-ngoc', 'tho-san'].includes(r.id) && round > 1) {
        return false;
      }
      return true;
    });
    assert.strictEqual(night2Filter(night2RolesDeck, 1).length, 3, 'All 3 active in Night 1');
    assert.strictEqual(night2Filter(night2RolesDeck, 2).length, 1, 'Only Seer active in Night 2');
    console.log('✅ Test 32: Two Sisters & Stuttering Judge Night 2+ exclusion verified.');

    // Test 33: Wild Child idol dying during the night returns transformedWildChildren in resolveNight
    const wcNight = new Player({ id: 47, name: 'Đứa Trẻ Đêm', currentRoleId: 'dua-tre-hoang-da', idolId: 48, isAlive: true });
    const idolNight = new Player({ id: 48, name: 'Thần Tượng Đêm', currentRoleId: 'dan-lang', isAlive: true });
    const wolfNight = new Player({ id: 49, name: 'Sói Đêm', currentRoleId: 'soi-thuong', isAlive: true });
    const villagerNight = new Player({ id: 50, name: 'Dân Đêm', currentRoleId: 'dan-lang', isAlive: true });

    const wcNightGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [wcNight, idolNight, wolfNight, villagerNight]
    });
    const wcNightRes = wcNightGame.resolveNight({ wolfTargetId: 48 });
    assert.strictEqual(wcNightRes.transformedWildChildren.length, 1, 'Transformed wild child returned');
    assert.strictEqual(wcNightRes.game.getPlayer(47).isWolf(), true, 'Wild Child is transformed into Werewolf');
    console.log('✅ Test 33: Wild Child night transformation cascade & return verified.');

    // Test 34: Kẻ Đốt Nhà (ke-dot-nha) is Villager faction (teamCode: 'V'), not detected as Wolf
    const pyro = new Player({ id: 51, name: 'Hỏa Hoạn', currentRoleId: 'ke-dot-nha', roleId: 'ke-dot-nha', isAlive: true });
    assert.strictEqual(pyro.isWolf(), false, 'Pyromaniac must not be detected as a Werewolf');
    assert.strictEqual(pyro.getRole()?.teamCode, 'V', 'Pyromaniac belongs to Villagers (The Village)');
    console.log('✅ Test 34: Pyromaniac (ke-dot-nha) faction classification verified.');

    // Test 35: Third Party role (sat-thu) does not award false victory to Villagers when wolves die, and wins when sole survivor
    const assassin = new Player({ id: 52, name: 'Sát Thủ', currentRoleId: 'sat-thu', roleId: 'sat-thu', isAlive: true });
    const singleVillager = new Player({ id: 53, name: 'Dân Sống', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const eliminatedWolf = new Player({ id: 54, name: 'Sói Đã Chết', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: false });

    const assassinVsVillager = checkGameEnd([assassin, singleVillager, eliminatedWolf]);
    assert.strictEqual(assassinVsVillager.isEnded, false, 'Match must continue when 3rd party assassin is still dueling the villager');

    const assassinSoloWin = checkGameEnd([assassin, eliminatedWolf]);
    assert.strictEqual(assassinSoloWin.isEnded, true);
    assert.strictEqual(assassinSoloWin.teamCode, '3');
    console.log('✅ Test 35: Third Party (Sát Thủ) duel & solo victory verified.');

    // Test 36: undoLynch clears isVillageCursed on Elder, clears wolfCanKillDouble on Wolf Pup, and reverts Wild Child
    const elder55 = new Player({ id: 55, name: 'Già Làng 55', currentRoleId: 'gia-lang', roleId: 'gia-lang', isAlive: true });
    const wc56 = new Player({ id: 56, name: 'Đứa Trẻ 56', currentRoleId: 'dua-tre-hoang-da', roleId: 'dua-tre-hoang-da', idolId: 55, isAlive: true });
    const normalWolf57 = new Player({ id: 57, name: 'Sói 57', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const curseUndoGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [elder55, wc56, normalWolf57]
    });
    const lynchedElderGame = curseUndoGame.lynchPlayer(55).game;
    assert.strictEqual(lynchedElderGame.isVillageCursed, true, 'Elder lynch curses village');
    assert.strictEqual(lynchedElderGame.getPlayer(56).isWolf(), true, 'Wild Child transforms on idol lynch');

    const undoneElderGame = lynchedElderGame.undoLynch(55);
    assert.strictEqual(undoneElderGame.isVillageCursed, false, 'Undoing Elder lynch lifts village curse');
    assert.strictEqual(undoneElderGame.getPlayer(55).isAlive, true, 'Elder restored');
    assert.strictEqual(undoneElderGame.getPlayer(56).isWolf(), false, 'Wild Child reverted back to villager');
    console.log('✅ Test 36: undoLynch curse lifting and Wild Child revert verified.');

    // Test 37: anh-em-soi and dien-vien night exclusions
    const customNightDeck = [
      { id: 'anh-em-soi', name: 'Anh Em Sói' },
      { id: 'dien-vien', name: 'Diễn Viên' },
      { id: 'tien-tri', name: 'Tiên Tri' }
    ];
    const customNightFilter = (roles, round) => roles.filter(r => {
      if (['cupid', 'dua-tre-hoang-da', 'anh-tu', 'an-trom', 'ke-bao-thu', 'soi-lai', 'cho-soi-soi-lai', 'ba-anh-em', 'hai-chi-em', 'tham-phan-lap-bap', 'nua-nguoi-nua-soi', 'thang-ngoc', 'tho-san', 'anh-em-soi'].includes(r.id) && round > 1) {
        return false;
      }
      if (r.id === 'dien-vien' && round > 3) {
        return false;
      }
      return true;
    });
    assert.strictEqual(customNightFilter(customNightDeck, 1).length, 3, 'All 3 active in Night 1');
    assert.strictEqual(customNightFilter(customNightDeck, 2).length, 2, 'Diễn Viên & Tiên Tri active in Night 2 (Anh Em Sói asleep)');
    assert.strictEqual(customNightFilter(customNightDeck, 4).length, 1, 'Only Tiên Tri active in Night 4 (Diễn Viên expired)');
    console.log('✅ Test 37: Wolf Brothers & Actor night step duration verified.');

    // Test 38: getRoleCapacity supports anh-em-soi with capacity 2
    assert.strictEqual(getRoleCapacity('anh-em-soi', ['anh-em-soi']), 2, 'anh-em-soi capacity must be at least 2');
    assert.strictEqual(getRoleCapacity('anh-em-soi', ['anh-em-soi', 'anh-em-soi', 'anh-em-soi']), 3, 'anh-em-soi capacity scales if deck has 3');
    console.log('✅ Test 38: anh-em-soi capacity = 2 in getRoleCapacity verified.');

    // Test 39: Wolf variants list in NightPhaseView includes soi-lua and anh-em-soi
    const nightViewContent = fs.readFileSync(path.join(process.cwd(), 'src/components/NightPhaseView.jsx'), 'utf8');
    assert.ok(nightViewContent.includes("'soi-lua'"), 'wolfVariants must include soi-lua');
    assert.ok(nightViewContent.includes("'anh-em-soi'"), 'wolfVariants must include anh-em-soi');
    console.log('✅ Test 39: wolfVariants includes soi-lua & anh-em-soi in NightPhaseView verified.');

    // Test 40: Hypnotist (thay-thoi-mien) scapegoat redirect on wolf bite
    const hypTargetPlayer = new Player({ id: 58, name: 'Dân Bị Thôi Miên', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const hypnotistPlayer = new Player({ id: 59, name: 'Thầy Thôi Miên 59', currentRoleId: 'thay-thoi-mien', roleId: 'thay-thoi-mien', isAlive: true });
    const attackingWolf = new Player({ id: 60, name: 'Sói Đói 60', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const hypGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [hypTargetPlayer, hypnotistPlayer, attackingWolf]
    });

    const hypRes = hypGame.resolveNight({
      wolfTargetId: 59, // Wolves attack Hypnotist!
      hypnotistTargetId: 58 // Hypnotist hypnotized player 58
    });

    assert.strictEqual(hypRes.game.getPlayer(59).isAlive, true, 'Thầy Thôi Miên must survive the wolf bite!');
    assert.strictEqual(hypRes.game.getPlayer(58).isAlive, false, 'Hypnotized target (#58) must die as a scapegoat!');
    assert.ok(hypRes.game.getPlayer(58).deathReason.includes('Thầy Thôi Miên'), 'Death reason mentions scapegoat redirect');
    console.log('✅ Test 40: Hypnotist scapegoat redirection verified.');

    // Test 41: Tarzan / Con Hoang aliases and night transformation with wildChildIdolId
    const tarzanRole = ROLES.find(r => r.id === 'dua-tre-hoang-da');
    assert.ok(tarzanRole.name.includes('Tarzan'), 'Role name contains Tarzan');
    assert.ok(tarzanRole.aliases.includes('Tarzan'), 'Aliases contains Tarzan');
    assert.ok(tarzanRole.aliases.includes('Con Hoang'), 'Aliases contains Con Hoang');

    // Con Hoang player without idolId directly on object, but wildChildIdolId passed in nightActions
    const conHoang = new Player({ id: 61, name: 'Tarzan 61', currentRoleId: 'dua-tre-hoang-da', roleId: 'dua-tre-hoang-da', isAlive: true });
    const mePlayer = new Player({ id: 62, name: 'Mẹ 62', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const killerWolf = new Player({ id: 63, name: 'Sói 63', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const tarzanGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [conHoang, mePlayer, killerWolf],
      nightState: { wildChildIdolId: 62 }
    });

    const tarzanNightRes = tarzanGame.resolveNight({
      wolfTargetId: 62, // Wolves kill Mẹ!
      wildChildIdolId: 62
    });

    assert.strictEqual(tarzanNightRes.game.getPlayer(62).isAlive, false, 'Mẹ must die');
    assert.strictEqual(tarzanNightRes.game.getPlayer(61).isWolf(), true, 'Con Hoang transforms into Werewolf');
    assert.strictEqual(tarzanNightRes.transformedWildChildren.length, 1, 'Transformed Con Hoang recorded in result');
    console.log('✅ Test 41: Tarzan / Con Hoang aliases & Mẹ death transformation verified.');

    // Test 42: Devoted Servant (nguoi-day-to-tan-tuy) inheritance on lynch
    const servantPlayer = new Player({ id: 64, name: 'Đầy Tớ 64', currentRoleId: 'nguoi-day-to-tan-tuy', roleId: 'nguoi-day-to-tan-tuy', isAlive: true });
    const victimWolf = new Player({ id: 65, name: 'Sói Bị Treo Cổ', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const villager66 = new Player({ id: 66, name: 'Dân Làng 66', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const villager67 = new Player({ id: 67, name: 'Dân Làng 67', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    assert.strictEqual(servantPlayer.isWolf(), false, 'Servant initially not a wolf');

    const servantGame = new WerewolfGame({
      roundNumber: 2,
      isNight: false,
      players: [servantPlayer, victimWolf, villager66, villager67]
    });

    // Lynch the wolf
    const lynchWolfRes = servantGame.lynchPlayer(65);
    assert.strictEqual(lynchWolfRes.success, true);
    assert.strictEqual(lynchWolfRes.game.getPlayer(65).isAlive, false, 'Victim wolf is dead');

    // Servant inherits victimWolf's role
    const inheritRes = lynchWolfRes.game.inheritServantRole(64, 'soi-thuong');
    assert.strictEqual(inheritRes.success, true);
    const newServant = inheritRes.game.getPlayer(64);
    assert.strictEqual(newServant.currentRoleId, 'soi-thuong');
    assert.strictEqual(newServant.originalRoleId, 'nguoi-day-to-tan-tuy');
    assert.strictEqual(newServant.isWolf(), true, 'Servant transformed into Werewolf');
    assert.strictEqual(newServant.isCursedWolf, true, 'Servant marked as cursed wolf');
    assert.strictEqual(inheritRes.gameEndResult, null, 'Game did not end because 1 wolf vs 2 villagers');

    // Servant inheriting Elder gets 2 lives
    const elderInheritGame = servantGame.inheritServantRole(64, 'gia-lang');
    assert.strictEqual(elderInheritGame.game.getPlayer(64).elderLives, 2, 'Servant inheriting Elder gets 2 lives');
    console.log('✅ Test 42: Devoted Servant role inheritance on lynch verified.');

    // Test 43: Knight (Kị Sĩ - ki-si) Night 1 wake and duel mechanics
    const knightP = new Player({ id: 70, name: 'Kị Sĩ 70', currentRoleId: 'ki-si', roleId: 'ki-si', isAlive: true });
    const targetWolf = new Player({ id: 71, name: 'Sói 71', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const innocentVillager = new Player({ id: 72, name: 'Dân Làng 72', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const extraVillager = new Player({ id: 73, name: 'Dân Làng 73', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const test43KnightGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [knightP, targetWolf, innocentVillager, extraVillager]
    });

    // Successful duel against wolf
    const duelSuccess = test43KnightGame.knightDuel(70, 71);
    assert.strictEqual(duelSuccess.success, true);
    assert.strictEqual(duelSuccess.isWolf, true);
    assert.strictEqual(duelSuccess.game.getPlayer(71).isAlive, false, 'Target wolf must be killed in duel');
    assert.strictEqual(duelSuccess.game.getPlayer(70).isAlive, true, 'Knight survives successful duel');
    assert.strictEqual(duelSuccess.game.getPlayer(70).hasUsedKnightDuel, true, 'Knight duel consumed');

    // Failed duel against innocent villager kills knight
    const duelFailGame = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [knightP, targetWolf, innocentVillager, extraVillager]
    });
    const duelFail = duelFailGame.knightDuel(70, 72);
    assert.strictEqual(duelFail.success, true);
    assert.strictEqual(duelFail.isWolf, false);
    assert.strictEqual(duelFail.game.getPlayer(72).isAlive, true, 'Innocent villager remains alive');
    assert.strictEqual(duelFail.game.getPlayer(70).isAlive, false, 'Knight dies from mistaken duel');
    assert.strictEqual(duelFail.game.getPlayer(70).hasUsedKnightDuel, true, 'Knight duel consumed');
    console.log('✅ Test 43: Knight duel against Wolf & Villager verified.');

    // Test 44: Vietnamese diacritics-insensitive search (gõ không dấu vẫn tìm ra tiếng Việt)
    assert.strictEqual(removeVietnameseTones('Vĩ'), 'vi');
    assert.strictEqual(removeVietnameseTones('Phú'), 'phu');
    assert.strictEqual(removeVietnameseTones('Như'), 'nhu');
    assert.strictEqual(removeVietnameseTones('Tốt'), 'tot');
    assert.strictEqual(removeVietnameseTones('Đức'), 'duc');
    assert.strictEqual(removeVietnameseTones('Duyên'), 'duyen');

    assert.strictEqual(matchesSearch('Vĩ', 'vi'), true, 'Typing vi matches Vĩ');
    assert.strictEqual(matchesSearch('Phú', 'phu'), true, 'Typing phu matches Phú');
    assert.strictEqual(matchesSearch('Tốt', 'tot'), true, 'Typing tot matches Tốt');
    assert.strictEqual(matchesSearch('Đức Minh', 'duc'), true, 'Typing duc matches Đức Minh');
    assert.strictEqual(matchesSearch('Thợ Săn', 'tho san'), true, 'Typing tho san matches Thợ Săn');
    assert.strictEqual(matchesSearch('Bảo Vệ', 'bao ve'), true, 'Typing bao ve matches Bảo Vệ');
    assert.strictEqual(matchesSearch('Phù Thủy', 'thuy'), true, 'Typing thuy matches Phù Thủy');
    assert.strictEqual(matchesSearch('Ma Sói', 'soi'), true, 'Typing soi matches Ma Sói');
    assert.strictEqual(matchesSearch('Vĩ', 'nam'), false, 'Non-matching query returns false');
    console.log('✅ Test 44: Vietnamese diacritics-insensitive search verified.');

    // Test 45: Role transformation journey tracking across transformations
    // 1. Half-wolf awakening
    const testHalfWolf = new Player({ id: 80, name: 'Bán Sói 80', currentRoleId: 'nua-nguoi-nua-soi', roleId: 'nua-nguoi-nua-soi', isAlive: true });
    assert.strictEqual(testHalfWolf.roleHistory.length, 0);
    const awakened = testHalfWolf.awakenHalfWolf(1);
    assert.strictEqual(awakened.roleHistory.length, 1);
    assert.strictEqual(awakened.roleHistory[0].type, 'HALF_WOLF_AWAKEN');
    assert.strictEqual(awakened.roleHistory[0].fromRole, 'nua-nguoi-nua-soi');
    assert.strictEqual(awakened.roleHistory[0].toRole, 'soi-thuong');

    // 2. Wild child transformation on idol death
    const idolP = new Player({ id: 81, name: 'Mẹ Thần Tượng', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const wildP = new Player({ id: 82, name: 'Con Hoang 82', currentRoleId: 'dua-tre-hoang-da', roleId: 'dua-tre-hoang-da', idolId: 81, isAlive: true });
    const wcGame = new WerewolfGame({ roundNumber: 2, isNight: false, players: [idolP, wildP] });
    const idolLynch = wcGame.lynchPlayer(81);
    const transformedWc45 = idolLynch.game.getPlayer(82);
    assert.strictEqual(transformedWc45.isWolf(), true);
    assert.strictEqual(transformedWc45.roleHistory.length, 1);
    assert.strictEqual(transformedWc45.roleHistory[0].type, 'WILD_CHILD_TRANSFORM');

    // 3. Shadow inheritance on host death
    const hostP = new Player({ id: 83, name: 'Bản Thể', currentRoleId: 'tho-san', roleId: 'tho-san', isAlive: true });
    const shadowP = new Player({ id: 84, name: 'Ảnh Tử 84', currentRoleId: 'anh-tu', roleId: 'anh-tu', shadowHostId: 83, isAlive: true });
    const shadowGame = new WerewolfGame({ roundNumber: 1, isNight: false, players: [hostP, shadowP] });
    const hostLynch = shadowGame.lynchPlayer(83);
    const inheritedShadow = hostLynch.game.getPlayer(84);
    assert.strictEqual(inheritedShadow.currentRoleId, 'tho-san');
    assert.strictEqual(inheritedShadow.roleHistory.length, 1);
    assert.strictEqual(inheritedShadow.roleHistory[0].type, 'SHADOW_INHERIT');

    // 4. Devoted Servant role inheritance
    const servantHistoryGame = new WerewolfGame({ roundNumber: 2, isNight: false, players: [servantPlayer, victimWolf] });
    const lynchWolf2 = servantHistoryGame.lynchPlayer(65);
    const servantInherited = lynchWolf2.game.inheritServantRole(64, 'soi-thuong');
    const trackedServant = servantInherited.game.getPlayer(64);
    assert.strictEqual(trackedServant.roleHistory.length, 1);
    assert.strictEqual(trackedServant.roleHistory[0].type, 'SERVANT_INHERIT');

    // 5. Cursed Wolf infection
    const villagerVictim = new Player({ id: 85, name: 'Nạn Nhân 85', currentRoleId: 'bao-ve', roleId: 'bao-ve', isAlive: true });
    const infectedP = villagerVictim.infectByCursedWolf(2);
    assert.strictEqual(infectedP.roleHistory.length, 1);
    assert.strictEqual(infectedP.roleHistory[0].type, 'CURSED_WOLF_INFECT');
    assert.strictEqual(infectedP.isWolf(), true);

    console.log('✅ Test 45: Role transformation journey tracking across transformations verified.');

    // --- TEST 46: Sát Thủ (Assassin) mechanics & protection ---
    const assassin46 = new Player({ id: 91, name: 'Sát Thủ 91', currentRoleId: 'sat-thu', roleId: 'sat-thu', isAlive: true });
    const targetA46 = new Player({ id: 92, name: 'Dân 92', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const targetB46 = new Player({ id: 93, name: 'Dân 93 (Được bảo vệ)', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const bodyguard46 = new Player({ id: 94, name: 'Bảo Vệ 94', currentRoleId: 'bao-ve', roleId: 'bao-ve', isAlive: true });

    const assassinGame = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [assassin46, targetA46, targetB46, bodyguard46]
    });

    // Case 1: Kill unprotected targetA
    const resA = assassinGame.resolveNight({ assassinTargetId: 92 });
    assert.strictEqual(resA.game.getPlayer(92).isAlive, false);

    // Case 2: TargetB protected by Bodyguard
    const resB = assassinGame.resolveNight({ assassinTargetId: 93, protectedPlayerId: 93 });
    assert.strictEqual(resB.game.getPlayer(93).isAlive, true);
    console.log('✅ Test 46: Sát Thủ assassination kill & protection shield verified.');

    // --- TEST 47: Kẻ Đốt Nhà (Pyromaniac) counter-burn on wolves & victim salvation ---
    const pyro47 = new Player({ id: 101, name: 'Kẻ Đốt Nhà 101', currentRoleId: 'ke-dot-nha', roleId: 'ke-dot-nha', isAlive: true });
    const houseVictim47 = new Player({ id: 102, name: 'Dân 102', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const wolfRight47 = new Player({ id: 103, name: 'Sói Bên Phải 103', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const pyroGame47 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [pyro47, houseVictim47, wolfRight47]
    });

    const resPyro47 = pyroGame47.resolveNight({
      wolfTargetId: 102, // Sói chọn cắn nhà 102
      pyroTargetId: 102  // Kẻ Đốt Nhà tẩm dầu phóng hỏa nhà 102
    });

    // Con Sói bên phải (103) bị ngọn lửa thiêu chết
    assert.strictEqual(resPyro47.game.getPlayer(103).isAlive, false);
    // Nạn nhân (102) được ngọn lửa cứu thoát chết
    assert.strictEqual(resPyro47.game.getPlayer(102).isAlive, true);
    console.log('✅ Test 47: Kẻ Đốt Nhà counter-burn on wolf to the right & victim salvation verified.');

    // --- TEST 48: Dược Sĩ (Apothecary) poison cure & sleep potion ---
    const witchP48 = new Player({ id: 111, name: 'Phù Thủy 111', currentRoleId: 'phu-thuy', roleId: 'phu-thuy', isAlive: true });
    const poisonedVillager48 = new Player({ id: 112, name: 'Dân 112', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const sleepTarget48 = new Player({ id: 113, name: 'Dân 113', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const apothecaryGame48 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [witchP48, poisonedVillager48, sleepTarget48]
    });

    const resApothecary48 = apothecaryGame48.resolveNight({
      witchPoisonTargetId: 112,
      apothecaryCurePoison: true,
      apothecarySleepTargetId: 113
    });

    // Poisoned villager is cured and lives!
    assert.strictEqual(resApothecary48.game.getPlayer(112).isAlive, true);
    // Sleep target receives isAsleepByApothecary = true
    assert.strictEqual(resApothecary48.game.getPlayer(113).isAsleepByApothecary, true);
    console.log('✅ Test 48: Dược Sĩ poison cure & sleep potion verified.');

    // --- TEST 49: Người Múa Rối (Puppeteer) wolf redirection ---
    const puppetWolf49 = new Player({ id: 121, name: 'Sói 121', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const puppetTarget1_49 = new Player({ id: 122, name: 'Dân 122', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const puppetTarget2_49 = new Player({ id: 123, name: 'Dân 123', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const puppeteerGame49 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [puppetWolf49, puppetTarget1_49, puppetTarget2_49]
    });

    // Wolves intended to bite 122, but Puppeteer redirected to bite 123
    const resPuppet49 = puppeteerGame49.resolveNight({
      wolfTargetId: 122,
      puppeteerTargetId: 123
    });

    assert.strictEqual(resPuppet49.game.getPlayer(122).isAlive, true);
    assert.strictEqual(resPuppet49.game.getPlayer(123).isAlive, false);
    console.log('✅ Test 49: Người Múa Rối wolf bite target override verified.');

    // --- TEST 50: Thành Viên Giáo Phái (Cult Leader) solo victory condition ---
    const cultLeader50 = new Player({ id: 131, name: 'Giáo Chủ 131', currentRoleId: 'thanh-vien-giao-phai', roleId: 'thanh-vien-giao-phai', isAlive: true, cultGroup: 'A' });
    const cultFollower50 = new Player({ id: 132, name: 'Tín Đồ 132', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true, cultGroup: 'A' });
    const rivalGroupDead50 = new Player({ id: 133, name: 'Kình Địch 133', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: false, cultGroup: 'B' });

    const cultGame50 = new WerewolfGame({
      roundNumber: 2,
      isNight: false,
      players: [cultLeader50, cultFollower50, rivalGroupDead50]
    });

    const cultEnd50 = cultGame50.checkWinCondition();
    assert.strictEqual(cultEnd50.isEnded, true);
    assert.strictEqual(cultEnd50.winner, 'Cult Leader');
    console.log('✅ Test 50: Thành Viên Giáo Phái solo victory condition verified.');

    // --- TEST 51: Wolf Brothers (Anh Em Sói) Seer camouflage & Sói Anh death rage ---
    const bigBrother51 = new Player({ id: 141, name: 'Sói Anh', currentRoleId: 'anh-em-soi', roleId: 'anh-em-soi', isLittleBrother: false, isAlive: true });
    const littleBrother51 = new Player({ id: 142, name: 'Sói Em', currentRoleId: 'anh-em-soi', roleId: 'anh-em-soi', isLittleBrother: true, isAlive: true });
    const seer51 = new Player({ id: 143, name: 'Tiên Tri', currentRoleId: 'tien-tri', roleId: 'tien-tri', isAlive: true });

    // Khi Sói Anh còn sống, Sói Em được Tiên Tri nhìn thấy là Dân Làng (VILLAGER)
    assert.strictEqual(littleBrother51.getSeerAffiliation({ players: [bigBrother51, littleBrother51, seer51] }), 'VILLAGER');
    // Sói Anh luôn hiện là Ma Sói (WOLF)
    assert.strictEqual(bigBrother51.getSeerAffiliation({ players: [bigBrother51, littleBrother51, seer51] }), 'WOLF');

    // Khi Sói Anh chết trên giàn treo cổ, Sói Em lộ diện là Sói và bầy Sói được cuồng nộ cắn 2 người
    const wbGame51 = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [bigBrother51, littleBrother51, seer51]
    });
    const lynchBigBroRes51 = wbGame51.lynchPlayer(141);
    assert.strictEqual(lynchBigBroRes51.wolfCanKillDouble, true);
    const updatedLittleBro51 = lynchBigBroRes51.game.getPlayer(142);
    assert.strictEqual(updatedLittleBro51.getSeerAffiliation({ players: lynchBigBroRes51.game.players }), 'WOLF');
    console.log('✅ Test 51: Wolf Brothers Seer camouflage & Sói Anh death rage verified.');

    // --- TEST 52: Kẻ Báo Thù (Avenger) retaliation against opposite faction & cascade ---
    const avenger52 = new Player({ id: 151, name: 'Báo Thù', currentRoleId: 'ke-bao-thu', roleId: 'ke-bao-thu', isAlive: true, avengerFaction: 'V' });
    const wolf52 = new Player({ id: 152, name: 'Sói Độc', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const villager52 = new Player({ id: 153, name: 'Dân Chăm', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const avengerGame52 = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [avenger52, wolf52, villager52]
    });

    // Avenger lynch triggers avengerTrigger
    const lynchAvengerRes52 = avengerGame52.lynchPlayer(151);
    assert.ok(lynchAvengerRes52.avengerTrigger);
    assert.strictEqual(lynchAvengerRes52.avengerTrigger.id, 151);

    // Retaliate against same faction (Villager 153): Harmless (isOpposite = false)
    const harmlessRetRes = lynchAvengerRes52.game.avengerRetaliate(151, 153);
    assert.strictEqual(harmlessRetRes.isOpposite, false);
    assert.strictEqual(harmlessRetRes.game.getPlayer(153).isAlive, true);

    // Retaliate against opposite faction (Wolf 152): Lethal (isOpposite = true)
    const lethalRetRes = lynchAvengerRes52.game.avengerRetaliate(151, 152);
    assert.strictEqual(lethalRetRes.isOpposite, true);
    assert.strictEqual(lethalRetRes.game.getPlayer(152).isAlive, false);
    console.log('✅ Test 52: Kẻ Báo Thù retaliation against opposite faction & safety for same faction verified.');

    // --- TEST 53: Sói Lửa (Fire Werewolf) power burning ---
    const fireWolf53 = new Player({ id: 161, name: 'Sói Lửa', currentRoleId: 'soi-lua', roleId: 'soi-lua', isAlive: true });
    const seer53 = new Player({ id: 162, name: 'Tiên Tri 162', currentRoleId: 'tien-tri', roleId: 'tien-tri', isAlive: true });

    const fireGame53 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [fireWolf53, seer53]
    });

    const fireRes53 = fireGame53.resolveNight({
      fireWolfTargetId: 162
    });

    assert.strictEqual(fireRes53.game.getPlayer(162).isPowerBurned, true);
    console.log('✅ Test 53: Sói Lửa power burning verified.');

    // --- TEST 54: Cô Bé (Little Girl) caught peeking elimination ---
    const littleGirl54 = new Player({ id: 171, name: 'Cô Bé 171', currentRoleId: 'co-be', roleId: 'co-be', isAlive: true });
    const wolf54 = new Player({ id: 172, name: 'Sói 172', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const littleGirlGame54 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [littleGirl54, wolf54]
    });

    const littleGirlRes54 = littleGirlGame54.resolveNight({
      littleGirlCaughtId: 171
    });

    assert.strictEqual(littleGirlRes54.game.getPlayer(171).isAlive, false);
    assert.strictEqual(littleGirlRes54.game.getPlayer(171).deathReason, 'Bị bầy Ma Sói bắt quả tang khi đang hé mắt nhìn trộm trong đêm');
    console.log('✅ Test 54: Cô Bé caught peeking elimination verified.');

    // --- TEST 55: Undo Lynch restoration for Avenger retaliation chain ---
    const avenger55 = new Player({ id: 181, name: 'Báo Thù 55', currentRoleId: 'ke-bao-thu', roleId: 'ke-bao-thu', isAlive: true, avengerFaction: 'V' });
    const wolf55 = new Player({ id: 182, name: 'Sói 182', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const villager55 = new Player({ id: 183, name: 'Dân 183', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const game55 = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [avenger55, wolf55, villager55]
    });

    const lynchRes55 = game55.lynchPlayer(181);
    const retRes55 = lynchRes55.game.avengerRetaliate(181, 182);
    assert.strictEqual(retRes55.game.getPlayer(182).isAlive, false);

    // Hoàn tác vụ treo cổ: Kẻ Báo Thù và cả nạn nhân bị trả thù (Sói 182) đều được sống lại
    const restoredGame55 = retRes55.game.undoLynch(181);
    assert.strictEqual(restoredGame55.getPlayer(181).isAlive, true);
    assert.strictEqual(restoredGame55.getPlayer(182).isAlive, true);
    console.log('✅ Test 55: Undo Lynch restoration for Avenger retaliation chain verified.');

    // --- TEST 56: Fox (Cáo) UI cases & "gọi cho có" in subsequent nights ---
    const nightViewSource = fs.readFileSync('src/components/NightPhaseView.jsx', 'utf8');
    const nightSpecialSource = fs.readFileSync('src/components/night/NightSpecialRolesStep.jsx', 'utf8');

    // 1. Cáo không bị loại khỏi activeRoles khi foxLostPower = true (đêm sau vẫn gọi cho có)
    assert.strictEqual(
      nightViewSource.includes("if (r.id === 'cao' && nightState?.foxLostPower) {\n        return false;\n      }"),
      false,
      'Cáo không bị loại trừ khỏi activeRoles sau khi mất phép'
    );
    assert.ok(
      nightViewSource.includes("isPowerLost: true") && nightViewSource.includes("Gọi thức dậy cho có"),
      'Cáo có thông báo gọi thức dậy cho có khi mất năng lực'
    );

    // 2. NightSpecialRolesStep có 2 nút case rõ ràng: SOI RA SÓI vs KHÔNG RA SÓI
    assert.ok(nightSpecialSource.includes('SOI RA SÓI'), 'Có nút Soi ra Sói');
    assert.ok(nightSpecialSource.includes('KHÔNG RA SÓI'), 'Có nút Không ra Sói');
    assert.ok(nightSpecialSource.includes('Gọi cho có'), 'Có giao diện gọi cho có khi mất phép');
    console.log('✅ Test 56: Cáo UI UX cases ("Soi ra Sói", "Không ra Sói") & "gọi cho có" đêm sau verified.');

    // --- TEST 57: Bà Đồng (Village Soothsayer) 5-use limit and resolveNight consumption ---
    const soothsayerPlayer = new Player({ id: 191, name: 'Bà Đồng 191', currentRoleId: 'ba-dong', roleId: 'ba-dong', isAlive: true });
    const villager57 = new Player({ id: 192, name: 'Dân 192', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const game57 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [soothsayerPlayer, villager57],
      nightState: { soothsayerCount: 0 }
    });

    // 1. Khi Bà Đồng chỉ định người trong đêm -> resolveNight tăng soothsayerCount lên 1
    const res57_1 = game57.resolveNight({
      soothsayerTargetId: 192,
      soothsayerSkipped: false
    });
    assert.strictEqual(res57_1.game.nightState.soothsayerCount, 1);

    // 2. Khi Bà Đồng bấm Bỏ Qua -> soothsayerCount không tăng
    const res57_2 = game57.resolveNight({
      soothsayerTargetId: null,
      soothsayerSkipped: true
    });
    assert.strictEqual(res57_2.game.nightState.soothsayerCount, 0);

    // 3. UI/UX: Khi đạt 5 lần thì đánh dấu hết lượt trong NightPhaseView và NightSpecialRolesStep
    assert.ok(nightViewSource.includes("if (r.id === 'ba-dong' && (nightState?.soothsayerCount || 0) >= 5)"), 'NightPhaseView kiểm tra giới hạn 5 lần của Bà Đồng');
    assert.ok(nightSpecialSource.includes('Đã Dùng Hết 5 Lượt Hỏi Tâm Linh'), 'NightSpecialRolesStep có thông báo hết 5 lượt của Bà Đồng');
    console.log('✅ Test 57: Bà Đồng (ba-dong) 5-use limit & resolveNight consumption verified.');

    // --- TEST 58: Người Múa Rối (Puppeteer) 1-time power consumption ---
    const puppeteerPlayer = new Player({ id: 201, name: 'Múa Rối 201', currentRoleId: 'nguoi-mua-roi', roleId: 'nguoi-mua-roi', isAlive: true });
    const wolf58 = new Player({ id: 202, name: 'Sói 202', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });
    const villager58 = new Player({ id: 203, name: 'Dân 203', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const game58 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [puppeteerPlayer, wolf58, villager58],
      nightState: { puppeteerUsed: false }
    });

    // Khi chỉ định mục tiêu thao túng -> resolveNight đánh dấu puppeteerUsed = true
    const res58 = game58.resolveNight({
      puppeteerTargetId: 202,
      puppeteerSkipped: false,
      wolfTargetId: 203
    });
    assert.strictEqual(res58.game.nightState.puppeteerUsed, true);
    assert.ok(nightViewSource.includes("if (r.id === 'nguoi-mua-roi' && nightState?.puppeteerUsed)"), 'NightPhaseView kiểm tra Người Múa Rối đã dùng quyền năng');
    assert.ok(nightSpecialSource.includes('Đã Sử Dụng Quyền Năng Múa Rối'), 'NightSpecialRolesStep hiển thị thông báo đã dùng');
    console.log('✅ Test 58: Người Múa Rối (nguoi-mua-roi) 1-time power consumption verified.');

    // --- TEST 59: Dược Sĩ (Apothecary) 2 single-use potions consumption ---
    const apothecaryPlayer = new Player({ id: 211, name: 'Dược Sĩ 211', currentRoleId: 'duoc-si', roleId: 'duoc-si', isAlive: true });
    const villager59 = new Player({ id: 212, name: 'Dân 212', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });

    const game59 = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [apothecaryPlayer, villager59],
      nightState: { apothecaryHasSleep: true, apothecaryHasAntidote: true }
    });

    const res59 = game59.resolveNight({
      apothecarySleepTargetId: 212,
      apothecaryCurePoison: true,
      apothecarySkipped: false
    });
    assert.strictEqual(res59.game.nightState.apothecaryHasSleep, false);
    assert.strictEqual(res59.game.nightState.apothecaryHasAntidote, false);
    assert.ok(nightViewSource.includes("if (r.id === 'duoc-si' && nightState?.apothecaryHasSleep === false && nightState?.apothecaryHasAntidote === false)"), 'NightPhaseView kiểm tra Dược Sĩ hết 2 bình');
    assert.ok(nightSpecialSource.includes('Đã Dùng Hết 2 Bình Thuốc'), 'NightSpecialRolesStep có thông báo hết 2 bình thuốc');
    console.log('✅ Test 59: Dược Sĩ (duoc-si) 2 single-use potions consumption verified.');

    // --- TEST 60: Người Gọi Hồn (nguoi-goi-hon) Night 1 / cemetery empty exclusion ---
    assert.ok(
      nightViewSource.includes("if (r.id === 'nguoi-goi-hon' && (roundNumber === 1 || players.filter(p => !p.isAlive).length === 0))"),
      'Người Gọi Hồn không thức dậy ở Đêm 1 hoặc khi chưa có người chết'
    );
    assert.ok(nightViewSource.includes("case 'nguoi-goi-hon':"), 'NightPhaseView có validation gatekeeper cho Người Gọi Hồn');
    console.log('✅ Test 60: Người Gọi Hồn (nguoi-goi-hon) cemetery empty exclusion verified.');

    // --- TEST 61: Nguyệt Nữ (nguyet-nu) Moon Priestess silence step seal & validation bypass ---
    assert.ok(nightViewSource.includes("const isCurrentRoleSilencedByMoon = !isWolfStep && roleHolders.some(p => p.id === nightState?.silencedPlayerId && !nightState?.moonPriestessSkipped);"), 'NightPhaseView tính toán nhân vật bị phong ấn bởi Nguyệt Nữ');
    assert.ok(nightViewSource.includes("if (isCurrentRoleSilencedByMoon) {\n      return {\n        isValid: true,\n        message: 'Người giữ vai này đã bị Nguyệt Nữ phong ấn năng lực đêm nay',"), 'Tự động mở khóa validation bước đêm khi nhân vật bị Nguyệt Nữ phong ấn');
    const headerSource = fs.readFileSync('src/components/night/NightStepHeader.jsx', 'utf8');
    assert.ok(headerSource.includes('BỊ NGUYỆT NỮ PHONG ẤN NĂNG LỰC ĐÊM NAY'), 'NightStepHeader hiển thị banner phong ấn của Nguyệt Nữ');
    console.log('✅ Test 61: Nguyệt Nữ (nguyet-nu) Moon Priestess silence step seal & validation bypass verified.');

    // --- TEST 62: All Wolves Dead vs Hostile 3rd Party vs Non-Hostile 3rd Party (Thằng Ngốc / Thiên Sứ) ---
    // Part A: Hostile 3rd Party (sat-thu) keeps game alive when wolves are dead
    const deadWolf = new Player({ id: 301, name: 'Sói Đã Chết', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: false });
    const livingVillager = new Player({ id: 302, name: 'Dân Làng 302', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const livingAssassin = new Player({ id: 303, name: 'Sát Thủ 303', currentRoleId: 'sat-thu', roleId: 'sat-thu', isAlive: true });

    const endCheckHostile = checkGameEnd([deadWolf, livingVillager, livingAssassin]);
    assert.strictEqual(endCheckHostile.isEnded, false, 'Khi sói chết hết nhưng Sát Thủ còn sống, game CHƯA được kết thúc');
    assert.strictEqual(endCheckHostile.waitingForThirdPartyElimination, true, 'waitingForThirdPartyElimination phải là true để UI hiển thị thông báo');

    // Sau khi Sát Thủ bị treo cổ
    livingAssassin.isAlive = false;
    const endCheckVillageWins = checkGameEnd([deadWolf, livingVillager, livingAssassin]);
    assert.strictEqual(endCheckVillageWins.isEnded, true, 'Khi Sát Thủ bị loại, Làng thắng');
    assert.strictEqual(endCheckVillageWins.winner, 'Villagers', 'Phe Dân Làng chiến thắng');

    // Part B: Non-hostile 3rd party (thang-ngoc / thien-su) does NOT block village victory when wolves die
    const livingIdiot = new Player({ id: 304, name: 'Thằng Ngốc 304', currentRoleId: 'thang-ngoc', roleId: 'thang-ngoc', isAlive: true });
    const livingVillagerB = new Player({ id: 305, name: 'Dân Làng 305', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const deadWolfB = new Player({ id: 306, name: 'Sói Đã Chết B', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: false });

    const endCheckIdiot = checkGameEnd([deadWolfB, livingVillagerB, livingIdiot]);
    assert.strictEqual(endCheckIdiot.isEnded, true, 'Thằng Ngốc không cản trở Dân Làng chiến thắng khi toàn bộ Sói đã chết');
    assert.strictEqual(endCheckIdiot.winner, 'Villagers', 'Phe Dân Làng chiến thắng');

    // Part C: Ghost wolves cannot bite when living wolves count is 0
    const targetVillager = new Player({ id: 307, name: 'Nạn Nhân 307', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const playersBeforeBite = [deadWolf, targetVillager];
    const nightResolution = resolveNightPhase(playersBeforeBite, { wolfTargetId: 307 }, 2);
    assert.strictEqual(nightResolution.killedPlayerIds.includes(307), false, 'Sói đã chết hết thì bầy sói không thể cắn chết người');
    const targetAfterNight = nightResolution.updatedPlayers.find(p => p.id === 307);
    assert.strictEqual(targetAfterNight.isAlive, true, 'Nạn nhân vẫn còn sống vì không có con sói sống nào đi săn');

    console.log('✅ Test 62: All Wolves Dead vs Hostile 3rd Party vs Non-Hostile 3rd Party (Thằng Ngốc / Thiên Sứ) verified.');

    // --- TEST 63: Multi-Faction Architecture & Classification (FACTION_TYPES) ---
    const foolPlayer63 = new Player({ id: 401, name: 'Thằng Ngốc 401', currentRoleId: 'thang-ngoc' });
    const angelPlayer63 = new Player({ id: 402, name: 'Thiên Sứ 402', currentRoleId: 'thien-su' });
    const assassinPlayer63 = new Player({ id: 403, name: 'Sát Thủ 403', currentRoleId: 'sat-thu' });
    const piperPlayer63 = new Player({ id: 404, name: 'Thổi Sáo 404', currentRoleId: 'nguoi-thoi-sao' });
    const whiteWolfPlayer63 = new Player({ id: 405, name: 'Sói Trắng 405', currentRoleId: 'soi-trang' });
    const villagerPlayer63 = new Player({ id: 406, name: 'Dân Làng 406', currentRoleId: 'dan-lang' });
    const wolfPlayer63 = new Player({ id: 407, name: 'Sói 407', currentRoleId: 'soi-thuong' });

    // Faction IDs
    assert.strictEqual(foolPlayer63.getFaction(), 'thang-ngo', 'Thằng Ngốc có faction là thang-ngo');
    assert.strictEqual(assassinPlayer63.getFaction(), 'sat-thu', 'Sát Thủ có faction là sat-thu');
    assert.strictEqual(piperPlayer63.getFaction(), 'nguoi-thoi-sao', 'Người Thổi Sáo có faction là nguoi-thoi-sao');
    assert.strictEqual(whiteWolfPlayer63.getFaction(), 'soi-trang', 'Sói Trắng có faction là soi-trang');
    assert.strictEqual(wolfPlayer63.getFaction(), 'werewolf', 'Sói Thường có faction là werewolf');
    assert.strictEqual(villagerPlayer63.getFaction(), 'village', 'Dân Làng có faction là village');

    // Faction Types
    assert.strictEqual(foolPlayer63.getFactionType(), FACTION_TYPES.NEUTRAL_OBJECTIVE, 'Thằng Ngốc là neutral_objective');
    assert.strictEqual(foolPlayer63.isNeutralObjective(), true, 'isNeutralObjective trả về true');
    assert.strictEqual(foolPlayer63.isHostileThirdParty(), false, 'Thằng Ngốc KHÔNG phải phe thù địch');

    // Thiên Sứ: Ngày 1 là neutral_objective, sau ngày 1 là village
    assert.strictEqual(angelPlayer63.getFactionType(1), FACTION_TYPES.NEUTRAL_OBJECTIVE, 'Thiên Sứ ở Ngày 1 là neutral_objective');
    assert.strictEqual(angelPlayer63.getFactionType(2), FACTION_TYPES.VILLAGE, 'Thiên Sứ sau Ngày 1 trở thành village');
    assert.strictEqual(angelPlayer63.getFaction(2), 'village', 'Thiên Sứ sau Ngày 1 nhận faction village');

    // Hostile Third Parties
    assert.strictEqual(assassinPlayer63.isHostileThirdParty(), true, 'Sát Thủ là phe thù địch');
    assert.strictEqual(piperPlayer63.isHostileThirdParty(), true, 'Người Thổi Sáo là phe thù địch');
    assert.strictEqual(whiteWolfPlayer63.isHostileThirdParty(), true, 'Sói Trắng là phe thù địch');

    // Sói & Dân
    assert.strictEqual(wolfPlayer63.getFactionType(), FACTION_TYPES.WEREWOLF, 'Sói Thường là werewolf');
    assert.strictEqual(villagerPlayer63.getFactionType(), FACTION_TYPES.VILLAGE, 'Dân Làng là village');

    // Solo survival without lynching does NOT trigger Fool win
    const soloFoolCheck = checkGameEnd([foolPlayer63]);
    assert.notStrictEqual(soloFoolCheck.winner, 'Idiot', 'Thằng Ngốc sống sót một mình không được coi là thắng vì chưa bị treo cổ');

    console.log('✅ Test 63: Multi-Faction Architecture & Classification (FACTION_TYPES) verified.');

    // --- TEST 64: Hiệp Sĩ Kiếm Gỉ Poison Infection Badge & Angel Win Diary logging ---
    const wolfStepSource = fs.readFileSync('src/components/night/NightWerewolvesStep.jsx', 'utf8');
    assert.ok(wolfStepSource.includes('SÓI TRÚNG ĐỘC KIẾM GỈ:'), 'NightWerewolvesStep có banner cảnh báo Sói trúng độc kiếm gỉ');
    const gridViewSource = fs.readFileSync('src/components/PlayersGridView.jsx', 'utf8');
    assert.ok(gridViewSource.includes('p.poisonedByRustySword'), 'PlayersGridView hiển thị huy hiệu nhiễm gỉ sét 🗡️');

    const appSource = fs.readFileSync('src/App.jsx', 'utf8');
    assert.ok(appSource.includes('Thiên Sứ đã hoàn thành tâm nguyện bị treo cổ Ngày 1 và ĐƠN ĐỘC CHIẾN THẮNG TRẬN ĐẤU!'), 'App.jsx ghi nhận nhật ký chiến thắng cho Thiên Sứ');

    console.log('✅ Test 64: Hiệp Sĩ Kiếm Gỉ Poison Infection Badge & Angel Win Diary logging verified.');

    // --- TEST 65: Complex Role Transformation & Cascade Interactions ---
    // Chain A: 5-Fold Cascade (Knight Duel -> Lover Hunter Heartbreak -> Wild Child Awakening -> Hunter Shot -> Shadow Inherits Awakened Wolf)
    const p1Knight = new Player({ id: 501, name: 'Kị Sĩ 501', currentRoleId: 'ki-si', roleId: 'ki-si', isAlive: true });
    const p2Wolf = new Player({ id: 502, name: 'Sói Yêu 502', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true, loverId: 503 });
    const p3Hunter = new Player({ id: 503, name: 'Thợ Săn 503', currentRoleId: 'tho-san', roleId: 'tho-san', isAlive: true, loverId: 502 });
    const p4WildChild = new Player({ id: 504, name: 'Đứa Trẻ 504', currentRoleId: 'dua-tre-hoang-da', roleId: 'dua-tre-hoang-da', isAlive: true, idolId: 503 });
    const p5Shadow = new Player({ id: 505, name: 'Ảnh Tử 505', currentRoleId: 'anh-tu', roleId: 'anh-tu', isAlive: true, shadowHostId: 504 });

    const game65A = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [p1Knight, p2Wolf, p3Hunter, p4WildChild, p5Shadow]
    });

    // 1. Kị Sĩ thách đấu Sói
    const duelRes65 = game65A.knightDuel(501, 502);
    assert.strictEqual(duelRes65.success, true);
    assert.strictEqual(duelRes65.game.getPlayer(502).isAlive, false, 'Sói thua đấu kiếm chết');
    assert.strictEqual(duelRes65.game.getPlayer(503).isAlive, false, 'Thợ Săn chết vì vỡ tim theo người yêu');
    assert.strictEqual(duelRes65.hunterTrigger?.id, 503, 'Thợ Săn kích hoạt phát súng hấp hối');
    const wildChildAfterDuel = duelRes65.game.getPlayer(504);
    assert.strictEqual(wildChildAfterDuel.isWolf(), true, 'Đứa Trẻ Hoang Dã mất thần tượng hóa thành Ma Sói');
    assert.strictEqual(wildChildAfterDuel.currentRoleId, 'soi-thuong', 'Vai hiện tại là soi-thuong');

    // 2. Thợ Săn bắn chết Đứa Trẻ Hoang Dã (nay đã là Sói)
    const gameAfterHunterShot = duelRes65.game.clone({
      players: duelRes65.game.players.map(p => p.id === 504 ? p.kill('Bị Thợ Săn bắn gục', 'Ngày 1') : p)
    });
    // 3. Bản thể của Ảnh Tử chết -> Ảnh Tử kế thừa vai trò HIỆN TẠI (Ma Sói)
    const shadowRes65 = gameAfterHunterShot._checkShadowInheritance(gameAfterHunterShot.players, gameAfterHunterShot.getPlayer(504));
    const shadowAfter = shadowRes65.updatedPlayers.find(p => p.id === 505);
    assert.strictEqual(shadowAfter.currentRoleId, 'soi-thuong', 'Ảnh Tử kế thừa vai trò hiện tại (soi-thuong)');
    assert.strictEqual(shadowAfter.isWolf(), true, 'Ảnh Tử trở thành Ma Sói');
    assert.strictEqual(shadowAfter.getFactionType(), FACTION_TYPES.WEREWOLF, 'Faction chuyển thành werewolf');

    // Chain B: Multi-level Inheritance (Lynch Assassin -> Devoted Servant inherits -> Wolf kills Servant -> Shadow inherits Assassin)
    const pAssassin65 = new Player({ id: 510, name: 'Sát Thủ 510', currentRoleId: 'sat-thu', roleId: 'sat-thu', isAlive: true });
    const pServant65 = new Player({ id: 511, name: 'Đầy Tớ 511', currentRoleId: 'nguoi-day-to-tan-tuy', roleId: 'nguoi-day-to-tan-tuy', isAlive: true });
    const pShadow65 = new Player({ id: 512, name: 'Ảnh Tử 512', currentRoleId: 'anh-tu', roleId: 'anh-tu', isAlive: true, shadowHostId: 511 });
    const pWolf65 = new Player({ id: 513, name: 'Sói 513', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const game65B = new WerewolfGame({
      roundNumber: 1,
      isNight: false,
      players: [pAssassin65, pServant65, pShadow65, pWolf65]
    });

    const lynchAssassin = game65B.lynchPlayer(510);
    const inheritAssassin = lynchAssassin.game.inheritServantRole(511, 'sat-thu');
    const servantAfterInherit = inheritAssassin.game.getPlayer(511);
    assert.strictEqual(servantAfterInherit.currentRoleId, 'sat-thu');
    assert.strictEqual(servantAfterInherit.getFactionType(), FACTION_TYPES.HOSTILE_THIRD_PARTY);

    // Đêm tiếp theo: Sói cắn chết Đầy Tớ (nay là Sát Thủ)
    const nightRes65B = resolveNightPhase(inheritAssassin.game.players, { wolfTargetId: 511 }, 2);
    const shadowInheritedFromServant = nightRes65B.updatedPlayers.find(p => p.id === 512);
    assert.strictEqual(shadowInheritedFromServant.currentRoleId, 'sat-thu', 'Ảnh Tử kế thừa vai Sát Thủ của Đầy Tớ');
    assert.strictEqual(getPlayerFactionType(shadowInheritedFromServant), FACTION_TYPES.HOSTILE_THIRD_PARTY, 'Ảnh Tử nhận faction hostile_third_party');

    // Chain C: Pyromaniac Counter-Burn burns Wolf Pup -> Victim saved & Wolf Cuồng Nộ triggers
    const pPyro65 = new Player({ id: 521, name: 'Đốt Nhà 521', currentRoleId: 'ke-dot-nha', roleId: 'ke-dot-nha', isAlive: true });
    const pVictim65 = new Player({ id: 522, name: 'Nạn Nhân 522', currentRoleId: 'dan-lang', roleId: 'dan-lang', isAlive: true });
    const pWolfPup65 = new Player({ id: 523, name: 'Sói Con 523', currentRoleId: 'soi-con', roleId: 'soi-con', isAlive: true });
    const pWolf65C = new Player({ id: 524, name: 'Sói Thường 524', currentRoleId: 'soi-thuong', roleId: 'soi-thuong', isAlive: true });

    const game65C = new WerewolfGame({
      roundNumber: 1,
      isNight: true,
      players: [pPyro65, pVictim65, pWolfPup65, pWolf65C]
    });
    const res65C = game65C.resolveNight({ wolfTargetId: 522, pyroTargetId: 522 });
    assert.strictEqual(res65C.game.getPlayer(522).isAlive, true, 'Nạn nhân được cứu sống khỏi cú cắn của Sói nhờ hỏa hoạn');
    assert.strictEqual(res65C.game.getPlayer(523).isAlive, false, 'Sói Con bị thiêu chết');
    assert.strictEqual(res65C.wolfCanKillDouble, true, 'Sói Con chết kích hoạt Sói cuồng nộ đêm sau');

    // Chain D: Sói Lửa incinerates Hunter's weapon -> Hunter death shot disabled
    const pHunterBurned = new Player({ id: 531, name: 'Thợ Săn 531', currentRoleId: 'tho-san', roleId: 'tho-san', isAlive: true, isPowerBurned: true });
    const game65D = new WerewolfGame({
      roundNumber: 2,
      isNight: false,
      players: [pHunterBurned]
    });
    const lynchBurnedHunter = game65D.lynchPlayer(531);
    assert.strictEqual(lynchBurnedHunter.hunterTrigger, null, 'Thợ Săn bị Sói Lửa thiêu rụi năng lực thì khi chết KHÔNG được bắn');

    console.log('✅ Test 65: Complex Role Transformation & Cascade Interactions verified.');

    console.log('\n🎉 ALL 65 DOMAIN ENGINE TESTS PASSED PERFECTLY!\n');
  });
}
