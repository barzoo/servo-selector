# 详细计算信息展示功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在选型报告页面添加可折叠的详细计算信息展示组件，展示机械参数、惯量计算、扭矩分析、运动参数、功率与能量等关键计算数据。

**Architecture:** 采用分层卡片式UI设计，主组件 `DetailedCalculations` 控制折叠状态，内部使用 `CalculationCard` 子组件渲染各类计算数据。数据通过 `calculation-details.ts` 工具函数从 `SizingInput` 和 `MechanicalResult` 中提取并格式化。

**Tech Stack:** Next.js, React, TypeScript, TailwindCSS, next-intl (国际化)

---

## 前置条件

- 在独立 worktree 中工作
- 基于设计文档: `docs/plans/2026-03-01-detailed-calculations-design.md`

---

## Task 1: 创建数值格式化工具函数

**Files:**
- Create: `src/lib/calculations/calculation-details.ts`
- Test: `src/lib/calculations/__tests__/calculation-details.test.ts`

**Step 1: 编写测试**

```typescript
// src/lib/calculations/__tests__/calculation-details.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatInertia,
  formatTorque,
  formatSpeed,
  formatTime,
  formatPower,
  formatEnergy,
} from '../calculation-details';

describe('formatInertia', () => {
  it('应使用科学计数法格式化小惯量值', () => {
    expect(formatInertia(0.000507)).toBe('5.07×10⁻⁴');
    expect(formatInertia(0.0000123)).toBe('1.23×10⁻⁵');
  });

  it('应使用小数格式化大惯量值', () => {
    expect(formatInertia(0.015)).toBe('0.0150');
    expect(formatInertia(1.5)).toBe('1.5000');
  });
});

describe('formatTorque', () => {
  it('应格式化扭矩并添加正号', () => {
    expect(formatTorque(4.85)).toBe('+4.85');
    expect(formatTorque(0)).toBe('0.00');
  });

  it('应格式化负扭矩', () => {
    expect(formatTorque(-3.29)).toBe('-3.29');
  });
});

describe('formatSpeed', () => {
  it('应将转速格式化为整数', () => {
    expect(formatSpeed(3000.7)).toBe('3001');
    expect(formatSpeed(1500)).toBe('1500');
  });
});

describe('formatTime', () => {
  it('应将时间格式化为2位小数', () => {
    expect(formatTime(0.1)).toBe('0.10');
    expect(formatTime(0.1234)).toBe('0.12');
  });
});

describe('formatPower', () => {
  it('应将大功率格式化为整数', () => {
    expect(formatPower(1520.5)).toBe('1520');
  });

  it('应将小功率格式化为1位小数', () => {
    expect(formatPower(50.5)).toBe('50.5');
  });
});

describe('formatEnergy', () => {
  it('应将能量格式化为1位小数', () => {
    expect(formatEnergy(25.6)).toBe('25.6');
    expect(formatEnergy(25)).toBe('25.0');
  });
});
```

**Step 2: 运行测试（应失败）**

```bash
npm test -- src/lib/calculations/__tests__/calculation-details.test.ts
```

Expected: FAIL - "formatInertia is not defined"

**Step 3: 实现格式化函数**

```typescript
// src/lib/calculations/calculation-details.ts

/**
 * 格式化惯量值
 * 小于 0.001 的使用科学计数法 (×10⁻⁴)
 */
export function formatInertia(value: number): string {
  if (Math.abs(value) < 0.001) {
    const scaled = value * 10000;
    return `${scaled.toFixed(2)}×10⁻⁴`;
  }
  return value.toFixed(4);
}

/**
 * 格式化扭矩值
 * 固定2位小数，正值带+号
 */
export function formatTorque(value: number): string {
  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }
  return value.toFixed(2);
}

/**
 * 格式化转速
 * 整数显示
 */
export function formatSpeed(value: number): string {
  return Math.round(value).toString();
}

/**
 * 格式化时间
 * 固定2位小数
 */
export function formatTime(value: number): string {
  return value.toFixed(2);
}

/**
 * 格式化功率
 * 大于等于100取整，否则1位小数
 */
export function formatPower(value: number): string {
  if (value >= 100) {
    return Math.round(value).toString();
  }
  return value.toFixed(1);
}

/**
 * 格式化能量
 * 固定1位小数
 */
export function formatEnergy(value: number): string {
  return value.toFixed(1);
}
```

