# 系统配置详情信息展示改进实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 改进系统配置详情页面的信息展示，采用"摘要表格 + 详细信息 + 计算信息"的三层结构

**Architecture:** 扩展数据预处理脚本生成产品描述，增强 SystemSummary 组件添加表格视图，保持向后兼容

**Tech Stack:** TypeScript, React, Next.js, TailwindCSS

---

## Task 1: 添加描述生成函数到数据预处理脚本

**Files:**
- Modify: `scripts/convert-product-data.ts`
- Test: `scripts/__tests__/convert-product-data.test.ts` (创建)

**Step 1: 编写测试验证描述生成函数**

```typescript
// scripts/__tests__/convert-product-data.test.ts
import { describe, it, expect } from 'vitest';
import { generateMotorDescription, generateDriveDescription, generateCableDescription } from '../convert-product-data';

describe('Description Generation', () => {
  it('should generate motor description with all key info', () => {
    const motor = {
      ratedTorque: 0.64,
      ratedSpeed: 3000,
      options: {
        encoder: { code: 'A', type: 'BATTERY_MULTI_TURN' },
        brake: { hasBrake: true },
        keyShaft: { hasKey: true }
      }
    };
    const desc = generateMotorDescription(motor as any);
    expect(desc).toBe('0.64 N·m, 3000 rpm, A型编码器, 带抱闸, 带键轴');
  });

  it('should generate drive description with all key info', () => {
    const drive = {
      maxCurrent: 1.5,
      communication: { type: 'ETHERCAT' },
      options: { safety: { code: 'NN' } }
    };
    const desc = generateDriveDescription(drive as any);
    expect(desc).toBe('1.5A 峰值, EtherCAT通讯, 无STO');
  });

  it('should generate cable description', () => {
    const desc = generateCableDescription('MOTOR', 5, 'MCL22');
    expect(desc).toBe('动力电缆, 5m, 高柔性屏蔽');
  });
});
```

**Step 2: 运行测试验证失败**

Run: `npm test scripts/__tests__/convert-product-data.test.ts`
Expected: FAIL - "generateMotorDescription is not defined"

**Step 3: 添加描述生成函数到脚本**

在 `scripts/convert-product-data.ts` 的 `// Utility Functions` 部分后添加：

```typescript
// ============================================================================
// Description Generation Functions
// ============================================================================

/**
 * Generate short description for motor
 * Format: {ratedTorque}N·m, {ratedSpeed}rpm, {encoderType}, {brakeStatus}, {keyShaftStatus}
 *
 * Complexity: O(1) - constant time string concatenation
 */
function generateMotorDescription(motor: MC20Motor): string {
  const encoderType = motor.options.encoder.code === 'A' ? 'A型编码器' : 'B型编码器';
  const brakeStatus = motor.options.brake.hasBrake ? '带抱闸' : '无抱闸';
  const keyStatus = motor.options.keyShaft.hasKey ? '带键轴' : '光轴';

  return `${motor.ratedTorque} N·m, ${motor.ratedSpeed} rpm, ${encoderType}, ${brakeStatus}, ${keyStatus}`;
}

/**
 * Generate short description for drive
 * Format: {maxCurrent}A 峰值, {communicationType}, {stoStatus}
 *
 * Complexity: O(1) - constant time string concatenation
 */
function generateDriveDescription(drive: XC20Drive): string {
  const commMap: Record<string, string> = {
    'ETHERCAT': 'EtherCAT通讯',
    'PROFINET': 'PROFINET通讯',
    'ETHERNET_IP': 'EtherNet/IP通讯',
  };
  const commType = commMap[drive.communication.type] || drive.communication.type;
  const stoStatus = drive.options.safety.code === 'STO' ? '带STO' : '无STO';

  return `${drive.maxCurrent}A 峰值, ${commType}, ${stoStatus}`;
}

/**
 * Generate short description for cable
 * Format: {cableType}, {length}m, {feature}
 *
 * Complexity: O(1) - constant time string concatenation
 */
function generateCableDescription(
  cableType: 'MOTOR' | 'ENCODER' | 'COMMUNICATION',
  length: number,
  spec: string
): string {
  const typeMap: Record<string, string> = {
    'MOTOR': '动力电缆',
    'ENCODER': '编码器电缆',
    'COMMUNICATION': '通讯电缆',
  };

  const type = typeMap[cableType] || cableType;

  // Determine feature based on spec code
  let feature = '标准型';
  if (cableType === 'MOTOR') {
    feature = '高柔性屏蔽';
  } else if (cableType === 'ENCODER') {
    feature = spec.includes('12') ? '电池盒式专用' : '机械式专用';
  } else if (cableType === 'COMMUNICATION') {
    feature = 'EtherCAT专用';
  }

  return `${type}, ${length}m, ${feature}`;
}

// Export for testing
export { generateMotorDescription, generateDriveDescription, generateCableDescription };
```

