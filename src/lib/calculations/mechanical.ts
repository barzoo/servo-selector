// 机械计算模块

import {
  SizingInput,
  MechanicalResult,
  BallScrewParams,
  GearboxParams,
  DirectDriveParams,
  BeltParams,
  RackPinionParams,
} from '@/types';

const G = 9.80665;
const STEEL_DENSITY = 7850;

export class MechanicalCalculator {
  private input: SizingInput;

  constructor(input: SizingInput) {
    this.input = input;
  }

  calculate(): MechanicalResult {
    const inertia = this.calculateInertia();
    const torques = this.calculateTorques();
    const speeds = this.calculateSpeeds();
    const powers = this.calculatePowers(torques, speeds);
    const regeneration = this.calculateRegeneration();

    return {
      loadInertia: inertia.load,
      totalInertia: inertia.total,
      inertiaRatio: 0,
      torques,
      speeds,
      powers,
      regeneration,
    };
  }

  private calculateInertia(): { load: number; total: number } {
    const { type, params } = this.input.mechanism;

    switch (type) {
      case 'BALL_SCREW':
        return this.calcBallScrewInertia(params as BallScrewParams);
      case 'GEARBOX':
        return this.calcGearboxInertia(params as GearboxParams);
      case 'DIRECT_DRIVE':
        return this.calcDirectDriveInertia(params as DirectDriveParams);
      case 'BELT':
        return this.calcBeltInertia(params as BeltParams);
      case 'RACK_PINION':
        return this.calcRackPinionInertia(params as RackPinionParams);
      default:
        throw new Error(`Unsupported mechanism type: ${type}`);
    }
  }

  private calcBallScrewInertia(p: BallScrewParams): { load: number; total: number } {
    const J_load = p.loadMass * Math.pow(p.lead * 1e-3 / (2 * Math.PI * p.gearRatio), 2);
    const J_screw = (Math.PI * STEEL_DENSITY * p.screwLength * 1e-3 * Math.pow(p.screwDiameter * 1e-3, 4)) / 32;

    return {
      load: J_load,
      total: J_load + J_screw / Math.pow(p.gearRatio, 2),
    };
  }

  private calcGearboxInertia(p: GearboxParams): { load: number; total: number } {
    let J_load = 0;

    if (p.loadType === 'TABLE' && p.tableDiameter) {
      J_load = p.loadMass * Math.pow(p.tableDiameter * 1e-3 / 2, 2) / 2;
    } else if (p.loadType === 'DRUM' && p.drumDiameter) {
      J_load = p.loadMass * Math.pow(p.drumDiameter * 1e-3 / 2, 2);
    } else {
      J_load = p.loadMass * Math.pow(p.gravityArmLength * 1e-3, 2);
    }

    return {
      load: J_load / Math.pow(p.gearRatio, 2),
      total: J_load / Math.pow(p.gearRatio, 2),
    };
  }

  private calcDirectDriveInertia(p: DirectDriveParams): { load: number; total: number } {
    if (p.driveType === 'ROTARY' && p.tableDiameter) {
      const J_load = p.loadMass * Math.pow(p.tableDiameter * 1e-3 / 2, 2) / 2;
      return { load: J_load, total: J_load };
    }
    return { load: 0, total: 0 };
  }

  private calcBeltInertia(p: BeltParams): { load: number; total: number } {
    const r = p.pulleyDiameter * 1e-3 / 2;
    const J_load = p.loadMass * r * r;
    const J_belt = p.beltMassPerMeter * p.beltLength * 1e-3 * r * r;

    return {
      load: J_load,
      total: J_load + J_belt,
    };
  }

  private calcRackPinionInertia(p: RackPinionParams): { load: number; total: number } {
    const r = p.pinionDiameter * 1e-3 / 2;
    const J_load = p.loadMass * r * r / Math.pow(p.gearRatio, 2);

    return {
      load: J_load,
      total: J_load,
    };
  }

  private calculateTorques() {
    const times = this.calculateMotionTimes();
    const maxSpeedRad = this.getMaxAngularSpeed();
    const alpha = maxSpeedRad / times.accel;

    const inertia = this.calculateInertia();
    const T_friction = this.calculateFrictionTorque();
    const T_gravity = this.calculateGravityTorque();

    const T_accel = inertia.total * alpha / this.getEfficiency() + T_friction + T_gravity;
    const T_constant = T_friction + T_gravity;
    const T_decel = -inertia.total * alpha / this.getEfficiency() + T_friction + T_gravity;

    const T_peak = Math.max(Math.abs(T_accel), Math.abs(T_constant), Math.abs(T_decel));

    const T_rms = Math.sqrt(
      (Math.pow(T_accel, 2) * times.accel +
        Math.pow(T_constant, 2) * times.constant +
        Math.pow(T_decel, 2) * times.decel) /
      (times.accel + times.constant + times.decel + times.dwell)
    );

    return {
      accel: T_accel,
      constant: T_constant,
      decel: T_decel,
      peak: T_peak,
      rms: T_rms,
    };
  }

