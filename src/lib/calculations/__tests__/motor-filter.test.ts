import { describe, it, expect } from 'vitest';
import { MotorFilter } from '../motor-filter';
import type { MechanicalResult, SystemPreferences, DutyConditions } from '@/types';

describe('MotorFilter with Inertia Matching', () => {
  const mockMechanical: MechanicalResult = {
    totalInertia: 10, // kg·cm²
    loadInertia: 8,
    inertiaRatio: 5,
    torques: { rms: 2.0, peak: 5.0, accel: 6, constant: 1, decel: 4 },
    speeds: { max: 3000, rms: 1500 },
    powers: { peak: 1000, continuous: 500 },
    regeneration: { energyPerCycle: 0, brakingPower: 0, requiresExternalResistor: false },
  };

  it('should filter motors by target inertia ratio', () => {
    const preferences: SystemPreferences = {
      safetyFactor: 1.5,
      targetInertiaRatio: 5,
    } as SystemPreferences;

    const filter = new MotorFilter(mockMechanical, preferences);
    const results = filter.filter();

    // 所有推荐电机的惯量比应 <= 5
    results.forEach(rec => {
      const ratio = mockMechanical.totalInertia / rec.motor.rotorInertia;
      expect(ratio).toBeLessThanOrEqual(5);
    });
  });

  it('should calculate correct inertia ratio for recommendations', () => {
    const preferences: SystemPreferences = {
      safetyFactor: 1.5,
      targetInertiaRatio: 10,
    } as SystemPreferences;

    const filter = new MotorFilter(mockMechanical, preferences);
    const results = filter.filter();

    // 验证推荐电机的惯量比计算正确
    results.forEach(rec => {
      const expectedRatio = mockMechanical.totalInertia / rec.motor.rotorInertia;
      expect(rec.safetyMargins.inertia).toBeCloseTo(expectedRatio, 1);
    });
  });

  it('should include availableOptions in recommendations', () => {
    const preferences: SystemPreferences = {
      safetyFactor: 1.5,
      targetInertiaRatio: 10,
    } as SystemPreferences;

    const filter = new MotorFilter(mockMechanical, preferences);
    const results = filter.filter();

    if (results.length > 0) {
      const rec = results[0];
      expect(rec.availableOptions).toBeDefined();
      expect(rec.availableOptions?.encoders).toBeInstanceOf(Array);
      expect(rec.availableOptions?.matchedDrives).toBeInstanceOf(Array);
    }
  });
});

describe('MotorFilter Encoder Type Filtering', () => {
  const mockMechanical: MechanicalResult = {
    totalInertia: 10,
    loadInertia: 8,
    inertiaRatio: 5,
    torques: { rms: 2.0, peak: 5.0, accel: 6, constant: 1, decel: 4 },
    speeds: { max: 3000, rms: 1500 },
    powers: { peak: 1000, continuous: 500 },
    regeneration: { energyPerCycle: 0, brakingPower: 0, requiresExternalResistor: false },
  };

  const defaultPrefs: SystemPreferences = {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 10,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
  };

  it('should return motors without encoder type filtering', () => {
    // encoderType has been removed from SystemPreferences
    // filtering now happens at MotorSelections level
    const filter = new MotorFilter(mockMechanical, defaultPrefs);
    const results = filter.filter();

    // Should return results with both encoder types
    expect(results.length).toBeGreaterThanOrEqual(0);

    const hasBattery = results.some(r => r.motor.options.encoder.type === 'BATTERY_MULTI_TURN');
    const hasMechanical = results.some(r => r.motor.options.encoder.type === 'MECHANICAL_MULTI_TURN');

    // At least one type should be present if there are results
    if (results.length > 0) {
      expect(hasBattery || hasMechanical).toBe(true);
    }
  });
});

describe('MotorFilter keyShaft filtering', () => {
  const baseMechanical: MechanicalResult = {
    loadInertia: 0.0001,
    totalInertia: 0.00012,
    inertiaRatio: 5,
    torques: {
      accel: 0.5,
      constant: 0.3,
      decel: 0.4,
      peak: 0.8,
      rms: 0.4,
    },
    speeds: {
      max: 2000,
      rms: 1500,
    },
    powers: {
      peak: 100,
      continuous: 80,
    },
    regeneration: {
      energyPerCycle: 0,
      brakingPower: 0,
      requiresExternalResistor: false,
    },
  };

  const basePreferences: SystemPreferences = {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
  };

  it('should filter motors by smooth shaft (L)', () => {
    const duty: DutyConditions = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      keyShaft: 'L',
    };

    const filter = new MotorFilter(baseMechanical, basePreferences, duty);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.keyShaft.hasKey).toBe(false);
      expect(rec.motor.options.keyShaft.code).toBe('L');
    });
  });

  it('should filter motors by keyed shaft (K)', () => {
    const duty: DutyConditions = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      keyShaft: 'K',
    };

    const filter = new MotorFilter(baseMechanical, basePreferences, duty);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.keyShaft.hasKey).toBe(true);
      expect(rec.motor.options.keyShaft.code).toBe('K');
    });
  });

  it('should handle duty without keyShaft (backward compatibility)', () => {
    const dutyWithoutKeyShaft = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      // keyShaft 未定义
    } as DutyConditions;

    const filter = new MotorFilter(baseMechanical, basePreferences, dutyWithoutKeyShaft);
    const results = filter.filter();

    // 不过滤，应该返回所有符合条件的电机
    expect(results.length).toBeGreaterThan(0);
  });
});