**Step 4: 运行测试验证通过**

Run: `npm test scripts/__tests__/convert-product-data.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add scripts/__tests__/convert-product-data.test.ts scripts/convert-product-data.ts
git commit -m "feat: add product description generation functions"
```

---

## Task 2: 更新电机和驱动数据结构添加描述字段

**Files:**
- Modify: `scripts/convert-product-data.ts` (processMotorData 和 processDriveData 函数)

**Step 1: 修改 processMotorData 函数添加描述**

在 `scripts/convert-product-data.ts` 中，找到 `processMotorData` 函数，在返回前为每个电机添加描述：

```typescript
// Around line 451, before motors.push(motor), add:
const motorWithDescription = {
  ...motor,
  description: {
    short: generateMotorDescription(motor),
  }
};

motors.push(motorWithDescription);
```

**Step 2: 修改 processDriveData 函数添加描述**

在 `scripts/convert-product-data.ts` 中，找到 `processDriveData` 函数，在返回前为每个驱动添加描述：

```typescript
// Around line 563, before drives.push(drive), add:
const driveWithDescription = {
  ...drive,
  description: {
    short: generateDriveDescription(drive),
  }
};

drives.push(driveWithDescription);
```

**Step 3: 更新 MC20Motor 和 XC20Drive 接口添加描述类型**

在 `scripts/convert-product-data.ts` 中，更新接口定义：

```typescript
// Around line 24, add to MC20Motor interface:
interface MC20Motor {
  // ... existing fields ...
  description: {
    short: string;
  };
}

// Around line 97, add to XC20Drive interface:
interface XC20Drive {
  // ... existing fields ...
  description: {
    short: string;
  };
}
```

**Step 4: 运行脚本验证输出**

Run: `npx ts-node scripts/convert-product-data.ts`
Expected: 脚本成功运行，生成的 JSON 包含 description 字段

**Step 5: 验证生成的 JSON**

Run: `cat src/data/motors.json | head -100`
Expected: 电机对象包含 `description: { short: "..." }`

Run: `cat src/data/drives.json | head -100`
Expected: 驱动对象包含 `description: { short: "..." }`

**Step 6: 提交**

```bash
git add scripts/convert-product-data.ts src/data/motors.json src/data/drives.json
git commit -m "feat: add description field to motor and drive data"
```

---

## Task 3: 更新类型定义添加 ProductDescription

**Files:**
- Modify: `src/types/index.ts`

**Step 1: 添加 ProductDescription 类型**

在 `src/types/index.ts` 中，在 `// ============ 产品数据 ============` 部分添加：

```typescript
// 产品描述
export interface ProductDescription {
  short: string;      // 简短描述（表格用）
  detailed?: string;  // 详细描述（可选扩展）
}
```

**Step 2: 更新 MC20Motor 接口**

在 `src/types/index.ts` 中，找到 `MC20Motor` 接口，在 `cableSpecs` 后添加：

```typescript
export interface MC20Motor {
  // ... existing fields ...
  cableSpecs: {
    motorCable: string;
    encoderCable: string;
  };
  description: ProductDescription;  // 新增
}
```

**Step 3: 更新 XC20Drive 接口**

在 `src/types/index.ts` 中，找到 `XC20Drive` 接口，在 `compatibleMotors` 后添加：

