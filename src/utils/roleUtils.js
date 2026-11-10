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
  const roleId = player.currentRoleId || player.roleId;
  return getRole(roleId);
};

/**
 * Lấy vai trò ban đầu của player trước khi bị biến đổi (nếu có)
 * @param {object|null} player
 * @returns {object|null} Role object hoặc null
 */
export const getPlayerOriginalRole = (player) => {
  if (!player) return null;
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
  if (player.isCursedWolf) return true;
  const role = getPlayerRole(player);
  if (!role) return false;
  return role.teamCode === 'W' || WOLF_ROLE_IDS.includes(role.id);
};
