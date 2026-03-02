# 移动端响应式适配实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 通过 Tailwind 响应式类名改造现有组件，实现移动端友好的布局

**Architecture:** 使用渐进式响应式改造，保留现有组件结构，通过 sm: md: 等前缀实现移动端适配

**Tech Stack:** Next.js, React, TailwindCSS, next-intl

---

## 前置检查

### Task 0: 验证开发环境

**Step 1: 检查当前分支和状态**

Run: `git status`
Expected: 工作区干净，位于功能分支

**Step 2: 确认设计文档存在**

Run: `cat docs/plans/2026-03-02-mobile-responsive-design.md`
Expected: 显示设计文档内容

**Step 3: 启动开发服务器（如需要验证）**

Run: `npm run dev`
Note: 保持服务器在后台运行用于手动验证

---

## Phase 1: 核心布局改造

### Task 1: StepIndicator 进度条响应式

**Files:**
- Modify: `src/components/wizard/StepIndicator.tsx`

**Step 1: 修改圆盘尺寸**

将第 29 行：
```tsx
w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
```

改为：
```tsx
w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium
```

**Step 2: 隐藏移动端文字标签**

将第 42-49 行：
```tsx
<span
  className={`
    mt-2 text-xs font-medium
    ${isActive ? 'text-blue-600' : 'text-gray-500'}
  `}
>
  {t(key)}
</span>
```

改为：
```tsx
<span
  className={`
    hidden sm:block mt-2 text-xs font-medium
    ${isActive ? 'text-blue-600' : 'text-gray-500'}
  `}
>
  {t(key)}
</span>
```

**Step 3: 调整连接线间距**

将第 52-57 行：
```tsx
<div
  className={`
    flex-1 h-1 mx-4 transition-colors duration-200
    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
  `}
/>
```

改为：
```tsx
<div
  className={`
    flex-1 h-1 mx-2 sm:mx-4 transition-colors duration-200
    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
  `}
/>
```

**Step 4: 验证修改**

Run: `npm run build 2>&1 | head -50`
Expected: 无 TypeScript 错误

**Step 5: Commit**

```bash
git add src/components/wizard/StepIndicator.tsx
git commit -m "feat(mobile): make StepIndicator responsive

- Reduce circle size on mobile (w-8 h-8 -> sm:w-10 sm:h-10)
- Hide step labels on mobile (hidden sm:block)
- Reduce connector margin on mobile (mx-2 sm:mx-4)"
```

---

### Task 2: 主页面头部布局改造

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 修改标题字体大小**

将第 53 行：
```tsx
<h1 className="text-3xl font-bold text-gray-900">
```

改为：
```tsx
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
```

**Step 2: 改造语言切换位置**

将第 49-52 行：
```tsx
<header className="mb-8 text-center relative">
  <div className="absolute right-0 top-0">
    <LanguageSwitcher />
  </div>
```

改为：
```tsx
<header className="mb-6 sm:mb-8 text-center relative">
  {/* Desktop: absolute position */}
  <div className="hidden md:block absolute right-0 top-0">
    <LanguageSwitcher />
  </div>
```

**Step 3: 在标题下方添加移动端语言切换**

在第 56 行（副标题）后添加：
```tsx
  {/* Mobile: below title */}
  <div className="md:hidden mt-4 flex justify-center">
    <LanguageSwitcher />
  </div>
```

**Step 4: 修改全局边距**

将第 48 行：
```tsx
<div className="max-w-4xl mx-auto px-4 py-8">
```

改为：
```tsx
<div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
```

**Step 5: 修改内容卡片内边距**

将第 59 行：
```tsx
<div className="bg-white rounded-lg shadow-lg p-8">
```

改为：
```tsx
<div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
```

**Step 6: 验证修改**

Run: `npm run build 2>&1 | head -50`
Expected: 无 TypeScript 错误

**Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(mobile): responsive header and layout

- Responsive title font sizes
- Move LanguageSwitcher below title on mobile
- Reduce horizontal padding on mobile (px-2)
- Reduce card padding on mobile (p-4)"
```

---

### Task 3: ResultStep 底部按钮响应式

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 修改底部按钮容器**

将第 293-309 行：
```tsx
<div className="flex justify-between">
  <button
    onClick={prevStep}
    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
  >
    {t('backToEdit')}
  </button>
  <div className="space-x-3">
    <button
      onClick={reset}
      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
    >
      {t('restart')}
    </button>
    <PdfExportButton data={prepareReportData()} disabled={!config} />
  </div>
</div>
```

改为：
```tsx
<div className="flex flex-col sm:flex-row justify-between gap-3">
  <button
    onClick={prevStep}
    className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
  >
    {t('backToEdit')}
  </button>
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={reset}
      className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
    >
      {t('restart')}
    </button>
    <div className="w-full sm:w-auto">
      <PdfExportButton data={prepareReportData()} disabled={!config} />
    </div>
  </div>
</div>
```

**Step 2: 修改计算摘要网格**

将第 172 行：
```tsx
<div className="grid grid-cols-3 gap-4 text-sm">
```

改为：
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
```

**Step 3: 验证修改**

Run: `npm run build 2>&1 | head -50`
Expected: 无 TypeScript 错误

**Step 4: Commit**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat(mobile): responsive ResultStep buttons and grid

- Stack buttons vertically on mobile with full width
- Horizontal layout on sm+ screens
- Reduce calculation summary grid to 2 cols on mobile"
```

---

## Phase 2: 步骤组件网格改造

### Task 4: SystemConfigStep 网格响应式

**Files:**
- Modify: `src/components/wizard/steps/SystemConfigStep.tsx`

**Step 1: 修改惯量选项网格**

将第 60 行：
```tsx
<div className="grid grid-cols-2 gap-3">
```

改为：
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
```

