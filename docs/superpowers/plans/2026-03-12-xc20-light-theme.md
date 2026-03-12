# XC20 明亮主题色彩重构实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将选型工具从深色科技风（红青配色）全面重构为与 XC20 产品主页一致的明亮主题（蓝白配色）。

**Architecture:** 更新全局 CSS 变量和 Tailwind 配置作为基础，然后逐个组件更新样式，保持组件结构不变仅修改 className。

**Tech Stack:** Next.js, Tailwind CSS, CSS Variables

---

## Chunk 1: 全局样式基础

更新 CSS 变量和 Tailwind 配置，建立新的色彩系统基础。

### Task 1.1: 更新 globals.css CSS 变量

**Files:**
- Modify: `src/app/globals.css:7-48`

- [ ] **Step 1: 更新 CSS 变量为明亮主题**

将 `:root` 中的 CSS 变量从深色主题更新为明亮主题：

```css
:root {
  /* XC20 Light Theme */
  --background: #ffffff;
  --background-secondary: #f5f7fa;
  --background-tertiary: #e8eef5;
  --background-elevated: #ffffff;

  --foreground: #1a1a1a;
  --foreground-secondary: #4a5568;
  --foreground-muted: #718096;
  --foreground-subtle: #a0aec0;

  /* Brand Colors - Blue Theme */
  --brand-primary: #00A4E4;
  --brand-primary-light: #33C3FF;
  --brand-primary-dark: #0077C8;

  --brand-secondary: #003366;
  --brand-secondary-light: #004080;
  --brand-secondary-dark: #002244;

  /* Border Colors */
  --border-subtle: #f1f5f9;
  --border-default: #e2e8f0;
  --border-hover: #cbd5e1;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-glow-blue: 0 0 40px rgba(0, 164, 228, 0.4);
  --shadow-glow-blue-sm: 0 0 20px rgba(0, 164, 228, 0.3);
  --shadow-card: 0 4px 20px rgba(0, 119, 200, 0.15);
  --shadow-card-hover: 0 8px 30px rgba(0, 119, 200, 0.2);

  /* Typography */
  --font-sans: 'Noto Sans SC', 'Source Han Sans SC', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

- [ ] **Step 2: 更新 body 样式**

```css
body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: 更新滚动条样式**

```css
/* Custom Scrollbar - Light Theme */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-hover);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--foreground-muted);
}
```

- [ ] **Step 4: 更新选中文本样式**

```css
::selection {
  background: var(--brand-primary);
  color: white;
}
```

- [ ] **Step 5: 更新 focus 样式**

```css
*:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 6: 更新动画关键帧**

将红色/青色动画改为蓝色：

```css
@keyframes pulse-glow-blue {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 164, 228, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 164, 228, 0.5);
  }
}

