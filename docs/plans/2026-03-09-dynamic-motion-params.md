# 动态运动参数 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 根据传动类型动态调整运动参数输入，使丝杠/齿条使用行程(mm)，齿轮/旋转直驱使用旋转角度(°)

**Architecture:** 将 MotionParams 改为联合类型区分 LINEAR/ROTARY/BELT 运动，MechanicalCalculator 添加单位归一化方法统一处理，MotionStep 根据 mechanism.type 动态渲染不同输入字段

**Tech Stack:** TypeScript, React, Next.js, next-intl

---

## Task 1: Update MotionParams Type Definition

**Files:**
- Modify: `src/types/index.ts:77-84`

**Step 1: Add new motion param types**

```typescript
// 基础运动参数（所有类型共有）
interface BaseMotionParams {
  profile: 'TRAPEZOIDAL' | 'S_CURVE';
  dwellTime: number;
  cycleTime: number;
}

// 直线运动参数（丝杠、齿条齿轮、直线直驱）
export interface LinearMotionParams extends BaseMotionParams {
  motionType: 'LINEAR';
  stroke: number;           // mm
  maxVelocity: number;      // mm/s
  maxAcceleration: number;  // mm/s²
}

// 旋转运动参数（齿轮、旋转直驱）
export interface RotaryMotionParams extends BaseMotionParams {
  motionType: 'ROTARY';
  rotationAngle: number;    // ° (旋转角度)
  maxVelocity: number;      // rpm
  maxAcceleration: number;  // rad/s²
}

// 皮带传动参数
export interface BeltMotionParams extends BaseMotionParams {
  motionType: 'BELT';
  stroke: number;           // mm (皮带定位行程)
  maxVelocity: number;      // mm/s
  maxAcceleration: number;  // mm/s²
}

// 联合类型
export type MotionParams = LinearMotionParams | RotaryMotionParams | BeltMotionParams;
```

**Step 2: Add type guard functions**

```typescript
// Type guards
export function isLinearMotion(params: MotionParams): params is LinearMotionParams {
  return params.motionType === 'LINEAR';
}

export function isRotaryMotion(params: MotionParams): params is RotaryMotionParams {
  return params.motionType === 'ROTARY';
}

export function isBeltMotion(params: MotionParams): params is BeltMotionParams {
  return params.motionType === 'BELT';
}
```

**Step 3: Update old MotionParams interface (comment for migration)**

```typescript
// @deprecated 使用 LinearMotionParams | RotaryMotionParams | BeltMotionParams
export interface LegacyMotionParams {
  stroke: number;
  maxVelocity: number;
  maxAcceleration: number;
  profile: 'TRAPEZOIDAL' | 'S_CURVE';
  dwellTime: number;
  cycleTime: number;
}
```

**Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add union type for motion params by mechanism type

- Add LinearMotionParams for ball screw, rack/pinion, linear direct drive
- Add RotaryMotionParams for gearbox, rotary direct drive
- Add BeltMotionParams for belt drives
- Add type guard functions for runtime type checking"
```

---

## Task 2: Update MechanicalCalculator with Unit Normalization

**Files:**
- Modify: `src/lib/calculations/mechanical.ts:147-174`
- Modify: `src/lib/calculations/mechanical.ts:280-308`

**Step 1: Add motion parameter normalization method**

```typescript
/**
 * 将不同运动类型的参数归一化为标准单位 (m, m/s, m/s²)
 * 用于统一计算运动时间
 */
private normalizeMotionParams(): { distance: number; velocity: number; acceleration: number } {
  const { motion, mechanism } = this.input;

  switch (motion.motionType) {
    case 'LINEAR':
    case 'BELT':
      return {
        distance: motion.stroke * 1e-3,        // mm -> m
        velocity: motion.maxVelocity * 1e-3,   // mm/s -> m/s
        acceleration: motion.maxAcceleration * 1e-3, // mm/s² -> m/s²
      };

    case 'ROTARY': {
      // 旋转运动：将角度转换为等效直线距离（用于运动时间计算）
      const angleRad = motion.rotationAngle * Math.PI / 180;  // ° -> rad

      // 根据传动类型获取等效半径
      const effectiveRadius = this.getEffectiveRadius();

      return {
        distance: angleRad * effectiveRadius,  // rad * m = m (等效弧长)
        velocity: this.getRotaryLinearVelocity(),  // m/s
        acceleration: this.getRotaryLinearAcceleration(), // m/s²
      };
    }

    default:
      throw new Error(`Unknown motion type: ${(motion as any).motionType}`);
  }
}

