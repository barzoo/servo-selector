# XC20 明亮主题色彩重构设计文档

## 概述
将选型工具从深色科技风（红青配色）全面重构为与 XC20 产品主页一致的明亮主题（蓝白配色）。

## 设计目标
- 与 XC20 产品主页视觉风格完全一致
- 采用明亮、专业的工业科技风格
- 完全去除红色，全面使用蓝色系
- 提升品牌一致性和专业感

## 色彩体系

### 核心色彩

| 角色 | 色值 | 用途 |
|------|------|------|
| **页面背景** | `#ffffff` | 主页面背景 |
| **卡片背景** | `#ffffff` | 卡片、面板（带阴影）|
| **次级背景** | `#f5f7fa` | 侧边栏、区块分隔 |
| **三级背景** | `#e8eef5` | 输入框、悬浮背景 |
| **主强调色** | `#00A4E4` | 主按钮、当前步骤、图标高亮 |
| **次强调色** | `#0077C8` | 链接、悬停状态、已完成步骤 |
| **深色强调** | `#003366` | 页脚、重要标题、Hero渐变 |
| **文字主色** | `#1a1a1a` | 主标题、重要文字 |
| **文字次级** | `#4a5568` | 正文、描述 |
| **文字辅助** | `#718096` | 占位符、禁用状态 |
| **边框** | `#e2e8f0` | 卡片边框、分割线 |

### 渐变定义

```css
/* Hero 区域渐变 */
background: linear-gradient(135deg, #003366 0%, #0077C8 50%, #00A4E4 100%);

/* 按钮渐变 */
background: linear-gradient(135deg, #0077C8 0%, #00A4E4 100%);

/* 卡片悬浮阴影 */
box-shadow: 0 4px 20px rgba(0, 119, 200, 0.15);
```

## 组件色彩映射

### 全局
| 元素 | 旧值 | 新值 |
|------|------|------|
| 页面背景 | `#0a0a0a` | `#ffffff` |
| 文字主色 | `#ffffff` | `#1a1a1a` |
| 文字次级 | `#e5e5e5` | `#4a5568` |
| 边框 | `rgba(255,255,255,0.1)` | `#e2e8f0` |

### HeroSection
| 元素 | 旧值 | 新值 |
|------|------|------|
| 背景 | 黑色 + 红青光晕 | 深蓝渐变 `#003366` → `#00A4E4` |
| 标题"智"字 | 红色 `#dc2626` | 亮蓝 `#00A4E4` |
| 副标题 | 青色 `#06b6d4` | 浅蓝 `#87CEEB` |
| CTA按钮 | 红色背景 | 亮蓝 `#00A4E4` 背景 |
| 品牌Badge背景 | `bg-neutral-900/80` | `bg-white/20` |
| 品牌Badge文字 | `text-neutral-300` | `text-white` |
| 特性列表符号 | `text-cyan-500` | `text-white` |
| 特性列表文字 | `text-neutral-200` | `text-white/90` |
| 脚注 | `text-neutral-600` | `text-white/60` |
| 几何装饰环-外 | `border-red-500/20` | `border-white/30` |
| 几何装饰环-中 | `border-cyan-500/30` | `border-white/20` |
| 浮动元素 | 红/青半透明 | 白半透明 |