.animate-pulse-glow-blue {
  animation: pulse-glow-blue 2s ease-in-out infinite;
}
```

- [ ] **Step 7: 删除红色/青色相关样式**

删除以下样式：
- `.text-glow-red`
- `.text-glow-cyan`
- `.animate-pulse-glow-red`
- `.animate-pulse-glow-cyan`
- 所有红色/青色阴影变量

- [ ] **Step 8: 更新 glass 效果**

```css
/* Glass Effect - Light Theme */
.glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-light {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

- [ ] **Step 9: 更新 gradient-text**

```css
.gradient-text {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 10: 更新 grid-pattern**

```css
.grid-pattern {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

- [ ] **Step 11: 更新输入框样式**

```css
input[type="number"],
input[type="text"],
select,
textarea {
  background: var(--background);
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
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(0, 164, 228, 0.15);
}
```

- [ ] **Step 12: 更新按钮样式**

```css
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
  background: var(--brand-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--brand-primary-dark);
  filter: brightness(1.05);
  box-shadow: var(--shadow-glow-blue);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.btn-secondary:hover {
  background: rgba(0, 164, 228, 0.1);
  filter: brightness(1.05);
  box-shadow: var(--shadow-glow-blue-sm);
}

.btn-ghost {
  background: transparent;
  color: var(--foreground-muted);
}

.btn-ghost:hover {
  background: var(--background-tertiary);
  color: var(--foreground);
}
```

- [ ] **Step 13: 更新卡片样式**

```css
.card {
  background: var(--background);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}
```

- [ ] **Step 14: 更新状态标签样式**

```css
.badge-success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.badge-info {
  background: rgba(0, 164, 228, 0.1);
  color: var(--brand-primary);
  border: 1px solid rgba(0, 164, 228, 0.2);
}
```

- [ ] **Step 15: 更新 section-title 样式**

```css
.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-default), transparent);
  margin-left: 0.5rem;
}
```

- [ ] **Step 16: Commit**

```bash
git add src/app/globals.css
git commit -m "style: update globals.css for XC20 light theme"
```

---

### Task 1.2: 更新 Tailwind 配置

**Files:**
- Modify: `tailwind.config.ts:10-35`

- [ ] **Step 1: 更新 colors 配置**

```typescript
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  brand: {
    primary: '#00A4E4',
    'primary-light': '#33C3FF',
    'primary-dark': '#0077C8',
    secondary: '#003366',
    'secondary-light': '#004080',
    'secondary-dark': '#002244',
  }
},
```

- [ ] **Step 2: 更新 boxShadow 配置**

```typescript
boxShadow: {
  'glow-blue': '0 0 40px rgba(0, 164, 228, 0.4)',
  'glow-blue-sm': '0 0 20px rgba(0, 164, 228, 0.3)',
  'card': '0 4px 20px rgba(0, 119, 200, 0.15)',
  'card-hover': '0 8px 30px rgba(0, 119, 200, 0.2)',
},
```

- [ ] **Step 3: 更新 backgroundImage 配置**

```typescript
backgroundImage: {
  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  'gradient-hero': 'linear-gradient(135deg, #003366 0%, #0077C8 50%, #00A4E4 100%)',
  'glow-left': 'radial-gradient(circle at 20% 50%, rgba(0, 164, 228, 0.15), transparent 50%)',
  'glow-right': 'radial-gradient(circle at 80% 50%, rgba(0, 119, 200, 0.15), transparent 50%)',
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "style: update tailwind config for XC20 light theme"
```

---

## Chunk 2: Hero 区域

### Task 2.1: 更新 HeroSection 组件

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

- [ ] **Step 1: 更新 section 背景**

```tsx
<section className="relative min-h-screen w-full overflow-hidden flex items-center bg-gradient-to-br from-[#003366] via-[#0077C8] to-[#00A4E4]">
```

- [ ] **Step 2: 更新背景效果区域**

删除红色/青色光晕，改为白色/浅蓝光晕：

```tsx
{/* Background Effects */}
<div className="absolute inset-0">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/50 via-transparent to-[#00A4E4]/30" />

  {/* Light glow - top right */}
  <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[150px] animate-pulse" />

  {/* Blue glow - bottom left */}
  <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-[#00A4E4]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

  {/* Grid pattern */}
  <div className="absolute inset-0 grid-pattern opacity-20" />
</div>
```

- [ ] **Step 3: 更新品牌 Badge**

```tsx
{/* Brand Badge */}
<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-sm">
  <Zap className="w-4 h-4 text-white" />
  <span className="text-sm text-white/90">Bosch Rexroth</span>
</div>
```

- [ ] **Step 4: 更新主标题"智"字颜色**

```tsx
{/* Main Title */}
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
  <span className="text-[#87CEEB]">「智」</span>
  慧选型工具
</h1>
```

- [ ] **Step 5: 更新副标题颜色**

```tsx
{/* Subtitle */}
<h2 className="text-xl md:text-2xl font-semibold text-white/90">
  高性价比伺服系统配置
</h2>
```

- [ ] **Step 6: 更新特性列表**

```tsx
{/* Feature List */}
<ul className="space-y-4 text-white/80">
  <li className="flex items-start gap-3">
    <span className="text-white mt-1">-</span>
    <span>承袭 ctrlX AUTOMATION，集成卓越性能与开放生态</span>
  </li>
  <li className="flex items-start gap-3">
    <span className="text-white mt-1">-</span>
    <span>智能算法匹配最优电机与驱动器组合</span>
  </li>
  <li className="flex items-start gap-3">
    <span className="text-white mt-1">-</span>
    <span>一键生成完整技术文档与物料清单</span>
  </li>
</ul>
```

- [ ] **Step 7: 更新 CTA 按钮**

```tsx
{/* CTA Button */}
<div className="pt-4">
  <button
    onClick={onStartConfiguration}
    className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0077C8] font-semibold rounded-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300"
  >
    <span>{t('startConfiguration')}</span>
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </button>
</div>
```

- [ ] **Step 8: 更新脚注颜色**

```tsx
{/* Footnote */}
<p className="text-xs text-white/50 pt-4">
  <sup>1</sup> 基于 Bosch Rexroth 官方技术参数
</p>
```

- [ ] **Step 9: 更新右侧视觉元素**

```tsx
{/* Right: Visual Element */}
<div className="hidden md:flex items-center justify-center relative">
  {/* Decorative geometric shapes */}
  <div className="relative w-80 h-80">
    {/* Outer ring */}
    <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse" />

    {/* Middle ring */}
    <div className="absolute inset-8 border border-white/20 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />

    {/* Inner content */}
    <div className="absolute inset-16 bg-white/10 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">ctrlX</div>
        <div className="text-white/80 text-sm tracking-widest">AUTOMATION</div>
      </div>
    </div>

    {/* Floating elements */}
    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 animate-float" />
    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: '1.5s' }} />
  </div>
</div>
```

- [ ] **Step 10: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "style: update HeroSection for XC20 light theme"
```

---

## Chunk 3: 步骤指示器

### Task 3.1: 更新 StepIndicator 组件

**Files:**
- Modify: `src/components/wizard/StepIndicator.tsx`

- [ ] **Step 1: 更新步骤点样式**

```tsx
<div
  className={`
    step-dot transition-all duration-300
    ${isActive
      ? 'bg-[#00A4E4] text-white shadow-[0_0_20px_rgba(0,164,228,0.4)] scale-110'
      : isCompleted
      ? 'bg-[#0077C8] text-white'
      : 'bg-white text-[#718096] border-2 border-[#e2e8f0]'
    }
  `}
>
```

- [ ] **Step 2: 更新步骤文字样式**

```tsx
<span
  className={`
    hidden sm:block mt-3 text-xs font-medium transition-colors duration-200
    ${isActive ? 'text-[#00A4E4]' : isCompleted ? 'text-[#0077C8]' : 'text-[#718096]'}
  `}
>
```

- [ ] **Step 3: 更新连接线样式**

```tsx
<div
  className={`
    step-line mx-2 sm:mx-4 transition-all duration-500
    ${isCompleted ? 'bg-[#0077C8]' : 'bg-[#e2e8f0]'}
  `}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/wizard/StepIndicator.tsx
git commit -m "style: update StepIndicator for XC20 light theme"
```

---

## Chunk 4: 侧边栏

### Task 4.1: 更新 AxisSidebar 组件

**Files:**
- Modify: `src/components/wizard/AxisSidebar.tsx`

- [ ] **Step 1: 更新侧边栏容器背景**

```tsx
<div className="h-full flex flex-col bg-[#f5f7fa] border-r border-[#e2e8f0] overflow-hidden">
```

- [ ] **Step 2: 更新 Header 区域**

```tsx
{/* Header - Fixed */}
<div className="p-4 border-b border-[#e2e8f0] flex-shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-sm bg-[#00A4E4] flex items-center justify-center shadow-[0_0_20px_rgba(0,164,228,0.4)]">
      <Settings className="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 className="font-bold text-lg text-[#1a1a1a]">{t('logoTitle')}</h2>
      <p className="text-xs text-[#718096]">{t('logoSubtitle')}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: 更新项目信息按钮**

```tsx
{/* Project Info Section */}
<div className="p-3 border-b border-[#e2e8f0]">
  <button
    onClick={onOpenProjectSettings}
    className={`
      w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
      ${mainViewMode === 'edit-project'
        ? 'bg-[#00A4E4]/10 border border-[#00A4E4]/50 shadow-[0_0_15px_rgba(0,164,228,0.2)]'
        : 'bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
      }
    `}
  >
    <div className={`
      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
      ${mainViewMode === 'edit-project'
        ? 'bg-[#00A4E4]/20 text-[#00A4E4]'
        : 'bg-[#f5f7fa] text-[#718096]'
      }
    `}>
      <FileText className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#1a1a1a] truncate">
        {project.name || t('unnamedProject')}
      </p>
      <p className="text-xs text-[#718096]">
        {mainViewMode === 'edit-project' ? t('editing') : t('clickToEdit')}
      </p>
    </div>
    <ChevronRight className={`
      w-4 h-4 transition-transform duration-200 flex-shrink-0
      ${mainViewMode === 'edit-project' ? 'rotate-90 text-[#00A4E4]' : 'text-[#718096]'}
    `} />
  </button>
</div>
```

- [ ] **Step 4: 更新通用参数按钮**

```tsx
{/* Common Params Section */}
<div className="p-3 border-b border-[#e2e8f0]">
  <button
    onClick={onOpenCommonParams}
    className={`
      w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
      ${mainViewMode === 'edit-common'
        ? 'bg-[#0077C8]/10 border border-[#0077C8]/50'
        : 'bg-white border border-[#e2e8f0] hover:border-[#cbd5e1]'
      }
    `}
  >
    <div className={`
      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
      ${mainViewMode === 'edit-common'
        ? 'bg-[#0077C8]/20 text-[#0077C8]'
        : 'bg-[#f5f7fa] text-[#718096]'
      }
    `}>
      <Settings className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#1a1a1a]">{t('commonParams')}</p>
      <p className="text-xs text-[#718096]">
        {mainViewMode === 'edit-common' ? t('editing') : t('commonParamsDesc')}
      </p>
    </div>
    <ChevronRight className={`
      w-4 h-4 transition-transform duration-200 flex-shrink-0
      ${mainViewMode === 'edit-common' ? 'rotate-90 text-[#0077C8]' : 'text-[#718096]'}
    `} />
  </button>
</div>
```

- [ ] **Step 5: 更新轴列表标题**

```tsx
{/* Axis List Section */}
<div className="px-4 py-3 flex items-center justify-between">
  <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
    {t('axisConfig')}
  </span>
  <span className="text-xs text-[#718096]">
    {t('axisCount', { count: project.axes.length })}
  </span>
</div>
```

- [ ] **Step 6: 更新添加轴按钮**

```tsx
{/* Add Axis Button */}
<button
  onClick={onAddAxis}
  className="w-full flex items-center justify-center gap-2 p-4 mt-2 text-sm font-medium text-[#00A4E4] bg-[#00A4E4]/5 border border-dashed border-[#00A4E4]/30 rounded-lg hover:bg-[#00A4E4]/10 hover:border-[#00A4E4]/50 hover:shadow-[0_0_15px_rgba(0,164,228,0.2)] transition-all duration-200 group"
>
  <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
  {project.axes.length === 0 ? t('addFirstAxis') : t('addNewAxis')}
</button>
```

- [ ] **Step 7: 更新项目摘要区域**

```tsx
{/* Project Summary Section */}
<div className="p-4 border-t border-[#e2e8f0] bg-[#e8eef5]">
  <div className="flex items-center justify-between mb-4">
    <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
      {t('projectSummary')}
    </span>
  </div>

  <div className="grid grid-cols-2 gap-3 mb-4">
    <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
      <p className="text-xs text-[#718096] mb-1">{t('completed')}</p>
      <p className="text-2xl font-bold text-[#0077C8] number-display">{completedCount}</p>
    </div>
    <div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
      <p className="text-xs text-[#718096] mb-1">{t('configuring')}</p>
      <p className="text-2xl font-bold text-[#00A4E4] number-display">{configCount}</p>
    </div>
  </div>
```

- [ ] **Step 8: 更新导出/导入按钮**

```tsx
{/* Export/Import Buttons */}
<div className="grid grid-cols-2 gap-2 mt-3">
  <button
    onClick={() => setShowExportDialog(true)}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#4a5568] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200"
    title={resultT('exportProject')}
  >
    <Download className="w-4 h-4" />
    <span className="hidden lg:inline">{resultT('exportProject')}</span>
  </button>

  <button
    onClick={() => setShowImportDialog(true)}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#4a5568] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200"
    title={resultT('importProject')}
  >
    <Upload className="w-4 h-4" />
    <span className="hidden lg:inline">{resultT('importProject')}</span>
  </button>
</div>
```

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/AxisSidebar.tsx
git commit -m "style: update AxisSidebar for XC20 light theme"
```

---

### Task 4.2: 更新 AxisSidebarItem 组件

**Files:**
- Modify: `src/components/wizard/AxisSidebarItem.tsx`

- [ ] **Step 1: 更新容器样式**

```tsx
<div
  className={`
    group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
    ${isActive
      ? 'bg-[#00A4E4]/10 border-[#00A4E4]/50 shadow-[0_0_15px_rgba(0,164,228,0.15)]'
      : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
    }
  `}
  onClick={onClick}
>
```

- [ ] **Step 2: 更新状态指示器**

```tsx
{/* Status Indicator */}
<div
  className={`
    w-2 h-2 rounded-full flex-shrink-0
    ${axis.status === 'COMPLETED'
      ? 'bg-[#0077C8]'
      : axis.status === 'CONFIGURING'
      ? 'bg-[#00A4E4]'
      : 'bg-[#e2e8f0]'
    }
  `}
/>
```

- [ ] **Step 3: 更新轴名称样式**

```tsx
{/* Axis Name */}
<p className={`font-medium truncate ${isActive ? 'text-[#00A4E4]' : 'text-[#1a1a1a]'}`}>
  {axis.name}
</p>
```

- [ ] **Step 4: 更新状态文字**

```tsx
<p className="text-xs text-[#718096]">
  {axis.status === 'COMPLETED' ? t('completed') : t('configuring')}
</p>
```

- [ ] **Step 5: 更新操作按钮**

```tsx
{/* Action Buttons */}
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  {onUpdateName && (
    <button
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      className="p-1.5 rounded text-[#718096] hover:text-[#00A4E4] hover:bg-[#00A4E4]/10 transition-colors"
      title={t('editName')}
    >
      <Edit2 className="w-3.5 h-3.5" />
    </button>
  )}
  {onReedit && axis.status === 'COMPLETED' && (
    <button
      onClick={(e) => { e.stopPropagation(); onReedit(); }}
      className="p-1.5 rounded text-[#718096] hover:text-[#00A4E4] hover:bg-[#00A4E4]/10 transition-colors"
      title={t('reedit')}
    >
      <RefreshCw className="w-3.5 h-3.5" />
    </button>
  )}
  {canDelete && onDelete && (
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="p-1.5 rounded text-[#718096] hover:text-red-500 hover:bg-red-50 transition-colors"
      title={t('delete')}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )}
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/AxisSidebarItem.tsx
git commit -m "style: update AxisSidebarItem for XC20 light theme"
```

---

## Chunk 5: 主页面和布局

### Task 5.1: 更新主页面布局

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 检查并更新主容器背景**

确保主容器使用正确的背景色：

```tsx
// 主容器应该使用 bg-white 或 bg-[#f5f7fa]
<div className="min-h-screen bg-white">
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: update main page background for XC20 light theme"
```

---

## Chunk 6: 验证和测试

### Task 6.1: 构建测试

**Files:**
- Run: `npm run build`

- [ ] **Step 1: 运行构建命令**

```bash
npm run build
```

- [ ] **Step 2: 检查构建输出**

Expected: 构建成功，无 CSS 相关错误

- [ ] **Step 3: Commit（如需要）**

---

### Task 6.2: Playwright 视觉测试

**Files:**
- Run: Playwright tests

- [ ] **Step 1: 运行 Playwright 测试**

```bash
npm run test:e2e
```

或

```bash
npx playwright test
```

- [ ] **Step 2: 检查测试结果**

Expected: 所有测试通过，或更新快照

- [ ] **Step 3: 更新快照（如需要）**

```bash
npx playwright test --update-snapshots
```

- [ ] **Step 4: Commit 快照更新**

```bash
git add tests/
git commit -m "test: update snapshots for XC20 light theme"
```

---

## 完成总结

实施完成后，选型工具应该：

1. ✅ 使用白色背景替代黑色背景
2. ✅ 使用蓝色系（#00A4E4, #0077C8, #003366）替代红青配色
3. ✅ Hero 区域使用深蓝渐变背景
4. ✅ 所有组件使用新的明亮主题色彩
5. ✅ 与 XC20 产品主页视觉风格一致
6. ✅ 构建成功，测试通过

---

**设计文档参考:** `docs/superpowers/specs/2026-03-12-xc20-light-theme-design.md`
