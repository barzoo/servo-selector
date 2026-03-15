# 项目管理改进实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现项目管理的三个改进：默认空项目、FIFO 自动清理、改进的手动删除功能

**Architecture:** 采用双存储系统设计：项目元数据列表存储在 `servo-selector-projects`，每个项目的完整数据独立存储在 `servo-selector-project-${id}`。通过改进 project-store 和 project-storage 模块实现。

**Tech Stack:** Next.js, TypeScript, Zustand, localStorage, next-intl

---

## 文件结构

| 文件 | 职责 | 变更类型 |
|------|------|----------|
| `src/lib/project-storage.ts` | 项目存储底层 API：添加 save/load/deleteProjectData 函数 | 修改 |
| `src/stores/project-store.ts` | Zustand store：修改 persist 配置、添加 FIFO 逻辑、改进删除和切换项目 | 修改 |
| `src/components/project/ProjectPanel.tsx` | 项目列表面板：确保删除功能正常工作 | 可能需要微调 |
| `src/app/page.tsx` | 主页面：添加 hydration 处理 | 修改 |
| `src/i18n/messages/zh.json` | 中文翻译：添加错误提示文案 | 修改 |
| `src/i18n/messages/en.json` | 英文翻译：添加错误提示文案 | 修改 |
| `src/stores/__tests__/project-list-storage.test.ts` | 项目存储测试：更新测试用例 | 修改 |

---

## Chunk 1: 存储层 API 扩展

### Task 1: 添加项目数据存储函数

**Files:**
- Modify: `src/lib/project-storage.ts`
- Test: `src/stores/__tests__/project-list-storage.test.ts`

**背景**: 当前项目数据存储在 Zustand persist 中，需要改为按项目 ID 独立存储，以便支持删除任意项目。

- [ ] **Step 1: 读取现有 project-storage.ts 文件**

```bash
cat src/lib/project-storage.ts
```

- [ ] **Step 2: 在文件末尾添加新函数（在最后一个导出函数之后）**

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

- [ ] **Step 3: 添加 Project 类型导入（如果尚未导入）**

在文件顶部确保有：
```typescript
import type { Project } from '@/types';
```

- [ ] **Step 4: 运行现有测试确保没有破坏**

```bash
npm test -- src/stores/__tests__/project-list-storage.test.ts --run
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/project-storage.ts
git commit -m "feat: add project data storage functions (save/load/delete)"
```

---

### Task 2: 改进数据迁移函数

**Files:**
- Modify: `src/lib/project-storage.ts`

**背景**: 需要支持从旧格式（单项目存储）迁移到新格式（按 ID 独立存储），并清理废弃的存储键。

- [ ] **Step 1: 在 migrateProjectsStorage 函数后添加辅助函数**

```typescript
/**
 * 迁移旧的项目数据格式（如果存在）
 * 将 servo-selector-project 中的数据迁移到独立存储
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

- [ ] **Step 2: 修改 migrateProjectsStorage 函数调用 migrateOldProjectData**

在 `migrateProjectsStorage` 函数中，找到以下代码：
```typescript
// 检查是否已存在新版本存储
const existing = loadProjectsStorage();
if (existing && existing.version >= STORAGE_VERSION) {
  return existing;
}
```

修改为：
```typescript
// 检查是否已存在新版本存储
const existing = loadProjectsStorage();
if (existing && existing.version >= STORAGE_VERSION) {
  // 检查是否需要迁移旧的项目数据格式
  migrateOldProjectData(existing);
  return existing;
}
```

- [ ] **Step 3: 在迁移完成后添加独立存储保存**

在 `migrateProjectsStorage` 函数中，找到以下代码：
```typescript
// 保存新结构
saveProjectsStorage(newStorage);

console.log('[project-storage] 数据迁移成功:', project.id);
```

在后面添加：
```typescript
// 将完整项目数据保存到新的独立存储
saveProjectData(project.id, project);