**Step 4: 运行测试（应通过）**

```bash
npm test -- src/lib/calculations/__tests__/calculation-details.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/calculations/calculation-details.ts
git add src/lib/calculations/__tests__/calculation-details.test.ts
git commit -m "feat(calculations): add number formatting utilities for calculation details"
```

---

## Task 2: 创建数据提取函数

**Files:**
- Modify: `src/lib/calculations/calculation-details.ts`
- Modify: `src/lib/calculations/__tests__/calculation-details.test.ts`

**Step 1: 添加类型定义和测试**

```typescript
// 在测试文件顶部添加
import type { SizingInput, MechanicalResult } from '@/types';
import { extractCalculationDetails } from '../calculation-details';

// 添加测试用例
describe('extractCalculationDetails', () => {
  const mockInput: SizingInput = {
    project: { name: 'Test', customer: 'Test', salesPerson: 'Test' },
    mechanism: {
      type: 'BALL_SCREW',
      params: {
        loadMass: 200,
        lead: 10,
        screwDiameter: 32,
        screwLength: 800,
        gearRatio: 1,
        efficiency: 0.9,
        frictionCoeff: 0.05,
        preloadTorque: 0,
      },
    },
    motion: {
      stroke: 500,
      maxVelocity: 500,
      maxAcceleration: 5000,
      profile: 'TRAPEZOIDAL',
      dwellTime: 0.5,
      cycleTime: 1.0,
    },
    duty: {
      ambientTemp: 40,
      dutyCycle: 80,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
    },
    preferences: {
      safetyFactor: 1.5,
      maxInertiaRatio: 10,
      targetInertiaRatio: 5,
      communication: 'ETHERCAT',
      safety: 'STO',
      cableLength: 5,
    },
  };

  const mockMechanical: MechanicalResult = {
    loadInertia: 0.000507,
    totalInertia: 0.000519,
    inertiaRatio: 2.5,
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
      cyclesPerMinute: 60,
      requiresExternalResistor: true,
      recommendedResistor: {
        minPower: 600,
        resistance: 100,
        dutyCycle: 5,
      },
    },
  };

  it('应正确提取机械参数', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);
    expect(result.mechanism.type).toBe('BALL_SCREW');
    expect(result.mechanism.typeLabel).toBe('滚珠丝杠');
    expect(result.mechanism.params).toContainEqual(
      expect.objectContaining({ label: '负载质量', value: 200, unit: 'kg' })
    );
  });

  it('应正确提取惯量计算结果', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);
    expect(result.inertia.loadInertia).toBe(0.000507);
    expect(result.inertia.totalInertia).toBe(0.000519);
  });

  it('应正确提取扭矩分析结果', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);
    expect(result.torques.accel).toBe(4.85);
    expect(result.torques.decel).toBe(-3.29);
    expect(result.torques.peak).toBe(4.85);
    expect(result.torques.rms).toBe(2.14);
  });

  it('应正确提取运动参数', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);
    expect(result.motion.maxSpeed).toBe(3000);
    expect(result.motion.cycleTime).toBe(1.0);
    expect(result.motion.cyclesPerMinute).toBe(60);
  });

  it('应正确提取功率与能量数据', () => {
    const result = extractCalculationDetails(mockInput, mockMechanical);
    expect(result.power.peak).toBe(1520);
    expect(result.power.continuous).toBe(450);
    expect(result.regeneration.energyPerCycle).toBe(25.6);
    expect(result.regeneration.requiresExternalResistor).toBe(true);
  });
});
```

**Step 2: 运行测试（应失败）**

```bash
npm test -- src/lib/calculations/__tests__/calculation-details.test.ts
```

Expected: FAIL - "extractCalculationDetails is not defined"

**Step 3: 实现数据提取函数**

