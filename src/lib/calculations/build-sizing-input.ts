import { Project, AxisConfig, SizingInput, ProjectInfo, MotionParams, MechanismType } from '@/types';

/**
 * 根据传动类型确定运动参数类型
 */
function getMotionTypeForMechanism(mechanismType: MechanismType): 'LINEAR' | 'ROTARY' | 'BELT' {
  switch (mechanismType) {
    case 'BALL_SCREW':
    case 'RACK_PINION':
      return 'LINEAR';

    case 'GEARBOX':
      return 'ROTARY';

    case 'DIRECT_DRIVE':
      // 根据 driveType 判断，但默认为 ROTARY
      return 'ROTARY';

    case 'BELT':
      return 'BELT';

    default:
      return 'LINEAR';
  }
}

/**
 * 构建默认运动参数
 */
export function buildDefaultMotionParams(mechanismType: MechanismType): MotionParams {
  const motionType = getMotionTypeForMechanism(mechanismType);

  switch (motionType) {
    case 'LINEAR':
      return {
        motionType: 'LINEAR',
        stroke: 500,
        maxVelocity: 500,
        maxAcceleration: 5000,
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };

    case 'ROTARY':
      return {
        motionType: 'ROTARY',
        rotationAngle: 360,  // 一整圈
        maxVelocity: 60,     // 60 rpm
        maxAcceleration: 300, // rad/s²
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };

    case 'BELT':
      return {
        motionType: 'BELT',
        stroke: 1000,
        maxVelocity: 1000,
        maxAcceleration: 5000,
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };
  }
}

/**
 * 合并项目公共参数和轴特有参数，生成完整的 SizingInput
 * Complexity: O(1)
 */
export function buildSizingInput(
  project: Project,
  axis: AxisConfig
): SizingInput {
  const projectInfo: ProjectInfo = {
    name: project.name,
    customer: project.customer,
    salesPerson: project.salesPerson,
    notes: project.notes,
  };

  // 合并工作条件：轴特有 + 公共参数
  const dutyConditions = axis.input.dutyConditions;
  const duty = dutyConditions
    ? {
        ...dutyConditions,
        ambientTemp: project.commonParams.ambientTemp,
        ipRating: project.commonParams.ipRating,
      }
    : {
        dutyCycle: 100,
        mountingOrientation: 'HORIZONTAL' as const,
        brake: false,
        keyShaft: 'L' as const,
        ambientTemp: project.commonParams.ambientTemp,
        ipRating: project.commonParams.ipRating,
      };

  // 合并系统偏好：轴特有 + 公共参数
  const axisPreferences = axis.input.preferences;
  const preferences = {
    safetyFactor: project.commonParams.safetyFactor,
    maxInertiaRatio: project.commonParams.maxInertiaRatio,
    targetInertiaRatio: project.commonParams.targetInertiaRatio,
    communication: project.commonParams.communication,
    cableLength: project.commonParams.cableLength,
    encoderType: (axisPreferences?.encoderType ?? 'BOTH') as 'A' | 'B' | 'BOTH',
    safety: (axisPreferences?.safety ?? 'NONE') as 'STO' | 'NONE',
  };

  // 确保 motion 有 motionType 字段（向后兼容）
  const motion = axis.input.motion;
  const motionWithType: MotionParams = motion
    ? {
        ...motion,
        motionType: (motion as any).motionType || getMotionTypeForMechanism(axis.input.mechanism!.type),
      }
    : buildDefaultMotionParams(axis.input.mechanism!.type);

  return {
    project: projectInfo,
    mechanism: axis.input.mechanism,
    motion: motionWithType,
    duty,
    preferences,
    selections: axis.input.selections,
  } as SizingInput;
}
