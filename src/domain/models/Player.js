import { getRole, WOLF_ROLE_IDS } from '../../utils/roleUtils.js';
import { getRoleStrategy } from '../strategies/RoleStrategies.js';

export const DEFAULT_PLAYER_PROPS = {
  currentRoleId: null,
  roleId: null,
  originalRoleId: null,
  isAlive: true,
  deathReason: null,
  deathPhase: null,
  loverId: null,
  elderLives: undefined,
  isRevealedIdiot: false,
  isSheriff: false,
  isCursedWolf: false,
  curseNight: null,
  poisonedByRustySword: false,
  rustySwordPoisonRound: null,
  hasUsedKnightDuel: false,
  shadowHostId: null
};

/**
 * Thực thể Player (Người chơi) trong game Ma Sói.
 * Đóng gói toàn bộ trạng thái và hành vi nghiệp vụ của người chơi.
 */
export class Player {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name || `Người chơi ${data.id || '?'}`;
    this.currentRoleId = data.currentRoleId ?? data.roleId ?? null;
    this.roleId = this.currentRoleId;
    this.originalRoleId = data.originalRoleId ?? null;
    this.isAlive = data.isAlive !== undefined ? Boolean(data.isAlive) : true;
    this.deathReason = data.deathReason || null;
    this.deathPhase = data.deathPhase || null;
    this.loverId = data.loverId ?? null;
    this.elderLives = data.elderLives;
    this.isRevealedIdiot = Boolean(data.isRevealedIdiot);
    this.isSheriff = Boolean(data.isSheriff);
    this.isCursedWolf = Boolean(data.isCursedWolf);
    this.curseNight = data.curseNight ?? null;
    this.poisonedByRustySword = Boolean(data.poisonedByRustySword);
    this.rustySwordPoisonRound = data.rustySwordPoisonRound ?? null;
    this.hasUsedKnightDuel = Boolean(data.hasUsedKnightDuel);
    this.shadowHostId = data.shadowHostId ?? null;
  }

  /**
   * Lấy RoleStrategy xử lý hành vi theo vai trò hiện tại hoặc gốc
   */
  getStrategy() {
    return getRoleStrategy(this.currentRoleId || this.originalRoleId);
  }

  /**
   * Kiểm tra người chơi có thuộc phe Ma Sói hay không
   * Bao gồm cả người bị Sói Nguyền lây nhiễm, Nửa Người Nửa Sói đã thức tỉnh, v.v.
   */
  isWolf() {
    if (this.isCursedWolf) return true;
    const role = this.getRole();
    if (!role) return false;
    return role.teamCode === 'W' || WOLF_ROLE_IDS.includes(role.id);
  }

  /**
   * Kiểm tra người chơi có vai trò gốc thuộc phe Sói hay không
   */
  isOriginalWolf() {
    const orig = this.getOriginalRole();
    if (!orig) return false;
    return orig.teamCode === 'W' || WOLF_ROLE_IDS.includes(orig.id);
  }

  /**
   * Lấy thông tin vai trò hiện tại của player (có tính đến lời nguyền Sói)
   */
  getRole() {
    const roleId = this.currentRoleId || this.roleId;
    const role = getRole(roleId);
    if (!role) return null;

    if (this.isCursedWolf) {
      const orig = this.getOriginalRole();
      const cleanOrigName = orig ? (orig.name || '').split(' (')[0].trim() : 'Dân Làng';
      return {
        ...role,
        name: `Sói (${cleanOrigName} bị nguyền)`,
        teamCode: 'W',
        team: 'Phe Sói',
        originalRole: orig
      };
    }

    return role;
  }

  /**
   * Lấy thông tin vai trò ban đầu trước khi bị biến đổi (nếu có)
   */
  getOriginalRole() {
    return getRole(this.originalRoleId || this.currentRoleId || this.roleId);
  }

  /**
   * Kết quả khi Tiên Tri soi người chơi này
   * @param {object} nightContext
   * @returns {'WOLF' | 'VILLAGER'}
   */
  getSeerAffiliation(nightContext = {}) {
    return this.getStrategy().getSeerAffiliation(this, nightContext);
  }

  /**
   * Kiểm tra xem vai của người chơi này có thể được gán cho người khác hay không.
   * Quy tắc: Người giữ vai đã chết hoặc bị biến đổi thành Sói ➔ KHÔNG được gán lại
   */
  canBeReassigned() {
    return this.getStrategy().canBeReassigned(this);
  }

  /**
   * Xử lý đòn tấn công của bầy Ma Sói
   * @param {object} context
   */
  receiveWolfBite(context = {}) {
    return this.getStrategy().onBittenByWolves(this, context);
  }

  /**
   * Tạo bản sao Player bị đánh dấu hy sinh
   */
  kill(reason, phase) {
    return new Player({
      ...this.toJSON(),
      isAlive: false,
      deathReason: reason || 'Đã hy sinh',
      deathPhase: phase || null
    });
  }

  /**
   * Thức tỉnh Bán Sói (Nửa Người Nửa Sói) thành Ma Sói
   */
  awakenHalfWolf(roundNumber = 1) {
    return new Player({
      ...this.toJSON(),
      originalRoleId: this.originalRoleId || this.currentRoleId || 'nua-nguoi-nua-soi',
      currentRoleId: 'soi-thuong',
      roleId: 'soi-thuong',
      isCursedWolf: true,
      curseNight: roundNumber
    });
  }

  /**
   * Bị Sói Nguyền / Sói Quỷ đồng hóa thành Ma Sói
   */
  infectByCursedWolf(roundNumber = 1) {
    return new Player({
      ...this.toJSON(),
      originalRoleId: this.originalRoleId || this.currentRoleId || this.roleId,
      currentRoleId: 'soi-thuong',
      roleId: 'soi-thuong',
      isCursedWolf: true,
      curseNight: roundNumber
    });
  }

  /**
   * Gán vai trò mới cho người chơi
   * Nếu người chơi đã bị Sói Nguyền lây nhiễm trước đó: giữ nguyên thân phận Ma Sói, chỉ cập nhật vai trò gốc
   */
  assignRole(roleId) {
    if (this.isCursedWolf) {
      return new Player({
        ...this.toJSON(),
        originalRoleId: roleId,
        currentRoleId: 'soi-thuong',
        roleId: 'soi-thuong',
        isCursedWolf: true
      });
    }
    return new Player({
      ...this.toJSON(),
      currentRoleId: roleId,
      roleId: roleId,
      elderLives: roleId === 'gia-lang' ? 2 : this.elderLives
    });
  }

  /**
   * Hủy gán vai trò
   */
  unassignRole() {
    if (this.isCursedWolf) {
      return new Player({
        ...this.toJSON(),
        originalRoleId: null
      });
    }
    return new Player({
      ...this.toJSON(),
      currentRoleId: null,
      roleId: null,
      elderLives: undefined
    });
  }

  /**
   * Tạo bản sao Player với các trường được ghi đè (Immutability)
   */
  clone(patch = {}) {
    return new Player({
      ...this.toJSON(),
      ...patch
    });
  }

  /**
   * Xuất plain object để serialize lưu trữ vào localStorage và Neon DB
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      currentRoleId: this.currentRoleId,
      roleId: this.currentRoleId,
      originalRoleId: this.originalRoleId,
      isAlive: this.isAlive,
      deathReason: this.deathReason,
      deathPhase: this.deathPhase,
      loverId: this.loverId,
      elderLives: this.elderLives,
      isRevealedIdiot: this.isRevealedIdiot,
      isSheriff: this.isSheriff,
      isCursedWolf: this.isCursedWolf,
      curseNight: this.curseNight,
      poisonedByRustySword: this.poisonedByRustySword,
      rustySwordPoisonRound: this.rustySwordPoisonRound,
      hasUsedKnightDuel: this.hasUsedKnightDuel,
      shadowHostId: this.shadowHostId
    };
  }

  /**
   * Tái tạo Player instance từ plain object trong cache hoặc Neon DB
   */
  static fromJSON(raw = {}) {
    return new Player({
      ...DEFAULT_PLAYER_PROPS,
      ...raw
    });
  }
}
