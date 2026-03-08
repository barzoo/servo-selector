# 项目数据导出/导入功能设计文档

## 概述

为伺服选型工具添加 JSON 格式的项目数据导出/导入功能，使用户能够保存和恢复完整的项目配置，实现跨会话的重复利用和配置共享。

## 设计决策

### 导出数据范围
- **整个项目**：包含项目信息、公共参数、所有轴的配置和选型结果
- 不包含：UI 状态（当前步骤、展开/折叠状态等）

### 导入行为
- 覆盖当前项目（带确认提示）
- 导入后刷新页面状态，切换到导入的项目

### 按钮位置
- 顶部工具栏，与语言切换器并排
- 使用下拉菜单整合导出/导入功能

## 架构设计

### 组件结构
```
ProjectDataManager/
├── ProjectDataMenu.tsx      # 下拉菜单组件（导出/导入入口）
├── ExportDialog.tsx         # 导出确认对话框
├── ImportDialog.tsx         # 导入文件选择对话框
└── hooks/
    └── useProjectData.ts    # 导出/导入逻辑钩子
```

### 数据流
```
导出流程：
用户点击导出 → ProjectDataMenu → useProjectData.exportProject()
→ 生成 JSON → 触发浏览器下载

导入流程：
用户点击导入 → 选择文件 → useProjectData.importProject()
→ 验证 JSON → 确认对话框 → 加载到 store
```

### 数据结构

```typescript
interface ProjectExportData {
  version: string;           // 数据格式版本，用于兼容性检查
  exportedAt: string;        // ISO 8601 时间戳
  project: Project;          // 完整的项目数据（来自 project-store）
}
```

**版本策略：**
- 当前版本：`"1.0"`
- 主版本号变更表示不兼容的结构性变化
- 次版本号变更表示向后兼容的功能添加

## UI 设计

### 顶部工具栏集成

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] 伺服选型工具                           [🌐] [⚙️] │
│                                              语言  工具  │
└─────────────────────────────────────────────────────────┘
```

### 工具下拉菜单

```
┌──────────────┐
│ 📥 导出项目   │
│ 📤 导入项目   │
│ ──────────── │
│ 📄 导出 PDF  │  ← 整合现有功能
└──────────────┘
```

**样式规范：**
- 使用 Lucide icons：Download、Upload、FileText
- 菜单使用现有的 card 样式（shadow-2xl、border）
- 与 LanguageSwitcher 保持一致的视觉风格

### 导出对话框

**内容：**
- 标题："导出项目"
- 项目摘要卡片：
  - 项目名称
  - 轴数量
  - 导出时间
- 文件名输入框（默认：`{projectName}_{YYYY-MM-DD}.json`）
- 操作按钮：取消、导出

### 导入对话框

**内容：**
- 标题："导入项目"
- 文件选择区域：
  - 拖放区域（虚线边框）
  - "选择文件"按钮
- 文件预览（选择后显示）：
  - 项目名称
  - 轴数量
  - 导出日期
- 警告提示："导入将覆盖当前项目数据"
- 操作按钮：取消、确认导入

## 错误处理与验证

### 导出时错误

| 场景 | 处理方式 |
|------|----------|
| 空项目（无轴） | 禁用导出按钮，显示提示 |
| 导出失败 | Toast 提示："导出失败，请重试" |

### 导入时验证

**验证步骤（按顺序）：**

1. **JSON 格式验证**
   - 错误提示："文件格式不正确，请检查是否为有效的 JSON 文件"

2. **必需字段验证**
   - 检查：`version`、`exportedAt`、`project`
   - 错误提示："文件格式不正确，缺少必要的数据字段"

3. **版本兼容性检查**
   - 支持：当前主版本号相同的文件
   - 警告：旧版本（尝试迁移）
   - 错误：新版本（"请更新应用后重试"）

4. **数据结构验证**
   - 检查 Project 对象的必需字段
   - 检查 axes 数组的有效性
   - 错误提示："项目数据不完整，可能已损坏"

### 确认对话框

**导入确认：**
- 标题："确认导入"
- 内容："导入将覆盖当前项目数据，此操作不可撤销。是否继续？"
- 按钮：取消、确认导入（红色强调）

## 用户体验流程

### 导出流程

```
1. 用户完成轴配置（或任何时候）
2. 点击顶部 ⚙️ 工具按钮
3. 选择"导出项目"
4. 弹出导出对话框，显示项目摘要
5. 用户可修改文件名
6. 点击"导出"
7. 浏览器下载 JSON 文件
8. Toast 提示："项目已导出"
```

### 导入流程

```
1. 用户点击顶部 ⚙️ 工具按钮
2. 选择"导入项目"
3. 弹出导入对话框
4. 用户拖放或选择 JSON 文件
5. 实时验证并显示文件预览
6. 点击"确认导入"
7. 显示确认警告对话框
8. 确认后加载项目
9. 刷新页面状态，显示导入的项目
10. Toast 提示："项目已导入"
```

## 技术实现

### 导出逻辑

```typescript
function exportProject(project: Project, filename?: string): void {
  const exportData: ProjectExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${project.name || 'project'}_${formatDate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### 导入逻辑

```typescript
async function importProject(file: File): Promise<Project> {
  const text = await file.text();
  const data = JSON.parse(text) as ProjectExportData;

  // 验证
  validateExportData(data);

  // 版本检查
  if (!isVersionCompatible(data.version)) {
    throw new ImportError('UNSUPPORTED_VERSION');
  }

  return data.project;
}
```

### Store 集成

```typescript
// project-store.ts 添加
interface ProjectStore {
  // ... 现有方法
  exportProject: () => void;
  importProject: (project: Project) => void;
}
```

## i18n 支持

**新增翻译键：**

```json
{
  "projectData": {
    "menu": {
      "title": "工具",
      "exportProject": "导出项目",
      "importProject": "导入项目",
      "exportPdf": "导出 PDF"
    },
    "export": {
      "title": "导出项目",
      "projectName": "项目名称",
      "axisCount": "轴数量",
      "filename": "文件名",
      "exportButton": "导出",
      "cancel": "取消",
      "success": "项目已导出"
    },
    "import": {
      "title": "导入项目",
      "dragDrop": "拖放文件到此处",
      "or": "或",
      "selectFile": "选择文件",
      "projectName": "项目名称",
      "axisCount": "轴数量",
      "exportedAt": "导出时间",
      "warning": "导入将覆盖当前项目数据",
      "confirmTitle": "确认导入",
      "confirmMessage": "此操作不可撤销，是否继续？",
      "importButton": "确认导入",
      "cancel": "取消",
      "success": "项目已导入"
    },
    "errors": {
      "invalidJson": "文件格式不正确，请检查是否为有效的 JSON 文件",
      "missingFields": "文件格式不正确，缺少必要的数据字段",
      "unsupportedVersion": "不支持的文件版本，请更新应用后重试",
      "corruptedData": "项目数据不完整，可能已损坏"
    }
  }
}
```

## 测试要点

1. **导出功能**
   - 正常导出项目
   - 空项目导出（应禁用）
   - 文件名自定义
   - 特殊字符处理

2. **导入功能**
   - 正常导入项目
   - 无效 JSON 文件
   - 缺少必需字段
   - 不兼容版本
   - 损坏的数据
   - 确认对话框行为

3. **集成测试**
   - 导出后立即导入
   - 跨浏览器兼容性
   - 大文件处理

## 未来扩展
n
1. **自动保存**：定期自动导出到 localStorage
2. **项目历史**：保存最近导入的项目列表
3. **云同步**：支持导出到云端存储
4. **批量导入**：支持一次导入多个项目文件
