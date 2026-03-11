# 智能空状态引导页实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现首页智能空状态引导页，包含价值主张、两层级流程预览和行动召唤

**Architecture:** 创建独立的 onboarding 组件模块，在 page.tsx 中条件渲染。复用现有样式系统和 i18n 框架，保持与 StepIndicator 一致的视觉风格。

**Tech Stack:** Next.js 14 + TypeScript + TailwindCSS + next-intl + Lucide React

---

## 前置检查

### Task 0: 检查现有代码结构

**Files:**
- Read: `src/app/page.tsx`
- Read: `src/i18n/messages/zh.json` (前100行)
- Read: `src/i18n/messages/en.json` (前100行)

**Purpose:** 确认现有空状态代码位置和 i18n 结构

---

## i18n 配置

### Task 1: 添加中文引导页翻译

**Files:**
- Modify: `src/i18n/messages/zh.json`

**Step 1: 在文件中添加 onboarding 命名空间**

在 `zh.json` 的根对象中添加：

```json
{
  "onboarding": {
    "hero": {
      "title": "专业的伺服系统选型工具",
      "subtitle": "为 Bosch Rexroth XC20 + MC20 系列快速生成完整的技术方案"
    },
    "features": {
      "wizard": {
        "title": "向导式配置",
        "description": "5步引导，降低选型门槛"
      },
      "smart": {
        "title": "智能计算",
        "description": "自动计算负载惯量、扭矩需求、制动电阻"
      },
      "report": {
        "title": "专业报告",
        "description": "一键导出PDF技术规格书"
      }
    },
    "process": {
      "projectPhase": "阶段一：项目配置（所有轴共享）",
      "axisPhase": "阶段二：轴配置（每个轴独立）",
      "repeatable": "可重复配置多个轴",
      "steps": {
        "projectInfo": "项目信息",
        "commonParams": "公共参数",
        "mechanism": "机械参数",
        "motion": "运动参数",
        "duty": "工况条件",
        "systemConfig": "系统配置"
      }
    },
    "cta": {
      "start": "开始配置项目",
      "loadRecent": "加载已有项目"
    }
  }
}
```

**Step 2: 验证 JSON 格式**

Run: `npx jsonlint src/i18n/messages/zh.json`
Expected: Valid JSON

**Step 3: Commit**

```bash
git add src/i18n/messages/zh.json
git commit -m "i18n: add onboarding translations for zh"
```

---

### Task 2: 添加英文引导页翻译

**Files:**
- Modify: `src/i18n/messages/en.json`

**Step 1: 在文件中添加 onboarding 命名空间**

在 `en.json` 的根对象中添加：

```json
{
  "onboarding": {
    "hero": {
      "title": "Professional Servo Sizing Tool",
      "subtitle": "Generate complete technical solutions for Bosch Rexroth XC20 + MC20 series"
    },
    "features": {
      "wizard": {
        "title": "Guided Configuration",
        "description": "5-step wizard simplifies the sizing process"
      },
      "smart": {
        "title": "Smart Calculation",
        "description": "Auto-calculate inertia, torque, and braking resistor"
      },
      "report": {
        "title": "Professional Report",
        "description": "One-click PDF technical specification export"
      }
    },
    "process": {
      "projectPhase": "Phase 1: Project Configuration (Shared)",
      "axisPhase": "Phase 2: Axis Configuration (Per Axis)",
      "repeatable": "Can be repeated for multiple axes",
      "steps": {
        "projectInfo": "Project Info",
        "commonParams": "Common Params",
        "mechanism": "Mechanism",
        "motion": "Motion",
        "duty": "Duty",
        "systemConfig": "System Config"
      }
    },
    "cta": {
      "start": "Start Configuration",
      "loadRecent": "Load Existing Project"
    }
  }
}
```

**Step 2: 验证 JSON 格式**

Run: `npx jsonlint src/i18n/messages/en.json`
Expected: Valid JSON

