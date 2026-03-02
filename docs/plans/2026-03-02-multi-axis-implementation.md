# 多轴伺服选型功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现多轴伺服选型功能，支持用户配置多个轴、管理轴列表、导出整合PDF报告

**Architecture:** 采用响应式侧边栏设计，桌面端常驻显示，移动端抽屉式。使用 Zustand 管理项目级状态，每个轴独立存储选型数据。

**Tech Stack:** Next.js 14, React 18, TypeScript, TailwindCSS, Zustand, jspdf

---

## 前置检查

### Task 0: 确认工作环境和基线

**Files:**
- Check: `package.json`
- Check: `src/stores/wizard-store.ts`
- Check: `src/types/index.ts`

**Step 1: 确认当前分支和工作目录**

```bash
git branch --show-current
pwd
```

Expected: `feature/multi-axis` 分支，在 `.worktrees/multi-axis` 目录

**Step 2: 运行测试确认基线通过**

```bash
npm test 2>&1 | tail -20
```

Expected: 所有测试通过 (142 passed)

**Step 3: 检查现有类型定义**

Read: `src/types/index.ts`

确认 `SizingInput`, `SizingResult`, `WizardState` 等类型存在

---

## 第一阶段：类型定义和数据模型

### Task 1: 扩展类型定义

**Files:**
- Modify: `src/types/index.ts`

**Step 1: 添加多轴相关类型**

在文件末尾添加：

```typescript
// ============ 多轴功能类型 ============

export type AxisStatus = 'CONFIGURING' | 'COMPLETED' | 'ABANDONED';

export interface AxisConfig {
  id: string;
  name: string;
  status: AxisStatus;
  createdAt: string;
  completedAt?: string;
  input: Partial<SizingInput>;
  result?: SizingResult;
  selectedMotorIndex?: number;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;
  axes: AxisConfig[];
}

export interface MultiAxisReportData {
  project: Project;
  completedAxes: AxisConfig[];
  generatedAt: string;
}
```

**Step 2: 提交**

```bash
git add src/types/index.ts
git commit -m "feat(types): add multi-axis types (AxisConfig, Project, MultiAxisReportData)"
```

---

### Task 2: 创建项目级状态管理

**Files:**
- Create: `src/stores/project-store.ts`
- Create: `src/stores/__tests__/project-store.test.ts`

**Step 1: 编写测试**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore, generateId, migrateLegacyData } from '../project-store';

