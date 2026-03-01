# PDF 导出功能设计文档

**日期**: 2026-03-01
**功能**: 选型结果 PDF 报告导出
**方案**: 客户端纯表格绘制（jspdf-autotable）

---

## 1. 需求概述

### 1.1 目标
为用户生成专业的伺服选型订货报告 PDF，包含完整的计算结果和系统配置信息。

### 1.2 内容范围
- 项目信息
- 计算摘要
- 系统配置清单（订货号表格）
- 电机详细参数
- 驱动器详细参数
- 电缆规格
- 配件信息
- 制动能量分析
- 详细计算过程（机械参数、惯量计算、扭矩分析、运动参数、功率与能量）

### 1.3 样式要求
- 简洁商务风格（白底黑字，表格为主）
- 专业订货报告格式
- 支持分页，表格跨页自动处理

### 1.4 语言支持
- 跟随当前界面语言（i18n）
- 同时修复 SystemSummary 等组件的硬编码中文问题

---

## 2. 技术方案

### 2.1 选型对比

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| jspdf + html2canvas | 实现简单，直接截图 | 中文需额外字体，分页控制差 | ❌ 不适用 |
| 服务端生成 | 排版控制强 | 需服务器资源，Vercel 有限制 | ❌ 不适用 |
| **jspdf-autotable** | 专业表格，分页优雅 | 需重新实现布局 | ✅ **采用** |

### 2.2 依赖库

```bash
npm install jspdf-autotable
```

### 2.3 架构设计

```
src/
├── lib/
│   └── pdf/
│       ├── index.ts              # 导出入口
│       ├── generator.ts          # PDF 生成器主类
│       ├── sections/
│       │   ├── header.ts         # 页眉/报告标题
│       │   ├── project-info.ts   # 项目信息
│       │   ├── calculation-summary.ts  # 计算摘要
│       │   ├── system-config.ts  # 系统配置清单
│       │   ├── motor-details.ts  # 电机详细参数
│       │   ├── drive-details.ts  # 驱动器详细参数
│       │   ├── cable-specs.ts    # 电缆规格
│       │   ├── accessories.ts    # 配件信息
│       │   ├── regeneration.ts   # 制动能量分析
│       │   └── detailed-calculations.ts  # 详细计算过程
│       └── utils/
│           ├── formatting.ts     # 数值格式化
│           └── styles.ts         # 样式定义
└── components/
    └── wizard/
        └── PdfExportButton.tsx   # 导出按钮组件
```

---

## 3. 详细设计

### 3.1 PDF 生成器主类

```typescript
// lib/pdf/generator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class SizingReportPDFGenerator {
  private doc: jsPDF;
  private t: (key: string) => string;  // i18n 翻译函数
  private currentY: number = 0;

  constructor(locale: string, translations: Record<string, string>) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.t = (key) => translations[key] || key;
  }

  generate(data: ReportData): jsPDF {
    this.addHeader();
    this.addProjectInfo(data.project);
    this.addCalculationSummary(data.calculations);
    this.addSystemConfigTable(data.systemConfig);
    this.addMotorDetails(data.motor);
    this.addDriveDetails(data.drive);
    this.addCableSpecs(data.cables);
    this.addAccessories(data.accessories);
    this.addRegenerationAnalysis(data.regeneration);
    this.addDetailedCalculations(data.detailedCalculations);
    return this.doc;
  }

  private addHeader() {
    // 报告标题、生成日期、页眉
  }

  // ... 其他 section 方法
}
```

### 3.2 样式定义

```typescript
// lib/pdf/utils/styles.ts
export const pdfStyles = {
  // 颜色
  colors: {
    primary: '#000000',      // 主文字 - 黑色
    secondary: '#333333',    // 次要文字 - 深灰
    muted: '#666666',        // 辅助文字 - 中灰
    border: '#CCCCCC',       // 边框 - 浅灰
    headerBg: '#F5F5F5',     // 表头背景 - 极浅灰
    alternateBg: '#FAFAFA',  // 交替行背景
  },

  // 字体
  fonts: {
    title: { size: 18, style: 'bold' },
    section: { size: 14, style: 'bold' },
    subsection: { size: 12, style: 'bold' },
    body: { size: 10, style: 'normal' },
    small: { size: 8, style: 'normal' },
  },

  // 间距
  spacing: {
    pageMargin: 15,      // 页边距 15mm
    sectionGap: 10,      // 章节间距 10mm
    paragraphGap: 5,     // 段落间距 5mm
  },

  // 表格样式
  table: {
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 51, 51],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { top: 15, right: 15, bottom: 15, left: 15 },
  },
};
```

### 3.3 各章节详细设计

#### 3.3.1 报告标题页眉

```typescript
// lib/pdf/sections/header.ts
export function addHeader(
  doc: jsPDF,
  t: (key: string) => string,
  projectName: string
) {
  // 标题: "伺服系统选型报告" / "Servo System Sizing Report"
  // 副标题: 项目名称
  // 生成日期
  // 分隔线
}
```

