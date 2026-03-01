# 编码器类型与电机轴选项修复设计文档

## 日期
2026-03-01

## 问题背景

根据产品目录文档 `XC20_MC20_产品目录.md`，MC20 电机编码器类型描述存在错误：

1. **编码器类型错误**：当前系统允许用户在步骤4选择 "单圈绝对值" 或 "多圈绝对值"，但 MC20 系列**只支持多圈编码器**
   - A型：23位绝对值编码器，2.5Mbps多摩川协议（**电池盒式多圈**）
   - B型：23位绝对值编码器，5Mbps多摩川协议（**机械式多圈**）

2. **电机轴选项已存在**：`MotorSelectionPanel` 已正确实现 "光轴" vs "带键槽" 选择

## 设计目标

1. 从全局系统偏好中移除编码器类型选择（步骤4）
2. 保留电机选择步骤（步骤5）中的编码器类型选择（A型/B型）
3. 确保电机轴选项（光轴/带键槽）正常工作
4. 更新相关测试和国际化文本

## 架构变更

### 1. 类型定义变更 (`src/types/index.ts`)

```typescript
// 移除 SystemPreferences 中的 encoderType
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
  // encoderType: 'SINGLE_TURN' | 'MULTI_TURN';  // 移除此行
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';
  cableLength: number | 'TERMINAL_ONLY';
}

// MotorSelections.motorOptions.encoderType 保持不变
export interface MotorSelections {
  motorId: string;
  motorOptions: {
    brake: boolean;
    encoderType: 'A' | 'B';  // 保留：A=电池盒式多圈, B=机械式多圈
    keyShaft: boolean;
  };
  // ...
}
```

### 2. 组件变更

#### SystemConfigStep (`src/components/wizard/steps/SystemConfigStep.tsx`)
- 移除编码器类型选择下拉框
- 从表单数据中移除 `encoderType` 字段
- 更新默认表单数据

#### MotorSelectionPanel (`src/components/wizard/steps/MotorSelectionPanel.tsx`)
- 已正确实现，无需修改
- 保留 A型/B型 编码器选择
- 保留 光轴/带键槽 选择

### 3. 计算引擎变更 (`src/lib/calculations/sizing-engine.ts`)

```typescript
// 移除 diagnoseFailure 中的单圈编码器检查
private diagnoseFailure(/* ... */): SizingFailureReason {
  // ... 其他检查 ...

  // 移除以下代码块：
  // const isSingleTurnRequested = preferences.encoderType === 'SINGLE_TURN';
  // if (isSingleTurnRequested) {
  //   return {
  //     type: 'ENCODER',
  //     message: 'MC20系列仅支持多圈编码器，请选择MULTI_TURN',
  //   };
  // }

  return {
    type: 'TORQUE',
    message: '无满足所有条件的电机，建议调整工况参数',
  };
}
```

### 4. 国际化文本变更

#### zh.json
```json
{
  "systemConfig": {
    // 移除 encoderType 和 encoderTypes
    // "encoderType": "编码器类型",
    // "encoderTypes": {
    //   "singleTurn": "单圈绝对值",
    //   "multiTurn": "多圈绝对值"
    // }
  }
}
```

#### en.json
```json
{
  "systemConfig": {
    // 移除 encoderType 和 encoderTypes
    // "encoderType": "Encoder Type",
    // "encoderTypes": {
    //   "singleTurn": "Single Turn Absolute",
    //   "multiTurn": "Multi Turn Absolute"
    // }
  }
}
```

### 5. 测试文件变更

- `src/types/__tests__/types.test.ts`: 移除 `encoderType` 相关测试
- `src/lib/calculations/__tests__/sizing-engine.test.ts`: 移除单圈编码器测试用例

## 数据流

### 修改前
```
步骤4 (SystemConfigStep)
  └─ 用户选择 encoderType: 'SINGLE_TURN' | 'MULTI_TURN'
     └─ 存储到 SystemPreferences
        └─ 传递给 SizingEngine
           └─ 如果 SINGLE_TURN，返回错误

步骤5 (MotorSelectionPanel)
  └─ 用户选择 encoderType: 'A' | 'B'
     └─ 存储到 MotorSelections
```

### 修改后
```
步骤4 (SystemConfigStep)
  └─ 无编码器类型选择

步骤5 (MotorSelectionPanel)
  └─ 用户选择 encoderType: 'A' | 'B'（电池盒式 vs 机械式多圈）
     └─ 存储到 MotorSelections
```

## 文件变更清单

| 文件路径 | 变更类型 | 变更内容 |
|---------|---------|---------|
| `src/types/index.ts` | 修改 | 从 `SystemPreferences` 移除 `encoderType` |
| `src/components/wizard/steps/SystemConfigStep.tsx` | 修改 | 移除编码器类型选择UI |
| `src/lib/calculations/sizing-engine.ts` | 修改 | 移除单圈编码器检查 |
| `src/i18n/messages/zh.json` | 修改 | 移除编码器类型翻译 |
| `src/i18n/messages/en.json` | 修改 | 移除编码器类型翻译 |
| `src/types/__tests__/types.test.ts` | 修改 | 更新类型测试 |
| `src/lib/calculations/__tests__/sizing-engine.test.ts` | 修改 | 移除单圈编码器测试 |

## 验收标准

1. [ ] 步骤4不再显示编码器类型选择
2. [ ] 步骤5正确显示 A型/B型 编码器选择
3. [ ] 步骤5正确显示 光轴/带键槽 选择
4. [ ] 所有测试通过
5. [ ] 构建成功
6. [ ] 订货号生成正确（编码器代码 A/B 正确嵌入）

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 现有用户数据包含 encoderType | 中 | 更新 wizard-store 处理旧数据迁移 |
| 订货号生成逻辑依赖 encoderType | 高 | 验证 `part-number-generator.ts` 使用 `MotorSelections` 中的 encoderType |

## 参考文档

- `docs/data/XC20_MC20_产品目录.md` - 产品目录及型号命名规则
- `src/data/motors.json` - 电机数据结构（已包含正确选项定义）

## 实施完成

- [x] 2026-03-01: 所有任务完成
- [x] 测试通过: 51个单元测试
- [x] 类型检查: 无错误
- [x] 构建: 成功