describe('project-store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useProjectStore.getState();
    store.reset();
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^axis-[a-z0-9]+$/);
    });
  });

  describe('createProject', () => {
    it('should create a new project with initial axis', () => {
      const store = useProjectStore.getState();
      store.createProject({
        name: '测试项目',
        customer: '测试客户',
        salesPerson: '测试员',
      });

      const state = useProjectStore.getState();
      expect(state.project.name).toBe('测试项目');
      expect(state.project.axes).toHaveLength(1);
      expect(state.project.axes[0].name).toBe('轴-1');
      expect(state.project.axes[0].status).toBe('CONFIGURING');
    });
  });

  describe('addAxis', () => {
    it('should add a new blank axis', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      const newAxisId = store.addAxis('新轴');

      const state = useProjectStore.getState();
      expect(state.project.axes).toHaveLength(2);
      expect(state.project.axes[1].name).toBe('新轴');
      expect(state.project.axes[1].status).toBe('CONFIGURING');
    });

    it('should copy from existing axis when copyFrom is provided', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      const firstAxisId = store.project.axes[0].id;
      store.setInput({ project: { name: '子项目', customer: '', salesPerson: '' } });

      const newAxisId = store.addAxis('复制的轴', firstAxisId);

      const state = useProjectStore.getState();
      const newAxis = state.project.axes.find(a => a.id === newAxisId);
      expect(newAxis?.input.project?.name).toBe('子项目');
    });
  });

  describe('switchAxis', () => {
    it('should switch to the specified axis', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      const firstAxisId = store.project.axes[0].id;
      const newAxisId = store.addAxis('第二个轴');

      store.switchAxis(newAxisId);

      const state = useProjectStore.getState();
      expect(state.currentAxisId).toBe(newAxisId);
    });
  });

  describe('completeAxis', () => {
    it('should mark current axis as completed', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      store.completeAxis();

      const state = useProjectStore.getState();
      expect(state.project.axes[0].status).toBe('COMPLETED');
      expect(state.project.axes[0].completedAt).toBeDefined();
    });
  });

  describe('deleteAxis', () => {
    it('should delete the specified axis', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      const newAxisId = store.addAxis('第二个轴');
      store.deleteAxis(newAxisId);

      const state = useProjectStore.getState();
      expect(state.project.axes).toHaveLength(1);
    });

    it('should not delete the last axis', () => {
      const store = useProjectStore.getState();
      store.createProject({ name: '测试', customer: '', salesPerson: '' });

      const onlyAxisId = store.project.axes[0].id;
      store.deleteAxis(onlyAxisId);

      const state = useProjectStore.getState();
      expect(state.project.axes).toHaveLength(1);
    });
  });

  describe('migrateLegacyData', () => {
    it('should return null when no legacy data exists', () => {
      localStorage.removeItem('servo-selector-wizard');
      const result = migrateLegacyData();
      expect(result).toBeNull();
    });

    it('should migrate legacy data to new format', () => {
      const legacyData = {
        currentStep: 3,
        input: {
          project: { name: '旧项目', customer: '旧客户', salesPerson: '旧员' },
        },
        isComplete: true,
        result: { mechanical: { loadInertia: 0.001 } },
      };
      localStorage.setItem('servo-selector-wizard', JSON.stringify(legacyData));

      const result = migrateLegacyData();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('旧项目');
      expect(result?.axes).toHaveLength(1);
      expect(result?.axes[0].status).toBe('COMPLETED');
      expect(result?.axes[0].input.project?.name).toBe('旧项目');
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test -- src/stores/__tests__/project-store.test.ts 2>&1 | tail -30
```

Expected: FAIL - "Cannot find module"

**Step 3: 实现 project-store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project,
  AxisConfig,
  AxisStatus,
  SizingInput,
  SizingResult,
  WizardStep,
  ProjectInfo,
  MechanismConfig,
  MotionParams,
  DutyConditions,
  SystemPreferences,
  MotorSelections,
} from '@/types';

// Generate unique ID for axis
export function generateId(): string {
  return `axis-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate unique ID for project
export function generateProjectId(): string {
  return `proj-${Math.random().toString(36).substring(2, 9)}`;
}

// Create initial axis
function createInitialAxis(): AxisConfig {
  return {
    id: generateId(),
    name: '轴-1',
    status: 'CONFIGURING' as AxisStatus,
    createdAt: new Date().toISOString(),
    input: {},
  };
}

// Create initial project
function createInitialProject(): Project {
  return {
    id: generateProjectId(),
    name: '',
    customer: '',
    salesPerson: '',
    createdAt: new Date().toISOString(),
    axes: [createInitialAxis()],
  };
}

interface ProjectStore {
  // State
  project: Project;
  currentAxisId: string;
  currentStep: WizardStep;
  isComplete: boolean;
  input: Partial<SizingInput>;
  result?: SizingResult;

  // Project operations
  createProject: (info: ProjectInfo) => void;
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;

  // Axis operations
  addAxis: (name: string, copyFrom?: string) => string;
  switchAxis: (axisId: string) => void;
  deleteAxis: (axisId: string) => void;
  updateAxisName: (axisId: string, name: string) => void;
  completeAxis: () => void;

  // Wizard operations
  setStep: (step: WizardStep) => void;
  setInput: (input: Partial<SizingInput>) => void;
  setResult: (result: SizingResult) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Queries
  getCurrentAxis: () => AxisConfig;
  getCompletedAxes: () => AxisConfig[];
  canExportPdf: () => boolean;
}

const initialState = {
  project: createInitialProject(),
  currentAxisId: '',
  currentStep: 1 as WizardStep,
  isComplete: false,
  input: {},
  result: undefined,
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentAxisId: initialState.project.axes[0].id,

      // Project operations
      createProject: (info) =>
        set({
          project: {
            ...createInitialProject(),
            name: info.name,
            customer: info.customer,
            salesPerson: info.salesPerson,
            notes: info.notes,
          },
          currentAxisId: createInitialProject().axes[0].id,
        }),

      updateProjectInfo: (info) =>
        set((state) => ({
          project: {
            ...state.project,
            ...info,
          },
        })),

      // Axis operations
      addAxis: (name, copyFrom) => {
        const state = get();
        const newAxis: AxisConfig = {
          id: generateId(),
          name,
          status: 'CONFIGURING',
          createdAt: new Date().toISOString(),
          input: copyFrom
            ? state.project.axes.find((a) => a.id === copyFrom)?.input || {}
            : {},
        };

        set((state) => ({
          project: {
            ...state.project,
            axes: [...state.project.axes, newAxis],
          },
        }));

        return newAxis.id;
      },

      switchAxis: (axisId) => {
        const state = get();
        const axis = state.project.axes.find((a) => a.id === axisId);
        if (!axis) return;

        // Save current axis state before switching
        const currentAxis = state.project.axes.find((a) => a.id === state.currentAxisId);
        if (currentAxis) {
          set((state) => ({
            project: {
              ...state.project,
              axes: state.project.axes.map((a) =>
                a.id === currentAxis.id
                  ? { ...a, input: state.input, result: state.result }
                  : a
              ),
            },
          }));
        }

        // Load new axis state
        set({
          currentAxisId: axisId,
          currentStep: axis.status === 'COMPLETED' ? 6 : 1,
          isComplete: axis.status === 'COMPLETED',
          input: axis.input,
          result: axis.result,
        });
      },

      deleteAxis: (axisId) => {
        const state = get();
        if (state.project.axes.length <= 1) {
          // Don't delete the last axis
          return;
        }

        const newAxes = state.project.axes.filter((a) => a.id !== axisId);
        set((state) => ({
          project: {
            ...state.project,
            axes: newAxes,
          },
          currentAxisId:
            state.currentAxisId === axisId
              ? newAxes[0].id
              : state.currentAxisId,
        }));
      },

      updateAxisName: (axisId, name) =>
        set((state) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a) =>
              a.id === axisId ? { ...a, name } : a
            ),
          },
        })),

      completeAxis: () =>
        set((state) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a) =>
              a.id === state.currentAxisId
                ? {
                    ...a,
                    status: 'COMPLETED' as AxisStatus,
                    completedAt: new Date().toISOString(),
                    input: state.input,
                    result: state.result,
                  }
                : a
            ),
          },
        })),

      // Wizard operations
      setStep: (step) => set({ currentStep: step }),

      setInput: (input) =>
        set((state) => ({
          input: { ...state.input, ...input },
        })),

      setResult: (result) => set({ result }),

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 5) {
          set({ currentStep: (currentStep + 1) as WizardStep });
        }
      },

      prevStep: () => {
        const { currentStep, isComplete } = get();
        if (isComplete) {
          set({ isComplete: false });
        } else if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as WizardStep });
        }
      },

      reset: () => {
        const newProject = createInitialProject();
        set({
          ...initialState,
          project: newProject,
          currentAxisId: newProject.axes[0].id,
        });
      },

      // Queries
      getCurrentAxis: () => {
        const state = get();
        return (
          state.project.axes.find((a) => a.id === state.currentAxisId) ||
          state.project.axes[0]
        );
      },

      getCompletedAxes: () => {
        const state = get();
        return state.project.axes.filter((a) => a.status === 'COMPLETED');
      },

      canExportPdf: () => {
        const state = get();
        return state.project.axes.some((a) => a.status === 'COMPLETED');
      },
    }),
    {
      name: 'servo-selector-project',
    }
  )
);