/**
 * 获取传动机构的等效半径（用于旋转运动转换）
 */
private getEffectiveRadius(): number {
  const { type, params } = this.input.mechanism;

  switch (type) {
    case 'GEARBOX': {
      const p = params as GearboxParams;
      if (p.loadType === 'TABLE' && p.tableDiameter) {
        return p.tableDiameter * 1e-3 / 2;  // 转盘半径
      } else if (p.loadType === 'DRUM' && p.drumDiameter) {
        return p.drumDiameter * 1e-3 / 2;   // 卷筒半径
      }
      // 默认假设半径 0.1m (100mm)
      return 0.1;
    }

    case 'DIRECT_DRIVE': {
      const p = params as DirectDriveParams;
      if (p.driveType === 'ROTARY' && p.tableDiameter) {
        return p.tableDiameter * 1e-3 / 2;
      }
      return 0.1;
    }

    default:
      return 0.1;
  }
}

/**
 * 获取旋转运动的等效线速度 (m/s)
 */
private getRotaryLinearVelocity(): number {
  const { motion } = this.input;
  if (motion.motionType !== 'ROTARY') return 0;

  const radius = this.getEffectiveRadius();
  const rpm = motion.maxVelocity;  // rpm
  const radPerSec = rpm * 2 * Math.PI / 60;  // rad/s

  return radPerSec * radius;  // m/s
}

/**
 * 获取旋转运动的等效线加速度 (m/s²)
 */
private getRotaryLinearAcceleration(): number {
  const { motion } = this.input;
  if (motion.motionType !== 'ROTARY') return 0;

  const radius = this.getEffectiveRadius();
  const radPerSec2 = motion.maxAcceleration;  // rad/s²

  return radPerSec2 * radius;  // m/s²
}
```

**Step 2: Update calculateMotionTimes to use normalized params**

```typescript
private calculateMotionTimes(): { accel: number; constant: number; decel: number; dwell: number } {
  // 使用归一化后的参数
  const { distance, velocity, acceleration } = this.normalizeMotionParams();

  const t_accel = velocity / acceleration;
  const s_accel = 0.5 * acceleration * t_accel * t_accel;

  if (2 * s_accel <= distance) {
    const s_constant = distance - 2 * s_accel;
    const t_constant = s_constant / velocity;
    return {
      accel: t_accel,
      constant: t_constant,
      decel: t_accel,
      dwell: this.input.motion.dwellTime,
    };
  } else {
    const t_peak = Math.sqrt(distance / acceleration);
    return {
      accel: t_peak,
      constant: 0,
      decel: t_peak,
      dwell: this.input.motion.dwellTime,
    };
  }
}
```

**Step 3: Update getMaxAngularSpeed for rotary motion**

```typescript
private getMaxAngularSpeed(): number {
  const { type, params } = this.input.mechanism;
  const { motion } = this.input;

  // 如果是旋转运动，直接使用输入的转速
  if (motion.motionType === 'ROTARY') {
    return motion.maxVelocity * 2 * Math.PI / 60;  // rpm -> rad/s
  }

  // 原有直线运动转换逻辑保持不变
  const v = motion.maxVelocity * 1e-3;  // mm/s -> m/s

  switch (type) {
    case 'BALL_SCREW': {
      const p = params as BallScrewParams;
      return (v * 2 * Math.PI * p.gearRatio) / (p.lead * 1e-3);
    }
    // ... 其他情况保持不变
  }
}
```

**Step 4: Commit**

```bash
git add src/lib/calculations/mechanical.ts
git commit -m "feat(calculations): add motion parameter normalization

- Add normalizeMotionParams() to convert LINEAR/ROTARY/BELT to standard units
- Add getEffectiveRadius() for rotary motion arc length calculation
- Update calculateMotionTimes() to use normalized parameters
- Update getMaxAngularSpeed() to handle rotary motion directly"
```

---

## Task 3: Update build-sizing-input.ts for Motion Type Detection

**Files:**
- Modify: `src/lib/calculations/build-sizing-input.ts`

**Step 1: Add motion type detection helper**

```typescript
import { MotionParams, LinearMotionParams, RotaryMotionParams, BeltMotionParams, MechanismType } from '@/types';

