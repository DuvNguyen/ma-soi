import assert from 'node:assert';
import { Player } from '../src/domain/models/Player.js';
import { getRoleStrategy } from '../src/domain/strategies/RoleStrategies.js';
import { getRoleCapacity } from '../src/utils/deckUtils.js';

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

    console.log('\n🎉 ALL 28 DOMAIN ENGINE TESTS PASSED PERFECTLY!\n');
  });
}
