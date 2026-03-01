# 添加 STO 安全功能产品设计文档

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 XC20 驱动器添加 STO 安全功能选项，保留现有 NN（无 STO）产品，新增 T0（带 STO）产品变体，同时移除 EMC 滤波器选项。

**Architecture:** 扩展驱动器产品数据，支持 safety 选项（NN/T0）。更新类型定义、UI 组件和 Part Number 生成逻辑，使用户可以选择是否带 STO 功能。

**Tech Stack:** TypeScript, React, Next.js, Zustand, TailwindCSS

---

## 背景分析

### 产品目录订货号规则

XC20 驱动器型号第 2 段（控制部分-硬件选项）：`[2位前缀][1位面板][2位总线][2位安全][4位预留]`

- 第 6-7 位（安全功能）：
  - `T0` = 安全扭矩关断(STO)，SIL3/PLe
  - `NN` = 无安全选项

示例：
- `XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN` (带 STO)
- `XC20-W0005CRN-01BECNNNNNNNN-SVSRSN3NNNNN` (无 STO)

### 现有数据状态

当前 `drives.json` 有 18 个产品（6 功率等级 × 3 通信协议），所有产品 `safety.code = "NN"`。

需要扩展为 36 个产品（6 功率等级 × 3 通信协议 × 2 安全选项）。

---

## 设计细节

### 1. 数据层变更

**文件:** `src/data/drives.json`

为每个现有驱动器添加带 STO 的变体：
- ID 后缀从 `-ec`/`-pn`/`-eip` 变为 `-ec-sto`/`-pn-sto`/`-eip-sto`
- model 字段第 6-7 位从 `NN` 变为 `T0`
- options.safety.code 从 `"NN"` 变为 `"T0"`

### 2. 类型定义变更

**文件:** `src/types/index.ts`

```typescript
// SystemPreferences 接口变更
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  encoderType: 'SINGLE_TURN' | 'MULTI_TURN';
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  // 移除: emcFilter: 'NONE' | 'C3';
  safety: 'STO' | 'NONE';  // 新增: STO 安全功能选项
  cableLength: number | 'TERMINAL_ONLY';
}
```

### 3. UI 组件变更

**文件:** `src/components/wizard/steps/SystemConfigStep.tsx`

- 移除 EMC 滤波器选择下拉框（第 144-158 行）
- 添加 STO 安全功能选择：
  - 选项 1: "无安全功能" (NONE)
  - 选项 2: "STO 安全扭矩关断 (SIL3/PLe)" (STO)
- 更新表单默认值：添加 `safety: 'NONE'`

### 4. Part Number 生成器变更

**文件:** `src/lib/calculations/part-number-generator.ts`

更新 `generateDrivePN` 方法：
- 根据 `safety` 选项设置第 6-7 位代码
- `safety = 'STO'` → `T0`
- `safety = 'NONE'` → `NN`

### 5. 驱动匹配逻辑变更

**文件:** `src/lib/calculations/sizing-engine.ts` 或 `src/lib/calculations/motor-filter.ts`

更新驱动器匹配逻辑，根据用户选择的 `safety` 选项筛选匹配的驱动器。

---

## 实施计划

### Task 1: 扩展驱动器产品数据

**Files:**
- Modify: `src/data/drives.json`

**Step 1: 添加 STO 产品变体**

为每个现有驱动器添加带 STO 的变体（共 18 个新产品）：

```json
{
  "id": "xc20-w0005crn-ec-sto",
  "model": "XC20-W0005CRN-01BECT0T0NNNN-SVSRSN3NNNNN",
  "baseModel": "XC20-W0005CRN",
  // ... 其他字段相同 ...
  "options": {
    "panel": { "code": "01B" },
    "safety": { "code": "T0" },  // 变更: T0
    "brakeResistor": { "code": "R" },
    "firmware": { "code": "SVSRSN3" }
  }
}
```

**Step 2: 更新 metadata**

更新 `_metadata.driveCount` 从 18 到 36。

---

### Task 2: 更新类型定义

**Files:**
- Modify: `src/types/index.ts`

**Step 1: 修改 SystemPreferences 接口**

```typescript
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  encoderType: 'SINGLE_TURN' | 'MULTI_TURN';
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';  // 替换 emcFilter
  cableLength: number | 'TERMINAL_ONLY';
}
```

**Step 2: 更新 MotorSelections 接口（如需要）**