/**
 * 根据传动类型确定运动参数类型
 */
function getMotionTypeForMechanism(mechanismType: MechanismType): 'LINEAR' | 'ROTARY' | 'BELT' {
  switch (mechanismType) {
    case 'BALL_SCREW':
    case 'RACK_PINION':
      return 'LINEAR';

    case 'GEARBOX':
      return 'ROTARY';

    case 'DIRECT_DRIVE':
      // 根据 driveType 判断，但默认为 ROTARY
      return 'ROTARY';

    case 'BELT':
      return 'BELT';

    default:
      return 'LINEAR';
  }
}

/**
 * 构建默认运动参数
 */
export function buildDefaultMotionParams(mechanismType: MechanismType): MotionParams {
  const motionType = getMotionTypeForMechanism(mechanismType);

  switch (motionType) {
    case 'LINEAR':
      return {
        motionType: 'LINEAR',
        stroke: 500,
        maxVelocity: 500,
        maxAcceleration: 5000,
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };

    case 'ROTARY':
      return {
        motionType: 'ROTARY',
        rotationAngle: 360,  // 一整圈
        maxVelocity: 60,     // 60 rpm
        maxAcceleration: 300, // rad/s²
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };

    case 'BELT':
      return {
        motionType: 'BELT',
        stroke: 1000,
        maxVelocity: 1000,
        maxAcceleration: 5000,
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      };
  }
}
```

**Step 2: Update existing buildSizingInput to use new motion params**

```typescript
// 在构建 SizingInput 时确保 motion 参数有正确的 motionType
export function buildSizingInput(
  project: Project,
  axis: AxisConfig,
  commonParams: CommonParams
): SizingInput {
  const mechanism = axis.input.mechanism!;
  const motion = axis.input.motion!;

  // 确保 motion 有 motionType 字段（向后兼容）
  const motionWithType: MotionParams = {
    ...motion,
    motionType: (motion as any).motionType || getMotionTypeForMechanism(mechanism.type),
  };

  return {
    project: {
      name: project.name,
      customer: project.customer,
      salesPerson: project.salesPerson,
      notes: project.notes,
    },
    mechanism,
    motion: motionWithType,
    duty: {
      ...axis.input.dutyConditions!,
      ambientTemp: commonParams.ambientTemp,
      ipRating: commonParams.ipRating,
    },
    preferences: {
      ...axis.input.preferences!,
      safetyFactor: commonParams.safetyFactor,
      maxInertiaRatio: commonParams.maxInertiaRatio,
      targetInertiaRatio: commonParams.targetInertiaRatio,
      communication: commonParams.communication,
      cableLength: commonParams.cableLength,
    },
    selections: axis.input.selections,
  };
}
```

**Step 3: Commit**

```bash
git add src/lib/calculations/build-sizing-input.ts
git commit -m "feat(calculations): add motion type detection and default params

- Add getMotionTypeForMechanism() to determine LINEAR/ROTARY/BELT
- Add buildDefaultMotionParams() with type-specific defaults
- Update buildSizingInput() to ensure backward compatibility"
```

---

## Task 4: Update MotionStep UI for Dynamic Fields

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx`

**Step 1: Import new types and helpers**

```typescript
import {
  MotionParams,
  LinearMotionParams,
  RotaryMotionParams,
  BeltMotionParams,
  MechanismType
} from '@/types';
import { buildDefaultMotionParams } from '@/lib/calculations/build-sizing-input';
```

**Step 2: Add motion type detection helper in component**

```typescript
/**
 * 根据传动类型获取运动参数类型
 */
function getMotionType(mechanismType: MechanismType): 'LINEAR' | 'ROTARY' | 'BELT' {
  switch (mechanismType) {
    case 'BALL_SCREW':
    case 'RACK_PINION':
      return 'LINEAR';
    case 'GEARBOX':
      return 'ROTARY';
    case 'DIRECT_DRIVE':
      return 'ROTARY'; // 默认旋转，可根据需要调整
    case 'BELT':
      return 'BELT';
    default:
      return 'LINEAR';
  }
}
```

**Step 3: Update form initialization**

