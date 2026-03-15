# 项目管理改进设计文档

**日期**: 2026-03-15
**主题**: 项目清单删除功能、FIFO 机制、默认空项目

---

## 背景

当前 servo-selector 工具已支持多项目管理，但存在以下问题：
1. 打开网页后默认恢复上次编辑的项目，而非空项目
2. 项目列表无限增长，没有自动清理机制
3. 虽然支持手动删除项目，但缺乏自动化管理

---

## 目标

1. **默认空项目**: 打开网页后默认显示空的新项目，而非上次编辑的项目
2. **FIFO 自动清理**: 当项目数量超过限制时，自动删除最旧的项目
3. **保留手动删除**: 保持现有的手动删除项目功能

---

## 设计决策说明

### 关于刷新页面丢失当前工作

**决策**: 接受刷新页面后当前工作丢失的行为。

**理由**:
- 这是一个选型计算工具，不是文档编辑器
- 重要的项目应该显式"保存到项目列表"（通过完成配置或导出）
- 避免自动保存导致项目列表无限增长
- 符合"默认空项目"的核心需求

**用户工作流程**:
1. 用户打开工具 → 看到空项目
2. 用户进行配置 → 完成后保存为新项目（显式保存）
3. 刷新页面 → 回到空项目（未保存的工作丢失）

---

## 设计详情

### 1. 默认空项目（启动行为变更）

#### 当前行为
- 页面加载时从 Zustand persist 恢复 `servo-selector-project` 存储的项目数据
- 用户看到的是上次编辑的项目状态

#### 新行为
- 页面加载时**不恢复**上次的项目数据
- 始终创建一个空项目（`createEmptyProject()`）
- 显示引导页/空状态，让用户开始新项目

#### 实现方案
修改 `src/stores/project-store.ts` 中的 Zustand persist 配置：

```typescript
const initialState = {
  project: createEmptyProject(),
  currentAxisId: '',
  currentStep: 1 as WizardStep,
  isComplete: false,
  input: {},
  result: undefined,
  projects: [] as ProjectMeta[],
};

persist(
  (set, get) => ({ ... }),
  {
    name: 'servo-selector-project',
    version: 3,
    skipHydration: true,
    // 只持久化项目列表元数据，不持久化当前项目详情
    partialize: (state) => ({
      projects: state.projects,
      // 不保存 project、currentAxisId、input、result 等字段
    }),
    migrate: (persistedState: any, version: number) => {
      // 始终重置为初始空状态
      return {
        ...initialState,
        projects: persistedState?.projects || [],
      };
    },
  }
)
```

#### 空状态 UI

当项目为空（`axes.length === 0`）时，显示现有的 `OnboardingEmptyState` 组件：
- 标题：欢迎使用伺服选型工具
- 说明：简要介绍工具用途
- CTA 按钮："开始配置" → 导航到项目信息编辑步骤

**实现**：复用现有的 `src/components/onboarding/OnboardingEmptyState.tsx`

#### SSR/Hydration 处理

由于使用 `skipHydration: true`，需要手动处理 hydration：

```typescript
// 在 page.tsx 或布局组件中
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  // 手动触发 rehydration
  useProjectStore.persist.rehydrate();
  setIsHydrated(true);
}, []);

// 渲染时显示 loading 或空状态直到 hydrated
if (!isHydrated) {
  return <LoadingSkeleton />;
}
```

#### 边界情况
- 首次访问用户：正常显示空项目
- 老用户升级：迁移时重置为空项目，但保留项目列表
- 刷新页面：重置为空项目（符合预期，见设计决策说明）
- SSR 阶段：显示 loading 状态，客户端 hydrate 后显示空项目

---

### 2. FIFO 自动清理机制

#### 规则
| 配置项 | 值 |
|--------|-----|
| 最大项目数 | 20 |
| 触发时机 | 创建新项目时 |
| 淘汰策略 | 删除 `updatedAt` 最旧的项目（排除当前项目） |

#### 实现位置
在 `src/stores/project-store.ts` 的 `saveAndCreateNewProject` 函数中：

