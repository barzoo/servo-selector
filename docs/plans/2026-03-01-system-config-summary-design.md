# 系统配置详情信息展示改进设计

## 概述

改进系统配置详情页面的信息展示，采用"摘要表格 + 详细信息 + 计算信息"的三层结构，同时作为导出数据和生成PDF的内容来源。

## 设计目标

1. **信息层次分明**：摘要表格提供快速概览，详细信息展示完整参数，计算信息作为技术补充
2. **支持导出功能**：数据结构可直接用于PDF生成和表格导出
3. **预生成描述**：产品描述在构建时生成，运行时直接读取，提高效率
4. **向后兼容**：扩展现有组件，不破坏现有功能

## 整体布局

```
┌─────────────────────────────────────────────────────┐
│  系统配置摘要 (表格形式)                               │
│  ┌──────────────┬────────────────┬────────────────┐ │
│  │ 订货号        │ 类型           │ 描述            │ │
│  ├──────────────┼────────────────┼────────────────┤ │
│  │ MS2N03-D...  │ 伺服电机        │ 0.64 N·m, ...  │ │
│  │ HCS01.1E...  │ 伺服驱动        │ 1.5A峰值, ...  │ │
│  │ IKSxxxx      │ 动力电缆 (5m)   │ 屏蔽电缆...    │ │
│  │ IKSxxxx      │ 编码器电缆 (5m) │ 高柔性...      │ │
│  └──────────────┴────────────────┴────────────────┘ │
├─────────────────────────────────────────────────────┤
│  详细信息                                            │
│  ├─ 电机详细参数                                     │
│  ├─ 驱动详细参数                                     │
│  ├─ 电缆规格                                         │
│  └─ 配件信息                                         │
├─────────────────────────────────────────────────────┤
│  计算信息 (DetailedCalculations 组件)                │
└─────────────────────────────────────────────────────┘
```

## 数据预处理脚本修改

### 修改文件
`scripts/convert-product-data.ts`

### 新增功能
为每个产品生成 `description` 字段：

#### 电机描述格式
```
{额定扭矩}N·m, {额定转速}rpm, {编码器类型}, {抱闸状态}, {轴类型}

示例:
- "0.64 N·m, 3000 rpm, A型编码器, 带抱闸, 带键轴"
- "2.5 N·m, 4500 rpm, B型编码器, 无抱闸, 光轴"
```

**关键信息提取规则**:
- 扭矩: `ratedTorque` (N·m)
- 转速: `ratedSpeed` (rpm)
- 编码器类型: A型(电池盒式多圈) / B型(机械式多圈)
- 抱闸: 带抱闸 / 无抱闸
- 轴类型: 带键轴 / 光轴

#### 驱动描述格式
```
{峰值电流}A峰值, {通讯方式}, {STO状态}

示例:
- "1.5A 峰值, EtherCAT通讯, 无STO"
- "5.0A 峰值, PROFINET通讯, 带STO"
```

**关键信息提取规则**:
- 峰值电流: `maxCurrent` (A)
- 通讯方式: EtherCAT / PROFINET / EtherNet/IP / 模拟量
- STO: 带STO / 无STO

#### 电缆描述格式
```
{电缆类型}, {长度}m, {特性}

示例:
- "动力电缆, 5m, 高柔性屏蔽"
- "编码器电缆, 10m, 标准型"
- "通讯电缆, 3m, EtherCAT专用"
```

**关键信息提取规则**:
- 电缆类型: 动力电缆 / 编码器电缆 / 通讯电缆
- 长度: 3/5/10/15/20/25/30m
- 特性: 高柔性屏蔽 / 标准型 / 专用

### 数据结构扩展

```typescript
// 添加到 motors.json 中每个电机对象
description: {
  short: "0.64 N·m, 3000 rpm, A型编码器, 带抱闸, 带键轴",
  detailed?: string // 可选，用于未来扩展
}

// 添加到 drives.json 中每个驱动对象
description: {
  short: "1.5A 峰值, EtherCAT通讯, 无STO"
}
```

## SystemSummary 组件增强

### 修改文件
`src/components/wizard/SystemSummary.tsx`

### 新增功能

#### 1. 表格视图
三列表格展示配置摘要：
- **订货号**: 产品完整型号
- **类型**: 产品类别（伺服电机/伺服驱动/动力电缆/编码器电缆/通讯电缆/制动电阻/EMC滤波器）
- **描述**: 预生成的简短描述

#### 2. 详细视图
保留并优化现有的详细参数展示：
- 电机详细参数（扭矩、转速、惯量等）
- 驱动详细参数（电流、功率、通讯等）
- 电缆规格（型号、长度）
- 配件信息（制动电阻、EMC滤波器）

#### 3. 导出数据结构
新增方法生成统一的数据结构，供PDF导出使用：

```typescript
interface ExportData {
  summary: {
    partNumber: string;
    type: string;
    description: string;
  }[];
  details: {
    motor: MotorDetails;
    drive: DriveDetails;
    cables: CableDetails;
    accessories: AccessoriesDetails;
  };
  calculations: CalculationDetails;
}
```

### 组件接口

保持现有接口不变：

```typescript
interface SystemSummaryProps {
  config: SystemConfiguration;
  mechanical?: MechanicalResult;
}
```

内部增加表格渲染逻辑，通过 `config` 中的 `partNumber` 关联到产品数据获取描述。

## 类型定义扩展

### 修改文件
`src/types/index.ts`

### 新增类型

```typescript
// 产品描述
interface ProductDescription {
  short: string;      // 简短描述（表格用）
  detailed?: string;  // 详细描述（可选扩展）
}

// 导出数据结构
interface SystemConfigExportData {
  summary: SummaryItem[];
  details: ConfigDetails;
  calculations?: MechanicalResult;
  project?: ProjectInfo;
}

interface SummaryItem {
  partNumber: string;
  category: 'MOTOR' | 'DRIVE' | 'MOTOR_CABLE' | 'ENCODER_CABLE' | 'COMM_CABLE' | 'BRAKE_RESISTOR' | 'EMC_FILTER';
  typeLabel: string;
  description: string;
}
```

## 实现步骤

1. **数据预处理脚本** (scripts/convert-product-data.ts)
   - 添加描述生成函数
   - 为电机、驱动、电缆生成描述字段
   - 更新JSON输出

2. **类型定义** (src/types/index.ts)
   - 添加 ProductDescription 类型
   - 添加导出数据相关类型

3. **SystemSummary 组件** (src/components/wizard/SystemSummary.tsx)
   - 添加表格渲染方法
   - 集成产品描述数据
   - 添加导出数据生成方法

4. **测试验证**
   - 验证描述生成正确性
   - 验证表格渲染正常
   - 验证导出数据结构完整

## 验收标准

- [ ] 摘要表格正确显示所有配置项的订货号、类型和描述
- [ ] 电机描述包含：扭矩、转速、编码器类型、抱闸、轴类型
- [ ] 驱动描述包含：峰值电流、通讯方式、STO状态
- [ ] 电缆描述包含：类型、长度、特性
- [ ] 详细信息部分保持现有功能正常
- [ ] 导出数据结构可用于PDF生成

## 后续扩展

1. **表格导出功能**: 将摘要表格导出为CSV/Excel格式
2. **PDF生成**: 基于导出数据结构生成格式化的PDF报告
3. **多语言支持**: 描述文本支持i18n国际化
