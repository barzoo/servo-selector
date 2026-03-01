# PDF 导出功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现选型结果 PDF 报告导出功能，包含完整计算结果和系统配置信息，同时修复 SystemSummary 组件的国际化问题。

**Architecture:** 使用 jspdf-autotable 客户端生成专业 PDF 报告，采用模块化章节设计，每个章节独立渲染。i18n 修复通过新增 systemSummary 命名空间实现。

**Tech Stack:** Next.js 14, TypeScript, jspdf, jspdf-autotable, next-intl, TailwindCSS

---

## Phase 1: i18n 修复 - SystemSummary 国际化

### Task 1: 更新中文翻译文件

**Files:**
- Modify: `src/i18n/messages/zh.json`

**Step 1: 添加 systemSummary 命名空间**

在 `src/i18n/messages/zh.json` 的 `detailedCalculations` 同级添加：

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

**Step 2: Commit**

```bash
git add src/i18n/messages/zh.json
git commit -m "i18n: add systemSummary translations for zh"
```

---

### Task 2: 更新英文翻译文件

**Files:**
- Modify: `src/i18n/messages/en.json`

**Step 1: 添加 systemSummary 命名空间**

在 `src/i18n/messages/en.json` 的 `detailedCalculations` 同级添加：

```json
{
  "systemSummary": {
    "title": "System Configuration",
    "configList": "System Configuration List",
    "motorDetails": "Motor Details",
    "driveDetails": "Drive Details",
    "cableSpecs": "Cable Specifications",
    "accessories": "Accessories",
    "regeneration": "Regeneration Analysis",
    "columns": {
      "partNumber": "Part Number",
      "type": "Type",
      "description": "Description"
    },
    "labels": {
      "ratedPower": "Rated Power",
      "ratedSpeed": "Rated Speed",
      "ratedTorque": "Rated Torque",
      "peakTorque": "Peak Torque",
      "maxSpeed": "Max Speed",
      "ratedCurrent": "Rated Current",
      "rotorInertia": "Rotor Inertia",
      "torqueConstant": "Torque Constant",
      "encoderType": "Encoder Type",
      "brake": "Brake",
      "shaftType": "Shaft Type",
      "protection": "Protection",
      "maxCurrent": "Max Current",
      "overloadCapacity": "Overload Capacity",
      "pwmFrequency": "PWM Frequency",
      "communication": "Communication",
      "panel": "Panel",
      "safety": "Safety",
      "cooling": "Cooling",
      "internalResistance": "Internal Resistance",
      "continuousPower": "Continuous Power",
      "peakPower": "Peak Power",
      "motorCable": "Motor Cable",
      "encoderCable": "Encoder Cable",
      "commCable": "Communication Cable",
      "brakeResistor": "Brake Resistor",
      "emcFilter": "EMC Filter",
      "energyPerCycle": "Energy Per Cycle",
      "brakingPower": "Braking Power",
      "externalResistorRequired": "External Resistor Required",
      "recommendedResistorPower": "Recommended Resistor Power"
    },
    "options": {
      "batteryMultiTurn": "Battery Multi-turn",
      "mechanicalMultiTurn": "Mechanical Multi-turn",
      "typeA": "Type A",
      "typeB": "Type B",
      "yes": "Yes",
      "no": "No",
      "keyShaft": "Keyed Shaft",
      "smoothShaft": "Smooth Shaft",
      "withDisplay": "With Display",
      "withoutDisplay": "Without Display",
      "sto": "STO",
      "none": "None",
      "fan": "Fan",
      "natural": "Natural",
      "ethercat": "EtherCAT",
      "profinet": "PROFINET",
      "ethernetIp": "EtherNet/IP"
    },
    "cable": {
      "spec": "Specification",
      "length": "Length",
      "lengthUnit": "m",
      "terminalOnly": "Terminal Only"
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "i18n: add systemSummary translations for en"
```

---

### Task 3: 重构 SystemSummary 组件使用 i18n

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx`

**Step 1: 添加 useTranslations 导入和 hook**

```typescript
import { useTranslations } from 'next-intl';

export function SystemSummary({ config, mechanical }: SystemSummaryProps) {
  const t = useTranslations('systemSummary');
  const tOptions = useTranslations('systemSummary.options');
  // ...
}
```

**Step 2: 替换所有硬编码中文**

将以下硬编码文本替换为 t() 调用：

| 原文本 | 替换为 |
|--------|--------|
| "系统配置清单" | `t('configList')` |
| "订货号" | `t('columns.partNumber')` |
| "类型" | `t('columns.type')` |
| "描述" | `t('columns.description')` |
| "电机详细参数" | `t('motorDetails')` |
| "驱动详细参数" | `t('driveDetails')` |
| "电缆规格" | `t('cableSpecs')` |
| "配件信息" | `t('accessories')` |
| "制动能量分析" | `t('regeneration')` |
| "额定功率" | `t('labels.ratedPower')` |
| "额定转速" | `t('labels.ratedSpeed')` |
| "额定扭矩" | `t('labels.ratedTorque')` |
| "峰值扭矩" | `t('labels.peakTorque')` |
| "最大转速" | `t('labels.maxSpeed')` |
| "额定电流" | `t('labels.ratedCurrent')` |
| "转子惯量" | `t('labels.rotorInertia')` |
| "扭矩常数" | `t('labels.torqueConstant')` |
| "编码器类型" | `t('labels.encoderType')` |
| "抱闸" | `t('labels.brake')` |
| "轴类型" | `t('labels.shaftType')` |
| "防护等级" | `t('labels.protection')` |
| "最大电流" | `t('labels.maxCurrent')` |
| "过载能力" | `t('labels.overloadCapacity')` |
| "PWM频率" | `t('labels.pwmFrequency')` |
| "通讯协议" | `t('labels.communication')` |
| "面板" | `t('labels.panel')` |
| "安全功能" | `t('labels.safety')` |
| "散热" | `t('labels.cooling')` |
| "内置电阻" | `t('labels.internalResistance')` |
| "连续功率" | `t('labels.continuousPower')` |
| "峰值功率" | `t('labels.peakPower')` |
| "动力电缆" | `t('labels.motorCable')` |
| "编码器电缆" | `t('labels.encoderCable')` |
| "通讯电缆" | `t('labels.commCable')` |
| "制动电阻" | `t('labels.brakeResistor')` |
| "EMC滤波器" | `t('labels.emcFilter')` |
| "单次制动能量" | `t('labels.energyPerCycle')` |
| "平均制动功率" | `t('labels.brakingPower')` |
| "需要外部电阻" | `t('labels.externalResistorRequired')` |
| "推荐电阻功率" | `t('labels.recommendedResistorPower')` |

**Step 3: 替换选项值**

| 原文本 | 替换为 |
|--------|--------|
| "电池多圈" | `tOptions('batteryMultiTurn')` |
| "机械多圈" | `tOptions('mechanicalMultiTurn')` |
| "A型" | `tOptions('typeA')` |
| "B型" | `tOptions('typeB')` |
| "有" | `tOptions('yes')` |
| "无" | `tOptions('no')` |
| "带键槽" | `tOptions('keyShaft')` |
| "光轴" | `tOptions('smoothShaft')` |
| "带显示" | `tOptions('withDisplay')` |
| "无显示" | `tOptions('withoutDisplay')` |
| "STO" | `tOptions('sto')` |
| "风扇" | `tOptions('fan')` |
| "自然冷却" | `tOptions('natural')` |
| "EtherCAT" | `tOptions('ethercat')` |
| "PROFINET" | `tOptions('profinet')` |
| "EtherNet/IP" | `tOptions('ethernetIp')` |

**Step 4: 运行测试验证**

```bash
npm run test -- SystemSummary.test.tsx
```

Expected: PASS

**Step 5: 启动开发服务器验证**

```bash
npm run dev
```

访问 http://localhost:3000，完成选型流程，检查 SystemSummary 中英文显示正常。

**Step 6: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "i18n: refactor SystemSummary to use translations"
```

