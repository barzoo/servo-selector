import { Project, AxisConfig, SizingInput, ProjectInfo } from '@/types';

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

  return {
    project: projectInfo,
    mechanism: axis.input.mechanism,
    motion: axis.input.motion,
    duty,
    preferences,
    selections: axis.input.selections,
  } as SizingInput;
}
