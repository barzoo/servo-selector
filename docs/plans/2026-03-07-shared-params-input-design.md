# 共享参数输入优化设计文档

**日期**: 2026-03-07
**功能**: 优化多轴选型输入流程，项目信息和公共参数所有轴共享
**设计**: 总-分数据结构，简化用户操作

---

## 1. 概述

### 1.1 问题背景

当前多轴选型工具中，每个轴都需要独立配置所有参数，包括：
- 项目信息（项目名称、客户等）- 实际上每个项目只需一次
- 公共参数（环境温度、通信协议等）- 同一项目的多个轴通常相同

这导致用户重复输入相同数据，体验不佳。

### 1.2 设计目标

- **减少重复输入**: 项目信息和公共参数只需输入一次
- **保持一致性**: 所有轴自动使用相同的公共参数
- **简化交互**: 取消继承/覆盖机制，降低认知负担
- **清晰的结构**: 总-分结构，项目级共享 + 轴级特有

### 1.3 核心原则

- **项目级共享**: 项目信息 + 公共参数所有轴共享
- **轴级特有**: 仅保留真正轴特有的参数
- **即时生效**: 修改公共参数立即影响所有轴
- **计算时合并**: 数据存储分离，计算时自动合并

---

## 2. 数据模型

### 2.1 项目结构

```typescript
interface Project {
  id: string;

  // 项目信息（所有轴共享）
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;

  // 公共参数（所有轴共享）
  commonParams: {
    // 环境条件
    ambientTemp: number;        // 环境温度 (°C)
    ipRating: 'IP54' | 'IP65' | 'IP67';

    // 系统偏好
    communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
    cableLength: number | 'TERMINAL_ONLY';
    safetyFactor: number;
    maxInertiaRatio: number;
    targetInertiaRatio: number;
  };

  // 轴列表
  axes: AxisConfig[];
}
```

### 2.2 轴配置

```typescript
interface AxisConfig {
  id: string;
  name: string;
  status: 'CONFIGURING' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;

  // 轴特有输入参数
  input: {
    // 机构参数 - 每个轴不同
    mechanism: MechanismConfig;

    // 运动参数 - 每个轴不同
    motion: MotionParams;

    // 轴特有工作条件 - 每个轴不同
    dutyConditions: {
      dutyCycle: number;            // 工作制 (%)
      mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
      brake: boolean;
      keyShaft: 'L' | 'K';
    };

    // 系统配置选择 - 每个轴不同
    selections?: MotorSelections;
  };

  // 计算结果
  result?: SizingResult;
  selectedMotorIndex?: number;
}
```

### 2.3 参数分类

| 参数类别 | 存储位置 | 说明 |
|---------|---------|------|
| **项目信息** | `Project` | 项目名称、客户、销售、备注 |
| **公共参数** | `Project.commonParams` | 环境温度、防护等级、通信协议、电缆长度、安全系数、惯量比 |
| **机构参数** | `AxisConfig.input.mechanism` | 机构类型、负载质量、丝杆导程等 |
| **运动参数** | `AxisConfig.input.motion` | 行程、最大速度、最大加速度等 |
| **工作条件** | `AxisConfig.input.dutyConditions` | 安装方向、工作制、制动器、轴类型 |
| **选型结果** | `AxisConfig.input.selections` | 用户选择的电机、驱动器、电缆等 |

### 2.4 计算时数据合并

```typescript
// 计算选型时，自动合并公共参数和轴特有参数
function buildSizingInput(project: Project, axis: AxisConfig): SizingInput {
  return {
    // 项目信息
    project: {
      name: project.name,
      customer: project.customer,
      salesPerson: project.salesPerson,
      notes: project.notes,
    },

    // 机构参数（轴特有）
    mechanism: axis.input.mechanism,

    // 运动参数（轴特有）
    motion: axis.input.motion,

    // 工作条件（轴特有）
    duty: {
      ...axis.input.dutyConditions,
      // 从公共参数补充
      ambientTemp: project.commonParams.ambientTemp,
      ipRating: project.commonParams.ipRating,
    },

    // 系统偏好（公共参数）
    preferences: {
      safetyFactor: project.commonParams.safetyFactor,
      maxInertiaRatio: project.commonParams.maxInertiaRatio,
      targetInertiaRatio: project.commonParams.targetInertiaRatio,
      communication: project.commonParams.communication,
      cableLength: project.commonParams.cableLength,
      // 从轴特有参数补充
      safety: axis.input.dutyConditions.brake ? 'STO' : 'NONE',
      encoderType: 'BOTH',
    },

    // 用户选择
    selections: axis.input.selections,
  };
}
```

---

## 3. UI 设计

### 3.1 主界面布局

