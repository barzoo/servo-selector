# Excel 项目导出 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现项目数据导出为 Excel 文件功能，方便销售团队使用

**Architecture:** 使用 SheetJS (xlsx) 库在浏览器端生成 Excel 文件，创建 ExcelExportButton 组件处理导出逻辑，数据转换层将 Project/Axis 结构转换为表格格式

**Tech Stack:** React, TypeScript, SheetJS (xlsx), TailwindCSS

---

## Task 1: Install SheetJS Library

**Files:**
- Modify: `package.json` (indirectly via npm install)

**Step 1: Install xlsx package**

Run: `npm install xlsx`

Expected: Package installed successfully, package.json updated

**Step 2: Verify installation**

Run: `npm ls xlsx`

Expected: Shows xlsx version installed

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add SheetJS (xlsx) for Excel export

- Install xlsx library for client-side Excel generation
- Supports .xlsx format with styling options"
```

---

## Task 2: Create Excel Export Utility Functions

**Files:**
- Create: `src/lib/excel-export.ts`

**Step 1: Create the utility file with data transformation functions**

```typescript
/**
 * Excel 导出工具函数
 * 将项目数据转换为 Excel 格式
 */

import type { Project, AxisConfig } from '@/types';
import * as XLSX from 'xlsx';

interface ExcelRow {
  '轴名称': string;
  '传动类型': string;
  '负载质量(kg)': string;
  '电机型号': string;
  '驱动器型号': string;
  '电机电缆': string;
  '编码器电缆': string;
  '通讯电缆': string;
  '制动电阻': string;
  '状态': string;
}

/**
 * 获取传动类型中文名称
 */
function getMechanismTypeName(type?: string): string {
  const typeMap: Record<string, string> = {
    'BALL_SCREW': '滚珠丝杠',
    'GEARBOX': '齿轮箱',
    'DIRECT_DRIVE': '直驱',
    'BELT': '皮带',
    'RACK_PINION': '齿条齿轮',
  };
  return type ? typeMap[type] || type : '-';
}

/**
 * 从轴配置中获取负载质量
 */
function getLoadMass(axis: AxisConfig): string {
  const mechanism = axis.input?.mechanism;
  if (!mechanism?.params) return '-';

  const params = mechanism.params as { loadMass?: number };
  return params.loadMass?.toString() || '-';
}

/**
 * 获取电缆长度显示文本
 */
function getCableLength(length: number | string | undefined): string {
  if (length === undefined || length === null) return '-';
  if (typeof length === 'string') return length === 'TERMINAL_ONLY' ? '端子台' : length;
  return `${length}m`;
}

/**
 * 获取电机电缆信息
 */
function getMotorCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.motorCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 获取编码器电缆信息
 */
function getEncoderCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.encoderCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 获取通讯电缆信息
 */
function getCommCable(axis: AxisConfig): string {
  const cable = axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.commCable;
  if (!cable) return '-';
  return getCableLength(cable.length);
}

/**
 * 检查是否有制动电阻
 */
function hasBrakeResistor(axis: AxisConfig): boolean {
  return !!axis.result?.motorRecommendations[0]?.systemConfig?.accessories?.brakeResistor;
}

/**
 * 将轴数据转换为 Excel 行
 */
function axisToExcelRow(axis: AxisConfig): ExcelRow {
  const recommendation = axis.result?.motorRecommendations[0];
  const motor = recommendation?.motor;
  const drive = recommendation?.systemConfig?.drive;

  return {
    '轴名称': axis.name,
    '传动类型': getMechanismTypeName(axis.input?.mechanism?.type),
    '负载质量(kg)': getLoadMass(axis),
    '电机型号': motor?.model || '-',
    '驱动器型号': drive?.model || '-',
    '电机电缆': getMotorCable(axis),
    '编码器电缆': getEncoderCable(axis),
    '通讯电缆': getCommCable(axis),
    '制动电阻': hasBrakeResistor(axis) ? '有' : '-',
    '状态': axis.status === 'COMPLETED' ? '已完成' : '配置中',
  };
}

/**
 * 生成 BOM 汇总数据
 */
