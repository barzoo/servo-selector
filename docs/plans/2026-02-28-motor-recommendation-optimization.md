# 电机推荐优化与错误诊断功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化电机推荐算法，优先显示最经济的型号，并在无匹配电机时提供清晰的错误原因提示

**Architecture:** 修改 `MotorFilter` 类添加经济性筛选逻辑，修改 `SizingEngine` 类添加失败诊断功能，扩展 `SizingResult` 类型支持错误原因字段

**Tech Stack:** TypeScript, Next.js, Zustand, Jest

---

## Task 1: 扩展类型定义

**Files:**
- Modify: `src/types/index.ts`

**Step 1: 添加 SizingFailureReason 类型**

在 `src/types/index.ts` 中添加：

```typescript
export interface SizingFailureReason {
  type: 'TORQUE' | 'PEAK_TORQUE' | 'SPEED' | 'ENCODER';
  message: string;
}
```

**Step 2: 修改 SizingResult 接口**

找到 `SizingResult` 接口，添加可选字段：

```typescript
export interface SizingResult {
  mechanical: MechanicalResult;
  motorRecommendations: MotorRecommendation[];
  failureReason?: SizingFailureReason;  // 新增：仅当无推荐时存在
  metadata: {
    calculationTime: number;
    version: string;
    timestamp: string;
  };
}
```

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add SizingFailureReason type and update SizingResult interface"
```

---

## Task 2: 实现电机经济性筛选

**Files:**
- Modify: `src/lib/calculations/motor-filter.ts`

**Step 1: 添加 filterByEconomy 方法**

在 `MotorFilter` 类中添加私有方法：

```typescript
private filterByEconomy(
  candidates: MotorRecommendation[]
): MotorRecommendation[] {
  // 筛选匹配度≥80的高分电机
  const highScoreMotors = candidates.filter((c) => c.matchScore >= 80);

  if (highScoreMotors.length > 0) {
    // 有高分电机，最多返回3个
    return highScoreMotors.slice(0, 3);
  }

  // 无高分电机，保留前2个并标记为警告
  return candidates.slice(0, 2).map((c) => ({
    ...c,
    feasibility: 'WARNING' as const,
    warnings: [...c.warnings, '匹配度较低，建议调整工况参数'],
  }));
}
```

**Step 2: 修改 filter 方法**

将 `filter()` 方法的最后一句：

```typescript
// 旧代码
return scored.slice(0, 5);
```

改为：

```typescript
// 新代码
return this.filterByEconomy(scored);
```

**Step 3: Commit**

```bash
git add src/lib/calculations/motor-filter.ts
git commit -m "feat: filter motors by economy score (≥80), limit to 3 recommendations"
```

---

## Task 3: 实现错误诊断功能

**Files:**
- Modify: `src/lib/calculations/sizing-engine.ts`

**Step 1: 添加 diagnoseFailure 方法**

在 `SizingEngine` 类中添加私有方法：

```typescript
import { SizingFailureReason, SystemPreferences, MechanicalResult } from '@/types';

// ... 现有代码 ...

private diagnoseFailure(
  mechanical: MechanicalResult,
  preferences: SystemPreferences
): SizingFailureReason {
  const requiredTorque = mechanical.torques.rms * preferences.safetyFactor;
  const requiredPeakTorque = mechanical.torques.peak * preferences.safetyFactor;
  const requiredSpeed = mechanical.speeds.max * 1.1;

  // 找出最大可用规格
  const maxRatedTorque = Math.max(...this.motors.map((m) => m.ratedTorque));
  const maxPeakTorque = Math.max(...this.motors.map((m) => m.peakTorque));
  const maxSpeed = Math.max(...this.motors.map((m) => m.maxSpeed));

  // 按优先级检查失败原因
  if (requiredTorque > maxRatedTorque) {
    return {
      type: 'TORQUE',
      message: '所需连续扭矩超过所有可用电机范围',
    };
  }

  if (requiredPeakTorque > maxPeakTorque) {
    return {
      type: 'PEAK_TORQUE',
      message: '所需峰值扭矩超过所有可用电机范围',
    };
  }

  if (requiredSpeed > maxSpeed) {
    return {
      type: 'SPEED',
      message: '所需转速超过所有可用电机范围',
    };
  }

  // 检查编码器匹配
  const encoderMatch = this.motors.some((m) =>
    m.encoderOptions.some((e) => e.type === preferences.encoderType)
  );
  if (!encoderMatch) {
    return {
      type: 'ENCODER',
      message: '当前编码器类型无匹配电机',
    };
  }

  return {
    type: 'TORQUE',
    message: '无满足所有条件的电机，建议调整工况参数',
  };
}
```

**Step 2: 修改 calculate 方法**

在 `calculate()` 方法中，电机筛选后添加诊断逻辑：

```typescript
calculate(input: SizingInput): SizingResult {
  const startTime = performance.now();

  // 1. 机械计算
  const mechanicalCalc = new MechanicalCalculator(input);
  const mechanical = mechanicalCalc.calculate();

  // 2. 电机筛选
  const motorFilter = new MotorFilter(mechanical, input.preferences);
  const motorRecommendations = motorFilter.filter();

  // 【新增】3. 诊断无结果情况
  let failureReason: SizingFailureReason | undefined;
  if (motorRecommendations.length === 0) {
    failureReason = this.diagnoseFailure(mechanical, input.preferences);
  }

  // 4. 为每个推荐电机计算完整系统配置
  const recommendations = motorRecommendations.map((rec) => {
    // ... 现有代码不变 ...
  });

  const calculationTime = performance.now() - startTime;

  return {
    mechanical,
    motorRecommendations: recommendations,
    failureReason,  // 新增
    metadata: {
      calculationTime,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}
```

**Step 3: Commit**

```bash
git add src/lib/calculations/sizing-engine.ts
git commit -m "feat: add failure diagnosis when no motors match"
```

---

## Task 4: 更新结果页面显示错误原因

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 修改无结果时的显示逻辑**

找到无结果时的返回代码块（约第10-22行），修改为：

```typescript
if (!result || result.motorRecommendations.length === 0) {
  return (
    <div className="text-center py-10">
      <p className="text-gray-700 text-lg font-medium mb-2">暂无选型结果</p>
      {result?.failureReason && (
        <p className="text-yellow-700 bg-yellow-50 px-4 py-2 rounded-md inline-block mb-4">
          原因：{result.failureReason.message}
        </p>
      )}
      <div className="mt-4">
        <button
          onClick={goBackToEdit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          返回修改
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat: display failure reason when no motor recommendations available"
```

---

## Task 5: 验证构建

**Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 无错误

**Step 2: 运行构建**

```bash
npm run build
```

Expected: Build completed successfully

**Step 3: Commit（如需要修复）**

如有修复，单独提交：

```bash
git add -A
git commit -m "fix: resolve type errors in motor optimization"
```

---

## 测试验证清单

实施完成后，手动验证以下场景：

| 场景 | 操作 | 期望结果 |
|------|------|----------|
| 正常工况 | 输入常规参数计算 | 显示1-3个匹配度≥80的电机 |
| 极端工况 | 输入较大负载 | 显示2个WARNING电机，带提示 |
| 扭矩超限 | 负载质量设为10000kg | 提示"所需连续扭矩超过所有可用电机范围" |
| 转速超限 | 速度设为10000mm/s | 提示"所需转速超过所有可用电机范围" |

---

## 回滚方案

如需回滚，执行：

```bash
git log --oneline -5  # 查看最近提交
git revert HEAD~4..HEAD  # 回滚所有4个提交
```

或手动恢复文件到修改前状态。
