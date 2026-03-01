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
