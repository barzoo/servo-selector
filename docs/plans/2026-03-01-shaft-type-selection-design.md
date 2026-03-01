# 电机轴类型选择功能设计文档

## 日期
2026-03-01

## 问题背景

当前系统在 Step 4 (工况条件) 中没有电机轴类型选择选项，导致：
1. 用户无法在选型前指定需要光轴 (L) 还是带键 (K) 的电机
2. 结果页面同时显示两种轴类型的电机，用户需要手动区分
3. 订货号生成时无法确定轴类型代码

根据产品目录 `XC20_MC20_产品目录.md` 第335-336行：
- **L** = 光轴 (Smooth shaft)
- **K** = 带键 (Key shaft)

## 设计目标

1. 在 Step 4 (DutyStep) 添加电机轴类型选择，用户必须二选一
2. 在电机筛选时根据用户选择过滤电机
3. 更新相关类型定义、测试和国际化文本

## 架构变更

### 1. 类型定义变更 (`src/types/index.ts`)

```typescript
// DutyConditions 添加 keyShaft 字段
export interface DutyConditions {
  ambientTemp: number;
  dutyCycle: number;
  mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
  ipRating: 'IP54' | 'IP65' | 'IP67';
  brake: boolean;
  keyShaft: 'L' | 'K';  // 新增: L=光轴, K=带键
}
```

### 2. UI 变更 (`src/components/wizard/steps/DutyStep.tsx`)

添加电机轴类型选择区域，使用与刹车选项类似的单选卡片样式：

```typescript
const KEYSHAFT_OPTIONS = [
  { value: 'L', label: '光轴', desc: '标准光滑轴，适用于联轴器连接' },
  { value: 'K', label: '带键', desc: '带键槽轴，适用于需要传递大扭矩的场合' },
];
```

UI 布局：
- 在刹车选项下方添加电机轴类型选择
- 两个互斥选项：光轴 (L) / 带键 (K)
- 默认选中光轴 (L)

### 3. 电机筛选逻辑变更 (`src/lib/calculations/motor-filter.ts`)

在 `filter()` 方法中添加根据 keyShaft 筛选：

```typescript
filter(): MotorRecommendation[] {
  // ... 现有筛选逻辑 ...

  // 根据刹车选项筛选
  if (this.duty?.brake !== undefined) {
    candidates = candidates.filter(motor =>
      motor.options.brake.hasBrake === this.duty!.brake
    );
  }

  // 新增: 根据电机轴类型筛选
  if (this.duty?.keyShaft !== undefined) {
    candidates = candidates.filter(motor =>
      motor.options.keyShaft.hasKey === (this.duty!.keyShaft === 'K')
    );
  }

  // ... 后续逻辑 ...
}
```

### 4. 国际化文本变更

#### zh.json
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

#### en.json
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

### 5. 测试变更

#### `src/lib/calculations/__tests__/motor-filter.test.ts`
添加 keyShaft 筛选测试：
- 测试选择光轴 (L) 时只返回 hasKey: false 的电机
- 测试选择带键 (K) 时只返回 hasKey: true 的电机

#### `src/types/__tests__/types.test.ts`
更新 DutyConditions 类型测试，包含 keyShaft 字段

## 数据流

```
Step 4 (DutyStep)
  └─ 用户选择 keyShaft: 'L' | 'K' (必须二选一)
     └─ 存储到 DutyConditions
        └─ 传递给 MotorFilter
           └─ 筛选时过滤不符合 keyShaft 的电机
              └─ 返回匹配的电机推荐列表
```

## 文件变更清单

| 文件路径 | 变更类型 | 变更内容 |
|---------|---------|---------|
| `src/types/index.ts` | 修改 | `DutyConditions` 接口添加 `keyShaft: 'L' \| 'K'` |
| `src/components/wizard/steps/DutyStep.tsx` | 修改 | 添加电机轴类型选择UI |
| `src/lib/calculations/motor-filter.ts` | 修改 | 添加根据 keyShaft 筛选逻辑 |
| `src/i18n/messages/zh.json` | 修改 | 添加电机轴类型翻译 |
| `src/i18n/messages/en.json` | 修改 | 添加电机轴类型翻译 |
| `src/lib/calculations/__tests__/motor-filter.test.ts` | 修改 | 添加 keyShaft 筛选测试 |
| `src/types/__tests__/types.test.ts` | 修改 | 更新 DutyConditions 类型测试 |

## 验收标准

1. [ ] Step 4 显示电机轴类型选择（光轴 L / 带键 K）
2. [ ] 用户必须二选一，不能同时选择两种
3. [ ] 选择光轴 (L) 时，筛选结果只显示光轴电机
4. [ ] 选择带键 (K) 时，筛选结果只显示带键电机
5. [ ] 所有现有测试通过
6. [ ] 新增测试通过
7. [ ] 构建成功

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 现有用户数据缺少 keyShaft 字段 | 中 | 在 MotorFilter 中处理 undefined 情况，默认不过滤 |
| 电机数据中 keyShaft 信息不完整 | 高 | 验证 motors.json 中所有电机都有正确的 keyShaft 定义 |

## 参考文档

- `docs/data/XC20_MC20_产品目录.md` - 产品目录及型号命名规则（第335-336行）
- `src/data/motors.json` - 电机数据结构