**Step 3: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "i18n: add onboarding translations for en"
```

---

## 组件开发

### Task 3: 创建 ValueProposition 组件

**Files:**
- Create: `src/components/onboarding/ValueProposition.tsx`

**Step 1: 编写组件代码**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Route, Calculator, FileText } from 'lucide-react';

const features = [
  { key: 'wizard', icon: Route },
  { key: 'smart', icon: Calculator },
  { key: 'report', icon: FileText },
] as const;

export function ValueProposition() {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center mb-12">
      {/* Hero Title */}
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        <span className="gradient-text">{t('hero.title')}</span>
      </h2>
      <p className="text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto text-lg">
        {t('hero.subtitle')}
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {features.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="card p-5 card-hover transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-[var(--primary-400)]" />
            </div>
            <h3 className="font-semibold mb-1">{t(`features.${key}.title`)}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t(`features.${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 验证类型检查**

Run: `npx tsc --noEmit src/components/onboarding/ValueProposition.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/onboarding/ValueProposition.tsx
git commit -m "feat: add ValueProposition onboarding component"
```

---

### Task 4: 创建 ProcessPreview 组件

**Files:**
- Create: `src/components/onboarding/ProcessPreview.tsx`

**Step 1: 编写组件代码**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Folder, Sliders, Cog, Activity, Gauge, CheckCircle, Repeat } from 'lucide-react';

const projectSteps = [
  { key: 'projectInfo', icon: Folder },
  { key: 'commonParams', icon: Sliders },
] as const;

const axisSteps = [
  { key: 'mechanism', icon: Cog },
  { key: 'motion', icon: Activity },
  { key: 'duty', icon: Gauge },
  { key: 'systemConfig', icon: CheckCircle },
] as const;

interface StepItemProps {
  icon: React.ElementType;
  label: string;
  phase: 'project' | 'axis';
}