```
┌─────────────────────────────────────────────────────────┐
│  🏠 自动化生产线              [⚙️ 项目设置] [📄 导出PDF]  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┬──────────────────────────────────────┐ │
│  │             │  当前轴: Y轴-龙门Y向                  │ │
│  │   轴列表     │                                      │ │
│  │             │  1️⃣ 机构参数                          │ │
│  │ 🛠️ X轴-龙门X│  ├─ 机构类型: [滚珠丝杠 ▼]            │ │
│  │    ✅ 已完成 │  ├─ 负载质量: [100] kg                │ │
│  │             │  ├─ 丝杆导程: [10] mm                 │ │
│  │ 🛠️ Y轴-龙门Y│  └─ ...                               │ │
│  │    🔄 当前  │                                      │ │
│  │             │  2️⃣ 运动参数                          │ │
│  │ ➕ 添加新轴  │  ├─ 行程: [800] mm                    │ │
│  │             │  ├─ 最大速度: [1000] mm/s             │ │
│  │ 📋 项目篮子  │  └─ ...                               │ │
│  │   (2个轴)   │                                      │ │
│  │             │  3️⃣ 工作条件                          │ │
│  └─────────────┤  ├─ 安装方向: [水平 ▼]                │ │
│                │  ├─ 工作制: [S1 ▼]                    │ │
│                │  ├─ 制动器: [☑️]                      │ │
│                │  └─ 轴类型: [带键 ▼]                  │ │
│                │                                      │ │
│                │  [上一步] [保存到篮子] [下一步]        │ │
│                └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 项目设置弹窗

```
┌─────────────────────────────────────────┐
│  ⚙️ 项目设置                    [×]    │
├─────────────────────────────────────────┤
│                                         │
│  📋 项目信息                             │
│  ├─ 项目名称 *: [自动化生产线    ]       │
│  ├─ 客户名称 *: [某某公司        ]       │
│  ├─ 销售人员:   [张三            ]       │
│  └─ 项目备注:   [龙门系统...     ]       │
│                                         │
│  ⚙️ 公共参数（所有轴共享）                │
│  ├─ 环境温度:      [25] °C              │
│  ├─ 防护等级:      [IP65 ▼]             │
│  ├─ 通信协议:      [EtherCAT ▼]         │
│  ├─ 电缆长度:      [5 m ▼]              │
│  ├─ 安全系数:      [1.5]                │
│  └─ 最大惯量比:    [10]:1               │
│                                         │
│        [取消]          [保存]           │
│                                         │
└─────────────────────────────────────────┘
```

### 3.3 移动端适配

```
┌─────────────────────────────────────┐
│  🏠 自动化生产线        [≡] [⚙️]    │
├─────────────────────────────────────┤
│  当前轴: Y轴-龙门Y向        [切换▼] │
├─────────────────────────────────────┤
│  1️⃣ 机构参数                         │
│  ├─ 机构类型: [滚珠丝杠 ▼]           │
│  ├─ 负载质量: [100] kg               │
│  └─ ...                              │
│                                     │
│  2️⃣ 运动参数                         │
│  ├─ 行程: [800] mm                   │
│  └─ ...                              │
│                                     │
│  3️⃣ 工作条件                         │
│  ├─ 安装方向: [水平 ▼]               │
│  └─ ...                              │
│                                     │
│  [上一步]  [下一步]                  │
│       [保存到篮子]                   │
└─────────────────────────────────────┘

点击 [≡] 展开侧边栏:
┌─────────────────────────────────────┐
│  📋 项目篮子 (2个轴)                │
│  ├─ 🛠️ X轴-龙门X向    ✅            │
│  ├─ 🛠️ Y轴-龙门Y向    🔄 当前      │
│  ├─ ➕ 添加新轴                      │
│  ├─ ─────────────────               │
│  ├─ ⚙️ 项目设置                      │
│  └─ 📄 导出PDF                       │
└─────────────────────────────────────┘
```

---

## 4. 状态管理

### 4.1 Store 结构

```typescript
interface ProjectStore {
  // ========== 状态 ==========
  project: Project;
  currentAxisId: string;

  // ========== 项目级操作 ==========
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  updateCommonParams: (params: Partial<CommonParams>) => void;

  // ========== 轴级操作 ==========
  addAxis: (name: string, copyFrom?: string) => string;
  switchAxis: (axisId: string) => void;
  deleteAxis: (axisId: string) => void;
  updateAxisName: (axisId: string, name: string) => void;

  updateAxisMechanism: (axisId: string, mechanism: MechanismConfig) => void;
  updateAxisMotion: (axisId: string, motion: MotionParams) => void;
  updateAxisDutyConditions: (axisId: string, duty: DutyConditions) => void;
  updateAxisSelections: (axisId: string, selections: MotorSelections) => void;

  completeAxis: (axisId: string) => void;
  reeditAxis: (axisId: string) => void;

