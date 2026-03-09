import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailedCalculations } from '../DetailedCalculations';
import type { SizingInput, MechanicalResult } from '@/types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'detailedCalculations.title': '详细计算信息',
      'detailedCalculations.mechanism': '机械参数',
      'detailedCalculations.inertia': '惯量计算',
      'detailedCalculations.torques': '扭矩分析',
      'detailedCalculations.motion': '运动参数',
      'detailedCalculations.power': '功率与能量',
      'detailedCalculations.labels.loadMass': '负载质量',
      'detailedCalculations.labels.gearRatio': '减速比',
      'detailedCalculations.labels.efficiency': '机械效率',
      'detailedCalculations.labels.loadInertia': '负载惯量',
      'detailedCalculations.labels.totalInertia': '总惯量',
      'detailedCalculations.labels.accelTorque': '加速扭矩',
      'detailedCalculations.labels.constantTorque': '恒速扭矩',
      'detailedCalculations.labels.decelTorque': '减速扭矩',
      'detailedCalculations.labels.peakTorque': '峰值扭矩',
      'detailedCalculations.labels.rmsTorque': 'RMS扭矩',
      'detailedCalculations.labels.maxSpeed': '最大转速',
      'detailedCalculations.labels.accelTime': '加速时间',
      'detailedCalculations.labels.constantTime': '恒速时间',
      'detailedCalculations.labels.decelTime': '减速时间',
      'detailedCalculations.labels.dwellTime': '停顿时间',
      'detailedCalculations.labels.cycleTime': '周期时间',
      'detailedCalculations.labels.cyclesPerMinute': '运动频率',
      'detailedCalculations.labels.peakPower': '峰值功率',
      'detailedCalculations.labels.continuousPower': '连续功率',
      'detailedCalculations.labels.energyPerCycle': '单次制动能量',
      'detailedCalculations.labels.brakingPower': '平均制动功率',
      'detailedCalculations.labels.brakeResistor': '制动电阻',
      'detailedCalculations.labels.regenerative': '再生',
      'detailedCalculations.labels.internalSufficient': '内置电阻足够',
      'detailedCalculations.labels.externalRequired': '需要外部电阻',
      'detailedCalculations.units.kg': 'kg',
      'detailedCalculations.units.mm': 'mm',
      'detailedCalculations.units.nm': 'N·m',
      'detailedCalculations.units.rpm': 'rpm',
      'detailedCalculations.units.s': 's',
      'detailedCalculations.units.w': 'W',
      'detailedCalculations.units.j': 'J',
      'detailedCalculations.units.cpm': '次/分钟',
      'detailedCalculations.units.kgm2': 'kg·m²',
    };
    return translations[key] || key;
  },
}));

