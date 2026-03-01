# 制动电阻选型算法实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现制动电阻选型算法，根据机械参数和运动参数判断是否需要外部制动电阻，并在需要时提供推荐规格。

**Architecture:** 创建独立的 `BrakingResistorCalculator` 类，封装制动电阻计算逻辑。与现有的 `MechanicalCalculator` 和 `SizingEngine` 集成，在选型结果中提供制动电阻建议。

**Tech Stack:** TypeScript, Vitest (测试), Next.js (前端展示)

---

## 前置检查

### Task 0: 验证现有数据结构

**Files:**
- Read: `src/types/index.ts`
- Read: `src/data/drives.json`
- Read: `src/lib/calculations/mechanical.ts`
- Read: `src/lib/calculations/sizing-engine.ts`

**Step 1: 确认类型定义**

检查 `RegenerationResult` 类型是否已包含所需字段：
- `energyPerCycle: number`
- `brakingPower: number`
- `requiresExternalResistor: boolean`

**Step 2: 确认驱动器数据**

检查 `drives.json` 中是否包含制动电阻数据：
- `braking.continuousPower`
- `braking.internalResistance`
- `braking.peakPower`

**Step 3: 确认现有计算逻辑**

检查 `mechanical.ts` 中的 `calculateRegeneration` 方法实现。

---

## 核心算法实现

### Task 1: 创建 BrakingResistorCalculator 类

**Files:**
- Create: `src/lib/calculations/braking-resistor.ts`
- Test: `src/lib/calculations/__tests__/braking-resistor.test.ts`

**Step 1: 编写测试文件**

```typescript
// src/lib/calculations/__tests__/braking-resistor.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BrakingResistorCalculator, BrakingResistorInput } from '../braking-resistor';

describe('BrakingResistorCalculator', () => {
  let calculator: BrakingResistorCalculator;

  beforeEach(() => {
    calculator = new BrakingResistorCalculator();
  });

  describe('内置电阻足够的情况', () => {
    it('应正确判断小惯量低频制动场景', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.001,        // 1 kg·cm²
        maxAngularSpeed: 104.7,      // 1000 rpm in rad/s
        cyclesPerMinute: 5,
        driveBraking: {
          continuousPower: 40,
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.energyPerCycle).toBeCloseTo(5.48, 1);
      expect(result.brakingPower).toBeCloseTo(0.46, 1);
      expect(result.requiresExternalResistor).toBe(false);
      expect(result.recommendedResistor).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });

    it('应正确处理边界值 - 刚好等于持续功率', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.01,
        maxAngularSpeed: 100,
        cyclesPerMinute: 60,
        driveBraking: {
          continuousPower: 50,  // 刚好等于计算值
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.brakingPower).toBe(50);
      expect(result.requiresExternalResistor).toBe(false);  // 等于不算超过
    });
  });

  describe('需要外部电阻的情况', () => {
    it('应正确判断大惯量高频制动场景', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.01,          // 10 kg·cm²
        maxAngularSpeed: 314.2,      // 3000 rpm in rad/s
        cyclesPerMinute: 30,
        driveBraking: {
          continuousPower: 40,
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.energyPerCycle).toBeCloseTo(493.5, 1);
      expect(result.brakingPower).toBeCloseTo(246.7, 1);
      expect(result.requiresExternalResistor).toBe(true);
      expect(result.recommendedResistor).toBeDefined();
      expect(result.recommendedResistor!.minPower).toBeCloseTo(296.1, 1);
      expect(result.recommendedResistor!.resistance).toBe(160);
      expect(result.warning).toContain('超过内置电阻');
    });
  });

  describe('边界条件', () => {
    it('应处理零惯量情况', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0,
        maxAngularSpeed: 100,
        cyclesPerMinute: 10,
        driveBraking: {
          continuousPower: 40,
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.energyPerCycle).toBe(0);
      expect(result.brakingPower).toBe(0);
      expect(result.requiresExternalResistor).toBe(false);
    });

    it('应处理零制动频率', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.01,
        maxAngularSpeed: 100,
        cyclesPerMinute: 0,
        driveBraking: {
          continuousPower: 40,
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.brakingPower).toBe(0);
      expect(result.requiresExternalResistor).toBe(false);
    });

    it('应处理极高制动频率', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.001,
        maxAngularSpeed: 100,
        cyclesPerMinute: 1000,
        driveBraking: {
          continuousPower: 40,
          internalResistance: 160,
          peakPower: 2312,
        },
      };

      const result = calculator.calculate(input);

      expect(result.brakingPower).toBeGreaterThan(0);
      expect(result.requiresExternalResistor).toBe(true);
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- src/lib/calculations/__tests__/braking-resistor.test.ts`
Expected: FAIL - "Cannot find module '../braking-resistor'"