```typescript
export function MotionStep() {
  const { input, setMotion, nextStep, prevStep } = useProjectStore();
  const t = useTranslations('motion');
  const commonT = useTranslations('common');

  // 获取当前传动类型
  const mechanismType = input.mechanism?.type || 'BALL_SCREW';
  const motionType = getMotionType(mechanismType);

  // 初始化表单数据
  const [formData, setFormData] = useState<MotionParams>(() => {
    if (input.motion) {
      // 确保现有数据有 motionType
      return {
        ...input.motion,
        motionType: (input.motion as any).motionType || motionType,
      };
    }
    // 使用默认值
    return buildDefaultMotionParams(mechanismType);
  });

  // 当传动类型改变时重置表单
  useEffect(() => {
    const newMotionType = getMotionType(mechanismType);
    if (formData.motionType !== newMotionType) {
      setFormData(buildDefaultMotionParams(mechanismType));
    }
  }, [mechanismType]);
```

**Step 4: Add dynamic field rendering**

```typescript
  // 渲染直线运动参数
  const renderLinearParams = () => {
    const data = formData as LinearMotionParams;
    return (
      <>
        <FormField label={t('stroke')} required hint={t('hints.stroke')}>
          <div className="relative">
            <input
              type="number"
              value={data.stroke}
              onChange={(e) =>
                setFormData({ ...data, stroke: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('maxVelocity')} required hint={t('hints.maxVelocity')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxVelocity}
              onChange={(e) =>
                setFormData({ ...data, maxVelocity: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s</span>
          </div>
        </FormField>

        <FormField label={t('maxAcceleration')} required hint={t('hints.maxAcceleration')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxAcceleration}
              onChange={(e) =>
                setFormData({ ...data, maxAcceleration: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s²</span>
          </div>
        </FormField>
      </>
    );
  };

  // 渲染旋转运动参数
  const renderRotaryParams = () => {
    const data = formData as RotaryMotionParams;
    return (
      <>
        <FormField label={t('rotationAngle')} required hint={t('hints.rotationAngle')}>
          <div className="relative">
            <input
              type="number"
              value={data.rotationAngle}
              onChange={(e) =>
                setFormData({ ...data, rotationAngle: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">°</span>
          </div>
        </FormField>

        <FormField label={t('maxVelocityRotary')} required hint={t('hints.maxVelocityRotary')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxVelocity}
              onChange={(e) =>
                setFormData({ ...data, maxVelocity: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">rpm</span>
          </div>
        </FormField>

        <FormField label={t('maxAccelerationRotary')} required hint={t('hints.maxAccelerationRotary')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxAcceleration}
              onChange={(e) =>
                setFormData({ ...data, maxAcceleration: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">rad/s²</span>
          </div>
        </FormField>
      </>
    );
  };

  // 渲染皮带运动参数（与直线类似）
  const renderBeltParams = () => {
    const data = formData as BeltMotionParams;
    return renderLinearParams(); // 皮带使用与直线相同的字段
  };

  // 根据运动类型渲染对应字段
  const renderMotionParams = () => {
    switch (formData.motionType) {
      case 'LINEAR':
        return renderLinearParams();
      case 'ROTARY':
        return renderRotaryParams();
      case 'BELT':
        return renderBeltParams();
      default:
        return renderLinearParams();
    }
  };
```

**Step 5: Update form submission**

```typescript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMotion(formData);
    nextStep();
  };
```

**Step 6: Update JSX to use dynamic rendering**

```tsx
      {/* Parameters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-[var(--primary-400)] to-[var(--primary-600)] rounded-full"></span>
          {t('paramsTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {renderMotionParams()}

          <FormField label={t('dwellTime')} hint={t('hints.dwellTime')}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.dwellTime}
                onChange={(e) =>
                  setFormData({ ...formData, dwellTime: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">s</span>
            </div>
          </FormField>

          <FormField label={t('cycleTime')} hint={t('hints.cycleTime')}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.cycleTime}
                onChange={(e) =>
                  setFormData({ ...formData, cycleTime: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">s</span>
            </div>
          </FormField>
        </div>
      </div>
```

**Step 7: Commit**

