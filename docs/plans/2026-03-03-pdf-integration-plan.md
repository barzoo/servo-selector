# PDF整合功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将单轴PDF和多轴PDF整合为一个统一的多轴PDF导出功能，采用"总分总"架构展示项目信息和所有轴的配置

**Architecture:** 扩展 MultiAxisPrintView 组件，添加分页逻辑（page-break-after）使每个轴单独一页，复用 PrintReportView 的轴详情展示逻辑提取为可复用组件，删除冗余的 PrintReportView

**Tech Stack:** React, TypeScript, TailwindCSS, react-to-print, next-intl

---

## 前置条件

- 项目使用 Next.js + TypeScript + TailwindCSS
- 已安装 react-to-print 用于PDF打印
- 已存在 MultiAxisPrintView.tsx 和 PrintReportView.tsx
- 类型定义位于 src/types/index.ts

---

## Task 1: 提取轴详情展示为可复用组件

**Files:**
- Create: `src/components/wizard/AxisDetailSection.tsx`
- Reference: `src/components/wizard/PrintReportView.tsx`（复制其中的轴详情展示逻辑）

**Step 1: 创建 AxisDetailSection 组件**

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AxisConfig } from '@/types';

interface AxisDetailSectionProps {
  axis: AxisConfig;
  axisIndex: number;
}

