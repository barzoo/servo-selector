# Excel 项目导出设计文档

> **设计日期**: 2026-03-10
> **功能**: 导出项目核心信息到 Excel 文件，方便销售使用

---

## 1. 需求背景

当前系统支持导出 PDF 和 JSON 数据，但销售团队更习惯使用 Excel 进行数据查看和分享。Excel 格式便于：
- 快速筛选和排序
- 复制粘贴到其他系统
- 离线查看和编辑
- 与其他 Excel 数据合并

---

## 2. 设计目标

- **单工作表**：所有信息在一个表格中，便于快速浏览
- **轴为主行**：每行代表一个轴，列显示该轴的所有产品
- **信息完整**：包含项目信息、轴配置、产品型号、公共参数
- **易于识别**：导出按钮与 PDF 按钮并排，图标区分

---

## 3. 表格结构

### 3.1 主表格（轴列表）

| 列名 | 说明 | 示例 |
|------|------|------|
| 轴名称 | 轴的显示名称 | 轴-1, X轴, 升降轴 |
| 传动类型 | 机械传动方式 | 滚珠丝杠, 齿轮箱, 皮带 |
| 负载质量(kg) | 负载质量 | 100 |
| 电机型号 | 选中的电机型号 | MC20-0240-xxx |
| 驱动器型号 | 选中的驱动器型号 | XC20-0400-xxx |
| 电机电缆 | 电机电缆规格 | 5m |
| 编码器电缆 | 编码器电缆规格 | 5m |
| 通讯电缆 | 通讯电缆规格（如有） | 5m 或 - |
| 制动电阻 | 是否配置制动电阻 | 有 或 - |
| 状态 | 轴的配置状态 | 已完成, 配置中 |

### 3.2 附加信息区域

在表格下方（从第 N+3 行开始）：

**项目信息块**
```
项目信息
项目名称: [project.name]
客户: [project.customer]
销售员: [project.salesPerson]
备注: [project.notes]
```

**公共参数块**
```
公共参数
环境温度: [commonParams.ambientTemp]°C
防护等级: [commonParams.ipRating]
通讯协议: [commonParams.communication]
电缆长度: [commonParams.cableLength]m
安全系数: [commonParams.safetyFactor]
最大惯量比: [commonParams.maxInertiaRatio]:1
```

**BOM 汇总块**
```
物料清单汇总
序号 | 物料号 | 描述 | 数量 | 使用轴
1 | MC20-0240-xxx | 伺服电机 | 2 | 轴-1, 轴-2
2 | XC20-0400-xxx | 伺服驱动器 | 2 | 轴-1, 轴-2
```

---

## 4. 技术方案

### 4.1 实现方式：SheetJS (xlsx)

选择 SheetJS 的原因：
- 纯 JavaScript，无需后端支持
- 支持浏览器直接下载
- 功能完整，支持样式和格式
- 社区活跃，文档完善

### 4.2 组件设计

**ExcelExportButton 组件**
- 位置：与 PDF 导出按钮并排
- 图标：📊 (Excel/表格图标)
- 文字："导出 Excel"
- 禁用状态：当没有已完成轴时禁用

**导出流程**
1. 收集项目数据（project, axes, commonParams）
2. 构建 Excel 数据结构（数组的数组）
3. 使用 SheetJS 生成工作簿
4. 触发浏览器下载

### 4.3 数据结构转换

```typescript
// 轴数据 → Excel 行数据
const axisRow = [
  axis.name,
  getMechanismTypeName(axis.input.mechanism?.type),
  getLoadMass(axis.input.mechanism),
  axis.result?.motorRecommendations[0]?.motor.model || '-',
  axis.result?.motorRecommendations[0]?.systemConfig?.drive.model || '-',
  getMotorCable(axis),
  getEncoderCable(axis),
  getCommCable(axis) || '-',
  hasBrakeResistor(axis) ? '有' : '-',
  axis.status === 'COMPLETED' ? '已完成' : '配置中'
];
```

---

## 5. 界面设计

### 5.1 按钮位置

在 ProjectDataMenu 或项目导出区域：

```
┌─────────────────────────────────────┐
│  项目数据                            │
├─────────────────────────────────────┤
│  [💾 保存项目]                      │
│  [📂 加载项目]                      │
│  [📄 导出 PDF]  [📊 导出 Excel]    │  ← 新增 Excel 按钮
│  [🗑️ 清空数据]                     │
└─────────────────────────────────────┘
```

### 5.2 按钮样式

- 与 PDF 按钮相同大小
- 绿色主题（Excel 风格）
- 禁用状态：灰色，cursor-not-allowed

---

## 6. 文件命名

格式：`项目名称_选型结果_YYYY-MM-DD.xlsx`

示例：`CNC机床项目_选型结果_2026-03-10.xlsx`

---

## 7. 边界情况处理

| 情况 | 处理 |
|------|------|
| 项目名称为空 | 使用默认名称 "未命名项目" |
| 没有已完成轴 | 按钮禁用，tooltip 提示 "请完成至少一个轴的配置" |
| 轴未选择电机 | 显示 "-" |
| 电缆长度为 terminal_only | 显示 "端子台" |

---

## 8. 验收标准

- [x] Excel 文件正确导出，包含所有轴信息
- [x] 表格格式清晰，易于阅读
- [x] 项目信息和公共参数完整
- [x] BOM 汇总正确统计
- [x] 按钮位置正确，样式一致
- [x] 文件命名规范
- [x] 中文内容正确显示