// Mock data
const mockInput: SizingInput = {
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
    motionType: 'LINEAR',
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

const mockMechanical: MechanicalResult = {
  loadInertia: 0.000507,
  totalInertia: 0.000519,
  inertiaRatio: 5.2,
  torques: {
    accel: 4.85,
    constant: 0.78,
    decel: -3.29,
    peak: 4.85,
    rms: 2.14,
  },
  speeds: {
    max: 3000,
    rms: 2100,
  },
  powers: {
    peak: 1520,
    continuous: 450,
  },
  regeneration: {
    energyPerCycle: 25.6,
    brakingPower: 512,
    requiresExternalResistor: true,
    recommendedResistor: {
      minPower: 600,
      resistance: 100,
      dutyCycle: 50,
    },
  },
};

const mockMechanicalNoRegen: MechanicalResult = {
  ...mockMechanical,
  torques: {
    ...mockMechanical.torques,
    decel: 3.29,
  },
  regeneration: {
    energyPerCycle: 0,
    brakingPower: 0,
    requiresExternalResistor: false,
  },
};

describe('DetailedCalculations', () => {
  it('应默认折叠', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    // 标题应该可见
    expect(screen.getByText('详细计算信息')).toBeInTheDocument();

    // 卡片内容不应该可见
    expect(screen.queryByText('惯量计算')).not.toBeInTheDocument();
    expect(screen.queryByText('扭矩分析')).not.toBeInTheDocument();
    expect(screen.queryByText('运动参数')).not.toBeInTheDocument();
    expect(screen.queryByText('功率与能量')).not.toBeInTheDocument();
  });

  it('点击标题应展开显示所有卡片', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    // 点击标题
    fireEvent.click(screen.getByText('详细计算信息'));

    // 所有卡片标题应该可见
    expect(screen.getByText('机械参数')).toBeInTheDocument();
    expect(screen.getByText('惯量计算')).toBeInTheDocument();
    expect(screen.getByText('扭矩分析')).toBeInTheDocument();
    expect(screen.getByText('运动参数')).toBeInTheDocument();
    expect(screen.getByText('功率与能量')).toBeInTheDocument();
  });

  it('应显示机械参数', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    // 检查机械参数内容
    expect(screen.getByText('负载质量')).toBeInTheDocument();
    expect(screen.getByText('减速比')).toBeInTheDocument();
    expect(screen.getByText('机械效率')).toBeInTheDocument();
  });

  it('应显示惯量计算', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText('负载惯量')).toBeInTheDocument();
    expect(screen.getByText('总惯量')).toBeInTheDocument();
  });

  it('应显示扭矩分析', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText('加速扭矩')).toBeInTheDocument();
    expect(screen.getByText('恒速扭矩')).toBeInTheDocument();
    expect(screen.getByText('减速扭矩')).toBeInTheDocument();
    expect(screen.getByText('峰值扭矩')).toBeInTheDocument();
    expect(screen.getByText('RMS扭矩')).toBeInTheDocument();
  });

  it('应显示再生标记（当减速扭矩为负）', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    // 检查再生标记 (⚡再生)
    expect(screen.getByText(/再生/)).toBeInTheDocument();
  });

  it('不应显示再生标记（当减速扭矩为正）', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanicalNoRegen} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    // 不应该有再生标记
    expect(screen.queryByText(/再生/)).not.toBeInTheDocument();
  });

  it('应显示运动参数', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText('最大转速')).toBeInTheDocument();
    expect(screen.getByText('加速时间')).toBeInTheDocument();
    expect(screen.getByText('恒速时间')).toBeInTheDocument();
    expect(screen.getByText('减速时间')).toBeInTheDocument();
    expect(screen.getByText('停顿时间')).toBeInTheDocument();
    expect(screen.getByText('周期时间')).toBeInTheDocument();
    expect(screen.getByText('运动频率')).toBeInTheDocument();
  });

  it('应显示功率与能量', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText('峰值功率')).toBeInTheDocument();
    expect(screen.getByText('连续功率')).toBeInTheDocument();
    expect(screen.getByText('单次制动能量')).toBeInTheDocument();
    expect(screen.getByText('平均制动功率')).toBeInTheDocument();
    expect(screen.getByText('制动电阻')).toBeInTheDocument();
  });

  it('应显示外部电阻警告（当需要外部电阻时）', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText(/需要外部电阻/)).toBeInTheDocument();
  });

  it('应显示内置电阻足够（当不需要外部电阻时）', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanicalNoRegen} />);

    fireEvent.click(screen.getByText('详细计算信息'));

    expect(screen.getByText(/内置电阻足够/)).toBeInTheDocument();
  });

  it('支持 defaultExpanded 属性', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} defaultExpanded={true} />);

    // 卡片应该直接可见，不需要点击
    expect(screen.getByText('机械参数')).toBeInTheDocument();
    expect(screen.getByText('惯量计算')).toBeInTheDocument();
    expect(screen.getByText('扭矩分析')).toBeInTheDocument();
    expect(screen.getByText('运动参数')).toBeInTheDocument();
    expect(screen.getByText('功率与能量')).toBeInTheDocument();
  });

  it('再次点击应折叠', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);

    // 展开
    fireEvent.click(screen.getByText('详细计算信息'));
    expect(screen.getByText('惯量计算')).toBeInTheDocument();

    // 折叠
    fireEvent.click(screen.getByText('详细计算信息'));
    expect(screen.queryByText('惯量计算')).not.toBeInTheDocument();
  });
});
