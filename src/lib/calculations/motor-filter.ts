// 电机筛选模块

import { MC20Motor, MechanicalResult, MotorRecommendation, SystemPreferences } from '@/types';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';
import resistorsData from '@/data/resistors.json';

export class MotorFilter {
  private motors: MC20Motor[];
  private mechanical: MechanicalResult;
  private preferences: SystemPreferences;

  constructor(mechanical: MechanicalResult, preferences: SystemPreferences) {
    this.motors = motorsData.motors;
    this.mechanical = mechanical;
    this.preferences = preferences;
  }

  filter(): MotorRecommendation[] {
    const requiredTorque = this.mechanical.torques.rms * this.preferences.safetyFactor;
    const requiredPeakTorque = this.mechanical.torques.peak * this.preferences.safetyFactor;
    const requiredSpeed = this.mechanical.speeds.max * 1.1;

    const candidates = this.motors.filter((motor) => {
      if (motor.ratedTorque < requiredTorque) return false;
      if (motor.peakTorque < requiredPeakTorque) return false;
      if (motor.maxSpeed < requiredSpeed) return false;

      const encoderMatch = motor.encoderOptions.some(
        (e) => e.type === this.preferences.encoderType
      );
      if (!encoderMatch) return false;

      return true;
    });

    const scored = candidates.map((motor) =>
      this.calculateMatchScore(motor, requiredTorque, requiredSpeed)
    );

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, 5);
  }

  private calculateMatchScore(
    motor: MC20Motor,
    requiredTorque: number,
    requiredSpeed: number
  ): MotorRecommendation {
    const warnings: string[] = [];

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

    const speedMargin = (motor.maxSpeed - requiredSpeed) / requiredSpeed;
    const speedScore = Math.min(100, speedMargin * 200);

    const inertiaRatio = this.mechanical.totalInertia / motor.rotorInertia;
    let inertiaScore: number;
    if (inertiaRatio <= 3) {
      inertiaScore = 100;
    } else if (inertiaRatio <= 10) {
      inertiaScore = 100 - (inertiaRatio - 3) * 5.7;
    } else if (inertiaRatio <= 30) {
      inertiaScore = 60 - (inertiaRatio - 10) * 2;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 偏高，可能影响动态性能`);
    } else {
      inertiaScore = 0;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 过高，建议增加减速比`);
    }

    const efficiencyScore = 100;

    const totalScore =
      torqueScore * 0.4 + speedScore * 0.2 + inertiaScore * 0.3 + efficiencyScore * 0.1;

    let feasibility: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (torqueMargin < 0.1 || inertiaRatio > 20) feasibility = 'CRITICAL';
    else if (torqueMargin < 0.3 || inertiaRatio > 10) feasibility = 'WARNING';

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
    };
  }
}
