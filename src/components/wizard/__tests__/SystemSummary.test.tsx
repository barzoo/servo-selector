import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SystemSummary,
  findMotor,
  findDrive,
  getCableDescription,
  buildSummaryItems,
  generateExportData,
} from '../SystemSummary';
import type { SystemConfiguration, MechanicalResult } from '@/types';

// Mock the JSON imports
vi.mock('@/data/motors.json', () => ({
  default: {
    motors: [
      {
        id: 'mc20-060-3l30-n201-0aplnnnn',
        model: 'MC20-060-3L30-N201-0APLNNNN',
        baseModel: 'MC20-060-3L30-N201',
        description: {
          short: '0.64 N·m, 3000 rpm, A型编码器, 无抱闸, 光轴',
        },
        series: 'MC20',
        frameSize: 60,
        inertiaType: 'LOW',
        ratedPower: 200,
        ratedSpeed: 3000,
        ratedTorque: 0.64,
        peakTorque: 2,
        maxSpeed: 6000,
        ratedCurrent: 0.92,
        peakCurrent: 3.1,
        rotorInertia: 0.00002,
        rotorInertiaWithBrake: 0.000021,
        weight: 1.1,
        weightWithBrake: 1.4,
        torqueConstant: 0.6957,
        voltageConstant: 0.77,
        phaseResistance: null,
        phaseInductance: null,
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
        dimensions: {
          flange: 60,
          length: 91,
          lengthWithBrake: 119,
          shaftDiameter: 14,
          shaftLength: 30,
        },
        matchedDrives: ['XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN'],
        cableSpecs: { motorCable: 'MCL22', encoderCable: 'MCE02/MCE12' },
      },
    ],
  },
}));

vi.mock('@/data/drives.json', () => ({
  default: {
    drives: [
      {
        id: 'xc20-w0005crn-ec',
        model: 'XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN',
        baseModel: 'XC20-W0005CRN',
        description: {
          short: '5A 峰值, EtherCAT通讯, 无STO',
        },
        series: 'XC20',
        size: 'XD',
        maxCurrent: 5,
        ratedCurrent: 1.5,
        overloadCapacity: 3.3,
        pwmFrequencies: [4, 8, 12, 16],
        ratedPwmFrequency: 8,
        hasFan: false,
        braking: {
          internalResistance: 500,
          continuousPower: 14,
          peakPower: 754,
        },
        dimensions: { width: 50, height: 178, depth: 196 },
        communication: {
          type: 'ETHERCAT',
          code: 'ECT0',
          soeSupported: true,
          coeSupported: true,
        },
        options: {
          panel: { code: '01B' },
          safety: { code: 'NN' },
          brakeResistor: { code: 'R' },
          firmware: { code: 'SVSRSN3' },
        },
        compatibleMotors: ['MC20-060-3L30-N201'],
      },
    ],
  },
}));

const mockConfig: SystemConfiguration = {
  motor: {
    model: 'MC20-060-3L30-N201',
    partNumber: 'MC20-060-3L30-N201-0APLNNNN',
    options: {
      brake: false,
      encoderType: 'A',
      keyShaft: false,
    },
  },
  drive: {
    model: 'XC20-W0005CRN',
    partNumber: 'XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN',
    options: {
      communication: 'ETHERCAT',
      panel: 'WITH_DISPLAY',
      safety: 'NONE',
    },
  },
  cables: {
    motor: {
      spec: 'MCL22',
      length: 5,
      partNumber: 'MCL22-05',
    },
    encoder: {
      spec: 'MCE02',
      length: 5,
      partNumber: 'MCE02-05',
    },
  },
  accessories: {},
};

const mockConfigWithAccessories: SystemConfiguration = {
  ...mockConfig,
  cables: {
    ...mockConfig.cables,
    communication: {
      length: 3,
      partNumber: 'COMM-03',
    },
  },
  accessories: {
    emcFilter: 'EMC-001',
    brakeResistor: {
      model: 'RBR-100',
      partNumber: 'RBR-100-01',
    },
  },
};

const mockMechanical: MechanicalResult = {
  loadInertia: 0.0001,
  totalInertia: 0.00012,
  inertiaRatio: 5,
  torques: {
    accel: 0.5,
    constant: 0.2,
    decel: 0.3,
    peak: 0.5,
    rms: 0.3,
  },
  speeds: {
    max: 3000,
    rms: 2000,
  },
  powers: {
    peak: 157,
    continuous: 63,
  },
  regeneration: {
    energyPerCycle: 50.5,
    brakingPower: 25.3,
    requiresExternalResistor: false,
  },
};

