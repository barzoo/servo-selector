# Servo Selector - 伺服系统选型工具

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Zustand-5.0-orange?style=flat-square" alt="Zustand">
</p>

## 项目简介

这是一个个人兴趣项目，用于学习和实践伺服系统选型计算。根据机械负载和运动控制需求，快速生成伺服系统配置方案及技术规格书。

**当前支持的产品范围**: XC20 伺服驱动 + MC20 伺服电机

> ⚠️ **免责声明**: 本项目为个人学习项目，非博世力士乐官方工具。选型结果仅供参考，实际工程应用请以官方资料为准。

## 功能特性

### 向导式选型流程

1. **项目信息** - 项目名称、客户信息、方案备注
2. **机械参数** - 负载质量、传动方式（丝杠/齿轮/直接驱动）、机械效率
3. **运动参数** - 行程、最大速度、最大加速度、运动曲线类型
4. **工况条件** - 环境温度、占空比、安装方向、防护等级
5. **系统配置** - 电机选择、驱动器配置、配件配置

### 选型计算引擎

- **电机选型算法**: 基于安全余量法，计算负载惯量、扭矩、RMS等效扭矩
- **制动电阻自动计算**: 根据再生能量计算自动推荐制动电阻
- **惯量匹配验证**: 确保负载惯量与电机转子惯量之比在合理范围

### 结果展示与导出

- 系统配置摘要与可视化展示
- 技术验证指示（扭矩余量、惯量比、制动能力）
- **PDF技术规格书导出** - 包含BOM清单、电机参数表、驱动器参数表

### 多语言支持

- 中文 (zh)
- English (en)
- Deutsch (de)

## 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Next.js 14 (App Router) | React框架，支持静态导出 |
| 编程语言 | TypeScript | 类型安全 |
| 样式方案 | TailwindCSS | 原子化CSS，响应式设计 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 国际化 | next-intl | 多语言支持 |
| PDF生成 | jsPDF + html2canvas | 客户端PDF生成 |
| 部署平台 | Vercel | 静态站点托管 |

## 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

构建输出位于 `dist` 目录。

### 运行测试

```bash
npm test
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页/入口
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   └── wizard/            # 选型向导页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── wizard/           # 向导相关组件
│   └── forms/            # 表单组件
├── lib/                  # 工具库
│   ├── calculations/     # 选型算法
│   ├── pdf/              # PDF生成
│   └── utils/            # 通用工具
├── stores/               # Zustand状态管理
├── types/                # TypeScript类型定义
├── i18n/                 # 国际化配置
└── data/                 # 静态数据（JSON）
    ├── motors.json       # MC20电机数据
    ├── drives.json       # XC20驱动器数据
    ├── cables.json       # 电缆数据
    └── resistors.json    # 制动电阻数据

docs/
├── specs/                # 需求规格文档
├── plans/                # 算法设计文档
└── data/                 # 产品数据文档
```

## 配置说明

### 基础路径配置

项目配置了 `basePath: '/apps/servo-selector'`，用于部署在子路径下。如需更改，请修改 `next.config.mjs`：

```javascript
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/apps/servo-selector',      // 修改为您的路径
  assetPrefix: '/apps/servo-selector',   // 修改为您的路径
  // ...
};
```

### 数据更新

电机、驱动器等数据存储在 `src/data/` 目录下的 JSON 文件中。更新数据后，请运行验证脚本：

```bash
npm run validate-data
```

## 算法引用

### 电机选型计算
- 参考: "Servo Motor Sizing for Motion Control Applications", Rockwell Automation
- 惯量匹配原则: JL/Jm ≤ 10:1（高性能），≤ 30:1（一般应用）

### 再生能量计算
- 参考: "Braking Resistor Sizing for Servo Drives", Bosch Rexroth
- 公式: E = ½J(ω₁² - ω₂²)

### RMS扭矩计算
- 参考: IEEE Standard for Motor Selection

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

支持响应式设计，适配平板和手机浏览。

## 许可证

MIT License - 个人学习项目

## 作者

- **Xing** - 个人兴趣开发

---

<p align="center">
  个人学习项目 | 仅供学习交流使用
</p>
