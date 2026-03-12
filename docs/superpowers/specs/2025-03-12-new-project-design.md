# 新建项目功能设计文档

**日期**: 2025-03-12
**状态**: 已确认，待实现

---

## 1. 问题背景

当前伺服选型工具使用 localStorage 持久化项目数据，刷新页面会自动恢复当前项目状态。但用户无法：
- 开始一个全新的项目而不丢失现有数据
- 在多个项目之间切换
- 管理历史项目

---

## 2. 设计目标

1. **不中断现有工作流** - 保持 Hero → Wizard 的流畅体验
2. **自动保存** - 用户无感知，数据永不丢失
3. **防止误操作** - 新建项目需要确认
4. **未来可扩展** - 数据结构支持后续迁移到 Supabase

---

## 3. 用户体验流程

### 3.1 首次访问
```
Hero 引导页 → 开始配置 → Wizard 流程
```

### 3.2 有数据后刷新
```
自动恢复上次项目，继续 Wizard（保持现有行为）
```

### 3.3 新建项目入口
侧边栏新增"项目"折叠菜单：
- 📁 我的项目（展开显示项目列表）
  - 项目 A（当前）✓
  - 项目 B
  - 项目 C
- ➕ 新建项目
- ⚙️ 项目设置

### 3.4 新建项目流程
```
点击"新建项目"
    ↓
[确认弹窗] "当前项目已自动保存，确定要创建新项目吗？"
    ↓ 确定
[新项目信息弹窗] 填写名称、客户、销售人员、备注
    ↓ 创建
[创建空白项目，显示 Hero 或直接进入 Wizard]
```

---

## 4. 数据结构

### 4.1 存储结构（localStorage）

```typescript
// 主存储键: servo-selector-projects
interface ProjectsStorage {
  version: number;      // 数据结构版本，当前为 1
  projects: ProjectMeta[];
  currentProjectId: string;
}

interface ProjectMeta {
  id: string;           // proj_<random>
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
  // axisCount 和 completedAxes 从 Project.axes 实时计算，不持久化
}

// 单个项目数据存储: servo-selector-project-data
// 使用现有的 Project 类型，通过 Zustand persist 自动管理
// 项目列表变更时同步更新元数据
```

### 4.2 与现有数据兼容

**存储键统一方案：**
- `servo-selector-project` - 当前项目完整数据（Zustand persist 管理，保持不变）
- `servo-selector-projects` - 项目列表元数据（新增）

**数据迁移方案：**
1. 应用启动时检测 `servo-selector-projects` 是否存在
2. 如果不存在，读取 `servo-selector-project` 中的当前项目
3. 从当前项目提取元数据，创建初始项目列表
4. 设置 `version: 1`，标记迁移完成
5. 迁移失败时记录错误，继续使用单项目模式

**降级策略：**
- localStorage 写入失败时，继续在内存中运行
- 显示警告提示用户数据可能无法保存
- 提供手动导出功能作为备份

---

## 5. 界面改动

### 5.1 AxisSidebar 新增"项目"面板

位置：侧边栏顶部，语言切换器下方

```
┌─────────────────────┐
│  🌐 中 / En         │
├─────────────────────┤
│  📁 我的项目        │
│  ├─ 产线A项目    ✓  │
│  ├─ 产线B项目       │
│  └─ 测试项目        │
│                     │
│  ➕ 新建项目        │
│  ⚙️ 项目设置        │
├─────────────────────┤
│  [现有轴列表...]    │
└─────────────────────┘
```

### 5.2 新增组件

| 组件名 | 用途 | 位置 |
|--------|------|------|
| `ProjectPanel` | 侧边栏项目面板 | `components/project/ProjectPanel.tsx` |
| `NewProjectConfirmModal` | 确认新建项目 | `components/project/NewProjectConfirmModal.tsx` |
| `NewProjectFormModal` | 新项目信息表单 | `components/project/NewProjectFormModal.tsx` |
| `ProjectListItem` | 项目列表项 | `components/project/ProjectListItem.tsx` |

### 5.3 Store 扩展

在 `project-store.ts` 中新增：

```typescript
interface ProjectStore {
  // ... existing state

  // Project list operations
  projects: ProjectMeta[];
  saveAndCreateNewProject: (info: ProjectInfo) => void;  // 保存当前并新建
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  loadProjectsList: () => void;
  syncProjectMeta: () => void;  // 同步当前项目元数据到列表
}
```

