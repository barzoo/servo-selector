/**
 * 计算详情数值格式化工具函数和数据提取函数
 *
 * 论文引用:
 * - 数值格式化遵循 IEEE 754 双精度浮点数标准
 * - 工程数值表示参考 ISO 80000-1 量与单位标准
 * - 机械惯量计算参考《机械设计手册》第5卷
 *
 * 复杂度分析:
 * - 所有格式化函数时间复杂度: O(1)
 * - 所有格式化函数空间复杂度: O(1)
 * - 数据提取函数时间复杂度: O(1)
 * - 数据提取函数空间复杂度: O(1)
 */

import type {
  SizingInput,
  MechanicalResult,
  MechanismType,
  BallScrewParams,
  GearboxParams,
  DirectDriveParams,
  BeltParams,
  RackPinionParams,
} from '@/types';

// ============ 类型定义 ============

/**
 * 计算详情接口
 * 包含机械参数、惯量计算、扭矩分析、运动参数、功率与能量等完整计算信息
 */
export interface CalculationDetails {
  /** 机械参数 */
  mechanism: {
    type: MechanismType;
    typeLabel: string;
    params: Array<{
      label: string;
      value: number | string;
      unit?: string;
    }>;
  };

  /** 惯量计算结果 */
  inertia: {
    loadInertia: number;           // kg·m²
    components?: Array<{
      name: string;
      value: number;
      unit: string;
    }>;
    totalInertia: number;          // kg·m²
  };

  /** 扭矩分析结果 */
  torques: {
    accel: number;                 // N·m
    constant: number;              // N·m
    decel: number;                 // N·m (负值表示再生)
    peak: number;                  // N·m
    rms: number;                   // N·m
    friction?: number;             // N·m
    gravity?: number;              // N·m
  };

  /** 运动参数 */
  motion: {
    maxSpeed: number;              // rpm
    maxSpeedLinear?: number;       // mm/s (直线运动)
    accelTime: number;             // s
    constantTime: number;          // s
    decelTime: number;             // s
    dwellTime: number;             // s
    cycleTime: number;             // s
    cyclesPerMinute: number;       // 次/分钟
  };

  /** 功率与能量 */
  power: {
    peak: number;                  // W
    continuous: number;            // W
  };
  regeneration: {
    energyPerCycle: number;        // J
    brakingPower: number;          // W
    requiresExternalResistor: boolean;
    recommendedResistor?: {
      minPower: number;            // W
      resistance: number;          // Ω
    };
  };
}

// ============ 数据提取函数 ============

/**
 * 从 SizingInput 和 MechanicalResult 提取完整的计算详情
 *
 * @param input - 选型输入参数
 * @param mechanical - 机械计算结果
 * @returns 完整的计算详情对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1) - 固定字段映射
 * - 空间复杂度: O(1) - 返回固定结构的对象
 */
export function extractCalculationDetails(
  input: Partial<SizingInput>,
  mechanical: MechanicalResult
): CalculationDetails {
  return {
    mechanism: extractMechanismParams(input),
    inertia: extractInertiaResults(mechanical),
    torques: extractTorqueResults(mechanical),
    motion: extractMotionParams(input, mechanical),
    power: extractPowerResults(mechanical),
    regeneration: extractRegenerationResults(mechanical),
  };
}

/**
 * 提取机械参数
 * 根据负载类型（滚珠丝杠、齿轮减速机、直接驱动、同步带、齿条齿轮）提取相应参数
 *
 * @param input - 选型输入参数
 * @returns 机械参数对象，包含类型、类型标签和参数列表
 *
 * 复杂度分析:
 * - 时间复杂度: O(1) - 基于 switch 的固定分支
 * - 空间复杂度: O(1) - 返回固定大小的参数数组
 */
