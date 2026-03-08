# i18n 翻译缺口分析报告

## 检测方法

### 1. 静态代码扫描
使用正则表达式搜索代码中的中文字符：
```bash
# 搜索2个以上的中文字符（排除注释中的单个字）
grep -rn '[一-龥]{2,}' src/
```

### 2. 分类规则
- **已翻译**：使用 `t('key')` 或 `useTranslations` 的内容
- **未翻译**：硬编码的中文字符串
- **排除项**：注释、类型定义中的文档字符串

## 发现的主要未翻译内容

### A. 页面级别 (page.tsx)
| 位置 | 当前中文 | 建议翻译键 |
|------|----------|------------|
| 标题 | 欢迎使用伺服选型工具 | `home.welcomeTitle` |
| 副标题 | 专业的 Bosch Rexroth XC20 + MC20 伺服系统选型向导 | `home.welcomeSubtitle` |
| 卡片标题1 | 配置项目 | `home.cards.projectConfig` |
| 卡片描述1 | 设置项目信息和公共参数 | `home.cards.projectConfigDesc` |
| 卡片标题2 | 添加轴 | `home.cards.addAxis` |
| 卡片描述2 | 配置机械结构和运动参数 | `home.cards.addAxisDesc` |
| 按钮 | 添加第一个轴 / 先设置项目信息 | `home.buttons.addFirstAxis` / `home.buttons.setProjectFirst` |
| 加载中 | 加载中... | 已存在 `common.loading` |
| 页头标题 | 博世力士乐伺服选型工具 | `home.pageTitle` |
| 页头副标题 | XC20 + MC20 伺服系统选型向导 | `home.pageSubtitle` |
| 状态标签 | 当前配置 | `axis.currentConfig` |
| 状态标签 | 配置中 | `axis.status.configuring` |
| 状态标签 | 已完成 | `axis.status.completed` |
| Footer | Bosch Rexroth 伺服选型工具 v1.0 | `footer.version` |

### B. 侧栏组件 (AxisSidebar.tsx)
| 位置 | 当前中文 | 建议翻译键 |
|------|----------|------------|
| Logo标题 | 伺服选型 | `sidebar.logoTitle` |
| Logo副标题 | Servo Sizing Tool | `sidebar.logoSubtitle` (英文保持) |
| 项目状态 | 未命名项目 | `sidebar.unnamedProject` |
| 项目状态 | 编辑中... | `sidebar.editing` |
| 项目状态 | 点击编辑 | `sidebar.clickToEdit` |
| 公共参数按钮 | 公共参数 | `sidebar.commonParams` |
| 公共参数描述 | 电压、海拔等 | `sidebar.commonParamsDesc` |
| 轴列表标题 | 轴配置 | `sidebar.axisConfig` |
| 轴计数 | N 个轴 | `sidebar.axisCount` |
| 添加轴按钮 | 添加第一个轴 / 添加新轴 | `sidebar.addFirstAxis` / `sidebar.addNewAxis` |
| 汇总标题 | 项目汇总 | `sidebar.projectSummary` |
| 统计标签 | 已完成 | `sidebar.completed` |
| 统计标签 | 配置中 | `sidebar.configuring` |

### C. 步骤组件

#### MechanismStep.tsx
| 位置 | 当前中文 | 建议翻译键 |
|------|----------|------------|
| 副标题 | 选择传动机构类型并配置参数 | `mechanism.subtitle` |
| 标签 | 传动机构类型 | `mechanism.typeLabel` |
| 分组标题 | 参数配置 | `mechanism.paramsTitle` |
| Hint文本 | 包含工作台和工件的总质量 | `mechanism.hints.loadMass` |
| Hint文本 | 丝杠每转一圈的移动距离 | `mechanism.hints.lead` |

#### MotionStep.tsx
| 位置 | 当前中文 | 建议翻译键 |
|------|----------|------------|
| 副标题 | 定义运动行程、速度和加速度参数 | `motion.subtitle` |
| 标签 | 速度曲线类型 | `motion.profileLabel` |
| 曲线描述 | 恒加速运动 | `motion.profileDesc.trapezoidal` |
| 曲线描述 | 平滑加减速 | `motion.profileDesc.sCurve` |
| 分组标题 | 运动参数 | `motion.paramsTitle` |
| Hint文本 | 运动轴的总行程范围 | `motion.hints.stroke` |
| Hint文本 | 最大运行速度 | `motion.hints.maxVelocity` |
| Hint文本 | 最大加速度 | `motion.hints.maxAcceleration` |
| Hint文本 | 到位后的停留时间 | `motion.hints.dwellTime` |
| Hint文本 | 完整运动周期时间 | `motion.hints.cycleTime` |
| 统计标签 | 理论节拍 | `motion.stats.cycleRate` |
| 统计单位 | 次/分钟 | `motion.stats.cyclesPerMinute` |
| 统计标签 | 加速度比 | `motion.stats.accelRatio` |
| 统计标签 | 最大速度 | `motion.stats.maxSpeed` |
| 统计标签 | 行程 | `motion.stats.stroke` |

### D. 其他组件（需要进一步扫描）
- DutyStep.tsx
- SystemConfigStep.tsx
- ResultStep.tsx
- ProjectInfoEditStep.tsx
- CommonParamsEditStep.tsx
- AxisSidebarItem.tsx
- DetailedCalculations.tsx
- SystemSummary.tsx

## 优先级建议

### P0 - 核心界面（必须立即翻译）
1. page.tsx - 首页和主布局
2. AxisSidebar.tsx - 侧栏导航
3. StepIndicator.tsx - 步骤指示器（已部分翻译）

### P1 - 步骤页面（重要）
4. MechanismStep.tsx
5. MotionStep.tsx
6. DutyStep.tsx
7. SystemConfigStep.tsx
8. ResultStep.tsx

### P2 - 编辑和辅助页面
9. ProjectInfoEditStep.tsx
10. CommonParamsEditStep.tsx
11. DetailedCalculations.tsx
12. SystemSummary.tsx

## 实施建议

1. **按组件逐个处理**：每次处理一个组件，确保翻译完整
2. **同步更新双语**：每次添加中文键时，同时添加英文翻译
3. **使用一致的命名规范**：`模块.子模块.键名` 格式
4. **复用已有键**：优先使用 `common.*` 中的通用翻译