// 删除旧存储
localStorage.removeItem(CURRENT_PROJECT_KEY);

console.log('[project-storage] 数据迁移成功:', project.id);
```

- [ ] **Step 4: 运行测试**

```bash
npm test -- src/stores/__tests__/project-list-storage.test.ts --run
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/project-storage.ts
git commit -m "feat: improve data migration to support per-project storage"
```

---

## Chunk 2: Zustand Store 改造

### Task 3: 修改 Zustand Persist 配置

**Files:**
- Modify: `src/stores/project-store.ts`

**背景**: 需要修改 persist 配置，使其只保存项目列表元数据，不保存当前项目详情，实现"默认空项目"行为。

- [ ] **Step 1: 读取现有 project-store.ts 的 persist 配置部分**

找到 `persist(` 调用部分，查看当前配置。

- [ ] **Step 2: 修改 persist 配置**

将 persist 配置从：
```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'servo-selector-project',
    version: 3,
    skipHydration: true,
    migrate: (persistedState: any, version: number) => {
      if (version < 3) {
        return {
          project: createEmptyProject(),
          currentAxisId: '',
          currentStep: 1,
          isComplete: false,
          input: {},
          result: undefined,
        };
      }
      return persistedState;
    },
  }
)
```

修改为：
```typescript
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

- [ ] **Step 3: 确保 initialState 定义在 persist 之前**

确认 `initialState` 变量在 persist 调用之前定义。

- [ ] **Step 4: 运行测试**

```bash
npm test -- src/stores/__tests__/project-store.test.ts --run
```

Expected: Tests may fail due to behavior change - this is expected

- [ ] **Step 5: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat: modify persist config to only save project list, not current project"
```

---

### Task 4: 添加 FIFO 清理逻辑

**Files:**
- Modify: `src/stores/project-store.ts`

**背景**: 在创建新项目时，如果项目数量超过 20 个，需要自动删除最旧的项目。

- [ ] **Step 1: 找到 saveAndCreateNewProject 函数**

读取当前实现。

- [ ] **Step 2: 修改 saveAndCreateNewProject 函数**

在函数开头添加 FIFO 清理逻辑：

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
  if (projects.length >= MAX_PROJECTS) {
    // 按 updatedAt 排序，排除当前正在编辑的项目
    const otherProjects = projects.filter(p => p.id !== state.project.id);

    // 计算需要删除的数量（为给新项目腾出空间）
    const toDeleteCount = projects.length - MAX_PROJECTS + 1;

    // 边界情况：如果其他项目数量不足以腾出空间
    if (otherProjects.length === 0) {
      // 所有项目都是当前项目，删除最旧的一个
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

  // 4. 创建新项目（原有逻辑）
  const newProject = createEmptyProject();
  newProject.name = info.name ?? '';
  newProject.customer = info.customer ?? '';
  newProject.salesPerson = info.salesPerson ?? '';
  newProject.notes = info.notes;

  // 5. 添加新项目到项目列表
  const newMeta = extractProjectMeta(newProject);
  const updatedStorage = loadProjectsStorage();
  if (updatedStorage) {
    updatedStorage.projects.push(newMeta);
    updatedStorage.currentProjectId = newProject.id;
    saveProjectsStorage(updatedStorage);
  }

  // 6. 更新 store 状态
  set({
    project: newProject,
    currentAxisId: '',
    currentStep: 1 as WizardStep,
    isComplete: false,
    input: {},
    result: undefined,
    projects: updatedStorage?.projects || [],
  });
},
```

- [ ] **Step 3: 添加必要的导入**

确保文件顶部导入了新函数：
```typescript
import {
  loadProjectsStorage,
  saveProjectsStorage,
  migrateProjectsStorage,
  extractProjectMeta,
  updateProjectMeta,
  deleteProjectMeta,
  setCurrentProjectId,
  saveProjectData,
  deleteProjectData,
} from '@/lib/project-storage';
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat: add FIFO cleanup when creating new projects"
```