export function extractMechanismParams(input: Partial<SizingInput>): CalculationDetails['mechanism'] {
  if (!input.mechanism) {
    return {
      type: 'BALL_SCREW',
      typeLabel: '滚珠丝杠',
      params: [{ label: '负载质量', value: 0, unit: 'kg' }],
    };
  }
  const { type, params } = input.mechanism;

  // 通用基础参数
  const baseParams: Array<{ label: string; value: number | string; unit?: string }> = [
    { label: '负载质量', value: 'loadMass' in params ? params.loadMass : 0, unit: 'kg' },
  ];

  // 根据类型添加特定参数
  switch (type) {
    case 'BALL_SCREW': {
      const p = params as BallScrewParams;
      return {
        type,
        typeLabel: '滚珠丝杠',
        params: [
          ...baseParams,
          { label: '丝杠导程', value: p.lead, unit: 'mm' },
          { label: '丝杠直径', value: p.screwDiameter, unit: 'mm' },
          { label: '丝杠长度', value: p.screwLength, unit: 'mm' },
          { label: '减速比', value: p.gearRatio },
          { label: '机械效率', value: `${Math.round(p.efficiency * 100)}%` },
          { label: '摩擦系数', value: p.frictionCoeff },
        ],
      };
    }

    case 'GEARBOX': {
      const p = params as GearboxParams;
      const loadTypeLabels: Record<string, string> = {
        TABLE: '转盘',
        DRUM: '滚筒',
        OTHER: '其他',
      };
      const specificParams: Array<{ label: string; value: number | string; unit?: string }> = [
        { label: '负载类型', value: loadTypeLabels[p.loadType] || p.loadType },
      ];

      if (p.loadType === 'TABLE' && p.tableDiameter) {
        specificParams.push({ label: '转盘直径', value: p.tableDiameter, unit: 'mm' });
      } else if (p.loadType === 'DRUM' && p.drumDiameter) {
        specificParams.push({ label: '滚筒直径', value: p.drumDiameter, unit: 'mm' });
      }

      return {
        type,
        typeLabel: '齿轮/减速机',
        params: [
          ...baseParams,
          ...specificParams,
          { label: '减速比', value: p.gearRatio },
          { label: '机械效率', value: `${Math.round(p.efficiency * 100)}%` },
          { label: '摩擦扭矩', value: p.frictionTorque, unit: 'N·m' },
          { label: '重力臂长', value: p.gravityArmLength, unit: 'mm' },
        ],
      };
    }

    case 'DIRECT_DRIVE': {
      const p = params as DirectDriveParams;
      const driveTypeLabels: Record<string, string> = {
        ROTARY: '旋转',
        LINEAR: '直线',
      };
      const specificParams: Array<{ label: string; value: number | string; unit?: string }> = [];

      if (p.driveType === 'ROTARY' && p.tableDiameter) {
        specificParams.push({ label: '转盘直径', value: p.tableDiameter, unit: 'mm' });
      } else if (p.driveType === 'LINEAR' && p.stroke) {
        specificParams.push({ label: '行程', value: p.stroke, unit: 'mm' });
      }

      return {
        type,
        typeLabel: '直接驱动',
        params: [
          ...baseParams,
          { label: '驱动类型', value: driveTypeLabels[p.driveType] || p.driveType },
          ...specificParams,
          { label: '机械效率', value: `${Math.round(p.efficiency * 100)}%` },
        ],
      };
    }

    case 'BELT': {
      const p = params as BeltParams;
      return {
        type,
        typeLabel: '同步带',
        params: [
          ...baseParams,
          { label: '主动轮直径', value: p.pulleyDiameter, unit: 'mm' },
          { label: '从动轮直径', value: p.drivenPulleyDiameter, unit: 'mm' },
          { label: '皮带长度', value: p.beltLength, unit: 'mm' },
          { label: '皮带线密度', value: p.beltMassPerMeter, unit: 'kg/m' },
          { label: '机械效率', value: `${Math.round(p.efficiency * 100)}%` },
          { label: '张紧力', value: p.tensionForce, unit: 'N' },
        ],
      };
    }

    case 'RACK_PINION': {
      const p = params as RackPinionParams;
      return {
        type,
        typeLabel: '齿条齿轮',
        params: [
          ...baseParams,
          { label: '小齿轮直径', value: p.pinionDiameter, unit: 'mm' },
          { label: '减速比', value: p.gearRatio },
          { label: '机械效率', value: `${Math.round(p.efficiency * 100)}%` },
          { label: '摩擦系数', value: p.frictionCoeff },
          { label: '安装角度', value: p.mountingAngle, unit: '°' },
        ],
      };
    }

    default:
      throw new Error(`Unsupported mechanism type: ${type}`);
  }
}

/**
 * 提取运动参数
 * 计算并提取运动时间参数（加速时间、恒速时间、减速时间、停顿时间）
 *
 * @param input - 选型输入参数
 * @param mechanical - 机械计算结果
 * @returns 运动参数对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1) - 固定数学运算
 * - 空间复杂度: O(1) - 返回固定结构的对象
 *
 * 论文引用:
 * - 梯形速度曲线计算参考《伺服系统运动控制技术》第3章
 */
export function extractMotionParams(
  input: Partial<SizingInput>,
  mechanical: MechanicalResult
): CalculationDetails['motion'] {
  if (!input.motion) {
    return {
      maxSpeed: mechanical.speeds.max,
      accelTime: 0,
      constantTime: 0,
      decelTime: 0,
      dwellTime: 0,
      cycleTime: 0,
      cyclesPerMinute: 0,
    };
  }
  const { motion } = input;
  const v = motion.maxVelocity * 1e-3;  // mm/s -> m/s
  const a = motion.maxAcceleration * 1e-3;  // mm/s² -> m/s²
  const s = motion.stroke * 1e-3;  // mm -> m

  // 计算运动时间
  const t_accel = v / a;
  const s_accel = 0.5 * a * t_accel * t_accel;

  let t_constant: number;
  let t_decel: number;
  let t_accel_final: number;

  if (2 * s_accel <= s) {
    // 完整梯形曲线
    const s_constant = s - 2 * s_accel;
    t_constant = s_constant / v;
    t_accel_final = t_accel;
    t_decel = t_accel;
  } else {
    // 三角形曲线（无恒速段）
    const t_peak = Math.sqrt(s / a);
    t_accel_final = t_peak;
    t_constant = 0;
    t_decel = t_peak;
  }

  // 计算每分钟循环次数
  const cyclesPerMinute = motion.cycleTime > 0 ? 60 / motion.cycleTime : 0;

  // 计算最大线速度
  const maxSpeedLinear = motion.maxVelocity;

  return {
    maxSpeed: mechanical.speeds.max,
    maxSpeedLinear,
    accelTime: t_accel_final,
    constantTime: t_constant,
    decelTime: t_decel,
    dwellTime: motion.dwellTime,
    cycleTime: motion.cycleTime,
    cyclesPerMinute: Math.round(cyclesPerMinute),
  };
}

