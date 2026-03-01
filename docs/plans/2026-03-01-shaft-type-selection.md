# 电机轴类型选择功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 Step 4 (工况条件) 添加电机轴类型选择，用户必须二选一（光轴 L / 带键 K），并根据选择筛选电机。

**Architecture:** 在 DutyConditions 类型中添加 keyShaft 字段，在 DutyStep 组件中添加 UI 选择，在 MotorFilter 中添加筛选逻辑。

**Tech Stack:** TypeScript, React, Next.js, Vitest

---

## 前置检查

### Task 0: 验证当前代码状态

**Files:**
- Read: `src/types/index.ts` (确认 DutyConditions 定义)
- Read: `src/lib/calculations/motor-filter.ts` (确认现有筛选逻辑)
- Read: `src/components/wizard/steps/DutyStep.tsx` (确认现有 UI)

**Step 1: 检查 motors.json 中的 keyShaft 数据**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && head -100 src/data/motors.json | grep -A5 "keyShaft"
```

Expected: 显示 keyShaft 定义，包含 code 和 hasKey 字段

**Step 2: 运行现有测试确保基线通过**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npm test -- --run
```

Expected: 所有测试通过

---

## Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts:86-92`

**Step 1: 添加 keyShaft 字段到 DutyConditions**

```typescript
export interface DutyConditions {
  ambientTemp: number;
  dutyCycle: number;
  mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
  ipRating: 'IP54' | 'IP65' | 'IP67';
  brake: boolean;
  keyShaft: 'L' | 'K';  // 新增: L=光轴, K=带键
}
```

**Step 2: 验证类型检查通过**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npx tsc --noEmit
```

Expected: 可能有错误（其他文件还未更新），但类型定义本身正确

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "types: add keyShaft field to DutyConditions"
```

---

## Task 2: 更新 DutyStep UI

**Files:**
- Modify: `src/components/wizard/steps/DutyStep.tsx`

**Step 1: 添加 keyShaft 选项常量**

在文件顶部（BRAKE_OPTIONS 下方）添加：

```typescript
const KEYSHAFT_OPTIONS = [
  { value: 'L' as const, label: '光轴', desc: '标准光滑轴，适用于联轴器连接' },
  { value: 'K' as const, label: '带键', desc: '带键槽轴，适用于需要传递大扭矩的场合' },
];
```

**Step 2: 更新默认表单数据**

修改 useState 初始化：

```typescript
const [formData, setFormData] = useState<DutyConditions>(
  input.duty || {
    ambientTemp: 40,
    dutyCycle: 60,
    mountingOrientation: 'HORIZONTAL',
    ipRating: 'IP65',
    brake: false,
    keyShaft: 'L',  // 新增: 默认光轴
  }
);
```

**Step 3: 添加 keyShaft 选择 UI**

在刹车选项下方（第149行后）添加：

```tsx
      {/* 电机轴类型选项 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          电机轴类型
        </label>
        <div className="grid grid-cols-2 gap-3">
          {KEYSHAFT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.keyShaft === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="keyShaft"
                value={opt.value}
                checked={formData.keyShaft === opt.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keyShaft: e.target.value as 'L' | 'K',
                  })
                }
                className="sr-only"
              />
              <div className={`font-medium text-sm ${formData.keyShaft === opt.value ? 'text-blue-900' : 'text-gray-900'}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1 ${formData.keyShaft === opt.value ? 'text-blue-700' : 'text-gray-500'}`}>
                {opt.desc}
              </div>
            </label>
          ))}
        </div>
      </div>
```

**Step 4: 验证构建**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npx tsc --noEmit
```

Expected: 无错误

**Step 5: Commit**

```bash
git add src/components/wizard/steps/DutyStep.tsx
git commit -m "feat(ui): add keyShaft selector in DutyStep"
```

---

## Task 3: 更新 MotorFilter 筛选逻辑

**Files:**
- Modify: `src/lib/calculations/motor-filter.ts`

**Step 1: 添加 keyShaft 筛选逻辑**

在刹车筛选代码后（第44行后）添加：

```typescript
    // 根据电机轴类型筛选
    if (this.duty?.keyShaft !== undefined) {
      candidates = candidates.filter(motor =>
        motor.options.keyShaft.hasKey === (this.duty!.keyShaft === 'K')
      );
    }