---

### Task 5: 改进删除项目功能

**Files:**
- Modify: `src/stores/project-store.ts`

**背景**: 删除项目时，需要同时删除元数据和完整项目数据。

- [ ] **Step 1: 找到 deleteProject 函数**

读取当前实现。

- [ ] **Step 2: 修改 deleteProject 函数**

将函数修改为：
```typescript
deleteProject: (projectId) => {
  const state = get();

  // Cannot delete current project
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

- [ ] **Step 3: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat: improve deleteProject to also remove full project data"
```

---

### Task 6: 改进切换项目功能

**Files:**
- Modify: `src/stores/project-store.ts`

**背景**: 切换项目时，需要从独立存储加载完整项目数据。

- [ ] **Step 1: 找到 switchProject 函数**

读取当前实现。

- [ ] **Step 2: 修改 switchProject 函数**

将函数修改为：
```typescript
switchProject: (projectId) => {
  const state = get();

  // Cannot switch to current project
  if (projectId === state.project.id) {
    return;
  }

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
    deleteProjectData(projectId);
    // 刷新项目列表
    const storage = loadProjectsStorage();
    if (storage) {
      set({ projects: storage.projects });
    }
    return;
  }

  // 3. 更新 store 状态
  const firstAxis = targetProject.axes[0];
  set({
    project: targetProject,
    currentAxisId: firstAxis?.id ?? '',
    currentStep: firstAxis?.status === 'COMPLETED' ? 5 : 1,
    isComplete: firstAxis?.status === 'COMPLETED',
    input: firstAxis?.input || {},
    result: firstAxis?.result,
  });

  // 4. 更新当前项目 ID（用于兼容）
  setCurrentProjectId(projectId);
},
```

- [ ] **Step 3: 添加 loadProjectData 导入**

确保导入中包含：
```typescript
import {
  // ... other imports
  loadProjectData,
} from '@/lib/project-storage';
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat: improve switchProject to load from independent storage"
```

---

## Chunk 3: UI 层适配

### Task 7: 添加 Hydration 处理

**Files:**
- Modify: `src/app/page.tsx`

**背景**: 由于使用 `skipHydration: true`，需要手动处理 hydration，避免 SSR/客户端不匹配。

- [ ] **Step 1: 读取现有 page.tsx**

```bash
cat src/app/page.tsx
```

- [ ] **Step 2: 添加 hydration 处理**

在页面组件中添加：

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
// ... other imports

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 手动触发 rehydration
    useProjectStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // 在 hydration 完成前显示 loading 状态
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A4E4]"></div>
      </div>
    );
  }

  // ... rest of the component
}
```

- [ ] **Step 3: 确保 page.tsx 是 Client Component**

确认文件顶部有 `'use client';` 指令。

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add hydration handling for project store"
```

---

### Task 8: 添加 i18n 错误提示

**Files:**
- Modify: `src/i18n/messages/zh.json`
- Modify: `src/i18n/messages/en.json`

**背景**: 需要为存储空间不足错误添加中英文翻译。

- [ ] **Step 1: 读取现有中文翻译文件**

找到 project 命名空间，查看现有结构。

- [ ] **Step 2: 在 zh.json 中添加错误提示**

在 `project` 命名空间下添加：
```json
{
  "project": {
    // ... existing translations
    "errors": {
      "storageFull": "存储空间不足，无法保存项目数据。请删除旧项目或导出备份后重试。"
    }
  }
}
```

- [ ] **Step 3: 在 en.json 中添加错误提示**

```json
{
  "project": {
    // ... existing translations
    "errors": {
      "storageFull": "Storage full. Please delete old projects or export backups."
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/messages/zh.json src/i18n/messages/en.json
git commit -m "i18n: add error messages for storage full"
```

---

## Chunk 4: 测试与验证

