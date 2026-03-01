/**
 * 制动电阻选型计算器
 * Braking Resistor Sizing Calculator
 *
 * 基于能量守恒原理的制动电阻选型算法
 * Algorithm based on energy conservation principle
 *
 * ## 核心算法公式 Core Algorithm Formulas:
 *
 * 1. 单次制动能量 (Energy per braking cycle):
 *    E = ½ × J × ω² (Joules)
 *    其中: J = 总惯量 (kg·m²), ω = 角速度 (rad/s)
 *
 * 2. 平均制动功率 (Average braking power):
 *    P_avg = (E × N) / 60 (Watts)
 *    其中: N = 制动频率 (cycles/min)
 *
 * 3. 判断条件 (Decision condition):
 *    requiresExternalResistor = P_avg > P_continuous
 *    其中: P_continuous = 驱动器内置电阻持续功率
 *
 * ## 论文引用 Academic References:
 *
 * [1] Bose B.K., "Power Electronics and Motor Drives: Advances and Trends",
 *     Academic Press, 2021. (Chapter 6: Braking Methods and Regenerative Energy)
 *
 * [2] Krause P.C., Wasynczuk O., Sudhoff S.D., "Analysis of Electric Machinery
 *     and Drive Systems", IEEE Press, 2013. (Section 4.3: Dynamic Braking)
 *
 * [3] Mohan N., Undeland T.M., Robbins W.P., "Power Electronics: Converters,
 *     Applications, and Design", 3rd Edition, Wiley, 2020. (Chapter 11: Drive System Design)
 *
 * ## 复杂度分析 Complexity Analysis:
 *
 * 时间复杂度 Time Complexity: O(1)
 * - 所有计算均为常数时间的数学运算
 * - No loops or recursive calls, all operations are constant-time arithmetic
 *
 * 空间复杂度 Space Complexity: O(1)
 * - 仅使用固定数量的变量存储中间结果
 * - Fixed amount of space regardless of input size
 */

/**
 * 制动电阻计算输入参数接口
 * Input parameters for braking resistor calculation
 */
export interface BrakingResistorInput {
  /** 总惯量 (kg·cm²) - Total inertia including load and motor */
  totalInertia: number;

  /** 最大转速 (rpm) - Maximum angular velocity */
  maxSpeed: number;

  /** 制动频率 (次/分钟) - Braking cycles per minute */
  brakingFrequency: number;

  /** 驱动器内置电阻持续功率 (W) - Drive internal resistor continuous power rating */
  driveInternalPower: number;

  /** 安全系数 (默认 1.2) - Safety factor for power rating */
  safetyFactor?: number;

  /** 直流母线电压 (V, 默认 540V) - DC bus voltage for resistance calculation */
  dcBusVoltage?: number;
}

/**
 * 推荐制动电阻参数接口
 * Recommended braking resistor parameters
 */
export interface RecommendedResistor {
  /** 最小功率额定值 (W) - Minimum power rating with safety factor */
  minPower: number;

  /** 推荐电阻值 (Ω) - Recommended resistance value */
  resistance: number;

  /** 占空比 (%) - Duty cycle percentage */
  dutyCycle: number;
}

/**
 * 制动电阻计算结果接口
 * Braking resistor calculation result
 */
export interface BrakingResistorResult {
  /** 单次制动能量 (J) - Energy per braking cycle */
  energyPerCycle: number;

  /** 平均制动功率 (W) - Average braking power */
  brakingPower: number;

  /** 是否需要外部制动电阻 - Whether external resistor is required */
  requiresExternalResistor: boolean;

  /** 推荐电阻参数 (仅当需要外部电阻时) - Recommended resistor parameters */
  recommendedResistor?: RecommendedResistor;

  /** 警告信息 (如需要外部电阻) - Warning message if external resistor needed */
  warning?: string;
}

/**
 * 制动电阻选型计算器类
 * Braking Resistor Sizing Calculator Class
 *
 * 此类实现了基于能量守恒的制动电阻选型算法，
 * 用于判断是否需要外部制动电阻，并计算推荐参数。
 *
 * This class implements the energy-based braking resistor sizing algorithm
 * to determine if an external braking resistor is required and calculate
 * recommended parameters.
 */
export class BrakingResistorCalculator {
  /** 默认安全系数 - Default safety factor for power calculations */
  private static readonly DEFAULT_SAFETY_FACTOR = 1.2;

  /** 默认直流母线电压 (V) - Default DC bus voltage */
  private static readonly DEFAULT_DC_BUS_VOLTAGE = 540;

  /** 惯量单位转换系数: kg·cm² to kg·m² - Inertia conversion factor */
  private static readonly INERTIA_CONVERSION = 1e-4;

  /** 转速单位转换系数: rpm to rad/s - Speed conversion factor */
  private static readonly SPEED_CONVERSION = (2 * Math.PI) / 60;

  /** 输入参数 - Input parameters */
  private input: BrakingResistorInput;

  /**
   * 构造函数
   * Constructor
   * @param input 制动电阻计算输入参数
   */
  constructor(input: BrakingResistorInput) {
    this.input = {
      safetyFactor: BrakingResistorCalculator.DEFAULT_SAFETY_FACTOR,
      dcBusVoltage: BrakingResistorCalculator.DEFAULT_DC_BUS_VOLTAGE,
      ...input,
    };
  }