#### 3.3.2 项目信息

```typescript
// lib/pdf/sections/project-info.ts
export function addProjectInfo(
  doc: jsPDF,
  t: (key: string) => string,
  project: ProjectInfo
) {
  // 两列表格:
  // | 项目名称 | xxx |
  // | 客户名称 | xxx |
  // | 销售人员 | xxx |
  // | 日期     | xxx |
  // | 备注     | xxx |
}
```

#### 3.3.3 计算摘要

```typescript
// lib/pdf/sections/calculation-summary.ts
export function addCalculationSummary(
  doc: jsPDF,
  t: (key: string) => string,
  calculations: CalculationSummary
) {
  // 六宫格布局（使用表格实现）:
  // | 负载惯量    | RMS扭矩    | 峰值扭矩   |
  // | 最大转速    | 再生功率   | 计算耗时   |
}
```

#### 3.3.4 系统配置清单

```typescript
// lib/pdf/sections/system-config.ts
export function addSystemConfigTable(
  doc: jsPDF,
  t: (key: string) => string,
  items: SummaryItem[]
) {
  // 主订货表格:
  // | 订货号 | 类型 | 描述 |
  // 包含所有配件
}
```

#### 3.3.5 电机详细参数

```typescript
// lib/pdf/sections/motor-details.ts
export function addMotorDetails(
  doc: jsPDF,
  t: (key: string) => string,
  motor: MC20Motor
) {
  // 两列参数表:
  // 基本参数: 额定功率、额定转速、额定扭矩、峰值扭矩、最大转速、额定电流、转子惯量、扭矩常数
  // 选项参数: 编码器类型、抱闸、轴类型、防护等级
}
```

#### 3.3.6 驱动器详细参数

```typescript
// lib/pdf/sections/drive-details.ts
export function addDriveDetails(
  doc: jsPDF,
  t: (key: string) => string,
  drive: XC20Drive
) {
  // 两列参数表:
  // 基本参数: 最大电流、额定电流、过载能力、PWM频率
  // 选项参数: 通讯协议、面板、安全功能、散热
  // 制动能力: 内置电阻、连续功率、峰值功率
}
```

#### 3.3.7 电缆规格

```typescript
// lib/pdf/sections/cable-specs.ts
export function addCableSpecs(
  doc: jsPDF,
  t: (key: string) => string,
  cables: CableConfig
) {
  // 电缆卡片式表格:
  // 动力电缆: 订货号、规格、长度
  // 编码器电缆: 订货号、规格、长度
  // 通讯电缆（如有）: 订货号、长度
}
```

#### 3.3.8 配件信息

```typescript
// lib/pdf/sections/accessories.ts
export function addAccessories(
  doc: jsPDF,
  t: (key: string) => string,
  accessories: Accessories
) {
  // 可选章节，仅在有配件时显示
  // EMC滤波器、制动电阻
}
```

#### 3.3.9 制动能量分析

```typescript
// lib/pdf/sections/regeneration.ts
export function addRegenerationAnalysis(
  doc: jsPDF,
  t: (key: string) => string,
  regeneration: RegenerationResult
) {
  // 四列参数表:
  // 单次制动能量、平均制动功率、需要外部电阻、推荐电阻功率
  // 警告信息（如有）
}
```

#### 3.3.10 详细计算过程

```typescript
// lib/pdf/sections/detailed-calculations.ts
export function addDetailedCalculations(
  doc: jsPDF,
  t: (key: string) => string,
  calculations: DetailedCalculations
) {
  // 五个子章节，每个一个表格:
  // 1. 机械参数
  // 2. 惯量计算
  // 3. 扭矩分析
  // 4. 运动参数
  // 5. 功率与能量
}
```

---

## 4. i18n 修复设计

### 4.1 需要修复的组件

SystemSummary.tsx 中的硬编码中文：

| 位置 | 当前文本 | i18n Key |
|------|----------|----------|
| 系统配置清单标题 | "系统配置清单" | `systemSummary.configList` |
| 表格列头 | "订货号"、"类型"、"描述" | `systemSummary.columns.*` |
| 电机详细参数标题 | "电机详细参数" | `systemSummary.motorDetails` |
| 驱动详细参数标题 | "驱动详细参数" | `systemSummary.driveDetails` |
| 电缆规格标题 | "电缆规格" | `systemSummary.cableSpecs` |
| 配件信息标题 | "配件信息" | `systemSummary.accessories` |
| 制动能量分析标题 | "制动能量分析" | `systemSummary.regeneration` |
| 所有参数标签 | "额定功率"、"额定转速"... | `systemSummary.labels.*` |
| 选项值 | "电池多圈"、"有"、"无"... | `systemSummary.options.*` |

### 4.2 新增 i18n 键值

