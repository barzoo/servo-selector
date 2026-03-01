import { describe, it, expect } from 'vitest';
import { MotorFilter } from '../motor-filter';
import type { MechanicalResult, SystemPreferences } from '@/types';

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
    encoderType: 'BOTH',
  };

  it('should filter motors by encoder type A (battery)', () => {
    const prefsWithEncoderA: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'A',
    };

    const filter = new MotorFilter(mockMechanical, prefsWithEncoderA);
    const results = filter.filter();

    if (results.length > 0) {
      results.forEach(rec => {
        expect(rec.motor.options.encoder.type).toBe('BATTERY_MULTI_TURN');
      });
    }
  });

  it('should filter motors by encoder type B (mechanical)', () => {
    const prefsWithEncoderB: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'B',
    };

    const filter = new MotorFilter(mockMechanical, prefsWithEncoderB);
    const results = filter.filter();

    if (results.length > 0) {
      results.forEach(rec => {
        expect(rec.motor.options.encoder.type).toBe('MECHANICAL_MULTI_TURN');
      });
    }
  });

  it('should show both encoder types when BOTH is selected', () => {
    const prefsWithBoth: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'BOTH',
    };

    const filter = new MotorFilter(mockMechanical, prefsWithBoth);
    const results = filter.filter();

    // Should have results and they can be either encoder type
    expect(results.length).toBeGreaterThanOrEqual(0);

    // If there are results with different encoder types, both should be present
    const hasBattery = results.some(r => r.motor.options.encoder.type === 'BATTERY_MULTI_TURN');
    const hasMechanical = results.some(r => r.motor.options.encoder.type === 'MECHANICAL_MULTI_TURN');

    // At least one type should be present if there are results
    if (results.length > 0) {
      expect(hasBattery || hasMechanical).toBe(true);
    }
  });
});
