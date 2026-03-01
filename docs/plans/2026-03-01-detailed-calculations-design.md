# 详细计算信息展示设计文档

**版本**: 1.0
**日期**: 2026-03-01
**适用范围**: XC20 + MC20 伺服系统选型工具 - 报告页面增强

---

## 1. 概述

### 1.1 设计目标

在选型报告页面增加可折叠的详细计算信息展示，为技术人员和工程师提供关键计算参数的完整视图，增强计算结果的可信度和可追溯性。

### 1.2 设计原则

- **分层展示**: 信息按类别分组，便于快速定位
- **关键参数**: 只展示计算结果和关键输入参数，不展示中间公式
- **专业呈现**: 数值格式化符合工程惯例，单位清晰标注
- **可折叠**: 默认折叠，不干扰主要信息的阅读

---

## 2. 组件架构

```
src/
├── components/
│   └── wizard/
│       └── DetailedCalculations.tsx    # 主组件：可折叠容器
├── lib/
│   └── calculations/
│       └── calculation-details.ts      # 工具函数：数据格式化
```

---

## 3. 数据结构

### 3.1 计算详情接口

```typescript
// src/types/calculation-details.ts (新增文件)

export interface CalculationDetails {
  /** 机械参数 */
  mechanism: {
    type: MechanismType;
    typeLabel: string;
    params: Array<{
      label: string;
      value: number | string;
      unit?: string;
    }>;
  };

  /** 惯量计算结果 */
  inertia: {
    loadInertia: number;           // kg·m²
    components?: Array<{
      name: string;
      value: number;
      unit: string;
    }>;
    totalInertia: number;          // kg·m²
  };

  /** 扭矩分析结果 */
  torques: {
    accel: number;                 // N·m
    constant: number;              // N·m
    decel: number;                 // N·m (负值表示再生)
    peak: number;                  // N·m
    rms: number;                   // N·m
    friction?: number;             // N·m
    gravity?: number;              // N·m
  };

  /** 运动参数 */
  motion: {
    maxSpeed: number;              // rpm
    maxSpeedLinear?: number;       // mm/s (直线运动)
    accelTime: number;             // s
    constantTime: number;          // s
    decelTime: number;             // s
    dwellTime: number;             // s
    cycleTime: number;             // s
    cyclesPerMinute: number;       // 次/分钟
  };

  /** 功率与能量 */
  power: {
    peak: number;                  // W
    continuous: number;            // W
  };
  regeneration: {
    energyPerCycle: number;        // J
    brakingPower: number;          // W
    requiresExternalResistor: boolean;
    recommendedResistor?: {
      minPower: number;            // W
      resistance: number;          // Ω
    };
  };
}
```

### 3.2 格式化选项接口

```typescript
export interface FormatOptions {
  precision?: number;              // 小数位数
  scientific?: boolean;            // 是否使用科学计数法
  threshold?: number;              // 科学计数法阈值
}
```

---

## 4. UI 设计

### 4.1 主容器（可折叠）

```tsx
<section className="border rounded-lg overflow-hidden">
  <button
    onClick={toggleExpanded}
    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100
               flex justify-between items-center transition-colors"
  >
    <span className="font-medium text-gray-800 flex items-center gap-2">
      <span>🔧</span>
      <span>详细计算信息</span>
    </span>
    <span className="text-gray-500">
      {isExpanded ? '▲' : '▼'}
    </span>
  </button>

  {isExpanded && (
    <div className="p-4 space-y-4 bg-gray-50/50">
      {/* 各卡片内容 */}
    </div>
  )}
</section>
```

### 4.2 卡片组件

```tsx
function CalculationCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-blue-50 border-b">
        <h4 className="font-medium text-blue-900">{title}</h4>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
```

### 4.3 参数行组件

```tsx
function ParamRow({
  label,
  value,
  unit,
  highlight
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: 'positive' | 'negative' | 'warning';
}) {
  const valueClass = cn(
    "font-mono font-medium",
    highlight === 'positive' && "text-green-700",
    highlight === 'negative' && "text-red-600",
    highlight === 'warning' && "text-yellow-700",
    !highlight && "text-gray-900"
  );

  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-700">{label}</span>
      <span className={valueClass}>
        {value} {unit && <span className="text-gray-500">{unit}</span>}
      </span>
    </div>
  );
}
```

---

## 5. 数值格式化规则

### 5.1 格式化函数

