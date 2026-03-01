/**
 * Tests for product data conversion utility functions
 *
 * Coverage:
 * - generateMotorDescription
 * - generateDriveDescription
 * - generateCableDescription
 */

import { describe, it, expect } from 'vitest';
import {
  generateMotorDescription,
  generateDriveDescription,
  generateCableDescription,
} from '../convert-product-data';

// ============================================================================
// generateMotorDescription Tests
// ============================================================================

describe('generateMotorDescription', () => {
  it('should generate description for motor with all options', () => {
    const motor = {
      ratedTorque: 0.64,
      ratedSpeed: 3000,
      options: {
        encoder: {
          type: 'BATTERY_MULTI_TURN' as const,
        },
        brake: {
          hasBrake: true,
        },
        keyShaft: {
          hasKey: true,
        },
      },
    };

    const result = generateMotorDescription(motor);
    expect(result).toBe('0.64 N·m, 3000 rpm, A型编码器, 带抱闸, 带键轴');
  });

  it('should generate description for motor without brake and without key', () => {
    const motor = {
      ratedTorque: 0.64,
      ratedSpeed: 3000,
      options: {
        encoder: {
          type: 'BATTERY_MULTI_TURN' as const,
        },
        brake: {
          hasBrake: false,
        },
        keyShaft: {
          hasKey: false,
        },
      },
    };

    const result = generateMotorDescription(motor);
    expect(result).toBe('0.64 N·m, 3000 rpm, A型编码器, 无抱闸, 光轴');
  });

  it('should generate description for motor with mechanical encoder', () => {
    const motor = {
      ratedTorque: 2.5,
      ratedSpeed: 1500,
      options: {
        encoder: {
          type: 'MECHANICAL_MULTI_TURN' as const,
        },
        brake: {
          hasBrake: true,
        },
        keyShaft: {
          hasKey: false,
        },
      },
    };

    const result = generateMotorDescription(motor);
    expect(result).toBe('2.5 N·m, 1500 rpm, B型编码器, 带抱闸, 光轴');
  });

  it('should handle different torque and speed values', () => {
    const motor = {
      ratedTorque: 3.57,
      ratedSpeed: 2000,
      options: {
        encoder: {
          type: 'MECHANICAL_MULTI_TURN' as const,
        },
        brake: {
          hasBrake: false,
        },
        keyShaft: {
          hasKey: true,
        },
      },
    };

    const result = generateMotorDescription(motor);
    expect(result).toBe('3.57 N·m, 2000 rpm, B型编码器, 无抱闸, 带键轴');
  });
});

// ============================================================================
// generateDriveDescription Tests
// ============================================================================

describe('generateDriveDescription', () => {
  it('should generate description for EtherCAT drive with STO', () => {
    const drive = {
      maxCurrent: 1.5,
      communication: {
        type: 'ETHERCAT' as const,
      },
      options: {
        safety: {
          code: 'STO',
        },
      },
    };

    const result = generateDriveDescription(drive);
    expect(result).toBe('1.5A 峰值, EtherCAT通讯, 带STO');
  });

  it('should generate description for EtherCAT drive without STO', () => {
    const drive = {
      maxCurrent: 1.5,
      communication: {
        type: 'ETHERCAT' as const,
      },
      options: {
        safety: {
          code: 'NN',
        },
      },
    };

    const result = generateDriveDescription(drive);
    expect(result).toBe('1.5A 峰值, EtherCAT通讯, 无STO');
  });

  it('should generate description for PROFINET drive', () => {
    const drive = {
      maxCurrent: 2.3,
      communication: {
        type: 'PROFINET' as const,
      },
      options: {
        safety: {
          code: 'NN',
        },
      },
    };

    const result = generateDriveDescription(drive);
    expect(result).toBe('2.3A 峰值, PROFINET通讯, 无STO');
  });

  it('should generate description for EtherNet/IP drive', () => {
    const drive = {
      maxCurrent: 5.0,
      communication: {
        type: 'ETHERNET_IP' as const,
      },
      options: {
        safety: {
          code: 'STO',
        },
      },
    };

    const result = generateDriveDescription(drive);
    expect(result).toBe('5A 峰值, EtherNet/IP通讯, 带STO');
  });
});

// ============================================================================
// generateCableDescription Tests
// ============================================================================

describe('generateCableDescription', () => {
  it('should generate description for motor power cable', () => {
    const result = generateCableDescription('MOTOR', 5, 'MCL22');
    expect(result).toBe('动力电缆, 5m, 高柔性屏蔽');
  });

  it('should generate description for motor power cable with different length', () => {
    const result = generateCableDescription('MOTOR', 10, 'MCL32');
    expect(result).toBe('动力电缆, 10m, 高柔性屏蔽');
  });

  it('should generate description for encoder cable with battery box (MCE12)', () => {
    const result = generateCableDescription('ENCODER', 5, 'MCE12');
    expect(result).toBe('编码器电缆, 5m, 电池盒式专用');
  });

  it('should generate description for encoder cable without battery box (MCE02)', () => {
    const result = generateCableDescription('ENCODER', 3, 'MCE02');
    expect(result).toBe('编码器电缆, 3m, 机械式专用');
  });

  it('should generate description for communication cable (EtherCAT)', () => {
    const result = generateCableDescription('COMM', 5, 'ETHERCAT');
    expect(result).toBe('通讯电缆, 5m, EtherCAT专用');
  });

  it('should generate description for communication cable with different length', () => {
    const result = generateCableDescription('COMM', 15, 'PROFINET');
    expect(result).toBe('通讯电缆, 15m, EtherCAT专用');
  });
});