```typescript
// 添加到 src/lib/calculations/calculation-details.ts

import type { SizingInput, MechanicalResult, MechanismType } from '@/types';

export interface CalculationDetails {
  mechanism: {
    type: MechanismType;
    typeLabel: string;
    params: Array<{
      label: string;
      value: number | string;
      unit?: string;
    }>;
  };
  inertia: {
    loadInertia: number;
    totalInertia: number;
  };
  torques: {
    accel: number;
    constant: number;
    decel: number;
    peak: number;
    rms: number;
    friction?: number;
    gravity?: number;
  };
  motion: {
    maxSpeed: number;
    maxSpeedLinear?: number;
    accelTime: number;
    constantTime: number;
    decelTime: number;
    dwellTime: number;
    cycleTime: number;
    cyclesPerMinute: number;
  };
  power: {
    peak: number;
    continuous: number;
  };
  regeneration: {
    energyPerCycle: number;
    brakingPower: number;
    cyclesPerMinute: number;
    requiresExternalResistor: boolean;
    recommendedResistor?: {
      minPower: number;
      resistance: number;
      dutyCycle: number;
    };
  };
}

/**
 * 从输入和计算结果中提取详细计算信息
 */
export function extractCalculationDetails(
  input: SizingInput,
  mechanical: MechanicalResult
): CalculationDetails {
  return {
    mechanism: extractMechanismParams(input),
    inertia: {
      loadInertia: mechanical.loadInertia,
      totalInertia: mechanical.totalInertia,
    },
    torques: mechanical.torques,
    motion: extractMotionParams(input, mechanical),
    power: mechanical.powers,
    regeneration: {
      ...mechanical.regeneration,
      cyclesPerMinute: mechanical.regeneration.cyclesPerMinute || 0,
    },
  };
}

/**
 * 提取机械参数
 */
function extractMechanismParams(input: SizingInput): CalculationDetails['mechanism'] {
  const { type, params } = input.mechanism;

  const typeLabels: Record<MechanismType, string> = {
    BALL_SCREW: '滚珠丝杠',
    GEARBOX: '齿轮/减速机',
    DIRECT_DRIVE: '直接驱动',
    BELT: '同步带',
    RACK_PINION: '齿条齿轮',
  };

  const baseParams: Array<{ label: string; value: number | string; unit?: string }> = [
    { label: '负载质量', value: params.loadMass, unit: 'kg' },
    { label: '减速比', value: params.gearRatio },
    { label: '机械效率', value: `${(params.efficiency * 100).toFixed(0)}%` },
  ];

  switch (type) {
    case 'BALL_SCREW':
      return {
        type,
        typeLabel: typeLabels[type],
        params: [
          ...baseParams,
          { label: '丝杠导程', value: params.lead, unit: 'mm' },
          { label: '丝杠直径', value: params.screwDiameter, unit: 'mm' },
          { label: '丝杠长度', value: params.screwLength, unit: 'mm' },
          { label: '摩擦系数', value: params.frictionCoeff },
        ],
      };

    case 'GEARBOX':
      const gearboxParams: Array<{ label: string; value: number | string; unit?: string }> = [
        ...baseParams,
        { label: '摩擦扭矩', value: params.frictionTorque, unit: 'N·m' },
        { label: '重力臂长', value: params.gravityArmLength, unit: 'mm' },
      ];
      if (params.loadType === 'TABLE' && params.tableDiameter) {
        gearboxParams.push({ label: '转盘直径', value: params.tableDiameter, unit: 'mm' });
      } else if (params.loadType === 'DRUM' && params.drumDiameter) {
        gearboxParams.push({ label: '滚筒直径', value: params.drumDiameter, unit: 'mm' });
      }
      return {
        type,
        typeLabel: typeLabels[type],
        params: gearboxParams,
      };

    case 'DIRECT_DRIVE':
      const ddParams = [...baseParams];
      if (params.driveType === 'ROTARY' && params.tableDiameter) {
        ddParams.push({ label: '转盘直径', value: params.tableDiameter, unit: 'mm' });
      } else if (params.driveType === 'LINEAR' && params.stroke) {
        ddParams.push({ label: '行程', value: params.stroke, unit: 'mm' });
      }
      return {
        type,
        typeLabel: typeLabels[type],
        params: ddParams,
      };

    case 'BELT':
      return {
        type,
        typeLabel: typeLabels[type],
        params: [
          ...baseParams,
          { label: '主动轮直径', value: params.pulleyDiameter, unit: 'mm' },
          { label: '从动轮直径', value: params.drivenPulleyDiameter, unit: 'mm' },
          { label: '皮带长度', value: params.beltLength, unit: 'mm' },
        ],
      };

    case 'RACK_PINION':
      return {
        type,
        typeLabel: typeLabels[type],
        params: [
          ...baseParams,
          { label: '小齿轮直径', value: params.pinionDiameter, unit: 'mm' },
          { label: '安装角度', value: params.mountingAngle, unit: '°' },
          { label: '摩擦系数', value: params.frictionCoeff },
        ],
      };

    default:
      return {
        type,
        typeLabel: typeLabels[type] || type,
        params: baseParams,
      };
  }
}

/**
 * 提取运动参数
 */
function extractMotionParams(
  input: SizingInput,
  mechanical: MechanicalResult
): CalculationDetails['motion'] {
  // 计算运动时间
  const v = input.motion.maxVelocity * 1e-3; // m/s
  const a = input.motion.maxAcceleration * 1e-3; // m/s²
  const s = input.motion.stroke * 1e-3; // m

  const t_accel = v / a;
  const s_accel = 0.5 * a * t_accel * t_accel;

  let t_constant: number;
  if (2 * s_accel <= s) {
    const s_constant = s - 2 * s_accel;
    t_constant = s_constant / v;
  } else {
    t_constant = 0;
  }

  return {
    maxSpeed: mechanical.speeds.max,
    maxSpeedLinear: input.motion.maxVelocity,
    accelTime: t_accel,
    constantTime: t_constant,
    decelTime: t_accel,
    dwellTime: input.motion.dwellTime,
    cycleTime: input.motion.cycleTime,
    cyclesPerMinute: mechanical.regeneration.cyclesPerMinute || Math.round(60 / input.motion.cycleTime),
  };
}
```

