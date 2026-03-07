import { describe, it, expect } from 'vitest';
import { buildSizingInput } from '../build-sizing-input';
import { Project, AxisConfig } from '@/types';

const mockProject: Project = {
  id: 'proj_test123',
  name: 'Test Project',
  customer: 'Test Customer',
  salesPerson: 'Test Sales',
  notes: 'Test Notes',
  createdAt: '2026-03-07T00:00:00Z',
  commonParams: {
    ambientTemp: 25,
    ipRating: 'IP65',
    communication: 'ETHERCAT',
    cableLength: 5,
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
  },
  axes: [],
};

const mockAxis: AxisConfig = {
  id: 'axis_test456',
  name: 'X轴',
  status: 'CONFIGURING',
  createdAt: '2026-03-07T00:00:00Z',
  input: {
    mechanism: {
      type: 'BALL_SCREW',
      params: {
        loadMass: 100,
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
      stroke: 500,
      maxVelocity: 1000,
      maxAcceleration: 5000,
      profile: 'TRAPEZOIDAL',
      dwellTime: 0.5,
      cycleTime: 2,
    },
    dutyConditions: {
      dutyCycle: 100,
      mountingOrientation: 'HORIZONTAL',
      brake: false,
      keyShaft: 'L',
    },
    preferences: {
      encoderType: 'BOTH',
      safety: 'NONE',
    },
  },
};

describe('buildSizingInput', () => {
  it('should merge project info correctly', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.project).toEqual({
      name: 'Test Project',
      customer: 'Test Customer',
      salesPerson: 'Test Sales',
      notes: 'Test Notes',
    });
  });

  it('should merge common params into duty conditions', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.duty.ambientTemp).toBe(25);
    expect(result.duty.ipRating).toBe('IP65');
    expect(result.duty.dutyCycle).toBe(100);
    expect(result.duty.mountingOrientation).toBe('HORIZONTAL');
  });

  it('should merge common params into preferences', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.preferences.safetyFactor).toBe(1.5);
    expect(result.preferences.maxInertiaRatio).toBe(10);
    expect(result.preferences.communication).toBe('ETHERCAT');
    expect(result.preferences.cableLength).toBe(5);
    expect(result.preferences.encoderType).toBe('BOTH');
  });

  it('should include mechanism and motion params', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.mechanism?.type).toBe('BALL_SCREW');
    expect(result.motion?.stroke).toBe(500);
  });

  it('should handle incomplete axis input', () => {
    const incompleteAxis: AxisConfig = {
      ...mockAxis,
      input: {},
    };

    const result = buildSizingInput(mockProject, incompleteAxis);

    expect(result.duty).toBeDefined();
    expect(result.preferences).toBeDefined();
  });
});