```bash
git add src/components/wizard/steps/MotionStep.tsx
git commit -m "feat(ui): dynamic motion params based on mechanism type

- Add getMotionType() helper to determine param type from mechanism
- Add renderLinearParams(), renderRotaryParams(), renderBeltParams()
- Use useEffect to reset form when mechanism type changes
- Update form submission to use new MotionParams union type"
```

---

## Task 5: Add i18n Translations

**Files:**
- Modify: `src/i18n/messages/zh.json:141-174`
- Modify: `src/i18n/messages/en.json`

**Step 1: Update zh.json motion section**

```json
{
  "motion": {
    "title": "运动参数",
    "subtitle": "定义运动行程、速度和加速度参数",
    "profileLabel": "速度曲线类型",
    "paramsTitle": "运动参数",
    "stroke": "行程 (mm)",
    "rotationAngle": "旋转角度 (°)",
    "maxVelocity": "最大速度 (mm/s)",
    "maxVelocityRotary": "最大转速 (rpm)",
    "maxAcceleration": "最大加速度 (mm/s²)",
    "maxAccelerationRotary": "最大角加速度 (rad/s²)",
    "profile": "运动曲线",
    "profiles": {
      "trapezoidal": "梯形曲线",
      "sCurve": "S曲线"
    },
    "profileDesc": {
      "trapezoidal": "恒加速运动",
      "sCurve": "平滑加减速"
    },
    "hints": {
      "stroke": "直线运动的总行程范围",
      "rotationAngle": "旋转运动的范围角度，360°为一整圈",
      "maxVelocity": "最大运行速度",
      "maxVelocityRotary": "最大旋转转速",
      "maxAcceleration": "最大加速度",
      "maxAccelerationRotary": "最大角加速度",
      "dwellTime": "到位后的停留时间",
      "cycleTime": "完整运动周期时间"
    },
    "stats": {
      "cycleRate": "理论节拍",
      "cyclesPerMinute": "次/分钟",
      "accelRatio": "加速度比",
      "maxSpeed": "最大速度",
      "stroke": "行程",
      "rotationAngle": "旋转角度"
    },
    "dwellTime": "停顿时间 (s)",
    "cycleTime": "循环周期 (s)"
  }
}
```

**Step 2: Update en.json motion section**

```json
{
  "motion": {
    "title": "Motion Parameters",
    "subtitle": "Define stroke, velocity and acceleration parameters",
    "profileLabel": "Velocity Profile",
    "paramsTitle": "Motion Parameters",
    "stroke": "Stroke (mm)",
    "rotationAngle": "Rotation Angle (°)",
    "maxVelocity": "Max Velocity (mm/s)",
    "maxVelocityRotary": "Max Speed (rpm)",
    "maxAcceleration": "Max Acceleration (mm/s²)",
    "maxAccelerationRotary": "Max Angular Accel (rad/s²)",
    "profile": "Motion Profile",
    "profiles": {
      "trapezoidal": "Trapezoidal",
      "sCurve": "S-Curve"
    },
    "profileDesc": {
      "trapezoidal": "Constant acceleration",
      "sCurve": "Smooth acceleration"
    },
    "hints": {
      "stroke": "Total linear travel distance",
      "rotationAngle": "Rotation range in degrees, 360° = one full revolution",
      "maxVelocity": "Maximum running velocity",
      "maxVelocityRotary": "Maximum rotation speed",
      "maxAcceleration": "Maximum acceleration",
      "maxAccelerationRotary": "Maximum angular acceleration",
      "dwellTime": "Dwell time after positioning",
      "cycleTime": "Complete motion cycle time"
    },
    "stats": {
      "cycleRate": "Cycle Rate",
      "cyclesPerMinute": "cycles/min",
      "accelRatio": "Accel Ratio",
      "maxSpeed": "Max Speed",
      "stroke": "Stroke",
      "rotationAngle": "Rotation"
    },
    "dwellTime": "Dwell Time (s)",
    "cycleTime": "Cycle Time (s)"
  }
}
```

**Step 3: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "feat(i18n): add translations for dynamic motion params

- Add rotationAngle, maxVelocityRotary, maxAccelerationRotary keys
- Update hints with rotary-specific descriptions
- Add stats labels for rotation display"
```

---

## Task 6: Update Quick Stats Display

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx:216-253`

**Step 1: Add dynamic stats rendering**