  // ========== 计算 ==========
  calculateSizing: (axisId: string) => SizingResult;

  // ========== 查询 ==========
  getCurrentAxis: () => AxisConfig;
  getCompletedAxes: () => AxisConfig[];
  getSizingInput: (axisId: string) => SizingInput;
  canExportPdf: () => boolean;

  // ========== 重置 ==========
  reset: () => void;
}
```

### 4.2 关键操作实现

```typescript
// 添加新轴
addAxis: (name, copyFrom) => {
  const state = get();
  const newAxis: AxisConfig = {
    id: generateId(),
    name,
    status: 'CONFIGURING',
    createdAt: new Date().toISOString(),
    input: copyFrom
      ? { ...state.project.axes.find(a => a.id === copyFrom)?.input }
      : createDefaultAxisInput(),
  };

  set(state => ({
    project: {
      ...state.project,
      axes: [...state.project.axes, newAxis],
    },
    currentAxisId: newAxis.id,
  }));

  return newAxis.id;
}

// 获取计算输入（自动合并）
getSizingInput: (axisId) => {
  const state = get();
  const axis = state.project.axes.find(a => a.id === axisId);
  if (!axis) throw new Error('Axis not found');

  return buildSizingInput(state.project, axis);
}

// 修改公共参数（即时生效）
updateCommonParams: (params) => {
  set(state => ({
    project: {
      ...state.project,
      commonParams: {
        ...state.project.commonParams,
        ...params,
      },
    },
  }));
  // 注意：已完成的轴可能需要标记为"需重新计算"
}
```

---

## 5. 交互流程

### 5.1 新建项目流程

```
1. 用户进入选型工具
   ↓
2. 创建默认项目（带默认公共参数）
   ↓
3. 创建第一个轴 "轴-1"
   ↓
4. 显示项目设置弹窗（引导用户填写）
   ↓
5. 用户配置第一个轴
   ↓
6. 保存到篮子 / 添加新轴
```

### 5.2 修改公共参数流程

```
用户点击 [⚙️ 项目设置]
   ↓
弹窗显示当前项目信息和公共参数
   ↓
用户修改参数（如环境温度 25→30）
   ↓
点击 [保存]
   ↓
即时生效，所有轴使用新参数
   ↓
已完成的轴显示 "⚠️ 参数已变更，建议重新计算"
```

### 5.3 添加新轴流程

```
用户点击 [➕ 添加新轴]
   ↓
显示选项：
   ├─ [基于 X轴-龙门X向 创建]（复制参数）
   └─ [创建空白轴]
   ↓
创建新轴，切换到新轴配置
   ↓
用户只需配置轴特有参数
   ↓
公共参数自动使用项目设置
```

---

## 6. PDF 报告结构

### 6.1 报告数据格式

```typescript
interface MultiAxisReportData {
  project: {
    name: string;
    customer: string;
    salesPerson: string;
    notes?: string;
    date: string;
  };

  // 公共参数汇总
  commonParams: {
    ambientTemp: number;
    ipRating: string;
    communication: string;
    cableLength: string;
    safetyFactor: number;
    maxInertiaRatio: number;
  };

  // 各轴详情
  axes: Array<{
    name: string;

    // 轴特有参数
    mechanism: {
      type: string;
      loadMass: number;
      // ...
    };
    motion: {
      stroke: number;
      maxVelocity: number;
      // ...
    };
    dutyConditions: {
      mountingOrientation: string;
      dutyCycle: number;
      brake: boolean;
      keyShaft: string;
    };

    // 计算结果
    calculations: {
      loadInertia: string;
      rmsTorque: string;
      peakTorque: string;
      maxSpeed: string;
    };

    // 选型结果
    motor?: {
      model: string;
      partNumber: string;
      ratedTorque: number;
      ratedSpeed: number;
    };
    drive?: {
      model: string;
      partNumber: string;
    };
  }>;

