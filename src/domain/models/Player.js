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
  shadowHostId: null,
  isHypnotized: false,
  idolId: null,
  isAsleepByApothecary: false,
  avengerFaction: null,
  cultGroup: null,
  roleHistory: []
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
    this.isHypnotized = Boolean(data.isHypnotized);
    this.idolId = data.idolId ?? null;
    this.isAsleepByApothecary = Boolean(data.isAsleepByApothecary);
    this.avengerFaction = data.avengerFaction ?? null;
    this.cultGroup = data.cultGroup ?? null;
    this.roleHistory = Array.isArray(data.roleHistory) ? data.roleHistory : [];
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

    if (this.isCursedWolf || roleId === 'soi-bi-nguyen') {
      const orig = this.getOriginalRole();
      const hasFunctionalOrig = orig && orig.id !== 'soi-bi-nguyen' && orig.id !== 'soi-thuong' && orig.id !== 'dan-lang' && orig.id !== 'dan-thuong';
      const cleanOrigName = hasFunctionalOrig ? (orig.name || '').split(' (')[0].trim() : null;
      const baseRole = getRole('soi-bi-nguyen') || getRole('soi-thuong');
      return {
        ...baseRole,
        id: 'soi-bi-nguyen',
        name: cleanOrigName ? `Sói (${cleanOrigName} bị nguyền)` : 'Sói Bị Nguyền',
        enName: cleanOrigName ? `Cursed ${orig.enName || 'Werewolf'}` : 'Cursed Werewolf',
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
   * Ghi lại lịch sử biến đổi vai trò hoặc sự kiện trọng đại của người chơi
   * @param {{ phase: string, type: string, title: string, detail: string, fromRole?: string, toRole?: string }} event
   */
  recordHistory({ phase, type, title, detail, fromRole, toRole }) {
    const entry = {
      phase: phase || 'Ván đấu',
      timestamp: Date.now(),
      type: type || 'TRANSFORMATION',
      title: title || 'Biến đổi vai trò',
      detail: detail || '',
      fromRole: fromRole || this.currentRoleId,
      toRole: toRole || this.currentRoleId
    };
    const nextHistory = Array.isArray(this.roleHistory) ? [...this.roleHistory, entry] : [entry];
    return this.clone({ roleHistory: nextHistory });
  }

  /**
   * Thức tỉnh Bán Sói (Nửa Người Nửa Sói) thành Ma Sói
   */
  awakenHalfWolf(roundNumber = 1) {
    const origId = this.originalRoleId || this.currentRoleId || 'nua-nguoi-nua-soi';
    const player = new Player({
      ...this.toJSON(),
      originalRoleId: origId,
      currentRoleId: 'soi-thuong',
      roleId: 'soi-thuong',
      isCursedWolf: true,
      curseNight: roundNumber
    });
    return player.recordHistory({
      phase: `Đêm ${roundNumber}`,
      type: 'HALF_WOLF_AWAKEN',
      title: 'Bán Sói Thức Tỉnh 🐺',
      detail: `Bị bầy Ma Sói cắn trong Đêm ${roundNumber}. Vết cắn kích hoạt gen Sói ngủ sâu, không chết mà trở thành Ma Sói thực thụ.`,
      fromRole: origId,
      toRole: 'soi-thuong'
    });
  }

  /**
   * Bị Sói Nguyền / Sói Quỷ đồng hóa thành Ma Sói
   */
  infectByCursedWolf(roundNumber = 1) {
    const origId = this.originalRoleId || (this.currentRoleId !== 'soi-thuong' && this.currentRoleId !== 'soi-bi-nguyen' ? this.currentRoleId : null) || null;
    const player = new Player({
      ...this.toJSON(),
      originalRoleId: origId,
      currentRoleId: 'soi-bi-nguyen',
      roleId: 'soi-bi-nguyen',
      isCursedWolf: true,
      curseNight: roundNumber
    });
    const origName = origId ? (getRole(origId)?.name || origId) : 'vai trò ban đầu';
    return player.recordHistory({
      phase: `Đêm ${roundNumber}`,
      type: 'CURSED_WOLF_INFECT',
      title: 'Trúng Lời Nguyền Sói Quỷ 🔮',
      detail: `Bị Sói Quỷ lây nhiễm lời nguyền bóng tối trong Đêm ${roundNumber}, chuyển hóa thành Ma Sói. Toàn bộ năng lực của ${origName} bị phong ấn vĩnh viễn.`,
      fromRole: origId,
      toRole: 'soi-bi-nguyen'
    });
  }

  /**
   * Gán vai trò mới cho người chơi
   * Nếu người chơi đã bị Sói Nguyền lây nhiễm trước đó: giữ nguyên thân phận Ma Sói, chỉ cập nhật vai trò gốc
   */
  assignRole(roleId) {
    if (this.isCursedWolf || this.currentRoleId === 'soi-bi-nguyen') {
      return new Player({
        ...this.toJSON(),
        originalRoleId: roleId,
        currentRoleId: 'soi-bi-nguyen',
        roleId: 'soi-bi-nguyen',
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
    if (this.isCursedWolf || this.currentRoleId === 'soi-bi-nguyen') {
      return new Player({
        ...this.toJSON(),
        originalRoleId: null,
        currentRoleId: 'soi-bi-nguyen',
        roleId: 'soi-bi-nguyen',
        isCursedWolf: true
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
      shadowHostId: this.shadowHostId,
      isHypnotized: this.isHypnotized,
      idolId: this.idolId,
      isAsleepByApothecary: this.isAsleepByApothecary,
      avengerFaction: this.avengerFaction,
      cultGroup: this.cultGroup,
      roleHistory: this.roleHistory || []
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
