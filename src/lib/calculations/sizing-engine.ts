// 选型引擎主类

import { SizingInput, SizingResult, SizingFailureReason, MC20Motor, XC20Drive, BrakeResistor, MechanicalResult, SystemConfiguration } from '@/types';

// Full preferences type including common params (safetyFactor, etc.)
type FullPreferences = SizingInput['preferences'];
import { MechanicalCalculator } from './mechanical';
import { MotorFilter } from './motor-filter';
import { PartNumberGenerator } from './part-number-generator';
import { BrakingResistorCalculator } from './braking-resistor';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';
import resistorsData from '@/data/resistors.json';

export class SizingEngine {
  private motors: MC20Motor[];
  private drives: XC20Drive[];
  private resistors: BrakeResistor[];
  private pnGenerator: PartNumberGenerator;

  constructor() {
    this.motors = motorsData.motors as unknown as MC20Motor[];
    this.drives = drivesData.drives as unknown as XC20Drive[];
    this.resistors = resistorsData.resistors as BrakeResistor[];
    this.pnGenerator = new PartNumberGenerator();
  }

  calculate(input: SizingInput): SizingResult {
    const startTime = performance.now();

    // 1. 机械计算
    const mechanicalCalc = new MechanicalCalculator(input);
    const mechanical = mechanicalCalc.calculate();

    // 2. 电机筛选
    const motorFilter = new MotorFilter(mechanical, input.preferences, input.duty);
    const motorRecommendations = motorFilter.filter();

    // 3. 诊断无结果情况
    let failureReason: SizingFailureReason | undefined;
    if (motorRecommendations.length === 0) {
      failureReason = this.diagnoseFailure(mechanical, input.preferences);
    }

    // 4. 为每个推荐电机计算完整系统配置
    const recommendations = motorRecommendations.map((rec) => {
      const drive = this.matchDrive(rec.motor, input.preferences);
      const brakeResistor = this.calculateBrakeResistor(mechanical, drive, input.motion.cycleTime);

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
          },
          calculations: {
            requiredTorque: mechanical.torques.rms * input.preferences.safetyFactor,
            requiredSpeed: mechanical.speeds.max,
            safetyFactor: input.preferences.safetyFactor,
          },
        },
      };
    });

    // 5. 如果用户已做选择，生成完整系统配置
    let systemConfiguration: SystemConfiguration | undefined = undefined;
    if (input.selections && motorRecommendations.length > 0) {
      const selectedMotor = this.motors.find(m => m.id === input.selections!.motorId)
        || motorRecommendations[0].motor;
      systemConfiguration = this.buildSystemConfiguration(
        selectedMotor,
        input.selections,
        mechanical
      );
    }

    const calculationTime = performance.now() - startTime;

    return {
      mechanical,
      motorRecommendations: recommendations,
      failureReason,
      systemConfiguration,
      metadata: {
        calculationTime,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private buildSystemConfiguration(
    motor: MC20Motor,
    selections: NonNullable<SizingInput['selections']>,
    mechanical: MechanicalResult
  ): SystemConfiguration {
    // 找到匹配的驱动器
    const drive = this.drives.find(d =>
      motor.matchedDrives.some(md => d.baseModel.includes(md) || d.model.includes(md))
    ) || this.drives[0];

    // 生成订货号
    const motorPN = this.pnGenerator.generateMotorPN(motor, selections.motorOptions);
    const drivePN = this.pnGenerator.generateDrivePN(drive, selections.driveOptions);

    // 确定电缆规格
    const motorCableSpec = this.pnGenerator.getMotorCableSpec(motor.ratedPower);
    const encoderCableSpec = this.pnGenerator.getEncoderCableSpec(selections.motorOptions.encoderType);

    // 生成电缆订货号
    const motorCablePN = this.pnGenerator.generateCablePN(
      'motor',
      motorCableSpec,
      selections.cables.motorLength,
      selections.motorOptions.brake
    );
    const encoderCablePN = this.pnGenerator.generateCablePN(
      'encoder',
      encoderCableSpec,
      selections.cables.encoderLength
    );

    // 计算制动电阻 - 使用默认周期时间 2s 作为回退
    const cycleTime = 2; // 默认值，因为 buildSystemConfiguration 没有访问 input 的权限
    const brakeResistor = this.calculateBrakeResistor(mechanical, drive, cycleTime);

    return {
      motor: {
        model: motor.baseModel,
        partNumber: motorPN,
        options: selections.motorOptions,
      },
      drive: {
        model: drive.baseModel,
        partNumber: drivePN,
        options: selections.driveOptions,
      },
      cables: {
        motor: {
          spec: motorCableSpec,
          length: selections.cables.motorLength,
          partNumber: motorCablePN,
        },
        encoder: {
          spec: encoderCableSpec,
          length: selections.cables.encoderLength,
          partNumber: encoderCablePN,
        },
        ...(selections.driveOptions.communication !== 'ANALOG' && {
          communication: {
            length: selections.cables.commLength || selections.cables.motorLength,
            partNumber: `CAB-COM-${selections.driveOptions.communication}-${selections.cables.commLength || selections.cables.motorLength}`,
          },
        }),
      },
      accessories: {
        ...(brakeResistor && {
          brakeResistor: {
            model: brakeResistor.model,
            partNumber: brakeResistor.model,
          },
        }),
      },
    };
  }

  private diagnoseFailure(
    mechanical: MechanicalResult,
    preferences: FullPreferences
  ): SizingFailureReason {
    const requiredTorque = mechanical.torques.rms * preferences.safetyFactor;
    const requiredPeakTorque = mechanical.torques.peak * preferences.safetyFactor;
    const requiredSpeed = mechanical.speeds.max * 1.1;

    // 找出最大可用规格
    const maxRatedTorque = Math.max(...this.motors.map((m) => m.ratedTorque));
    const maxPeakTorque = Math.max(...this.motors.map((m) => m.peakTorque));
    const maxSpeed = Math.max(...this.motors.map((m) => m.maxSpeed));

    // 按优先级检查失败原因
    if (requiredTorque > maxRatedTorque) {
      return {
        type: 'TORQUE',
        message: '所需连续扭矩超过所有可用电机范围',
      };
    }

    if (requiredPeakTorque > maxPeakTorque) {
      return {
        type: 'PEAK_TORQUE',
        message: '所需峰值扭矩超过所有可用电机范围',
      };
    }

    if (requiredSpeed > maxSpeed) {
      return {
        type: 'SPEED',
        message: '所需转速超过所有可用电机范围',
      };
    }


    return {
      type: 'TORQUE',
      message: '无满足所有条件的电机，建议调整工况参数',
    };
  }

  private matchDrive(motor: MC20Motor, preferences: FullPreferences): XC20Drive {
    // 从电机的 matchedDrives 中提取基础型号 (如 XC20-W0005CRN)
    const matchedBaseModels = motor.matchedDrives.map(md => {
      // 提取前两部分: XC20-W0005CRN
      const parts = md.split('-');
      return parts.slice(0, 2).join('-');
    });

    // 筛选匹配的驱动器
    const compatibleDrives = this.drives.filter((d) =>
      matchedBaseModels.some(bm => d.baseModel === bm || d.model.startsWith(bm))
    );

    // 筛选支持所需通讯协议的驱动器
    const withComm = compatibleDrives.filter((d) =>
      d.communication.type === preferences.communication
    );

    // 根据 safety 选项筛选驱动器
    const safetyCode = preferences.safety === 'STO' ? 'T0' : 'NN';
    const withSafety = withComm.filter((d) =>
      d.options.safety.code === safetyCode
    );

    // 选择功率等级最小的满足需求的驱动器 (using maxCurrent as proxy for power rating)
    const selected = withSafety.sort((a, b) => a.maxCurrent - b.maxCurrent)[0];

    // 如果没有找到匹配的驱动器，返回第一个兼容的驱动器（降级处理）
    if (!selected && compatibleDrives.length > 0) {
      return compatibleDrives.sort((a, b) => a.maxCurrent - b.maxCurrent)[0];
    }

    return selected;
  }

  private calculateBrakeResistor(
    mechanical: MechanicalResult,
    drive: XC20Drive,
    cycleTime: number
  ): BrakeResistor | undefined {
    // 使用新的制动电阻计算器
    const brakingCalculator = new BrakingResistorCalculator({
      totalInertia: mechanical.totalInertia,
      maxSpeed: mechanical.speeds.max,
      brakingFrequency: 60 / cycleTime,
      driveInternalPower: drive.braking.continuousPower,
    });

    // 执行制动电阻计算
    const regenerationResult = brakingCalculator.calculate();

    // 更新 mechanical 结果中的再生能量信息
    mechanical.regeneration = {
      ...mechanical.regeneration,
      ...regenerationResult,
    };

    // 如果不需要外部电阻，返回 undefined
    if (!regenerationResult.requiresExternalResistor) {
      return undefined;
    }

    // 从电阻库中选择合适的型号
    const requiredPower = regenerationResult.recommendedResistor!.minPower;

    const suitableResistor = this.resistors
      .filter((r) => r.continuousPower >= requiredPower)
      .sort((a, b) => a.continuousPower - b.continuousPower)[0];

    return suitableResistor;
  }
}
