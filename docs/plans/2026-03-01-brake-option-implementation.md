# 电机刹车选项功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在第四步添加刹车选项，根据用户选择筛选带刹车或不带刹车的电机，并正确生成匹配的电缆订货号。

**Architecture:** 在 DutyConditions 中添加 brake 字段，在第四步 UI 中根据安装方向自动设置默认值，在 MotorFilter 中根据 brake 值筛选电机，电缆配置使用电机的 brake 状态生成正确的订货号。

**Tech Stack:** Next.js, TypeScript, React, TailwindCSS

---

## 前置检查

### 检查 1: 验证当前工作目录

**命令:**
```bash
pwd && git status
```

**预期:** 在 `brake-option-feature` worktree 中，分支干净

---

## Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts:86-91`

**Step 1: 在 DutyConditions 接口中添加 brake 字段**

```typescript
export interface DutyConditions {
  ambientTemp: number;
  dutyCycle: number;
  mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
  ipRating: 'IP54' | 'IP65' | 'IP67';
  brake: boolean;  // 新增：刹车选项
}
```

**Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

**预期:** 可能有类型错误（因为现有代码没有提供 brake 值），这是正常的，下一步修复

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add brake field to DutyConditions interface"
```

---

## Task 2: 更新第四步 UI

**Files:**
- Modify: `src/components/wizard/steps/DutyStep.tsx`

**Step 1: 添加刹车选项配置常量**

在文件顶部（imports 之后）添加：

```typescript
const BRAKE_OPTIONS = [
  { value: false, label: '无刹车', desc: '标准配置，适合水平轴应用' },
  { value: true, label: '带刹车', desc: '抱闸制动，适合垂直轴或需要保持力矩的应用' },
];
```

**Step 2: 修改默认值逻辑**

找到 `DEFAULT_DUTY` 或初始化逻辑，添加：

```typescript
// 根据安装方向获取默认刹车值
const getDefaultBrake = (orientation: string): boolean => {
  return orientation.startsWith('VERTICAL');
};

// 在表单初始化时使用
const [formData, setFormData] = useState<DutyConditions>({
  ambientTemp: 40,
  dutyCycle: 80,
  mountingOrientation: 'HORIZONTAL',
  ipRating: 'IP65',
  brake: false,  // 默认值
});
```

**Step 3: 添加安装方向变化时的自动更新**

在 `mountingOrientation` 的 onChange 处理中添加：

```typescript
onChange={(e) => {
  const newOrientation = e.target.value as DutyConditions['mountingOrientation'];
  setFormData({
    ...formData,
    mountingOrientation: newOrientation,
    brake: newOrientation.startsWith('VERTICAL'),  // 自动更新刹车默认值
  });
}}
```

**Step 4: 添加刹车选项 UI**

在表单中添加刹车选择器（在 mountingOrientation 之后）：

```tsx
<div className="space-y-3">
  <label className="block text-sm font-medium text-gray-700">
    电机刹车
    {formData.mountingOrientation.startsWith('VERTICAL') && (
      <span className="ml-2 text-xs text-amber-600">(垂直轴建议带刹车)</span>
    )}
  </label>
  <div className="grid grid-cols-2 gap-3">
    {BRAKE_OPTIONS.map((opt) => (
      <label
        key={opt.value ? 'yes' : 'no'}
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          formData.brake === opt.value
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="radio"
          name="brake"
          value={opt.value ? 'true' : 'false'}
          checked={formData.brake === opt.value}
          onChange={(e) =>
            setFormData({
              ...formData,
              brake: e.target.value === 'true',
            })
          }
          className="sr-only"
        />
        <div className={`font-medium text-sm ${formData.brake === opt.value ? 'text-blue-900' : 'text-gray-900'}`}>
          {opt.label}
        </div>
        <div className={`text-xs mt-1 ${formData.brake === opt.value ? 'text-blue-700' : 'text-gray-500'}`}>
          {opt.desc}
        </div>
      </label>
    ))}
  </div>