```typescript
  // 渲染快速统计信息
  const renderQuickStats = () => {
    const isRotary = formData.motionType === 'ROTARY';

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-[var(--primary-400)] mx-auto mb-2" />
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.cycleRate')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {(60 / (formData.cycleTime || 1)).toFixed(1)}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">{t('stats.cyclesPerMinute')}</p>
        </div>
        <div className="card p-4 text-center">
          <Activity className="w-5 h-5 text-[var(--green-400)] mx-auto mb-2" />
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.accelRatio')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {isRotary
              ? (formData.maxAcceleration / 9.8).toFixed(2)  // rad/s² 转 g 近似
              : (formData.maxAcceleration / 9800).toFixed(2)  // mm/s² 转 g
            }
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">g</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--amber-400)] mx-auto mb-2 flex items-center justify-center">
            <span className="text-[10px] text-[var(--amber-400)]">V</span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.maxSpeed')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {formData.maxVelocity}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {isRotary ? 'rpm' : 'mm/s'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--primary-400)] mx-auto mb-2 flex items-center justify-center">
            <span className="text-[10px] text-[var(--primary-400)]">
              {isRotary ? '°' : 'S'}
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mb-1">
            {isRotary ? t('stats.rotationAngle') : t('stats.stroke')}
          </p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {isRotary
              ? (formData as RotaryMotionParams).rotationAngle
              : (formData as LinearMotionParams).stroke}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {isRotary ? '°' : 'mm'}
          </p>
        </div>
      </div>
    );
  };
```

**Step 2: Replace static stats with dynamic rendering**

```tsx
      {/* Quick Stats */}
      {renderQuickStats()}
```

**Step 3: Commit**

```bash
git add src/components/wizard/steps/MotionStep.tsx
git commit -m "feat(ui): dynamic quick stats based on motion type

- Add renderQuickStats() helper for dynamic stat display
- Show rpm/° for rotary motion, mm/s/mm for linear
- Update acceleration ratio calculation for both types"
```

---

## Task 7: Run Type Check and Build

**Files:**
- All modified files

**Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: No type errors

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds

**Step 3: Commit**

```bash
git commit -m "chore: verify type check and build pass

- All TypeScript types compile without errors
- Build completes successfully"
```

---

## Task 8: Update Tests

**Files:**
- Modify: `src/lib/calculations/__tests__/sizing-engine.test.ts`
- Modify: `src/lib/calculations/__tests__/build-sizing-input.test.ts`

**Step 1: Add test for new motion param types**

```typescript
// src/lib/calculations/__tests__/sizing-engine.test.ts

describe('Motion Parameter Types', () => {
  it('should handle LINEAR motion params', () => {
    const input = createTestInput({
      mechanismType: 'BALL_SCREW',
      motion: {
        motionType: 'LINEAR',
        stroke: 500,
        maxVelocity: 500,
        maxAcceleration: 5000,
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      },
    });

    const result = engine.calculate(input);
    expect(result.mechanical.torques.peak).toBeGreaterThan(0);
  });

  it('should handle ROTARY motion params', () => {
    const input = createTestInput({
      mechanismType: 'GEARBOX',
      motion: {
        motionType: 'ROTARY',
        rotationAngle: 360,
        maxVelocity: 60,  // rpm
        maxAcceleration: 300,  // rad/s²
        profile: 'TRAPEZOIDAL',
        dwellTime: 0.5,
        cycleTime: 3,
      },
    });

    const result = engine.calculate(input);
    expect(result.mechanical.torques.peak).toBeGreaterThan(0);
    expect(result.mechanical.speeds.max).toBeGreaterThan(0);
  });
});
```

**Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/calculations/__tests__/
git commit -m "test: add tests for new motion param types

- Add test for LINEAR motion params with ball screw
- Add test for ROTARY motion params with gearbox
- Verify calculations work with both types"
```

---

## Summary

This implementation plan covers:

1. **Type System**: Union type `MotionParams = LinearMotionParams | RotaryMotionParams | BeltMotionParams`
2. **Calculation Logic**: Normalization methods to convert different units to standard units
3. **UI**: Dynamic field rendering based on mechanism type
4. **i18n**: New translation keys for rotary-specific labels
5. **Tests**: Unit tests for both motion types

All changes maintain backward compatibility by:
- Adding `motionType` field with sensible defaults
- Preserving existing field names where possible
- Using type guards for runtime type checking
