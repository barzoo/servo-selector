# Bosch Rexroth 风格重设计文档

**日期**: 2026-03-11
**类型**: UI/UX 重设计
**方案**: 方案 A - 完全重构

---

## 1. 设计理念与风格定位

**核心风格**: 工业科技 / 高端制造 / 专业极简
**视觉基调**: 深色沉浸式背景 + 霓虹光效点缀
**品牌调性**: 德国精工、可靠、前沿技术、智能化
**设计哲学**: 以产品为中心，用光影讲故事，强调技术参数与视觉冲击力并存

---

## 2. 色彩系统 (Color System)

### 2.1 主色调

| 角色 | 色值 | Tailwind 配置 | 用途 |
|------|------|---------------|------|
| **背景主色** | `#0a0a0a` / `#000000` | `bg-neutral-950` / `bg-black` | 页面主背景，营造深邃科技氛围 |
| **背景次色** | `#1a1a1a` | `bg-neutral-900` | 卡片、次级容器 |
| **品牌红** | `#dc2626` (RGB: 220, 38, 38) | `text-red-600`, `bg-red-600` | 重点强调字（"智"）、关键词、CTA |
| **科技青** | `#06b6d4` (Cyan-500) | `text-cyan-500`, `bg-cyan-500` | 副标题、光效、高亮信息 |
| **科技蓝** | `#3b82f6` (Blue-500) | `text-blue-500` | 链接、次级强调（保留） |

### 2.2 文字色彩

| 角色 | 色值 | Tailwind 配置 | 用途 |
|------|------|---------------|------|
| **主标题** | `#ffffff` | `text-white` | 大标题文字 |
| **正文高亮** | `#e5e5e5` | `text-neutral-200` | 列表项、描述文字 |
| **次要文字** | `#737373` | `text-neutral-500` | 脚注、标注、说明 |
| **禁用/注释** | `#525252` | `text-neutral-600` | 上标注释、法律声明 |

### 2.3 光效与渐变

- **红色光晕**: `box-shadow: 0 0 40px rgba(220, 38, 38, 0.4)`
- **青色光晕**: `box-shadow: 0 0 30px rgba(6, 182, 212, 0.3)`
- **产品辉光**: 右侧蓝色光源，左侧红色光源形成对比

---

## 3. 字体规范 (Typography)

### 3.1 字体家族

```javascript
// tailwind.config.js
fontFamily: {
  sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
  display: ['"Noto Sans SC"', 'Arial', 'sans-serif'], // 标题用字
  mono: ['"JetBrains Mono"', 'monospace'], // 数字显示
}
```

### 3.2 字号层级

| 元素 | 尺寸 | 字重 | 行高 | 特征 |
|------|------|------|------|------|
| **主标题** | `text-4xl` (2.25rem) | `font-bold` (700) | `leading-tight` | 红色引号包裹首字 |
| **副标题** | `text-2xl` (1.5rem) | `font-semibold` (600) | `leading-snug` | 青色，与主标题形成冷暖对比 |
| **列表项** | `text-base` (1rem) | `font-normal` (400) | `leading-relaxed` | 左侧带短横线或圆点 |
| **脚注** | `text-xs` (0.75rem) | `font-normal` (400) | `leading-normal` | 上标数字标注 |

### 3.3 特殊排版规则

- **强调字处理**: 首个字符使用红色，引号使用直角引号 `「」` 或双引号 `""`
- **中英文混排**: 英文技术术语（如 EtherCAT, Profinet）保持原样，不加空格
- **数字上标**: 使用 `<sup>` 标签，颜色为 `text-neutral-500`

---

## 4. 布局结构 (Layout)

### 4.1 页面架构

```
[导航栏] - 透明/半透明，滚动后加深
    │
[Hero Section] - 全屏高度 (h-screen)，深色背景+霓虹光效
    │   ├── 左/中：文字内容区 (z-10)
    │   │       ├── 主标题（红字强调）
    │   │       ├── 副标题（青色）
    │   │       └── 特性列表（短横线标记）
    │   └── 右：产品示意图/装饰性几何图形 (带光效)
    │
[选型工具区] - 现有 wizard 功能，样式全面更新
    │   ├── 侧边栏：深色卡片 + 青色激活状态
    │   ├── 步骤指示器：红/青双色进度
    │   └── 表单卡片：玻璃态效果 + 霓虹边框
    │
[Footer] - 深色，简洁版权信息
```

### 4.2 间距系统