// Migration function for legacy data
export function migrateLegacyData(): Project | null {
  if (typeof window === 'undefined') return null;

  const legacy = localStorage.getItem('servo-selector-wizard');
  if (!legacy) return null;

  try {
    const parsed = JSON.parse(legacy);

    const project: Project = {
      id: generateProjectId(),
      name: parsed.input?.project?.name || '未命名项目',
      customer: parsed.input?.project?.customer || '',
      salesPerson: parsed.input?.project?.salesPerson || '',
      notes: parsed.input?.project?.notes,
      createdAt: new Date().toISOString(),
      axes: [
        {
          id: generateId(),
          name: '轴-1',
          status: parsed.isComplete ? 'COMPLETED' : 'CONFIGURING',
          createdAt: new Date().toISOString(),
          completedAt: parsed.isComplete ? new Date().toISOString() : undefined,
          input: parsed.input || {},
          result: parsed.result,
        },
      ],
    };

    return project;
  } catch {
    return null;
  }
}
```

**Step 4: 运行测试确认通过**

```bash
npm test -- src/stores/__tests__/project-store.test.ts 2>&1 | tail -20
```

Expected: PASS (all tests)

**Step 5: 提交**

```bash
git add src/stores/project-store.ts src/stores/__tests__/project-store.test.ts
git commit -m "feat(store): add project-store with multi-axis support

- Add AxisConfig, Project types
- Implement add/switch/delete/complete axis operations
- Add legacy data migration function
- Include comprehensive unit tests"
```

---

## 第二阶段：UI 组件开发

### Task 3: 创建 AxisSidebarItem 组件

**Files:**
- Create: `src/components/wizard/AxisSidebarItem.tsx`
- Create: `src/components/wizard/__tests__/AxisSidebarItem.test.tsx`

**Step 1: 编写测试**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AxisSidebarItem } from '../AxisSidebarItem';
import type { AxisConfig } from '@/types';

describe('AxisSidebarItem', () => {
  const mockAxis: AxisConfig = {
    id: 'axis-1',
    name: 'X轴-龙门X向',
    status: 'COMPLETED',
    createdAt: '2026-03-02T00:00:00Z',
    completedAt: '2026-03-02T01:00:00Z',
    input: {},
  };

  it('should render axis name', () => {
    render(
      <AxisSidebarItem
        axis={mockAxis}
        isActive={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('X轴-龙门X向')).toBeInTheDocument();
  });

  it('should show completed status icon', () => {
    render(
      <AxisSidebarItem
        axis={mockAxis}
        isActive={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should show configuring status icon', () => {
    const configuringAxis = { ...mockAxis, status: 'CONFIGURING' as const };
    render(
      <AxisSidebarItem
        axis={configuringAxis}
        isActive={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('should highlight when active', () => {
    render(
      <AxisSidebarItem
        axis={mockAxis}
        isActive={true}
        onClick={() => {}}
      />
    );
    const item = screen.getByRole('button');
    expect(item).toHaveClass('bg-blue-50');
    expect(item).toHaveClass('border-blue-500');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <AxisSidebarItem
        axis={mockAxis}
        isActive={false}
        onClick={handleClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should show current indicator when active', () => {
    render(
      <AxisSidebarItem
        axis={{ ...mockAxis, status: 'CONFIGURING' as const }}
        isActive={true}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('▶')).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test -- src/components/wizard/__tests__/AxisSidebarItem.test.tsx 2>&1 | tail -20
```

Expected: FAIL

**Step 3: 实现组件**

