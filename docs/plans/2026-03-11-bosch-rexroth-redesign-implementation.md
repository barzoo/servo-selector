# Bosch Rexroth 风格重设计实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将伺服选型工具完全重构为 Bosch Rexroth 品牌风格，采用深色沉浸式背景 + 霓虹光效设计

**Architecture:** 基于现有 Next.js + TailwindCSS + Zustand 架构，更新视觉层：引入品牌红/科技青双色系统、Noto Sans SC 字体、霓虹光效，新增 Hero Section 作为入口，重构所有 UI 组件样式

**Tech Stack:** Next.js 14, TailwindCSS 3.4, TypeScript, Zustand, next-intl, Lucide React

**Design Reference:** `docs/plans/2026-03-11-bosch-rexroth-redesign-design.md`

---

## 前置准备

### Task 0: 建立工作分支

**Files:**
- Branch: `feature/bosch-rexroth-redesign`

**Step 1: 创建并切换到工作分支**

```bash
git checkout -b feature/bosch-rexroth-redesign
```

**Step 2: 验证分支创建成功**

```bash
git branch --show-current
```

Expected: `feature/bosch-rexroth-redesign`

---

## 阶段一：基础配置更新

### Task 1: 更新 Tailwind 配置

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: 备份原配置**

```bash
cp tailwind.config.ts tailwind.config.ts.backup
```

**Step 2: 更新 tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          red: '#dc2626',
          cyan: '#06b6d4',
          dark: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(220, 38, 38, 0.4)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
        'glow-red-sm': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-cyan-sm': '0 0 15px rgba(6, 182, 212, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-left': 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.15), transparent 50%)',
        'glow-right': 'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15), transparent 50%)',
      }
    },
  },
  plugins: [],
};
export default config;
```

**Step 3: 验证配置无语法错误**

```bash
npx tsc --noEmit tailwind.config.ts
```

Expected: 无错误输出

**Step 4: 提交**

```bash
git add tailwind.config.ts
git commit -m "config: update tailwind config with Bosch Rexroth brand colors and fonts

- Add brand.red and brand.cyan colors
- Configure Noto Sans SC font family
- Add glow shadow effects
- Add radial gradient backgrounds

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: 更新全局 CSS 样式

**Files:**
- Modify: `src/app/globals.css`

**Step 1: 备份原样式文件**

```bash
cp src/app/globals.css src/app/globals.css.backup
```

**Step 2: 完全替换 globals.css 内容**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Bosch Rexroth Dark Theme */
  --background: #0a0a0a;
  --background-secondary: #1a1a1a;
  --background-tertiary: #262626;
  --background-elevated: #171717;

  --foreground: #ffffff;
  --foreground-secondary: #e5e5e5;
  --foreground-muted: #737373;
  --foreground-subtle: #525252;

  /* Brand Colors */
  --brand-red: #dc2626;
  --brand-red-light: #ef4444;
  --brand-red-dark: #b91c1c;

  --brand-cyan: #06b6d4;
  --brand-cyan-light: #22d3ee;
  --brand-cyan-dark: #0891b2;

  /* Border Colors */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-glow-red: 0 0 40px rgba(220, 38, 38, 0.4);
  --shadow-glow-cyan: 0 0 30px rgba(6, 182, 212, 0.3);

  /* Typography */
  --font-sans: 'Noto Sans SC', 'Source Han Sans SC', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* Selection */
::selection {
  background: var(--brand-red);
  color: white;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--brand-cyan);
  outline-offset: 2px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-glow-red {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(220, 38, 38, 0.5);
  }
}

