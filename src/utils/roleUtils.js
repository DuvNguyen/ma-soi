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
  'anh-em-soi',
  'soi-bi-nguyen'
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

  // Nếu người chơi bị nguyền thành Sói (bởi Sói Nguyền / Sói Quỷ hoặc có role soi-bi-nguyen)
  if (player.isCursedWolf || roleId === 'soi-bi-nguyen') {
    const origRole = getPlayerOriginalRole(player);
    const hasFunctionalOrig = origRole && origRole.id !== 'soi-bi-nguyen' && origRole.id !== 'soi-thuong' && origRole.id !== 'dan-lang' && origRole.id !== 'dan-thuong';
    const cleanOrigName = hasFunctionalOrig ? (origRole.name || '').split(' (')[0].trim() : null;
    const baseRole = getRole('soi-bi-nguyen') || getRole('soi-thuong');
    return {
      ...baseRole,
      id: 'soi-bi-nguyen',
      name: cleanOrigName ? `Sói (${cleanOrigName} bị nguyền)` : 'Sói Bị Nguyền',
      enName: cleanOrigName ? `Cursed ${origRole.enName || 'Werewolf'}` : 'Cursed Werewolf',
      teamCode: 'W',
      team: 'Phe Sói',
      originalRole: origRole
    };
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

/**
 * Chuẩn hóa chuỗi tiếng Việt (loại bỏ toàn bộ dấu thanh và dấu phụ)
 * Hỗ trợ tìm kiếm không dấu: "vi" khớp "Vĩ", "nam" khớp "Nam", "tot" khớp "Tốt", "duc" khớp "Đức"
 * @param {string|number|null} str
 * @returns {string} Chuỗi viết thường không dấu
 */
export const removeVietnameseTones = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
    .toLowerCase()
    .trim();
};

/**
 * Kiểm tra xem chuỗi nguồn có chứa từ khóa tìm kiếm hay không (không phân biệt hoa/thường và dấu tiếng Việt)
 * @param {string|null} text Chuỗi cần tìm (tên người chơi, tên vai...)
 * @param {string|null} query Từ khóa người dùng gõ
 * @returns {boolean}
 */
export const matchesSearch = (text, query) => {
  if (!query) return true;
  if (!text) return false;
  return removeVietnameseTones(text).includes(removeVietnameseTones(query));
};

/**
 * Phân loại các nhóm Phe (Faction Types) chuẩn trong Ma Sói:
 * - WEREWOLF: Phe Ma Sói (thù địch chính)
 * - VILLAGE: Phe Dân Làng (bảo vệ ngôi làng)
 * - HOSTILE_THIRD_PARTY: Phe Thứ Ba Thù Địch (Sát Thủ, Thổi Sáo, Giáo Phái, Sói Trắng, Cặp đôi khác phe)
 *   -> Có năng lực đêm gây hại/thôi miên, Làng BẮT BUỘC phải loại bỏ mới có thể chiến thắng.
 * - NEUTRAL_OBJECTIVE: Phe Độc Lập Mục Tiêu (Thằng Ngố, Thiên Sứ)
 *   -> Chỉ có điều kiện thắng kích hoạt khi bị Dân Làng biểu quyết treo cổ (Thằng Ngố: bất kỳ ngày nào, Thiên Sứ: Ngày 1).
 *   -> Không có năng lực đêm gây hại, KHÔNG cản trở Làng thắng khi toàn bộ Sói đã chết.
 *   -> Nếu không đạt được điều kiện kích hoạt thì thua cuộc khi ván đấu kết thúc.
 * - DYNAMIC: Vai trò có phe thay đổi linh hoạt trong ván (Đứa Trẻ Hoang Dã, Nửa Người Nửa Sói, Chó Sói, Kẻ Báo Thù, Ăn Trộm, v.v.)
 */
export const FACTION_TYPES = {
  WEREWOLF: 'werewolf',
  VILLAGE: 'village',
  HOSTILE_THIRD_PARTY: 'hostile_third_party',
  NEUTRAL_OBJECTIVE: 'neutral_objective',
  DYNAMIC: 'dynamic'
};