**Step 3: 实现 BrakingResistorCalculator 类**

```typescript
// src/lib/calculations/braking-resistor.ts

/**
 * 制动电阻选型输入参数
 */
export interface BrakingResistorInput {
  /** 总转动惯量 (kg·m²) */
  totalInertia: number;
  /** 最大角速度 (rad/s) */
  maxAngularSpeed: number;
  /** 每分钟制动次数 */
  cyclesPerMinute: number;
  /** 驱动器制动参数 */
  driveBraking: {
    /** 持续功率 (W) */
    continuousPower: number;
    /** 内部电阻 (Ω) */
    internalResistance: number;
    /** 峰值功率 (W) */
    peakPower: number;
  };
}

/**
 * 推荐外部电阻规格
 */
export interface RecommendedResistor {
  /** 最小持续功率 (W) */
  minPower: number;
  /** 推荐阻值 (Ω) */
  resistance: number;
  /** 工作占空比 (%) */
  dutyCycle: number;
}

/**
 * 制动电阻计算结果
 */
export interface BrakingResistorResult {
  /** 单次制动能量 (J) */
  energyPerCycle: number;
  /** 平均制动功率 (W) */
  brakingPower: number;
  /** 是否需要外部电阻 */
  requiresExternalResistor: boolean;
  /** 推荐规格（需要时） */
  recommendedResistor?: RecommendedResistor;
  /** 警告信息 */
  warning?: string;
}

/**
 * 制动电阻选型计算器
 *
 * 基于能量守恒原理，计算运动系统减速过程中释放的动能，
 * 并评估平均制动功率是否超过内置制动电阻的持续功率承受能力。
 *
 * 论文引用:
 * - Bosch Rexroth. "Drive and Control Technology: Braking Resistor Sizing"
 * - Yaskawa. "Sigma-7 Series Braking Resistor Application Manual"
 *
 * 算法复杂度: O(1) 时间, O(1) 空间
 */
export class BrakingResistorCalculator {
  /**
   * 计算制动电阻需求
   *
   * @param input 制动电阻选型输入参数
   * @returns 制动电阻计算结果
   */
  calculate(input: BrakingResistorInput): BrakingResistorResult {
    // 1. 计算单次制动能量: E = ½ × J × ω²
    const energyPerCycle = this.calculateBrakingEnergy(input);

    // 2. 计算平均制动功率: P_avg = (E × N) / 60
    const brakingPower = this.calculateAverageBrakingPower(
      energyPerCycle,
      input.cyclesPerMinute
    );

    // 3. 判断是否需要外部电阻
    const requiresExternalResistor = brakingPower > input.driveBraking.continuousPower;

    // 4. 构建基础结果
    const result: BrakingResistorResult = {
      energyPerCycle,
      brakingPower,
      requiresExternalResistor,
    };

    // 5. 如果需要外部电阻，计算推荐规格和警告
    if (requiresExternalResistor) {
      result.recommendedResistor = this.calculateRecommendedResistor(
        brakingPower,
        input.driveBraking.internalResistance
      );
      result.warning = this.generateWarning(
        brakingPower,
        input.driveBraking.continuousPower
      );
    }

    return result;
  }

  /**
   * 计算单次制动能量
   *
   * 公式: E = ½ × J × ω²
   * 其中:
   *   - J: 总转动惯量 (kg·m²)
   *   - ω: 最大角速度 (rad/s)
   *
   * @param input 制动电阻选型输入参数
   * @returns 单次制动能量 (J)
   *
   * 复杂度: O(1)
   */
  private calculateBrakingEnergy(input: BrakingResistorInput): number {
    return 0.5 * input.totalInertia * Math.pow(input.maxAngularSpeed, 2);
  }

  /**
   * 计算平均制动功率
   *
   * 公式: P_avg = (E × N) / 60
   * 其中:
   *   - E: 单次制动能量 (J)
   *   - N: 每分钟制动次数
   *   - 60: 秒数转换系数
   *
   * @param energyPerCycle 单次制动能量 (J)
   * @param cyclesPerMinute 每分钟制动次数
   * @returns 平均制动功率 (W)
   *
   * 复杂度: O(1)
   */
  private calculateAverageBrakingPower(
    energyPerCycle: number,
    cyclesPerMinute: number
  ): number {
    if (cyclesPerMinute <= 0) return 0;
    return (energyPerCycle * cyclesPerMinute) / 60;
  }

  /**
   * 计算推荐外部电阻规格
   *
   * @param requiredPower 所需制动功率 (W)
   * @param internalResistance 内置电阻阻值 (Ω)
   * @returns 推荐规格
   *
   * 复杂度: O(1)
   */
  private calculateRecommendedResistor(
    requiredPower: number,
    internalResistance: number
  ): RecommendedResistor {
    // 安全系数 1.2
    const minPower = requiredPower * 1.2;

    // 推荐阻值与内置电阻相近
    const resistance = internalResistance;

    // 估算占空比（基于典型应用）
    const dutyCycle = 10;

    return { minPower, resistance, dutyCycle };
  }

  /**
   * 生成警告信息
   *
   * @param brakingPower 计算的平均制动功率 (W)
   * @param continuousPower 内置电阻持续功率 (W)
   * @returns 警告信息字符串
   */
  private generateWarning(brakingPower: number, continuousPower: number): string {
    return `计算的平均制动功率为 ${brakingPower.toFixed(1)}W，超过内置电阻的持续功率 ${continuousPower}W。请选用外部制动电阻。`;
  }
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- src/lib/calculations/__tests__/braking-resistor.test.ts`
Expected: PASS - 所有测试通过