**Step 4: 运行测试（应通过）**

```bash
npm test -- src/lib/calculations/__tests__/calculation-details.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/calculations/calculation-details.ts
git add src/lib/calculations/__tests__/calculation-details.test.ts
git commit -m "feat(calculations): add calculation details extraction functions"
```

---

## Task 3: 创建 DetailedCalculations 组件

**Files:**
- Create: `src/components/wizard/DetailedCalculations.tsx`
- Test: `src/components/wizard/__tests__/DetailedCalculations.test.tsx`

**Step 1: 编写组件测试**

```typescript
// src/components/wizard/__tests__/DetailedCalculations.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailedCalculations } from '../DetailedCalculations';
import type { SizingInput, MechanicalResult } from '@/types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockInput: SizingInput = {
  project: { name: 'Test', customer: 'Test', salesPerson: 'Test' },
  mechanism: {
    type: 'BALL_SCREW',
    params: {
      loadMass: 200,
      lead: 10,
      screwDiameter: 32,
      screwLength: 800,
      gearRatio: 1,
      efficiency: 0.9,
      frictionCoeff: 0.05,
      preloadTorque: 0,
    },
  },
  motion: {
    stroke: 500,
    maxVelocity: 500,
    maxAcceleration: 5000,
    profile: 'TRAPEZOIDAL',
    dwellTime: 0.5,
    cycleTime: 1.0,
  },
  duty: {
    ambientTemp: 40,
    dutyCycle: 80,
    mountingOrientation: 'HORIZONTAL',
    ipRating: 'IP65',
    brake: false,
  },
  preferences: {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    communication: 'ETHERCAT',
    safety: 'STO',
    cableLength: 5,
  },
};

const mockMechanical: MechanicalResult = {
  loadInertia: 0.000507,
  totalInertia: 0.000519,
  inertiaRatio: 2.5,
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
    cyclesPerMinute: 60,
    requiresExternalResistor: true,
    recommendedResistor: {
      minPower: 600,
      resistance: 100,
      dutyCycle: 5,
    },
  },
};

describe('DetailedCalculations', () => {
  it('应默认折叠', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    expect(screen.queryByText('detailedCalculations.inertia')).not.toBeInTheDocument();
  });

  it('点击标题应展开', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    fireEvent.click(screen.getByText('detailedCalculations.title'));
    expect(screen.getByText('detailedCalculations.inertia')).toBeInTheDocument();
  });

  it('应显示机械参数', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    fireEvent.click(screen.getByText('detailedCalculations.title'));
    expect(screen.getByText('detailedCalculations.mechanism')).toBeInTheDocument();
  });

  it('应显示再生标记', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    fireEvent.click(screen.getByText('detailedCalculations.title'));
    expect(screen.getByText('detailedCalculations.labels.regenerative')).toBeInTheDocument();
  });

  it('应接受 defaultExpanded 属性', () => {
    render(
      <DetailedCalculations
        input={mockInput}
        mechanical={mockMechanical}
        defaultExpanded={true}
      />
    );
    expect(screen.getByText('detailedCalculations.inertia')).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试（应失败）**

```bash
npm test -- src/components/wizard/__tests__/DetailedCalculations.test.tsx
```

Expected: FAIL - "DetailedCalculations is not defined"

**Step 3: 实现组件**

```tsx
// src/components/wizard/DetailedCalculations.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SizingInput, MechanicalResult } from '@/types';
import {
  extractCalculationDetails,
  formatInertia,
  formatTorque,
  formatSpeed,
  formatTime,
  formatPower,
  formatEnergy,
} from '@/lib/calculations/calculation-details';
import { cn } from '@/lib/utils';