---

## Phase 2: PDF 基础架构

### Task 4: 安装依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装 jspdf-autotable**

```bash
npm install jspdf-autotable
```

**Step 2: 验证安装**

```bash
npm list jspdf-autotable
```

Expected: `jspdf-autotable@x.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add jspdf-autotable for PDF generation"
```

---

### Task 5: 创建 PDF 类型定义

**Files:**
- Create: `src/lib/pdf/types.ts`

**Step 1: 写入类型定义**

```typescript
import type {
  MC20Motor,
  XC20Drive,
  SummaryItem,
  MechanicalResult,
  SystemConfiguration,
} from '@/types';

export interface ReportProjectInfo {
  name: string;
  customer: string;
  salesPerson?: string;
  date: string;
  notes?: string;
}

export interface ReportCalculationSummary {
  loadInertia: string;
  rmsTorque: string;
  peakTorque: string;
  maxSpeed: string;
  regenPower: string;
  calcTime: string;
}

export interface ReportCableConfig {
  motor: {
    partNumber: string;
    spec: string;
    length: number | string;
  };
  encoder: {
    partNumber: string;
    spec: string;
    length: number | string;
  };
  communication?: {
    partNumber: string;
    length: number | string;
  };
}

export interface ReportAccessories {
  emcFilter?: string;
  brakeResistor?: {
    model: string;
    partNumber: string;
  };
}

export interface ReportData {
  project: ReportProjectInfo;
  calculations: ReportCalculationSummary;
  systemConfig: {
    items: SummaryItem[];
    motor: MC20Motor | null;
    drive: XC20Drive | null;
    cables: ReportCableConfig;
    accessories: ReportAccessories;
  };
  regeneration: MechanicalResult['regeneration'];
  detailedCalculations: {
    input: Record<string, unknown>;
    mechanical: MechanicalResult;
  };
}

export type TranslationFunction = (key: string) => string;
```

**Step 2: Commit**

```bash
git add src/lib/pdf/types.ts
git commit -m "feat(pdf): add type definitions for PDF report"
```

---

### Task 6: 创建 PDF 样式定义

**Files:**
- Create: `src/lib/pdf/styles.ts`

**Step 1: 写入样式定义**

```typescript
import type { UserOptions } from 'jspdf-autotable';

// 颜色定义 (RGB)
export const colors = {
  primary: [0, 0, 0] as [number, number, number],           // 黑色
  secondary: [51, 51, 51] as [number, number, number],      // 深灰 #333
  muted: [102, 102, 102] as [number, number, number],       // 中灰 #666
  border: [204, 204, 204] as [number, number, number],      // 浅灰 #CCC
  headerBg: [245, 245, 245] as [number, number, number],    // 表头背景 #F5F5F5
  alternateBg: [250, 250, 250] as [number, number, number], // 交替行背景 #FAFAFA
  white: [255, 255, 255] as [number, number, number],
};

// 字体大小 (mm 转 pt: 1mm ≈ 2.83pt)
export const fonts = {
  title: { size: 18, style: 'bold' as const },
  section: { size: 14, style: 'bold' as const },
  subsection: { size: 12, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  small: { size: 8, style: 'normal' as const },
};

// 间距 (单位: mm)
export const spacing = {
  pageMargin: 15,
  sectionGap: 10,
  paragraphGap: 5,
  tableMargin: 5,
};

// 表格默认样式
export const defaultTableStyles: Partial<UserOptions> = {
  theme: 'grid',
  headStyles: {
    fillColor: colors.headerBg,
    textColor: colors.primary,
    fontStyle: 'bold',
    fontSize: fonts.body.size,
    halign: 'left',
    valign: 'middle',
  },
  bodyStyles: {
    fontSize: fonts.small.size,
    textColor: colors.secondary,
    valign: 'middle',
  },
  alternateRowStyles: {
    fillColor: colors.alternateBg,
  },
  tableLineColor: colors.border,
  tableLineWidth: 0.2,
  margin: { top: 5, right: 0, bottom: 5, left: 0 },
};

// 页面配置
export const pageConfig = {
  format: 'a4' as const,
  orientation: 'portrait' as const,
  unit: 'mm' as const,
};

// A4 尺寸 (mm)
export const pageSize = {
  width: 210,
  height: 297,
};
```

**Step 2: Commit**

```bash
git add src/lib/pdf/styles.ts
git commit -m "feat(pdf): add PDF styling definitions"
```

---

### Task 7: 创建 PDF 工具函数

