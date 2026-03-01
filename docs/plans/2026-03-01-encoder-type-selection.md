# 编码器类型选择功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在系统配置步骤中添加编码器类型选择，并在电机筛选时根据编码器类型过滤电机推荐结果

**Architecture:** 在 SystemPreferences 中添加 encoderType 字段，在 SystemConfigStep 中添加编码器类型选择UI，在 MotorFilter 中根据编码器类型筛选电机。数据层面利用 motors.json 中已存在的 encoder.type 字段（BATTERY_MULTI_TURN / MECHANICAL_MULTI_TURN）进行匹配。

**Tech Stack:** TypeScript, React, Next.js, Zustand

---

## 前置条件

- 当前在 git worktree 中工作
- 已运行 `npm install` 安装依赖
- 开发服务器可手动启动 `npm run dev`

---

## Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts:94-101`

**Step 1: 在 SystemPreferences 接口中添加 encoderType 字段**

```typescript
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';
  cableLength: number | 'TERMINAL_ONLY';
  encoderType: 'A' | 'B' | 'BOTH';  // 新增: A=电池盒式, B=机械式, BOTH=两者都可
}
```

**Step 2: 验证类型定义**

检查文件中其他使用 SystemPreferences 的地方，确保兼容性。

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "types: add encoderType to SystemPreferences"
```

---

## Task 2: 在 SystemConfigStep 中添加编码器类型选择UI

**Files:**
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx:21-30`
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx:55-162`

**Step 1: 更新默认表单数据**

找到 formData 的初始化，添加 encoderType 默认值：

```typescript
const [formData, setFormData] = useState<SystemPreferences>(
  input.preferences || {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
    encoderType: 'BOTH',  // 新增
  }
);
```

**Step 2: 在表单中添加编码器类型选择**

在电缆长度选择之后（第161行后），添加编码器类型选择：

```tsx
{/* 编码器类型选择 */}
<div>
  <label className="block text-sm font-medium text-gray-700">
    编码器类型
  </label>
  <select
    value={formData.encoderType}
    onChange={(e) =>
      setFormData({ ...formData, encoderType: e.target.value as 'A' | 'B' | 'BOTH' })
    }
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
  >
    <option value="BOTH">两者都可 (显示所有选项)</option>
    <option value="A">A型 - 电池盒式多圈 (2.5Mbps)</option>
    <option value="B">B型 - 机械式多圈 (5Mbps)</option>
  </select>
  <p className="mt-1 text-xs text-gray-500">
    A型需要电池维护，B型为机械式免维护但价格较高
  </p>
</div>
```

**Step 3: 验证UI渲染**

启动开发服务器，访问第4步（系统配置），确认编码器类型选择器显示正常。

**Step 4: Commit**

```bash
git add src/components/wizard/steps/SystemConfigStep.tsx
git commit -m "feat(ui): add encoder type selector in SystemConfigStep"
```

---

## Task 3: 更新 MotorFilter 以支持编码器类型筛选

**Files:**
- Modify: `src/lib/calculations/motor-filter.ts:1-53`

**Step 1: 更新构造函数以接收编码器类型参数**

```typescript
export class MotorFilter {
  private motors: MC20Motor[];
  private mechanical: MechanicalResult;
  private preferences: SystemPreferences;
  private duty?: DutyConditions;

  constructor(mechanical: MechanicalResult, preferences: SystemPreferences, duty?: DutyConditions) {
    this.motors = motorsData.motors as unknown as MC20Motor[];
    this.mechanical = mechanical;
    this.preferences = preferences;
    this.duty = duty;
  }
```

构造函数已正确接收 preferences，可直接使用 preferences.encoderType。

**Step 2: 在 filter 方法中添加编码器类型筛选逻辑**

在刹车筛选逻辑之后（第44行后），添加编码器类型筛选：

```typescript
// 根据编码器类型筛选
if (this.preferences.encoderType && this.preferences.encoderType !== 'BOTH') {
  const targetEncoderType = this.preferences.encoderType === 'A'
    ? 'BATTERY_MULTI_TURN'
    : 'MECHANICAL_MULTI_TURN';

  candidates = candidates.filter(motor =>
    motor.options.encoder.type === targetEncoderType
  );
}
```

**Step 3: 验证筛选逻辑**

检查 motors.json 中的电机数据，确认 encoder.type 字段值为 'BATTERY_MULTI_TURN' 或 'MECHANICAL_MULTI_TURN'。

**Step 4: Commit**

```bash
git add src/lib/calculations/motor-filter.ts
git commit -m "feat(filter): filter motors by encoder type preference"
```

---

## Task 4: 更新测试

**Files:**
- Modify: `src/lib/calculations/__tests__/motor-filter.test.ts`

**Step 1: 添加编码器类型筛选测试用例**

在测试文件中添加：

```typescript
describe('Encoder Type Filtering', () => {
  it('should filter motors by encoder type A (battery)', () => {
    const prefsWithEncoderA: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'A',
    };

    const filter = new MotorFilter(mechanical, prefsWithEncoderA);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.encoder.type).toBe('BATTERY_MULTI_TURN');
    });
  });

  it('should filter motors by encoder type B (mechanical)', () => {
    const prefsWithEncoderB: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'B',
    };

    const filter = new MotorFilter(mechanical, prefsWithEncoderB);
    const results = filter.filter();

    expect(results.length).toBeGreaterThan(0);
    results.forEach(rec => {
      expect(rec.motor.options.encoder.type).toBe('MECHANICAL_MULTI_TURN');
    });
  });

  it('should show both encoder types when BOTH is selected', () => {
    const prefsWithBoth: SystemPreferences = {
      ...defaultPrefs,
      encoderType: 'BOTH',
    };

    const filter = new MotorFilter(mechanical, prefsWithBoth);
    const results = filter.filter();

    const hasBattery = results.some(r => r.motor.options.encoder.type === 'BATTERY_MULTI_TURN');
    const hasMechanical = results.some(r => r.motor.options.encoder.type === 'MECHANICAL_MULTI_TURN');

    expect(hasBattery || hasMechanical).toBe(true);
  });
});
```

**Step 2: 运行测试**

```bash
npm test -- src/lib/calculations/__tests__/motor-filter.test.ts
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/calculations/__tests__/motor-filter.test.ts
git commit -m "test(filter): add encoder type filtering tests"
```

---

## Task 5: 验证端到端流程

**Files:**
- 运行: Playwright E2E 测试

**Step 1: 构建项目**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 2: 运行 E2E 测试**

```bash
npx playwright test
```

Expected: All tests pass

**Step 3: 手动验证**

1. 启动开发服务器: `npm run dev`
2. 完成前3步向导
3. 在第4步（系统配置）中选择不同的编码器类型
4. 查看第5步结果，确认电机列表按编码器类型过滤

**Step 4: Commit**

```bash
git commit -m "chore: verify encoder type selection E2E"
```

---

## 完成检查清单

- [ ] SystemPreferences 类型包含 encoderType 字段
- [ ] SystemConfigStep 显示编码器类型选择器
- [ ] MotorFilter 根据 encoderType 筛选电机
- [ ] 单元测试覆盖编码器类型筛选
- [ ] E2E 测试通过
- [ ] 构建成功

---

## 相关文档

- 产品目录: `docs/data/XC20_MC20_产品目录.md` (第332-333行编码器类型定义)
- 电缆规格: `src/data/cables.json` (第79-95行编码器电缆定义)
- 电机数据: `src/data/motors.json` (encoder.type 字段)
