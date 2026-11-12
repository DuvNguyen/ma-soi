import { getRole, WOLF_ROLE_IDS } from '../../utils/roleUtils.js';

/**
 * Base Strategy cho mọi vai trò trong Ma Sói.
 * Các vai có cơ chế đặc thù (Bán Sói, Già Làng, Thằng Ngốc...) sẽ kế thừa và ghi đè (override).
 */
export class BaseRoleStrategy {
  constructor(roleId) {
    this.roleId = roleId;
  }

  getRoleDefinition() {
    return getRole(this.roleId);
  }

  /**
   * Xác định kết quả khi Tiên Tri soi người chơi này
   * @param {Player} player - Người chơi được soi
   * @param {object} nightContext - Bối cảnh đêm (mục tiêu sói cắn, v.v.)
   * @returns {'WOLF' | 'VILLAGER'}
   */
  getSeerAffiliation(player, nightContext = {}) {
    if (player.isCursedWolf) return 'WOLF';
    const role = player.getRole();
    if (!role) return 'VILLAGER';
    return (role.teamCode === 'W' || WOLF_ROLE_IDS.includes(role.id)) ? 'WOLF' : 'VILLAGER';
  }

  /**
   * Xử lý khi người chơi bị bầy Ma Sói cắn
   * @param {Player} player
   * @param {object} context
   * @returns {object} Kết quả biến đổi hoặc tử vong
   */
  onBittenByWolves(player, context = {}) {
    return {
      died: true,
      reason: context.isSecondTarget 
        ? 'Bị Ma Sói cuồng nộ (Sói Con chết) cắn chết trong đêm'
        : 'Bị Ma Sói cắn chết trong đêm',
      log: `${player.name} bị Ma Sói cắn chết trong đêm!`
    };
  }

  /**
   * Kiểm tra vai này có được phép gán lại cho người khác hay không
   * Luật Ma Sói: Nếu người giữ vai đã hy sinh hoặc bị biến đổi thành Sói ➔ KHÔNG được gán lại
   * @param {Player} player
   * @returns {boolean}
   */
  canBeReassigned(player) {
    return Boolean(player && player.isAlive && !player.isCursedWolf);
  }
}

/**
 * Chiến lược cho Bán Sói (Nửa Người Nửa Sói):
 * - Khi bị cắn trong đêm ➔ Tiên Tri soi ra Sói ngay lập tức
 * - Khi sang ngày ➔ Thức tỉnh gen Sói, gia nhập đàn Sói thay vì tử vong
 */
export class HalfWolfStrategy extends BaseRoleStrategy {
  getSeerAffiliation(player, nightContext = {}) {
    // Nếu đã thức tỉnh từ các đêm trước
    if (player.isCursedWolf) return 'WOLF';

    // Nếu bị Sói cắn ngay trong đêm hiện tại (trước lượt Tiên Tri)
    const isBittenTonight = typeof nightContext.isTargetedByWolves === 'function'
      ? nightContext.isTargetedByWolves(player.id)
      : (
          (nightContext.wolfTargetId === player.id || nightContext.wolfTargetId2 === player.id) &&
          !nightContext.wolfSkipped
        );

    if (isBittenTonight) return 'WOLF';
    return 'VILLAGER';
  }

  onBittenByWolves(player, context = {}) {
    return {
      died: false,
      transformedTo: 'soi-thuong',
      isCursedWolf: true,
      originalRoleId: player.originalRoleId || player.currentRoleId || 'nua-nguoi-nua-soi',
      curseNight: context.roundNumber || 1,
      log: `🐺 BÁN SÓI THỨC TỈNH: ${player.name} (Nửa Người Nửa Sói) bị Ma Sói cắn trong đêm không chết mà đã chính thức thức tỉnh gen Sói, gia nhập đàn Ma Sói của làng!`
    };
  }
}

/**
 * Chiến lược cho Già Làng:
 * - Có 2 mạng trước đòn tấn công của bầy Ma Sói
 */
export class ElderStrategy extends BaseRoleStrategy {
  onBittenByWolves(player, context = {}) {
    const lives = player.elderLives !== undefined ? player.elderLives : 2;
    if (lives > 1) {
      return {
        died: false,
        remainingLives: lives - 1,
        log: `Già Làng ${player.name} bị Ma Sói cắn nhưng đã kiên cường sống sót nhờ mạng sống thứ nhất (Còn 1 mạng)!`
      };
    }
    return {
      died: true,
      reason: 'Già Làng bị Ma Sói cắn mất mạng sống cuối cùng trong đêm',
      log: `Già Làng ${player.name} đã hy sinh trong đêm do bị Ma Sói tấn công!`
    };
  }
}

/**
 * Chiến lược cho Thằng Ngốc:
 * - Được tha bổng khi làng biểu quyết treo cổ lần đầu tiên
 */
export class IdiotStrategy extends BaseRoleStrategy {
  onLynched(player) {
    if (!player.isRevealedIdiot) {
      return {
        survived: true,
        isRevealedIdiot: true,
        log: `⚖️ THẰNG NGỐC THOÁT CHẾT: Làng quyết định treo cổ ${player.name}, nhưng khi bị đưa lên giàn thiêu mới nhận ra đây là Thằng Ngốc! Làng tha bổng nhưng ${player.name} bị tước vĩnh viễn quyền bỏ phiếu!`
      };
    }
    return {
      survived: false,
      reason: 'Thằng Ngốc bị treo cổ lần 2'
    };
  }
}

/**
 * Chiến lược cho Sói Nguyền / Sói Quỷ / Người Cha Của Sói:
 * - Lây nhiễm đồng hóa mục tiêu thay vì cắn chết
 */
export class CursedWolfStrategy extends BaseRoleStrategy {
  onInfectTarget(target, roundNumber = 1) {
    return {
      transformedTo: 'soi-thuong',
      isCursedWolf: true,
      originalRoleId: target.originalRoleId || target.currentRoleId || target.roleId,
      curseNight: roundNumber,
      log: `🔮 SÓI NGUYỀN ĐÃ LÂY NHIỄM: ${target.name} không bị cắn chết mà đã được Sói Nguyền lây nhiễm, trở thành Ma Sói mới của làng!`
    };
  }
}

// Bảng Strategy Registry
const STRATEGIES = {
  'nua-nguoi-nua-soi': new HalfWolfStrategy('nua-nguoi-nua-soi'),
  'gia-lang': new ElderStrategy('gia-lang'),
  'thang-ngoc': new IdiotStrategy('thang-ngoc'),
  'soi-nguyen': new CursedWolfStrategy('soi-nguyen'),
  'soi-quy': new CursedWolfStrategy('soi-quy'),
  'nguoi-cha-cua-soi': new CursedWolfStrategy('nguoi-cha-cua-soi')
};

const DEFAULT_STRATEGY = new BaseRoleStrategy('default');

/**
 * Tra cứu Strategy xử lý hành vi theo vai trò
 * @param {string|null} roleId 
 * @returns {BaseRoleStrategy}
 */
export function getRoleStrategy(roleId) {
  if (!roleId) return DEFAULT_STRATEGY;
  return STRATEGIES[roleId] || new BaseRoleStrategy(roleId);
}
