# 选型结果页面深色主题统一设计文档

## 问题诊断

选型结果页面（ResultStep）存在严重的设计不一致问题：

| 组件 | 当前主题 | 问题 |
|------|---------|------|
| `ResultStep.tsx` | 深色工业主题 | 与整体一致 |
| `SystemSummary.tsx` | 浅色商务主题 | 使用 `bg-white`, `text-gray-900` 等 |
| `DetailedCalculations.tsx` | 浅色商务主题 | 使用 `bg-blue-50`, `text-gray-700` 等 |

这导致结果页面视觉割裂，一半是深色工业风，一半是浅色商务风。

## 设计目标

将 `SystemSummary` 和 `DetailedCalculations` 完全迁移到项目的深色工业主题，实现视觉统一。

## 颜色映射规范

### 背景色映射

| 原浅色值 | 映射为深色变量 | 用途 |
|---------|---------------|------|
| `bg-white` | `bg-[var(--background-secondary)]` | 卡片背景 |
| `bg-gray-50` | `bg-[var(--background-tertiary)]` | 次级背景、表头 |
| `bg-blue-50` | `bg-[var(--primary-500)]/10` | 电机详情标题栏 |
| `bg-green-50` | `bg-[var(--green-500)]/10` | 驱动器详情标题栏 |
| `bg-purple-50` | `bg-[var(--primary-500)]/10` | 电缆标题栏 |
| `bg-orange-50` | `bg-[var(--amber-500)]/10` | 附件标题栏 |
| `bg-red-50` | `bg-[var(--red-500)]/10` | 再生能量警告标题栏 |
| `bg-yellow-50` | `bg-[var(--amber-500)]/10` | 警告提示背景 |

### 文字色映射

| 原浅色值 | 映射为深色变量 | 用途 |
|---------|---------------|------|
| `text-gray-900` | `text-[var(--foreground)]` | 主要文字 |
| `text-gray-700` | `text-[var(--foreground-secondary)]` | 次级文字 |
| `text-gray-500` | `text-[var(--foreground-muted)]` | 辅助文字 |
| `text-gray-600` | `text-[var(--foreground-secondary)]` | 描述文字 |
| `text-blue-900` | `text-[var(--primary-300)]` | 主题标题 |
| `text-green-900` | `text-[var(--green-400)]` | 成功标题 |
| `text-purple-900` | `text-[var(--primary-300)]` | 电缆标题 |
| `text-orange-900` | `text-[var(--amber-400)]` | 附件标题 |
| `text-red-900` | `text-[var(--red-400)]` | 警告标题 |

### 边框色映射

| 原浅色值 | 映射为深色变量 | 用途 |
|---------|---------------|------|
| `border-gray-200` | `border-[var(--border-default)]` | 卡片边框 |
| `border-gray-100` | `border-[var(--border-subtle)]` | 内部分隔线 |
| `border-blue-100` | `border-[var(--primary-500)]/20` | 电机卡片边框 |
| `border-green-100` | `border-[var(--green-500)]/20` | 驱动器卡片边框 |

## 组件改造规范

### SystemSummary 组件

#### 1. 配置列表表格

```
容器: card 样式 (已定义在 globals.css)
表头: bg-[var(--background-tertiary)], text-[var(--foreground-secondary)]
表格行: hover:bg-[var(--background-tertiary)]/50
料号: font-mono text-[var(--primary-300)]
类型: text-[var(--foreground-secondary)]
描述: text-[var(--foreground-muted)]
```

#### 2. 电机详情卡片

```
容器: card 样式
标题栏: bg-[var(--primary-500)]/10, border-b border-[var(--primary-500)]/20
标题文字: text-[var(--primary-300)]
参数标签: text-[var(--foreground-muted)]
参数值: text-[var(--foreground)], number-display 字体
选项区域: border-t border-[var(--border-subtle)]
```

#### 3. 驱动器详情卡片

```
容器: card 样式
标题栏: bg-[var(--green-500)]/10, border-b border-[var(--green-500)]/20
标题文字: text-[var(--green-400)]
其他同电机卡片
```

#### 4. 电缆规格卡片

```
容器: card 样式
标题栏: bg-[var(--primary-500)]/10, border-b border-[var(--primary-500)]/20
内部卡片: bg-[var(--background-tertiary)], rounded-lg
标签: text-[var(--foreground-muted)]
值: text-[var(--foreground)]
料号: font-mono text-[var(--primary-300)]
```

#### 5. 附件卡片

```
容器: card 样式
标题栏: bg-[var(--amber-500)]/10, border-b border-[var(--amber-500)]/20
标题文字: text-[var(--amber-400)]
```

#### 6. 再生能量卡片

```
容器: card 样式
标题栏: bg-[var(--red-500)]/10, border-b border-[var(--red-500)]/20
标题文字: text-[var(--red-400)]
警告提示: bg-[var(--amber-500)]/10, border-[var(--amber-500)]/30, text-[var(--amber-400)]
```

### DetailedCalculations 组件

#### 1. 折叠面板按钮

```
背景: bg-[var(--background-tertiary)]
Hover: bg-[var(--background-elevated)]
文字: text-[var(--foreground)]
图标: text-[var(--foreground-muted)]
```

#### 2. 展开内容区域

```
背景: bg-[var(--background-secondary)]
边框: border-[var(--border-subtle)]
```

#### 3. 计算卡片

```
容器: bg-[var(--background-secondary)], border border-[var(--border-default)], rounded-lg
标题栏: bg-[var(--primary-500)]/10, border-b border-[var(--border-subtle)]
标题文字: text-[var(--primary-300)]
参数标签: text-[var(--foreground-secondary)]
参数值: number-display 字体
  - 正值: text-[var(--green-400)]
  - 负值: text-[var(--red-400)]
  - 警告: text-[var(--amber-400)]
  - 中性: text-[var(--foreground)]
分隔线: border-[var(--border-subtle)]
```

#### 4. 状态标签

```
再生制动警告: badge-warning 样式 (已定义在 globals.css)
正常状态: badge-success 样式
```

## 交互增强

1. **表格行 hover**: 添加 `hover:bg-[var(--background-tertiary)]/50` 和过渡动画
2. **卡片悬浮**: 添加 `card-hover` 类支持悬浮动画
3. **折叠动画**: 保持现有的展开/收起动画

## 实施文件清单

1. `src/components/wizard/SystemSummary.tsx` - 系统配置摘要组件
2. `src/components/wizard/DetailedCalculations.tsx` - 详细计算组件

## 验收标准

- [ ] 所有浅色颜色变量已替换为深色主题变量
- [ ] 表格、卡片、折叠面板样式统一
- [ ] 料号使用等宽字体显示
- [ ] 数值使用 number-display 类
- [ ] 标题栏使用对应主题色的半透明背景
- [ ] 警告信息使用 amber 色系
- [ ] 整体视觉与 ResultStep 其他部分协调一致