```typescript
// src/lib/calculations/calculation-details.ts

/**
 * 格式化惯量值
 * 小于 0.001 的使用科学计数法
 */
export function formatInertia(value: number): string {
  if (Math.abs(value) < 0.001) {
    return `${(value * 10000).toFixed(2)}×10⁻⁴`;
  }
  return value.toFixed(4);
}

/**
 * 格式化扭矩值
 * 固定2位小数，带符号显示
 */
export function formatTorque(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
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
 * 大于100取整，否则1位小数
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

### 5.2 格式化规则表

| 数据类型 | 单位 | 格式化方式 | 示例 |
|---------|------|-----------|------|
| 惯量 | kg·m² | <0.001用科学计数法 | `5.07×10⁻⁴` |
| 扭矩 | N·m | 固定2位小数，带符号 | `+4.85`, `-3.29` |
| 转速 | rpm | 整数 | `3000` |
| 线速度 | mm/s | 整数 | `500` |
| 时间 | s | 固定2位小数 | `0.10` |
| 功率 | W | ≥100取整，<100取1位 | `1520`, `512.5` |
| 能量 | J | 固定1位小数 | `25.6` |
| 频率 | 次/分钟 | 整数 | `60` |

---

## 6. 各卡片详细设计

### 6.1 机械参数卡片

显示内容根据负载类型动态变化：

**通用参数（所有类型）:**
- 负载类型
- 负载质量
- 减速比
- 机械效率
- 安装方向

**滚珠丝杠特有:**
- 丝杠导程
- 丝杠直径
- 丝杠长度
- 摩擦系数
- 预压扭矩

**齿轮/减速机特有:**
- 负载类型（转盘/滚筒/其他）
- 转盘/滚筒直径
- 摩擦扭矩
- 重力臂长

**直接驱动特有:**
- 驱动类型（旋转/直线）
- 转盘直径 / 行程

**同步带特有:**
- 主动轮直径
- 从动轮直径
- 皮带长度
- 皮带质量

**齿条齿轮特有:**
- 小齿轮直径
- 安装角度
- 摩擦系数

### 6.2 惯量计算卡片

```
┌─ 惯量计算 ─────────────────────────┐
│                                    │
│ 负载惯量:        5.07×10⁻⁴ kg·m²  │
│ 丝杠惯量:        1.23×10⁻⁵ kg·m²  │
│ ─────────────────────────────────  │
│ 总惯量:          5.19×10⁻⁴ kg·m²  │
│                                    │
└────────────────────────────────────┘
```

### 6.3 扭矩分析卡片

```
┌─ 扭矩分析 ─────────────────────────┐
│                                    │
│ 加速扭矩:        +4.85 N·m        │
│ 恒速扭矩:        +0.78 N·m        │
│ 减速扭矩:        -3.29 N·m  ⚡再生 │
│ ─────────────────────────────────  │
│ 峰值扭矩:         4.85 N·m        │
│ RMS扭矩:          2.14 N·m        │
│ ─────────────────────────────────  │
│ 摩擦扭矩:         0.78 N·m        │
│ 重力扭矩:         0.00 N·m        │
│                                    │
└────────────────────────────────────┘
```

**特殊标记:**
- 减速扭矩为负时，显示 `⚡再生` 标签
- 使用红色表示负值

### 6.4 运动参数卡片

```
┌─ 运动参数 ─────────────────────────┐
│                                    │
│ 最大转速:        3000 rpm         │
│ 最大线速度:      500 mm/s         │
│ ─────────────────────────────────  │
│ 加速时间:        0.10 s           │
│ 恒速时间:        0.23 s           │
│ 减速时间:        0.10 s           │
│ 停顿时间:        0.57 s           │
│ ─────────────────────────────────  │
│ 周期时间:        1.00 s           │
│ 运动频率:        60 次/分钟       │
│                                    │
└────────────────────────────────────┘
```

### 6.5 功率与能量卡片

```
┌─ 功率与能量 ───────────────────────┐
│                                    │
│ 峰值功率:        1520 W           │
│ 连续功率:         450 W           │
│ ─────────────────────────────────  │
│ 单次制动能量:     25.6 J           │
│ 平均制动功率:    512 W            │
│ 制动频率:        60 次/分钟       │
│ ─────────────────────────────────  │
│ 制动电阻: 需要外部电阻 ⚠️          │
│ 建议规格: ≥600W, 100Ω             │
│                                    │
└────────────────────────────────────┘
```

**特殊标记:**
- 需要外部电阻时，显示警告样式和 `⚠️` 图标
- 不需要时显示 `内置电阻足够 ✓`

---

## 7. 数据转换逻辑

### 7.1 从 SizingInput 和 MechanicalResult 提取数据

```typescript
export function extractCalculationDetails(
  input: SizingInput,
  mechanical: MechanicalResult
): CalculationDetails {
  return {
    mechanism: extractMechanismParams(input),
    inertia: extractInertiaResults(mechanical),
    torques: extractTorqueResults(mechanical),
    motion: extractMotionParams(input, mechanical),
    power: extractPowerResults(mechanical),
    regeneration: extractRegenerationResults(mechanical),
  };
}
```

### 7.2 机械参数提取

```typescript
function extractMechanismParams(input: SizingInput) {
  const { type, params } = input.mechanism;

  const baseParams = [
    { label: '负载质量', value: params.loadMass, unit: 'kg' },
    { label: '减速比', value: params.gearRatio },
    { label: '机械效率', value: `${(params.efficiency * 100).toFixed(0)}%` },
  ];

  switch (type) {
    case 'BALL_SCREW':
      return {
        type,
        typeLabel: '滚珠丝杠',
        params: [
          ...baseParams,
          { label: '丝杠导程', value: params.lead, unit: 'mm' },
          { label: '丝杠直径', value: params.screwDiameter, unit: 'mm' },
          { label: '丝杠长度', value: params.screwLength, unit: 'mm' },
          { label: '摩擦系数', value: params.frictionCoeff },
        ],
      };
    // ... 其他类型
  }
}
```

---

## 8. 集成方案

### 8.1 在 ResultStep.tsx 中集成

```tsx
// src/components/wizard/ResultStep.tsx