```typescript
'use client';

import type { AxisConfig } from '@/types';

interface AxisSidebarItemProps {
  axis: AxisConfig;
  isActive: boolean;
  onClick: () => void;
}

export function AxisSidebarItem({ axis, isActive, onClick }: AxisSidebarItemProps) {
  const statusIcon = {
    COMPLETED: '✅',
    CONFIGURING: '🔄',
    ABANDONED: '❌',
  }[axis.status];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-colors
        flex items-center justify-between
        ${
          isActive
            ? 'bg-blue-50 border-blue-500 shadow-sm'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0">🛠️</span>
        <span className="truncate font-medium text-gray-900">{axis.name}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm">{statusIcon}</span>
        {isActive && axis.status === 'CONFIGURING' && (
          <span className="text-xs text-blue-600 font-medium">▶</span>
        )}
      </div>
    </button>
  );
}
```

**Step 4: 运行测试确认通过**

```bash
npm test -- src/components/wizard/__tests__/AxisSidebarItem.test.tsx 2>&1 | tail -20
```

Expected: PASS

**Step 5: 提交**

```bash
git add src/components/wizard/AxisSidebarItem.tsx src/components/wizard/__tests__/AxisSidebarItem.test.tsx
git commit -m "feat(ui): add AxisSidebarItem component

- Display axis name and status icon
- Highlight active axis
- Include unit tests"
```

---

### Task 4: 创建 AddAxisButton 组件

**Files:**
- Create: `src/components/wizard/AddAxisButton.tsx`
- Create: `src/components/wizard/__tests__/AddAxisButton.test.tsx`

**Step 1: 编写测试**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddAxisButton } from '../AddAxisButton';

