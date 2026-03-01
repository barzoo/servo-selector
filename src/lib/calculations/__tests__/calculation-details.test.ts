import {
  formatInertia,
  formatTorque,
  formatSpeed,
  formatTime,
  formatPower,
  formatEnergy,
  extractCalculationDetails,
  extractMechanismParams,
  extractMotionParams,
} from '../calculation-details';
import type { SizingInput, MechanicalResult } from '@/types';

describe('formatInertia', () => {
  it('应正确格式化小惯量值（小于0.001）使用科学计数法', () => {
    expect(formatInertia(0.000507)).toBe('5.07×10⁻⁴');
  });

  it('应正确格式化大惯量值（大于等于0.001）使用固定小数', () => {
    expect(formatInertia(0.015)).toBe('0.0150');
  });

  it('应正确处理边界值0.001', () => {
    expect(formatInertia(0.001)).toBe('0.0010');
  });

  it('应正确处理0值', () => {
    expect(formatInertia(0)).toBe('0.0000');
  });

  it('应正确处理负数小惯量值', () => {
    expect(formatInertia(-0.000507)).toBe('-5.07×10⁻⁴');
  });
});

describe('formatTorque', () => {
  it('应正确格式化正值扭矩，带+号', () => {
    expect(formatTorque(4.85)).toBe('+4.85');
  });

  it('应正确格式化负值扭矩', () => {
    expect(formatTorque(-3.29)).toBe('-3.29');
  });

  it('应正确处理0值', () => {
    expect(formatTorque(0)).toBe('0.00');
  });

  it('应正确处理负零', () => {
    expect(formatTorque(-0)).toBe('0.00');
  });
});

describe('formatSpeed', () => {
  it('应正确格式化转速为整数', () => {
    expect(formatSpeed(3000.7)).toBe('3001');
  });

  it('应正确格式化整数转速', () => {
    expect(formatSpeed(3000)).toBe('3000');
  });

  it('应正确处理0值', () => {
    expect(formatSpeed(0)).toBe('0');
  });

  it('应正确处理负数转速', () => {
    expect(formatSpeed(-1500.3)).toBe('-1500');
  });
});

describe('formatTime', () => {
  it('应正确格式化时间为固定2位小数', () => {
    expect(formatTime(0.1)).toBe('0.10');
  });

  it('应正确格式化整数时间', () => {
    expect(formatTime(1)).toBe('1.00');
  });

  it('应正确处理0值', () => {
    expect(formatTime(0)).toBe('0.00');
  });

  it('应正确处理多位小数', () => {
    expect(formatTime(0.12345)).toBe('0.12');
  });
});

describe('formatPower', () => {
  it('应正确格式化大于等于100的功率为整数', () => {
    expect(formatPower(1520.5)).toBe('1521');
  });

  it('应正确格式化小于100的功率为1位小数', () => {
    expect(formatPower(50.5)).toBe('50.5');
  });

  it('应正确处理边界值100', () => {
    expect(formatPower(100)).toBe('100');
  });

  it('应正确处理0值', () => {
    expect(formatPower(0)).toBe('0.0');
  });

  it('应正确处理99.9', () => {
    expect(formatPower(99.9)).toBe('99.9');
  });
});

describe('formatEnergy', () => {
  it('应正确格式化能量为固定1位小数', () => {
    expect(formatEnergy(25.6)).toBe('25.6');
  });

  it('应正确格式化整数能量', () => {
    expect(formatEnergy(25)).toBe('25.0');
  });

  it('应正确处理0值', () => {
    expect(formatEnergy(0)).toBe('0.0');
  });

  it('应正确处理多位小数', () => {
    expect(formatEnergy(25.67)).toBe('25.7');
  });
});