### AxisSidebar
| 元素 | 旧值 | 新值 |
|------|------|------|
| 背景 | `bg-neutral-900/80` | `bg-[#f5f7fa]` |
| 边框 | `border-neutral-800` | `border-[#e2e8f0]` |
| Logo图标背景 | `bg-red-600` | `bg-[#00A4E4]` |
| 项目信息按钮-默认 | `bg-neutral-800 border-neutral-700` | `bg-white border-[#e2e8f0]` |
| 项目信息按钮-激活 | `bg-cyan-500/10 border-cyan-500/50` | `bg-[#00A4E4]/10 border-[#00A4E4]/50` |
| 项目信息图标-默认 | `bg-neutral-900 text-neutral-400` | `bg-[#f5f7fa] text-[#718096]` |
| 项目信息图标-激活 | `bg-cyan-500/20 text-cyan-400` | `bg-[#00A4E4]/20 text-[#00A4E4]` |
| 通用参数按钮-激活 | `bg-amber-500/10 border-amber-500/50` | `bg-[#0077C8]/10 border-[#0077C8]/50` |
| 通用参数图标-激活 | `bg-amber-500/20 text-amber-400` | `bg-[#0077C8]/20 text-[#0077C8]` |
| 轴数量文字 | `text-neutral-500` | `text-[#718096]` |
| 添加轴按钮 | `text-red-400 bg-red-500/5 border-red-500/30` | `text-[#00A4E4] bg-[#00A4E4]/5 border-[#00A4E4]/30` |
| 项目摘要背景 | `bg-neutral-900/50` | `bg-[#e8eef5]` |
| 统计卡片背景 | `bg-neutral-800 border-neutral-700` | `bg-white border-[#e2e8f0]` |
| 统计数字-已完成 | `text-cyan-400` | `text-[#00A4E4]` |
| 统计数字-配置中 | `text-amber-400` | `text-[#0077C8]` |
| 导出按钮 | `text-neutral-400 bg-neutral-800 border-neutral-700` | `text-[#4a5568] bg-white border-[#e2e8f0]` |

### StepIndicator
| 元素 | 旧值 | 新值 |
|------|------|------|
| 步骤点-当前 | `bg-red-600 shadow-glow-red` | `bg-[#00A4E4] shadow-[0_0_20px_rgba(0,164,228,0.4)]` |
| 步骤点-已完成 | `bg-cyan-500` | `bg-[#0077C8]` |
| 步骤点-未完成 | `bg-neutral-800 border-neutral-700` | `bg-white border-[#e2e8f0]` |
| 步骤文字-当前 | `text-red-400` | `text-[#00A4E4]` |
| 步骤文字-已完成 | `text-cyan-400` | `text-[#0077C8]` |
| 步骤文字-未完成 | `text-neutral-500` | `text-[#718096]` |
| 连接线-已完成 | `bg-cyan-500` | `bg-[#0077C8]` |
| 连接线-未完成 | `bg-neutral-700` | `bg-[#e2e8f0]` |

### AxisSidebarItem
| 元素 | 旧值 | 新值 |
|------|------|------|
| 容器-默认 | `bg-neutral-800/50 border-neutral-700/50` | `bg-white border-[#e2e8f0]` |
| 容器-激活 | `bg-cyan-500/10 border-cyan-500/50` | `bg-[#00A4E4]/10 border-[#00A4E4]/50` |
| 状态指示器-已完成 | `bg-cyan-500` | `bg-[#0077C8]` |
| 状态指示器-配置中 | `bg-amber-500` | `bg-[#00A4E4]` |
| 轴名称-默认 | `text-white` | `text-[#1a1a1a]` |
| 轴名称-激活 | `text-cyan-400` | `text-[#00A4E4]` |
| 状态文字 | `text-neutral-500` | `text-[#718096]` |
| 编辑按钮 | `text-neutral-600 hover:text-cyan-400` | `text-[#718096] hover:text-[#00A4E4]` |
| 删除按钮 | `text-neutral-600 hover:text-red-400` | `text-[#718096] hover:text-red-500` |

### 表单元素
| 元素 | 旧值 | 新值 |
|------|------|------|
| 输入框背景 | `bg-[#262626]` | `bg-white` |
| 输入框边框 | `border-[rgba(255,255,255,0.1)]` | `border-[#e2e8f0]` |
| 输入框文字 | `text-white` | `text-[#1a1a1a]` |
| 输入框聚焦边框 | `border-[#06b6d4]` | `border-[#00A4E4]` |
| 输入框聚焦阴影 | `rgba(6,182,212,0.15)` | `rgba(0,164,228,0.15)` |
| 选择框背景 | `bg-[#262626]` | `bg-white` |
| 标签文字 | `text-[#e5e5e5]` | `text-[#4a5568]` |

