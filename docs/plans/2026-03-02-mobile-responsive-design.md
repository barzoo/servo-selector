# 移动端响应式适配设计文档

## 设计决策确认

| 项目 | 决策 |
|------|------|
| 进度条 | 移动端只显示圆盘数字，隐藏文字标签 |
| 语言切换 | 移动端移到标题下方居中显示 |
| 按钮布局 | 移动端垂直全宽堆叠 |
| 边距调整 | 移动端水平边距减少到 8px (px-2) |

## 改造范围

### 1. StepIndicator.tsx - 进度条组件

**改造内容**：
- 圆盘尺寸：`w-8 h-8 sm:w-10 sm:h-10`
- 步骤标签：`<span className="hidden sm:block ...">`
- 连接线间距：`mx-2 sm:mx-4`

**效果**：
- 移动端：只显示 5 个圆盘数字，无文字标签
- 桌面端：显示圆盘 + 完整步骤名称

### 2. page.tsx - 主页面布局

**改造内容**：

**头部布局**：
```tsx
<header className="mb-6 sm:mb-8 text-center relative">
  {/* 桌面端语言切换：右上角 */}
  <div className="hidden md:block absolute right-0 top-0">
    <LanguageSwitcher />
  </div>

  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
    博世力士乐伺服选型工具
  </h1>
  <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>

  {/* 移动端语言切换：标题下方 */}
  <div className="md:hidden mt-4 flex justify-center">
    <LanguageSwitcher />
  </div>
</header>
```

**全局容器**：
- 边距：`px-2 sm:px-4 py-6 sm:py-8`
- 最大宽度保持：`max-w-4xl`

**内容卡片**：
- 内边距：`p-4 sm:p-6 md:p-8`

### 3. ResultStep.tsx - 结果页

**改造内容**：

**底部按钮布局**：
```tsx
<div className="flex flex-col sm:flex-row justify-between gap-3">
  <button className="w-full sm:w-auto px-6 py-2 ...">
    {t('backToEdit')}
  </button>
  <div className="flex flex-col sm:flex-row gap-3">
    <button className="w-full sm:w-auto ...">{t('restart')}</button>
    <PdfExportButton className="w-full sm:w-auto" ... />
  </div>
</div>
```

**计算摘要网格**：
- 当前：`grid-cols-3`
- 改造：`grid-cols-2 sm:grid-cols-3`

### 4. SystemConfigStep.tsx - 系统配置步骤

**改造内容**：

**惯量选项网格**：
- 当前：`grid-cols-2`
- 改造：`grid-cols-1 sm:grid-cols-2`

**表单字段网格**：
- 当前：`grid-cols-2 gap-4`
- 改造：`grid-cols-1 sm:grid-cols-2 gap-4`

### 5. 其他步骤组件

**MechanismStep.tsx**、**MotionStep.tsx**、**DutyStep.tsx**：
- 检查并调整所有 `grid-cols-2` 为 `grid-cols-1 sm:grid-cols-2`
- 检查并调整表单布局在移动端的显示

## 断点定义

使用 Tailwind 默认断点：

| 断点 | 宽度 | 说明 |
|------|------|------|
| 默认 | < 640px | 移动端 |
| sm | >= 640px | 大手机/小平板 |
| md | >= 768px | 平板/小桌面 |
| lg | >= 1024px | 桌面 |

## 测试检查清单

- [ ] iPhone SE (375px): 进度条显示正常，无溢出
- [ ] iPhone 12/13/14 (390px): 布局正常
- [ ] iPad (768px): 显示完整布局
- [ ] 桌面 (>=1024px): 保持现有布局
- [ ] 语言切换在移动端正常显示
- [ ] 所有按钮在移动端可正常点击
- [ ] 表单输入在移动端可用

## 回滚方案

如需回滚，恢复以下文件的 git 版本即可。

## 相关文件

- `src/components/wizard/StepIndicator.tsx`
- `src/app/page.tsx`
- `src/components/wizard/steps/ResultStep.tsx`
- `src/components/wizard/steps/SystemConfigStep.tsx`
- `src/components/wizard/steps/MechanismStep.tsx`
- `src/components/wizard/steps/MotionStep.tsx`
- `src/components/wizard/steps/DutyStep.tsx`