</div>
```

**Step 5: 验证类型检查通过**

```bash
npx tsc --noEmit
```

**预期:** 无类型错误

**Step 6: Commit**

```bash
git add src/components/wizard/steps/DutyStep.tsx
git commit -m "feat(ui): add brake option to step 4 with auto-default based on orientation"
```

---

## Task 3: 更新电机筛选逻辑

**Files:**
- Read: `src/lib/calculations/motor-filter.ts`
- Modify: `src/lib/calculations/motor-filter.ts`

**Step 1: 读取 motor-filter.ts 了解当前结构**

**Step 2: 在 MotorFilter 类中添加 brake 筛选逻辑**

找到 `filter()` 方法，在适当位置添加：

```typescript
// 根据刹车选项筛选
if (this.input.duty?.brake !== undefined) {
  candidates = candidates.filter(motor =>
    motor.options.brake.hasBrake === this.input.duty!.brake
  );
}
```

**Step 3: 运行测试验证筛选逻辑**

```bash
npm test -- src/lib/calculations/__tests__/motor-filter.test.ts
```

**预期:** 测试通过（可能需要更新测试用例以包含 brake 字段）

**Step 4: Commit**

```bash
git add src/lib/calculations/motor-filter.ts
git commit -m "feat(filter): filter motors by brake option"
```

---

## Task 4: 更新测试用例

**Files:**
- Modify: `src/lib/calculations/__tests__/sizing-engine.test.ts`
- Modify: `src/lib/calculations/__tests__/motor-filter.test.ts`

**Step 1: 更新 sizing-engine 测试**

找到测试用例中的 DutyConditions 对象，添加 `brake: false`：

```typescript
duty: {
  ambientTemp: 40,
  dutyCycle: 80,
  mountingOrientation: 'HORIZONTAL',
  ipRating: 'IP65',
  brake: false,  // 添加
}
```

**Step 2: 更新 motor-filter 测试**

同样更新测试用例中的 DutyConditions，添加 `brake` 字段

**Step 3: 运行所有测试**

```bash
npm test
```

**预期:** 所有测试通过

**Step 4: Commit**

```bash
git add src/lib/calculations/__tests__/
git commit -m "test: update test cases to include brake field"
```

---

## Task 5: 验证电缆配置

**Files:**
- Read: `src/lib/calculations/part-number-generator.ts`
- Read: `src/components/wizard/CableConfigurationPanel.tsx`

**Step 1: 验证 part-number-generator.ts 中的电缆生成逻辑**

确认 `generateCablePN` 方法正确接收 `hasBrake` 参数：

```typescript
generateCablePN(
  type: 'motor' | 'encoder',
  spec: string,
  length: number,
  hasBrake: boolean
): string {
  if (type === 'motor') {
    const brakeCode = hasBrake ? '1' : '0';
    const lengthCode = length.toString().padStart(2, '0');
    return `${spec}-${brakeCode}-${lengthCode}`;
  }
  // ...
}
```

**Step 2: 验证 CableConfigurationPanel 正确传递 brake 参数**

确认组件从 motor.options.brake.hasBrake 获取值并传递给电缆生成函数

**Step 3: 运行电缆相关测试**

```bash
npm test -- src/lib/calculations/__tests__/part-number-generator.test.ts
```

**预期:** 测试通过

**Step 4: Commit（如有修改）**

```bash
git add -A
git commit -m "fix(cable): ensure brake parameter correctly flows to cable part number generation"
```

---

## Task 6: 构建验证

**Step 1: 运行完整构建**

```bash
npm run build
```

**预期:** 构建成功，无错误

**Step 2: 运行所有测试**

```bash
npm test
```

**预期:** 所有测试通过

**Step 3: Commit（如构建有变更）**

```bash
git add -A
git commit -m "chore: build verification"
```

---

## Task 7: 功能验证清单

手动验证以下场景：

1. **水平轴 + 默认刹车**
   - 进入第四步，选择水平轴
   - 验证刹车默认显示"无刹车"
   - 完成选型，验证推荐电机都不带刹车

2. **垂直轴 + 默认刹车**
   - 进入第四步，选择垂直轴
   - 验证刹车自动切换为"带刹车"
   - 完成选型，验证推荐电机都带刹车

3. **手动覆盖**
   - 选择垂直轴，手动改为"无刹车"
   - 验证推荐电机都不带刹车

4. **电缆订货号**
   - 带刹车电机 → 电缆型号如 `MCL22-1-03`
   - 无刹车电机 → 电缆型号如 `MCL22-0-03`

---

## 完成标准

- [ ] DutyConditions 接口包含 brake 字段
- [ ] 第四步 UI 显示刹车选项，并根据安装方向自动设置默认值
- [ ] MotorFilter 根据 brake 值正确筛选电机
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 电缆订货号正确生成（带刹车电机配带刹车电缆）

---

## 相关文档

- 产品目录: `docs/data/XC20_MC20_产品目录.md` (第326-331行刹车编码规则)
- 设计文档: `docs/plans/2026-03-01-brake-option-design.md`
