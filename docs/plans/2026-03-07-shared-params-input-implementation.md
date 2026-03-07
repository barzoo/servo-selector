# 共享参数输入优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构多轴选型工具的数据结构，将项目信息和公共参数提升到项目级，所有轴共享，减少重复输入

**Architecture:** 采用总-分结构，Project 包含 commonParams（共享）和 axes（特有）。计算时通过 buildSizingInput() 合并数据。UI 上添加项目设置弹窗统一管理公共参数。

**Tech Stack:** Next.js, TypeScript, Zustand, TailwindCSS, jsPDF

---

## 前置检查

### Task 0: 检查当前项目状态

**Files:**
- Read: `src/types/index.ts`
- Read: `src/stores/project-store.ts`
- Read: `src/components/wizard/steps/DutyStep.tsx`

**Step 1: 确认当前数据结构**

检查当前 SizingInput 和 Project 类型定义，了解需要迁移的字段。

**Step 2: 确认现有测试**

运行现有测试确保基线通过：

```bash
npm test -- --run
```

Expected: All tests pass

---

## 第一阶段：数据模型重构

### Task 1: 更新类型定义 - 添加 CommonParams

**Files:**
- Modify: `src/types/index.ts:86-135`

**Step 1: 添加 CommonParams 接口**

在 `SystemPreferences` 后添加：

```typescript
// ============ 公共参数（项目级，所有轴共享） ============

export interface CommonParams {
  // 环境条件
  ambientTemp: number;        // 环境温度 (°C)
  ipRating: 'IP54' | 'IP65' | 'IP67';

  // 系统偏好
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  cableLength: number | 'TERMINAL_ONLY';
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;
}
```

**Step 2: 更新 DutyConditions（移除公共参数）**

修改 `DutyConditions` 接口：

```typescript
export interface DutyConditions {
  // 轴特有参数
  dutyCycle: number;
  mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
  brake: boolean;
  keyShaft: 'L' | 'K';
  // 移除: ambientTemp, ipRating（移到 CommonParams）
}
```

**Step 3: 更新 SystemPreferences（移除公共参数）**

修改 `SystemPreferences` 接口：

```typescript
export interface SystemPreferences {
  // 这些参数移到 CommonParams
  // safetyFactor: number;
  // maxInertiaRatio: number;
  // targetInertiaRatio: number;
  // communication: ...;
  // cableLength: ...;

  // 保留轴特有参数
  encoderType: 'A' | 'B' | 'BOTH';
  safety: 'STO' | 'NONE';
}
```

**Step 4: 更新 Project 接口**

修改 `Project` 接口：

```typescript
export interface Project {
  id: string;

  // 项目信息
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;

  // 公共参数（所有轴共享）
  commonParams: CommonParams;

  // 轴列表
  axes: AxisConfig[];
}
```

**Step 5: 更新 AxisConfig 的 input 类型**

```typescript
export interface AxisConfig {
  id: string;
  name: string;
  status: AxisStatus;
  createdAt: string;
  completedAt?: string;

  // 轴特有输入（不再包含公共参数）
  input: {
    mechanism?: MechanismConfig;
    motion?: MotionParams;
    dutyConditions?: DutyConditions;  // 简化后的工作条件
    preferences?: SystemPreferences;  // 简化后的系统偏好
    selections?: MotorSelections;
  };

  result?: SizingResult;
  selectedMotorIndex?: number;
}
```

**Step 6: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 可能有错误（因为其他文件还在使用旧类型），但类型定义本身正确

**Step 7: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add CommonParams and update Project/AxisConfig interfaces"
```

---

### Task 2: 创建数据合并工具函数

**Files:**
- Create: `src/lib/calculations/build-sizing-input.ts`
- Test: `src/lib/calculations/__tests__/build-sizing-input.test.ts`

**Step 1: 编写测试**

```typescript
import { describe, it, expect } from 'vitest';
import { buildSizingInput } from '../build-sizing-input';
import { Project, AxisConfig } from '@/types';