```typescript
export interface XC20Drive {
  // ... existing fields ...
  compatibleMotors: string[];
  description: ProductDescription;  // 新增
}
```

**Step 4: 添加导出数据相关类型**

在 `src/types/index.ts` 文件末尾添加：

```typescript
// ============ 导出数据 ============

export interface SummaryItem {
  partNumber: string;
  category: 'MOTOR' | 'DRIVE' | 'MOTOR_CABLE' | 'ENCODER_CABLE' | 'COMM_CABLE' | 'BRAKE_RESISTOR' | 'EMC_FILTER';
  typeLabel: string;
  description: string;
}

export interface SystemConfigExportData {
  summary: SummaryItem[];
  details: {
    motor: MC20Motor | null;
    drive: XC20Drive | null;
    cables: {
      motor: { model: string; length: number; description: string } | null;
      encoder: { model: string; length: number; description: string } | null;
      communication?: { length: number; description: string } | null;
    };
    accessories: {
      brakeResistor?: { model: string; partNumber: string } | null;
      emcFilter?: string | null;
    };
  };
  calculations?: MechanicalResult;
  project?: ProjectInfo;
}
```

**Step 5: 运行类型检查**

Run: `npm run build`
Expected: 类型检查通过，无错误

**Step 6: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: add ProductDescription type and export data interfaces"
```

---

## Task 4: 增强 SystemSummary 组件添加表格视图

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx`
- Test: `src/components/wizard/__tests__/SystemSummary.test.tsx` (创建)

**Step 1: 编写测试验证表格渲染**

```typescript
// src/components/wizard/__tests__/SystemSummary.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemSummary } from '../SystemSummary';
import type { SystemConfiguration, MechanicalResult } from '@/types';

const mockConfig: SystemConfiguration = {
  motor: {
    model: 'MC20-060-3L30-N201-0APLNNNN',
    partNumber: 'MC20-060-3L30-N201-0APLNNNN',
    options: { brake: false, encoderType: 'A', keyShaft: false }
  },
  drive: {
    model: 'XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN',
    partNumber: 'XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN',
    options: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'NONE' }
  },
  cables: {
    motor: { spec: 'MCL22', length: 5, partNumber: 'MCL2205' },
    encoder: { spec: 'MCE12', length: 5, partNumber: 'MCE1205' }
  },
  accessories: {}
};

describe('SystemSummary', () => {
  it('renders summary table with all items', () => {
    render(<SystemSummary config={mockConfig} />);

    // Check table headers
    expect(screen.getByText('订货号')).toBeInTheDocument();
    expect(screen.getByText('类型')).toBeInTheDocument();
    expect(screen.getByText('描述')).toBeInTheDocument();

    // Check motor row
    expect(screen.getByText('MC20-060-3L30-N201-0APLNNNN')).toBeInTheDocument();
    expect(screen.getByText('伺服电机')).toBeInTheDocument();
  });

  it('renders detailed configuration sections', () => {
    render(<SystemSummary config={mockConfig} />);

    expect(screen.getByText('电机详细参数')).toBeInTheDocument();
    expect(screen.getByText('驱动详细参数')).toBeInTheDocument();
    expect(screen.getByText('电缆规格')).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试验证失败**

Run: `npm test src/components/wizard/__tests__/SystemSummary.test.tsx`
Expected: FAIL - 组件不存在或缺少表格渲染

**Step 3: 重写 SystemSummary 组件**

```tsx
// src/components/wizard/SystemSummary.tsx
'use client';

import type { SystemConfiguration, MechanicalResult, SummaryItem, SystemConfigExportData } from '@/types';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';

interface SystemSummaryProps {
  config: SystemConfiguration;
  mechanical?: MechanicalResult;
}

/**
 * Find motor by part number from motors.json
 */
function findMotor(partNumber: string) {
  return (motorsData as any).motors.find((m: any) => m.model === partNumber);
}

/**
 * Find drive by part number from drives.json
 */
function findDrive(partNumber: string) {
  return (drivesData as any).drives.find((d: any) => d.model === partNumber);
}

