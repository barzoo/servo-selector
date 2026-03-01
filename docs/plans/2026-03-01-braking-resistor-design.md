# 制动电阻选型算法设计文档

**版本**: 1.0
**日期**: 2026-03-01
**适用范围**: XC20 + MC20 伺服系统选型工具

---

## 1. 概述

### 1.1 设计目标

本文档定义制动电阻选型算法的设计，用于判断伺服驱动器内置制动电阻是否满足系统制动需求，并在需要时推荐外部制动电阻规格。

### 1.2 参考文档

- `docs/data/XC20_inbuilt_resistor.md` - XC20内置制动电阻技术参数
- `docs/specs/mechanical-loads.md` - 机械负载选型计算规格
- `docs/plans/sizing-algo.md` - 伺服选型算法设计文档

---

## 2. 核心算法

### 2.1 算法原理

基于能量守恒原理，计算运动系统在减速过程中释放的动能，并评估平均制动功率是否超过内置制动电阻的持续功率承受能力。

**关键公式**（来自XC20技术文档）：

1. **单次制动能量**：
   ```
   E_brake = ½ × J_total × ω²  (J)
   ```
   - J_total: 总转动惯量 (kg·m²)
   - ω: 最大角速度 (rad/s)

2. **平均制动功率**：
   ```
   P_avg = (E_brake × N) / 60  (W)
   ```
   - N: 每分钟制动次数 (次/分钟)
   - 60: 秒数转换系数

3. **判断条件**：
   ```
   requiresExternalResistor = P_avg > drive.braking.continuousPower
   ```

### 2.2 算法流程图

```
┌─────────────────────────────────────────────────────────────┐
│  开始                                                        │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  输入: 机械计算结果, 运动参数, 驱动器参数                      │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  计算单次制动能量                                            │
│  E_brake = 0.5 × J_total × ω²                               │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  计算平均制动功率                                            │
│  P_avg = (E_brake × N) / 60                                 │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  P_avg > continuousPower ?                                   │
└──────────────┬─────────────────────────────┬────────────────┘
               ↓                             ↓
          ┌─────────┐                  ┌─────────┐
          │   是    │                  │   否    │
          └────┬────┘                  └────┬────┘
               ↓                             ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│ 需要外部制动电阻          │    │ 内置电阻足够              │
│ requiresExternal = true  │    │ requiresExternal = false │
│ 计算推荐规格              │    │                          │
└──────────────────────────┘    └──────────────────────────┘
               ↓                             ↓
┌─────────────────────────────────────────────────────────────┐
│  返回结果                                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 复杂度分析

| 计算步骤 | 时间复杂度 | 空间复杂度 | 说明 |
|----------|-----------|-----------|------|
| 单次制动能量 | O(1) | O(1) | 固定公式计算 |
| 平均制动功率 | O(1) | O(1) | 固定公式计算 |
| 判断逻辑 | O(1) | O(1) | 简单比较 |
| **总计** | **O(1)** | **O(1)** | 常数时间复杂度 |

---

## 3. 数据结构设计

### 3.1 扩展类型定义

```typescript
// 制动电阻计算结果（扩展）
interface RegenerationResult {
  // 基础计算结果
  energyPerCycle: number;        // J，单次制动能量
  brakingPower: number;          // W，平均制动功率
  requiresExternalResistor: boolean;

  // 推荐规格（当需要外部电阻时）
  recommendedResistor?: {
    minPower: number;            // W，最小持续功率
    resistance: number;          // Ω，推荐阻值
    dutyCycle: number;           // %，工作占空比
  };

  // 警告信息
  warning?: string;
}

// 制动电阻选型输入
interface BrakingResistorInput {
  // 来自机械计算
  totalInertia: number;          // kg·m²
  maxAngularSpeed: number;       // rad/s

  // 来自运动参数
  cyclesPerMinute: number;       // 次/分钟

  // 来自驱动器数据
  driveBraking: {
    continuousPower: number;     // W
    internalResistance: number;  // Ω
    peakPower: number;           // W
  };
}
```

### 3.2 与现有系统的集成

```typescript
// 在 MechanicalResult 中扩展
interface MechanicalResult {
  // ... 现有字段 ...

