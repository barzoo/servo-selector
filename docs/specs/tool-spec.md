# 博世力士乐伺服系统选型工具需求规格书

**版本**: 1.0
**日期**: 2026-02-27
**产品范围**: XC20 伺服驱动 + MC20 伺服电机

---

## 1. 项目概述

### 1.1 目标

为销售人员（内部销售及代理商销售）提供简单易用的在线伺服系统选型工具，根据机械负载和运动控制需求，快速生成完整的伺服系统配置方案及技术规格书。

### 1.2 核心价值

- **降低选型门槛**: 向导式流程引导，非技术人员也能准确完成选型
- **标准化流程**: 统一的选型标准和计算方法，减少人为错误
- **提升响应效率**: 快速生成专业级技术规格书PDF，加速客户响应
- **完整系统配置**: 不仅选电机，更涵盖驱动器、电缆、制动电阻、EMC滤波器等全套配件

### 1.3 产品范围

| 组件 | 选型维度 |
|------|----------|
| MC20 伺服电机 | 扭矩/转速/惯量、抱闸选项、键槽选项 |
| XC20 伺服驱动 | 功率等级、通讯接口、编码器反馈类型 |
| 制动电阻 | 根据再生能量计算自动推荐 |
| EMC滤波器 | 根据EMC等级要求配置 |
| 电缆系统 | 标准长度/定制长度/仅端子（含制作指导） |

---

## 2. 用户画像

### 2.1 目标用户

| 用户类型 | 技术背景 | 使用场景 | 核心需求 |
|----------|----------|----------|----------|
| 内部销售 | 中等 | 办公室响应客户询价 | 快速、准确、专业报告 |
| 代理商销售 | 参差 | 现场/远程协助终端客户 | 简单引导、减少技术门槛、可信输出 |

### 2.2 用户目标

1. 根据客户提供的机械参数，快速确定合适的伺服系统配置
2. 生成专业级技术文档，供客户确认和下单使用
3. 确保选型方案在技术上的可行性和安全性

---

## 3. 功能需求

### 3.1 向导式选型流程（5步）

#### Step 1: 项目信息
- 项目名称（必填）
- 客户名称（必填）
- 销售人员（选填，自动记录）
- 创建日期（自动）
- 方案备注（选填）

#### Step 2: 机械参数
- 负载质量 (kg)
- 传动方式：丝杠 / 齿轮 / 直接驱动
- 传动参数：
  - 丝杠：导程 (mm)
  - 齿轮：减速比
  - 直接驱动：无需额外参数
- 机械效率 (%，默认值85%)
- 是否有垂直轴（影响抱闸建议，是/否）
- 摩擦系数（选填，默认值0.05）

#### Step 3: 运动参数
- 行程 (mm 或 °)
- 最大速度 (mm/s 或 rpm)
- 最大加速度 (mm/s² 或 rad/s²)
- 运动曲线类型：梯形 / S曲线
- 停顿时间 (s)
- 循环周期 (s，用于计算占空比)

#### Step 4: 工况条件
- 环境温度范围 (°C)
- 占空比 (%，根据Step 3自动计算，可手动调整)
- 安装方向：水平 / 垂直向上 / 垂直向下
- 防护等级要求：IP54 / IP65 / IP67
- 特殊环境（多选）：高湿度 / 粉尘 / 腐蚀性气体 / 无

#### Step 5: 系统配置

**电机选择区域**
- 显示推荐电机列表（按匹配度排序）
- 每行显示：型号、额定扭矩、峰值扭矩、匹配度百分比
- 选择确认按钮
- 电机选项：
  - 抱闸：建议 / 不需要（根据Step 2垂直轴自动建议）
  - 键槽：需要 / 不需要

**驱动器配置区域**
- 根据电机自动筛选匹配的驱动器型号
- 通讯协议选择：EtherCAT / PROFINET / EtherNet-IP / 模拟量
- 编码器类型选择：单圈绝对值 / 多圈绝对值

**配件配置区域**
- EMC等级选择：无滤波器 / C3
- 电缆配置：
  - 电机电缆长度：3m / 5m / 10m / 15m / 20m / 自定义 / 仅端子
  - 编码器电缆长度：同上
  - 通讯电缆长度：同上（如适用）