/**
 * Generate cable description
 */
function getCableDescription(type: 'MOTOR' | 'ENCODER' | 'COMM', length: number, spec: string): string {
  const typeMap = {
    'MOTOR': '动力电缆',
    'ENCODER': '编码器电缆',
    'COMM': '通讯电缆',
  };

  let feature = '标准型';
  if (type === 'MOTOR') {
    feature = '高柔性屏蔽';
  } else if (type === 'ENCODER') {
    feature = spec.includes('12') ? '电池盒式专用' : '机械式专用';
  } else if (type === 'COMM') {
    feature = 'EtherCAT专用';
  }

  return `${typeMap[type]}, ${length}m, ${feature}`;
}

/**
 * Build summary items for table display
 */
function buildSummaryItems(config: SystemConfiguration): SummaryItem[] {
  const items: SummaryItem[] = [];

  // Motor
  const motor = findMotor(config.motor.partNumber);
  items.push({
    partNumber: config.motor.partNumber,
    category: 'MOTOR',
    typeLabel: '伺服电机',
    description: motor?.description?.short || '电机',
  });

  // Drive
  const drive = findDrive(config.drive.partNumber);
  items.push({
    partNumber: config.drive.partNumber,
    category: 'DRIVE',
    typeLabel: '伺服驱动',
    description: drive?.description?.short || '驱动器',
  });

  // Motor Cable
  items.push({
    partNumber: config.cables.motor.partNumber,
    category: 'MOTOR_CABLE',
    typeLabel: `动力电缆 (${config.cables.motor.length}m)`,
    description: getCableDescription('MOTOR', config.cables.motor.length, config.cables.motor.spec),
  });

  // Encoder Cable
  items.push({
    partNumber: config.cables.encoder.partNumber,
    category: 'ENCODER_CABLE',
    typeLabel: `编码器电缆 (${config.cables.encoder.length}m)`,
    description: getCableDescription('ENCODER', config.cables.encoder.length, config.cables.encoder.spec),
  });

  // Communication Cable (if present)
  if (config.cables.communication) {
    items.push({
      partNumber: config.cables.communication.partNumber,
      category: 'COMM_CABLE',
      typeLabel: `通讯电缆 (${config.cables.communication.length}m)`,
      description: getCableDescription('COMM', config.cables.communication.length, 'COMM'),
    });
  }

  // Brake Resistor (if present)
  if (config.accessories.brakeResistor) {
    items.push({
      partNumber: config.accessories.brakeResistor.partNumber,
      category: 'BRAKE_RESISTOR',
      typeLabel: '制动电阻',
      description: config.accessories.brakeResistor.model,
    });
  }

  // EMC Filter (if present)
  if (config.accessories.emcFilter) {
    items.push({
      partNumber: config.accessories.emcFilter,
      category: 'EMC_FILTER',
      typeLabel: 'EMC滤波器',
      description: 'EMC滤波器',
    });
  }

  return items;
}

/**
 * Generate export data structure for PDF generation
 */
export function generateExportData(
  config: SystemConfiguration,
  mechanical?: MechanicalResult
): SystemConfigExportData {
  const motor = findMotor(config.motor.partNumber);
  const drive = findDrive(config.drive.partNumber);

  return {
    summary: buildSummaryItems(config),
    details: {
      motor: motor || null,
      drive: drive || null,
      cables: {
        motor: {
          model: config.cables.motor.partNumber,
          length: config.cables.motor.length,
          description: getCableDescription('MOTOR', config.cables.motor.length, config.cables.motor.spec),
        },
        encoder: {
          model: config.cables.encoder.partNumber,
          length: config.cables.encoder.length,
          description: getCableDescription('ENCODER', config.cables.encoder.length, config.cables.encoder.spec),
        },
        communication: config.cables.communication ? {
          length: config.cables.communication.length,
          description: getCableDescription('COMM', config.cables.communication.length, 'COMM'),
        } : null,
      },
      accessories: {
        brakeResistor: config.accessories.brakeResistor || null,
        emcFilter: config.accessories.emcFilter || null,
      },
    },
    calculations: mechanical,
  };
}

