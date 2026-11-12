import assert from 'node:assert';
import { Player } from '../src/domain/models/Player.js';
import { getRoleStrategy } from '../src/domain/strategies/RoleStrategies.js';

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
  assert.strictEqual(cursedSeer.currentRoleId, 'soi-thuong');
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

    console.log('\n🎉 ALL 12 DOMAIN ENGINE TESTS PASSED PERFECTLY!\n');
  });
}
