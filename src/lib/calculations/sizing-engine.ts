// 选型引擎主类

import { SizingInput, SizingResult, MC20Motor, XC20Drive, BrakeResistor, SystemPreferences, MechanicalResult } from '@/types';
import { MechanicalCalculator } from './mechanical';
import { MotorFilter } from './motor-filter';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';
import resistorsData from '@/data/resistors.json';

export class SizingEngine {
  private motors: MC20Motor[];
  private drives: XC20Drive[];
  private resistors: BrakeResistor[];

  constructor() {
    this.motors = motorsData.motors as MC20Motor[];
    this.drives = drivesData.drives as XC20Drive[];
    this.resistors = resistorsData.resistors as BrakeResistor[];
  }

  calculate(input: SizingInput): SizingResult {
    const startTime = performance.now();

    // 1. 机械计算
    const mechanicalCalc = new MechanicalCalculator(input);
    const mechanical = mechanicalCalc.calculate();

    // 2. 电机筛选
    const motorFilter = new MotorFilter(mechanical, input.preferences);
    const motorRecommendations = motorFilter.filter();

    // 3. 为每个推荐电机计算完整系统配置
    const recommendations = motorRecommendations.map((rec) => {
      const drive = this.matchDrive(rec.motor, input.preferences);
      const brakeResistor = this.calculateBrakeResistor(mechanical, drive);

      // 更新惯量比
      const inertiaRatio = mechanical.totalInertia / rec.motor.rotorInertia;

      return {
        ...rec,
        safetyMargins: {
          ...rec.safetyMargins,
          inertia: Math.round(inertiaRatio * 10) / 10,
        },
        systemConfig: {
          motor: rec.motor,
          drive,
          accessories: {
            motorCable: {
              type: 'MOTOR' as const,
              model: 'CAB-MOT-04',
              length: input.preferences.cableLength,
              isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
            },
            encoderCable: {
              type: 'ENCODER' as const,
              model: 'CAB-ENC-STD',
              length: input.preferences.cableLength,
              isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
            },
            commCable:
              input.preferences.communication !== 'ANALOG'
                ? {
                    type: 'COMMUNICATION' as const,
                    model: `CAB-COM-${input.preferences.communication}`,
                    length: input.preferences.cableLength,
                    isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
                  }
                : undefined,
            brakeResistor,
            emcFilter: input.preferences.emcFilter === 'C3' ? 'EMC-C3-004' : undefined,
          },
          calculations: {
            requiredTorque: mechanical.torques.rms * input.preferences.safetyFactor,
            requiredSpeed: mechanical.speeds.max,
            safetyFactor: input.preferences.safetyFactor,
          },
        },
      };
    });

    const calculationTime = performance.now() - startTime;

    return {
      mechanical,
      motorRecommendations: recommendations,
      metadata: {
        calculationTime,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private matchDrive(motor: MC20Motor, preferences: SystemPreferences): XC20Drive {
    // 从电机数据获取匹配的驱动器列表
    const compatibleDrives = this.drives.filter((d) =>
      motor.matchedDrives.includes(d.model)
    );

    // 筛选支持所需通讯协议的驱动器
    const withComm = compatibleDrives.filter((d) =>
      d.communicationInterfaces.some((c) => c.type === preferences.communication)
    );

    // 筛选支持所需编码器的驱动器
    const withEncoder = withComm.filter((d) =>
      d.encoderSupport.some((e) => e.type === preferences.encoderType)
    );

    // 选择功率等级最小的满足需求的驱动器
    return withEncoder.sort((a, b) => a.powerRating - b.powerRating)[0];
  }

  private calculateBrakeResistor(
    mechanical: MechanicalResult,
    drive: XC20Drive
  ): BrakeResistor | undefined {
    // 检查内置制动能力是否足够
    if (mechanical.regeneration.brakingPower <= drive.braking.internalResistor) {
      return undefined;
    }

    // 计算所需制动电阻规格
    const requiredPower = mechanical.regeneration.brakingPower * 1.2;

    // 从电阻库中选择合适的型号
    const suitableResistor = this.resistors
      .filter((r) => r.compatibleDrives.includes(drive.model))
      .filter((r) => r.continuousPower >= requiredPower)
      .sort((a, b) => a.continuousPower - b.continuousPower)[0];

    return suitableResistor;
  }
}