/**
 * Lấy loại phe (Faction Type) của người chơi trong ván đấu
 * @param {object|null} player
 * @param {number} roundNumber
 * @returns {'werewolf' | 'village' | 'hostile_third_party' | 'neutral_objective' | 'dynamic'}
 */
export const getPlayerFactionType = (player, roundNumber = 1) => {
  if (!player) return FACTION_TYPES.VILLAGE;
  
  // 1. Nếu là Sói (bao gồm thức tỉnh, bị nguyền)
  if (isWolfPlayer(player)) {
    const role = getPlayerRole(player);
    const roleId = player.currentRoleId || player.roleId || role?.id;
    if (roleId === 'soi-trang') {
      return FACTION_TYPES.HOSTILE_THIRD_PARTY;
    }
    return FACTION_TYPES.WEREWOLF;
  }

  const role = getPlayerRole(player);
  const roleId = player.currentRoleId || player.roleId || role?.id;

  // 2. Neutral Objective (Phe Độc Lập Mục Tiêu - Thằng Ngốc & Thiên Sứ)
  if (roleId === 'thang-ngoc') {
    return FACTION_TYPES.NEUTRAL_OBJECTIVE;
  }
  if (roleId === 'thien-su') {
    return roundNumber <= 1 ? FACTION_TYPES.NEUTRAL_OBJECTIVE : FACTION_TYPES.VILLAGE;
  }

  // 3. Hostile Third Party (Phe Thứ 3 Thù Địch)
  if (['sat-thu', 'nguoi-thoi-sao', 'thanh-vien-giao-phai', 'soi-trang'].includes(roleId)) {
    return FACTION_TYPES.HOSTILE_THIRD_PARTY;
  }

  if (role?.factionType) {
    return role.factionType;
  }

  if (role?.teamCode === 'W') return FACTION_TYPES.WEREWOLF;
  if (role?.teamCode === '3') return FACTION_TYPES.HOSTILE_THIRD_PARTY;

  return FACTION_TYPES.VILLAGE;
};

/**
 * Lấy định danh phe cụ thể (Faction ID) của người chơi
 * @param {object|null} player
 * @param {number} roundNumber
 * @returns {string}
 */
export const getPlayerFaction = (player, roundNumber = 1) => {
  if (!player) return 'village';
  const role = getPlayerRole(player);
  const roleId = player.currentRoleId || player.roleId || role?.id;

  if (roleId === 'thang-ngoc') return 'thang-ngo';
  if (roleId === 'thien-su') return roundNumber <= 1 ? 'thien-su' : 'village';
  if (roleId === 'sat-thu') return 'sat-thu';
  if (roleId === 'nguoi-thoi-sao') return 'nguoi-thoi-sao';
  if (roleId === 'thanh-vien-giao-phai') return 'giao-phai';
  if (roleId === 'soi-trang') return 'soi-trang';
  if (isWolfPlayer(player)) return 'werewolf';

  return role?.faction || 'village';
};

/**
 * Kiểm tra xem người chơi có thuộc Phe Thứ 3 Thù Địch cản trở Dân Làng thắng hay không
 * @param {object|null} player
 * @param {number} roundNumber
 * @returns {boolean}
 */
export const isHostileThirdParty = (player, roundNumber = 1) => {
  return getPlayerFactionType(player, roundNumber) === FACTION_TYPES.HOSTILE_THIRD_PARTY;
};

/**
 * Kiểm tra xem người chơi có thuộc Phe Độc Lập Mục Tiêu (Thằng Ngốc, Thiên Sứ) hay không
 * @param {object|null} player
 * @param {number} roundNumber
 * @returns {boolean}
 */
export const isNeutralObjective = (player, roundNumber = 1) => {
  return getPlayerFactionType(player, roundNumber) === FACTION_TYPES.NEUTRAL_OBJECTIVE;
};