import { DetailedCalculations } from './DetailedCalculations';

export function ResultStep() {
  // ... 现有代码

  return (
    <div className="space-y-6">
      {/* 现有内容 */}

      {/* 选中电机的详细配置 */}
      {systemConfig && (
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* ... */}
        </div>
      )}

      {/* 新增：详细计算信息 */}
      <DetailedCalculations
        input={input}
        mechanical={result.mechanical}
      />

      {/* 按钮组 */}
      <div className="flex justify-between">
        {/* ... */}
      </div>
    </div>
  );
}
```

### 8.2 组件 Props 接口

```typescript
interface DetailedCalculationsProps {
  input: SizingInput;
  mechanical: MechanicalResult;
  defaultExpanded?: boolean;  // 默认是否展开
}
```

---

## 9. 复杂度分析

| 模块 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| 数据提取 | O(1) | O(1) | 固定字段映射 |
| 数值格式化 | O(1) | O(1) | 简单数学运算 |
| 渲染 | O(n) | O(1) | n为参数数量 |

---

## 10. 测试策略

### 10.1 单元测试

```typescript
// src/lib/calculations/__tests__/calculation-details.test.ts

describe('formatInertia', () => {
  it('应正确格式化小惯量值', () => {
    expect(formatInertia(0.000507)).toBe('5.07×10⁻⁴');
  });

  it('应正确格式化大惯量值', () => {
    expect(formatInertia(0.015)).toBe('0.0150');
  });
});

describe('extractCalculationDetails', () => {
  it('应正确提取滚珠丝杠参数', () => {
    const result = extractCalculationDetails(ballScrewInput, mechanicalResult);
    expect(result.mechanism.typeLabel).toBe('滚珠丝杠');
    expect(result.mechanism.params).toContainEqual(
      expect.objectContaining({ label: '丝杠导程', value: 10 })
    );
  });
});
```

### 10.2 组件测试

```typescript
// src/components/wizard/__tests__/DetailedCalculations.test.tsx

describe('DetailedCalculations', () => {
  it('应默认折叠', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    expect(screen.queryByText('惯量计算')).not.toBeInTheDocument();
  });

  it('点击标题应展开', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanical} />);
    fireEvent.click(screen.getByText('🔧 详细计算信息'));
    expect(screen.getByText('惯量计算')).toBeInTheDocument();
  });

  it('应显示再生标记', () => {
    render(<DetailedCalculations input={mockInput} mechanical={mockMechanicalWithRegen} />);
    fireEvent.click(screen.getByText('🔧 详细计算信息'));
    expect(screen.getByText('⚡再生')).toBeInTheDocument();
  });
});
```

---

## 11. 国际化支持

### 11.1 新增翻译键

```json
// messages/zh.json
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

---

## 12. 文档维护记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-01 | 初始版本 | - |