**Files:**
- Create: `src/lib/pdf/utils.ts`

**Step 1: 写入工具函数**

```typescript
import jsPDF from 'jspdf';
import { spacing, fonts, colors, pageSize } from './styles';

/**
 * 添加章节标题
 */
export function addSectionTitle(
  doc: jsPDF,
  title: string,
  y: number
): number {
  doc.setFontSize(fonts.section.size);
  doc.setFont('helvetica', fonts.section.style);
  doc.setTextColor(...colors.primary);
  doc.text(title, spacing.pageMargin, y);

  // 添加下划线
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(
    spacing.pageMargin,
    y + 2,
    pageSize.width - spacing.pageMargin,
    y + 2
  );

  return y + spacing.paragraphGap + 2;
}

/**
 * 添加子章节标题
 */
export function addSubsectionTitle(
  doc: jsPDF,
  title: string,
  y: number
): number {
  doc.setFontSize(fonts.subsection.size);
  doc.setFont('helvetica', fonts.subsection.style);
  doc.setTextColor(...colors.primary);
  doc.text(title, spacing.pageMargin, y);

  return y + spacing.paragraphGap;
}

/**
 * 添加普通文本
 */
export function addText(
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    size?: number;
    style?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
  }
): number {
  const {
    size = fonts.body.size,
    style = 'normal',
    color = colors.secondary,
    align = 'left',
  } = options || {};

  doc.setFontSize(size);
  doc.setFont('helvetica', style);
  doc.setTextColor(...color);

  let x = spacing.pageMargin;
  if (align === 'center') {
    const textWidth = doc.getTextWidth(text);
    x = (pageSize.width - textWidth) / 2;
  } else if (align === 'right') {
    const textWidth = doc.getTextWidth(text);
    x = pageSize.width - spacing.pageMargin - textWidth;
  }

  doc.text(text, x, y);
  return y + spacing.paragraphGap;
}

/**
 * 检查是否需要新页面
 */
export function checkNewPage(doc: jsPDF, requiredHeight: number): number {
  const currentY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 0;
  const pageHeight = pageSize.height - spacing.pageMargin;

  if (currentY + requiredHeight > pageHeight) {
    doc.addPage();
    return spacing.pageMargin + 10;
  }

  return currentY + spacing.sectionGap;
}

/**
 * 获取当前 Y 位置
 */
export function getCurrentY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || spacing.pageMargin + 10;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 生成文件名
 */
export function generateFileName(projectName: string): string {
  const date = formatDate();
  const sanitizedName = projectName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `选型报告_${sanitizedName}_${date}.pdf`;
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/utils.ts
git commit -m "feat(pdf): add PDF utility functions"
```

---

## Phase 3: PDF 章节实现

### Task 8: 实现报告标题和页眉

**Files:**
- Create: `src/lib/pdf/sections/header.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import { spacing, fonts, colors, pageSize } from '../styles';
import type { TranslationFunction } from '../types';

export function addReportHeader(
  doc: jsPDF,
  t: TranslationFunction,
  projectName: string,
  date: string
): void {
  // 主标题
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', fonts.title.style);
  doc.setTextColor(...colors.primary);

  const title = t('pdf.reportTitle');
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageSize.width - titleWidth) / 2;
  doc.text(title, titleX, spacing.pageMargin + 10);

  // 副标题（项目名称）
  if (projectName) {
    doc.setFontSize(fonts.subsection.size);
    doc.setFont('helvetica', 'normal');
    const subtitle = `${t('pdf.project')}: ${projectName}`;
    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageSize.width - subtitleWidth) / 2;
    doc.text(subtitle, subtitleX, spacing.pageMargin + 18);
  }

  // 生成日期
  doc.setFontSize(fonts.small.size);
  doc.setTextColor(...colors.muted);
  const dateText = `${t('pdf.generatedAt')}: ${date}`;
  const dateWidth = doc.getTextWidth(dateText);
  const dateX = (pageSize.width - dateWidth) / 2;
  doc.text(dateText, dateX, spacing.pageMargin + 25);

  // 分隔线
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(
    spacing.pageMargin,
    spacing.pageMargin + 30,
    pageSize.width - spacing.pageMargin,
    spacing.pageMargin + 30
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/header.ts
git commit -m "feat(pdf): add report header section"
```

---

### Task 9: 实现项目信息章节

**Files:**
- Create: `src/lib/pdf/sections/project-info.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { spacing, defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportProjectInfo } from '../types';

export function addProjectInfoSection(
  doc: jsPDF,
  t: TranslationFunction,
  project: ReportProjectInfo
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('pdf.sections.projectInfo'), y);

  const tableData = [
    [t('pdf.projectInfo.name'), project.name || '-'],
    [t('pdf.projectInfo.customer'), project.customer || '-'],
  ];

  if (project.salesPerson) {
    tableData.push([t('pdf.projectInfo.salesPerson'), project.salesPerson]);
  }

  tableData.push([t('pdf.projectInfo.date'), project.date]);

  if (project.notes) {
    tableData.push([t('pdf.projectInfo.notes'), project.notes]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columns: [
      { header: t('pdf.projectInfo.item'), dataKey: 'item' },
      { header: t('pdf.projectInfo.value'), dataKey: 'value' },
    ],
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    headStyles: {
      ...defaultTableStyles.headStyles,
      fillColor: [240, 240, 240],
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/project-info.ts
git commit -m "feat(pdf): add project info section"
```

---

### Task 10: 实现计算摘要章节

**Files:**
- Create: `src/lib/pdf/sections/calculation-summary.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportCalculationSummary } from '../types';

export function addCalculationSummarySection(
  doc: jsPDF,
  t: TranslationFunction,
  calculations: ReportCalculationSummary
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('pdf.sections.calculationSummary'), y);

  const tableData = [
    [
      t('result.loadInertia'),
      calculations.loadInertia,
      t('result.rmsTorque'),
      calculations.rmsTorque,
      t('result.peakTorque'),
      calculations.peakTorque,
    ],
    [
      t('result.maxSpeed'),
      calculations.maxSpeed,
      t('result.regenPower'),
      calculations.regenPower,
      t('result.calcTime'),
      calculations.calcTime,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 30, fontStyle: 'bold' },
      3: { cellWidth: 35 },
      4: { cellWidth: 30, fontStyle: 'bold' },
      5: { cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/calculation-summary.ts
git commit -m "feat(pdf): add calculation summary section"
```