export function SystemSummary({ config, mechanical }: SystemSummaryProps) {
  const summaryItems = buildSummaryItems(config);
  const motor = findMotor(config.motor.partNumber);
  const drive = findDrive(config.drive.partNumber);

  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">系统配置摘要</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">订货号</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">类型</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summaryItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.partNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{item.typeLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-gray-900">详细信息</h4>

        {/* Motor Details */}
        {motor && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3">电机详细参数</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">型号:</span>
                <span className="ml-2 font-mono text-gray-900">{motor.model}</span>
              </div>
              <div>
                <span className="text-gray-500">额定扭矩:</span>
                <span className="ml-2 text-gray-900">{motor.ratedTorque} N·m</span>
              </div>
              <div>
                <span className="text-gray-500">峰值扭矩:</span>
                <span className="ml-2 text-gray-900">{motor.peakTorque} N·m</span>
              </div>
              <div>
                <span className="text-gray-500">额定转速:</span>
                <span className="ml-2 text-gray-900">{motor.ratedSpeed} rpm</span>
              </div>
              <div>
                <span className="text-gray-500">最高转速:</span>
                <span className="ml-2 text-gray-900">{motor.maxSpeed} rpm</span>
              </div>
              <div>
                <span className="text-gray-500">转子惯量:</span>
                <span className="ml-2 text-gray-900">{(motor.rotorInertia * 1e4).toFixed(2)} kg·cm²</span>
              </div>
              <div>
                <span className="text-gray-500">编码器:</span>
                <span className="ml-2 text-gray-900">
                  {motor.options.encoder.type === 'BATTERY_MULTI_TURN' ? 'A型(电池)' : 'B型(机械)'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">抱闸:</span>
                <span className="ml-2 text-gray-900">{motor.options.brake.hasBrake ? '有' : '无'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Drive Details */}
        {drive && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3">驱动详细参数</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">型号:</span>
                <span className="ml-2 font-mono text-gray-900">{drive.model}</span>
              </div>
              <div>
                <span className="text-gray-500">峰值电流:</span>
                <span className="ml-2 text-gray-900">{drive.maxCurrent} A</span>
              </div>
              <div>
                <span className="text-gray-500">额定电流:</span>
                <span className="ml-2 text-gray-900">{drive.ratedCurrent} A</span>
              </div>
              <div>
                <span className="text-gray-500">通讯方式:</span>
                <span className="ml-2 text-gray-900">{drive.communication.type}</span>
              </div>
              <div>
                <span className="text-gray-500">尺寸:</span>
                <span className="ml-2 text-gray-900">{drive.size}</span>
              </div>
              <div>
                <span className="text-gray-500">风扇:</span>
                <span className="ml-2 text-gray-900">{drive.hasFan ? '有' : '无'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Cable Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-800 mb-3">电缆规格</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">动力电缆:</span>
              <span className="ml-2 font-mono text-gray-900">{config.cables.motor.partNumber}</span>
              <span className="ml-2 text-gray-600">({config.cables.motor.length}m)</span>
            </div>
            <div>
              <span className="text-gray-500">编码器电缆:</span>
              <span className="ml-2 font-mono text-gray-900">{config.cables.encoder.partNumber}</span>
              <span className="ml-2 text-gray-600">({config.cables.encoder.length}m)</span>
            </div>
            {config.cables.communication && (
              <div>
                <span className="text-gray-500">通讯电缆:</span>
                <span className="ml-2 font-mono text-gray-900">{config.cables.communication.partNumber}</span>
                <span className="ml-2 text-gray-600">({config.cables.communication.length}m)</span>
              </div>
            )}
          </div>
        </div>

        {/* Accessories */}
        {(config.accessories.brakeResistor || config.accessories.emcFilter) && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3">配件信息</h5>
            <div className="space-y-2 text-sm">
              {config.accessories.brakeResistor && (
                <div>
                  <span className="text-gray-500">制动电阻:</span>
                  <span className="ml-2 font-mono text-gray-900">{config.accessories.brakeResistor.partNumber}</span>
                </div>
              )}
              {config.accessories.emcFilter && (
                <div>
                  <span className="text-gray-500">EMC滤波器:</span>
                  <span className="ml-2 font-mono text-gray-900">{config.accessories.emcFilter}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Regeneration Info */}
      {mechanical?.regeneration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">制动能量分析</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-yellow-700">单次制动能量:</span>
              <span className="ml-2 font-medium text-yellow-900">
                {mechanical.regeneration.energyPerCycle.toFixed(1)} J
              </span>
            </div>
            <div>
              <span className="text-yellow-700">平均制动功率:</span>
              <span className="ml-2 font-medium text-yellow-900">
                {mechanical.regeneration.brakingPower.toFixed(1)} W
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: 运行测试验证通过**

Run: `npm test src/components/wizard/__tests__/SystemSummary.test.tsx`
Expected: PASS

**Step 5: 运行构建验证**

Run: `npm run build`
Expected: 构建成功，无类型错误

**Step 6: 提交**

```bash
git add src/components/wizard/SystemSummary.tsx src/components/wizard/__tests__/SystemSummary.test.tsx
git commit -m "feat: enhance SystemSummary with table view and export data structure"
```

---

## Task 5: 更新 ResultStep 集成新的 SystemSummary

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 更新 ResultStep 导入**

在 `src/components/wizard/steps/ResultStep.tsx` 中，更新导入：

```typescript
import { SystemSummary, generateExportData } from '../SystemSummary';
```

**Step 2: 替换原有的系统配置详情部分**

找到原有的系统配置详情部分（约161-201行），替换为：

```tsx
{/* 系统配置详情 - 使用新的 SystemSummary 组件 */}
{systemConfig && (
  <SystemSummary
    config={{
      motor: {
        model: motor.model,
        partNumber: config.motor.partNumber,
        options: config.motor.options,
      },
      drive: {
        model: systemConfig.drive.model,
        partNumber: config.drive.partNumber,
        options: config.drive.options,
      },
      cables: config.cables,
      accessories: config.accessories,
    }}
    mechanical={result.mechanical}
  />
)}
```

**Step 3: 添加导出按钮功能**

在导出PDF按钮的 onClick 处理中添加：

```tsx
const handleExport = () => {
  if (systemConfig) {
    const exportData = generateExportData({
      motor: { model: motor.model, partNumber: config.motor.partNumber, options: config.motor.options },
      drive: { model: systemConfig.drive.model, partNumber: config.drive.partNumber, options: config.drive.options },
      cables: config.cables,
      accessories: config.accessories,
    }, result.mechanical);

    // TODO: Implement actual PDF export
    console.log('Export data:', exportData);
    alert('导出数据已生成，PDF功能开发中...\n' + JSON.stringify(exportData.summary, null, 2));
  }
};

// 在按钮中使用
<button
  onClick={handleExport}
  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
>
  {t('exportPdf')}
</button>
```

**Step 4: 运行构建验证**

Run: `npm run build`
Expected: 构建成功

**Step 5: 提交**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat: integrate new SystemSummary in ResultStep with export functionality"
```

---

## Task 6: 运行完整测试套件

**Files:**
- All test files

**Step 1: 运行单元测试**

Run: `npm test`
Expected: All tests pass

**Step 2: 运行构建验证**

Run: `npm run build`
Expected: Build successful

**Step 3: 提交最终版本**

```bash
git commit -m "feat: complete system config summary display enhancement"
```

---

## 验收检查清单

- [ ] 摘要表格正确显示所有配置项的订货号、类型和描述
- [ ] 电机描述包含：扭矩、转速、编码器类型、抱闸、轴类型
- [ ] 驱动描述包含：峰值电流、通讯方式、STO状态
- [ ] 电缆描述包含：类型、长度、特性
- [ ] 详细信息部分显示电机、驱动、电缆、配件的完整参数
- [ ] 导出数据结构可用于PDF生成
- [ ] 所有测试通过
- [ ] 构建成功