function StepItem({ icon: Icon, label, phase }: StepItemProps) {
  const colorClass = phase === 'project'
    ? 'bg-[var(--primary-500)]/10 text-[var(--primary-400)] border-[var(--primary-500)]/30'
    : 'bg-[var(--green-500)]/10 text-[var(--green-400)] border-[var(--green-500)]/30';

  return (
    <div className="flex flex-col items-center group">
      <div className={`w-12 h-12 rounded-full ${colorClass} border-2 flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-[var(--foreground-secondary)]">{label}</span>
    </div>
  );
}

export function ProcessPreview() {
  const t = useTranslations('onboarding');

  return (
    <div className="mb-12">
      {/* Phase 1: Project Configuration */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4 text-center">
          {t('process.projectPhase')}
        </h3>
        <div className="flex items-center justify-center gap-4">
          {projectSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-4">
              <StepItem
                icon={step.icon}
                label={t(`process.steps.${step.key}`)}
                phase="project"
              />
              {index < projectSteps.length - 1 && (
                <div className="w-8 h-0.5 bg-[var(--primary-500)]/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px bg-[var(--border-default)] flex-1 max-w-[100px]" />
        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
          <Repeat className="w-3 h-3" />
          <span>{t('process.repeatable')}</span>
        </div>
        <div className="h-px bg-[var(--border-default)] flex-1 max-w-[100px]" />
      </div>

      {/* Phase 2: Axis Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4 text-center">
          {t('process.axisPhase')}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-y-4">
          {axisSteps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <StepItem
                icon={step.icon}
                label={t(`process.steps.${step.key}`)}
                phase="axis"
              />
              {index < axisSteps.length - 1 && (
                <div className="w-6 sm:w-8 h-0.5 bg-[var(--green-500)]/30 mx-2 sm:mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 验证类型检查**

Run: `npx tsc --noEmit src/components/onboarding/ProcessPreview.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/onboarding/ProcessPreview.tsx
git commit -m "feat: add ProcessPreview onboarding component"
```

---

### Task 5: 创建 CTASection 组件

**Files:**
- Create: `src/components/onboarding/CTASection.tsx`

**Step 1: 编写组件代码**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface CTASectionProps {
  onStart: () => void;
  hasRecentProject: boolean;
  onLoadRecent?: () => void;
}

export function CTASection({ onStart, hasRecentProject, onLoadRecent }: CTASectionProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center">
      <button
        onClick={onStart}
        className="btn btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
      >
        <span>{t('cta.start')}</span>
        <ChevronRight className="w-5 h-5" />
      </button>

      {hasRecentProject && onLoadRecent && (
        <button
          onClick={onLoadRecent}
          className="mt-4 flex items-center justify-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--primary-400)] transition-colors mx-auto"
        >
          <FolderOpen className="w-4 h-4" />
          <span>{t('cta.loadRecent')}</span>
        </button>
      )}
    </div>
  );
}
```

**Step 2: 验证类型检查**

Run: `npx tsc --noEmit src/components/onboarding/CTASection.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/onboarding/CTASection.tsx
git commit -m "feat: add CTASection onboarding component"
```

---

### Task 6: 创建 OnboardingEmptyState 主组件

**Files:**
- Create: `src/components/onboarding/OnboardingEmptyState.tsx`

**Step 1: 编写组件代码**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ValueProposition } from './ValueProposition';
import { ProcessPreview } from './ProcessPreview';
import { CTASection } from './CTASection';

interface OnboardingEmptyStateProps {
  onStartConfiguration: () => void;
}

export function OnboardingEmptyState({ onStartConfiguration }: OnboardingEmptyStateProps) {
  const [hasRecentProject, setHasRecentProject] = useState(false);

  useEffect(() => {
    // Check if there's a saved project in localStorage
    const stored = localStorage.getItem('servo-selector-project');
    setHasRecentProject(!!stored);
  }, []);

  const handleLoadRecent = () => {
    // The project will be loaded by the parent component's useEffect
    // We just need to trigger a page reload or state refresh
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 sm:px-8">
      {/* Background decoration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-300)] rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-default)] shadow-2xl">
          <svg className="w-10 h-10 text-[var(--primary-400)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      {/* Value Proposition */}
      <ValueProposition />

      {/* Process Preview */}
      <div className="w-full max-w-4xl mb-10">
        <ProcessPreview />
      </div>

      {/* CTA */}
      <CTASection
        onStart={onStartConfiguration}
        hasRecentProject={hasRecentProject}
        onLoadRecent={handleLoadRecent}
      />
    </div>
  );
}
```

**Step 2: 验证类型检查**

Run: `npx tsc --noEmit src/components/onboarding/OnboardingEmptyState.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/onboarding/OnboardingEmptyState.tsx
git commit -m "feat: add OnboardingEmptyState main component"
```

---

### Task 7: 创建组件索引文件

**Files:**
- Create: `src/components/onboarding/index.ts`

**Step 1: 编写索引文件**

```ts
export { OnboardingEmptyState } from './OnboardingEmptyState';
export { ValueProposition } from './ValueProposition';
export { ProcessPreview } from './ProcessPreview';
export { CTASection } from './CTASection';
```

**Step 2: Commit**

```bash
git add src/components/onboarding/index.ts
git commit -m "feat: add onboarding components index"
```

---

## 页面集成

### Task 8: 修改 page.tsx 集成引导页

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 添加导入**

在文件顶部添加导入：

```tsx
import { OnboardingEmptyState } from '@/components/onboarding';
```

**Step 2: 替换空状态渲染逻辑**

找到 `renderMainContent` 函数中的空状态渲染部分（约第122-177行），替换为：

```tsx
if (project.axes.length === 0) {
  return (
    <OnboardingEmptyState
      onStartConfiguration={() => {
        if (!project.name) {
          setMainViewMode('edit-project');
        } else {
          handleAddAxis();
        }
      }}
    />
  );
}
```

**Step 3: 验证修改**

Run: `npx tsc --noEmit src/app/page.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate OnboardingEmptyState into main page"
```

---

## 验证与测试

### Task 9: 运行类型检查

**Step 1: 全项目类型检查**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 2: Commit (if any fixes needed)**

如果有修复，提交：
```bash
git add -A
git commit -m "fix: type check fixes for onboarding components"
```

---

### Task 10: 清理旧代码（可选）

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 检查并移除未使用的导入**

检查 `page.tsx` 中是否有以下导入不再使用：
- `Plus`（如果只在旧空状态中使用）
- `Settings`
- `ChevronRight`

如果确认不再使用，移除它们。

**Step 2: 验证构建**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "chore: remove unused imports after onboarding integration"
```

---

## 最终验证

### Task 11: 完整功能验证

**Checklist:**
- [ ] 首次访问（无项目）显示引导页
- [ ] 价值主张区显示3个卖点卡片
- [ ] 流程预览区显示两层级6步结构
- [ ] 点击"开始配置项目"进入项目信息编辑
- [ ] 设置项目信息后添加第一个轴
- [ ] 添加轴后引导页消失，显示正常向导
- [ ] 中英文切换正常

**Step 1: 提交最终版本**

```bash
git add -A
git commit -m "feat: complete onboarding page implementation"
```

---

## 文件变更汇总

| 操作 | 文件路径 |
|------|----------|
| 修改 | `src/i18n/messages/zh.json` |
| 修改 | `src/i18n/messages/en.json` |
| 创建 | `src/components/onboarding/ValueProposition.tsx` |
| 创建 | `src/components/onboarding/ProcessPreview.tsx` |
| 创建 | `src/components/onboarding/CTASection.tsx` |
| 创建 | `src/components/onboarding/OnboardingEmptyState.tsx` |
| 创建 | `src/components/onboarding/index.ts` |
| 修改 | `src/app/page.tsx` |

---

**计划完成** - 准备执行
