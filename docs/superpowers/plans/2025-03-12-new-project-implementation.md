# 新建项目功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现多项目管理功能，让用户可以创建、切换、删除项目，所有数据自动保存到 localStorage。

**Architecture:** 扩展现有 Zustand store 支持多项目元数据管理；新增项目面板组件嵌入侧边栏；使用防抖自动保存；保持现有单项目数据存储不变以确保兼容性。

**Tech Stack:** Next.js + TypeScript + Zustand + TailwindCSS + next-intl + localStorage

---

## 文件结构

### 新增文件
- `src/types/project-list.ts` - 项目列表相关类型定义
- `src/lib/project-storage.ts` - 项目列表存储管理（localStorage 操作）
- `src/components/project/ProjectPanel.tsx` - 侧边栏项目面板
- `src/components/project/ProjectListItem.tsx` - 项目列表项
- `src/components/project/NewProjectConfirmModal.tsx` - 新建项目确认弹窗
- `src/components/project/NewProjectFormModal.tsx` - 新项目信息表单
- `src/stores/__tests__/project-list-storage.test.ts` - 存储层测试

### 修改文件
- `src/stores/project-store.ts` - 添加多项目管理方法
- `src/components/wizard/AxisSidebar.tsx` - 嵌入 ProjectPanel
- `src/i18n/messages/zh.json` - 添加中文翻译
- `src/i18n/messages/en.json` - 添加英文翻译

---

## Chunk 1: 类型定义和存储层

### Task 1: 创建项目列表类型定义

**Files:**
- Create: `src/types/project-list.ts`

- [ ] **Step 1: 编写类型定义**

```typescript
// 项目列表元数据（存储在 localStorage）
export interface ProjectMeta {
  id: string;
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 项目列表存储结构
export interface ProjectsStorage {
  version: number;
  projects: ProjectMeta[];
  currentProjectId: string;
}

// 项目列表存储管理器接口
export interface ProjectListStorage {
  load(): ProjectsStorage | null;
  save(storage: ProjectsStorage): void;
  migrate(): ProjectsStorage | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/project-list.ts
git commit -m "feat: add project list types"
```

---

### Task 2: 创建项目列表存储管理

**Files:**
- Create: `src/lib/project-storage.ts`

- [ ] **Step 1: 编写存储管理代码**

```typescript
import type { ProjectsStorage, ProjectMeta } from '@/types/project-list';
import type { Project } from '@/types';

const STORAGE_KEY = 'servo-selector-projects';
const CURRENT_PROJECT_KEY = 'servo-selector-project';
const STORAGE_VERSION = 1;

/**
 * 从 localStorage 加载项目列表
 */
export function loadProjectsStorage(): ProjectsStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as ProjectsStorage;

    // 版本检查
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Project storage version mismatch: ${parsed.version} vs ${STORAGE_VERSION}`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load projects storage:', error);
    return null;
  }
}

/**
 * 保存项目列表到 localStorage
 */
export function saveProjectsStorage(storage: ProjectsStorage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded');
    }
    throw error;
  }
}

/**
 * 从当前项目数据提取元数据
 */
export function extractProjectMeta(project: Project): ProjectMeta {
  return {
    id: project.id,
    name: project.name || '未命名项目',
    customer: project.customer || '',
    salesPerson: project.salesPerson || '',
    notes: project.notes,
    createdAt: project.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 迁移旧数据到新的多项目结构
 */
export function migrateProjectsStorage(): ProjectsStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    // 检查是否已迁移
    const existing = loadProjectsStorage();
    if (existing) return existing;

    // 读取当前项目数据
    const currentData = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!currentData) {
      // 没有现有数据，创建空列表
      const emptyStorage: ProjectsStorage = {
        version: STORAGE_VERSION,
        projects: [],
        currentProjectId: '',
      };
      saveProjectsStorage(emptyStorage);
      return emptyStorage;
    }

    const parsed = JSON.parse(currentData);
    const project: Project = parsed.state?.project || parsed.project;

    if (!project || !project.id) {
      return null;
    }

    // 创建项目列表
    const meta = extractProjectMeta(project);
    const storage: ProjectsStorage = {
      version: STORAGE_VERSION,
      projects: [meta],
      currentProjectId: project.id,
    };

    saveProjectsStorage(storage);
    return storage;
  } catch (error) {
    console.error('Failed to migrate projects storage:', error);
    return null;
  }
}