  // 再生能量计算（扩展）
  regeneration: RegenerationResult;
}
```

---

## 4. 算法实现

### 4.1 核心计算函数

```typescript
/**
 * 制动电阻选型计算器
 *
 * 论文引用:
 * - Bosch Rexroth. "Drive and Control Technology: Braking Resistor Sizing"
 * - Yaskawa. "Sigma-7 Series Braking Resistor Application Manual"
 *
 * 复杂度: O(1) 时间, O(1) 空间
 */
export class BrakingResistorCalculator {
  /**
   * 计算制动电阻需求
   */
  calculate(input: BrakingResistorInput): RegenerationResult {
    // 1. 计算单次制动能量
    const energyPerCycle = this.calculateBrakingEnergy(input);

    // 2. 计算平均制动功率
    const brakingPower = this.calculateAverageBrakingPower(
      energyPerCycle,
      input.cyclesPerMinute
    );

    // 3. 判断是否需要外部电阻
    const requiresExternalResistor = brakingPower > input.driveBraking.continuousPower;

    // 4. 生成结果
    const result: RegenerationResult = {
      energyPerCycle,
      brakingPower,
      requiresExternalResistor,
    };

    // 5. 如果需要外部电阻，计算推荐规格
    if (requiresExternalResistor) {
      result.recommendedResistor = this.calculateRecommendedResistor(
        brakingPower,
        input.driveBraking.internalResistance
      );
      result.warning = this.generateWarning(brakingPower, input.driveBraking.continuousPower);
    }

    return result;
  }

  /**
   * 计算单次制动能量
   * E = ½ × J × ω²
   *
   * 复杂度: O(1)
   */
  private calculateBrakingEnergy(input: BrakingResistorInput): number {
    return 0.5 * input.totalInertia * Math.pow(input.maxAngularSpeed, 2);
  }

  /**
   * 计算平均制动功率
   * P_avg = (E × N) / 60
   *
   * 复杂度: O(1)
   */
  private calculateAverageBrakingPower(
    energyPerCycle: number,
    cyclesPerMinute: number
  ): number {
    return (energyPerCycle * cyclesPerMinute) / 60;
  }

  /**
   * 计算推荐外部电阻规格
   *
   * 复杂度: O(1)
   */
  private calculateRecommendedResistor(
    requiredPower: number,
    internalResistance: number
  ): { minPower: number; resistance: number; dutyCycle: number } {
    // 安全系数 1.2
    const minPower = requiredPower * 1.2;

    // 推荐阻值与内置电阻相近
    const resistance = internalResistance;

    // 估算占空比（基于典型应用）
    const dutyCycle = 10; // 10% 典型值

    return { minPower, resistance, dutyCycle };
  }

  /**
   * 生成警告信息
   */
  private generateWarning(brakingPower: number, continuousPower: number): string {
    return `计算的平均制动功率为 ${brakingPower.toFixed(1)}W，超过内置电阻的持续功率 ${continuousPower}W。请选用外部制动电阻。`;
  }
}
```

### 4.2 与 MechanicalCalculator 集成

```typescript
// 在 MechanicalCalculator 类中修改 calculateRegeneration 方法

private calculateRegeneration(): RegenerationResult {
  const inertia = this.calculateInertia();
  const maxSpeedRad = this.getMaxAngularSpeed();

  // 计算每分钟制动次数
  const cyclesPerMinute = this.calculateCyclesPerMinute();

  // 创建制动电阻计算器
  const brakingCalculator = new BrakingResistorCalculator();

  // 准备输入（驱动器数据将在上层传入）
  return {
    energyPerCycle: 0.5 * inertia.total * Math.pow(maxSpeedRad, 2),
    brakingPower: 0, // 将在上层计算
    requiresExternalResistor: false,
  };
}

/**
 * 计算每分钟制动次数
 * 基于运动周期计算
 */
private calculateCyclesPerMinute(): number {
  const { motion } = this.input;
  const cycleTimeSeconds = motion.cycleTime;

  if (cycleTimeSeconds <= 0) return 0;

  return 60 / cycleTimeSeconds;
}
```

### 4.3 与 SizingEngine 集成

```typescript
// 在 SizingEngine 中修改 calculateBrakeResistor 方法

