import { describe, it, expect } from 'vitest';
import motorsData from '../motors.json';

describe('MC20 Motors Data', () => {
  it('should have valid motor structure', () => {
    expect(motorsData.motors).toBeDefined();
    expect(motorsData.motors.length).toBeGreaterThan(0);
  });

  it('each motor should have required fields', () => {
    const motor = motorsData.motors[0];
    expect(motor.id).toBeDefined();
    expect(motor.baseModel).toBeDefined();
    expect(motor.ratedPower).toBeDefined();
    expect(motor.ratedTorque).toBeDefined();
    expect(motor.peakTorque).toBeDefined();
    expect(motor.rotorInertia).toBeDefined();
    expect(motor.options).toBeDefined();
    expect(motor.matchedDrives).toBeDefined();
    expect(motor.cableSpecs).toBeDefined();
  });

  it('should have motors with brake options', () => {
    const motorsWithBrake = motorsData.motors.filter(
      m => m.options.brake.hasBrake || m.rotorInertiaWithBrake !== m.rotorInertia
    );
    expect(motorsWithBrake.length).toBeGreaterThan(0);
  });

  it('should have motors with encoder options', () => {
    motorsData.motors.forEach(motor => {
      expect(motor.options.encoder).toBeDefined();
      expect(motor.options.encoder.type).toMatch(/BATTERY_MULTI_TURN|MECHANICAL_MULTI_TURN/);
    });
  });

  it('should have matched drives for each motor', () => {
    motorsData.motors.forEach(motor => {
      expect(motor.matchedDrives).toBeInstanceOf(Array);
      expect(motor.matchedDrives.length).toBeGreaterThan(0);
    });
  });

  it('should have cable specs for each motor', () => {
    motorsData.motors.forEach(motor => {
      expect(motor.cableSpecs).toBeDefined();
      expect(motor.cableSpecs.motorCable).toBeDefined();
      expect(motor.cableSpecs.encoderCable).toBeDefined();
    });
  });
});