interface DetailedCalculationsProps {
  input: SizingInput;
  mechanical: MechanicalResult;
  defaultExpanded?: boolean;
}

export function DetailedCalculations({
  input,
  mechanical,
  defaultExpanded = false,
}: DetailedCalculationsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const t = useTranslations('detailedCalculations');

  const details = extractCalculationDetails(input, mechanical);

  return (
    <section className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
      >
        <span className="font-medium text-gray-800 flex items-center gap-2">
          <span>🔧</span>
          <span>{t('title')}</span>
        </span>
        <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-gray-50/50">
          <MechanismCard mechanism={details.mechanism} />
          <InertiaCard inertia={details.inertia} />
          <TorqueCard torques={details.torques} />
          <MotionCard motion={details.motion} />
          <PowerCard power={details.power} regeneration={details.regeneration} />
        </div>
      )}
    </section>
  );
}

// 机械参数卡片
function MechanismCard({
  mechanism,
}: {
  mechanism: ReturnType<typeof extractCalculationDetails>['mechanism'];
}) {
  const t = useTranslations('detailedCalculations');

  return (
    <CalculationCard title={t('mechanism')}>
      <div className="space-y-1">
        <ParamRow label={t('labels.loadType')} value={mechanism.typeLabel} />
        {mechanism.params.map((param, index) => (
          <ParamRow
            key={index}
            label={param.label}
            value={param.value}
            unit={param.unit}
          />
        ))}
      </div>
    </CalculationCard>
  );
}

// 惯量计算卡片
function InertiaCard({
  inertia,
}: {
  inertia: ReturnType<typeof extractCalculationDetails>['inertia'];
}) {
  const t = useTranslations('detailedCalculations');

  return (
    <CalculationCard title={t('inertia')}>
      <div className="space-y-1">
        <ParamRow
          label={t('labels.loadInertia')}
          value={formatInertia(inertia.loadInertia)}
          unit="kg·m²"
        />
        {inertia.components?.map((comp, index) => (
          <ParamRow
            key={index}
            label={comp.name}
            value={formatInertia(comp.value)}
            unit={comp.unit}
          />
        ))}
        <div className="border-t my-2" />
        <ParamRow
          label={t('labels.totalInertia')}
          value={formatInertia(inertia.totalInertia)}
          unit="kg·m²"
          highlight="positive"
        />
      </div>
    </CalculationCard>
  );
}