@keyframes pulse-glow-cyan {
  0%, 100% {
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Utility Classes */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-slide-in {
  animation: slideIn 0.4s ease-out forwards;
}

.animate-pulse-glow-red {
  animation: pulse-glow-red 2s ease-in-out infinite;
}

.animate-pulse-glow-cyan {
  animation: pulse-glow-cyan 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Text Glow Effects */
.text-glow-red {
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
}

.text-glow-cyan {
  text-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
}

/* Glass Effect */
.glass {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-light {
  background: rgba(38, 38, 38, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-cyan-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Grid Pattern Background */
.grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Dot Pattern */
.dot-pattern {
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Input Styles */
input[type="number"],
input[type="text"],
select,
textarea {
  background: var(--background-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--foreground);
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

input[type="number"]:hover,
input[type="text"]:hover,
select:hover,
textarea:hover {
  border-color: var(--border-hover);
}

input[type="number"]:focus,
input[type="text"]:focus,
select:focus,
textarea:focus {
  border-color: var(--brand-cyan);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
}

/* Button Base Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--brand-red);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--brand-red-light);
  filter: brightness(1.1);
  box-shadow: var(--shadow-glow-red);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--brand-cyan);
  border: 1px solid var(--brand-cyan);
}

.btn-secondary:hover {
  background: rgba(6, 182, 212, 0.1);
  filter: brightness(1.1);
  box-shadow: var(--shadow-glow-cyan);
}

.btn-ghost {
  background: transparent;
  color: var(--foreground-muted);
}

.btn-ghost:hover {
  background: var(--background-tertiary);
  color: var(--foreground);
}

/* Card Styles */
.card {
  background: var(--background-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Status Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-info {
  background: rgba(6, 182, 212, 0.15);
  color: var(--brand-cyan);
  border: 1px solid rgba(6, 182, 212, 0.3);
}

/* Section Title */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-default), transparent);
  margin-left: 0.5rem;
}

/* Number Display */
.number-display {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 768px) {
  :root {
    --radius-lg: 6px;
  }
}

/* Print styles */
@media print {
  body {
    background: white;
    color: black;
  }

  .no-print {
    display: none !important;
  }
}
```

**Step 3: 验证构建通过**

```bash
npm run build 2>&1 | head -50
```

Expected: 构建成功，无 CSS 相关错误

**Step 4: 提交**

```bash
git add src/app/globals.css
git commit -m "styles: update global CSS with Bosch Rexroth theme

- Update color variables to brand red/cyan system
- Add Noto Sans SC font import
- Add glow animations and text effects
- Update button and card styles
- Maintain JetBrains Mono for numbers

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 阶段二：核心组件开发

### Task 3: 创建 Hero Section 组件

**Files:**
- Create: `src/components/hero/HeroSection.tsx`
- Create: `src/components/hero/index.ts`

**Step 1: 创建目录结构**

```bash
mkdir -p src/components/hero
```

**Step 2: 创建 HeroSection.tsx**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Zap, ArrowRight, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onStartConfiguration: () => void;
}

export function HeroSection({ onStartConfiguration }: HeroSectionProps) {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-transparent to-cyan-950/30" />

        {/* Cyan glow - top right */}
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />

        {/* Red glow - bottom left */}
        <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-neutral-800 rounded-sm">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-sm text-neutral-300">Bosch Rexroth</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="text-red-600 text-glow-red">「智」</span>
              慧选型工具
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl font-semibold text-cyan-500 text-glow-cyan">
              高性价比伺服系统配置
            </h2>

            {/* Feature List */}
            <ul className="space-y-4 text-neutral-200">
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>承袭 ctrlX AUTOMATION，集成卓越性能与开放生态</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>智能算法匹配最优电机与驱动器组合</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500 mt-1">-</span>
                <span>一键生成完整技术文档与物料清单</span>
              </li>
            </ul>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={onStartConfiguration}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-sm hover:bg-red-500 hover:shadow-glow-red transition-all duration-300"
              >
                <span>{t('startConfiguration')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footnote */}
            <p className="text-xs text-neutral-600 pt-4">
              <sup>1</sup> 基于 Bosch Rexroth 官方技术参数
            </p>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden md:flex items-center justify-center relative">
            {/* Decorative geometric shapes */}
            <div className="relative w-80 h-80">
              {/* Outer ring */}
              <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-pulse" />

              {/* Middle ring */}
              <div className="absolute inset-8 border border-cyan-500/30 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />

              {/* Inner content */}
              <div className="absolute inset-16 bg-gradient-to-br from-neutral-900 to-black rounded-full flex items-center justify-center border border-neutral-800">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">ctrlX</div>
                  <div className="text-cyan-500 text-sm tracking-widest">AUTOMATION</div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-500/30 animate-float" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-500/20 rounded-lg backdrop-blur-sm border border-cyan-500/30 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-neutral-500 animate-bounce">
          <span className="text-xs">向下滚动</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}
```

**Step 3: 创建 index.ts 导出**

```typescript
export { HeroSection } from './HeroSection';
```

**Step 4: 验证组件无语法错误**

```bash
npx tsc --noEmit src/components/hero/HeroSection.tsx
```

Expected: 无错误输出

**Step 5: 提交**

```bash
git add src/components/hero/
git commit -m "feat: add HeroSection component with Bosch Rexroth styling

- Full-screen hero with gradient backgrounds
- Brand red/cyan glow effects
- Feature list with custom bullet points
- Animated decorative elements
- Responsive layout

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: 更新主页面布局

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 备份原页面**

```bash
cp src/app/page.tsx src/app/page.tsx.backup
```

**Step 2: 更新 page.tsx 引入 HeroSection**

在现有 imports 后添加：

```typescript
import { HeroSection } from '@/components/hero';
```

**Step 3: 修改 renderMainContent 函数**

在 `renderMainContent` 函数中，当 `project.axes.length === 0` 时，添加 HeroSection：

```tsx
if (project.axes.length === 0) {
  return (
    <HeroSection
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

**Step 4: 更新主容器样式**

将主容器背景更新为纯黑：

```tsx
<div className="min-h-screen bg-black flex">
```

**Step 5: 更新背景效果层**

```tsx
{/* Background Effects */}
<div className="fixed inset-0 pointer-events-none">
  <div className="absolute inset-0 grid-pattern opacity-20" />
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[150px]" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
</div>
```

**Step 6: 更新 Header 样式**

将标题区域更新为：

```tsx
{/* Header */}
<header className="mb-8 text-center relative">
  {/* ... existing mobile drawer code ... */}

  {/* Desktop: Language Switcher */}
  <div className="hidden md:flex absolute right-0 top-0 items-center gap-2">
    <LanguageSwitcher />
  </div>

  <div className="inline-flex items-center gap-3 mb-3">
    <div className="w-10 h-10 rounded-sm bg-red-600 flex items-center justify-center shadow-glow-red">
      <Zap className="w-5 h-5 text-white" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-bold text-white">
      {t('pageTitle')}
    </h1>
  </div>

  <p className="text-neutral-400">{t('pageSubtitle')}</p>

  {/* ... rest of header ... */}
</header>
```

**Step 7: 更新卡片样式**

```tsx
{/* Main Card */}
<div className="bg-neutral-900/50 border border-neutral-800 rounded-sm shadow-2xl">
```

**Step 8: 验证构建**

```bash
npm run build 2>&1 | head -50
```

Expected: 构建成功

**Step 9: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate HeroSection and update main page styling

- Add HeroSection for empty project state
- Update background to pure black
- Add red/cyan glow effects
- Update header with red accent icon
- Update card styling

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 阶段三：Wizard 组件样式更新

### Task 5: 更新 StepIndicator 组件

**Files:**
- Modify: `src/components/wizard/StepIndicator.tsx`

**Step 1: 备份原文件**

```bash
cp src/components/wizard/StepIndicator.tsx src/components/wizard/StepIndicator.tsx.backup
```

**Step 2: 更新组件样式**

将步骤指示器的激活状态从蓝色改为红色/青色系统：

- 当前步骤：红色背景 `bg-red-600` + 红色光晕
- 已完成步骤：青色 `text-cyan-500` 或保持绿色
- 待办步骤：中性色 `text-neutral-600`
- 连接线：已完成用青色，待办用中性色

**Step 3: 提交**

```bash
git add src/components/wizard/StepIndicator.tsx
git commit -m "style: update StepIndicator with brand colors

- Active step: red background with glow
- Completed step: cyan accent
- Pending step: neutral gray
- Updated connector line colors

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: 更新 AxisSidebar 组件

**Files:**
- Modify: `src/components/wizard/AxisSidebar.tsx`

**Step 1: 备份原文件**

```bash
cp src/components/wizard/AxisSidebar.tsx src/components/wizard/AxisSidebar.tsx.backup
```

**Step 2: 更新侧边栏样式**

- 背景：`bg-neutral-900` 或 `bg-black`
- 激活项：青色边框 `border-cyan-500` + 青色背景光
- 悬停效果：加深背景
- 添加轴按钮：红色背景 `bg-red-600`

**Step 3: 提交**

```bash
git add src/components/wizard/AxisSidebar.tsx
git commit -m "style: update AxisSidebar with brand styling

- Dark background with subtle borders
- Active item: cyan border and glow
- Add axis button: red accent
- Improved hover states

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: 更新 Wizard 步骤组件

**Files:**
- Modify: `src/components/wizard/steps/MechanismStep.tsx`
- Modify: `src/components/wizard/steps/MotionStep.tsx`
- Modify: `src/components/wizard/steps/DutyStep.tsx`
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 统一更新步骤卡片样式**

每个步骤组件更新：
- 卡片背景：`bg-neutral-900/50`
- 卡片边框：`border-neutral-800`
- 标题：白色 `text-white`
- 副标题/说明：青色 `text-cyan-500`
- 输入框聚焦：青色边框
- 按钮：主要用红色，次要用青色边框

**Step 2: 批量提交**

```bash
git add src/components/wizard/steps/
git commit -m "style: update all wizard step components

- Unified card styling with dark theme
- Red primary buttons
- Cyan accent for secondary actions
- Updated input focus states
- Consistent typography

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 阶段四：Onboarding 组件更新

### Task 8: 更新 Onboarding 组件

**Files:**
- Modify: `src/components/onboarding/OnboardingEmptyState.tsx`
- Modify: `src/components/onboarding/ValueProposition.tsx`
- Modify: `src/components/onboarding/ProcessPreview.tsx`
- Modify: `src/components/onboarding/CTASection.tsx`

**Step 1: 更新各组件样式**

统一更新为：
- 深色背景
- 红色 CTA 按钮
- 青色强调文字
- 霓虹光效装饰

**Step 2: 提交**

```bash
git add src/components/onboarding/
git commit -m "style: update onboarding components with brand theme

- Dark backgrounds throughout
- Red CTA buttons with glow
- Cyan accent text
- Neon glow decorations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 阶段五：测试与验证

### Task 9: 运行测试套件

**Files:**
- All test files

**Step 1: 运行单元测试**

```bash
npm test
```

Expected: 所有测试通过

**Step 2: 运行构建验证**

```bash
npm run build
```

Expected: 构建成功，无错误

**Step 3: 提交（如测试通过）**

```bash
git commit --allow-empty -m "test: verify all tests pass after redesign

- Unit tests: PASS
- Build: SUCCESS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: 清理备份文件

**Step 1: 删除备份文件**

```bash
rm -f tailwind.config.ts.backup
rm -f src/app/globals.css.backup
rm -f src/app/page.tsx.backup
rm -f src/components/wizard/StepIndicator.tsx.backup
rm -f src/components/wizard/AxisSidebar.tsx.backup
```

**Step 2: 提交**

```bash
git add -u
git commit -m "chore: remove backup files after successful redesign

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 完成总结

实施完成后，项目将拥有：

1. ✅ 全新的 Bosch Rexroth 品牌色彩系统（红/青）
2. ✅ Noto Sans SC 中文字体
3. ✅ 霓虹光效和动画
4. ✅ 沉浸式 Hero Section
5. ✅ 统一的深色主题组件
6. ✅ 所有测试通过

**最终提交到主分支**：

```bash
git checkout master
git merge feature/bosch-rexroth-redesign
```
