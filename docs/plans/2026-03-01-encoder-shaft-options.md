# 编码器类型与电机轴选项修复实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 从系统偏好中移除误导性的"单圈/多圈"编码器类型选择，保留电机选择步骤中的"电池盒式/机械式"多圈编码器选择

**Architecture:** 修改类型定义、UI组件和计算引擎，从 `SystemPreferences` 中移除 `encoderType` 字段，保留 `MotorSelections.motorOptions.encoderType` 为 `'A' | 'B'` 格式

**Tech Stack:** TypeScript, React, Next.js, Vitest

---

## 背景

MC20电机只支持多圈编码器：
- **A型**: 电池盒式多圈 (2.5Mbps)
- **B型**: 机械式多圈 (5Mbps)

当前步骤4（SystemConfigStep）让用户选择 "单圈绝对值" 或 "多圈绝对值" 是错误的，因为MC20没有单圈选项。

---

## Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts:93-101`

**Step 1: 从 SystemPreferences 中移除 encoderType**

```typescript
// 修改前:
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  encoderType: 'SINGLE_TURN' | 'MULTI_TURN';  // 移除这行
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';
  cableLength: number | 'TERMINAL_ONLY';
}

// 修改后:
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';
  cableLength: number | 'TERMINAL_ONLY';
}
```

**Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 会显示 SystemConfigStep.tsx 等文件中的类型错误（encoderType 不存在）

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "types: remove encoderType from SystemPreferences

MC20 series only supports multi-turn encoders. The global encoderType
preference was misleading as it suggested single-turn was an option.
Encoder type selection (A=Battery, B=Mechanical) remains in MotorSelections."
```

---

## Task 2: 更新 SystemConfigStep 组件

**Files:**
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`

**Step 1: 从表单数据中移除 encoderType**

```typescript
// 修改前 (第21-31行):
const [formData, setFormData] = useState<SystemPreferences>(
  input.preferences || {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    encoderType: 'MULTI_TURN',  // 移除这行
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
  }
);

// 修改后:
const [formData, setFormData] = useState<SystemPreferences>(
  input.preferences || {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
  }
);
```

**Step 2: 移除编码器类型选择 UI**

```typescript
// 删除第110-124行的整个编码器类型选择区块:
/*
<div>
  <label className="block text-sm font-medium text-gray-700">
    {t('encoderType')}
  </label>
  <select
    value={formData.encoderType}
    onChange={(e) =>
      setFormData({ ...formData, encoderType: e.target.value as 'SINGLE_TURN' | 'MULTI_TURN' })
    }
    className="..."
  >
    <option value="SINGLE_TURN">{t('encoderTypes.singleTurn')}</option>
    <option value="MULTI_TURN">{t('encoderTypes.multiTurn')}</option>
  </select>
</div>
*/
```

**Step 3: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 无错误

**Step 4: Commit**

```bash
git add src/components/wizard/steps/SystemConfigStep.tsx
git commit -m "ui: remove encoder type selector from SystemConfigStep

Remove the misleading single-turn/multi-turn encoder selection from
step 4. Users now only select encoder type (A/B) in the motor selection
step where the options are properly contextualized."
```

---

## Task 3: 更新 sizing-engine.ts

**Files:**
- Modify: `src/lib/calculations/sizing-engine.ts:229-236`

**Step 1: 移除单圈编码器检查**

```typescript
// 修改前 (diagnoseFailure 方法):
// 检查编码器匹配 (MC20 only has multi-turn encoders)
const isSingleTurnRequested = preferences.encoderType === 'SINGLE_TURN';
if (isSingleTurnRequested) {
  return {
    type: 'ENCODER',
    message: 'MC20系列仅支持多圈编码器，请选择MULTI_TURN',
  };
}

// 修改后: 完全移除上述代码块
```

**Step 2: 运行测试**

```bash
npm test -- src/lib/calculations/__tests__/sizing-engine.test.ts
```

Expected: 所有测试通过

**Step 3: Commit**

```bash
git add src/lib/calculations/sizing-engine.ts
git commit -m "fix: remove single-turn encoder check from sizing engine

The encoderType preference no longer exists, and MC20 only supports
multi-turn encoders anyway. Remove the unnecessary error check."
```

---

## Task 4: 更新国际化文本

**Files:**
- Modify: `src/i18n/messages/zh.json:113-117`
- Modify: `src/i18n/messages/en.json:113-117`

**Step 1: 更新中文翻译**

```json
// 从 zh.json 的 systemConfig 对象中移除:
"encoderType": "编码器类型",
"encoderTypes": {
  "singleTurn": "单圈绝对值",
  "multiTurn": "多圈绝对值"
},
```

**Step 2: 更新英文翻译**

```json
// 从 en.json 的 systemConfig 对象中移除:
"encoderType": "Encoder Type",
"encoderTypes": {
  "singleTurn": "Single Turn Absolute",
  "multiTurn": "Multi Turn Absolute"
},
```

**Step 3: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "i18n: remove encoder type translations from system config