  private calculateMotionTimes(): { accel: number; constant: number; decel: number; dwell: number } {
    const { motion } = this.input;
    const v = motion.maxVelocity * 1e-3;
    const a = motion.maxAcceleration * 1e-3;
    const s = motion.stroke * 1e-3;

    const t_accel = v / a;
    const s_accel = 0.5 * a * t_accel * t_accel;

    if (2 * s_accel <= s) {
      const s_constant = s - 2 * s_accel;
      const t_constant = s_constant / v;
      return {
        accel: t_accel,
        constant: t_constant,
        decel: t_accel,
        dwell: motion.dwellTime,
      };
    } else {
      const t_peak = Math.sqrt(s / a);
      return {
        accel: t_peak,
        constant: 0,
        decel: t_peak,
        dwell: motion.dwellTime,
      };
    }
  }

  private calculateFrictionTorque(): number {
    const { type, params } = this.input.mechanism;

    switch (type) {
      case 'BALL_SCREW': {
        const p = params as BallScrewParams;
        const F_friction = p.frictionCoeff * p.loadMass * G;
        return F_friction * (p.lead * 1e-3) / (2 * Math.PI * p.efficiency * p.gearRatio);
      }
      case 'GEARBOX': {
        const p = params as GearboxParams;
        return p.frictionTorque / (p.gearRatio * p.efficiency);
      }
      case 'RACK_PINION': {
        const p = params as RackPinionParams;
        const F_friction = p.frictionCoeff * p.loadMass * G * Math.cos(p.mountingAngle * Math.PI / 180);
        return F_friction * (p.pinionDiameter * 1e-3 / 2) / (p.gearRatio * p.efficiency);
      }
      default:
        return 0;
    }
  }

  private calculateGravityTorque(): number {
    const { type, params } = this.input.mechanism;
    const { duty } = this.input;

    if (duty.mountingOrientation === 'HORIZONTAL') return 0;

    switch (type) {
      case 'BALL_SCREW': {
        const p = params as BallScrewParams;
        const F_gravity = p.loadMass * G;
        const torque = F_gravity * (p.lead * 1e-3) / (2 * Math.PI * p.gearRatio);
        return duty.mountingOrientation === 'VERTICAL_UP' ? torque : -torque;
      }
      case 'GEARBOX': {
        const p = params as GearboxParams;
        const T_gravity = p.loadMass * G * (p.gravityArmLength * 1e-3);
        return T_gravity / (p.gearRatio * p.efficiency);
      }
      case 'RACK_PINION': {
        const p = params as RackPinionParams;
        const F_gravity = p.loadMass * G * Math.sin(p.mountingAngle * Math.PI / 180);
        return F_gravity * (p.pinionDiameter * 1e-3 / 2) / (p.gearRatio * p.efficiency);
      }
      default:
        return 0;
    }
  }

  private calculateSpeeds() {
    const maxSpeed = this.getMaxAngularSpeed() * 60 / (2 * Math.PI);

    return {
      max: maxSpeed,
      rms: maxSpeed * 0.7,
    };
  }

  private calculatePowers(torques: { peak: number; rms: number }, speeds: { max: number; rms: number }) {
    return {
      peak: (torques.peak * speeds.max * 2 * Math.PI) / 60,
      continuous: (torques.rms * speeds.rms * 2 * Math.PI) / 60,
    };
  }

  /**
   * 计算每分钟制动次数
   * 基于运动周期计算
   *
   * @returns 每分钟制动次数
   */
  private calculateCyclesPerMinute(): number {
    const { motion } = this.input;
    const cycleTimeSeconds = motion.cycleTime;

    if (cycleTimeSeconds <= 0) return 0;

    return 60 / cycleTimeSeconds;
  }

  private calculateRegeneration() {
    const inertia = this.calculateInertia();
    const maxSpeedRad = this.getMaxAngularSpeed();
    const times = this.calculateMotionTimes();

    // 计算每分钟制动次数
    const cyclesPerMinute = this.calculateCyclesPerMinute();

    // 计算单次制动能量
    const E_kinetic = 0.5 * inertia.total * maxSpeedRad * maxSpeedRad;

    // 计算平均制动功率（基于减速时间）
    const P_brake = times.decel > 0 ? E_kinetic / times.decel : 0;

    return {
      energyPerCycle: E_kinetic,
      brakingPower: P_brake,
      cyclesPerMinute,
      requiresExternalResistor: false,
    };
  }

  private getMaxAngularSpeed(): number {
    const { type, params } = this.input.mechanism;
    const { motion } = this.input;

    const v = motion.maxVelocity * 1e-3;

    switch (type) {
      case 'BALL_SCREW': {
        const p = params as BallScrewParams;
        return (v * 2 * Math.PI * p.gearRatio) / (p.lead * 1e-3);
      }
      case 'GEARBOX':
      case 'DIRECT_DRIVE': {
        const p = params as GearboxParams | DirectDriveParams;
        const ratio = 'gearRatio' in p ? p.gearRatio : 1;
        return (v * 2 * Math.PI * ratio);
      }
      case 'BELT': {
        const p = params as BeltParams;
        return v / (p.pulleyDiameter * 1e-3 / 2);
      }
      case 'RACK_PINION': {
        const p = params as RackPinionParams;
        return (v * p.gearRatio) / (p.pinionDiameter * 1e-3 / 2);
      }
      default:
        return 0;
    }
  }

  private getEfficiency(): number {
    const { params } = this.input.mechanism;
    return 'efficiency' in params ? params.efficiency : 0.9;
  }

  private getLoadMass(): number {
    const { params } = this.input.mechanism;
    return 'loadMass' in params ? params.loadMass : 0;
  }
}