// 扭矩分析卡片
function TorqueCard({
  torques,
}: {
  torques: ReturnType<typeof extractCalculationDetails>['torques'];
}) {
  const t = useTranslations('detailedCalculations');

  return (
    <CalculationCard title={t('torques')}>
      <div className="space-y-1">
        <ParamRow
          label={t('labels.accelTorque')}
          value={formatTorque(torques.accel)}
          unit="N·m"
          highlight="positive"
        />
        <ParamRow
          label={t('labels.constantTorque')}
          value={formatTorque(torques.constant)}
          unit="N·m"
        />
        <ParamRow
          label={t('labels.decelTorque')}
          value={formatTorque(torques.decel)}
          unit="N·m"
          highlight={torques.decel < 0 ? 'negative' : undefined}
        >
          {torques.decel < 0 && (
            <span className="ml-2 text-xs text-yellow-600">⚡{t('labels.regenerative')}</span>
          )}
        </ParamRow>
        <div className="border-t my-2" />
        <ParamRow
          label={t('labels.peakTorque')}
          value={formatTorque(Math.abs(torques.peak))}
          unit="N·m"
          highlight="positive"
        />
        <ParamRow
          label={t('labels.rmsTorque')}
          value={formatTorque(torques.rms)}
          unit="N·m"
        />
        {(torques.friction !== undefined || torques.gravity !== undefined) && (
          <>
            <div className="border-t my-2" />
            {torques.friction !== undefined && (
              <ParamRow
                label={t('labels.frictionTorque')}
                value={formatTorque(torques.friction)}
                unit="N·m"
              />
            )}
            {torques.gravity !== undefined && (
              <ParamRow
                label={t('labels.gravityTorque')}
                value={formatTorque(torques.gravity)}
                unit="N·m"
              />
            )}
          </>
        )}
      </div>
    </CalculationCard>
  );
}

// 运动参数卡片
function MotionCard({
  motion,
}: {
  motion: ReturnType<typeof extractCalculationDetails>['motion'];
}) {
  const t = useTranslations('detailedCalculations');

  return (
    <CalculationCard title={t('motion')}>
      <div className="space-y-1">
        <ParamRow
          label={t('labels.maxSpeed')}
          value={formatSpeed(motion.maxSpeed)}
          unit="rpm"
        />
        {motion.maxSpeedLinear !== undefined && (
          <ParamRow
            label={t('labels.maxLinearSpeed')}
            value={formatSpeed(motion.maxSpeedLinear)}
            unit="mm/s"
          />
        )}
        <div className="border-t my-2" />
        <ParamRow
          label={t('labels.accelTime')}
          value={formatTime(motion.accelTime)}
          unit="s"
        />
        <ParamRow
          label={t('labels.constantTime')}
          value={formatTime(motion.constantTime)}
          unit="s"
        />
        <ParamRow
          label={t('labels.decelTime')}
          value={formatTime(motion.decelTime)}
          unit="s"
        />
        <ParamRow
          label={t('labels.dwellTime')}
          value={formatTime(motion.dwellTime)}
          unit="s"
        />
        <div className="border-t my-2" />
        <ParamRow
          label={t('labels.cycleTime')}
          value={formatTime(motion.cycleTime)}
          unit="s"
        />
        <ParamRow
          label={t('labels.cyclesPerMinute')}
          value={motion.cyclesPerMinute}
          unit={t('units.cpm')}
        />
      </div>
    </CalculationCard>
  );
}

// 功率与能量卡片
function PowerCard({
  power,
  regeneration,
}: {
  power: ReturnType<typeof extractCalculationDetails>['power'];
  regeneration: ReturnType<typeof extractCalculationDetails>['regeneration'];
}) {
  const t = useTranslations('detailedCalculations');

  return (
    <CalculationCard title={t('power')}>
      <div className="space-y-1">
        <ParamRow
          label={t('labels.peakPower')}
          value={formatPower(power.peak)}
          unit="W"
          highlight="positive"
        />
        <ParamRow
          label={t('labels.continuousPower')}
          value={formatPower(power.continuous)}
          unit="W"
        />
        <div className="border-t my-2" />
        <ParamRow
          label={t('labels.energyPerCycle')}
          value={formatEnergy(regeneration.energyPerCycle)}
          unit="J"
        />
        <ParamRow
          label={t('labels.brakingPower')}
          value={formatPower(regeneration.brakingPower)}
          unit="W"
        />
        <div className="border-t my-2" />
        <div className="flex justify-between py-1">
          <span className="text-gray-700">{t('labels.brakeResistor')}</span>
          {regeneration.requiresExternalResistor ? (
            <span className="text-yellow-700 font-medium">
              ⚠️ {t('labels.externalRequired')}
            </span>
          ) : (
            <span className="text-green-700 font-medium">
              ✓ {t('labels.internalSufficient')}
            </span>
          )}
        </div>
        {regeneration.requiresExternalResistor && regeneration.recommendedResistor && (
          <div className="text-sm text-gray-600 pl-4">
            ≥{regeneration.recommendedResistor.minPower}W, {regeneration.recommendedResistor.resistance}Ω
          </div>
        )}
      </div>
    </CalculationCard>
  );
}