function generateBomData(axes: AxisConfig[]): Array<{
  '序号': number;
  '物料号': string;
  '描述': string;
  '数量': number;
  '使用轴': string;
}> {
  const bomMap = new Map<string, { description: string; quantity: number; usedIn: string[] }>();

  axes.forEach((axis) => {
    if (axis.status !== 'COMPLETED') return;

    const recommendation = axis.result?.motorRecommendations[0];
    if (!recommendation) return;

    // 电机
    const motorPn = recommendation.motor?.model;
    if (motorPn) {
      const existing = bomMap.get(motorPn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(motorPn, {
          description: recommendation.motor?.baseModel || '伺服电机',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }

    // 驱动器
    const drivePn = recommendation.systemConfig?.drive?.model;
    if (drivePn) {
      const existing = bomMap.get(drivePn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(drivePn, {
          description: recommendation.systemConfig?.drive?.baseModel || '伺服驱动器',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }
  });

  return Array.from(bomMap.entries()).map(([partNumber, data], index) => ({
    '序号': index + 1,
    '物料号': partNumber,
    '描述': data.description,
    '数量': data.quantity,
    '使用轴': data.usedIn.join(', '),
  }));
}

/**
 * 生成 Excel 工作簿
 */
export function generateProjectExcel(project: Project): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. 主数据表 - 轴列表
  const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');
  const axisData = completedAxes.map(axisToExcelRow);

  const ws = XLSX.utils.json_to_sheet(axisData);

  // 设置列宽
  const colWidths = [
    { wch: 12 },  // 轴名称
    { wch: 12 },  // 传动类型
    { wch: 14 },  // 负载质量
    { wch: 20 },  // 电机型号
    { wch: 20 },  // 驱动器型号
    { wch: 12 },  // 电机电缆
    { wch: 12 },  // 编码器电缆
    { wch: 12 },  // 通讯电缆
    { wch: 10 },  // 制动电阻
    { wch: 10 },  // 状态
  ];
  ws['!cols'] = colWidths;

  // 2. 添加空行
  const startRow = axisData.length + 3;

  // 3. 添加项目信息
  XLSX.utils.sheet_add_json(ws, [{ '项目信息': '' }], {
    origin: { r: startRow, c: 0 },
    skipHeader: true,
  });
  XLSX.utils.sheet_add_json(
    ws,
    [
      { '项目': '项目名称', '值': project.name || '未命名项目' },
      { '项目': '客户', '值': project.customer || '-' },
      { '项目': '销售员', '值': project.salesPerson || '-' },
      { '项目': '备注', '值': project.notes || '-' },
    ],
    { origin: { r: startRow + 1, c: 0 }, skipHeader: true }
  );

  // 4. 添加公共参数
  const paramsRow = startRow + 6;
  XLSX.utils.sheet_add_json(ws, [{ '公共参数': '' }], {
    origin: { r: paramsRow, c: 0 },
    skipHeader: true,
  });
  XLSX.utils.sheet_add_json(
    ws,
    [
      { '参数': '环境温度', '值': `${project.commonParams.ambientTemp}°C` },
      { '参数': '防护等级', '值': project.commonParams.ipRating },
      { '参数': '通讯协议', '值': project.commonParams.communication },
      { '参数': '电缆长度', '值': `${project.commonParams.cableLength}m` },
      { '参数': '安全系数', '值': String(project.commonParams.safetyFactor) },
      { '参数': '最大惯量比', '值': `${project.commonParams.maxInertiaRatio}:1` },
    ],
    { origin: { r: paramsRow + 1, c: 0 }, skipHeader: true }
  );

  // 5. 添加 BOM 汇总
  const bomRow = paramsRow + 8;
  XLSX.utils.sheet_add_json(ws, [{ '物料清单汇总': '' }], {
    origin: { r: bomRow, c: 0 },
    skipHeader: true,
  });
  const bomData = generateBomData(project.axes);
  XLSX.utils.sheet_add_json(ws, bomData, {
    origin: { r: bomRow + 1, c: 0 },
  });

  XLSX.utils.book_append_sheet(wb, ws, '选型结果');

  return wb;
}

/**
 * 导出项目为 Excel 文件
 */
export function exportProjectToExcel(project: Project): void {
  const wb = generateProjectExcel(project);

  // 生成文件名
  const dateStr = new Date().toISOString().split('T')[0];
  const projectName = project.name || '未命名项目';
  const fileName = `${projectName}_选型结果_${dateStr}.xlsx`;

  // 下载文件
  XLSX.writeFile(wb, fileName);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/excel-export.ts`

Expected: No errors (may show module resolution warnings for xlsx, which is expected)

**Step 3: Commit**

```bash
git add src/lib/excel-export.ts
git commit -m "feat: add Excel export utility functions

- Add data transformation from Project/Axis to Excel format
- Generate BOM summary from axis configurations
- Export to .xlsx with proper column widths"
```

---

## Task 3: Create ExcelExportButton Component

**Files:**
- Create: `src/components/project-data/ExcelExportButton.tsx`

**Step 1: Create the component file**

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { FileSpreadsheet } from 'lucide-react';
import { exportProjectToExcel } from '@/lib/excel-export';
import type { Project } from '@/types';

interface ExcelExportButtonProps {
  project: Project;
  disabled?: boolean;
}

export function ExcelExportButton({ project, disabled }: ExcelExportButtonProps) {
  const t = useTranslations('projectData');

  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;
  const isDisabled = disabled || completedCount === 0;

  const handleExport = () => {
    if (isDisabled) return;
    exportProjectToExcel(project);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="
        w-full px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-sm font-medium flex items-center justify-center gap-2
      "
      title={isDisabled ? t('noCompletedAxesForExport') : t('exportExcelTooltip')}
    >
      <FileSpreadsheet className="w-4 h-4" />
      <span>{t('exportExcel')}</span>
    </button>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/components/project-data/ExcelExportButton.tsx`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/project-data/ExcelExportButton.tsx
git commit -m "feat: add ExcelExportButton component

- Create button component for Excel export
- Uses FileSpreadsheet icon from lucide-react
- Disabled when no completed axes"
```

---

## Task 4: Add i18n Translations

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

**Step 1: Add Chinese translations**

Find the `projectData` section in `src/i18n/messages/zh.json` and add:

```json
{
  "projectData": {
    "exportExcel": "导出 Excel",
    "exportExcelTooltip": "导出项目数据为 Excel 文件",
    "noCompletedAxesForExport": "请完成至少一个轴的配置后再导出"
  }
}
```

**Step 2: Add English translations**

Find the `projectData` section in `src/i18n/messages/en.json` and add:

```json
{
  "projectData": {
    "exportExcel": "Export Excel",
    "exportExcelTooltip": "Export project data as Excel file",
    "noCompletedAxesForExport": "Please complete at least one axis configuration before exporting"
  }
}
```

**Step 3: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "i18n: add Excel export translations

- Add Chinese and English translations for Excel export button"
```

---

## Task 5: Integrate Excel Export Button into ProjectDataMenu

**Files:**
- Modify: `src/components/project-data/ProjectDataMenu.tsx`

**Step 1: Import the ExcelExportButton component**

Add import at the top of the file:

```typescript
import { ExcelExportButton } from './ExcelExportButton';
```

**Step 2: Find the PDF export button location**

Locate where `ProjectPdfExport` or PDF export button is rendered.

**Step 3: Add Excel export button next to PDF button**

If PDF button is in a flex container, add Excel button beside it:

```tsx
<div className="flex gap-2">
  <ProjectPdfExport project={project} />
  <ExcelExportButton project={project} />
</div>
```

Or if they are stacked, add Excel button after PDF:

```tsx
<ProjectPdfExport project={project} />
<ExcelExportButton project={project} />
```

**Step 4: Verify the integration**

Run: `npx tsc --noEmit src/components/project-data/ProjectDataMenu.tsx`

Expected: No errors

**Step 5: Commit**

```bash
git add src/components/project-data/ProjectDataMenu.tsx
git commit -m "feat: integrate Excel export button into ProjectDataMenu

- Add ExcelExportButton next to PDF export button
- Both buttons share the same project data"
```

---

## Task 6: Run Type Check and Build

**Files:**
- All modified files

**Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`

Expected: No type errors in new files

**Step 2: Run build**

Run: `npm run build`

Expected: Build succeeds

**Step 3: Commit**

```bash
git commit -m "chore: verify type check and build pass

- All TypeScript types compile without errors
- Build completes successfully"
```

---

## Task 7: Manual Testing Checklist

**Files:**
- `src/components/project-data/ProjectDataMenu.tsx`

**Step 1: Start development server**

Run: `npm run dev`

**Step 2: Manual test scenarios**

1. Open the application
2. Create a project with at least 2 axes
3. Complete configuration for at least 1 axis
4. Open ProjectDataMenu
5. Verify Excel export button is visible and enabled
6. Click Excel export button
7. Verify Excel file downloads with correct name format
8. Open Excel file and verify:
   - 轴列表表格正确显示
   - 项目信息正确显示
   - 公共参数正确显示
   - BOM 汇总正确显示
9. Test with no completed axes - button should be disabled

**Step 3: Commit (if any fixes needed)**

If no fixes needed, skip this step.

---

## Summary

This implementation plan covers:

1. **SheetJS Installation**: Add xlsx library for Excel generation
2. **Excel Export Utilities**: Data transformation and Excel generation logic
3. **ExcelExportButton Component**: Reusable button component
4. **i18n Support**: Chinese and English translations
5. **Menu Integration**: Add button to ProjectDataMenu
6. **Testing**: Type check, build, and manual verification

The Excel export will provide sales teams with a convenient way to view and share project data in a familiar spreadsheet format.