private calculateBrakeResistor(
  mechanical: MechanicalResult,
  drive: XC20Drive
): BrakeResistor | undefined {
  // 使用新的制动电阻计算器
  const brakingCalculator = new BrakingResistorCalculator();

  const regenerationResult = brakingCalculator.calculate({
    totalInertia: mechanical.totalInertia,
    maxAngularSpeed: mechanical.speeds.max * (2 * Math.PI) / 60,
    cyclesPerMinute: 60 / this.input.motion.cycleTime,
    driveBraking: drive.braking,
  });

  // 更新 mechanical 结果中的再生能量信息
  mechanical.regeneration = regenerationResult;

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

---

## 5. 用户界面设计

### 5.1 结果展示

当 `requiresExternalResistor = true` 时，在选型结果页面显示警告：

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ 制动电阻警告                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  计算的平均制动功率: 85.5W                                   │
│  驱动器内置电阻持续功率: 40W                                 │
│                                                             │
│  建议选用外部制动电阻：                                      │
│  • 持续功率: ≥ 102.6W                                       │
│  • 阻值: ≈ 160Ω                                             │
│                                                             │
│  [查看推荐型号]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 详细数据展示

在系统配置详情中显示制动计算数据：

```
制动能量分析
────────────
单次制动能量:     342 J
平均制动功率:     85.5 W
每分钟制动次数:   15 次
制动占空比:       12.5%

制动电阻配置
────────────
内置电阻功率:     40 W (不足)
推荐外部电阻:     100W, 160Ω
```

---

## 6. 测试策略

### 6.1 单元测试用例

```typescript
describe('BrakingResistorCalculator', () => {
  let calculator: BrakingResistorCalculator;

  beforeEach(() => {
    calculator = new BrakingResistorCalculator();
  });

  describe('内置电阻足够的情况', () => {
    it('应正确判断小惯量低频制动场景', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.001,        // 1 kg·cm²
        maxAngularSpeed: 104.7,      // 1000 rpm
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
    });
  });

  describe('需要外部电阻的情况', () => {
    it('应正确判断大惯量高频制动场景', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.01,          // 10 kg·cm²
        maxAngularSpeed: 314.2,      // 3000 rpm
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
      expect(result.recommendedResistor!.minPower).toBeGreaterThan(246.7);
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

    it('应处理极高制动频率', () => {
      const input: BrakingResistorInput = {
        totalInertia: 0.001,
        maxAngularSpeed: 100,
        cyclesPerMinute: 1000,       // 极高频率
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

### 6.2 集成测试

```typescript
describe('制动电阻选型集成测试', () => {
  it('应与SizingEngine正确集成', () => {
    const engine = new SizingEngine();

    const input = createTestInput({
      mechanism: 'BALL_SCREW',
      loadMass: 100,
      maxVelocity: 1000,
      maxAcceleration: 5000,
      cycleTime: 2,  // 30次/分钟
    });

    const result = engine.calculate(input);

    // 验证再生能量计算结果存在
    expect(result.mechanical.regeneration).toBeDefined();
    expect(result.mechanical.regeneration.energyPerCycle).toBeGreaterThan(0);
    expect(result.mechanical.regeneration.brakingPower).toBeGreaterThan(0);

    // 验证系统配置中的制动电阻
    if (result.motorRecommendations.length > 0) {
      const firstRec = result.motorRecommendations[0];
      if (firstRec.systemConfig) {
        // 根据制动功率判断是否有制动电阻
        const regen = result.mechanical.regeneration;
        if (regen.requiresExternalResistor) {
          expect(firstRec.systemConfig.accessories.brakeResistor).toBeDefined();
        }
      }
    }
  });
});
```

---

## 7. 参考资料

1. **Bosch Rexroth**. "Drive and Control Technology: Braking Resistor Sizing Guide"
2. **Yaskawa**. "Sigma-7 Series Braking Resistor Application Manual"
3. **Mitsubishi Electric**. "MR-J4 Braking Resistor Selection Guide"
4. **Siemens**. "SINAMICS Braking Resistor Configuration Manual"

---

## 8. 文档维护记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-01 | 初始版本 | - |