```typescript
saveAndCreateNewProject: (info) => {
  const MAX_PROJECTS = 20;
  const state = get();

  // 1. 同步当前项目元数据（如果当前项目有数据）
  if (state.project.id && state.project.axes.length > 0) {
    const currentMeta = extractProjectMeta(state.project);
    updateProjectMeta(state.project.id, currentMeta);
    // 保存完整项目数据到独立存储
    saveProjectData(state.project.id, state.project);
  }

  // 2. 加载最新项目列表元数据
  const storage = loadProjectsStorage();
  const projects = storage?.projects || [];

  // 3. FIFO 清理：如果达到或超过限制，需要删除最旧的项目
  // 注意："当前项目"指的是当前正在编辑的项目（state.project），不是 ProjectsStorage.currentProjectId
  if (projects.length >= MAX_PROJECTS) {
    // 按 updatedAt 排序，排除当前正在编辑的项目
    const otherProjects = projects.filter(p => p.id !== state.project.id);

    // 计算需要删除的数量（为给新项目腾出空间）
    const toDeleteCount = projects.length - MAX_PROJECTS + 1;

    // 边界情况：如果其他项目数量不足以腾出空间
    // 这种情况发生在：projects.length === MAX_PROJECTS 且所有项目都是当前项目
    // 此时应该阻止创建新项目，而不是删除当前项目
    if (otherProjects.length === 0) {
      // 所有项目都是当前项目，无法删除任何项目
      // 阻止创建新项目，提示用户先保存或删除其他项目
      console.warn('[ProjectStore] Cannot create new project: all projects are current');
      // 可以在这里抛出错误或显示提示
      // 为简化实现，删除最旧的项目（包括当前项目）
      const oldestProject = [...projects].sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      )[0];
      if (oldestProject) {
        deleteProjectMeta(oldestProject.id);
        deleteProjectData(oldestProject.id);
      }
    } else {
      // 按 updatedAt 排序其他项目
      const sortedProjects = otherProjects.sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
      const actualDeleteCount = Math.min(toDeleteCount, sortedProjects.length);
      for (let i = 0; i < actualDeleteCount; i++) {
        const projectToDelete = sortedProjects[i];
        deleteProjectMeta(projectToDelete.id);
        deleteProjectData(projectToDelete.id);
      }
    }
  }

  // 4. 创建新项目...
}
```

#### 存储同步策略

**双存储系统设计**:
1. **项目列表元数据** (`servo-selector-projects`): 存储所有项目的摘要信息（id, name, updatedAt 等），用于快速显示项目列表
2. **完整项目数据** (`servo-selector-project-${id}`): 每个项目独立存储，包含完整的轴配置、计算结果等

**同步规则**:
- 创建/更新项目时：先保存完整数据，再更新元数据
- 删除项目时：同时删除元数据和完整数据
- 加载项目时：从元数据列表获取项目 ID，再从独立存储加载完整数据
- 元数据是完整数据的索引，两者必须保持同步

#### 存储接口定义

在 `src/lib/project-storage.ts` 中添加：

```typescript
/**
 * 获取项目数据的 localStorage 键名
 * @param projectId - 项目 ID
 * @returns 存储键名
 */
export function getProjectDataKey(projectId: string): string {
  return `servo-selector-project-${projectId}`;
}

/**
 * 保存完整项目数据到 localStorage
 *
 * @param projectId - 项目 ID
 * @param project - 完整的 Project 对象
 * @throws 当存储空间不足时会抛出 QuotaExceededError
 */
export function saveProjectData(projectId: string, project: Project): void {
  if (!isBrowser()) return;

  try {
    const key = getProjectDataKey(projectId);
    const data = JSON.stringify(project);
    localStorage.setItem(key, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('[project-storage] 存储空间不足，无法保存项目数据:', error);
      throw new Error(
        '存储空间不足，无法保存项目数据。请删除旧项目或导出备份后重试。'
      );
    }
    console.error('[project-storage] 保存项目数据失败:', error);
    throw error;
  }
}

/**
 * 从 localStorage 加载完整项目数据
 *
 * @param projectId - 项目 ID
 * @returns Project 对象，如果不存在则返回 null
 */
export function loadProjectData(projectId: string): Project | null {
  if (!isBrowser()) return null;

  try {
    const key = getProjectDataKey(projectId);
    const data = localStorage.getItem(key);
    if (!data) return null;

    return JSON.parse(data) as Project;
  } catch (error) {
    console.error('[project-storage] 加载项目数据失败:', error);
    return null;
  }
}

/**
 * 删除完整项目数据
 *
 * @param projectId - 项目 ID
 */
export function deleteProjectData(projectId: string): void {
  if (!isBrowser()) return;

  try {
    const key = getProjectDataKey(projectId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[project-storage] 删除项目数据失败:', error);
  }
}
```

