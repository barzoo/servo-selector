import { describe, it, expect } from 'vitest';
import type {
  MC20Motor,
  SizingInput,
  SystemConfiguration,
  MotorRecommendation,
} from '../index';

describe('Type Definitions', () => {
  it('MC20Motor should have correct structure', () => {
    const motor: MC20Motor = {
      id: 'test',
      model: 'MC20-060-3L30-N201-0APLNNNN',
      baseModel: 'MC20-060-3L30-N201',
      options: {
        brake: { code: '0', hasBrake: false },
        encoder: { code: 'A', type: 'BATTERY_MULTI_TURN', resolution: 23 },
        keyShaft: { code: 'L', hasKey: false },
        cooling: { code: 'N' },
        protection: { code: 'N', level: 'IP65' },
        connection: { code: 'P' },
        temperatureSensor: { code: 'N' },
        specialDesign: { code: 'NN' },
      },
      matchedDrives: ['W0005'],
      cableSpecs: { motorCable: 'MCL22', encoderCable: 'MCE12' },
    } as MC20Motor;
    expect(motor).toBeDefined();
    expect(motor.options.brake).toBeDefined();
    expect(motor.options.encoder).toBeDefined();
  });

  it('SizingInput should include selections', () => {
    const input: SizingInput = {
      selections: {
        motorId: 'test',
        motorOptions: { brake: true, encoderType: 'A', keyShaft: false },
        driveOptions: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'STO' },
        cables: { motorLength: 3, encoderLength: 3 },
        accessories: { emcFilter: 'NONE' },
      },
    } as SizingInput;
    expect(input.selections).toBeDefined();
    expect(input.selections?.motorOptions.encoderType).toMatch(/A|B/);
  });

  it('SystemConfiguration should have complete structure', () => {
    const config: SystemConfiguration = {
      motor: {
        model: 'MC20-080-3L30-N102',
        partNumber: 'MC20-080-3L30-N102-0APL-NNNN',
        options: { brake: false, encoderType: 'A', keyShaft: false },
      },
      drive: {
        model: 'XC20-W0007',
        partNumber: 'XC20-W0007CRN-01BECTONNNN-SVSRSN3NNNNN',
        options: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'STO' },
      },
      cables: {
        motor: { spec: 'MCL22', length: 3, partNumber: 'MCL22-0-03' },
        encoder: { spec: 'MCE12', length: 3, partNumber: 'MCE1203' },
      },
      accessories: {},
    };
    expect(config.motor.partNumber).toContain('MC20');
    expect(config.drive.partNumber).toContain('XC20');
  });

  it('MotorRecommendation should include availableOptions', () => {
    const rec: MotorRecommendation = {
      motor: {} as MC20Motor,
      matchScore: 85,
      safetyMargins: { torque: 30, speed: 50, inertia: 5 },
      feasibility: 'OK',
      warnings: [],
      availableOptions: {
        encoders: ['A', 'B'],
        hasBrakeOption: true,
        hasKeyOption: true,
        matchedDrives: ['W0005', 'W0007'],
      },
    };
    expect(rec.availableOptions?.encoders).toContain('A');
    expect(rec.availableOptions?.encoders).toContain('B');
  });
});
