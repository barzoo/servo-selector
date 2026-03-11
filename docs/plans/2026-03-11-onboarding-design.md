# 智能空状态引导页设计文档

**日期**: 2026-03-11
**主题**: 首页引导页（Onboarding / Smart Empty State）
**状态**: 已确认，待实现

---

## 1. 设计目标

解决用户首次进入工具时"失去方向"的问题，通过清晰的引导帮助用户理解：
- 这个工具能做什么（价值主张）
- 配置流程是什么样的（流程预览）
- 如何开始（行动召唤）

---

## 2. 目标用户

**混合用户群体**：
- 新手销售：需要了解工具能力和流程
- 有经验的销售：希望快速开始配置

---

## 3. 设计决策

### 3.1 呈现方式：智能空状态

- 当 `project.axes.length === 0` 时显示引导内容
- 用户添加第一个轴后自然消失，过渡到正常向导界面
- 不增加额外页面跳转，保持单页应用体验

### 3.2 内容结构：渐进式三层布局

```
┌─────────────────────────────────────────┐
│  1. 价值主张区 (Hero Section)            │
│     - 大标题 + 副标题                    │
│     - 3个核心卖点卡片                    │
├─────────────────────────────────────────┤
│  2. 流程预览区 (Process Preview)         │
│     - 两层级6步流程可视化                │
│     - 清晰区分项目配置和轴配置           │
├─────────────────────────────────────────┤
│  3. 行动召唤区 (CTA Section)             │
│     - 主按钮：开始配置项目               │
│     - 次要链接：加载已有项目             │
└─────────────────────────────────────────┘
```

---

## 4. 详细设计

### 4.1 价值主张区

**文案内容：**

| 元素 | 中文 | 英文 |
|------|------|------|
| 大标题 | 专业的伺服系统选型工具 | Professional Servo Sizing Tool |
| 副标题 | 为 Bosch Rexroth XC20 + MC20 系列快速生成完整的技术方案 | Generate complete technical solutions for Bosch Rexroth XC20 + MC20 series |

**3个核心卖点卡片：**

1. **向导式配置**（图标：Route/Map）
   - 中文：5步引导，降低选型门槛
   - 英文：5-step wizard simplifies sizing process

2. **智能计算**（图标：Calculator/Brain）
   - 中文：自动计算负载惯量、扭矩需求、制动电阻
   - 英文：Auto-calculate inertia, torque, and braking resistor

3. **专业报告**（图标：FileText）
   - 中文：一键导出PDF技术规格书
   - 英文：One-click PDF technical specification

**视觉设计：**
- 背景：保持现有的渐变光晕效果
- 卡片：使用现有的 `.card` 样式，hover 时有轻微上浮效果

### 4.2 流程预览区（两层级设计）

**视觉结构：**

```
阶段一：项目配置（所有轴共享）
┌─────────┐    ┌─────────┐
│  项目   │───→│  公共   │
│  信息   │    │  参数   │
└─────────┘    └─────────┘
   步骤1          步骤2

阶段二：轴配置（每个轴独立）← 可重复多次
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  机械   │──→│  运动   │──→│  工况   │──→│  系统   │
│  参数   │   │  参数   │   │  条件   │   │  配置   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
   步骤3         步骤4         步骤5         步骤6
```

**详细说明：**

| 阶段 | 步骤 | 图标 | 标题 | 说明（中文） | 说明（英文） |
|------|------|------|------|-------------|-------------|
| **项目配置** | 1 | Folder | 项目信息 | 项目名称、客户、销售人员 | Project name, customer, sales person |
| | 2 | Sliders | 公共参数 | 电压、海拔、环境温度（所有轴共享） | Voltage, altitude, ambient temp (shared) |
| **轴配置** | 3 | Cog | 机械参数 | 传动方式、负载质量、减速比 | Mechanism type, load mass, gear ratio |
| | 4 | Activity | 运动参数 | 行程、速度、加速度曲线 | Travel, speed, acceleration profile |
| | 5 | Gauge | 工况条件 | 占空比、安装方向、防护等级 | Duty cycle, mounting, protection class |
| | 6 | CheckCircle | 系统配置 | 电机、驱动器、配件选择 | Motor, drive, and accessory selection |

**视觉区分：**
- 阶段一（项目配置）：使用 `primary` 色系，表示基础设置
- 阶段二（轴配置）：使用 `green` 色系，表示可重复的业务流程
- 两个阶段之间用分隔线 + "可重复配置多个轴"提示文字

### 4.3 行动召唤区

**按钮布局：**

```
[  开始配置项目  ]  ← 主按钮，primary样式

或加载已有项目 →  ← 次要链接（如有历史项目）
```

**按钮行为：**
- 主按钮：调用 `setMainViewMode('edit-project')`，进入项目信息编辑
- 次要链接：检测 localStorage，如有历史项目则显示

---

## 5. 组件结构

```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingEmptyState.tsx    # 主容器组件
│       ├── ValueProposition.tsx        # 价值主张区
│       ├── ProcessPreview.tsx          # 两层级流程预览
│       └── CTASection.tsx              # 行动召唤区
```

---

## 6. i18n 配置

新增 `onboarding` 命名空间到 i18n messages：

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

---

## 7. 与现有系统集成

### 7.1 触发条件

在 `page.tsx` 的 `renderMainContent` 函数中，当 `project.axes.length === 0` 时渲染 `OnboardingEmptyState` 替代现有的简单空状态。

### 7.2 状态复用

- 复用现有的 `mainViewMode` 状态
- 复用现有的 `createProject` 和项目编辑流程
- 无需新增全局状态

### 7.3 样式复用

- 使用现有的 `.card`、`.btn`、`.gradient-text` 等样式类
- 保持与 StepIndicator 一致的视觉风格

---

## 8. 验收标准

- [ ] 首次访问用户看到完整的引导页（价值主张 + 流程预览 + CTA）
- [ ] 流程预览清晰展示两层级6步结构
- [ ] 点击"开始配置项目"进入项目信息编辑
- [ ] 添加第一个轴后引导页消失，显示正常向导
- [ ] 支持中英文切换
- [ ] 响应式布局（移动端垂直排列流程步骤）

---

## 9. 后续扩展建议

**第二阶段可考虑添加：**
- 示例项目模板（龙门系统、传送带等）
- 视频教程入口
- 最近项目列表（卡片式预览）

---

**设计确认**: 已确认
**下一步**: 创建实现计划（Invoke writing-plans skill）