// 卡片容器组件
function CalculationCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-blue-50 border-b">
        <h4 className="font-medium text-blue-900">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// 参数行组件
function ParamRow({
  label,
  value,
  unit,
  highlight,
  children,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: 'positive' | 'negative' | 'warning';
  children?: React.ReactNode;
}) {
  const valueClass = cn(
    'font-mono font-medium',
    highlight === 'positive' && 'text-green-700',
    highlight === 'negative' && 'text-red-600',
    highlight === 'warning' && 'text-yellow-700',
    !highlight && 'text-gray-900'
  );

  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-700">{label}</span>
      <span className={valueClass}>
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        {children}
      </span>
    </div>
  );
}
```

**Step 4: 运行测试（应通过）**

```bash
npm test -- src/components/wizard/__tests__/DetailedCalculations.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/DetailedCalculations.tsx
git add src/components/wizard/__tests__/DetailedCalculations.test.tsx
git commit -m "feat(ui): add DetailedCalculations component with collapsible cards"
```

---

## Task 4: 添加国际化翻译

**Files:**
- Modify: `messages/zh.json`
- Modify: `messages/en.json`

**Step 1: 添加中文翻译**

```json
// messages/zh.json - 在现有内容中添加
{
  "detailedCalculations": {
    "title": "详细计算信息",
    "mechanism": "机械参数",
    "inertia": "惯量计算",
    "torques": "扭矩分析",
    "motion": "运动参数",
    "power": "功率与能量",
    "labels": {
      "loadType": "负载类型",
      "loadMass": "负载质量",
      "gearRatio": "减速比",
      "efficiency": "机械效率",
      "lead": "丝杠导程",
      "screwDiameter": "丝杠直径",
      "screwLength": "丝杠长度",
      "frictionCoeff": "摩擦系数",
      "loadInertia": "负载惯量",
      "totalInertia": "总惯量",
      "accelTorque": "加速扭矩",
      "constantTorque": "恒速扭矩",
      "decelTorque": "减速扭矩",
      "peakTorque": "峰值扭矩",
      "rmsTorque": "RMS扭矩",
      "frictionTorque": "摩擦扭矩",
      "gravityTorque": "重力扭矩",
      "maxSpeed": "最大转速",
      "maxLinearSpeed": "最大线速度",
      "accelTime": "加速时间",
      "constantTime": "恒速时间",
      "decelTime": "减速时间",
      "dwellTime": "停顿时间",
      "cycleTime": "周期时间",
      "cyclesPerMinute": "运动频率",
      "peakPower": "峰值功率",
      "continuousPower": "连续功率",
      "energyPerCycle": "单次制动能量",
      "brakingPower": "平均制动功率",
      "brakeResistor": "制动电阻",
      "regenerative": "再生",
      "internalSufficient": "内置电阻足够",
      "externalRequired": "需要外部电阻"
    },
    "units": {
      "kg": "kg",
      "mm": "mm",
      "nm": "N·m",
      "rpm": "rpm",
      "mmps": "mm/s",
      "s": "s",
      "w": "W",
      "j": "J",
      "cpm": "次/分钟"
    }
  }
}
```

**Step 2: 添加英文翻译**

```json
// messages/en.json - 在现有内容中添加
{
  "detailedCalculations": {
    "title": "Detailed Calculations",
    "mechanism": "Mechanism Parameters",
    "inertia": "Inertia Calculation",
    "torques": "Torque Analysis",
    "motion": "Motion Parameters",
    "power": "Power & Energy",
    "labels": {
      "loadType": "Load Type",
      "loadMass": "Load Mass",
      "gearRatio": "Gear Ratio",
      "efficiency": "Efficiency",
      "lead": "Screw Lead",
      "screwDiameter": "Screw Diameter",
      "screwLength": "Screw Length",
      "frictionCoeff": "Friction Coefficient",
      "loadInertia": "Load Inertia",
      "totalInertia": "Total Inertia",
      "accelTorque": "Acceleration Torque",
      "constantTorque": "Constant Speed Torque",
      "decelTorque": "Deceleration Torque",
      "peakTorque": "Peak Torque",
      "rmsTorque": "RMS Torque",
      "frictionTorque": "Friction Torque",
      "gravityTorque": "Gravity Torque",
      "maxSpeed": "Max Speed",
      "maxLinearSpeed": "Max Linear Speed",
      "accelTime": "Acceleration Time",
      "constantTime": "Constant Speed Time",
      "decelTime": "Deceleration Time",
      "dwellTime": "Dwell Time",
      "cycleTime": "Cycle Time",
      "cyclesPerMinute": "Cycles per Minute",
      "peakPower": "Peak Power",
      "continuousPower": "Continuous Power",
      "energyPerCycle": "Energy per Cycle",
      "brakingPower": "Braking Power",
      "brakeResistor": "Brake Resistor",
      "regenerative": "Regenerative",
      "internalSufficient": "Internal Sufficient",
      "externalRequired": "External Required"
    },
    "units": {
      "kg": "kg",
      "mm": "mm",
      "nm": "N·m",
      "rpm": "rpm",
      "mmps": "mm/s",
      "s": "s",
      "w": "W",
      "j": "J",
      "cpm": "cpm"
    }
  }
}
```

**Step 3: Commit**

```bash
git add messages/zh.json messages/en.json
git commit -m "feat(i18n): add translations for detailed calculations"
```

---

## Task 5: 集成到 ResultStep

**Files:**
- Modify: `src/components/wizard/ResultStep.tsx`

**Step 1: 导入组件**

```tsx
// 在 ResultStep.tsx 顶部添加导入
import { DetailedCalculations } from './DetailedCalculations';
```

**Step 2: 在合适位置插入组件**

```tsx
// 在 ResultStep 组件的 JSX 中，systemConfig 之后，按钮组之前插入