### Task 9: 更新项目存储测试

**Files:**
- Modify: `src/stores/__tests__/project-list-storage.test.ts`

**背景**: 需要更新测试以覆盖新的存储函数。

- [ ] **Step 1: 读取现有测试文件**

```bash
cat src/stores/__tests__/project-list-storage.test.ts
```

- [ ] **Step 2: 添加新函数的测试**

在测试文件中添加：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  // ... existing imports
  saveProjectData,
  loadProjectData,
  deleteProjectData,
  getProjectDataKey,
} from '@/lib/project-storage';
import type { Project } from '@/types';

describe('project data storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load project data', () => {
    const project: Project = {
      id: 'proj_test123',
      name: 'Test Project',
      customer: 'Test Customer',
      salesPerson: 'Test Sales',
      createdAt: new Date().toISOString(),
      commonParams: {
        ambientTemp: 25,
        ipRating: 'IP65',
        communication: 'ETHERCAT',
        cableLength: 5,
        safetyFactor: 1.5,
        maxInertiaRatio: 10,
        targetInertiaRatio: 5,
      },
      axes: [],
    };

    saveProjectData(project.id, project);
    const loaded = loadProjectData(project.id);

    expect(loaded).toEqual(project);
  });

  it('should return null for non-existent project', () => {
    const loaded = loadProjectData('proj_nonexistent');
    expect(loaded).toBeNull();
  });

  it('should delete project data', () => {
    const project: Project = {
      id: 'proj_test456',
      name: 'Test Project',
      customer: '',
      salesPerson: '',
      createdAt: new Date().toISOString(),
      commonParams: {
        ambientTemp: 25,
        ipRating: 'IP65',
        communication: 'ETHERCAT',
        cableLength: 5,
        safetyFactor: 1.5,
        maxInertiaRatio: 10,
        targetInertiaRatio: 5,
      },
      axes: [],
    };

    saveProjectData(project.id, project);
    deleteProjectData(project.id);
    const loaded = loadProjectData(project.id);

    expect(loaded).toBeNull();
  });

  it('should generate correct project data key', () => {
    const key = getProjectDataKey('proj_abc123');
    expect(key).toBe('servo-selector-project-proj_abc123');
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- src/stores/__tests__/project-list-storage.test.ts --run
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/stores/__tests__/project-list-storage.test.ts
git commit -m "test: add tests for project data storage functions"
```

---

### Task 10: 手动验证

**Files:**
- 无文件修改

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证默认空项目**

1. 打开页面
2. 确认显示空项目/引导页
3. 刷新页面
4. 确认再次显示空项目

- [ ] **Step 3: 验证 FIFO 清理**

1. 创建 20 个项目（可以通过脚本或手动）
2. 创建第 21 个项目
3. 确认最旧的项目被自动删除

- [ ] **Step 4: 验证删除功能**

1. 创建几个项目
2. 切换到项目 A
3. 确认无法删除项目 A（删除按钮隐藏/禁用）
4. 切换到项目 B
5. 删除项目 A
6. 确认项目 A 从列表消失

- [ ] **Step 5: 验证切换项目**

1. 创建项目 A，添加一些轴配置
2. 创建项目 B
3. 切换回项目 A
4. 确认配置正确加载

- [ ] **Step 6: 运行构建**

```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 7: Commit 验证结果**

```bash
git commit --allow-empty -m "test: manual verification passed"
```

---

## 完成清单

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 手动验证完成
- [ ] 代码已提交

---

## 回滚计划

如果出现问题，可以通过以下方式回滚：

1. **恢复 persist 配置**: 移除 `partialize` 和修改后的 `migrate`
2. **恢复旧存储**: 重新使用单项目存储模式
3. **数据恢复**: 从备份恢复 localStorage 数据

---

## 相关文档

- 设计文档: `docs/superpowers/specs/2026-03-15-project-management-improvements-design.md`
