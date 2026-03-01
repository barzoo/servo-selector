import { describe, it, expect } from 'vitest';
import { SizingEngine } from '../sizing-engine';
import type { SizingInput } from '@/types';

describe('SizingEngine with System Configuration', () => {
  const engine = new SizingEngine();

  const baseInput: SizingInput = {
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
      keyShaft: 'L',
    },
    preferences: {
      safetyFactor: 1.5,
      maxInertiaRatio: 30,
      targetInertiaRatio: 10,
      communication: 'ETHERCAT',
      safety: 'NONE',
      cableLength: 3,
      encoderType: 'BOTH',
    },
  };

  const mockInput: SizingInput = {
    ...baseInput,
    selections: {
      motorId: 'mc20-060-3l30-n201-0aplnnnn',
      motorOptions: { brake: true, encoderType: 'A', keyShaft: false },
      driveOptions: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'STO' },
      cables: { motorLength: 5, encoderLength: 5 },
      accessories: {},
    },
  };

  it('should generate system configuration when selections provided', () => {
    const result = engine.calculate(mockInput);

    expect(result.systemConfiguration).toBeDefined();
    expect(result.systemConfiguration?.motor.partNumber).toContain('MC20');
    expect(result.systemConfiguration?.drive.partNumber).toContain('XC20');
    expect(result.systemConfiguration?.cables.motor.partNumber).toContain('MCL');
    expect(result.systemConfiguration?.cables.encoder.partNumber).toContain('MCE');
  });

  it('should include correct cable specs based on motor power', () => {
    const result = engine.calculate(mockInput);

    // 验证电缆规格符合电机功率范围
    const motorSpec = result.systemConfiguration?.cables.motor.spec;
    expect(['MCL22', 'MCL32', 'MCL42']).toContain(motorSpec);
    // A型编码器应该使用MCE12
    expect(result.systemConfiguration?.cables.encoder.spec).toBe('MCE12');
  });

  it('should generate correct motor part number with options', () => {
    const result = engine.calculate(mockInput);

    // 刹车(1) + A型编码器(A) + 航空插头(P) + 光轴(L)
    expect(result.systemConfiguration?.motor.partNumber).toContain('1APL');
  });

  it('should generate motor recommendations', () => {
    const result = engine.calculate(mockInput);

    expect(result.motorRecommendations.length).toBeGreaterThan(0);
    expect(result.motorRecommendations[0].matchScore).toBeGreaterThan(0);
    expect(result.motorRecommendations[0].safetyMargins).toBeDefined();
  });
});