```json
{
  "systemSummary": {
    "title": "系统配置",
    "configList": "系统配置清单",
    "motorDetails": "电机详细参数",
    "driveDetails": "驱动器详细参数",
    "cableSpecs": "电缆规格",
    "accessories": "配件信息",
    "regeneration": "制动能量分析",
    "columns": {
      "partNumber": "订货号",
      "type": "类型",
      "description": "描述"
    },
    "labels": {
      "ratedPower": "额定功率",
      "ratedSpeed": "额定转速",
      "ratedTorque": "额定扭矩",
      "peakTorque": "峰值扭矩",
      "maxSpeed": "最大转速",
      "ratedCurrent": "额定电流",
      "rotorInertia": "转子惯量",
      "torqueConstant": "扭矩常数",
      "encoderType": "编码器类型",
      "brake": "抱闸",
      "shaftType": "轴类型",
      "protection": "防护等级",
      "maxCurrent": "最大电流",
      "overloadCapacity": "过载能力",
      "pwmFrequency": "PWM频率",
      "communication": "通讯协议",
      "panel": "面板",
      "safety": "安全功能",
      "cooling": "散热",
      "internalResistance": "内置电阻",
      "continuousPower": "连续功率",
      "peakPower": "峰值功率",
      "motorCable": "动力电缆",
      "encoderCable": "编码器电缆",
      "commCable": "通讯电缆",
      "brakeResistor": "制动电阻",
      "emcFilter": "EMC滤波器",
      "energyPerCycle": "单次制动能量",
      "brakingPower": "平均制动功率",
      "externalResistorRequired": "需要外部电阻",
      "recommendedResistorPower": "推荐电阻功率"
    },
    "options": {
      "batteryMultiTurn": "电池多圈",
      "mechanicalMultiTurn": "机械多圈",
      "typeA": "A型",
      "typeB": "B型",
      "yes": "有",
      "no": "无",
      "keyShaft": "带键槽",
      "smoothShaft": "光轴",
      "withDisplay": "带显示",
      "withoutDisplay": "无显示",
      "sto": "STO",
      "none": "无",
      "fan": "风扇",
      "natural": "自然冷却",
      "ethercat": "EtherCAT",
      "profinet": "PROFINET",
      "ethernetIp": "EtherNet/IP"
    },
    "cable": {
      "spec": "规格",
      "length": "长度",
      "lengthUnit": "米",
      "terminalOnly": "仅接线端子"
    }
  }
}
```

---

## 5. 数据流设计

### 5.1 导出流程

```
用户点击"导出 PDF"按钮
        ↓
PdfExportButton 组件收集数据
        ↓
从 wizard store 获取:
  - input (项目信息、机械参数、运动参数)
  - result (计算结果、推荐电机、系统配置)
        ↓
准备 i18n 翻译数据
        ↓
调用 SizingReportPDFGenerator.generate()
        ↓
逐章节生成 PDF
        ↓
doc.save(`选型报告_${projectName}_${date}.pdf`)
```

### 5.2 数据结构

```typescript
// lib/pdf/types.ts
interface ReportData {
  project: ProjectInfo;
  calculations: CalculationSummary;
  systemConfig: {
    items: SummaryItem[];
    motor: MC20Motor;
    drive: XC20Drive;
    cables: CableConfig;
    accessories: Accessories;
  };
  regeneration: RegenerationResult;
  detailedCalculations: DetailedCalculationsData;
}

interface DetailedCalculationsData {
  mechanism: MechanismDetails;
  inertia: InertiaDetails;
  torques: TorqueDetails;
  motion: MotionDetails;
  power: PowerDetails;
}
```

---

## 6. 实现计划

### Phase 1: i18n 修复
1. 更新 zh.json 和 en.json 添加 systemSummary 命名空间
2. 重构 SystemSummary.tsx 使用 useTranslations
3. 验证中英文切换正常

### Phase 2: PDF 基础架构
1. 安装 jspdf-autotable
2. 创建 lib/pdf 目录结构
3. 实现样式定义和工具函数
4. 实现 PDF 生成器主类框架

### Phase 3: PDF 章节实现
按顺序实现各章节：
1. Header + Project Info
2. Calculation Summary
3. System Config Table
4. Motor Details
5. Drive Details
6. Cable Specs
7. Accessories
8. Regeneration Analysis
9. Detailed Calculations

### Phase 4: 集成与测试
1. 创建 PdfExportButton 组件
2. 替换 ResultStep 中的导出逻辑
3. 测试中英文 PDF 生成
4. 测试各种配置组合

---

## 7. 验收标准

- [ ] PDF 报告包含所有要求的内容章节
- [ ] 表格分页正确处理，不截断内容
- [ ] 中英文语言跟随界面设置
- [ ] SystemSummary 组件完全国际化
- [ ] 报告样式符合简洁商务风格
- [ ] 文件名格式：`选型报告_项目名称_YYYYMMDD.pdf`

---

## 8. 参考

- [jspdf-autotable 文档](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [jsPDF 文档](https://rawgit.com/MrRio/jsPDF/master/docs/)
- 现有代码: SystemSummary.tsx, DetailedCalculations.tsx, ResultStep.tsx