- 制动电阻：
  - 系统根据运动参数自动计算是否需要
  - 显示推荐规格（阻值、功率、型号）
  - 允许用户覆盖选择

### 3.2 选型计算引擎

#### 3.2.1 电机选型算法（安全余量法）

**输入参数**
- 负载质量 m (kg)
- 传动参数（导程 Pb 或减速比 i）
- 运动参数（速度 v，加速度 a）
- 机械效率 η
- 安全余量系数 SF（系统默认1.5，可配置）

**计算流程**

1. **计算负载惯量 JL**
   - 丝杠传动：JL = m × (Pb/2π)² + J_screw
   - 齿轮传动：JL = m × (1/i)² × η
   - 直接驱动：JL = m（直线电机等效质量）

2. **计算负载扭矩 TL**
   - 加速扭矩：Ta = (JL + Jm) × α / η
   - 恒速扭矩：Tf = F_friction × Pb / (2π × η)
   - 重力扭矩（垂直轴）：Tg = m × g × Pb / (2π × i)

3. **计算RMS等效扭矩**
   ```
   Trms = √[(T1²×t1 + T2²×t2 + T3²×t3) / (t1+t2+t3+tdwell)]
   ```

4. **计算峰值扭矩 Tpeak**
   ```
   Tpeak = max(T_accel, T_constant, T_decel)
   ```

5. **应用安全余量**
   ```
   T_required = Tpeak × SF
   n_required = v_max × 60 / Pb（或根据减速比计算）
   ```

6. **筛选条件**
   - 额定扭矩：Tn ≥ T_required
   - 最大转速：n_max ≥ n_required
   - 惯量比：JL / Jm ≤ 10（推荐）或 ≤ 30（最大）

7. **排序输出**
   - 按扭矩余量 (Tn - T_required) 升序排列
   - 优先推荐余量适中（20%-50%）的型号

#### 3.2.2 制动电阻自动计算

**再生能量计算**
```
E_regen = 0.5 × J_total × (ω_max² - ω_min²) × n_cycles

其中：
- J_total = JL + Jm（总惯量）
- ω_max = 2π × n_max / 60（最大角速度）
- n_cycles = 每分钟循环次数
```

**判断逻辑**
```
if (E_regen > drive.internal_brake_capacity):
    P_required = E_regen / duty_cycle
    recommend_resistor = find_resistor(P_required, R_required)
```

### 3.3 结果展示与PDF导出

#### 3.3.1 结果确认页面

**系统配置摘要**
- 电机型号及关键参数
- 驱动器型号及配置
- 配件清单
- 预估系统价格区间（如适用）

**技术验证指示**
- 扭矩余量：绿色(>30%) / 黄色(10-30%) / 红色(<10%)
- 惯量比指示
- 制动能力指示

#### 3.3.2 PDF技术规格书

**必须内容**

1. **BOM清单表**
   | 序号 | 物料类型 | 型号 | 数量 | 单位 | 备注 |

2. **MC20电机技术参数表**
   - 型号
   - 额定功率 / 额定扭矩 / 峰值扭矩
   - 额定转速 / 最高转速
   - 转子惯量
   - 编码器类型及分辨率
   - 抱闸规格（如选配）
   - 防护等级
   - 重量

3. **XC20驱动器技术参数表**
   - 型号
   - 额定输出电流
   - 通讯接口
   - 编码器反馈支持
   - 内置制动能力
   - 防护等级
   - 重量

**可选内容（导出时勾选）**

- [ ] 系统接线示意图
- [ ] 选型计算摘要（负载扭矩、安全余量、惯量比等）
- [ ] 电缆制作指导（仅当选择"仅端子"时）
- [ ] 安装尺寸图

---

## 4. 数据需求

### 4.1 MC20电机数据规格