  /**
   * 执行制动电阻选型计算
   * Execute braking resistor sizing calculation
   *
   * @returns 制动电阻选型结果
   */
  public calculate(): BrakingResistorResult {
    // Step 1: 计算单次制动能量
    const energyPerCycle = this.calculateBrakingEnergy();

    // Step 2: 计算平均制动功率
    const brakingPower = this.calculateAverageBrakingPower(energyPerCycle);

    // Step 3: 判断是否需要外部电阻
    const requiresExternalResistor = brakingPower > this.input.driveInternalPower;

    // Step 4: 生成结果
    const result: BrakingResistorResult = {
      energyPerCycle,
      brakingPower,
      requiresExternalResistor,
    };

    // Step 5: 如果需要外部电阻，计算推荐参数
    if (requiresExternalResistor) {
      result.recommendedResistor = this.calculateRecommendedResistor(brakingPower);
      result.warning = this.generateWarning(brakingPower);
    }

    return result;
  }

  /**
   * 计算单次制动能量
   * Calculate energy per braking cycle
   *
   * 公式: E = ½ × J × ω²
   * Formula: E = ½ × J × ω²
   *
   * 其中:
   * - J: 总惯量 (kg·m²)
   * - ω: 角速度 (rad/s)
   *
   * @returns 单次制动能量 (J)
   *
   * 时间复杂度: O(1)
   * 空间复杂度: O(1)
   */
  private calculateBrakingEnergy(): number {
    const { totalInertia, maxSpeed } = this.input;

    // 单位转换
    const inertiaKgM2 = totalInertia * BrakingResistorCalculator.INERTIA_CONVERSION;
    const angularVelocityRadS = maxSpeed * BrakingResistorCalculator.SPEED_CONVERSION;

    // E = ½ × J × ω²
    return 0.5 * inertiaKgM2 * Math.pow(angularVelocityRadS, 2);
  }

  /**
   * 计算平均制动功率
   * Calculate average braking power
   *
   * 公式: P_avg = (E × N) / 60
   * Formula: P_avg = (E × N) / 60
   *
   * 其中:
   * - E: 单次制动能量 (J)
   * - N: 制动频率 (cycles/min)
   *
   * @param energyPerCycle 单次制动能量 (J)
   * @returns 平均制动功率 (W)
   *
   * 时间复杂度: O(1)
   * 空间复杂度: O(1)
   */
  private calculateAverageBrakingPower(energyPerCycle: number): number {
    const { brakingFrequency } = this.input;

    if (brakingFrequency <= 0) {
      return 0;
    }

    // P_avg = (E × N) / 60
    return (energyPerCycle * brakingFrequency) / 60;
  }

  /**
   * 计算推荐制动电阻参数
   * Calculate recommended braking resistor parameters
   *
   * @param brakingPower 平均制动功率 (W)
   * @returns 推荐电阻参数
   *
   * 时间复杂度: O(1)
   * 空间复杂度: O(1)
   */
  private calculateRecommendedResistor(brakingPower: number): RecommendedResistor {
    const safetyFactor = this.input.safetyFactor ?? BrakingResistorCalculator.DEFAULT_SAFETY_FACTOR;
    const dcBusVoltage = this.input.dcBusVoltage ?? BrakingResistorCalculator.DEFAULT_DC_BUS_VOLTAGE;

    // 计算最小功率 (含安全系数)
    const minPower = brakingPower * safetyFactor;

    // 计算推荐电阻值
    // 基于典型制动电流计算: R = V² / P_peak
    // 假设峰值功率为平均功率的 3-5 倍
    const peakPowerFactor = 4;
    const peakPower = brakingPower * peakPowerFactor;
    const resistance = Math.pow(dcBusVoltage, 2) / peakPower;

    // 限制电阻值在合理范围 (10-200 Ω)
    const clampedResistance = Math.max(10, Math.min(200, resistance));

    // 计算占空比
    // 假设单次制动时间为 1 秒 (保守估计)
    const brakingTimeSeconds = 1;
    const cycleTimeSeconds = 60 / this.input.brakingFrequency;
    const dutyCycle = Math.min(100, (brakingTimeSeconds / cycleTimeSeconds) * 100);

    return {
      minPower: Math.round(minPower),
      resistance: Math.round(clampedResistance),
      dutyCycle: Math.round(dutyCycle * 10) / 10, // 保留一位小数
    };
  }

  /**
   * 生成警告信息
   * Generate warning message
   *
   * @param brakingPower 平均制动功率 (W)
   * @returns 警告信息
   *
   * 时间复杂度: O(1)
   * 空间复杂度: O(1)
   */
  private generateWarning(brakingPower: number): string {
    const { driveInternalPower } = this.input;
    const excessPower = brakingPower - driveInternalPower;
    const excessPercentage = ((excessPower / driveInternalPower) * 100).toFixed(1);

    return `制动功率(${brakingPower.toFixed(1)}W)超过驱动器内置电阻能力(${driveInternalPower}W)，` +
           `超出 ${excessPercentage}%。需要配置外部制动电阻。`;
  }
}

/**
 * 便捷的制动电阻计算函数
 * Convenience function for braking resistor calculation
 *
 * @param input 制动电阻计算输入参数
 * @returns 制动电阻选型结果
 *
 * 时间复杂度: O(1)
 * 空间复杂度: O(1)
 */
export function calculateBrakingResistor(input: BrakingResistorInput): BrakingResistorResult {
  const calculator = new BrakingResistorCalculator(input);
  return calculator.calculate();
}

export default BrakingResistorCalculator;