{systemConfig && (
  <div className="bg-gray-50 p-4 rounded-lg">
    {/* 现有系统配置内容 */}
  </div>
)}

{/* 新增：详细计算信息 */}
{input && (
  <DetailedCalculations
    input={input}
    mechanical={result.mechanical}
  />
)}

<div className="flex justify-between">
  {/* 按钮组 */}
</div>
```

**Step 3: 验证构建**

```bash
npm run build
```

Expected: 构建成功，无错误

**Step 4: Commit**

```bash
git add src/components/wizard/ResultStep.tsx
git commit -m "feat(ui): integrate DetailedCalculations into ResultStep"
```

---

## Task 6: 运行完整测试套件

**Step 1: 运行所有测试**

```bash
npm test
```

Expected: 所有测试通过

**Step 2: 构建验证**

```bash
npm run build
```

Expected: 构建成功

**Step 3: Commit（如需要修复）**

```bash
git commit -m "test: verify all tests pass for detailed calculations feature" || echo "No changes to commit"
```

---

## Task 7: 合并到 Master

**Step 1: 切换到 master 分支**

```bash
git checkout master
```

**Step 2: 合并 worktree 分支**

```bash
git merge <worktree-branch-name>
```

**Step 3: 推送（如需要）**

```bash
git push origin master
```

---

## 验证清单

- [ ] `formatInertia` 正确格式化小惯量值为科学计数法
- [ ] `formatTorque` 正确添加正负号
- [ ] `extractCalculationDetails` 正确提取所有负载类型的参数
- [ ] `DetailedCalculations` 组件默认折叠
- [ ] 点击标题可展开/折叠
- [ ] 显示5个卡片：机械参数、惯量计算、扭矩分析、运动参数、功率与能量
- [ ] 减速扭矩为负时显示再生标记
- [ ] 需要外部电阻时显示警告
- [ ] 所有数值格式化符合规范
- [ ] 中英文翻译完整
- [ ] 所有测试通过
- [ ] 构建成功