```

完整上下文：
```typescript
    // 根据刹车选项筛选
    if (this.duty?.brake !== undefined) {
      candidates = candidates.filter(motor =>
        motor.options.brake.hasBrake === this.duty!.brake
      );
    }

    // 根据电机轴类型筛选
    if (this.duty?.keyShaft !== undefined) {
      candidates = candidates.filter(motor =>
        motor.options.keyShaft.hasKey === (this.duty!.keyShaft === 'K')
      );
    }
```

**Step 2: 验证构建**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npx tsc --noEmit
```

Expected: 无错误

**Step 3: Commit**

```bash
git add src/lib/calculations/motor-filter.ts
git commit -m "feat(filter): filter motors by keyShaft preference"
```

---

## Task 4: 添加单元测试

**Files:**
- Modify: `src/lib/calculations/__tests__/motor-filter.test.ts`

**Step 1: 读取现有测试文件**

Read: `src/lib/calculations/__tests__/motor-filter.test.ts`

**Step 2: 添加 keyShaft 筛选测试**

在文件末尾添加：

```typescript
describe('keyShaft filtering', () => {
  const baseMechanical: MechanicalResult = {
    loadInertia: 0.0001,
    totalInertia: 0.00012,
    inertiaRatio: 5,
    torques: {
      accel: 0.5,
      constant: 0.3,
      decel: 0.4,
      peak: 0.8,
      rms: 0.4,
    },
    speeds: {
      max: 2000,
      rms: 1500,
    },
    powers: {
      peak: 100,
      continuous: 80,
    },
    regeneration: {
      energyPerCycle: 0,
      brakingPower: 0,
      requiresExternalResistor: false,
    },
  };

  const basePreferences: SystemPreferences = {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
    encoderType: 'BOTH',
  };

  it('should filter motors by smooth shaft (L)', () => {
    const duty: DutyConditions = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      keyShaft: 'L',
    };

    const filter = new MotorFilter(baseMechanical, basePreferences, duty);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.keyShaft.hasKey).toBe(false);
      expect(rec.motor.options.keyShaft.code).toBe('L');
    });
  });

  it('should filter motors by keyed shaft (K)', () => {
    const duty: DutyConditions = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      keyShaft: 'K',
    };

    const filter = new MotorFilter(baseMechanical, basePreferences, duty);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.keyShaft.hasKey).toBe(true);
      expect(rec.motor.options.keyShaft.code).toBe('K');
    });
  });

  it('should handle duty without keyShaft (backward compatibility)', () => {
    const dutyWithoutKeyShaft = {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
      // keyShaft 未定义
    } as DutyConditions;

    const filter = new MotorFilter(baseMechanical, basePreferences, dutyWithoutKeyShaft);
    const results = filter.filter();

    // 不过滤，应该返回所有符合条件的电机
    expect(results.length).toBeGreaterThan(0);
  });
});
```

**Step 3: 运行测试**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npm test -- --run src/lib/calculations/__tests__/motor-filter.test.ts
```

Expected: 所有测试通过，包括新增的 keyShaft 测试

**Step 4: Commit**

```bash
git add src/lib/calculations/__tests__/motor-filter.test.ts
git commit -m "test(filter): add keyShaft filtering tests"
```

---

## Task 5: 更新类型测试

**Files:**
- Modify: `src/types/__tests__/types.test.ts`

**Step 1: 读取现有测试文件**

Read: `src/types/__tests__/types.test.ts`

**Step 2: 更新 DutyConditions 测试**

找到 DutyConditions 相关的测试，添加 keyShaft 字段验证：

```typescript
it('should validate DutyConditions with keyShaft', () => {
  const duty: DutyConditions = {
    ambientTemp: 40,
    dutyCycle: 60,
    mountingOrientation: 'HORIZONTAL',
    ipRating: 'IP65',
    brake: false,
    keyShaft: 'L',  // 新增字段
  };

  expect(duty.keyShaft).toBeDefined();
  expect(['L', 'K']).toContain(duty.keyShaft);
});
```

**Step 3: 运行类型测试**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npm test -- --run src/types/__tests__/types.test.ts
```