**命名说明：**
- `saveAndCreateNewProject` - 明确表达"保存并新建"的语义，避免与现有 `createProject` 混淆
- `syncProjectMeta` - 在 project 状态变化时更新项目列表中的元数据

---

## 6. 交互细节

### 6.1 项目切换
- 点击列表中的项目名立即切换
- 自动保存当前项目状态（防抖 500ms）
- 加载选中项目的数据
- 如果项目有轴，直接进入 Wizard；否则显示 Hero

### 6.2 新建项目确认
- 弹窗显示当前项目名称和最后更新时间
- 明确告知"已自动保存"
- 取消则关闭弹窗，无变化

### 6.3 新项目表单
- 项目名称：必填，默认"未命名项目"
- 客户名称：可选
- 销售人员：可选
- 备注：可选，多行文本

### 6.4 新建项目后的跳转
- 创建空白项目（无轴）
- 显示 Hero 引导页，让用户点击"开始配置"
- 保持与首次访问一致的体验

### 6.5 项目删除
- 点击项目项的删除图标（悬停显示）
- 确认弹窗："确定要删除项目'XXX'吗？此操作不可恢复。"
- 不能删除当前正在编辑的项目（先切换到其他项目）
- 删除后从列表移除，释放存储空间

### 6.6 跨标签页同步
- 监听 `storage` 事件
- 当其他标签页修改项目列表时，当前页自动刷新列表
- 避免多标签同时编辑导致的覆盖问题

---

## 7. 技术实现要点

### 7.1 存储策略
```
servo-selector-project        → 当前项目完整数据（Zustand persist）
servo-selector-projects       → 项目列表元数据（包含 currentProjectId）
```

### 7.2 自动保存时机（防抖处理）
- 项目状态变化时：防抖 500ms 后保存
- 页面 unload 时：立即同步保存
- 切换项目前：立即保存当前项目

```typescript
// 防抖保存示例
const debouncedSave = debounce(() => {
  syncProjectMeta();
}, 500);
```

### 7.3 错误处理
```typescript
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // 显示警告：存储空间不足
    // 提示用户删除旧项目或导出备份
  }
  // 继续在内存中运行，不中断用户体验
}
```

### 7.3 性能考虑
- 项目列表只存储元数据，不存储完整数据
- 切换项目时才加载完整数据
- 使用 IndexedDB 替代 localStorage（未来扩展）

---

## 8. 未来扩展

### 8.1 Supabase 迁移路径
1. 保持现有 localStorage 作为离线缓存
2. 新增 Supabase 同步层
3. 用户登录后自动同步项目列表
4. 冲突解决策略：最后写入优先

### 8.2 可能增加的功能
- 项目搜索/筛选
- 项目标签/分类
- 项目模板（基于现有项目快速创建）
- 项目分享（只读链接）

---

## 9. i18n 键值

### 新增翻译键

```json
{
  "project": {
    "title": "我的项目",
    "newProject": "新建项目",
    "settings": "项目设置",
    "confirmNew": {
      "title": "创建新项目",
      "message": "当前项目已自动保存。确定要创建新项目吗？",
      "currentProject": "当前项目：{name}",
      "lastUpdated": "最后更新：{time}"
    },
    "form": {
      "title": "新项目信息",
      "name": "项目名称",
      "namePlaceholder": "未命名项目",
      "customer": "客户名称",
      "salesPerson": "销售人员",
      "notes": "备注",
      "create": "创建项目",
      "cancel": "取消"
    },
    "delete": {
      "title": "删除项目",
      "confirm": "确定要删除项目"{name}"吗？此操作不可恢复。",
      "cannotDeleteCurrent": "不能删除当前正在编辑的项目，请先切换到其他项目。"
    },
    "storageError": {
      "title": "存储空间不足",
      "message": "无法保存项目数据。请删除旧项目或导出备份后重试。"
    }
  }
}
```

## 10. 验收标准

- [ ] 侧边栏显示"项目"面板，可展开/折叠
- [ ] 显示所有历史项目列表
- [ ] 点击项目可切换，数据正确加载
- [ ] 点击"新建项目"弹出确认弹窗
- [ ] 确认后弹出项目信息表单
- [ ] 创建后新项目正确初始化（显示 Hero）
- [ ] 刷新页面后所有项目数据保留
- [ ] 现有项目数据自动迁移到新的存储结构
- [ ] 项目删除功能正常工作
- [ ] localStorage 满时显示友好提示
- [ ] 多标签页同步正常