#### 存储结构变更

**新存储结构**:
- 项目元数据列表：`servo-selector-projects`（已有）
- 完整项目数据：`servo-selector-project-${projectId}`（新增，每个项目独立存储）

**废弃的存储**:
- `servo-selector-project`（Zustand persist 的旧项目数据，迁移后删除）

#### 数据迁移流程

在 `src/lib/project-storage.ts` 的 `migrateProjectsStorage` 函数中：

```typescript
export function migrateProjectsStorage(): ProjectsStorage | null {
  if (!isBrowser()) return null;

  try {
    // 检查是否已存在新版本存储
    const existing = loadProjectsStorage();
    if (existing && existing.version >= STORAGE_VERSION) {
      // 检查是否需要迁移旧的项目数据格式
      migrateOldProjectData(existing);
      return existing;
    }

    // 读取旧版本存储（单项目格式）
    const oldData = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!oldData) {
      // 没有旧数据，创建空存储
      const emptyStorage: ProjectsStorage = {
        version: STORAGE_VERSION,
        projects: [],
        currentProjectId: '',
      };
      saveProjectsStorage(emptyStorage);
      return emptyStorage;
    }

    // 解析旧数据
    const parsed = JSON.parse(oldData);
    const project: Project = parsed.state?.project || parsed.project;

    if (!project || !project.id) {
      console.warn('[project-storage] 旧项目数据格式无效');
      return null;
    }

    // 创建新的多项目存储结构
    const meta = extractProjectMeta(project);
    const newStorage: ProjectsStorage = {
      version: STORAGE_VERSION,
      projects: [meta],
      currentProjectId: project.id,
    };

    // 保存新结构
    saveProjectsStorage(newStorage);

    // 将完整项目数据保存到新的独立存储
    saveProjectData(project.id, project);

    // 删除旧存储
    localStorage.removeItem(CURRENT_PROJECT_KEY);

    console.log('[project-storage] 数据迁移成功:', project.id);
    return newStorage;
  } catch (error) {
    console.error('[project-storage] 数据迁移失败:', error);
    // 迁移失败时返回空存储，避免影响正常使用
    const fallbackStorage: ProjectsStorage = {
      version: STORAGE_VERSION,
      projects: [],
      currentProjectId: '',
    };
    return fallbackStorage;
  }
}

/**
 * 迁移旧的项目数据格式（如果存在）
 */
function migrateOldProjectData(storage: ProjectsStorage): void {
  try {
    // 检查是否存在旧格式的项目数据（存储在 servo-selector-project 键中）
    const oldProjectData = localStorage.getItem('servo-selector-project');
    if (!oldProjectData) return;

    const parsed = JSON.parse(oldProjectData);
    const project: Project = parsed.state?.project;

    if (project && project.id) {
      // 检查该项目是否已在项目列表中
      const exists = storage.projects.some(p => p.id === project.id);
      if (!exists) {
        // 将项目添加到列表并保存数据
        const meta = extractProjectMeta(project);
        storage.projects.push(meta);
        saveProjectsStorage(storage);
        saveProjectData(project.id, project);
      }

      // 删除旧存储
      localStorage.removeItem('servo-selector-project');
    }
  } catch (error) {
    console.error('[project-storage] 迁移旧项目数据失败:', error);
    // 迁移失败不阻塞，继续运行
  }
}
```