/**
 * 提取惯量计算结果
 *
 * @param mechanical - 机械计算结果
 * @returns 惯量计算结果对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1)
 * - 空间复杂度: O(1)
 */
function extractInertiaResults(mechanical: MechanicalResult): CalculationDetails['inertia'] {
  return {
    loadInertia: mechanical.loadInertia,
    totalInertia: mechanical.totalInertia,
  };
}

/**
 * 提取扭矩分析结果
 *
 * @param mechanical - 机械计算结果
 * @returns 扭矩分析结果对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1)
 * - 空间复杂度: O(1)
 */
function extractTorqueResults(mechanical: MechanicalResult): CalculationDetails['torques'] {
  return {
    accel: mechanical.torques.accel,
    constant: mechanical.torques.constant,
    decel: mechanical.torques.decel,
    peak: mechanical.torques.peak,
    rms: mechanical.torques.rms,
    friction: (mechanical.torques as { friction?: number }).friction,
    gravity: (mechanical.torques as { gravity?: number }).gravity,
  };
}

/**
 * 提取功率计算结果
 *
 * @param mechanical - 机械计算结果
 * @returns 功率计算结果对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1)
 * - 空间复杂度: O(1)
 */
function extractPowerResults(mechanical: MechanicalResult): CalculationDetails['power'] {
  return {
    peak: mechanical.powers.peak,
    continuous: mechanical.powers.continuous,
  };
}

/**
 * 提取再生能量计算结果
 *
 * @param mechanical - 机械计算结果
 * @returns 再生能量计算结果对象
 *
 * 复杂度分析:
 * - 时间复杂度: O(1)
 * - 空间复杂度: O(1)
 */
function extractRegenerationResults(
  mechanical: MechanicalResult
): CalculationDetails['regeneration'] {
  const regen = mechanical.regeneration;
  return {
    energyPerCycle: regen.energyPerCycle,
    brakingPower: regen.brakingPower,
    requiresExternalResistor: regen.requiresExternalResistor,
    recommendedResistor: regen.recommendedResistor
      ? {
          minPower: regen.recommendedResistor.minPower,
          resistance: regen.recommendedResistor.resistance,
        }
      : undefined,
  };
}

/**
 * 格式化惯量值
 * 小于 0.001 的使用科学计数法 (×10⁻⁴)
 *
 * @param value - 惯量值，单位 kg·m²
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatInertia(0.000507) => '5.07×10⁻⁴'
 * - formatInertia(0.015) => '0.0150'
 */
export function formatInertia(value: number): string {
  if (Math.abs(value) > 0 && Math.abs(value) < 0.001) {
    return `${(value * 10000).toFixed(2)}×10⁻⁴`;
  }
  return value.toFixed(4);
}

/**
 * 格式化扭矩值
 * 固定2位小数，正值带+号
 *
 * @param value - 扭矩值，单位 N·m
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatTorque(4.85) => '+4.85'
 * - formatTorque(-3.29) => '-3.29'
 */
export function formatTorque(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

/**
 * 格式化转速
 * 整数显示
 *
 * @param value - 转速值，单位 rpm
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatSpeed(3000.7) => '3001'
 */
export function formatSpeed(value: number): string {
  return Math.round(value).toString();
}

/**
 * 格式化时间
 * 固定2位小数
 *
 * @param value - 时间值，单位 s
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatTime(0.1) => '0.10'
 */
export function formatTime(value: number): string {
  return value.toFixed(2);
}

/**
 * 格式化功率
 * 大于等于100取整，否则1位小数
 *
 * @param value - 功率值，单位 W
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatPower(1520.5) => '1520'
 * - formatPower(50.5) => '50.5'
 */
export function formatPower(value: number): string {
  if (value >= 100) {
    return Math.round(value).toString();
  }
  return value.toFixed(1);
}

/**
 * 格式化能量
 * 固定1位小数
 *
 * @param value - 能量值，单位 J
 * @returns 格式化后的字符串
 *
 * 示例:
 * - formatEnergy(25.6) => '25.6'
 */
export function formatEnergy(value: number): string {
  return value.toFixed(1);
}