---

### Task 11: 实现系统配置清单章节

**Files:**
- Create: `src/lib/pdf/sections/system-config.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, SummaryItem } from '../types';

export function addSystemConfigSection(
  doc: jsPDF,
  t: TranslationFunction,
  items: SummaryItem[]
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.configList'), y);

  const tableData = items.map((item) => ({
    partNumber: item.partNumber,
    type: item.typeLabel,
    description: item.description,
  }));

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.partNumber'),
        t('systemSummary.columns.type'),
        t('systemSummary.columns.description'),
      ],
    ],
    body: tableData,
    columnStyles: {
      partNumber: { cellWidth: 50, font: 'courier' },
      type: { cellWidth: 35 },
      description: { cellWidth: 'auto' },
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/system-config.ts
git commit -m "feat(pdf): add system config section"
```

---

### Task 12: 实现电机详细参数章节

**Files:**
- Create: `src/lib/pdf/sections/motor-details.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, MC20Motor } from '../types';

export function addMotorDetailsSection(
  doc: jsPDF,
  t: TranslationFunction,
  motor: MC20Motor | null
): void {
  if (!motor) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.motorDetails'), y);

  // 基本参数
  const basicParams = [
    [t('systemSummary.labels.ratedPower'), `${motor.ratedPower} W`],
    [t('systemSummary.labels.ratedSpeed'), `${motor.ratedSpeed} rpm`],
    [t('systemSummary.labels.ratedTorque'), `${motor.ratedTorque} N·m`],
    [t('systemSummary.labels.peakTorque'), `${motor.peakTorque} N·m`],
    [t('systemSummary.labels.maxSpeed'), `${motor.maxSpeed} rpm`],
    [t('systemSummary.labels.ratedCurrent'), `${motor.ratedCurrent} A`],
    [t('systemSummary.labels.rotorInertia'), `${motor.rotorInertia.toExponential(5)} kg·m²`],
    [t('systemSummary.labels.torqueConstant'), `${motor.torqueConstant} N·m/A`],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: basicParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 15, right: 0, top: 5, bottom: 5 },
  });

  // 选项参数
  const optionParams = [
    [
      t('systemSummary.labels.encoderType'),
      motor.options.encoder.type === 'BATTERY_MULTI_TURN'
        ? t('systemSummary.options.batteryMultiTurn')
        : t('systemSummary.options.mechanicalMultiTurn'),
    ],
    [
      t('systemSummary.labels.brake'),
      motor.options.brake.hasBrake ? t('systemSummary.options.yes') : t('systemSummary.options.no'),
    ],
    [
      t('systemSummary.labels.shaftType'),
      motor.options.keyShaft.hasKey
        ? t('systemSummary.options.keyShaft')
        : t('systemSummary.options.smoothShaft'),
    ],
    [t('systemSummary.labels.protection'), motor.options.protection.level],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: optionParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 105, right: 15, top: 5, bottom: 5 },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/motor-details.ts
git commit -m "feat(pdf): add motor details section"
```

---

### Task 13: 实现驱动器详细参数章节

**Files:**
- Create: `src/lib/pdf/sections/drive-details.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jsppdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, XC20Drive } from '../types';

export function addDriveDetailsSection(
  doc: jsPDF,
  t: TranslationFunction,
  drive: XC20Drive | null
): void {
  if (!drive) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.driveDetails'), y);

  // 基本参数
  const basicParams = [
    [t('systemSummary.labels.maxCurrent'), `${drive.maxCurrent} A`],
    [t('systemSummary.labels.ratedCurrent'), `${drive.ratedCurrent} A`],
    [t('systemSummary.labels.overloadCapacity'), `${drive.overloadCapacity} ×`],
    [t('systemSummary.labels.pwmFrequency'), `${drive.ratedPwmFrequency} kHz`],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: basicParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 15, right: 0, top: 5, bottom: 5 },
  });

  // 选项参数
  const optionParams = [
    [
      t('systemSummary.labels.communication'),
      drive.communication.type === 'ETHERCAT'
        ? t('systemSummary.options.ethercat')
        : drive.communication.type === 'PROFINET'
          ? t('systemSummary.options.profinet')
          : t('systemSummary.options.ethernetIp'),
    ],
    [
      t('systemSummary.labels.panel'),
      drive.options.panel.code === '01B'
        ? t('systemSummary.options.withDisplay')
        : t('systemSummary.options.withoutDisplay'),
    ],
    [
      t('systemSummary.labels.safety'),
      drive.options.safety.code === 'ST' ? t('systemSummary.options.sto') : t('systemSummary.options.none'),
    ],
    [
      t('systemSummary.labels.cooling'),
      drive.hasFan ? t('systemSummary.options.fan') : t('systemSummary.options.natural'),
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: optionParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 105, right: 15, top: 5, bottom: 5 },
  });

  // 制动能力
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y += 5;

  const brakingParams = [
    [t('systemSummary.labels.internalResistance'), `${drive.braking.internalResistance} Ω`],
    [t('systemSummary.labels.continuousPower'), `${drive.braking.continuousPower} W`],
    [t('systemSummary.labels.peakPower'), `${drive.braking.peakPower} W`],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: brakingParams,
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    tableWidth: 90,
    margin: { left: 15, right: 0, top: 5, bottom: 5 },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/drive-details.ts
git commit -m "feat(pdf): add drive details section"
```

---

### Task 14: 实现电缆规格章节