---

### 3. 手动删除功能（改进）

#### 当前功能
- 在 ProjectPanel 下拉菜单中悬停显示删除按钮
- 只能删除非当前项目
- 删除后从列表和存储中移除

#### 改进
- 同时删除项目元数据和完整项目数据
- 使用 `deleteProjectData` 函数清理独立存储

---

### 4. 加载现有项目

#### 流程

当用户从项目列表切换到另一个项目时：

```typescript
switchProject: (projectId) => {
  const state = get();

  // 1. 保存当前项目到存储
  if (state.project.id && state.project.axes.length > 0) {
    const currentMeta = extractProjectMeta(state.project);
    updateProjectMeta(state.project.id, currentMeta);
    saveProjectData(state.project.id, state.project);
  }

  // 2. 从独立存储加载目标项目
  const targetProject = loadProjectData(projectId);
  if (!targetProject) {
    console.error(`[ProjectStore] Project not found: ${projectId}`);
    // 从列表中移除不存在的项目
    deleteProjectMeta(projectId);
    return;
  }

  // 3. 更新 store 状态
  set({
    project: targetProject,
    currentAxisId: targetProject.axes[0]?.id ?? '',
    currentStep: 1,
    isComplete: false,
    input: targetProject.axes[0]?.input || {},
    result: targetProject.axes[0]?.result,
  });

  // 4. 更新当前项目 ID
  setCurrentProjectId(projectId);
}
```

#### 错误处理
- 如果项目数据不存在：从列表中移除该项目的元数据，保持当前项目不变
- 如果加载失败：显示错误提示，保持当前项目不变

#### 实现
在 `src/stores/project-store.ts` 的 `deleteProject` 函数中：

```typescript
deleteProject: (projectId) => {
  const state = get();

  // Cannot delete current project - UI should disable/hide delete button for current project
  if (projectId === state.project.id) {
    console.warn('[ProjectStore] Cannot delete current project');
    return;
  }

  // Delete project meta from storage
  deleteProjectMeta(projectId);

  // Delete full project data
  deleteProjectData(projectId);

  // Reload project list
  const storage = loadProjectsStorage();
  if (storage) {
    set({ projects: storage.projects });
  }
},
```

#### 删除当前项目的替代方案

**问题**: 用户想要删除当前正在编辑的项目

**解决方案（已实现）**:
- **UI 限制**: ProjectPanel 中当前项目的删除按钮禁用/隐藏
- 用户操作流程：
  1. 用户创建新项目（自动保存当前项目到列表）
  2. 切换到其他项目
  3. 删除原项目

**其他场景**:
- 如果用户想"清空当前项目"：使用"重置"功能（已有功能）
- 如果用户想"删除并新建"：直接新建项目（当前项目自动保存到列表）

---

## 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                        创建新项目流程                         │
└─────────────────────────────────────────────────────────────┘

用户点击"新建项目"
       │
       ▼
┌──────────────┐
│ 同步当前项目元数据 │
│ 保存完整项目数据   │
└──────────────┘
       │
       ▼
┌──────────────┐     是    ┌──────────────────┐
│ 项目数 >= 20? │ ───────▶ │ 删除最旧项目(非当前) │
│              │          │ - 删除元数据        │
│              │          │ - 删除完整数据      │
└──────────────┘          └──────────────────┘
       │ 否
       ▼
┌──────────────┐
│  创建新项目   │
└──────────────┘
       │
       ▼