- **大区块间距**: `py-20` (5rem) 或 `py-24` (6rem)
- **内容容器**: `max-w-7xl` (80rem) 居中，`px-6` 侧边距
- **元素间距**:
  - 标题到列表: `mt-6` (1.5rem)
  - 列表项之间: `mt-3` (0.75rem)
  - 脚注到内容: `mt-8` (2rem)

---

## 5. 组件样式 (Components)

### 5.1 Hero Section

```tsx
<section className="relative h-screen w-full bg-black overflow-hidden">
  {/* 背景光效层 */}
  <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-cyan-900/20"></div>
  <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
  <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>

  {/* 内容层 */}
  <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-6">
    <div className="w-full md:w-1/2 space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold text-white">
        <span className="text-red-600">「智」</span>慧选型工具
      </h1>
      <h2 className="text-2xl font-semibold text-cyan-500">高性价比伺服系统配置</h2>
      <ul className="space-y-3 text-neutral-200">
        <li className="flex items-start">
          <span className="mr-3 text-cyan-500">-</span>
          承袭 ctrlX AUTOMATION，集成卓越性能与开放生态
        </li>
        <!-- 更多列表项 -->
      </ul>
    </div>
  </div>
</section>
```

### 5.2 特性列表

- **列表标记**: 不使用默认圆点，改用短横线 `-` 或自定义图标
- **悬停效果**: 文字颜色从 `text-neutral-200` 过渡到 `text-white`
- **过渡动画**: `transition-colors duration-300`

### 5.3 卡片/表单区

- **边框**: `border border-neutral-700`
- **背景**: `bg-neutral-900/50` (半透明深色)
- **悬停**: `hover:border-cyan-500/50`, `hover:bg-neutral-800`
- **圆角**: 保持工业硬朗感，使用 `rounded-sm` 或 `rounded-md`

### 5.4 按钮样式

- **主要按钮**: 红色背景 `bg-red-600`，白色文字，无圆角或极小圆角 `rounded-sm`
- **次要按钮**: 透明背景，青色边框 `border-cyan-500`，青色文字
- **悬停状态**: 亮度提升 `hover:brightness-110`

---

## 6. 视觉元素与特效

### 6.1 光影效果 (关键特征)

```css
/* 红色强调光 */
.text-glow-red {
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
}

/* 青色科技光 */
.text-glow-cyan {
  text-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
}

/* 产品辉光背景 */
.product-glow {
  background: radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15), transparent 50%),
              radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1), transparent 40%);
}
```

### 6.2 动画规范

- **过渡时长**: 300-500ms，使用 `ease-out` 或 `cubic-bezier(0.4, 0, 0.2, 1)`
- **滚动触发**: 内容淡入上浮 `animate-fade-in-up`
- **轮播切换**: 淡入淡出配合轻微缩放

---

## 7. Tailwind CSS 配置

```javascript
// tailwind.config.ts
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
```

---

## 8. 响应式适配要点

- **移动端**: Hero 文字居中，字体整体缩小一级 (`text-3xl` → `text-2xl`)
- **平板**: 保持左右布局，但缩小间距
- **大屏**: 增加内容区最大宽度，保持视觉平衡
- **暗色模式**: 本设计默认为暗色，无需额外适配 light mode

---

## 9. 设计禁忌 (Don'ts)

❌ 避免使用纯白色背景 (#ffffff)
❌ 避免使用圆角过大的组件（保持工业硬朗感）
❌ 避免使用过多色彩（限制在红、青、白、灰四色内）
❌ 避免使用 serif 字体（不符合科技感）
❌ 避免列表使用默认圆点符号

---

## 10. 实施范围

### 10.1 需要更新的文件

1. `tailwind.config.ts` - 扩展品牌色彩和字体
2. `src/app/globals.css` - 更新 CSS 变量和动画
3. `src/app/page.tsx` - 添加 Hero Section，重构布局
4. `src/components/wizard/StepIndicator.tsx` - 更新步骤指示器样式
5. `src/components/wizard/AxisSidebar.tsx` - 更新侧边栏样式
6. 所有步骤组件 - 更新卡片和表单样式
7. `src/components/onboarding/*` - 更新引导页样式

### 10.2 新增组件

- `HeroSection.tsx` - 首页 Hero 区域
- `GlowEffect.tsx` - 可复用的光效组件

---

## 11. 参考来源

本设计规范基于 Bosch Rexroth 官方网页设计分析，确保工业级产品的专业感与前沿科技感，通过深色背景与霓虹色彩的对比营造出高端制造的氛围，同时保持信息的清晰传达。