**Files:**
- Create: `src/lib/pdf/sections/cable-specs.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportCableConfig } from '../types';

export function addCableSpecsSection(
  doc: jsPDF,
  t: TranslationFunction,
  cables: ReportCableConfig
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.cableSpecs'), y);

  const tableData = [
    [
      t('systemSummary.labels.motorCable'),
      cables.motor.partNumber,
      cables.motor.spec,
      typeof cables.motor.length === 'number'
        ? `${cables.motor.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ],
    [
      t('systemSummary.labels.encoderCable'),
      cables.encoder.partNumber,
      cables.encoder.spec,
      typeof cables.encoder.length === 'number'
        ? `${cables.encoder.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ],
  ];

  if (cables.communication) {
    tableData.push([
      t('systemSummary.labels.commCable'),
      cables.communication.partNumber,
      '-',
      typeof cables.communication.length === 'number'
        ? `${cables.communication.length} ${t('systemSummary.cable.lengthUnit')}`
        : t('systemSummary.cable.terminalOnly'),
    ]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.type'),
        t('systemSummary.columns.partNumber'),
        t('systemSummary.cable.spec'),
        t('systemSummary.cable.length'),
      ],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 55, font: 'courier' },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' },
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/cable-specs.ts
git commit -m "feat(pdf): add cable specs section"
```

---

### Task 15: 实现配件信息章节

**Files:**
- Create: `src/lib/pdf/sections/accessories.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportAccessories } from '../types';

export function addAccessoriesSection(
  doc: jsPDF,
  t: TranslationFunction,
  accessories: ReportAccessories
): void {
  // 如果没有配件，跳过此章节
  if (!accessories.emcFilter && !accessories.brakeResistor) {
    return;
  }

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.accessories'), y);

  const tableData: string[][] = [];

  if (accessories.emcFilter) {
    tableData.push([
      t('systemSummary.labels.emcFilter'),
      accessories.emcFilter,
      'EMC Filter',
    ]);
  }

  if (accessories.brakeResistor) {
    tableData.push([
      t('systemSummary.labels.brakeResistor'),
      accessories.brakeResistor.partNumber,
      accessories.brakeResistor.model,
    ]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    head: [
      [
        t('systemSummary.columns.type'),
        t('systemSummary.columns.partNumber'),
        t('systemSummary.columns.description'),
      ],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 55, font: 'courier' },
      2: { cellWidth: 'auto' },
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/accessories.ts
git commit -m "feat(pdf): add accessories section"
```

---

### Task 16: 实现制动能量分析章节

**Files:**
- Create: `src/lib/pdf/sections/regeneration.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle, colors } from '../styles';
import type { TranslationFunction, MechanicalResult } from '../types';

export function addRegenerationSection(
  doc: jsPDF,
  t: TranslationFunction,
  regeneration: MechanicalResult['regeneration']
): void {
  if (!regeneration) return;

  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('systemSummary.regeneration'), y);

  const tableData = [
    [
      t('systemSummary.labels.energyPerCycle'),
      `${regeneration.energyPerCycle.toFixed(1)} J`,
      t('systemSummary.labels.brakingPower'),
      `${regeneration.brakingPower.toFixed(1)} W`,
    ],
    [
      t('systemSummary.labels.externalResistorRequired'),
      regeneration.requiresExternalResistor ? t('systemSummary.options.yes') : t('systemSummary.options.no'),
      t('systemSummary.labels.recommendedResistorPower'),
      regeneration.recommendedResistor
        ? `${regeneration.recommendedResistor.minPower.toFixed(0)} W`
        : '-',
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
    },
  });

  // 警告信息
  if (regeneration.warning) {
    y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
    y += 5;

    doc.setFillColor(255, 250, 230);
    doc.setDrawColor(255, 200, 100);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, 180, 12, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(...colors.secondary);
    doc.text(`⚠️ ${regeneration.warning}`, 20, y + 7);
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/regeneration.ts
git commit -m "feat(pdf): add regeneration section"
```

---

### Task 17: 实现详细计算过程章节

**Files:**
- Create: `src/lib/pdf/sections/detailed-calculations.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle, addSubsectionTitle } from '../styles';
import type { TranslationFunction, SizingInput, MechanicalResult } from '../types';
import { extractCalculationDetails } from '@/lib/calculations/calculation-details';

export function addDetailedCalculationsSection(
  doc: jsPDF,
  t: TranslationFunction,
  input: Partial<SizingInput>,
  mechanical: MechanicalResult
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('detailedCalculations.title'), y);

  const details = extractCalculationDetails(input, mechanical);

  // 1. 机械参数
  y = addSubsectionTitle(doc, t('detailedCalculations.mechanism'), y);
  const mechanismData = [
    [t('detailedCalculations.labels.loadType'), details.mechanism.typeLabel],
    ...details.mechanism.params.map((p) => [
      p.label,
      p.unit ? `${p.value} ${t(`detailedCalculations.units.${p.unit}`)}` : String(p.value),
    ]),
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: mechanismData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 2. 惯量计算
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.inertia'), y + 5);

  const inertiaData = [
    [
      t('detailedCalculations.labels.loadInertia'),
      `${details.inertia.loadInertia.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ],
    ...(details.inertia.components?.map((c) => [
      c.name,
      `${c.value.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ]) || []),
    [
      t('detailedCalculations.labels.totalInertia'),
      `${details.inertia.totalInertia.toExponential(4)} ${t('detailedCalculations.units.kgm2')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: inertiaData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 3. 扭矩分析
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.torques'), y + 5);

  const torqueData = [
    [
      t('detailedCalculations.labels.accelTorque'),
      `${details.torques.accel.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.constantTorque'),
      `${details.torques.constant.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.decelTorque'),
      `${details.torques.decel.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.peakTorque'),
      `${details.torques.peak.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
    [
      t('detailedCalculations.labels.rmsTorque'),
      `${details.torques.rms.toFixed(2)} ${t('detailedCalculations.units.nm')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: torqueData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 4. 运动参数
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.motion'), y + 5);

  const motionData = [
    [
      t('detailedCalculations.labels.maxSpeed'),
      `${details.motion.maxSpeed.toFixed(0)} ${t('detailedCalculations.units.rpm')}`,
    ],
    [
      t('detailedCalculations.labels.accelTime'),
      `${details.motion.accelTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.constantTime'),
      `${details.motion.constantTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.decelTime'),
      `${details.motion.decelTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.dwellTime'),
      `${details.motion.dwellTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.cycleTime'),
      `${details.motion.cycleTime.toFixed(3)} ${t('detailedCalculations.units.s')}`,
    ],
    [
      t('detailedCalculations.labels.cyclesPerMinute'),
      `${details.motion.cyclesPerMinute.toFixed(1)} ${t('detailedCalculations.units.cpm')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: motionData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // 5. 功率与能量
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
  y = addSubsectionTitle(doc, t('detailedCalculations.power'), y + 5);

  const powerData = [
    [
      t('detailedCalculations.labels.peakPower'),
      `${details.power.peak.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
    [
      t('detailedCalculations.labels.continuousPower'),
      `${details.power.continuous.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
    [
      t('detailedCalculations.labels.energyPerCycle'),
      `${details.regeneration.energyPerCycle.toFixed(1)} ${t('detailedCalculations.units.j')}`,
    ],
    [
      t('detailedCalculations.labels.brakingPower'),
      `${details.regeneration.brakingPower.toFixed(1)} ${t('detailedCalculations.units.w')}`,
    ],
  ];

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: powerData,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/sections/detailed-calculations.ts
git commit -m "feat(pdf): add detailed calculations section"
```

---

### Task 18: 创建 PDF 生成器主类

**Files:**
- Create: `src/lib/pdf/generator.ts`

**Step 1: 写入代码**

```typescript
import jsPDF from 'jspdf';
import { pageConfig } from './styles';
import type { ReportData, TranslationFunction } from './types';

// Import sections
import { addReportHeader } from './sections/header';
import { addProjectInfoSection } from './sections/project-info';
import { addCalculationSummarySection } from './sections/calculation-summary';
import { addSystemConfigSection } from './sections/system-config';
import { addMotorDetailsSection } from './sections/motor-details';
import { addDriveDetailsSection } from './sections/drive-details';
import { addCableSpecsSection } from './sections/cable-specs';
import { addAccessoriesSection } from './sections/accessories';
import { addRegenerationSection } from './sections/regeneration';
import { addDetailedCalculationsSection } from './sections/detailed-calculations';

export class SizingReportPDFGenerator {
  private doc: jsPDF;
  private t: TranslationFunction;

  constructor(locale: string, translations: Record<string, string>) {
    this.doc = new jsPDF(pageConfig);
    this.t = (key: string) => translations[key] || key;
  }

  generate(data: ReportData): jsPDF {
    // 报告标题
    addReportHeader(
      this.doc,
      this.t,
      data.project.name,
      data.project.date
    );

    // 项目信息
    addProjectInfoSection(this.doc, this.t, data.project);

    // 计算摘要
    addCalculationSummarySection(this.doc, this.t, data.calculations);

    // 系统配置清单
    addSystemConfigSection(this.doc, this.t, data.systemConfig.items);

    // 电机详细参数
    addMotorDetailsSection(this.doc, this.t, data.systemConfig.motor);

    // 驱动器详细参数
    addDriveDetailsSection(this.doc, this.t, data.systemConfig.drive);

    // 电缆规格
    addCableSpecsSection(this.doc, this.t, data.systemConfig.cables);

    // 配件信息
    addAccessoriesSection(this.doc, this.t, data.systemConfig.accessories);

    // 制动能量分析
    if (data.regeneration) {
      addRegenerationSection(this.doc, this.t, data.regeneration);
    }

    // 详细计算过程
    addDetailedCalculationsSection(
      this.doc,
      this.t,
      data.detailedCalculations.input,
      data.detailedCalculations.mechanical
    );

    return this.doc;
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/pdf/generator.ts
git commit -m "feat(pdf): add main PDF generator class"
```

---

### Task 19: 创建 PDF 导出入口

**Files:**
- Create: `src/lib/pdf/index.ts`

**Step 1: 写入代码**

```typescript
export { SizingReportPDFGenerator } from './generator';
export type { ReportData, TranslationFunction } from './types';
export { generateFileName } from './utils';
```

**Step 2: Commit**

```bash
git add src/lib/pdf/index.ts
git commit -m "feat(pdf): add PDF module entry point"
```

---

## Phase 4: 集成与测试

### Task 20: 添加 PDF 相关 i18n 键值

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

**Step 1: 更新 zh.json**

在根级别添加 `pdf` 命名空间：

```json
{
  "pdf": {
    "reportTitle": "伺服系统选型报告",
    "project": "项目",
    "generatedAt": "生成时间",
    "sections": {
      "projectInfo": "项目信息",
      "calculationSummary": "计算摘要"
    },
    "projectInfo": {
      "item": "项目",
      "value": "值",
      "name": "项目名称",
      "customer": "客户名称",
      "salesPerson": "销售人员",
      "date": "日期",
      "notes": "备注"
    }
  }
}
```

**Step 2: 更新 en.json**

```json
{
  "pdf": {
    "reportTitle": "Servo System Sizing Report",
    "project": "Project",
    "generatedAt": "Generated At",
    "sections": {
      "projectInfo": "Project Information",
      "calculationSummary": "Calculation Summary"
    },
    "projectInfo": {
      "item": "Item",
      "value": "Value",
      "name": "Project Name",
      "customer": "Customer",
      "salesPerson": "Sales Person",
      "date": "Date",
      "notes": "Notes"
    }
  }
}
```

**Step 3: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "i18n: add PDF-related translations"
```

---

### Task 21: 创建 PDF 导出按钮组件

**Files:**
- Create: `src/components/wizard/PdfExportButton.tsx`

**Step 1: 写入代码**

```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SizingReportPDFGenerator, generateFileName } from '@/lib/pdf';
import type { ReportData } from '@/lib/pdf/types';

interface PdfExportButtonProps {
  data: ReportData;
  disabled?: boolean;
}

export function PdfExportButton({ data, disabled }: PdfExportButtonProps) {
  const t = useTranslations();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      // 收集所有需要的翻译
      const translations: Record<string, string> = {};

      // 这里简化处理，实际应该收集所有用到的键值
      // 更好的做法是在调用处传入已收集的翻译

      const generator = new SizingReportPDFGenerator('zh', translations);
      const doc = generator.generate(data);

      const fileName = generateFileName(data.project.name);
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(t('result.pdfExportError') || 'PDF 导出失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isGenerating}
      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⏳</span>
          {t('result.generatingPdf') || '生成中...'}
        </>
      ) : (
        <>
          <span>📄</span>
          {t('result.exportPdf')}
        </>
      )}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/wizard/PdfExportButton.tsx
git commit -m "feat(pdf): add PDF export button component"
```

---

### Task 22: 更新 ResultStep 集成 PDF 导出

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 导入 PdfExportButton 和相关类型**

```typescript
import { PdfExportButton } from '../PdfExportButton';
import type { ReportData } from '@/lib/pdf/types';
```

**Step 2: 重构 handleExport 函数为数据准备函数**

替换现有的 `handleExport` 函数：

```typescript
const prepareReportData = (): ReportData | null => {
  if (!config || !result) return null;

  const motor = findMotor(config.motor.partNumber);
  const drive = findDrive(config.drive.partNumber);

  return {
    project: {
      name: input.project?.name || '-',
      customer: input.project?.customer || '-',
      salesPerson: input.project?.salesPerson,
      date: new Date().toLocaleDateString(),
      notes: input.project?.notes,
    },
    calculations: {
      loadInertia: result.mechanical.loadInertia.toExponential(3),
      rmsTorque: result.mechanical.torques.rms.toFixed(2),
      peakTorque: result.mechanical.torques.peak.toFixed(2),
      maxSpeed: result.mechanical.speeds.max.toFixed(0),
      regenPower: result.mechanical.regeneration.brakingPower.toFixed(1),
      calcTime: result.metadata.calculationTime.toFixed(1),
    },
    systemConfig: {
      items: buildSummaryItems(config),
      motor,
      drive,
      cables: {
        motor: {
          partNumber: config.cables.motor.partNumber,
          spec: config.cables.motor.spec,
          length: config.cables.motor.length,
        },
        encoder: {
          partNumber: config.cables.encoder.partNumber,
          spec: config.cables.encoder.spec,
          length: config.cables.encoder.length,
        },
        ...(config.cables.communication && {
          communication: {
            partNumber: config.cables.communication.partNumber,
            length: config.cables.communication.length,
          },
        }),
      },
      accessories: {
        ...(config.accessories.emcFilter && {
          emcFilter: config.accessories.emcFilter,
        }),
        ...(config.accessories.brakeResistor && {
          brakeResistor: config.accessories.brakeResistor,
        }),
      },
    },
    regeneration: result.mechanical.regeneration,
    detailedCalculations: {
      input,
      mechanical: result.mechanical,
    },
  };
};
```

**Step 3: 替换导出按钮**

找到导出按钮的代码：

```typescript
<button
  onClick={handleExport}
  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
>
  {t('exportPdf')}
</button>
```

替换为：

```typescript
<PdfExportButton data={prepareReportData()!} disabled={!config} />
```

**Step 4: 删除旧的 handleExport 函数**

删除原有的 `handleExport` 函数。

**Step 5: 运行测试**

```bash
npm run test
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat(pdf): integrate PDF export into ResultStep"
```

---

### Task 23: 修复 TypeScript 类型和导入问题

**Files:**
- Modify: `src/lib/pdf/sections/motor-details.ts`
- Modify: `src/lib/pdf/sections/drive-details.ts`
- Modify: `src/lib/pdf/sections/detailed-calculations.ts`

**Step 1: 修复类型导入**

确保所有类型从正确的位置导入：

```typescript
// 从 @/types 导入原始类型
import type { MC20Motor, XC20Drive, SizingInput, MechanicalResult } from '@/types';

// 从 ../types 导入报告类型
import type { TranslationFunction } from '../types';
```

**Step 2: 修复 utils.ts 中的类型导出**

```typescript
// src/lib/pdf/utils.ts
import type jsPDF from 'jspdf';
```

**Step 3: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "fix(pdf): resolve TypeScript type issues"
```

---

### Task 24: 添加翻译收集工具

**Files:**
- Modify: `src/components/wizard/PdfExportButton.tsx`

**Step 1: 更新组件以正确使用翻译**

由于 PDF 生成在客户端，需要收集所有翻译键值。更新组件：

```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SizingReportPDFGenerator, generateFileName } from '@/lib/pdf';
import type { ReportData } from '@/lib/pdf/types';

interface PdfExportButtonProps {
  data: ReportData | null;
  disabled?: boolean;
}

// 收集所有 PDF 需要的翻译键
const PDF_TRANSLATION_KEYS = [
  // PDF 通用
  'pdf.reportTitle',
  'pdf.project',
  'pdf.generatedAt',
  'pdf.sections.projectInfo',
  'pdf.sections.calculationSummary',
  'pdf.projectInfo.item',
  'pdf.projectInfo.value',
  'pdf.projectInfo.name',
  'pdf.projectInfo.customer',
  'pdf.projectInfo.salesPerson',
  'pdf.projectInfo.date',
  'pdf.projectInfo.notes',

  // Result
  'result.loadInertia',
  'result.rmsTorque',
  'result.peakTorque',
  'result.maxSpeed',
  'result.regenPower',
  'result.calcTime',

  // SystemSummary
  'systemSummary.configList',
  'systemSummary.motorDetails',
  'systemSummary.driveDetails',
  'systemSummary.cableSpecs',
  'systemSummary.accessories',
  'systemSummary.regeneration',
  'systemSummary.columns.partNumber',
  'systemSummary.columns.type',
  'systemSummary.columns.description',
  'systemSummary.labels.ratedPower',
  'systemSummary.labels.ratedSpeed',
  'systemSummary.labels.ratedTorque',
  'systemSummary.labels.peakTorque',
  'systemSummary.labels.maxSpeed',
  'systemSummary.labels.ratedCurrent',
  'systemSummary.labels.rotorInertia',
  'systemSummary.labels.torqueConstant',
  'systemSummary.labels.encoderType',
  'systemSummary.labels.brake',
  'systemSummary.labels.shaftType',
  'systemSummary.labels.protection',
  'systemSummary.labels.maxCurrent',
  'systemSummary.labels.overloadCapacity',
  'systemSummary.labels.pwmFrequency',
  'systemSummary.labels.communication',
  'systemSummary.labels.panel',
  'systemSummary.labels.safety',
  'systemSummary.labels.cooling',
  'systemSummary.labels.internalResistance',
  'systemSummary.labels.continuousPower',
  'systemSummary.labels.peakPower',
  'systemSummary.labels.motorCable',
  'systemSummary.labels.encoderCable',
  'systemSummary.labels.commCable',
  'systemSummary.labels.brakeResistor',
  'systemSummary.labels.emcFilter',
  'systemSummary.labels.energyPerCycle',
  'systemSummary.labels.brakingPower',
  'systemSummary.labels.externalResistorRequired',
  'systemSummary.labels.recommendedResistorPower',
  'systemSummary.options.batteryMultiTurn',
  'systemSummary.options.mechanicalMultiTurn',
  'systemSummary.options.typeA',
  'systemSummary.options.typeB',
  'systemSummary.options.yes',
  'systemSummary.options.no',
  'systemSummary.options.keyShaft',
  'systemSummary.options.smoothShaft',
  'systemSummary.options.withDisplay',
  'systemSummary.options.withoutDisplay',
  'systemSummary.options.sto',
  'systemSummary.options.none',
  'systemSummary.options.fan',
  'systemSummary.options.natural',
  'systemSummary.options.ethercat',
  'systemSummary.options.profinet',
  'systemSummary.options.ethernetIp',
  'systemSummary.cable.spec',
  'systemSummary.cable.length',
  'systemSummary.cable.lengthUnit',
  'systemSummary.cable.terminalOnly',

  // DetailedCalculations
  'detailedCalculations.title',
  'detailedCalculations.mechanism',
  'detailedCalculations.inertia',
  'detailedCalculations.torques',
  'detailedCalculations.motion',
  'detailedCalculations.power',
  'detailedCalculations.labels.loadType',
  'detailedCalculations.labels.loadInertia',
  'detailedCalculations.labels.totalInertia',
  'detailedCalculations.labels.accelTorque',
  'detailedCalculations.labels.constantTorque',
  'detailedCalculations.labels.decelTorque',
  'detailedCalculations.labels.peakTorque',
  'detailedCalculations.labels.rmsTorque',
  'detailedCalculations.labels.maxSpeed',
  'detailedCalculations.labels.accelTime',
  'detailedCalculations.labels.constantTime',
  'detailedCalculations.labels.decelTime',
  'detailedCalculations.labels.dwellTime',
  'detailedCalculations.labels.cycleTime',
  'detailedCalculations.labels.cyclesPerMinute',
  'detailedCalculations.labels.peakPower',
  'detailedCalculations.labels.continuousPower',
  'detailedCalculations.labels.energyPerCycle',
  'detailedCalculations.labels.brakingPower',
  'detailedCalculations.units.kgm2',
  'detailedCalculations.units.nm',
  'detailedCalculations.units.rpm',
  'detailedCalculations.units.s',
  'detailedCalculations.units.cpm',
  'detailedCalculations.units.w',
  'detailedCalculations.units.j',
];

export function PdfExportButton({ data, disabled }: PdfExportButtonProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (isGenerating || !data) return;

    setIsGenerating(true);
    try {
      // 收集所有翻译
      const translations: Record<string, string> = {};
      PDF_TRANSLATION_KEYS.forEach((key) => {
        translations[key] = t(key);
      });

      const generator = new SizingReportPDFGenerator(locale, translations);
      const doc = generator.generate(data);

      const fileName = generateFileName(data.project.name);
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(t('result.pdfExportError') || 'PDF export failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isGenerating || !data}
      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⏳</span>
          {t('result.generatingPdf') || 'Generating...'}
        </>
      ) : (
        <>
          <span>📄</span>
          {t('result.exportPdf')}
        </>
      )}
    </button>
  );
}
```

**Step 2: 添加缺失的 i18n 键值**

更新 `src/i18n/messages/zh.json` 和 `en.json`：

```json
{
  "result": {
    "pdfExportError": "PDF 导出失败，请重试",
    "generatingPdf": "生成中..."
  }
}
```

**Step 3: Commit**

```bash
git add src/components/wizard/PdfExportButton.tsx src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "feat(pdf): add translation collection for PDF generation"
```

---

### Task 25: 运行完整测试

**Step 1: 运行单元测试**

```bash
npm run test
```

Expected: PASS

**Step 2: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: 运行构建测试**

```bash
npm run build
```

Expected: Build successful

**Step 4: Commit**

```bash
git add -A
git commit -m "test(pdf): verify all tests pass"
```

---

### Task 26: 手动测试 PDF 导出

**Step 1: 启动开发服务器**

```bash
npm run dev
```

**Step 2: 完成选型流程测试**

1. 访问 http://localhost:3000
2. 填写项目信息
3. 选择机械参数（滚珠丝杠）
4. 设置运动参数
5. 配置系统
6. 查看结果页
7. 点击"导出 PDF"
8. 验证 PDF 内容完整

**Step 3: 测试中英文切换**

1. 切换语言到英文
2. 重新导出 PDF
3. 验证 PDF 内容为英文

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(pdf): complete PDF export feature implementation"
```

---

## 验收清单

- [ ] i18n: zh.json 添加 systemSummary 和 pdf 命名空间
- [ ] i18n: en.json 添加 systemSummary 和 pdf 命名空间
- [ ] i18n: SystemSummary.tsx 使用 useTranslations
- [ ] deps: 安装 jspdf-autotable
- [ ] types: 创建 PDF 类型定义
- [ ] styles: 创建 PDF 样式定义
- [ ] utils: 创建 PDF 工具函数
- [ ] section: 实现 header.ts
- [ ] section: 实现 project-info.ts
- [ ] section: 实现 calculation-summary.ts
- [ ] section: 实现 system-config.ts
- [ ] section: 实现 motor-details.ts
- [ ] section: 实现 drive-details.ts
- [ ] section: 实现 cable-specs.ts
- [ ] section: 实现 accessories.ts
- [ ] section: 实现 regeneration.ts
- [ ] section: 实现 detailed-calculations.ts
- [ ] generator: 实现主生成器类
- [ ] export: 创建 index.ts 入口
- [ ] component: 创建 PdfExportButton.tsx
- [ ] integration: 更新 ResultStep.tsx
- [ ] test: 所有单元测试通过
- [ ] build: TypeScript 编译无错误
- [ ] build: Next.js 构建成功
- [ ] manual: 中英文 PDF 导出正常

---

## 参考文档

- 设计文档: `docs/plans/2026-03-01-pdf-export-design.md`
- jspdf-autotable: https://github.com/simonbengtsson/jsPDF-AutoTable
- next-intl: https://next-intl-docs.vercel.app/