**Step 5: 提交**

```bash
git add src/lib/calculations/braking-resistor.ts src/lib/calculations/__tests__/braking-resistor.test.ts
git commit -m "feat(braking): add BrakingResistorCalculator with energy and power calculations"
```

---

### Task 2: 更新 MechanicalCalculator 计算每分钟制动次数

**Files:**
- Modify: `src/lib/calculations/mechanical.ts`
- Test: `src/lib/calculations/__tests__/mechanical.test.ts` (如存在)

**Step 1: 添加每分钟制动次数计算方法**

在 `MechanicalCalculator` 类中添加：

```typescript
/**
 * 计算每分钟制动次数
 * 基于运动周期计算
 *
 * @returns 每分钟制动次数
 */
private calculateCyclesPerMinute(): number {
  const { motion } = this.input;
  const cycleTimeSeconds = motion.cycleTime;

  if (cycleTimeSeconds <= 0) return 0;

  return 60 / cycleTimeSeconds;
}
```

**Step 2: 修改 calculateRegeneration 方法**

修改现有的 `calculateRegeneration` 方法，添加每分钟制动次数：

```typescript
private calculateRegeneration() {
  const inertia = this.calculateInertia();
  const maxSpeedRad = this.getMaxAngularSpeed();
  const times = this.calculateMotionTimes();

  // 计算每分钟制动次数
  const cyclesPerMinute = this.calculateCyclesPerMinute();

  // 计算单次制动能量
  const E_kinetic = 0.5 * inertia.total * maxSpeedRad * maxSpeedRad;

  // 计算平均制动功率
  const P_brake = times.decel > 0 ? E_kinetic / times.decel : 0;

  return {
    energyPerCycle: E_kinetic,
    brakingPower: P_brake,
    cyclesPerMinute,  // 新增
    requiresExternalResistor: false,
  };
}
```

**Step 3: 运行测试**

Run: `npm test -- src/lib/calculations/__tests__/`
Expected: PASS - 现有测试仍通过

**Step 4: 提交**

```bash
git add src/lib/calculations/mechanical.ts
git commit -m "feat(mechanical): add cyclesPerMinute calculation for braking analysis"
```

---

### Task 3: 集成到 SizingEngine

**Files:**
- Modify: `src/lib/calculations/sizing-engine.ts`
- Test: `src/lib/calculations/__tests__/sizing-engine.test.ts`

**Step 1: 导入 BrakingResistorCalculator**

在 `sizing-engine.ts` 顶部添加导入：

```typescript
import { BrakingResistorCalculator } from './braking-resistor';
```

**Step 2: 修改 calculateBrakeResistor 方法**

替换现有的 `calculateBrakeResistor` 方法：