/**
 * 更新项目元数据
 */
export function updateProjectMeta(projectId: string, updates: Partial<ProjectMeta>): void {
  const storage = loadProjectsStorage();
  if (!storage) return;

  const index = storage.projects.findIndex(p => p.id === projectId);
  if (index === -1) {
    // 新项目，添加元数据
    const projectData = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (projectData) {
      const parsed = JSON.parse(projectData);
      const project: Project = parsed.state?.project || parsed.project;
      if (project && project.id === projectId) {
        storage.projects.push(extractProjectMeta(project));
      }
    }
  } else {
    // 更新现有元数据
    storage.projects[index] = {
      ...storage.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  saveProjectsStorage(storage);
}

/**
 * 删除项目元数据
 */
export function deleteProjectMeta(projectId: string): void {
  const storage = loadProjectsStorage();
  if (!storage) return;

  storage.projects = storage.projects.filter(p => p.id !== projectId);

  // 如果删除的是当前项目，清空 currentProjectId
  if (storage.currentProjectId === projectId) {
    storage.currentProjectId = '';
  }

  saveProjectsStorage(storage);
}

/**
 * 设置当前项目 ID
 */
export function setCurrentProjectId(projectId: string): void {
  const storage = loadProjectsStorage();
  if (!storage) return;

  storage.currentProjectId = projectId;
  saveProjectsStorage(storage);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/project-storage.ts
git commit -m "feat: add project list storage management"
```

---

### Task 3: 编写存储层测试

**Files:**
- Create: `src/stores/__tests__/project-list-storage.test.ts`

- [ ] **Step 1: 编写测试代码**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadProjectsStorage,
  saveProjectsStorage,
  migrateProjectsStorage,
  extractProjectMeta,
  updateProjectMeta,
  deleteProjectMeta,
  setCurrentProjectId,
} from '@/lib/project-storage';
import type { ProjectsStorage, ProjectMeta } from '@/types/project-list';
import type { Project } from '@/types';

describe('project-list-storage', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
  });

  describe('loadProjectsStorage', () => {
    it('should return null when no data exists', () => {
      const result = loadProjectsStorage();
      expect(result).toBeNull();
    });

    it('should load valid storage data', () => {
      const mockData: ProjectsStorage = {
        version: 1,
        projects: [
          {
            id: 'proj_test123',
            name: 'Test Project',
            customer: 'Test Customer',
            salesPerson: 'Test Sales',
            createdAt: '2025-03-12T00:00:00.000Z',
            updatedAt: '2025-03-12T00:00:00.000Z',
          },
        ],
        currentProjectId: 'proj_test123',
      };
      localStorage.setItem('servo-selector-projects', JSON.stringify(mockData));

      const result = loadProjectsStorage();
      expect(result).toEqual(mockData);
    });

    it('should return null for version mismatch', () => {
      const mockData = {
        version: 999,
        projects: [],
        currentProjectId: '',
      };
      localStorage.setItem('servo-selector-projects', JSON.stringify(mockData));

      const result = loadProjectsStorage();
      expect(result).toBeNull();
    });
  });

  describe('saveProjectsStorage', () => {
    it('should save storage data', () => {
      const data: ProjectsStorage = {
        version: 1,
        projects: [],
        currentProjectId: '',
      };

      saveProjectsStorage(data);

      const stored = localStorage.getItem('servo-selector-projects');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(data);
    });

    it('should throw on quota exceeded', () => {
      // Mock localStorage.setItem to throw
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const data: ProjectsStorage = {
        version: 1,
        projects: [],
        currentProjectId: '',
      };

      expect(() => saveProjectsStorage(data)).toThrow('Storage quota exceeded');

      setItemSpy.mockRestore();
    });
  });

  describe('extractProjectMeta', () => {
    it('should extract metadata from project', () => {
      const project: Project = {
        id: 'proj_test123',
        name: 'Test Project',
        customer: 'Test Customer',
        salesPerson: 'Test Sales',
        notes: 'Test notes',
        createdAt: '2025-03-12T00:00:00.000Z',
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

      const meta = extractProjectMeta(project);

      expect(meta.id).toBe('proj_test123');
      expect(meta.name).toBe('Test Project');
      expect(meta.customer).toBe('Test Customer');
      expect(meta.salesPerson).toBe('Test Sales');
      expect(meta.notes).toBe('Test notes');
      expect(meta.createdAt).toBe('2025-03-12T00:00:00.000Z');
      expect(meta.updatedAt).toBeDefined();
    });

    it('should use default name when project name is empty', () => {
      const project: Project = {
        id: 'proj_test123',
        name: '',
        customer: '',
        salesPerson: '',
        createdAt: '2025-03-12T00:00:00.000Z',
        commonParams: {} as any,
        axes: [],
      };

      const meta = extractProjectMeta(project);
      expect(meta.name).toBe('未命名项目');
    });
  });

  describe('migrateProjectsStorage', () => {
    it('should return existing storage if already migrated', () => {
      const existing: ProjectsStorage = {
        version: 1,
        projects: [{ id: 'proj_old', name: 'Old', customer: '', salesPerson: '', createdAt: '', updatedAt: '' }],
        currentProjectId: 'proj_old',
      };
      localStorage.setItem('servo-selector-projects', JSON.stringify(existing));

      const result = migrateProjectsStorage();
      expect(result).toEqual(existing);
    });

    it('should create empty storage when no current project exists', () => {
      const result = migrateProjectsStorage();

      expect(result).toBeDefined();
      expect(result!.version).toBe(1);
      expect(result!.projects).toEqual([]);
      expect(result!.currentProjectId).toBe('');
    });
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npm test -- src/stores/__tests__/project-list-storage.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/stores/__tests__/project-list-storage.test.ts
git commit -m "test: add project list storage tests"
```

---

## Chunk 2: Store 扩展

### Task 4: 扩展 ProjectStore 支持多项目

**Files:**
- Modify: `src/stores/project-store.ts`

- [ ] **Step 1: 添加导入和类型**

在文件顶部添加：

```typescript
import type { ProjectMeta } from '@/types/project-list';
import {
  loadProjectsStorage,
  saveProjectsStorage,
  migrateProjectsStorage,
  extractProjectMeta,
  updateProjectMeta,
  deleteProjectMeta,
  setCurrentProjectId,
} from '@/lib/project-storage';
import { debounce } from '@/lib/utils';
```

- [ ] **Step 2: 扩展 Store 接口**

在 `ProjectStore` 接口中添加：

```typescript
interface ProjectStore {
  // ... existing state

  // Project list operations
  projects: ProjectMeta[];
  saveAndCreateNewProject: (info: ProjectInfo) => void;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  loadProjectsList: () => void;
  syncProjectMeta: () => void;
}
```

- [ ] **Step 3: 初始化状态中添加 projects**

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
```

- [ ] **Step 4: 实现多项目方法**

在 store 实现中添加：

```typescript
// Project list operations
loadProjectsList: () => {
  const storage = migrateProjectsStorage();
  if (storage) {
    set({ projects: storage.projects });
  }
},

syncProjectMeta: () => {
  const state = get();
  updateProjectMeta(state.project.id, {
    name: state.project.name,
    customer: state.project.customer,
    salesPerson: state.project.salesPerson,
    notes: state.project.notes,
  });

  // 更新 store 中的列表
  const storage = loadProjectsStorage();
  if (storage) {
    set({ projects: storage.projects });
  }
},

saveAndCreateNewProject: (info) => {
  const state = get();

  // 1. 保存当前项目元数据
  if (state.project.id && state.project.axes.length > 0) {
    updateProjectMeta(state.project.id, {
      name: state.project.name,
      customer: state.project.customer,
      salesPerson: state.project.salesPerson,
      notes: state.project.notes,
    });
  }

  // 2. 创建新项目
  const newProject = createEmptyProject();
  newProject.name = info.name;
  newProject.customer = info.customer || '';
  newProject.salesPerson = info.salesPerson || '';
  newProject.notes = info.notes;

  // 3. 添加新项目到列表
  const meta = extractProjectMeta(newProject);
  const storage = loadProjectsStorage();
  if (storage) {
    storage.projects.push(meta);
    storage.currentProjectId = newProject.id;
    saveProjectsStorage(storage);
    set({ projects: storage.projects });
  }

  // 4. 切换到新项目状态
  set({
    project: newProject,
    currentAxisId: '',
    currentStep: 1 as WizardStep,
    isComplete: false,
    input: {},
    result: undefined,
  });

  // 5. 更新 localStorage 中的当前项目
  useProjectStore.persist.rehydrate();
},

switchProject: (projectId) => {
  const state = get();

  // 1. 保存当前项目
  if (state.project.id) {
    updateProjectMeta(state.project.id, {
      name: state.project.name,
      customer: state.project.customer,
      salesPerson: state.project.salesPerson,
      notes: state.project.notes,
    });
  }

  // 2. 更新当前项目 ID
  setCurrentProjectId(projectId);

  // 3. 从 localStorage 加载目标项目数据
  // 注意：这里需要重新加载页面或从存储中恢复
  // 简化实现：刷新页面让初始加载逻辑处理
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
},

deleteProject: (projectId) => {
  const state = get();

  // 不能删除当前项目
  if (projectId === state.project.id) {
    throw new Error('Cannot delete current project');
  }

  // 删除元数据
  deleteProjectMeta(projectId);

  // 更新 store
  const storage = loadProjectsStorage();
  if (storage) {
    set({ projects: storage.projects });
  }
},
```

- [ ] **Step 5: 添加防抖同步**

在文件底部添加防抖工具函数（如果 utils 中没有）：

```typescript
// 防抖同步函数
const debouncedSync = debounce(() => {
  const state = useProjectStore.getState();
  if (state.project.id) {
    updateProjectMeta(state.project.id, {
      name: state.project.name,
      customer: state.project.customer,
      salesPerson: state.project.salesPerson,
      notes: state.project.notes,
    });
  }
}, 500);

// 导出供组件使用
export { debouncedSync };
```

- [ ] **Step 6: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat: extend project store with multi-project support"
```

---

## Chunk 3: UI 组件

### Task 5: 创建 NewProjectConfirmModal 组件

**Files:**
- Create: `src/components/project/NewProjectConfirmModal.tsx`

- [ ] **Step 1: 编写组件代码**

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, X } from 'lucide-react';

interface NewProjectConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  lastUpdated: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NewProjectConfirmModal({
  isOpen,
  projectName,
  lastUpdated,
  onConfirm,
  onCancel,
}: NewProjectConfirmModalProps) {
  const t = useTranslations('project.confirmNew');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('message')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">{t('currentProject', { name: projectName })}</span>
              </p>
              <p className="text-gray-500 mt-1">
                {t('lastUpdated', { time: lastUpdated })}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-white bg-[#00A4E4] hover:bg-[#0077C8] rounded-lg transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/NewProjectConfirmModal.tsx
git commit -m "feat: add new project confirm modal"
```

---

### Task 6: 创建 NewProjectFormModal 组件

**Files:**
- Create: `src/components/project/NewProjectFormModal.tsx`

- [ ] **Step 1: 编写组件代码**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, FolderPlus } from 'lucide-react';
import type { ProjectInfo } from '@/types';

interface NewProjectFormModalProps {
  isOpen: boolean;
  onSubmit: (info: ProjectInfo) => void;
  onCancel: () => void;
}

export function NewProjectFormModal({
  isOpen,
  onSubmit,
  onCancel,
}: NewProjectFormModalProps) {
  const t = useTranslations('project.form');
  const [formData, setFormData] = useState<ProjectInfo>({
    name: '',
    customer: '',
    salesPerson: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      name: formData.name || t('namePlaceholder'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00A4E4]/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-[#00A4E4]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('title')}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('namePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A4E4] focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('customer')}
              </label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A4E4] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('salesPerson')}
              </label>
              <input
                type="text"
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A4E4] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A4E4] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[#00A4E4] hover:bg-[#0077C8] rounded-lg transition-colors"
            >
              {t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/NewProjectFormModal.tsx
git commit -m "feat: add new project form modal"
```

---

### Task 7: 创建 ProjectListItem 组件

**Files:**
- Create: `src/components/project/ProjectListItem.tsx`

- [ ] **Step 1: 编写组件代码**

```typescript
'use client';

import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { ProjectMeta } from '@/types/project-list';

interface ProjectListItemProps {
  project: ProjectMeta;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export function ProjectListItem({
  project,
  isActive,
  onClick,
  onDelete,
}: ProjectListItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
        transition-all duration-200
        ${isActive
          ? 'bg-[#00A4E4]/10 border border-[#00A4E4]/30'
          : 'hover:bg-gray-100 border border-transparent'
        }
      `}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isActive ? 'text-[#0077C8]' : 'text-gray-700'}`}>
          {project.name}
        </p>
        {project.customer && (
          <p className="text-xs text-gray-500 truncate">
            {project.customer}
          </p>
        )}
      </div>

      {isActive && (
        <Check className="w-4 h-4 text-[#00A4E4] flex-shrink-0" />
      )}

      {!isActive && onDelete && showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/ProjectListItem.tsx
git commit -m "feat: add project list item component"
```

---

### Task 8: 创建 ProjectPanel 组件

**Files:**
- Create: `src/components/project/ProjectPanel.tsx`

- [ ] **Step 1: 编写组件代码**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  FolderOpen
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectListItem } from './ProjectListItem';
import { NewProjectConfirmModal } from './NewProjectConfirmModal';
import { NewProjectFormModal } from './NewProjectFormModal';
import type { ProjectMeta } from '@/types/project-list';

interface ProjectPanelProps {
  onOpenProjectSettings: () => void;
}

export function ProjectPanel({ onOpenProjectSettings }: ProjectPanelProps) {
  const t = useTranslations('project');
  const {
    project,
    projects,
    loadProjectsList,
    saveAndCreateNewProject,
    switchProject,
    deleteProject
  } = useProjectStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectMeta | null>(null);

  // 加载项目列表
  useEffect(() => {
    loadProjectsList();
  }, [loadProjectsList]);

  const handleNewProjectClick = () => {
    if (project.axes.length > 0) {
      setShowConfirmModal(true);
    } else {
      setShowFormModal(true);
    }
  };

  const handleConfirmNewProject = () => {
    setShowConfirmModal(false);
    setShowFormModal(true);
  };

  const handleCreateProject = (info: { name: string; customer: string; salesPerson: string; notes?: string }) => {
    saveAndCreateNewProject(info);
    setShowFormModal(false);
  };

  const handleSwitchProject = (projectId: string) => {
    if (projectId !== project.id) {
      switchProject(projectId);
    }
  };

  const handleDeleteProject = (projectMeta: ProjectMeta) => {
    setProjectToDelete(projectMeta);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const formatLastUpdated = () => {
    const meta = projects.find(p => p.id === project.id);
    if (!meta?.updatedAt) return '-';
    return new Date(meta.updatedAt).toLocaleString();
  };

  return (
    <>
      <div className="p-3 border-b border-[#e2e8f0]">
        {/* 项目面板标题 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#00A4E4]" />
            <span className="font-medium text-gray-900">{t('title')}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* 展开的内容 */}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {/* 项目列表 */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.map((p) => (
                <ProjectListItem
                  key={p.id}
                  project={p}
                  isActive={p.id === project.id}
                  onClick={() => handleSwitchProject(p.id)}
                  onDelete={() => handleDeleteProject(p)}
                />
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  暂无项目
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <button
                onClick={handleNewProjectClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('newProject')}
              </button>
              <button
                onClick={onOpenProjectSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      <NewProjectConfirmModal
        isOpen={showConfirmModal}
        projectName={project.name || '未命名项目'}
        lastUpdated={formatLastUpdated()}
        onConfirm={handleConfirmNewProject}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* 表单弹窗 */}
      <NewProjectFormModal
        isOpen={showFormModal}
        onSubmit={handleCreateProject}
        onCancel={() => setShowFormModal(false)}
      />

      {/* 删除确认弹窗 */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('delete.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('delete.confirm', { name: projectToDelete.name })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('form.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                {t('delete.confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/ProjectPanel.tsx
git commit -m "feat: add project panel component"
```

---

### Task 9: 创建组件索引文件

**Files:**
- Create: `src/components/project/index.ts`

- [ ] **Step 1: 编写索引文件**

```typescript
export { ProjectPanel } from './ProjectPanel';
export { ProjectListItem } from './ProjectListItem';
export { NewProjectConfirmModal } from './NewProjectConfirmModal';
export { NewProjectFormModal } from './NewProjectFormModal';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/index.ts
git commit -m "feat: add project components index"
```

---

## Chunk 4: 集成和国际化

### Task 10: 修改 AxisSidebar 嵌入 ProjectPanel

**Files:**
- Modify: `src/components/wizard/AxisSidebar.tsx`

- [ ] **Step 1: 添加导入**

在文件顶部添加：

```typescript
import { ProjectPanel } from '@/components/project';
```

- [ ] **Step 2: 在侧边栏中插入 ProjectPanel**

找到 "Project Info Section" 部分，在其之前插入 ProjectPanel：

```typescript
{/* Project Panel - New */}
<ProjectPanel onOpenProjectSettings={onOpenProjectSettings} />

{/* Project Info Section */}
<div className="p-3 border-b border-[#e2e8f0]">
  {/* 原有代码... */}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/wizard/AxisSidebar.tsx
git commit -m "feat: integrate project panel into sidebar"
```

---

### Task 11: 添加中文翻译

**Files:**
- Modify: `src/i18n/messages/zh.json`

- [ ] **Step 1: 添加 project 翻译**

在文件中添加：

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
      "lastUpdated": "最后更新：{time}",
      "cancel": "取消",
      "confirm": "确定"
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
      "confirmButton": "删除"
    }
  }
}
```

注意：需要在合适的位置插入，确保 JSON 格式正确。

- [ ] **Step 2: Commit**

```bash
git add src/i18n/messages/zh.json
git commit -m "i18n: add project panel Chinese translations"
```

---

### Task 12: 添加英文翻译

**Files:**
- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: 添加 project 翻译**

```json
{
  "project": {
    "title": "My Projects",
    "newProject": "New Project",
    "settings": "Project Settings",
    "confirmNew": {
      "title": "Create New Project",
      "message": "Current project has been auto-saved. Are you sure you want to create a new project?",
      "currentProject": "Current: {name}",
      "lastUpdated": "Last updated: {time}",
      "cancel": "Cancel",
      "confirm": "Confirm"
    },
    "form": {
      "title": "New Project Information",
      "name": "Project Name",
      "namePlaceholder": "Unnamed Project",
      "customer": "Customer",
      "salesPerson": "Sales Person",
      "notes": "Notes",
      "create": "Create Project",
      "cancel": "Cancel"
    },
    "delete": {
      "title": "Delete Project",
      "confirm": "Are you sure you want to delete project \"{name}\"? This action cannot be undone.",
      "confirmButton": "Delete"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "i18n: add project panel English translations"
```

---

## Chunk 5: 测试和验证

### Task 13: 运行构建测试

- [ ] **Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: 运行测试**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 3: 运行构建**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: verify build and tests pass" --allow-empty
```

---

## 验收清单

- [ ] 侧边栏显示"项目"面板，可展开/折叠
- [ ] 显示所有历史项目列表
- [ ] 点击项目可切换，数据正确加载
- [ ] 点击"新建项目"弹出确认弹窗（当有数据时）
- [ ] 确认后弹出项目信息表单
- [ ] 创建后新项目正确初始化（显示 Hero）
- [ ] 刷新页面后所有项目数据保留
- [ ] 现有项目数据自动迁移到新的存储结构
- [ ] 项目删除功能正常工作
- [ ] localStorage 满时显示友好提示
- [ ] 多标签页同步正常
- [ ] 中英文翻译完整