  // 物料清单
  bom: Array<{
    partNumber: string;
    description: string;
    quantity: number;
    usedIn: string[];
  }>;
}
```

### 6.2 报告布局

```
┌─────────────────────────────────────────┐
│  博世力士乐伺服系统选型报告               │
│  项目名称：自动化生产线                    │
├─────────────────────────────────────────┤
│                                         │
│  📋 项目信息                             │
│  ├─ 客户：某某公司                        │
│  ├─ 销售：张三                           │
│  ├─ 日期：2026-03-07                     │
│  └─ 备注：龙门系统                        │
│                                         │
│  ⚙️ 公共参数（适用于所有轴）               │
│  ┌─────────────────────────────────┐   │
│  │ 环境温度：25°C   防护等级：IP65  │   │
│  │ 通信协议：EtherCAT              │   │
│  │ 电缆长度：5m     安全系数：1.5   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🛠️ 轴 1: X轴-龙门X向                    │
│  ┌─────────────────────────────────┐   │
│  │ 机构参数：滚珠丝杠，负载100kg     │   │
│  │ 运动参数：行程500mm，速度1000mm/s│   │
│  │ 工作条件：水平安装，S1工作制      │   │
│  │ ─────────────────────────────── │   │
│  │ 选型结果：MS2N04-D0B4...          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🛠️ 轴 2: Y轴-龙门Y向                    │
│  ┌─────────────────────────────────┐   │
│  │ 机构参数：滚珠丝杠，负载80kg      │   │
│  │ 运动参数：行程800mm，速度1000mm/s│   │
│  │ 工作条件：水平安装，S1工作制      │   │
│  │ ─────────────────────────────── │   │
│  │ 选型结果：MS2N04-D0B4...          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📋 物料清单 (BOM)                       │
│  ┌─────────────────────────────────┐   │
│  │ 料号              数量  用于     │   │
│  │ MS2N04-D0B4...    2    X/Y轴    │   │
│  │ XC2010-A0B0...    2    X/Y轴    │   │
│  │ ...                             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. 组件清单

| 组件 | 类型 | 说明 |
|------|------|------|
| `ProjectSettingsModal` | 新 | 项目设置弹窗（项目信息+公共参数） |
| `ProjectHeader` | 修改 | 顶部导航栏，添加项目设置按钮 |
| `AxisSidebar` | 修改 | 侧边栏添加项目设置入口 |
| `CommonParamsDisplay` | 新 | 公共参数只读展示（可选） |
| `DutyConditionsStep` | 修改 | 工作条件步骤（仅轴特有参数） |
| `MultiAxisReport` | 修改 | 多轴PDF报告生成器 |

---

## 8. 数据迁移

### 8.1 从旧数据结构迁移

```typescript
function migrateToSharedParams(oldProject: any): Project {
  return {
    id: oldProject.id || generateProjectId(),
    name: oldProject.name || '未命名项目',
    customer: oldProject.customer || '',
    salesPerson: oldProject.salesPerson || '',
    notes: oldProject.notes,
    createdAt: oldProject.createdAt || new Date().toISOString(),

    // 从第一个轴提取公共参数作为默认值
    commonParams: {
      ambientTemp: oldProject.axes?.[0]?.input?.duty?.ambientTemp ?? 25,
      ipRating: oldProject.axes?.[0]?.input?.duty?.ipRating ?? 'IP65',
      communication: oldProject.axes?.[0]?.input?.preferences?.communication ?? 'ETHERCAT',
      cableLength: oldProject.axes?.[0]?.input?.preferences?.cableLength ?? 5,
      safetyFactor: oldProject.axes?.[0]?.input?.preferences?.safetyFactor ?? 1.5,
      maxInertiaRatio: oldProject.axes?.[0]?.input?.preferences?.maxInertiaRatio ?? 10,
      targetInertiaRatio: oldProject.axes?.[0]?.input?.preferences?.targetInertiaRatio ?? 5,
    },

    // 迁移轴数据，移除公共参数
    axes: oldProject.axes?.map((axis: any) => ({
      id: axis.id,
      name: axis.name,
      status: axis.status,
      createdAt: axis.createdAt,
      completedAt: axis.completedAt,
      input: {
        mechanism: axis.input?.mechanism,
        motion: axis.input?.motion,
        dutyConditions: {
          dutyCycle: axis.input?.duty?.dutyCycle ?? 100,
          mountingOrientation: axis.input?.duty?.mountingOrientation ?? 'HORIZONTAL',
          brake: axis.input?.duty?.brake ?? false,
          keyShaft: axis.input?.duty?.keyShaft ?? 'L',
        },
        selections: axis.input?.selections,
      },
      result: axis.result,
      selectedMotorIndex: axis.selectedMotorIndex,
    })) || [createInitialAxis()],
  };
}
```

---

## 9. 测试要点

- [ ] 项目信息和公共参数正确保存
- [ ] 添加新轴时正确继承公共参数
- [ ] 修改公共参数后所有轴使用新值
- [ ] 轴特有参数正确独立存储
- [ ] 计算时正确合并公共参数和轴特有参数
- [ ] PDF报告正确显示公共参数和轴参数
- [ ] 旧数据正确迁移
- [ ] 移动端项目设置弹窗正常

---

## 10. 实现步骤

1. **数据模型修改** - 更新 types/index.ts
2. **Store 重构** - 更新 project-store.ts
3. **项目设置弹窗** - 新建 ProjectSettingsModal
4. **顶部导航修改** - 更新 ProjectHeader
5. **工作条件步骤修改** - 移除公共参数输入
6. **PDF报告修改** - 添加公共参数展示
7. **数据迁移** - 添加迁移逻辑
8. **测试验证** - 完整流程测试
