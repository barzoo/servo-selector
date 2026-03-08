# 选型结果页面深色主题统一实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 SystemSummary 和 DetailedCalculations 组件从浅色主题迁移到深色工业主题，实现选型结果页面的视觉统一。

**Architecture:** 基于项目已有的 CSS 变量设计系统（定义在 globals.css），将所有硬编码的浅色颜色（bg-white, text-gray-900 等）替换为 CSS 变量（--background-secondary, --foreground 等）。保持组件结构和功能不变，仅修改样式类名。

**Tech Stack:** React + TypeScript + TailwindCSS + next-intl

---

## 前置检查

**Step 1: 确认设计文档已阅读**

参考设计文档：`docs/plans/2026-03-08-result-step-dark-theme-unification.md`

确认已理解颜色映射规范：
- bg-white → bg-[var(--background-secondary)]
- bg-gray-50 → bg-[var(--background-tertiary)]
- text-gray-900 → text-[var(--foreground)]
- text-gray-700/600 → text-[var(--foreground-secondary)]
- text-gray-500 → text-[var(--foreground-muted)]

---

## Task 1: SystemSummary 组件 - 配置列表表格

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:239-265`

**Step 1: 修改配置列表容器和表头**

将配置列表表格的浅色样式改为深色主题：

```tsx
// 原代码 (约239-265行)
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
    <h4 className="font-semibold text-gray-900">{t('configList')}</h4>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-900">{t('columns.partNumber')}</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">{t('columns.type')}</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">{t('columns.description')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {summaryItems.map((item, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-mono text-xs text-gray-900">
              {item.partNumber}
            </td>
            <td className="px-4 py-3 text-gray-700">{item.typeLabel}</td>
            <td className="px-4 py-3 text-gray-600">{item.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

改为：

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--background-tertiary)] border-b border-[var(--border-default)]">
    <h4 className="font-semibold text-[var(--foreground)]">{t('configList')}</h4>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-[var(--background-tertiary)]">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.partNumber')}</th>
          <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.type')}</th>
          <th className="px-4 py-2 text-left font-medium text-[var(--foreground-secondary)]">{t('columns.description')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border-subtle)]">
        {summaryItems.map((item, index) => (
          <tr key={index} className="hover:bg-[var(--background-tertiary)]/50 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-[var(--primary-300)]">
              {item.partNumber}
            </td>
            <td className="px-4 py-3 text-[var(--foreground-secondary)]">{item.typeLabel}</td>
            <td className="px-4 py-3 text-[var(--foreground-muted)]">{item.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Step 2: 验证修改**

运行开发服务器查看配置列表表格的深色主题效果：

```bash
npm run dev
```

访问 `http://localhost:3000`，完成选型流程到结果页面，检查：
- [ ] 表格背景为深色
- [ ] 表头使用 background-tertiary
- [ ] 料号显示为 primary-300 蓝色
- [ ] 行 hover 有效果

**Step 3: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 配置列表表格深色主题化"
```

---

## Task 2: SystemSummary 组件 - 电机详情卡片

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:268-342`

**Step 1: 修改电机详情卡片样式**

```tsx
// 原代码
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
    <h4 className="font-semibold text-blue-900">{t('motorDetails')}</h4>
  </div>
  <div className="p-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-gray-500 block">{tLabels('ratedPower')}</span>
        <span className="font-medium text-gray-900">{motor.ratedPower} W</span>
      </div>
      // ... 其他参数
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h5 className="text-sm font-medium text-gray-700 mb-2">{t('motorOptions')}</h5>
      // ... 选项内容
    </div>
  </div>
</div>
```

改为：

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--primary-500)]/10 border-b border-[var(--primary-500)]/20">
    <h4 className="font-semibold text-[var(--primary-300)]">{t('motorDetails')}</h4>
  </div>
  <div className="p-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-[var(--foreground-muted)] block">{tLabels('ratedPower')}</span>
        <span className="font-medium text-[var(--foreground)]">{motor.ratedPower} W</span>
      </div>
      // ... 其他参数同样修改
    </div>
    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
      <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('motorOptions')}</h5>
      // ... 选项内容同样修改
    </div>
  </div>
</div>
```

**Step 2: 验证修改**

检查电机详情卡片：
- [ ] 标题栏为半透明蓝色背景
- [ ] 标题文字为蓝色
- [ ] 参数标签为 muted 色
- [ ] 参数值为 foreground 色

**Step 3: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 电机详情卡片深色主题化"
```

---

## Task 3: SystemSummary 组件 - 驱动器详情卡片

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:344-419`

**Step 1: 修改驱动器详情卡片样式**

将驱动器卡片改为绿色主题：

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--green-500)]/10 border-b border-[var(--green-500)]/20">
    <h4 className="font-semibold text-[var(--green-400)]">{t('driveDetails')}</h4>
  </div>
  <div className="p-4">
    // ... 参数网格使用相同的深色主题变量
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-[var(--foreground-muted)] block">{tLabels('maxCurrent')}</span>
        <span className="font-medium text-[var(--foreground)]">{drive.maxCurrent} A</span>
      </div>
      // ... 其他参数
    </div>
    // ... 选项区域和制动能力区域同样修改
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 驱动器详情卡片深色主题化"
```

---

## Task 4: SystemSummary 组件 - 电缆规格卡片

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:421-481`

**Step 1: 修改电缆规格卡片样式**

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--primary-500)]/10 border-b border-[var(--primary-500)]/20">
    <h4 className="font-semibold text-[var(--primary-300)]">{t('cableSpecs')}</h4>
  </div>
  <div className="p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
        <h5 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">{tLabels('motorCable')}</h5>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">{t('columns.partNumber')}:</span>
            <span className="font-mono text-xs text-[var(--primary-300)]">{config.cables.motor.partNumber}</span>
          </div>
          // ... 其他字段
        </div>
      </div>
      // ... 编码器电缆和通讯电缆同样修改
    </div>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 电缆规格卡片深色主题化"
```

---

## Task 5: SystemSummary 组件 - 附件卡片

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:483-520`

**Step 1: 修改附件卡片样式**

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--amber-500)]/10 border-b border-[var(--amber-500)]/20">
    <h4 className="font-semibold text-[var(--amber-400)]">{t('accessories')}</h4>
  </div>
  <div className="p-4">
    // ... 内部使用 background-tertiary 和对应的文字颜色
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 附件卡片深色主题化"
```

---

## Task 6: SystemSummary 组件 - 再生能量卡片

**Files:**
- Modify: `src/components/wizard/SystemSummary.tsx:522-571`

**Step 1: 修改再生能量卡片样式**

```tsx
<div className="card overflow-hidden">
  <div className="px-4 py-3 bg-[var(--red-500)]/10 border-b border-[var(--red-500)]/20">
    <h4 className="font-semibold text-[var(--red-400)]">{t('regeneration')}</h4>
  </div>
  <div className="p-4">
    // ... 参数网格使用深色主题变量
    {mechanical.regeneration.warning && (
      <div className="mt-3 p-3 bg-[var(--amber-500)]/10 border border-[var(--amber-500)]/30 rounded text-sm text-[var(--amber-400)]">
        {mechanical.regeneration.warning}
      </div>
    )}
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/wizard/SystemSummary.tsx
git commit -m "refactor: SystemSummary 再生能量卡片深色主题化"
```

---

## Task 7: DetailedCalculations 组件 - 折叠面板

**Files:**
- Modify: `src/components/wizard/DetailedCalculations.tsx:406-444`

**Step 1: 修改折叠面板容器样式**

```tsx
// 原代码
<section className="border rounded-lg overflow-hidden">
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
    aria-expanded={isExpanded}
    aria-controls="detailed-calculations-content"
  >
    <span className="font-medium text-gray-800 flex items-center gap-2">
      <span>🔧</span>
      <span>{t('detailedCalculations.title')}</span>
    </span>
    <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
  </button>

  {isExpanded && (
    <div
      id="detailed-calculations-content"
      className="p-4 space-y-4 bg-gray-50/50"
    >
      // ... 卡片内容
    </div>
  )}
</section>
```

改为：

```tsx
<section className="border border-[var(--border-default)] rounded-lg overflow-hidden">
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="w-full px-4 py-3 bg-[var(--background-tertiary)] hover:bg-[var(--background-elevated)] flex justify-between items-center transition-colors"
    aria-expanded={isExpanded}
    aria-controls="detailed-calculations-content"
  >
    <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
      <span className="text-[var(--primary-400)]">🔧</span>
      <span>{t('detailedCalculations.title')}</span>
    </span>
    <span className="text-[var(--foreground-muted)]">{isExpanded ? '▲' : '▼'}</span>
  </button>

  {isExpanded && (
    <div
      id="detailed-calculations-content"
      className="p-4 space-y-4 bg-[var(--background-secondary)]"
    >
      // ... 卡片内容
    </div>
  )}
</section>
```

**Step 2: Commit**

```bash
git add src/components/wizard/DetailedCalculations.tsx
git commit -m "refactor: DetailedCalculations 折叠面板深色主题化"
```

---

## Task 8: DetailedCalculations 组件 - CalculationCard 子组件

**Files:**
- Modify: `src/components/wizard/DetailedCalculations.tsx:59-74`

**Step 1: 修改 CalculationCard 组件样式**

```tsx
function CalculationCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border-default)] rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-[var(--primary-500)]/10 border-b border-[var(--border-subtle)]">
        <h4 className="font-medium text-[var(--primary-300)]">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/wizard/DetailedCalculations.tsx
git commit -m "refactor: DetailedCalculations CalculationCard 深色主题化"
```

---

## Task 9: DetailedCalculations 组件 - ParamRow 子组件

**Files:**
- Modify: `src/components/wizard/DetailedCalculations.tsx:79-111`

**Step 1: 修改 ParamRow 组件样式**

```tsx
function ParamRow({
  label,
  value,
  unit,
  highlight,
  suffix,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: HighlightType;
  suffix?: React.ReactNode;
}) {
  const valueClass =
    highlight === 'positive'
      ? 'text-[var(--green-400)]'
      : highlight === 'negative'
        ? 'text-[var(--red-400)]'
        : highlight === 'warning'
          ? 'text-[var(--amber-400)]'
          : 'text-[var(--foreground)]';

  return (
    <div className="flex justify-between py-1 items-center">
      <span className="text-[var(--foreground-secondary)]">{label}</span>
      <span className={`font-mono font-medium ${valueClass}`}>
        {value}
        {unit && <span className="text-[var(--foreground-muted)] ml-1">{unit}</span>}
        {suffix && <span className="ml-2">{suffix}</span>}
      </span>
    </div>
  );
}
```

**Step 2: 修改 Divider 组件样式**

```tsx
function Divider() {
  return <div className="border-t border-[var(--border-subtle)] my-2" />;
}
```

**Step 3: Commit**

```bash
git add src/components/wizard/DetailedCalculations.tsx
git commit -m "refactor: DetailedCalculations ParamRow 和 Divider 深色主题化"
```

---

## Task 10: DetailedCalculations 组件 - 状态标签样式

**Files:**
- Modify: `src/components/wizard/DetailedCalculations.tsx:225-231` (TorqueCard 中的再生制动标签)
- Modify: `src/components/wizard/DetailedCalculations.tsx:379-388` (PowerCard 中的制动电阻标签)

**Step 1: 修改 TorqueCard 中的再生制动标签**

```tsx
// 原代码
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
  ⚡{t('detailedCalculations.labels.regenerative')}
</span>
```

改为：

```tsx
<span className="badge badge-warning">
  ⚡{t('detailedCalculations.labels.regenerative')}
</span>
```

**Step 2: 修改 PowerCard 中的制动电阻状态标签**

```tsx
// 需要外部电阻
<span className="badge badge-error">
  ⚠️ {t('detailedCalculations.labels.externalRequired')}
</span>

// 内部足够
<span className="badge badge-success">
  ✓ {t('detailedCalculations.labels.internalSufficient')}
</span>
```

**Step 3: Commit**

```bash
git add src/components/wizard/DetailedCalculations.tsx
git commit -m "refactor: DetailedCalculations 状态标签使用统一 badge 样式"
```

---

## Task 11: 最终验证

**Step 1: 运行开发服务器**

```bash
npm run dev
```

**Step 2: 视觉检查清单**

访问 `http://localhost:3000`，完成选型流程到结果页面，检查：

- [ ] SystemSummary 配置列表表格 - 深色背景，料号蓝色
- [ ] SystemSummary 电机详情卡片 - 蓝色标题栏
- [ ] SystemSummary 驱动器详情卡片 - 绿色标题栏
- [ ] SystemSummary 电缆规格卡片 - 蓝色标题栏，内部卡片深色
- [ ] SystemSummary 附件卡片 - 琥珀色标题栏
- [ ] SystemSummary 再生能量卡片 - 红色标题栏，警告琥珀色
- [ ] DetailedCalculations 折叠面板 - 深色背景
- [ ] DetailedCalculations 计算卡片 - 统一深色主题
- [ ] DetailedCalculations 状态标签 - 使用 badge 样式
- [ ] 整体与 ResultStep 其他部分视觉协调

**Step 3: 构建测试**

```bash
npm run build
```

确保构建无错误。

**Step 4: 最终 Commit**

```bash
git add .
git commit -m "refactor: 完成选型结果页面深色主题统一

- SystemSummary 组件全面深色主题化
- DetailedCalculations 组件全面深色主题化
- 统一使用项目 CSS 变量设计系统
- 料号使用等宽字体，数值使用 number-display"
```

---

## 回滚方案

如需回滚，执行：

```bash
git log --oneline -15  # 查看提交历史
git revert HEAD~11..HEAD --no-edit  # 回滚所有相关提交
```