export function AxisDetailSection({ axis, axisIndex }: AxisDetailSectionProps) {
  const t = useTranslations();
  const result = axis.result;
  const recommendation = result?.motorRecommendations[0];
  const systemConfig = recommendation?.systemConfig;

  if (!result || !recommendation) {
    return null;
  }

  return (
    <div className="axis-detail-page">
      {/* 轴标题 */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          轴 {axisIndex + 1}: {axis.name}
        </h2>
        {axis.completedAt && (
          <p className="text-sm text-gray-500 mt-1">
            完成时间: {new Date(axis.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* 计算摘要 */}
      <Section title={t('pdf.sections.calculationSummary')}>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 grid grid-cols-1 gap-2">
            <CompactRow label={t('result.loadInertia')} value={`${result.mechanical.loadInertia.toExponential(3)} kg·m²`} />
            <CompactRow label={t('result.rmsTorque')} value={`${result.mechanical.torques.rms.toFixed(2)} N·m`} />
            <CompactRow label={t('result.peakTorque')} value={`${result.mechanical.torques.peak.toFixed(2)} N·m`} />
            <CompactRow label={t('result.maxSpeed')} value={`${result.mechanical.speeds.max.toFixed(0)} rpm`} />
          </div>
        </div>
      </Section>

      {/* 系统配置清单 */}
      <Section title={t('systemSummary.configList')}>
        <div className="space-y-4">
          {systemConfig && (
            <>
              {/* 电机 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  {t('systemSummary.motorDetails')}
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                    <span className="ml-2 font-mono text-sm">{recommendation.motor.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                    <span className="ml-2 text-gray-700">{recommendation.motor.baseModel}</span>
                  </div>
                </div>
              </div>

              {/* 驱动器 */}
              {systemConfig.drive && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                    {t('systemSummary.driveDetails')}
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                      <span className="ml-2 font-mono text-sm">{systemConfig.drive.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">{t('systemSummary.columns.description')}:</span>
                      <span className="ml-2 text-gray-700">{systemConfig.drive.baseModel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 电缆 */}
              {systemConfig.cables && (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.motorCable')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                        <span className="ml-2 font-mono text-sm">{systemConfig.cables.motor.partNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.cable.spec')}:</span>
                        <span className="ml-2">{systemConfig.cables.motor.spec}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                      {t('systemSummary.labels.encoderCable')}
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.columns.partNumber')}:</span>
                        <span className="ml-2 font-mono text-sm">{systemConfig.cables.encoder.partNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">{t('systemSummary.cable.spec')}:</span>
                        <span className="ml-2">{systemConfig.cables.encoder.spec}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Section>

      {/* 电机详细参数 */}
      {recommendation.motor && (
        <Section title={t('systemSummary.motorDetails')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.ratedPower')} value={`${recommendation.motor.ratedPower} W`} />
              <ParamRow label={t('systemSummary.labels.ratedSpeed')} value={`${recommendation.motor.ratedSpeed} rpm`} />
              <ParamRow label={t('systemSummary.labels.ratedTorque')} value={`${recommendation.motor.ratedTorque} N·m`} />
              <ParamRow label={t('systemSummary.labels.peakTorque')} value={`${recommendation.motor.peakTorque} N·m`} />
              <ParamRow label={t('systemSummary.labels.maxSpeed')} value={`${recommendation.motor.maxSpeed} rpm`} />
              <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${recommendation.motor.ratedCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.rotorInertia')} value={`${recommendation.motor.rotorInertia.toExponential(5)} kg·m²`} />
              <ParamRow label={t('systemSummary.labels.torqueConstant')} value={`${recommendation.motor.torqueConstant} N·m/A`} />
            </div>
          </div>
        </Section>
      )}

      {/* 驱动器详细参数 */}
      {systemConfig?.drive && (
        <Section title={t('systemSummary.driveDetails')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.maxCurrent')} value={`${systemConfig.drive.maxCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.ratedCurrent')} value={`${systemConfig.drive.ratedCurrent} A`} />
              <ParamRow label={t('systemSummary.labels.overloadCapacity')} value={`${systemConfig.drive.overloadCapacity} ×`} />
              <ParamRow label={t('systemSummary.labels.pwmFrequency')} value={`${systemConfig.drive.ratedPwmFrequency} kHz`} />
            </div>
          </div>
        </Section>
      )}

      {/* 制动能量分析 */}
      {result.regeneration && (
        <Section title={t('systemSummary.regeneration')}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <ParamRow label={t('systemSummary.labels.energyPerCycle')} value={`${result.regeneration.energyPerCycle.toFixed(1)} J`} />
              <ParamRow label={t('systemSummary.labels.brakingPower')} value={`${result.regeneration.brakingPower.toFixed(1)} W`} />
              <ParamRow
                label={t('systemSummary.labels.externalResistorRequired')}
                value={result.regeneration.requiresExternalResistor ? t('systemSummary.options.yes') : t('systemSummary.options.no')}
              />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

// 辅助组件
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm">{value}</span>
    </div>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1">
      <span className="text-gray-600 w-32 shrink-0 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm">{value}</span>
    </div>
  );
}
```

**Step 2: 验证组件类型正确**

检查类型导入路径是否正确，确保 AxisConfig 类型存在。

**Step 3: Commit**

```bash
git add src/components/wizard/AxisDetailSection.tsx
git commit -m "feat(pdf): extract axis detail section as reusable component"
```

---

## Task 2: 重构 MultiAxisPrintView 添加分页逻辑

**Files:**
- Modify: `src/components/wizard/MultiAxisPrintView.tsx`

**Step 1: 添加 CSS 分页样式**

在组件文件顶部添加打印样式：

```tsx
'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import type { Project, AxisConfig } from '@/types';
import { AxisDetailSection } from './AxisDetailSection';

// 打印分页样式
const printStyles = `
  @media print {
    .axis-page {
      page-break-after: always;
      break-after: page;
    }
    .axis-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
  }
`;
```

**Step 2: 重构组件结构**

修改渲染逻辑，添加分页：

```tsx
export function MultiAxisPrintView({ project, onClose }: MultiAxisPrintViewProps) {
  const t = useTranslations();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${project.name || '选型报告'}.pdf`,
    onAfterPrint: () => {
      console.log('打印完成');
    },
    onPrintError: (error) => {
      console.error('打印错误:', error);
    },
  });

  const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');
  const bom = buildBom(completedAxes);

  // 如果没有已完成的轴，显示提示
  if (completedAxes.length === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">没有已完成的轴可供导出</p>
          <p className="text-gray-400 text-sm mt-2">请至少完成一个轴的配置</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 注入打印样式 */}
      <style>{printStyles}</style>

      {/* 打印控制按钮 */}
      <div className="flex justify-end gap-2 p-4 border-b bg-gray-50 print:hidden">
        <button
          onClick={() => handlePrint()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🖨️ {t('result.print')}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          ✕ {t('common.close')}
        </button>
      </div>

      {/* 打印内容预览 */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div
          ref={printRef}
          className="bg-white mx-auto shadow-lg"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
          }}
        >
          {/* 第1页：项目信息 + 汇总BOM */}
          <div className="p-8">
            {/* 报告标题 */}
            <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                博世力士乐伺服选型报告
              </h1>
              {project.name && (
                <p className="text-lg text-gray-700">
                  项目: {project.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                生成时间: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* 项目信息 */}
            <Section title="项目信息">
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 grid grid-cols-1 gap-3">
                  <div>
                    <span className="text-gray-600 text-sm">项目名称:</span>
                    <span className="ml-2 font-medium">{project.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">客户:</span>
                    <span className="ml-2">{project.customer || '-'}</span>
                  </div>
                  {project.salesPerson && (
                    <div>
                      <span className="text-gray-600 text-sm">销售人员:</span>
                      <span className="ml-2">{project.salesPerson}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 text-sm">轴数量:</span>
                    <span className="ml-2">{completedAxes.length} 个已完成 / {project.axes.length} 个总计</span>
                  </div>
                  {project.notes && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-gray-600 text-sm block mb-1">备注:</span>
                      <p className="text-gray-800 whitespace-pre-wrap text-sm">{project.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* 汇总BOM */}
            {bom.length > 0 && (
              <Section title="物料清单 (BOM)">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium border-b border-gray-300">序号</th>
                        <th className="px-4 py-2 text-left font-medium border-b border-gray-300">料号</th>
                        <th className="px-4 py-2 text-left font-medium border-b border-gray-300">描述</th>
                        <th className="px-4 py-2 text-center font-medium border-b border-gray-300">数量</th>
                        <th className="px-4 py-2 text-left font-medium border-b border-gray-300">用于轴</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bom.map((item, index) => (
                        <tr key={item.partNumber} className="border-b border-gray-200 last:border-b-0">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 font-mono text-xs">{item.partNumber}</td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-xs">{item.usedIn.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>

          {/* 各轴详细配置 - 每轴一页 */}
          {completedAxes.map((axis, index) => (
            <div key={axis.id} className="axis-page p-8">
              <AxisDetailSection axis={axis} axisIndex={index} />
            </div>
          ))}

          {/* 最后页：页脚 */}
          <div className="p-8">
            <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
              <p>博世力士乐伺服选型工具生成</p>
              <p className="mt-1">XC20 + MC20 伺服系统</p>
              <p className="mt-1 text-xs">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: 验证分页样式生效**

在浏览器中预览打印效果，确认每个轴从新页面开始。

**Step 4: Commit**

```bash
git add src/components/wizard/MultiAxisPrintView.tsx
git commit -m "feat(pdf): refactor multi-axis print view with page breaks"
```

---

## Task 3: 删除冗余的 PrintReportView 组件

**Files:**
- Delete: `src/components/wizard/PrintReportView.tsx`

**Step 1: 检查引用**

搜索项目中是否还有其他地方引用 PrintReportView：

```bash
grep -r "PrintReportView" src/ --include="*.tsx" --include="*.ts"
```

**Step 2: 更新引用（如有）**

如果 ResultStep.tsx 或其他文件引用了 PrintReportView，需要更新为使用 MultiAxisPrintView 或删除相关代码。

**Step 3: 删除文件**

```bash
git rm src/components/wizard/PrintReportView.tsx
git commit -m "refactor(pdf): remove redundant PrintReportView component"
```

---

## Task 4: 运行构建验证

**Step 1: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 无错误

**Step 2: 运行构建**

```bash
npm run build
```

Expected: 构建成功

**Step 3: Commit（如需要修复）**

如有修复，单独提交：

```bash
git add .
git commit -m "fix(pdf): fix type errors after refactoring"
```

---

## Task 5: 手动测试验证

**Step 1: 启动开发服务器**

```bash
npm run dev
```

**Step 2: 测试场景**

1. 创建一个项目，添加至少2个轴
2. 完成所有轴的配置
3. 点击"导出PDF"按钮
4. 验证：
   - [ ] 项目信息只出现在第1页
   - [ ] BOM汇总表格正确显示所有物料
   - [ ] 每个轴从新页面开始
   - [ ] 每个轴显示计算摘要、电机参数、驱动器参数、电缆规格
   - [ ] 打印预览中分页正确

**Step 3: 截图记录（可选）**

如有问题，截图记录。

---

## 验收标准

- [ ] MultiAxisPrintView 包含项目信息 + BOM汇总 + 各轴详情
- [ ] 每个轴的详情使用 AxisDetailSection 组件
- [ ] 每个轴在PDF中从新页面开始
- [ ] PrintReportView 组件已删除
- [ ] 构建无错误
- [ ] 打印预览显示正确的分页效果

---

## 相关文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/wizard/AxisDetailSection.tsx` | 创建 | 轴详情可复用组件 |
| `src/components/wizard/MultiAxisPrintView.tsx` | 修改 | 添加分页逻辑，使用新组件 |
| `src/components/wizard/PrintReportView.tsx` | 删除 | 冗余组件 |
