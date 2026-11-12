import { ROLES } from '../data/roles.js';

export const WOLF_ROLE_IDS = [
  'soi-thuong',
  'soi-con',
  'soi-lon-xau-xa',
  'soi-trang',
  'soi-nguyen',
  'soi-quy',
  'nguoi-cha-cua-soi',
  'soi-lua',
  'anh-em-soi'
];

/**
 * Tra cứu Role master entity từ role ID
 * @param {string|null} roleId
 * @returns {object|null} Role object hoặc null
 */
export const getRole = (roleId) => {
  if (!roleId) return null;
  return ROLES.find(r => r.id === roleId || (r.aliases && r.aliases.includes(roleId))) || null;
};

/**
 * Lấy vai trò hiện tại của player
 * Hỗ trợ cả currentRoleId và roleId (chuyển đổi an toàn)
 * @param {object|null} player
 * @returns {object|null} Role object hoặc null
 */
export const getPlayerRole = (player) => {
  if (!player) return null;
  if (typeof player.getRole === 'function') {
    return player.getRole();
  }
  const roleId = player.currentRoleId || player.roleId;
  const role = getRole(roleId);
  if (!role) return null;

  // Nếu người chơi bị nguyền thành Sói (bởi Sói Nguyền / Sói Quỷ)
  if (player.isCursedWolf) {
    const origRole = getPlayerOriginalRole(player);
    if (origRole && origRole.id !== role.id) {
      const cleanOrigName = (origRole.name || '').split(' (')[0].trim();
      return {
        ...role,
        name: `Sói (${cleanOrigName} bị nguyền)`,
        teamCode: 'W',
        team: 'Phe Sói',
        originalRole: origRole
      };
    }
  }

  return role;
};

/**
 * Lấy vai trò ban đầu của player trước khi bị biến đổi (nếu có)
 * @param {object|null} player
 * @returns {object|null} Role object hoặc null
 */
export const getPlayerOriginalRole = (player) => {
  if (!player) return null;
  if (typeof player.getOriginalRole === 'function') {
    return player.getOriginalRole();
  }
  return getRole(player.originalRoleId);
};

/**
 * Kiểm tra người chơi có thuộc phe Ma Sói hay không
 * Bao gồm cả người bị Sói Nguyền lây nhiễm, Nửa Người Nửa Sói đã thức tỉnh, v.v.
 * @param {object|null} player
 * @returns {boolean}
 */
export const isWolfPlayer = (player) => {
  if (!player) return false;
  if (typeof player.isWolf === 'function') {
    return player.isWolf();
  }
  if (player.isCursedWolf) return true;
  const role = getPlayerRole(player);
  if (!role) return false;
  return role.teamCode === 'W' || WOLF_ROLE_IDS.includes(role.id);
};