**Step 2: 修改表单字段网格**

将第 90 行：
```tsx
<div className="grid grid-cols-2 gap-4">
```

改为：
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**Step 3: 修改底部按钮**

将第 165-179 行按钮容器：
```tsx
<div className="flex justify-between">
```

改为：
```tsx
<div className="flex flex-col sm:flex-row justify-between gap-3">
```

并为两个 button 添加 `w-full sm:w-auto` 类。

**Step 4: 验证修改**

Run: `npm run build 2>&1 | head -50`
Expected: 无 TypeScript 错误

**Step 5: Commit**

```bash
git add src/components/wizard/steps/SystemConfigStep.tsx
git commit -m "feat(mobile): responsive SystemConfigStep grid

- Single column grid on mobile for inertia options
- Single column grid on mobile for form fields
- Responsive bottom buttons layout"
```

---

### Task 5: MechanismStep 网格响应式

**Files:**
- Modify: `src/components/wizard/steps/MechanismStep.tsx`

**Step 1: 检查并修改网格布局**

查找所有 `grid-cols-2` 或 `grid-cols-3`，添加响应式前缀：
- `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- `grid-cols-3` → `grid-cols-2 sm:grid-cols-3`

**Step 2: 检查并修改底部按钮**

将按钮容器改为：
```tsx
<div className="flex flex-col sm:flex-row justify-between gap-3">
```

为按钮添加 `w-full sm:w-auto`。

**Step 3: 验证修改**

Run: `npm run build 2>&1 | head -50`
Expected: 无 TypeScript 错误

**Step 4: Commit**

```bash
git add src/components/wizard/steps/MechanismStep.tsx
git commit -m "feat(mobile): responsive MechanismStep grid and buttons"
```

---

### Task 6: MotionStep 网格响应式

**Files:**
- Modify: `src/components/wizard/steps/MotionStep.tsx`

**Step 1-3:** 同 Task 5

**Step 4: Commit**

```bash
git add src/components/wizard/steps/MotionStep.tsx
git commit -m "feat(mobile): responsive MotionStep grid and buttons"
```

---

### Task 7: DutyStep 网格响应式

**Files:**
- Modify: `src/components/wizard/steps/DutyStep.tsx`

**Step 1-3:** 同 Task 5

**Step 4: Commit**

```bash
git add src/components/wizard/steps/DutyStep.tsx
git commit -m "feat(mobile): responsive DutyStep grid and buttons"
```

---

### Task 8: ProjectInfoStep 按钮响应式

**Files:**
- Modify: `src/components/wizard/steps/ProjectInfoStep.tsx`

**Step 1: 修改提交按钮**

将第 107-114 行：
```tsx
<div className="flex justify-end">
  <button
    type="submit"
    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  >
    {commonT('next')}
  </button>
</div>
```

改为：
```tsx
<div className="flex justify-end">
  <button
    type="submit"
    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  >
    {commonT('next')}
  </button>
</div>
```

**Step 2: Commit**

```bash
git add src/components/wizard/steps/ProjectInfoStep.tsx
git commit -m "feat(mobile): responsive ProjectInfoStep button"
```

---

## Phase 3: 验证与测试

### Task 9: 构建验证

**Step 1: 完整构建**

Run: `npm run build`
Expected: 构建成功，无错误

**Step 2: 运行单元测试**

Run: `npm test 2>&1 | tail -20`
Expected: 所有测试通过

**Step 3: Commit（如测试通过）**

```bash
git commit --allow-empty -m "test(mobile): all tests pass after responsive changes"
```

---

### Task 10: Playwright 视觉测试

**Files:**
- Create: `e2e/mobile-responsive.spec.ts`

**Step 1: 创建移动端视觉测试**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive', () => {
  test('should display correctly on iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that step indicator is visible
    const stepIndicator = page.locator('[class*="rounded-full"]').first();
    await expect(stepIndicator).toBeVisible();

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('iphone-se-wizard.png');
  });

  test('should display correctly on iPad', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('ipad-wizard.png');
  });
});
```

**Step 2: 运行测试**

Run: `npx playwright test e2e/mobile-responsive.spec.ts`
Expected: 测试通过或生成基线截图

**Step 3: Commit**

```bash
git add e2e/mobile-responsive.spec.ts
git commit -m "test(mobile): add responsive visual tests"
```

---

## 完成总结

### 修改文件清单

1. ✅ `src/components/wizard/StepIndicator.tsx`
2. ✅ `src/app/page.tsx`
3. ✅ `src/components/wizard/steps/ResultStep.tsx`
4. ✅ `src/components/wizard/steps/SystemConfigStep.tsx`
5. ✅ `src/components/wizard/steps/MechanismStep.tsx`
6. ✅ `src/components/wizard/steps/MotionStep.tsx`
7. ✅ `src/components/wizard/steps/DutyStep.tsx`
8. ✅ `src/components/wizard/steps/ProjectInfoStep.tsx`
9. ✅ `e2e/mobile-responsive.spec.ts` (新建)

### 关键变更点

| 组件 | 变更 |
|------|------|
| StepIndicator | 圆盘尺寸响应式、文字标签 sm:block |
| page.tsx | 头部布局、边距 px-2、卡片内边距 |
| ResultStep | 按钮垂直堆叠、网格响应式 |
| SystemConfigStep | 网格单列、按钮响应式 |
| 其他步骤 | 类似网格和按钮改造 |

### 断点使用

- `< sm` (默认): 移动端布局
- `sm:` (640px+): 大手机/小平板
- `md:` (768px+): 平板/桌面

---

**计划完成，保存至 `docs/plans/2026-03-02-mobile-responsive-implementation.md`**