// Mock 数据
const mockInput: SizingInput = {
  project: { name: 'Test', customer: 'Test', salesPerson: 'Test' },
  mechanism: {
    type: 'BALL_SCREW',
    params: {
      loadMass: 5,
      lead: 10,
      screwDiameter: 20,
      screwLength: 500,
      gearRatio: 1,
      efficiency: 0.9,
      frictionCoeff: 0.05,
      preloadTorque: 0,
    },
  },
  motion: {
    stroke: 100,
    maxVelocity: 500,
    maxAcceleration: 1000,
    profile: 'TRAPEZOIDAL',
    dwellTime: 0.5,
    cycleTime: 2,
  },
  duty: {
    ambientTemp: 40,
    dutyCycle: 80,
    mountingOrientation: 'HORIZONTAL',
    ipRating: 'IP65',
    brake: false,
  },
  preferences: {
    safetyFactor: 1.5,
    maxInertiaRatio: 30,
    targetInertiaRatio: 10,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 3,
  },
};

const mockMechanical: MechanicalResult = {
  loadInertia: 0.000507,
  totalInertia: 0.000519,
  inertiaRatio: 5.2,
  torques: {
    accel: 4.85,
    constant: 0.78,
    decel: -3.29,
    peak: 4.85,
    rms: 2.14,
  },
  speeds: {
    max: 3000,
    rms: 2100,
  },
  powers: {
    peak: 1520,
    continuous: 450,
  },
  regeneration: {
    energyPerCycle: 25.6,
    brakingPower: 512,
    requiresExternalResistor: true,
    recommendedResistor: {
      minPower: 600,
      resistance: 100,
      dutyCycle: 50,
    },
  },
};

describe('extractMechanismParams', () => {
  it('应正确提取滚珠丝杠参数', () => {
    const result = extractMechanismParams(mockInput);

    expect(result.type).toBe('BALL_SCREW');
    expect(result.typeLabel).toBe('滚珠丝杠');
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '负载质量', value: 5, unit: 'kg' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '丝杠导程', value: 10, unit: 'mm' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '丝杠直径', value: 20, unit: 'mm' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '丝杠长度', value: 500, unit: 'mm' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '减速比', value: 1 })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '机械效率', value: '90%' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '摩擦系数', value: 0.05 })
    );
  });

  it('应正确提取齿轮减速机参数', () => {
    const gearboxInput: SizingInput = {
      ...mockInput,
      mechanism: {
        type: 'GEARBOX',
        params: {
          loadMass: 10,
          loadType: 'TABLE',
          tableDiameter: 200,
          gearRatio: 10,
          efficiency: 0.85,
          frictionTorque: 0.5,
          gravityArmLength: 50,
        },
      },
    };

    const result = extractMechanismParams(gearboxInput);

    expect(result.type).toBe('GEARBOX');
    expect(result.typeLabel).toBe('齿轮/减速机');
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '负载类型', value: '转盘' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '转盘直径', value: 200, unit: 'mm' })
    );
  });

  it('应正确提取直接驱动参数', () => {
    const directDriveInput: SizingInput = {
      ...mockInput,
      mechanism: {
        type: 'DIRECT_DRIVE',
        params: {
          driveType: 'ROTARY',
          loadMass: 15,
          tableDiameter: 300,
          efficiency: 0.95,
        },
      },
    };

    const result = extractMechanismParams(directDriveInput);

    expect(result.type).toBe('DIRECT_DRIVE');
    expect(result.typeLabel).toBe('直接驱动');
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '驱动类型', value: '旋转' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '转盘直径', value: 300, unit: 'mm' })
    );
  });

  it('应正确提取同步带参数', () => {
    const beltInput: SizingInput = {
      ...mockInput,
      mechanism: {
        type: 'BELT',
        params: {
          loadMass: 3,
          pulleyDiameter: 50,
          drivenPulleyDiameter: 50,
          beltLength: 1000,
          beltMassPerMeter: 0.1,
          efficiency: 0.9,
          tensionForce: 50,
        },
      },
    };

    const result = extractMechanismParams(beltInput);

    expect(result.type).toBe('BELT');
    expect(result.typeLabel).toBe('同步带');
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '主动轮直径', value: 50, unit: 'mm' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '皮带长度', value: 1000, unit: 'mm' })
    );
  });

  it('应正确提取齿条齿轮参数', () => {
    const rackPinionInput: SizingInput = {
      ...mockInput,
      mechanism: {
        type: 'RACK_PINION',
        params: {
          loadMass: 8,
          pinionDiameter: 40,
          gearRatio: 5,
          efficiency: 0.88,
          frictionCoeff: 0.1,
          mountingAngle: 30,
        },
      },
    };

    const result = extractMechanismParams(rackPinionInput);

    expect(result.type).toBe('RACK_PINION');
    expect(result.typeLabel).toBe('齿条齿轮');
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '小齿轮直径', value: 40, unit: 'mm' })
    );
    expect(result.params).toContainEqual(
      expect.objectContaining({ label: '安装角度', value: 30, unit: '°' })
    );
  });
});