```typescript
interface MC20Motor {
  model: string;              // 型号，如 "MC20-010-xxx"
  series: string;             // 系列代码
  rated_power: number;        // 额定功率 (W)
  rated_torque: number;       // 额定扭矩 (N·m)
  peak_torque: number;        // 峰值扭矩 (N·m), 通常3倍额定
  rated_speed: number;        // 额定转速 (rpm)
  max_speed: number;          // 最高转速 (rpm)
  rotor_inertia: number;      // 转子惯量 (kg·cm²)
  torque_constant: number;    // 扭矩常数 (N·m/A)
  voltage_constant: number;   // 电压常数 (V/krpm)
  rated_current: number;      // 额定电流 (A)
  peak_current: number;       // 峰值电流 (A)
  resistance: number;         // 相电阻 (Ω)
  inductance: number;         // 相电感 (mH)
  encoder_options: string[];  // 支持的编码器类型
  has_brake_option: boolean;  // 是否支持抱闸
  has_key_option: boolean;    // 是否支持键槽
  brake_torque?: number;      // 抱闸扭矩 (N·m)
  weight: number;             // 重量 (kg)
  length_no_brake: number;    // 无抱闸长度 (mm)
  length_with_brake: number;  // 有抱闸长度 (mm)
  shaft_diameter: number;     // 轴径 (mm)
  matched_drives: string[];   // 匹配的驱动器型号列表
}
```

### 4.2 XC20驱动器数据规格

```typescript
interface XC20Drive {
  model: string;                    // 型号
  power_rating: number;             // 功率等级 (W)
  rated_current: number;            // 额定输出电流 (A)
  peak_current: number;             // 峰值输出电流 (A)
  dc_bus_voltage: number;           // 直流母线电压 (V)
  internal_brake_capacity: number;  // 内置制动电阻功率 (W)
  max_external_brake_resistor: number; // 最大外接制动电阻功率 (W)
  comm_interfaces: string[];        // 支持的通讯接口
  encoder_types: string[];          // 支持的编码器类型
  emc_filters: string[];            // 支持的EMC滤波器等级
  compatible_motors: string[];      // 兼容的电机型号列表
}
```

### 4.3 电缆数据规格

```typescript
interface CableSpec {
  type: 'motor' | 'encoder' | 'communication';
  model_prefix: string;
  standard_lengths: number[];   // 标准长度列表 (m)
  max_custom_length: number;    // 最大定制长度 (m)
  has_terminal_only_option: boolean;  // 是否支持仅端子
  terminal_kit_model?: string;  // 端子套件型号
  specs: {
    conductor_size?: string;    // 导线规格
    shielding: string;          // 屏蔽类型
    temperature_rating: string; // 温度等级
    bending_radius: number;     // 最小弯曲半径 (mm)
  };
}
```

### 4.4 制动电阻数据规格

```typescript
interface BrakeResistor {
  model: string;
  resistance: number;       // 阻值 (Ω)
  continuous_power: number; // 持续功率 (W)
  peak_power: number;       // 峰值功率 (W)
  duty_cycle: number;       // 推荐占空比 (%)
  compatible_drives: string[];
}
```

---

## 5. 非功能需求

### 5.1 性能需求

| 指标 | 目标值 |
|------|--------|
| 页面加载时间 | < 2秒（3G网络） |
| 选型计算响应 | < 500ms |
| PDF生成时间 | < 3秒 |
| 并发用户支持 | 50+ |

### 5.2 兼容性需求

- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **移动端**: 响应式设计，支持平板和手机浏览
- **离线支持**: 选型计算可离线进行（PWA）

### 5.3 安全需求

- 无用户敏感数据收集
- 选型方案本地存储，不上传服务器
- PDF导出纯前端实现

### 5.4 可维护性

- 电机/驱动器数据以JSON文件维护，易于更新
- 算法参数可配置（安全余量、最大惯量比等）
- 版本化管理，支持数据回滚

---

## 6. 界面设计原则

### 6.1 向导设计

- **进度指示**: 顶部步骤条，显示当前位置
- **步骤验证**: 每步必填项验证通过后才可下一步
- **返回修改**: 可随时返回上一步修改参数
- **参数记忆**: 离开页面后返回，保留已填参数

### 6.2 输入设计

- **单位换算**: 支持常用单位切换（mm/inch, kg/lb等）
- **智能默认值**: 根据应用场景提供合理默认值
- **实时帮助**: 悬停显示参数说明和典型值范围
- **错误提示**: 即时验证，清晰提示错误原因

### 6.3 结果展示