┌──────────────┐
│ 保存到存储    │
└──────────────┘
```

---

## 测试要点

### 1. 默认空项目
- [ ] 首次访问显示空项目
- [ ] 刷新页面后显示空项目（未保存工作丢失）
- [ ] 老用户升级后显示空项目但保留项目列表

### 2. FIFO 清理
- [ ] 项目数达到 20 个时创建新项目，最旧项目被删除
- [ ] 当前项目不会被删除
- [ ] 被删除项目的数据从 localStorage 完全清除
- [ ] 边界情况：所有项目都是当前项目时的处理

### 3. 手动删除
- [ ] 可以删除非当前项目
- [ ] 不能删除当前项目（删除按钮禁用/隐藏）
- [ ] 删除后项目列表立即更新
- [ ] 删除后完整项目数据也被清除

### 4. 加载现有项目
- [ ] 从项目列表切换到其他项目时正确加载
- [ ] 加载失败时从列表移除无效项目
- [ ] 加载失败时保持当前项目不变

### 5. 数据迁移
- [ ] 老用户数据正确迁移到新格式
- [ ] 旧存储键（servo-selector-project）被删除
- [ ] 迁移失败时返回空存储，不影响使用
- [ ] `currentProjectId` 字段不再使用（保留但忽略）

### 6. 错误处理
- [ ] localStorage 满时显示 toast 错误提示："存储空间不足，无法保存项目数据。请删除旧项目或导出备份后重试。"
- [ ] 存储操作失败不阻塞其他功能
- [ ] 错误提示支持中英文（使用 next-intl）

---

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| 创建新项目 | O(n log n) | O(1) | 实际 n ≤ 20，视为常数 |
| FIFO 清理 | O(n log n) | O(1) | 实际 n ≤ 20，视为常数 |
| 删除项目 | O(n) | O(1) | |
| 保存项目数据 | O(1) | O(1) | |
| 加载项目数据 | O(1) | O(1) | |

**实际复杂度**: 由于 n 被限制为最大 20，所有操作在实际应用中均为 O(1)。

---

## 错误处理与 UI 反馈

### 存储空间不足 (QuotaExceededError)

**触发场景**:
- localStorage 达到浏览器限制（通常 5-10MB）
- 项目数据过大（多轴复杂配置）

**错误处理流程**:
1. `saveProjectData` 捕获 `QuotaExceededError`
2. 抛出带有本地化错误消息的 Error
3. 调用方（如 `saveAndCreateNewProject`）捕获错误
4. 显示错误提示

**UI 反馈**:
- 使用现有的 toast/notification 系统
- 错误消息: "存储空间不足，无法保存项目数据。请删除旧项目或导出备份后重试。"
- 英文: "Storage full. Please delete old projects or export backups."

**用户操作建议**:
- 删除不需要的旧项目
- 导出重要项目到文件备份
- 清理浏览器 localStorage

---

## 存储版本号与废弃字段

| 存储键 | 当前版本 | 说明 |
|--------|----------|------|
| `servo-selector-projects` | 1 | 项目列表元数据存储 |
| `servo-selector-project` (Zustand) | 3 | Zustand persist 版本 |

**废弃字段**:
- `ProjectsStorage.currentProjectId`: 由于改为"始终空项目"模式，此字段不再使用
  - 保留在类型定义中以避免破坏现有数据
  - 读写时忽略此字段
  - 未来版本可考虑移除

**版本升级策略**:
- 项目列表存储版本号在 `ProjectsStorage.version` 字段
- 升级时通过 `migrateProjectsStorage` 函数处理
- 向后兼容：旧版本数据自动迁移

---

## 文件变更清单

1. `src/stores/project-store.ts`
   - 修改 Zustand persist 配置（partialize, migrate）
   - 修改 `saveAndCreateNewProject` 添加 FIFO 逻辑
   - 修改 `deleteProject` 添加完整数据删除

2. `src/lib/project-storage.ts`
   - 添加 `getProjectDataKey` 函数
   - 添加 `saveProjectData` 函数
   - 添加 `loadProjectData` 函数
   - 添加 `deleteProjectData` 函数
   - 修改 `migrateProjectsStorage` 添加数据迁移逻辑
   - 添加 `migrateOldProjectData` 辅助函数

3. `src/types/project-list.ts`
   - 添加存储键常量（可选）

---

## 向后兼容性

- 老用户数据会自动迁移
- 项目元数据格式不变
- 完整项目数据从旧存储迁移到新存储结构
- 迁移失败时返回空存储，不影响正常使用