describe('extractMotionParams', () => {
  it('应正确提取运动参数并计算运动时间', () => {
    const result = extractMotionParams(mockInput, mockMechanical);

    expect(result.maxSpeed).toBe(3000);
    expect(result.maxSpeedLinear).toBe(500);
    expect(result.accelTime).toBeGreaterThan(0);
    expect(result.constantTime).toBeGreaterThanOrEqual(0);
    expect(result.decelTime).toBeGreaterThan(0);
    expect(result.dwellTime).toBe(0.5);
    expect(result.cycleTime).toBe(2);
    expect(result.cyclesPerMinute).toBe(30);
  });
});

describe('extractCalculationDetails', () => {
  it('应正确提取完整的计算详情', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);

    // 验证机械参数
    expect(result.mechanism).toBeDefined();
    expect(result.mechanism.type).toBe('BALL_SCREW');
    expect(result.mechanism.typeLabel).toBe('滚珠丝杠');
    expect(result.mechanism.params.length).toBeGreaterThan(0);

    // 验证惯量计算结果
    expect(result.inertia).toBeDefined();
    expect(result.inertia.loadInertia).toBe(0.000507);
    expect(result.inertia.totalInertia).toBe(0.000519);

    // 验证扭矩分析结果
    expect(result.torques).toBeDefined();
    expect(result.torques.accel).toBe(4.85);
    expect(result.torques.constant).toBe(0.78);
    expect(result.torques.decel).toBe(-3.29);
    expect(result.torques.peak).toBe(4.85);
    expect(result.torques.rms).toBe(2.14);

    // 验证运动参数
    expect(result.motion).toBeDefined();
    expect(result.motion.maxSpeed).toBe(3000);
    expect(result.motion.cycleTime).toBe(2);
    expect(result.motion.cyclesPerMinute).toBe(30);

    // 验证功率与能量
    expect(result.power).toBeDefined();
    expect(result.power.peak).toBe(1520);
    expect(result.power.continuous).toBe(450);

    expect(result.regeneration).toBeDefined();
    expect(result.regeneration.energyPerCycle).toBe(25.6);
    expect(result.regeneration.brakingPower).toBe(512);
    expect(result.regeneration.requiresExternalResistor).toBe(true);
  });

  it('应包含摩擦扭矩和重力扭矩（如果有）', () => {
    const mechanicalWithFriction: MechanicalResult = {
      ...mockMechanical,
      torques: {
        ...mockMechanical.torques,
        friction: 0.78,
        gravity: 0,
      },
    };

    const result = extractCalculationDetails(mockInput, mechanicalWithFriction);

    expect(result.torques.friction).toBe(0.78);
    expect(result.torques.gravity).toBe(0);
  });

  it('应处理无推荐制动电阻的情况', () => {
    const mechanicalWithoutResistor: MechanicalResult = {
      ...mockMechanical,
      regeneration: {
        ...mockMechanical.regeneration,
        requiresExternalResistor: false,
        recommendedResistor: undefined,
      },
    };

    const result = extractCalculationDetails(mockInput, mechanicalWithoutResistor);

    expect(result.regeneration.requiresExternalResistor).toBe(false);
    expect(result.regeneration.recommendedResistor).toBeUndefined();
  });
});