- **对比视图**: 支持多型号参数并排对比
- **可视化**: 扭矩-转速曲线示意图
- **风险提示**: 黄色/红色警告提示潜在问题

---

## 7. 技术架构

### 7.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Next.js 14 (App Router) | React框架，支持静态导出 |
| 编程语言 | TypeScript | 类型安全 |
| 样式方案 | TailwindCSS | 原子化CSS，响应式设计 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 数据存储 | JSON文件 | 电机/驱动器数据 |
| 本地存储 | localStorage | 保存选型方案 |
| PDF生成 | jsPDF + html2canvas | 客户端PDF生成 |
| 部署平台 | Vercel | 静态站点托管 |

### 7.2 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页/入口
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   └── wizard/            # 选型向导
│       ├── step1/         # 项目信息
│       ├── step2/         # 机械参数
│       ├── step3/         # 运动参数
│       ├── step4/         # 工况条件
│       ├── step5/         # 系统配置
│       └── result/        # 结果/PDF导出
├── components/            # 共享组件
│   ├── ui/               # 基础UI组件
│   ├── forms/            # 表单组件
│   └── charts/           # 图表组件
├── lib/                  # 工具库
│   ├── calculations/     # 选型算法
│   │   ├── motor-sizing.ts
│   │   ├── brake-resistor.ts
│   │   └── inertia.ts
│   ├── pdf/              # PDF生成
│   │   └── generator.ts
│   └── utils/            # 通用工具
├── stores/               # 状态管理
│   └── wizard-store.ts   # 向导状态
├── types/                # TypeScript类型
│   └── index.ts
└── data/                 # 数据文件（JSON）
    ├── motors.json       # MC20电机数据
    ├── drives.json       # XC20驱动器数据
    ├── cables.json       # 电缆数据
    └── resistors.json    # 制动电阻数据
```

---

## 8. 算法引用与复杂度

### 8.1 算法引用

1. **电机选型计算**
   - 参考: "Servo Motor Sizing for Motion Control Applications", Rockwell Automation Technical Literature
   - 惯量匹配原则: JL/Jm ≤ 10:1（高性能），≤ 30:1（一般应用）

2. **再生能量计算**
   - 参考: "Braking Resistor Sizing for Servo Drives", Bosch Rexroth Technical Documentation
   - 公式: E = ½J(ω₁² - ω₂²)

3. **RMS扭矩计算**
   - 参考: IEEE Standard for Motor Selection
   - 等效发热计算基于电机热时间常数

### 8.2 复杂度分析

| 算法模块 | 时间复杂度 | 空间复杂度 | 说明 |
|----------|-----------|-----------|------|
| 电机筛选 | O(n) | O(1) | n为电机型号数量，线性遍历 |
| 扭矩计算 | O(1) | O(1) | 固定公式计算 |
| 制动电阻计算 | O(1) | O(1) | 固定公式计算 |
| PDF生成 | O(m) | O(m) | m为PDF内容大小 |

---

## 9. 后续扩展规划

### 9.1 第一阶段（MVP）
- [x] 单轴伺服系统选型
- [x] 基础电机+驱动+配件配置
- [x] PDF技术规格书导出

### 9.2 第二阶段
- [ ] 多轴系统选型（龙门、机器人等）
- [ ] 选型方案保存/加载/对比
- [ ] 历史记录管理
- [ ] 价格查询接口（如开放）

### 9.3 第三阶段
- [ ] 3D安装尺寸预览
- [ ] 与选型软件的数据同步
- [ ] 多语言支持

---

## 10. 附录

### 10.1 术语表

| 术语 | 说明 |
|------|------|
| 安全余量 | 选型时预留的扭矩裕度，默认1.5倍 |
| 惯量比 | 负载惯量与电机转子惯量之比 |
| RMS扭矩 | 等效发热扭矩，用于验证电机热性能 |
| 再生能量 | 减速时电机作为发电机产生的能量 |
| EMC | 电磁兼容性 |

### 10.2 参考资料

1. Bosch Rexroth MC20 Servo Motor Catalog
2. Bosch Rexroth XC20 Servo Drive Manual
3. Bosch Rexroth Brake Resistor Sizing Guide
4. IEC 60034 旋转电机标准

---

**文档维护记录**

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-02-27 | 初始版本 | - |