describe('SystemSummary Helper Functions', () => {
  describe('findMotor', () => {
    it('should find motor by part number', () => {
      const motor = findMotor('MC20-060-3L30-N201-0APLNNNN');
      expect(motor).toBeDefined();
      expect(motor?.model).toBe('MC20-060-3L30-N201-0APLNNNN');
      expect(motor?.ratedPower).toBe(200);
    });

    it('should return undefined for non-existent motor', () => {
      const motor = findMotor('NON-EXISTENT');
      expect(motor).toBeUndefined();
    });
  });

  describe('findDrive', () => {
    it('should find drive by part number', () => {
      const drive = findDrive('XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN');
      expect(drive).toBeDefined();
      expect(drive?.model).toBe('XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN');
      expect(drive?.maxCurrent).toBe(5);
    });

    it('should return undefined for non-existent drive', () => {
      const drive = findDrive('NON-EXISTENT');
      expect(drive).toBeUndefined();
    });
  });

  describe('getCableDescription', () => {
    it('should generate description for motor cable', () => {
      const desc = getCableDescription('MOTOR', 5, 'MCL22');
      expect(desc).toBe('动力电缆 - MCL22, 5米');
    });

    it('should generate description for encoder cable', () => {
      const desc = getCableDescription('ENCODER', 10, 'MCE02');
      expect(desc).toBe('编码器电缆 - MCE02, 10米');
    });

    it('should generate description for communication cable', () => {
      const desc = getCableDescription('COMMUNICATION', 3, 'COMM');
      expect(desc).toBe('通讯电缆 - COMM, 3米');
    });

    it('should handle TERMINAL_ONLY length', () => {
      const desc = getCableDescription('MOTOR', 'TERMINAL_ONLY', 'MCL22');
      expect(desc).toBe('MCL22 - 仅接线端子');
    });
  });

  describe('buildSummaryItems', () => {
    it('should build summary items for basic config', () => {
      const items = buildSummaryItems(mockConfig);

      expect(items).toHaveLength(4);
      expect(items[0].category).toBe('MOTOR');
      expect(items[0].partNumber).toBe('MC20-060-3L30-N201-0APLNNNN');
      expect(items[1].category).toBe('DRIVE');
      expect(items[2].category).toBe('MOTOR_CABLE');
      expect(items[3].category).toBe('ENCODER_CABLE');
    });

    it('should build summary items with accessories', () => {
      const items = buildSummaryItems(mockConfigWithAccessories);

      expect(items).toHaveLength(7);
      expect(items.some((i) => i.category === 'COMM_CABLE')).toBe(true);
      expect(items.some((i) => i.category === 'EMC_FILTER')).toBe(true);
      expect(items.some((i) => i.category === 'BRAKE_RESISTOR')).toBe(true);
    });
  });

  describe('generateExportData', () => {
    it('should generate complete export data', () => {
      const data = generateExportData(mockConfig, mockMechanical);

      expect(data.summary).toHaveLength(4);
      expect(data.details.motor).toBeDefined();
      expect(data.details.drive).toBeDefined();
      expect(data.details.cables.motor).toBeDefined();
      expect(data.details.cables.encoder).toBeDefined();
      expect(data.calculations).toBe(mockMechanical);
    });

    it('should handle config without optional items', () => {
      const data = generateExportData(mockConfig);

      expect(data.details.cables.communication).toBeNull();
      expect(data.details.accessories.brakeResistor).toBeNull();
      expect(data.details.accessories.emcFilter).toBeNull();
    });
  });
});

describe('SystemSummary Component', () => {
  it('should render summary table with correct columns', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('系统配置清单')).toBeInTheDocument();
    expect(screen.getByText('订货号')).toBeInTheDocument();
    expect(screen.getByText('类型')).toBeInTheDocument();
    expect(screen.getByText('描述')).toBeInTheDocument();
  });

  it('should render motor and drive part numbers in table', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('MC20-060-3L30-N201-0APLNNNN')).toBeInTheDocument();
    expect(
      screen.getByText('XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN')
    ).toBeInTheDocument();
  });

  it('should render motor details section', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('电机详细参数')).toBeInTheDocument();
    expect(screen.getByText('额定功率')).toBeInTheDocument();
    expect(screen.getByText('200 W')).toBeInTheDocument();
    expect(screen.getByText('额定转速')).toBeInTheDocument();
    expect(screen.getByText('3000 rpm')).toBeInTheDocument();
  });

  it('should render drive details section', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('驱动详细参数')).toBeInTheDocument();
    expect(screen.getByText('最大电流')).toBeInTheDocument();
    expect(screen.getByText('5 A')).toBeInTheDocument();
    expect(screen.getByText('通讯协议')).toBeInTheDocument();
  });

  it('should render cable specifications section', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('电缆规格')).toBeInTheDocument();
    // Use getAllByText since these appear in both table and cable section
    expect(screen.getAllByText('动力电缆').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('编码器电缆').length).toBeGreaterThanOrEqual(1);
    // Part numbers also appear in both places
    expect(screen.getAllByText('MCL22-05').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MCE02-05').length).toBeGreaterThanOrEqual(1);
  });

  it('should render communication cable when present', () => {
    render(<SystemSummary config={mockConfigWithAccessories} />);

    // "通讯电缆" appears in both table and cable section
    expect(screen.getAllByText('通讯电缆').length).toBeGreaterThanOrEqual(1);
    // Part number also appears in both places
    expect(screen.getAllByText('COMM-03').length).toBeGreaterThanOrEqual(1);
  });

  it('should render accessories section when present', () => {
    render(<SystemSummary config={mockConfigWithAccessories} />);

    expect(screen.getByText('配件信息')).toBeInTheDocument();
    // "EMC滤波器" and "制动电阻" appear in both table and accessories section
    expect(screen.getAllByText('EMC滤波器').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('制动电阻').length).toBeGreaterThanOrEqual(1);
  });

  it('should not render accessories section when empty', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.queryByText('配件信息')).not.toBeInTheDocument();
  });

  it('should render regeneration info when provided', () => {
    render(<SystemSummary config={mockConfig} mechanical={mockMechanical} />);

    expect(screen.getByText('制动能量分析')).toBeInTheDocument();
    expect(screen.getByText('单次制动能量')).toBeInTheDocument();
    expect(screen.getByText('50.5 J')).toBeInTheDocument();
    expect(screen.getByText('平均制动功率')).toBeInTheDocument();
    expect(screen.getByText('25.3 W')).toBeInTheDocument();
  });

  it('should not render regeneration info when not provided', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.queryByText('制动能量分析')).not.toBeInTheDocument();
  });
});