const mockProject: Project = {
  id: 'proj_test123',
  name: 'Test Project',
  customer: 'Test Customer',
  salesPerson: 'Test Sales',
  notes: 'Test Notes',
  createdAt: '2026-03-07T00:00:00Z',
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

const mockAxis: AxisConfig = {
  id: 'axis_test456',
  name: 'X轴',
  status: 'CONFIGURING',
  createdAt: '2026-03-07T00:00:00Z',
  input: {
    mechanism: {
      type: 'BALL_SCREW',
      params: {
        loadMass: 100,
        lead: 10,
        screwDiameter: 20,
        screwLength: 500,
        gearRatio: 1,
        efficiency: 0.9,
        frictionCoeff: 0.05,
        preloadTorque: 0,
      },
    },
    motion: {
      stroke: 500,
      maxVelocity: 1000,
      maxAcceleration: 5000,
      profile: 'TRAPEZOIDAL',
      dwellTime: 0.5,
      cycleTime: 2,
    },
    dutyConditions: {
      dutyCycle: 100,
      mountingOrientation: 'HORIZONTAL',
      brake: false,
      keyShaft: 'L',
    },
    preferences: {
      encoderType: 'BOTH',
      safety: 'NONE',
    },
  },
};

describe('buildSizingInput', () => {
  it('should merge project info correctly', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.project).toEqual({
      name: 'Test Project',
      customer: 'Test Customer',
      salesPerson: 'Test Sales',
      notes: 'Test Notes',
    });
  });

  it('should merge common params into duty conditions', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.duty.ambientTemp).toBe(25);
    expect(result.duty.ipRating).toBe('IP65');
    expect(result.duty.dutyCycle).toBe(100);
    expect(result.duty.mountingOrientation).toBe('HORIZONTAL');
  });

  it('should merge common params into preferences', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.preferences.safetyFactor).toBe(1.5);
    expect(result.preferences.maxInertiaRatio).toBe(10);
    expect(result.preferences.communication).toBe('ETHERCAT');
    expect(result.preferences.cableLength).toBe(5);
    expect(result.preferences.encoderType).toBe('BOTH');
  });

  it('should include mechanism and motion params', () => {
    const result = buildSizingInput(mockProject, mockAxis);

    expect(result.mechanism?.type).toBe('BALL_SCREW');
    expect(result.motion?.stroke).toBe(500);
  });

  it('should handle incomplete axis input', () => {
    const incompleteAxis: AxisConfig = {
      ...mockAxis,
      input: {},
    };

    const result = buildSizingInput(mockProject, incompleteAxis);

    expect(result.duty).toBeDefined();
    expect(result.preferences).toBeDefined();
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test -- --run src/lib/calculations/__tests__/build-sizing-input.test.ts
```

Expected: FAIL - "buildSizingInput is not defined"

**Step 3: 实现合并函数**

```typescript
import { Project, AxisConfig, SizingInput, ProjectInfo } from '@/types';

/**
 * 合并项目公共参数和轴特有参数，生成完整的 SizingInput
 * Complexity: O(1)
 */
export function buildSizingInput(
  project: Project,
  axis: AxisConfig
): SizingInput {
  const projectInfo: ProjectInfo = {
    name: project.name,
    customer: project.customer,
    salesPerson: project.salesPerson,
    notes: project.notes,
  };

  // 合并工作条件：轴特有 + 公共参数
  const dutyConditions = axis.input.dutyConditions;
  const duty = dutyConditions
    ? {
        ...dutyConditions,
        ambientTemp: project.commonParams.ambientTemp,
        ipRating: project.commonParams.ipRating,
      }
    : {
        dutyCycle: 100,
        mountingOrientation: 'HORIZONTAL' as const,
        brake: false,
        keyShaft: 'L' as const,
        ambientTemp: project.commonParams.ambientTemp,
        ipRating: project.commonParams.ipRating,
      };

  // 合并系统偏好：轴特有 + 公共参数
  const axisPreferences = axis.input.preferences;
  const preferences = {
    safetyFactor: project.commonParams.safetyFactor,
    maxInertiaRatio: project.commonParams.maxInertiaRatio,
    targetInertiaRatio: project.commonParams.targetInertiaRatio,
    communication: project.commonParams.communication,
    cableLength: project.commonParams.cableLength,
    encoderType: (axisPreferences?.encoderType ?? 'BOTH') as 'A' | 'B' | 'BOTH',
    safety: (axisPreferences?.safety ?? 'NONE') as 'STO' | 'NONE',
  };

  return {
    project: projectInfo,
    mechanism: axis.input.mechanism,
    motion: axis.input.motion,
    duty,
    preferences,
    selections: axis.input.selections,
  };
}
```

**Step 4: 运行测试确认通过**

```bash
npm test -- --run src/lib/calculations/__tests__/build-sizing-input.test.ts
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add src/lib/calculations/build-sizing-input.ts src/lib/calculations/__tests__/build-sizing-input.test.ts
git commit -m "feat(calc): add buildSizingInput to merge common and axis-specific params"
```

---

### Task 3: 重构 Project Store

**Files:**
- Modify: `src/stores/project-store.ts`
- Test: `src/stores/__tests__/project-store.test.ts`

**Step 1: 更新 createInitialProject 函数**

```typescript
export function createInitialProject(
  info: Partial<ProjectInfo> = {}
): Project {
  const now = new Date().toISOString();
  return {
    id: generateProjectId(),
    name: info.name ?? '',
    customer: info.customer ?? '',
    salesPerson: info.salesPerson ?? '',
    notes: info.notes,
    createdAt: now,
    commonParams: {
      ambientTemp: 25,
      ipRating: 'IP65',
      communication: 'ETHERCAT',
      cableLength: 5,
      safetyFactor: 1.5,
      maxInertiaRatio: 10,
      targetInertiaRatio: 5,
    },
    axes: [createInitialAxis()],
  };
}
```

**Step 2: 更新 Store 接口**

添加新的 actions：

```typescript
interface ProjectStore {
  // ... existing state

  // 项目级操作
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  updateCommonParams: (params: Partial<CommonParams>) => void;

  // 轴级操作（简化）
  updateAxisDutyConditions: (duty: DutyConditions) => void;
  updateAxisPreferences: (preferences: SystemPreferences) => void;

  // 获取合并后的输入
  getSizingInput: () => SizingInput;
}
```

**Step 3: 实现新的 actions**

```typescript
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // ... existing state and actions

      // 更新项目信息
      updateProjectInfo: (info) =>
        set((state) => ({
          project: {
            ...state.project,
            ...info,
          },
        })),

      // 更新公共参数
      updateCommonParams: (params) =>
        set((state) => ({
          project: {
            ...state.project,
            commonParams: {
              ...state.project.commonParams,
              ...params,
            },
          },
        })),

      // 更新轴工作条件（仅轴特有）
      updateAxisDutyConditions: (duty) =>
        set((state) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a) =>
              a.id === state.currentAxisId
                ? {
                    ...a,
                    input: {
                      ...a.input,
                      dutyConditions: duty,
                    },
                  }
                : a
            ),
          },
          input: {
            ...state.input,
            duty: {
              ...duty,
              ambientTemp: state.project.commonParams.ambientTemp,
              ipRating: state.project.commonParams.ipRating,
            },
          },
        })),

      // 获取合并后的 SizingInput
      getSizingInput: () => {
        const state = get();
        const axis = state.project.axes.find((a) => a.id === state.currentAxisId);
        if (!axis) throw new Error('Axis not found');
        return buildSizingInput(state.project, axis);
      },

      // ... rest of actions
    }),
    {
      name: 'servo-selector-project',
    }
  )
);
```

**Step 4: 更新测试**

修改 `project-store.test.ts` 测试新的数据结构。

**Step 5: Commit**

```bash
git add src/stores/project-store.ts src/stores/__tests__/project-store.test.ts
git commit -m "refactor(store): restructure project store with commonParams"
```

---

## 第二阶段：UI 组件开发

### Task 4: 创建项目设置弹窗组件

**Files:**
- Create: `src/components/wizard/ProjectSettingsModal.tsx`

**Step 1: 实现基础弹窗结构**

```typescript
'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectInfo, CommonParams } from '@/types';
import { useTranslations } from 'next-intl';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSettingsModal({ isOpen, onClose }: ProjectSettingsModalProps) {
  const { project, updateProjectInfo, updateCommonParams } = useProjectStore();
  const t = useTranslations('projectSettings');

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: project.name,
    customer: project.customer,
    salesPerson: project.salesPerson,
    notes: project.notes || '',
  });

  const [commonParams, setCommonParams] = useState<CommonParams>(project.commonParams);

  const handleSave = () => {
    updateProjectInfo(projectInfo);
    updateCommonParams(commonParams);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* 项目信息 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('projectInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('projectName')} *
                </label>
                <input
                  type="text"
                  value={projectInfo.name}
                  onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('customer')} *
                </label>
                <input
                  type="text"
                  value={projectInfo.customer}
                  onChange={(e) => setProjectInfo({ ...projectInfo, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('salesPerson')}
                </label>
                <input
                  type="text"
                  value={projectInfo.salesPerson}
                  onChange={(e) => setProjectInfo({ ...projectInfo, salesPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  value={projectInfo.notes}
                  onChange={(e) => setProjectInfo({ ...projectInfo, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* 公共参数 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('commonParams')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('commonParamsDescription')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ambientTemp')}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={commonParams.ambientTemp}
                    onChange={(e) => setCommonParams({ ...commonParams, ambientTemp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500">°C</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ipRating')}
                </label>
                <select
                  value={commonParams.ipRating}
                  onChange={(e) => setCommonParams({ ...commonParams, ipRating: e.target.value as CommonParams['ipRating'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="IP54">IP54</option>
                  <option value="IP65">IP65</option>
                  <option value="IP67">IP67</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('communication')}
                </label>
                <select
                  value={commonParams.communication}
                  onChange={(e) => setCommonParams({ ...commonParams, communication: e.target.value as CommonParams['communication'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ETHERCAT">EtherCAT</option>
                  <option value="PROFINET">PROFINET</option>
                  <option value="ETHERNET_IP">EtherNet/IP</option>
                  <option value="ANALOG">Analog</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cableLength')}
                </label>
                <select
                  value={commonParams.cableLength}
                  onChange={(e) => setCommonParams({ ...commonParams, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="TERMINAL_ONLY">{t('terminalOnly')}</option>
                  <option value={3}>3m</option>
                  <option value={5}>5m</option>
                  <option value={10}>10m</option>
                  <option value={15}>15m</option>
                  <option value={20}>20m</option>
                  <option value={25}>25m</option>
                  <option value={30}>30m</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('safetyFactor')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={commonParams.safetyFactor}
                  onChange={(e) => setCommonParams({ ...commonParams, safetyFactor: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxInertiaRatio')}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={commonParams.maxInertiaRatio}
                    onChange={(e) => setCommonParams({ ...commonParams, maxInertiaRatio: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-500">:1</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!projectInfo.name || !projectInfo.customer}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/wizard/ProjectSettingsModal.tsx
git commit -m "feat(ui): add ProjectSettingsModal for common params management"
```

---

### Task 5: 更新顶部导航栏

**Files:**
- Modify: `src/app/wizard/layout.tsx` 或相关导航组件

**Step 1: 添加项目设置按钮到导航栏**

找到现有的向导布局文件，添加项目设置按钮：

```typescript
'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { ProjectSettingsModal } from '@/components/wizard/ProjectSettingsModal';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const { project } = useProjectStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Project Name */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🏠 {project.name || '未命名项目'}
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                项目设置
              </button>

              {/* Existing export button */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/wizard/layout.tsx
git commit -m "feat(ui): add project settings button to header"
```

---

### Task 6: 更新工作条件步骤

**Files:**
- Modify: `src/components/wizard/steps/DutyStep.tsx`

**Step 1: 移除公共参数输入，仅保留轴特有参数**

```typescript
'use client';

import { useProjectStore } from '@/stores/project-store';
import { DutyConditions } from '@/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function DutyStep() {
  const { project, currentAxisId, updateAxisDutyConditions, nextStep, prevStep } = useProjectStore();
  const t = useTranslations('duty');
  const commonT = useTranslations('common');

  const currentAxis = project.axes.find(a => a.id === currentAxisId);

  const [formData, setFormData] = useState<DutyConditions>(
    currentAxis?.input.dutyConditions || {
      dutyCycle: 100,
      mountingOrientation: 'HORIZONTAL',
      brake: false,
      keyShaft: 'L',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAxisDutyConditions(formData);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          环境参数（温度 {project.commonParams.ambientTemp}°C，防护等级 {project.commonParams.ipRating}）
          已在项目设置中配置，
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-project-settings'))}
            className="text-blue-600 hover:underline"
          >
            点击修改
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 安装方向 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('mountingOrientation')} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.mountingOrientation}
            onChange={(e) => setFormData({ ...formData, mountingOrientation: e.target.value as DutyConditions['mountingOrientation'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="HORIZONTAL">{t('orientations.horizontal')}</option>
            <option value="VERTICAL_UP">{t('orientations.verticalUp')}</option>
            <option value="VERTICAL_DOWN">{t('orientations.verticalDown')}</option>
          </select>
        </div>

        {/* 工作制 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('dutyCycle')} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.dutyCycle}
            onChange={(e) => setFormData({ ...formData, dutyCycle: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value={100}>S1 (100% - 连续工作)</option>
            <option value={60}>S2 (60% - 短时工作)</option>
            <option value={40}>S3 (40% - 间歇工作)</option>
            <option value={25}>S4 (25% - 频繁启停)</option>
          </select>
        </div>

        {/* 制动器 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('brake')}
          </label>
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id="brake"
              checked={formData.brake}
              onChange={(e) => setFormData({ ...formData, brake: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="brake" className="ml-2 text-sm text-gray-700">
              {t('brakeRequired')}
            </label>
          </div>
        </div>

        {/* 轴类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('keyShaft')}
          </label>
          <select
            value={formData.keyShaft}
            onChange={(e) => setFormData({ ...formData, keyShaft: e.target.value as 'L' | 'K' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="L">{t('shaftTypes.smooth')}</option>
            <option value="K">{t('shaftTypes.keyed')}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {commonT('back')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {commonT('next')}
        </button>
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/wizard/steps/DutyStep.tsx
git commit -m "refactor(ui): simplify DutyStep to only axis-specific params"
```

---

## 第三阶段：数据迁移与 PDF 更新

### Task 7: 实现数据迁移

**Files:**
- Modify: `src/stores/project-store.ts` (添加迁移逻辑)

**Step 1: 添加迁移函数**

```typescript
/**
 * 从旧数据结构迁移到新的共享参数结构
 */
function migrateToSharedParams(oldData: any): Project | null {
  if (!oldData) return null;

  // 检查是否已经是新结构
  if (oldData.project?.commonParams) {
    return oldData.project;
  }

  try {
    // 从旧结构提取数据
    const oldProject = oldData.project || oldData;
    const firstAxis = oldProject.axes?.[0];
    const oldInput = firstAxis?.input || oldData.input || {};

    // 提取公共参数（从第一个轴或旧输入）
    const commonParams: CommonParams = {
      ambientTemp: oldInput.duty?.ambientTemp ?? 25,
      ipRating: oldInput.duty?.ipRating ?? 'IP65',
      communication: oldInput.preferences?.communication ?? 'ETHERCAT',
      cableLength: oldInput.preferences?.cableLength ?? 5,
      safetyFactor: oldInput.preferences?.safetyFactor ?? 1.5,
      maxInertiaRatio: oldInput.preferences?.maxInertiaRatio ?? 10,
      targetInertiaRatio: oldInput.preferences?.targetInertiaRatio ?? 5,
    };

    // 迁移轴数据
    const axes: AxisConfig[] = (oldProject.axes || []).map((oldAxis: any) => ({
      id: oldAxis.id || generateId(),
      name: oldAxis.name || '轴-1',
      status: oldAxis.status || 'CONFIGURING',
      createdAt: oldAxis.createdAt || new Date().toISOString(),
      completedAt: oldAxis.completedAt,
      input: {
        mechanism: oldAxis.input?.mechanism,
        motion: oldAxis.input?.motion,
        dutyConditions: oldAxis.input?.duty ? {
          dutyCycle: oldAxis.input.duty.dutyCycle ?? 100,
          mountingOrientation: oldAxis.input.duty.mountingOrientation ?? 'HORIZONTAL',
          brake: oldAxis.input.duty.brake ?? false,
          keyShaft: oldAxis.input.duty.keyShaft ?? 'L',
        } : undefined,
        preferences: oldAxis.input?.preferences ? {
          encoderType: oldAxis.input.preferences.encoderType ?? 'BOTH',
          safety: oldAxis.input.preferences.safety ?? 'NONE',
        } : undefined,
        selections: oldAxis.input?.selections,
      },
      result: oldAxis.result,
      selectedMotorIndex: oldAxis.selectedMotorIndex,
    }));

    // 如果没有轴，创建一个默认轴
    if (axes.length === 0) {
      axes.push(createInitialAxis());
    }

    return {
      id: oldProject.id || generateProjectId(),
      name: oldProject.name || oldInput.project?.name || '未命名项目',
      customer: oldProject.customer || oldInput.project?.customer || '',
      salesPerson: oldProject.salesPerson || oldInput.project?.salesPerson || '',
      notes: oldProject.notes || oldInput.project?.notes,
      createdAt: oldProject.createdAt || new Date().toISOString(),
      commonParams,
      axes,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
}
```

**Step 2: 在 store 初始化时使用迁移**

```typescript
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // ... existing implementation
    }),
    {
      name: 'servo-selector-project',
      version: 2, // 增加版本号
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // 从旧版本迁移
          const migrated = migrateToSharedParams(persistedState);
          if (migrated) {
            return {
              project: migrated,
              currentAxisId: migrated.axes[0]?.id || '',
              currentStep: 1,
              isComplete: false,
              input: {},
              result: undefined,
            };
          }
        }
        return persistedState;
      },
    }
  )
);
```

**Step 3: Commit**

```bash
git add src/stores/project-store.ts
git commit -m "feat(store): add data migration from old structure to shared params"
```

---

### Task 8: 更新 PDF 报告

**Files:**
- Modify: `src/lib/pdf/multi-axis-report.ts`
- Modify: `src/lib/pdf/types.ts`

**Step 1: 更新 PDF 类型定义**

```typescript
// src/lib/pdf/types.ts

export interface MultiAxisReportData {
  project: {
    name: string;
    customer: string;
    salesPerson: string;
    notes?: string;
    date: string;
  };

  // 新增：公共参数
  commonParams: {
    ambientTemp: number;
    ipRating: string;
    communication: string;
    cableLength: string;
    safetyFactor: number;
    maxInertiaRatio: number;
  };

  axes: Array<{
    name: string;

    // 轴特有参数
    mechanism: {
      type: string;
      loadMass: number;
      // ...
    };
    motion: {
      stroke: number;
      maxVelocity: number;
      // ...
    };
    dutyConditions: {
      mountingOrientation: string;
      dutyCycle: number;
      brake: boolean;
      keyShaft: string;
    };

    // 计算结果
    calculations: {
      loadInertia: string;
      rmsTorque: string;
      peakTorque: string;
      maxSpeed: string;
    };

    motor?: {
      model: string;
      partNumber: string;
      ratedTorque: number;
      ratedSpeed: number;
    };
    drive?: {
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

**Step 2: 更新 PDF 生成器添加公共参数部分**

```typescript
// 在 generateMultiAxisPdf 中添加公共参数部分

// 项目信息后添加公共参数
let currentY = doc.lastAutoTable?.finalY + 15 || 70;

if (currentY > 250) {
  doc.addPage();
  currentY = 20;
}

doc.setFontSize(14);
doc.text('⚙️ 公共参数（适用于所有轴）', 20, currentY);
currentY += 10;

const commonParamsData = [
  ['环境温度', `${data.commonParams.ambientTemp}°C`],
  ['防护等级', data.commonParams.ipRating],
  ['通信协议', data.commonParams.communication],
  ['电缆长度', data.commonParams.cableLength],
  ['安全系数', data.commonParams.safetyFactor.toString()],
  ['最大惯量比', `${data.commonParams.maxInertiaRatio}:1`],
];

doc.autoTable({
  startY: currentY,
  head: [['参数', '数值']],
  body: commonParamsData,
  theme: 'striped',
  headStyles: { fillColor: [37, 99, 235] },
});
```

**Step 3: Commit**

```bash
git add src/lib/pdf/types.ts src/lib/pdf/multi-axis-report.ts
git commit -m "feat(pdf): add common params section to multi-axis report"
```

---

## 第四阶段：测试与验证

### Task 9: 运行完整测试

**Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 2: 运行单元测试**

```bash
npm test -- --run
```

Expected: All tests pass

**Step 3: 构建测试**

```bash
npm run build
```

Expected: Build successful

**Step 4: Commit**

```bash
git commit -m "test: verify all tests pass after shared params refactor"
```

---

### Task 10: 添加 i18n 翻译

**Files:**
- Modify: `messages/zh.json`
- Modify: `messages/en.json`

**Step 1: 添加中文翻译**

```json
{
  "projectSettings": {
    "title": "项目设置",
    "projectInfo": "项目信息",
    "projectName": "项目名称",
    "customer": "客户名称",
    "salesPerson": "销售人员",
    "notes": "项目备注",
    "commonParams": "公共参数",
    "commonParamsDescription": "这些参数将应用于所有轴",
    "ambientTemp": "环境温度",
    "ipRating": "防护等级",
    "communication": "通信协议",
    "cableLength": "电缆长度",
    "safetyFactor": "安全系数",
    "maxInertiaRatio": "最大惯量比",
    "terminalOnly": "仅接线端子",
    "cancel": "取消",
    "save": "保存"
  }
}
```

**Step 2: Commit**

```bash
git add messages/zh.json messages/en.json
git commit -m "feat(i18n): add translations for project settings"
```

---

## 总结

实施完成后，用户将体验到：

1. **项目信息只需输入一次** - 项目名称、客户等信息在项目设置中统一管理
2. **公共参数所有轴共享** - 环境温度、通信协议等参数修改后对所有轴生效
3. **轴配置更简洁** - 每个轴只需配置真正特有的参数（机构、运动、安装方向等）
4. **PDF 报告更清晰** - 公共参数单独展示，避免重复

数据流简化：
```
Before: 每个轴独立存储所有参数
After:  Project (commonParams) + Axis (specific params) → 计算时合并
```
