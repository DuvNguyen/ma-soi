import { ROLES } from '../data/roles.js';

/**
 * Returns the maximum number of players that can hold a specific role in the game
 * based on the current deck composition.
 */
export function getRoleCapacity(roleId, deckRoleIds = []) {
  if (!roleId) return 1;

  // Hai Chị Em (Two Sisters) is specifically 2 players
  if (roleId === 'hai-chi-em') {
    const countInDeck = deckRoleIds ? deckRoleIds.filter(id => id === roleId).length : 0;
    return Math.max(countInDeck, 2);
  }

  // Ba Anh Em (Three Brothers) is specifically 3 players
  if (roleId === 'ba-anh-em') {
    const countInDeck = deckRoleIds ? deckRoleIds.filter(id => id === roleId).length : 0;
    return Math.max(countInDeck, 3);
  }

  // Anh Em Sói (Wolf Brothers: Sói Anh & Sói Em) is specifically 2 players
  if (roleId === 'anh-em-soi') {
    const countInDeck = deckRoleIds ? deckRoleIds.filter(id => id === roleId).length : 0;
    return Math.max(countInDeck, 2);
  }

  // If role is common villager, allow multiple
  if (roleId === 'dan-lang' || roleId === 'dan-thuong') {
    if (deckRoleIds && deckRoleIds.length > 0) {
      const count = deckRoleIds.filter(id => id === roleId).length;
      return count > 0 ? count : 99;
    }
    return 99;
  }

  // If deck is specified, count occurrences in deck
  if (deckRoleIds && deckRoleIds.length > 0) {
    const countInDeck = deckRoleIds.filter(id => id === roleId).length;
    if (countInDeck > 0) return countInDeck;
  }

  // Werewolf default capacity
  if (['soi-thuong', 'soi-con', 'soi-lon-xau-xa'].includes(roleId)) {
    return 2;
  }

  // All special characters / unique roles can only be held by 1 player
  return 1;
}

/**
 * Calculates remaining unassigned cards in the deck
 */
export function getRemainingDeckCards(players, deckRoleIds = []) {
  if (!deckRoleIds || deckRoleIds.length === 0) return [];

  // Count total occurrences in deck
  const totalCounts = {};
  deckRoleIds.forEach(id => {
    totalCounts[id] = (totalCounts[id] || 0) + 1;
  });

  // Count assigned roles among players
  const assignedCounts = {};
  players.forEach(p => {
    const pCurrentId = p.currentRoleId || p.roleId;
    if (pCurrentId) {
      assignedCounts[pCurrentId] = (assignedCounts[pCurrentId] || 0) + 1;
    }
  });

  // Calculate remaining
  const remaining = [];
  Object.entries(totalCounts).forEach(([roleId, total]) => {
    const assigned = assignedCounts[roleId] || 0;
    const left = Math.max(0, total - assigned);
    if (left > 0) {
      const roleObj = ROLES.find(r => r.id === roleId) || { id: roleId, name: roleId, teamCode: 'V' };
      remaining.push({
        ...roleObj,
        count: left
      });
    }
  });

  return remaining;
}
