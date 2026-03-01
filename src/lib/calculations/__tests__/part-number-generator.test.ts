import { describe, it, expect } from 'vitest';
import { PartNumberGenerator } from '../part-number-generator';
import type { MC20Motor } from '@/types';

describe('PartNumberGenerator', () => {
  const generator = new PartNumberGenerator();

  describe('generateMotorPN', () => {
    const baseMotor: MC20Motor = {
      baseModel: 'MC20-080-3L30-N102',
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
    } as MC20Motor;

    it('should generate motor PN with brake and A encoder', () => {
      const pn = generator.generateMotorPN(baseMotor, {
        brake: true,
        encoderType: 'A',
        keyShaft: false,
      });
      expect(pn).toBe('MC20-080-3L30-N102-1APL-NNNN');
    });

    it('should generate motor PN without brake and B encoder', () => {
      const pn = generator.generateMotorPN(baseMotor, {
        brake: false,
        encoderType: 'B',
        keyShaft: true,
      });
      expect(pn).toBe('MC20-080-3L30-N102-0BPK-NNNN');
    });

    it('should generate motor PN with all options', () => {
      const pn = generator.generateMotorPN(baseMotor, {
        brake: true,
        encoderType: 'B',
        keyShaft: true,
      });
      expect(pn).toBe('MC20-080-3L30-N102-1BPK-NNNN');
    });
  });

  describe('generateCablePN', () => {
    it('should generate motor cable PN with brake', () => {
      const pn = generator.generateCablePN('motor', 'MCL22', 5, true);
      expect(pn).toBe('MCL22-1-05');
    });

    it('should generate motor cable PN without brake', () => {
      const pn = generator.generateCablePN('motor', 'MCL22', 10, false);
      expect(pn).toBe('MCL22-0-10');
    });

    it('should generate encoder cable PN', () => {
      const pn = generator.generateCablePN('encoder', 'MCE12', 15);
      expect(pn).toBe('MCE1215');
    });

    it('should generate encoder cable PN for type B', () => {
      const pn = generator.generateCablePN('encoder', 'MCE02', 3);
      expect(pn).toBe('MCE0203');
    });
  });

  describe('getMotorCableSpec', () => {
    it('should return MCL22 for power <= 2kW', () => {
      expect(generator.getMotorCableSpec(0.2)).toBe('MCL22');
      expect(generator.getMotorCableSpec(1.0)).toBe('MCL22');
      expect(generator.getMotorCableSpec(2.0)).toBe('MCL22');
    });

    it('should return MCL32 for power 2.5-3kW', () => {
      expect(generator.getMotorCableSpec(2.5)).toBe('MCL32');
      expect(generator.getMotorCableSpec(3.0)).toBe('MCL32');
    });

    it('should return MCL42 for power > 3kW', () => {
      expect(generator.getMotorCableSpec(3.5)).toBe('MCL42');
      expect(generator.getMotorCableSpec(5.0)).toBe('MCL42');
      expect(generator.getMotorCableSpec(7.5)).toBe('MCL42');
    });
  });

  describe('getEncoderCableSpec', () => {
    it('should return MCE12 for A type encoder', () => {
      expect(generator.getEncoderCableSpec('A')).toBe('MCE12');
    });

    it('should return MCE02 for B type encoder', () => {
      expect(generator.getEncoderCableSpec('B')).toBe('MCE02');
    });
  });
});