```typescript
private calculateBrakeResistor(
  mechanical: MechanicalResult,
  drive: XC20Drive
): BrakeResistor | undefined {
  // 使用新的制动电阻计算器
  const brakingCalculator = new BrakingResistorCalculator();

  // 计算最大角速度 (rad/s)
  const maxAngularSpeed = (mechanical.speeds.max * 2 * Math.PI) / 60;

  // 计算每分钟制动次数
  const cyclesPerMinute = 60 / this.input.motion.cycleTime;

  // 执行制动电阻计算
  const regenerationResult = brakingCalculator.calculate({
    totalInertia: mechanical.totalInertia,
    maxAngularSpeed,
    cyclesPerMinute,
    driveBraking: drive.braking,
  });

  // 更新 mechanical 结果中的再生能量信息
  mechanical.regeneration = {
    ...mechanical.regeneration,
    ...regenerationResult,
  };

  // 如果不需要外部电阻，返回 undefined
  if (!regenerationResult.requiresExternalResistor) {
    return undefined;
  }

  // 从电阻库中选择合适的型号
  const requiredPower = regenerationResult.recommendedResistor!.minPower;

  const suitableResistor = this.resistors
    .filter((r) => r.continuousPower >= requiredPower)
    .sort((a, b) => a.continuousPower - b.continuousPower)[0];

  return suitableResistor;
}
```

**Step 3: 运行测试**

Run: `npm test -- src/lib/calculations/__tests__/sizing-engine.test.ts`
Expected: PASS - 测试通过

**Step 4: 提交**

```bash
git add src/lib/calculations/sizing-engine.ts
git commit -m "feat(sizing-engine): integrate BrakingResistorCalculator for braking analysis"
```

---

## 前端集成

### Task 4: 更新结果展示组件

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`
- Modify: `src/components/wizard/SystemSummary.tsx`

**Step 1: 添加制动电阻警告显示**

在 `ResultStep.tsx` 中添加制动电阻警告：

```typescript
// 在结果显示部分添加
{result.mechanical.regeneration.requiresExternalResistor && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
    <div className="flex items-start">
      <span className="text-yellow-600 text-xl mr-2">⚠️</span>
      <div>
        <h4 className="font-semibold text-yellow-800">制动电阻警告</h4>
        <p className="text-yellow-700 text-sm mt-1">
          {result.mechanical.regeneration.warning}
        </p>
        {result.mechanical.regeneration.recommendedResistor && (
          <div className="mt-2 text-sm text-yellow-700">
            <p>建议外部电阻规格：</p>
            <ul className="list-disc list-inside ml-2">
              <li>持续功率: ≥ {result.mechanical.regeneration.recommendedResistor.minPower.toFixed(0)}W</li>
              <li>阻值: ≈ {result.mechanical.regeneration.recommendedResistor.resistance}Ω</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
)}
```

**Step 2: 在 SystemSummary 中添加制动能量详情**

```typescript
// 添加制动能量分析部分
<div className="border-t pt-4 mt-4">
  <h4 className="font-semibold text-gray-900 mb-2">制动能量分析</h4>
  <div className="grid grid-cols-2 gap-2 text-sm">
    <div>
      <span className="text-gray-600">单次制动能量:</span>
      <span className="ml-2 font-medium">
        {mechanical.regeneration.energyPerCycle.toFixed(1)} J
      </span>
    </div>
    <div>
      <span className="text-gray-600">平均制动功率:</span>
      <span className="ml-2 font-medium">
        {mechanical.regeneration.brakingPower.toFixed(1)} W
      </span>
    </div>
  </div>
</div>
```

**Step 3: 运行开发服务器验证**

Run: `npm run dev`
Expected: 页面正常显示，制动电阻警告在需要时显示

**Step 4: 提交**

```bash
git add src/components/wizard/steps/ResultStep.tsx src/components/wizard/SystemSummary.tsx
git commit -m "feat(ui): display braking resistor warnings and energy analysis"
```

---

## 验证与完成

### Task 5: 运行完整测试套件

**Step 1: 运行所有测试**

Run: `npm test`
Expected: PASS - 所有测试通过

**Step 2: 运行构建验证**

Run: `npm run build`
Expected: SUCCESS - 构建成功

**Step 3: 最终提交**

```bash
git add .
git commit -m "feat(braking-resistor): complete braking resistor sizing algorithm implementation

- Add BrakingResistorCalculator with energy and power calculations
- Integrate with MechanicalCalculator and SizingEngine
- Add UI warnings for external resistor requirements
- Add braking energy analysis display"
```

---

## 验证清单

- [ ] `BrakingResistorCalculator` 类实现完整
- [ ] 单元测试覆盖所有场景（内置足够、需要外部、边界条件）
- [ ] 与 `MechanicalCalculator` 集成正确
- [ ] 与 `SizingEngine` 集成正确
- [ ] 前端正确显示制动电阻警告
- [ ] 所有测试通过
- [ ] 构建成功

---

## 参考资料

- 设计文档: `docs/plans/2026-03-01-braking-resistor-design.md`
- XC20制动电阻参数: `docs/data/XC20_inbuilt_resistor.md`