确认 `driveOptions.safety` 类型与 `SystemPreferences.safety` 一致。

---

### Task 3: 更新 SystemConfigStep UI

**Files:**
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`

**Step 1: 添加 safety 到表单默认值**

```typescript
const [formData, setFormData] = useState<SystemPreferences>(
  input.preferences || {
    safetyFactor: 1.5,
    maxInertiaRatio: 10,
    targetInertiaRatio: 5,
    encoderType: 'MULTI_TURN',
    communication: 'ETHERCAT',
    safety: 'NONE',  // 新增
    cableLength: 5,
  }
);
```

**Step 2: 添加 STO 选择 UI**

在通信选择下方添加：

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700">
    {t('safety')}
  </label>
  <select
    value={formData.safety}
    onChange={(e) =>
      setFormData({ ...formData, safety: e.target.value as 'STO' | 'NONE' })
    }
    className="..."
  >
    <option value="NONE">{t('safetyOptions.none')}</option>
    <option value="STO">{t('safetyOptions.sto')}</option>
  </select>
</div>
```

**Step 3: 移除 EMC 滤波器选择**

删除第 144-158 行（emcFilter 选择框）。

---

### Task 4: 更新 Part Number 生成器

**Files:**
- Modify: `src/lib/calculations/part-number-generator.ts`

**Step 1: 更新 generateDrivePN 方法**

```typescript
generateDrivePN(drive: XC20Drive, options: MotorSelections['driveOptions']): string {
  // 基础型号: XC20-W0005CRN-01BECNNNNNNNNN-SVSRSN3NNNNN
  // 位置: 0    5    10   15
  // 第 6-7 位 (索引 16-17) 是安全代码

  const baseModel = drive.baseModel; // XC20-W0005CRN
  const panelCode = drive.options.panel.code; // 01B
  const commCode = drive.communication.code; // ECT0, PNT0, EIT0
  const safetyCode = options.safety === 'STO' ? 'T0' : 'NN';
  const firmwareCode = drive.options.firmware.code; // SVSRSN3

  // 构建完整型号
  return `${baseModel}-${panelCode}${commCode}${safetyCode}NNNN-${firmwareCode}NNNNN`;
}
```

---

### Task 5: 更新驱动器匹配逻辑

**Files:**
- Modify: `src/lib/calculations/sizing-engine.ts`

**Step 1: 在 calculate 方法中根据 safety 筛选驱动器**

```typescript
// 根据用户选择的安全选项筛选驱动器
const safetyCode = input.preferences.safety === 'STO' ? 'T0' : 'NN';
const matchedDrives = availableDrives.filter(
  d => d.options.safety.code === safetyCode
);
```

---

### Task 6: 更新 i18n 翻译

**Files:**
- Modify: `messages/zh.json`
- Modify: `messages/en.json`

**Step 1: 添加 safety 相关翻译**

```json
{
  "systemConfig": {
    "safety": "安全功能",
    "safetyOptions": {
      "none": "无",
      "sto": "STO 安全扭矩关断 (SIL3/PLe)"
    }
  }
}
```

**Step 2: 移除 emcFilter 相关翻译（可选）**

---

### Task 7: 更新 Step 5 独立页面

**Files:**
- Modify: `src/app/wizard/step5/page.tsx`

**Step 1: 更新默认 selections**

```typescript
driveOptions: {
  communication: 'ETHERCAT',
  panel: 'WITH_DISPLAY',
  safety: 'NONE',  // 确认有此字段
},
```

---

### Task 8: 运行测试和构建

**Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

**Step 2: 运行构建**

```bash
npm run build
```

**Step 3: 验证数据完整性**

- 确认 drives.json 中有 36 个产品
- 确认每个功率等级 + 通信协议组合都有 NN 和 T0 两种变体

---

## 验证清单

- [ ] drives.json 包含 36 个驱动器产品（18 NN + 18 T0）
- [ ] SystemPreferences 接口包含 safety 字段，不含 emcFilter
- [ ] SystemConfigStep UI 显示 STO 选择，不显示 EMC 滤波器
- [ ] Part Number 生成器根据 safety 选项生成正确的第 6-7 位代码
- [ ] 选型计算根据 safety 偏好筛选匹配的驱动器
- [ ] i18n 翻译包含 safety 相关文本
- [ ] 构建成功，无类型错误