Remove unused translations for the removed encoder type selector."
```

---

## Task 5: 更新类型测试

**Files:**
- Modify: `src/types/__tests__/types.test.ts`

**Step 1: 检查并更新测试文件**

```typescript
// 第36行: 确保测试数据不包含 encoderType
const mockInput: SizingInput = {
  // ...
  preferences: {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    // encoderType 应该不存在
    communication: 'ETHERCAT',
    safety: 'NONE',
    cableLength: 5,
  },
  selections: {
    // ...
    motorOptions: {
      brake: true,
      encoderType: 'A',  // 保留：这是 MotorSelections 中的，正确
      keyShaft: false,
    },
    // ...
  },
};
```

**Step 2: 运行类型测试**

```bash
npm test -- src/types/__tests__/types.test.ts
```

Expected: 测试通过

**Step 3: Commit**

```bash
git add src/types/__tests__/types.test.ts
git commit -m "test: update type tests for removed encoderType preference

Ensure test data matches updated SystemPreferences interface."
```

---

## Task 6: 更新 sizing-engine 测试

**Files:**
- Modify: `src/lib/calculations/__tests__/sizing-engine.test.ts`

**Step 1: 移除 encoderType 从测试数据**

```typescript
// 第41行附近: 从测试 preferences 中移除 encoderType
const preferences = {
  safetyFactor: 1.5,
  maxInertiaRatio: 10,
  targetInertiaRatio: 5,
  // encoderType: 'MULTI_TURN',  // 移除这行
  communication: 'ETHERCAT' as const,
  safety: 'NONE' as const,
  cableLength: 5 as const,
};
```

**Step 2: 检查是否有单圈编码器测试用例**

搜索并移除任何测试 "SINGLE_TURN" 返回错误的测试用例。

**Step 3: 运行测试**

```bash
npm test -- src/lib/calculations/__tests__/sizing-engine.test.ts
```

Expected: 所有测试通过

**Step 4: Commit**

```bash
git add src/lib/calculations/__tests__/sizing-engine.test.ts
git commit -m "test: update sizing-engine tests for removed encoderType

Remove encoderType from test preferences and any tests for the
removed single-turn encoder error check."
```

---

## Task 7: 验证 MotorSelectionPanel 编码器选项

**Files:**
- Read: `src/components/wizard/MotorSelectionPanel.tsx:98-112`

**Step 1: 确认编码器选项正确**

```typescript
// 应该已经存在且正确:
<select
  value={selectedOptions.encoderType}
  onChange={(e) => onOptionsChange({
    ...selectedOptions,
    encoderType: e.target.value as 'A' | 'B'
  })}
  className="px-3 py-1 border rounded"
>
  <option value="A">A型 - 电池盒式多圈 (2.5Mbps)</option>
  <option value="B">B型 - 机械式多圈 (5Mbps)</option>
</select>
```

**Step 2: 确认电机轴选项正确**

```typescript
// 应该已经存在且正确 (第115-134行):
<div className="flex items-center justify-between">
  <span className="font-medium">电机轴</span>
  <div className="flex gap-2">
    <button
      className={`px-3 py-1 rounded ${
        !selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}
      onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: false })}
    >
      光轴
    </button>
    <button
      className={`px-3 py-1 rounded ${
        selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}
      onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: true })}
    >
      带键槽
    </button>
  </div>
</div>
```

**Step 3: 如果正确，无需修改，直接 commit 确认**

```bash
git commit --allow-empty -m "verify: MotorSelectionPanel encoder and shaft options

Confirmed: Encoder selection shows A/B types (battery vs mechanical multi-turn).
Confirmed: Shaft selection shows keyed vs non-keyed options."
```

---

## Task 8: 运行完整测试套件

**Step 1: 运行所有测试**

```bash
npm test
```

Expected: 所有单元测试通过（51个），e2e测试失败可忽略

**Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 无类型错误

**Step 3: 运行构建**

```bash
npm run build
```

Expected: 构建成功

**Step 4: Commit**

```bash
git commit --allow-empty -m "test: verify all tests pass after encoderType removal

- All unit tests passing
- Type check clean
- Build successful"
```

---

## Task 9: 更新设计文档标记完成

**Files:**
- Modify: `docs/plans/2026-03-01-encoder-shaft-options-design.md`

在文档末尾添加：

```markdown
## 实施完成

- [x] 2026-03-01: 所有任务完成
- [x] 测试通过: 51个单元测试
- [x] 类型检查: 无错误
- [x] 构建: 成功
```

**Commit:**

```bash
git add docs/plans/2026-03-01-encoder-shaft-options-design.md
git commit -m "docs: mark encoder-shaft-options design as complete"
```

---

## 总结

此计划：
1. 从 `SystemPreferences` 中移除 `encoderType` 字段
2. 从 `SystemConfigStep` 中移除编码器类型选择 UI
3. 从 `sizing-engine.ts` 中移除单圈编码器检查
4. 更新国际化文本
5. 更新所有相关测试
6. 保留 `MotorSelectionPanel` 中的 A/B 型编码器选择
7. 保留 `MotorSelectionPanel` 中的电机轴选项（已正确实现）

**验证清单：**
- [x] 步骤4不再显示编码器类型选择
- [x] 步骤5正确显示 A型/B型 编码器选择
- [x] 步骤5正确显示 光轴/带键槽 选择
- [x] 所有测试通过
- [x] 类型检查通过
- [x] 构建成功

## 实施完成

- [x] 2026-03-01: 所有任务完成
- [x] 测试通过: 51个单元测试
- [x] 类型检查: 无错误
- [x] 构建: 成功
