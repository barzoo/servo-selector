# 电机推荐优化与错误诊断设计文档

**版本**: 1.0
**日期**: 2026-02-28
**适用范围**: XC20 + MC20 伺服系统选型工具

---

## 1. 问题背景

### 1.1 当前问题

1. **推荐电机范围过宽**: 选型结果展示从最小功率到最大功率的所有可用电机，包含过多"大马拉小车"的不经济选项
2. **错误提示不明确**: 当无法计算出结果时，仅显示"暂无选型结果，请返回重新配置"，用户无法获知具体原因

### 1.2 设计目标

- 优先推荐最经济的电机型号（匹配度≥80分）
- 当无匹配电机时，提供清晰的失败原因提示
- 保持向后兼容，不破坏现有接口

---

## 2. 电机推荐优化

### 2.1 算法改进

```typescript
// 改进后的 filter() 流程
filter(): MotorRecommendation[] {
  // 1-3. 原有逻辑保持不变
  const requiredTorque = this.mechanical.torques.rms * this.preferences.safetyFactor;
  const requiredPeakTorque = this.mechanical.torques.peak * this.preferences.safetyFactor;
  const requiredSpeed = this.mechanical.speeds.max * 1.1;

  const candidates = this.motors.filter((motor) => {
    if (motor.ratedTorque < requiredTorque) return false;
    if (motor.peakTorque < requiredPeakTorque) return false;
    if (motor.maxSpeed < requiredSpeed) return false;
    const encoderMatch = motor.encoderOptions.some(
      (e) => e.type === this.preferences.encoderType
    );
    if (!encoderMatch) return false;
    return true;
  });

  const scored = candidates.map((motor) =>
    this.calculateMatchScore(motor, requiredTorque, requiredSpeed)
  );

  scored.sort((a, b) => b.matchScore - a.matchScore);

  // 4. 【新增】按经济性筛选
  return this.filterByEconomy(scored);
}
```

### 2.2 经济性筛选逻辑

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

### 2.3 评分权重说明

| 评估维度 | 权重 | 优秀标准 | 警告阈值 | 经济区间 |
|----------|------|----------|----------|----------|
| 扭矩余量 | 40% | ≥50% | <30% | 20%-50% |
| 惯量比 | 30% | ≤3:1 | >10:1 | 3:1-10:1 |
| 转速余量 | 20% | ≥20% | <10% | 10%-30% |
| 效率 | 10% | 高效区运行 | - | - |

---

## 3. 错误诊断功能

### 3.1 新增类型定义

```typescript
// types/index.ts

export interface SizingFailureReason {
  type: 'TORQUE' | 'PEAK_TORQUE' | 'SPEED' | 'ENCODER';
  message: string;
}

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

### 3.2 诊断算法

```typescript
// sizing-engine.ts

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

### 3.3 错误提示映射

| 失败类型 | 提示信息 |
|----------|----------|
| TORQUE | "所需连续扭矩超过所有可用电机范围" |
| PEAK_TORQUE | "所需峰值扭矩超过所有可用电机范围" |
| SPEED | "所需转速超过所有可用电机范围" |
| ENCODER | "当前编码器类型无匹配电机" |

---

## 4. 修改文件清单

### 4.1 核心算法文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/lib/calculations/motor-filter.ts` | 添加 `filterByEconomy()` 方法，修改 `filter()` 返回值 |
| `src/lib/calculations/sizing-engine.ts` | 添加 `diagnoseFailure()` 方法，修改 `calculate()` 返回逻辑 |
| `src/types/index.ts` | 添加 `SizingFailureReason` 类型，修改 `SizingResult` 接口 |

### 4.2 UI组件文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/components/wizard/steps/ResultStep.tsx` | 无结果时显示 `failureReason.message` |

---

## 5. 测试策略

### 5.1 电机推荐测试用例

| 场景 | 输入 | 期望结果 |
|------|------|----------|
| 多个高分电机 | 常规工况 | 返回3个匹配度≥80的电机 |
| 仅1个高分电机 | 特殊工况 | 返回1个电机 |
| 无高分电机 | 极端工况 | 返回2个WARNING电机，带提示 |
| 无可用电机 | 超载工况 | 返回空数组，附带失败原因 |

### 5.2 错误诊断测试用例

| 场景 | 失败类型 | 期望提示 |
|------|----------|----------|
| 负载过大 | TORQUE | "所需连续扭矩超过所有可用电机范围" |
| 加速度过大 | PEAK_TORQUE | "所需峰值扭矩超过所有可用电机范围" |
| 速度过高 | SPEED | "所需转速超过所有可用电机范围" |
| 编码器不匹配 | ENCODER | "当前编码器类型无匹配电机" |

---

## 6. 兼容性说明

- 所有修改均为向后兼容
- `SizingResult` 新增可选字段 `failureReason`，不影响现有代码
- 电机推荐数量从最多5个减少到最多3个，UI层无需修改

---

## 7. 文档维护记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-02-28 | 初始版本 | - |