describe('AddAxisButton', () => {
  it('should render button with text', () => {
    render(<AddAxisButton onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('➕');
    expect(screen.getByRole('button')).toHaveTextContent('添加新轴');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AddAxisButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AddAxisButton onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Step 2: 运行测试确认失败**

**Step 3: 实现组件**

```typescript
'use client';

interface AddAxisButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddAxisButton({ onClick, disabled }: AddAxisButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full p-3 rounded-lg border border-dashed border-gray-300
        text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
        transition-colors flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <span>➕</span>
      <span className="font-medium">添加新轴</span>
    </button>
  );
}
```

**Step 4: 运行测试确认通过**

**Step 5: 提交**

```bash
git add src/components/wizard/AddAxisButton.tsx src/components/wizard/__tests__/AddAxisButton.test.tsx
git commit -m "feat(ui): add AddAxisButton component"
```

---

### Task 5: 创建 AxisSidebar 组件

**Files:**
- Create: `src/components/wizard/AxisSidebar.tsx`
- Create: `src/components/wizard/__tests__/AxisSidebar.test.tsx`

**Step 1: 编写测试**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AxisSidebar } from '../AxisSidebar';
import type { Project, AxisConfig } from '@/types';

describe('AxisSidebar', () => {
  const mockProject: Project = {
    id: 'proj-1',
    name: '测试项目',
    customer: '客户A',
    salesPerson: '销售B',
    createdAt: '2026-03-02T00:00:00Z',
    axes: [
      {
        id: 'axis-1',
        name: 'X轴',
        status: 'COMPLETED',
        createdAt: '2026-03-02T00:00:00Z',
        input: {},
      },
      {
        id: 'axis-2',
        name: 'Y轴',
        status: 'CONFIGURING',
        createdAt: '2026-03-02T00:00:00Z',
        input: {},
      },
    ],
  };

  const defaultProps = {
    project: mockProject,
    currentAxisId: 'axis-2',
    onSwitchAxis: vi.fn(),
    onAddAxis: vi.fn(),
    onDeleteAxis: vi.fn(),
    onExportPdf: vi.fn(),
    canExportPdf: true,
  };

  it('should render project name', () => {
    render(<AxisSidebar {...defaultProps} />);
    expect(screen.getByText('测试项目')).toBeInTheDocument();
  });

  it('should render axis count', () => {
    render(<AxisSidebar {...defaultProps} />);
    expect(screen.getByText('2 个轴')).toBeInTheDocument();
  });

  it('should render all axes', () => {
    render(<AxisSidebar {...defaultProps} />);
    expect(screen.getByText('X轴')).toBeInTheDocument();
    expect(screen.getByText('Y轴')).toBeInTheDocument();
  });

  it('should call onSwitchAxis when axis is clicked', () => {
    const onSwitchAxis = vi.fn();
    render(<AxisSidebar {...defaultProps} onSwitchAxis={onSwitchAxis} />);
    fireEvent.click(screen.getByText('X轴'));
    expect(onSwitchAxis).toHaveBeenCalledWith('axis-1');
  });

  it('should call onAddAxis when add button is clicked', () => {
    const onAddAxis = vi.fn();
    render(<AxisSidebar {...defaultProps} onAddAxis={onAddAxis} />);
    fireEvent.click(screen.getByText('添加新轴'));
    expect(onAddAxis).toHaveBeenCalled();
  });

  it('should show export button when canExportPdf is true', () => {
    render(<AxisSidebar {...defaultProps} canExportPdf={true} />);
    expect(screen.getByText('导出项目PDF')).toBeInTheDocument();
  });

  it('should disable export button when canExportPdf is false', () => {
    render(<AxisSidebar {...defaultProps} canExportPdf={false} />);
    expect(screen.getByText('导出项目PDF')).toBeDisabled();
  });
});
```

**Step 2: 运行测试确认失败**

**Step 3: 实现组件**

```typescript
'use client';

import { AxisSidebarItem } from './AxisSidebarItem';
import { AddAxisButton } from './AddAxisButton';
import type { Project } from '@/types';

interface AxisSidebarProps {
  project: Project;
  currentAxisId: string;
  onSwitchAxis: (axisId: string) => void;
  onAddAxis: () => void;
  onDeleteAxis: (axisId: string) => void;
  onExportPdf: () => void;
  canExportPdf: boolean;
}

export function AxisSidebar({
  project,
  currentAxisId,
  onSwitchAxis,
  onAddAxis,
  onExportPdf,
  canExportPdf,
}: AxisSidebarProps) {
  const completedCount = project.axes.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Project Info */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 truncate" title={project.name}>
          {project.name || '未命名项目'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {project.axes.length} 个轴
          {completedCount > 0 && ` · ${completedCount} 个已完成`}
        </p>
      </div>

      {/* Axis List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {project.axes.map((axis) => (
          <AxisSidebarItem
            key={axis.id}
            axis={axis}
            isActive={axis.id === currentAxisId}
            onClick={() => onSwitchAxis(axis.id)}
          />
        ))}
      </div>

      {/* Add Axis */}
      <div className="p-2 border-t border-gray-200">
        <AddAxisButton onClick={onAddAxis} />
      </div>

      {/* Project Basket */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">📋 项目篮子</span>
          <span className="text-xs text-gray-500">{completedCount} 个轴</span>
        </div>
        <button
          onClick={onExportPdf}
          disabled={!canExportPdf}
          className="
            w-full px-4 py-2 bg-green-600 text-white rounded-md
            hover:bg-green-700 transition-colors
            disabled:bg-gray-400 disabled:cursor-not-allowed
            text-sm font-medium flex items-center justify-center gap-2
          "
        >
          <span>📄</span>
          <span>导出项目PDF</span>
        </button>
        {!canExportPdf && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            完成至少一个轴后可导出
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 4: 运行测试确认通过**

**Step 5: 提交**

```bash
git add src/components/wizard/AxisSidebar.tsx src/components/wizard/__tests__/AxisSidebar.test.tsx
git commit -m "feat(ui): add AxisSidebar component

- Display project info and axis count
- List all axes with status
- Include add axis button and export PDF button
- Responsive layout for desktop"
```

---

### Task 6: 创建移动端侧边栏抽屉

**Files:**
- Create: `src/components/wizard/MobileAxisDrawer.tsx`
- Modify: `src/components/wizard/AxisSidebar.tsx` (导出复用)

**Step 1: 安装依赖**

检查是否已有 Sheet 组件，如果没有需要安装 shadcn/ui 或创建自定义抽屉：

```bash
ls src/components/ui/ 2>/dev/null | grep -i sheet || echo "Sheet component not found"
```

如果没有 Sheet 组件，创建一个简单的抽屉：

**Step 2: 创建 MobileAxisDrawer**

```typescript
'use client';

import { useState } from 'react';
import { AxisSidebar } from './AxisSidebar';
import type { Project } from '@/types';

interface MobileAxisDrawerProps {
  project: Project;
  currentAxisId: string;
  onSwitchAxis: (axisId: string) => void;
  onAddAxis: () => void;
  onDeleteAxis: (axisId: string) => void;
  onExportPdf: () => void;
  canExportPdf: boolean;
}

export function MobileAxisDrawer({
  project,
  currentAxisId,
  onSwitchAxis,
  onAddAxis,
  onDeleteAxis,
  onExportPdf,
  canExportPdf,
}: MobileAxisDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchAxis = (axisId: string) => {
    onSwitchAxis(axisId);
    setIsOpen(false);
  };

  const handleExportPdf = () => {
    onExportPdf();
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
        aria-label="打开轴列表"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">轴列表</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <AxisSidebar
              project={project}
              currentAxisId={currentAxisId}
              onSwitchAxis={handleSwitchAxis}
              onAddAxis={() => {
                onAddAxis();
                setIsOpen(false);
              }}
              onDeleteAxis={onDeleteAxis}
              onExportPdf={handleExportPdf}
              canExportPdf={canExportPdf}
            />
          </div>
        </>
      )}
    </>
  );
}
```

**Step 3: 提交**

```bash
git add src/components/wizard/MobileAxisDrawer.tsx
git commit -m "feat(ui): add MobileAxisDrawer component

- Hamburger menu button for mobile
- Slide-out drawer with AxisSidebar
- Close on overlay click or axis selection"
```

---

## 第三阶段：集成到页面

### Task 7: 修改主页面布局

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 读取当前 page.tsx**

**Step 2: 修改页面布局**

```typescript
'use client';

import { useEffect } from 'react';
import { useProjectStore, migrateLegacyData } from '@/stores/project-store';
import { AxisSidebar } from '@/components/wizard/AxisSidebar';
import { MobileAxisDrawer } from '@/components/wizard/MobileAxisDrawer';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { ProjectInfoStep } from '@/components/wizard/steps/ProjectInfoStep';
import { MechanismStep } from '@/components/wizard/steps/MechanismStep';
import { MotionStep } from '@/components/wizard/steps/MotionStep';
import { DutyStep } from '@/components/wizard/steps/DutyStep';
import { SystemConfigStep } from '@/components/wizard/steps/SystemConfigStep';
import { ResultStep } from '@/components/wizard/steps/ResultStep';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const {
    project,
    currentAxisId,
    currentStep,
    isComplete,
    result,
    switchAxis,
    addAxis,
    deleteAxis,
    completeAxis,
    canExportPdf,
    reset,
    createProject,
  } = useProjectStore();

  // Migrate legacy data on first load
  useEffect(() => {
    const migrated = migrateLegacyData();
    if (migrated) {
      useProjectStore.setState({
        project: migrated,
        currentAxisId: migrated.axes[0].id,
        currentStep: migrated.axes[0].status === 'COMPLETED' ? 6 : 1,
        isComplete: migrated.axes[0].status === 'COMPLETED',
        input: migrated.axes[0].input,
        result: migrated.axes[0].result,
      });
      // Clear legacy data after migration
      localStorage.removeItem('servo-selector-wizard');
    } else if (!project.name) {
      // Initialize with empty project if no data
      createProject({ name: '', customer: '', salesPerson: '' });
    }
  }, []);

  const handleAddAxis = () => {
    const newAxisId = addAxis(`轴-${project.axes.length + 1}`);
    switchAxis(newAxisId);
  };

  const handleExportPdf = () => {
    // TODO: Implement multi-axis PDF export
    console.log('Export PDF for project:', project.name);
  };

  const renderStep = () => {
    if (isComplete) {
      return <ResultStep />;
    }

    switch (currentStep) {
      case 1:
        return <ProjectInfoStep />;
      case 2:
        return <MechanismStep />;
      case 3:
        return <MotionStep />;
      case 4:
        return <DutyStep />;
      case 5:
        return <SystemConfigStep />;
      default:
        return <ProjectInfoStep />;
    }
  };

  const currentAxis = project.axes.find((a) => a.id === currentAxisId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 border-r border-gray-200">
        <AxisSidebar
          project={project}
          currentAxisId={currentAxisId}
          onSwitchAxis={switchAxis}
          onAddAxis={handleAddAxis}
          onDeleteAxis={deleteAxis}
          onExportPdf={handleExportPdf}
          canExportPdf={canExportPdf()}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
          <header className="mb-6 sm:mb-8 text-center relative">
            {/* Mobile Menu Button */}
            <div className="absolute left-0 top-0 md:hidden">
              <MobileAxisDrawer
                project={project}
                currentAxisId={currentAxisId}
                onSwitchAxis={switchAxis}
                onAddAxis={handleAddAxis}
                onDeleteAxis={deleteAxis}
                onExportPdf={handleExportPdf}
                canExportPdf={canExportPdf()}
              />
            </div>

            {/* Desktop: Language Switcher */}
            <div className="hidden md:block absolute right-0 top-0">
              <LanguageSwitcher />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              博世力士乐伺服选型工具
            </h1>
            <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>

            {/* Mobile: Language Switcher */}
            <div className="md:hidden mt-4 flex justify-center">
              <LanguageSwitcher />
            </div>

            {/* Current Axis Indicator */}
            {currentAxis && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>🛠️</span>
                <span>当前配置: {currentAxis.name}</span>
                {currentAxis.status === 'CONFIGURING' && (
                  <span className="text-xs">🔄</span>
                )}
              </div>
            )}
          </header>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <StepIndicator currentStep={currentStep} />
            <div className="mt-8">{renderStep()}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 3: 运行测试**

```bash
npm test 2>&1 | tail -20
```

Expected: All tests pass

**Step 4: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat(page): integrate multi-axis sidebar into main layout

- Add desktop sidebar and mobile drawer
- Display current axis indicator
- Support legacy data migration"
```

---

### Task 8: 修改 ProjectInfoStep 支持轴命名

**Files:**
- Modify: `src/components/wizard/steps/ProjectInfoStep.tsx`

**Step 1: 读取当前文件**

**Step 2: 添加轴名称编辑功能**

在表单中添加轴名称输入字段，显示当前是第几个轴：

```typescript
// 在 return 中添加
<div className="bg-blue-50 p-4 rounded-lg mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    当前轴名称
  </label>
  <input
    type="text"
    value={currentAxisName}
    onChange={(e) => updateAxisName(currentAxisId, e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    placeholder="例如：X轴-龙门X向"
  />
  <p className="text-xs text-gray-500 mt-1">
    这是第 {axisIndex} 个轴，共 {totalAxes} 个轴
  </p>
</div>
```

**Step 3: 提交**

```bash
git add src/components/wizard/steps/ProjectInfoStep.tsx
git commit -m "feat(step1): add axis name editing in ProjectInfoStep

- Display current axis index and total count
- Allow editing axis name"
```

---

### Task 9: 修改 ResultStep 添加"保存到篮子"

**Files:**
- Modify: `src/components/wizard/steps/ResultStep.tsx`

**Step 1: 读取当前文件**

**Step 2: 添加保存到篮子功能**

替换原有的 reset 按钮区域：

```typescript
// 在底部按钮区域
<div className="flex flex-col sm:flex-row justify-between gap-3">
  <button
    onClick={prevStep}
    className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
  >
    {t('backToEdit')}
  </button>
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={reset}
      className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
    >
      {t('restart')}
    </button>
    <button
      onClick={() => {
        completeAxis();
        // Show options: add new axis, copy and modify, view basket
      }}
      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <span>💾</span>
      <span>保存到篮子</span>
    </button>
    <div className="w-full sm:w-auto">
      <PdfExportButton data={prepareReportData()} disabled={!config} />
    </div>
  </div>
</div>
```

**Step 3: 添加保存后的选项对话框**

```typescript
const [showSaveOptions, setShowSaveOptions] = useState(false);

// 在保存到篮子后显示
{showSaveOptions && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">轴已保存到篮子</h3>
      <div className="space-y-2">
        <button
          onClick={() => {
            addAxis(`轴-${project.axes.length + 1}`, currentAxisId);
            setShowSaveOptions(false);
          }}
          className="w-full p-3 text-left rounded-lg border hover:bg-gray-50"
        >
          🔄 基于此轴创建新轴
        </button>
        <button
          onClick={() => {
            addAxis(`轴-${project.axes.length + 1}`);
            setShowSaveOptions(false);
          }}
          className="w-full p-3 text-left rounded-lg border hover:bg-gray-50"
        >
          ➕ 添加空白新轴
        </button>
        <button
          onClick={() => setShowSaveOptions(false)}
          className="w-full p-3 text-left rounded-lg border hover:bg-gray-50"
        >
          📋 继续编辑当前轴
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 4: 提交**

```bash
git add src/components/wizard/steps/ResultStep.tsx
git commit -m "feat(result): add save to basket functionality

- Replace simple reset with save to basket
- Show options dialog after saving
- Support copy-and-modify workflow"
```

---

## 第四阶段：多轴 PDF 导出

### Task 10: 创建多轴 PDF 生成逻辑

**Files:**
- Create: `src/lib/pdf/multi-axis-report.ts`
- Modify: `src/lib/pdf/types.ts`

**Step 1: 扩展 PDF 类型**

```typescript
// Add to src/lib/pdf/types.ts
export interface MultiAxisReportData {
  project: {
    name: string;
    customer: string;
    salesPerson: string;
    date: string;
    notes?: string;
  };
  axes: Array<{
    name: string;
    calculations: {
      loadInertia: string;
      rmsTorque: string;
      peakTorque: string;
      maxSpeed: string;
    };
    motor: {
      model: string;
      partNumber: string;
      ratedTorque: number;
      ratedSpeed: number;
    };
    drive: {
      model: string;
      partNumber: string;
    };
  }>;
  bom: Array<{
    partNumber: string;
    description: string;
    quantity: number;
    usedIn: string[];
  }>;
}
```

**Step 2: 实现多轴 PDF 生成**

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { MultiAxisReportData } from './types';

export function generateMultiAxisPdf(data: MultiAxisReportData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('博世力士乐伺服系统选型报告', pageWidth / 2, 20, { align: 'center' });

  // Project Info
  doc.setFontSize(12);
  doc.text(`项目名称: ${data.project.name}`, 20, 40);
  doc.text(`客户: ${data.project.customer}`, 20, 48);
  doc.text(`日期: ${data.project.date}`, 20, 56);

  // Overview
  doc.setFontSize(14);
  doc.text('📊 项目概览', 20, 75);

  const overviewData = [
    ['总轴数', data.axes.length.toString()],
    ['已完成轴数', data.axes.length.toString()],
  ];

  (doc as any).autoTable({
    startY: 80,
    head: [['项目', '数值']],
    body: overviewData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Each Axis
  let currentY = (doc as any).lastAutoTable.finalY + 15;

  data.axes.forEach((axis, index) => {
    // Check if need new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text(`🛠️ 轴 ${index + 1}: ${axis.name}`, 20, currentY);
    currentY += 10;

    // Calculations
    doc.setFontSize(12);
    const calcData = [
      ['负载惯量', `${axis.calculations.loadInertia} kg·m²`],
      ['RMS转矩', `${axis.calculations.rmsTorque} N·m`],
      ['峰值转矩', `${axis.calculations.peakTorque} N·m`],
      ['最大速度', `${axis.calculations.maxSpeed} rpm`],
    ];

    (doc as any).autoTable({
      startY: currentY,
      head: [['参数', '数值']],
      body: calcData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Motor & Drive
    const motorDriveData = [
      ['电机型号', axis.motor.model],
      ['电机料号', axis.motor.partNumber],
      ['驱动器型号', axis.drive.model],
      ['驱动器料号', axis.drive.partNumber],
    ];

    (doc as any).autoTable({
      startY: currentY,
      head: [['类型', '型号/料号']],
      body: motorDriveData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  });

  // BOM
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.text('📋 物料清单 (BOM)', 20, currentY);
  currentY += 10;

  const bomData = data.bom.map((item) => [
    item.partNumber,
    item.description,
    item.quantity.toString(),
    item.usedIn.join(', '),
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [['料号', '描述', '数量', '用于']],
    body: bomData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  return doc;
}
```

**Step 3: 提交**

```bash
git add src/lib/pdf/multi-axis-report.ts src/lib/pdf/types.ts
git commit -m "feat(pdf): add multi-axis PDF generation

- Generate consolidated report for all axes
- Include BOM with quantity aggregation
- Show each axis configuration"
```

---

### Task 11: 创建 ProjectPdfExport 组件

**Files:**
- Create: `src/components/wizard/ProjectPdfExport.tsx`

**Step 1: 实现组件**

```typescript
'use client';

import { useState } from 'react';
import { generateMultiAxisPdf } from '@/lib/pdf/multi-axis-report';
import type { Project, AxisConfig } from '@/types';

interface ProjectPdfExportProps {
  project: Project;
}

export function ProjectPdfExport({ project }: ProjectPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);

    try {
      const completedAxes = project.axes.filter((a) => a.status === 'COMPLETED');

      // Build report data
      const reportData = {
        project: {
          name: project.name,
          customer: project.customer,
          salesPerson: project.salesPerson,
          date: new Date().toLocaleDateString(),
          notes: project.notes,
        },
        axes: completedAxes.map((axis) => ({
          name: axis.name,
          calculations: {
            loadInertia: axis.result?.mechanical.loadInertia.toExponential(3) || '-',
            rmsTorque: axis.result?.mechanical.torques.rms.toFixed(2) || '-',
            peakTorque: axis.result?.mechanical.torques.peak.toFixed(2) || '-',
            maxSpeed: axis.result?.mechanical.speeds.max.toFixed(0) || '-',
          },
          motor: {
            model: axis.result?.motorRecommendations[0]?.motor.baseModel || '-',
            partNumber: axis.result?.motorRecommendations[0]?.motor.model || '-',
            ratedTorque: axis.result?.motorRecommendations[0]?.motor.ratedTorque || 0,
            ratedSpeed: axis.result?.motorRecommendations[0]?.motor.ratedSpeed || 0,
          },
          drive: {
            model: axis.result?.motorRecommendations[0]?.systemConfig?.drive.baseModel || '-',
            partNumber: axis.result?.motorRecommendations[0]?.systemConfig?.drive.model || '-',
          },
        })),
        bom: buildBom(completedAxes),
      };

      const doc = generateMultiAxisPdf(reportData);
      doc.save(`${project.name || '伺服选型报告'}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="
        w-full px-4 py-2 bg-green-600 text-white rounded-md
        hover:bg-green-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-sm font-medium flex items-center justify-center gap-2
      "
    >
      <span>{isGenerating ? '⏳' : '📄'}</span>
      <span>{isGenerating ? '生成中...' : '导出项目PDF'}</span>
    </button>
  );
}

function buildBom(axes: AxisConfig[]) {
  const bomMap = new Map<
    string,
    { description: string; quantity: number; usedIn: string[] }
  >();

  axes.forEach((axis) => {
    const motorPn = axis.result?.motorRecommendations[0]?.motor.model;
    if (motorPn) {
      const existing = bomMap.get(motorPn);
      if (existing) {
        existing.quantity += 1;
        if (!existing.usedIn.includes(axis.name)) {
          existing.usedIn.push(axis.name);
        }
      } else {
        bomMap.set(motorPn, {
          description: axis.result?.motorRecommendations[0]?.motor.baseModel || '',
          quantity: 1,
          usedIn: [axis.name],
        });
      }
    }
  });

  return Array.from(bomMap.entries()).map(([partNumber, data]) => ({
    partNumber,
    description: data.description,
    quantity: data.quantity,
    usedIn: data.usedIn,
  }));
}
```

**Step 2: 更新 AxisSidebar 使用新组件**

```typescript
// In AxisSidebar.tsx, replace the export button with:
import { ProjectPdfExport } from './ProjectPdfExport';

// ...
<ProjectPdfExport project={project} />
```

**Step 3: 提交**

```bash
git add src/components/wizard/ProjectPdfExport.tsx src/components/wizard/AxisSidebar.tsx
git commit -m "feat(pdf): add ProjectPdfExport component

- Generate multi-axis PDF with BOM aggregation
- Show loading state during generation"
```

---

## 第五阶段：测试和验证

### Task 12: 运行所有测试

```bash
npm test 2>&1 | tail -30
```

Expected: All tests pass

### Task 13: 构建验证

```bash
npm run build 2>&1 | tail -30
```

Expected: Build successful

### Task 14: 提交所有更改

```bash
git add .
git commit -m "feat(multi-axis): complete multi-axis servo selection feature

- Add project-level state management with project-store
- Create responsive AxisSidebar for desktop and mobile
- Support adding, switching, deleting axes
- Add save to basket workflow with copy-and-modify
- Generate consolidated multi-axis PDF report
- Include BOM aggregation by part number
- Migrate legacy single-axis data

Closes #[issue-number]"
```

---

## 实施检查清单

- [ ] Task 0: 基线测试通过
- [ ] Task 1: 类型定义扩展
- [ ] Task 2: project-store 实现和测试
- [ ] Task 3: AxisSidebarItem 组件
- [ ] Task 4: AddAxisButton 组件
- [ ] Task 5: AxisSidebar 组件
- [ ] Task 6: MobileAxisDrawer 组件
- [ ] Task 7: 主页面布局集成
- [ ] Task 8: ProjectInfoStep 轴命名
- [ ] Task 9: ResultStep 保存到篮子
- [ ] Task 10: 多轴 PDF 生成逻辑
- [ ] Task 11: ProjectPdfExport 组件
- [ ] Task 12: 所有测试通过
- [ ] Task 13: 构建成功
