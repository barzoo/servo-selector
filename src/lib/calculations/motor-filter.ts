// 电机筛选模块

import { MC20Motor, MechanicalResult, MotorRecommendation, SystemPreferences, DutyConditions } from '@/types';
import motorsData from '@/data/motors.json';

export class MotorFilter {
  private motors: MC20Motor[];
  private mechanical: MechanicalResult;
  private preferences: SystemPreferences;
  private duty?: DutyConditions;

  constructor(mechanical: MechanicalResult, preferences: SystemPreferences, duty?: DutyConditions) {
    this.motors = motorsData.motors as unknown as MC20Motor[];
    this.mechanical = mechanical;
    this.preferences = preferences;
    this.duty = duty;
  }

  filter(): MotorRecommendation[] {
    const requiredTorque = this.mechanical.torques.rms * this.preferences.safetyFactor;
    const requiredPeakTorque = this.mechanical.torques.peak * this.preferences.safetyFactor;
    const requiredSpeed = this.mechanical.speeds.max * 1.1;

    // 用户选择的目标惯量比，默认10
    const targetInertiaRatio = this.preferences.targetInertiaRatio || 10;

    let candidates = this.motors.filter((motor) => {
      if (motor.ratedTorque < requiredTorque) return false;
      if (motor.peakTorque < requiredPeakTorque) return false;
      if (motor.maxSpeed < requiredSpeed) return false;

      // 惯量匹配筛选 - 使用用户选择的目标比例
      const inertiaRatio = this.mechanical.totalInertia / motor.rotorInertia;
      if (inertiaRatio > targetInertiaRatio) return false;

      return true;
    });

    // 根据刹车选项筛选
    if (this.duty?.brake !== undefined) {
      candidates = candidates.filter(motor =>
        motor.options.brake.hasBrake === this.duty!.brake
      );
    }

    // 根据电机轴类型筛选
    if (this.duty?.keyShaft !== undefined) {
      candidates = candidates.filter(motor =>
        motor.options.keyShaft.hasKey === (this.duty!.keyShaft === 'K')
      );
    }

    // 根据编码器类型筛选
    if (this.preferences.encoderType && this.preferences.encoderType !== 'BOTH') {
      const targetEncoderType = this.preferences.encoderType === 'A'
        ? 'BATTERY_MULTI_TURN'
        : 'MECHANICAL_MULTI_TURN';

      candidates = candidates.filter(motor =>
        motor.options.encoder.type === targetEncoderType
      );
    }

    const scored = candidates.map((motor) =>
      this.calculateMatchScore(motor, requiredTorque, requiredSpeed, targetInertiaRatio)
    );

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return this.filterByEconomy(scored);
  }

  private filterByEconomy(
    candidates: MotorRecommendation[]
  ): MotorRecommendation[] {
    // 筛选匹配度≥80的高分电机
    const highScoreMotors = candidates.filter((c) => c.matchScore >= 80);

    if (highScoreMotors.length > 0) {
      // 有高分电机，最多返回3个
      return highScoreMotors.slice(0, 3);
    }

    // 无高分电机，保留前2个并标记为警告
    return candidates.slice(0, 2).map((c) => ({
      ...c,
      feasibility: 'WARNING' as const,
      warnings: [...c.warnings, '匹配度较低，建议调整工况参数'],
    }));
  }

  private calculateMatchScore(
    motor: MC20Motor,
    requiredTorque: number,
    requiredSpeed: number,
    targetInertiaRatio: number
  ): MotorRecommendation {
    const warnings: string[] = [];

    // 扭矩匹配分数
    const torqueMargin = (motor.ratedTorque - requiredTorque) / requiredTorque;
    let torqueScore: number;
    if (torqueMargin >= 0.5) {
      torqueScore = 100;
    } else if (torqueMargin >= 0.2) {
      torqueScore = 80 + (torqueMargin - 0.2) * 66;
    } else if (torqueMargin >= 0) {
      torqueScore = 60 + torqueMargin * 100;
      warnings.push('扭矩余量较小，建议确认工况');
    } else {
      torqueScore = 0;
    }

    // 转速匹配分数
    const speedMargin = (motor.maxSpeed - requiredSpeed) / requiredSpeed;
    const speedScore = Math.min(100, speedMargin * 200);

    // 惯量匹配分数 - 基于目标惯量比
    const inertiaRatio = this.mechanical.totalInertia / motor.rotorInertia;
    let inertiaScore: number;

    if (inertiaRatio <= targetInertiaRatio) {
      // 在目标范围内，越接近目标值的60%分数越高（最佳工作点）
      const optimalRatio = targetInertiaRatio * 0.6;
      const ratioDeviation = Math.abs(inertiaRatio - optimalRatio) / optimalRatio;
      inertiaScore = Math.max(60, 100 - ratioDeviation * 40);
    } else {
      inertiaScore = 0;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 超过目标值 ${targetInertiaRatio}:1`);
    }

    // 效率分数（固定）
    const efficiencyScore = 100;

    // 总分数
    const totalScore =
      torqueScore * 0.4 + speedScore * 0.2 + inertiaScore * 0.3 + efficiencyScore * 0.1;

    // 可行性评估
    let feasibility: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (torqueMargin < 0.1 || inertiaRatio > targetInertiaRatio * 0.9) {
      feasibility = 'CRITICAL';
    } else if (torqueMargin < 0.3 || inertiaRatio > targetInertiaRatio * 0.7) {
      feasibility = 'WARNING';
    }

    // 提取可用的编码器类型
    const availableEncoders: Array<'A' | 'B'> = [];
    if (motor.cableSpecs.encoderCable.includes('MCE12') || motor.options.encoder.type === 'BATTERY_MULTI_TURN') {
      availableEncoders.push('A');
    }
    if (motor.cableSpecs.encoderCable.includes('MCE02') || motor.options.encoder.type === 'MECHANICAL_MULTI_TURN') {
      availableEncoders.push('B');
    }

    return {
      motor,
      matchScore: Math.round(totalScore),
      safetyMargins: {
        torque: Math.round(torqueMargin * 100),
        speed: Math.round(speedMargin * 100),
        inertia: Math.round(inertiaRatio * 10) / 10,
      },
      feasibility,
      warnings,
      availableOptions: {
        encoders: availableEncoders.length > 0 ? availableEncoders : ['A', 'B'],
        hasBrakeOption: motor.options.brake.hasBrake || motor.rotorInertiaWithBrake !== motor.rotorInertia,
        hasKeyOption: motor.options.keyShaft.hasKey,
        matchedDrives: motor.matchedDrives,
      },
    };
  }
}