### 按钮样式
| 元素 | 旧值 | 新值 |
|------|------|------|
| 主按钮背景 | `bg-[#dc2626]` | `bg-[#00A4E4]` |
| 主按钮悬停 | `bg-[#ef4444] shadow-glow-red` | `bg-[#0077C8] shadow-[0_0_20px_rgba(0,164,228,0.4)]` |
| 次按钮边框 | `border-[#06b6d4] text-[#06b6d4]` | `border-[#00A4E4] text-[#00A4E4]` |
| 次按钮悬停 | `bg-[rgba(6,182,212,0.1)]` | `bg-[rgba(0,164,228,0.1)]` |
| 幽灵按钮 | `text-[#737373] hover:bg-[#262626]` | `text-[#718096] hover:bg-[#e8eef5]` |

### 卡片样式
| 元素 | 旧值 | 新值 |
|------|------|------|
| 卡片背景 | `bg-[#1a1a1a]` | `bg-white` |
| 卡片边框 | `border-[rgba(255,255,255,0.06)]` | `border-[#e2e8f0]` |
| 卡片悬停 | `border-[rgba(255,255,255,0.2)] shadow-lg` | `border-[#00A4E4]/30 shadow-[0_4px_20px_rgba(0,119,200,0.15)]` |

### 状态标签
| 元素 | 旧值 | 新值 |
|------|------|------|
| 成功标签背景 | `rgba(34,197,94,0.15)` | `rgba(34,197,94,0.1)` |
| 成功标签边框 | `rgba(34,197,94,0.3)` | `rgba(34,197,94,0.2)` |
| 警告标签背景 | `rgba(245,158,11,0.15)` | `rgba(245,158,11,0.1)` |
| 警告标签边框 | `rgba(245,158,11,0.3)` | `rgba(245,158,11,0.2)` |
| 信息标签背景 | `rgba(6,182,212,0.15)` | `rgba(0,164,228,0.1)` |
| 信息标签边框 | `rgba(6,182,212,0.3)` | `rgba(0,164,228,0.2)` |
| 信息标签文字 | `var(--brand-cyan)` | `#00A4E4` |

## 动画与效果

### 阴影更新
```css
/* 蓝色光晕（替代红色光晕） */
--shadow-glow-blue: 0 0 40px rgba(0, 164, 228, 0.4);
--shadow-glow-blue-sm: 0 0 20px rgba(0, 164, 228, 0.3);

/* 卡片阴影 */
--shadow-card: 0 4px 20px rgba(0, 119, 200, 0.15);
--shadow-card-hover: 0 8px 30px rgba(0, 119, 200, 0.2);
```

### 动画保持
- 所有 fadeIn、slideIn 等动画保持不变
- pulse-glow 动画改为蓝色
- float 动画保持不变

## 文件变更清单

### 必须修改的文件
1. `src/app/globals.css` - CSS 变量和全局样式
2. `tailwind.config.ts` - Tailwind 配置
3. `src/components/hero/HeroSection.tsx` - Hero 区域
4. `src/components/wizard/StepIndicator.tsx` - 步骤指示器
5. `src/components/wizard/AxisSidebar.tsx` - 侧边栏
6. `src/components/wizard/AxisSidebarItem.tsx` - 轴列表项

### 需要检查的文件
- `src/components/wizard/steps/*.tsx` - 各步骤表单
- `src/components/wizard/SystemSummary.tsx` - 系统摘要
- `src/components/wizard/DetailedCalculations.tsx` - 详细计算
- `src/components/wizard/MotorSelectionPanel.tsx` - 电机选择
- `src/components/wizard/DriveConfigurationPanel.tsx` - 驱动器配置

## 测试要点

1. 所有文字在白色背景上可读性良好
2. 蓝色对比度符合 WCAG 标准
3. 各状态（hover、active、disabled）清晰可见
4. 深色 Hero 区域与白色内容区域过渡自然
5. 打印样式正常工作

## 参考

- XC20 产品主页截图：`test-results/2026_213512_www.boschrexroth.com.cn.jpeg`
- Bosch Rexroth 品牌色彩规范