Expected: 测试通过

**Step 4: Commit**

```bash
git add src/types/__tests__/types.test.ts
git commit -m "test(types): update DutyConditions test with keyShaft field"
```

---

## Task 6: 更新国际化文本

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

**Step 1: 读取现有国际化文件**

Read: `src/i18n/messages/zh.json`
Read: `src/i18n/messages/en.json`

**Step 2: 添加中文翻译**

在 `zh.json` 的 `duty` 部分添加：

```json
{
  "duty": {
    "keyShaft": "电机轴类型",
    "keyShaftOptions": {
      "smooth": "光轴 (L)",
      "smoothDesc": "标准光滑轴，适用于联轴器连接",
      "keyed": "带键 (K)",
      "keyedDesc": "带键槽轴，适用于需要传递大扭矩的场合"
    }
  }
}
```

**Step 3: 添加英文翻译**

在 `en.json` 的 `duty` 部分添加：

```json
{
  "duty": {
    "keyShaft": "Motor Shaft Type",
    "keyShaftOptions": {
      "smooth": "Smooth Shaft (L)",
      "smoothDesc": "Standard smooth shaft for coupling connection",
      "keyed": "Keyed Shaft (K)",
      "keyedDesc": "Keyed shaft for high torque transmission"
    }
  }
}
```

**Step 4: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "i18n: add keyShaft translations"
```

---

## Task 7: 更新 DutyStep 使用国际化

**Files:**
- Modify: `src/components/wizard/steps/DutyStep.tsx`

**Step 1: 更新 DutyStep 使用翻译**

修改 KEYSHAFT_OPTIONS 和 UI 使用翻译：

```typescript
// 在组件内部使用翻译
const { t } = useTranslations('duty');

// 更新选项（在组件内定义以使用 t 函数）
const keyShaftOptions = [
  { value: 'L' as const, label: t('keyShaftOptions.smooth'), desc: t('keyShaftOptions.smoothDesc') },
  { value: 'K' as const, label: t('keyShaftOptions.keyed'), desc: t('keyShaftOptions.keyedDesc') },
];
```

更新 label：
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('keyShaft')}
</label>
```

**Step 2: 验证构建**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npx tsc --noEmit
```

Expected: 无错误

**Step 3: Commit**

```bash
git add src/components/wizard/steps/DutyStep.tsx
git commit -m "feat(ui): use i18n for keyShaft selector"
```

---

## Task 8: 最终验证

**Step 1: 运行所有测试**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npm test -- --run
```

Expected: 所有测试通过

**Step 2: 类型检查**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npx tsc --noEmit
```

Expected: 无错误

**Step 3: 构建测试**

Run:
```bash
cd /d/Xing/dev/ctrlX/servo-selector && npm run build
```

Expected: 构建成功

**Step 4: 最终 Commit（如有更改）**

```bash
git add -A
git commit -m "chore: fix any issues from final verification" || echo "No changes to commit"
```

---

## 验收清单

- [ ] Step 4 显示电机轴类型选择（光轴 L / 带键 K）
- [ ] 用户必须二选一，默认选中光轴 (L)
- [ ] 选择光轴 (L) 时，筛选结果只显示 hasKey: false 的电机
- [ ] 选择带键 (K) 时，筛选结果只显示 hasKey: true 的电机
- [ ] 所有现有测试通过
- [ ] 新增 keyShaft 筛选测试通过
- [ ] 类型检查无错误
- [ ] 构建成功
- [ ] 国际化文本已添加

---

## 参考文档

- 设计文档: `docs/plans/2026-03-01-shaft-type-selection-design.md`
- 产品目录: `docs/data/XC20_MC20_产品目录.md` (第335-336行)
