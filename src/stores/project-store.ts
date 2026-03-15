// Zustand store for multi-axis project state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project,
  AxisConfig,
  AxisStatus,
  WizardStep,
  SizingInput,
  SizingResult,
  ProjectInfo,
  MechanismConfig,
  MotionParams,
  DutyConditions,
  SystemPreferences,
  MotorSelections,
  CommonParams,
} from '@/types';
import { buildSizingInput } from '@/lib/calculations/build-sizing-input';
import type { ProjectMeta } from '@/types/project-list';
import {
  loadProjectsStorage,
  saveProjectsStorage,
  migrateProjectsStorage,
  extractProjectMeta,
  updateProjectMeta,
  deleteProjectMeta,
  setCurrentProjectId,
  saveProjectData,
  loadProjectData,
  deleteProjectData,
} from '@/lib/project-storage';

// ============ Locale-Aware Default Names ============

/**
 * Get the current locale from localStorage
 * @returns 'en' | 'zh' - defaults to 'zh' if not found
 */
function getCurrentLocale(): 'en' | 'zh' {
  if (typeof window === 'undefined') return 'zh';
  const stored = localStorage.getItem('servo-selector-locale');
  return stored === 'en' ? 'en' : 'zh';
}

/**
 * Get default axis name based on locale
 * @param index - Axis index (1-based)
 * @returns Localized default axis name
 */
function getDefaultAxisName(index: number): string {
  const locale = getCurrentLocale();
  return locale === 'en' ? `Axis-${index}` : `轴-${index}`;
}

/**
 * Get default project name based on locale
 * @returns Localized default project name
 */
function getDefaultProjectName(): string {
  const locale = getCurrentLocale();
  return locale === 'en' ? 'Unnamed Project' : '未命名项目';
}

// Flexible input type for store - allows partial duty/preferences without common params
type StoreInput = Partial<Omit<SizingInput, 'duty' | 'preferences'>> & {
  duty?: DutyConditions;
  preferences?: SystemPreferences;
};

// ============ ID Generation ============

/**
 * Generate a unique axis ID
 * Format: axis_<9 random lowercase alphanumeric chars>
 * Complexity: O(1)
 */
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'axis_';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique project ID
 * Format: proj_<9 random lowercase alphanumeric chars>
 * Complexity: O(1)
 */
export function generateProjectId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'proj_';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============ Initial State Helpers ============

/**
 * Create an initial axis configuration
 * @param name - Optional axis name (defaults to locale-aware default)
 * @returns Initial AxisConfig object
 * Complexity: O(1)
 */
export function createInitialAxis(name?: string): AxisConfig {
  const axisName = name || getDefaultAxisName(1);
  return {
    id: generateId(),
    name: axisName,
    status: 'CONFIGURING' as AxisStatus,
    createdAt: new Date().toISOString(),
    input: {},
  };
}

/**
 * Create an initial project with one axis
 * @param info - Optional project info
 * @returns Initial Project object
 * Complexity: O(1)
 */
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

/**
 * Create an empty project without any axes
 * Used for initial app state to show onboarding
 * @returns Empty Project object
 * Complexity: O(1)
 */
export function createEmptyProject(): Project {
  const now = new Date().toISOString();
  return {
    id: generateProjectId(),
    name: '',
    customer: '',
    salesPerson: '',
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
    axes: [],
  };
}

// ============ Store Interface ============

interface ProjectStore {
  // State
  project: Project;
  currentAxisId: string;
  currentStep: WizardStep;
  isComplete: boolean;
  input: StoreInput;
  result?: SizingResult;

  // Project list operations
  projects: ProjectMeta[];
  saveAndCreateNewProject: (info: ProjectInfo) => void;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  loadProjectsList: () => void;
  syncProjectMeta: () => void;

  // Project operations
  createProject: (info: ProjectInfo) => void;
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  updateCommonParams: (params: Partial<CommonParams>) => void;

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

  // Individual input setters (for compatibility with existing components)
  setProjectInfo: (info: ProjectInfo) => void;
  setMechanism: (mechanism: MechanismConfig) => void;
  setMotion: (motion: MotionParams) => void;
  setDuty: (duty: DutyConditions) => void;
  setPreferences: (preferences: SystemPreferences) => void;
  setSelections: (selections: MotorSelections) => void;
  completeWizard: () => void;

  // Re-edit completed axis
  reeditAxis: (axisId: string) => void;

  // Axis-level operations (simplified)
  updateAxisDutyConditions: (duty: DutyConditions) => void;
  updateAxisPreferences: (preferences: SystemPreferences) => void;

  // Get merged sizing input
  getSizingInput: () => SizingInput;

  // Queries
  getCurrentAxis: () => AxisConfig;
  getCompletedAxes: () => AxisConfig[];
  canExportPdf: () => boolean;
}

const initialState = {
  project: createEmptyProject(),
  currentAxisId: '',
  currentStep: 1 as WizardStep,
  isComplete: false,
  input: {},
  result: undefined,
  projects: [] as ProjectMeta[],
};

// ============ Zustand Store ============

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentAxisId: initialState.project.axes[0]?.id ?? '',

      // Project operations
      createProject: (info: ProjectInfo) =>
        set({
          project: {
            ...createEmptyProject(),
            name: info.name,
            customer: info.customer,
            salesPerson: info.salesPerson,
            notes: info.notes,
          },
          currentAxisId: '',
        }),

      updateProjectInfo: (info: Partial<ProjectInfo>) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            ...info,
          },
        })),

      updateCommonParams: (params: Partial<CommonParams>) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            commonParams: {
              ...state.project.commonParams,
              ...params,
            },
          },
        })),

      // Axis operations
      addAxis: (name: string, copyFrom?: string) => {
        const state = get();
        // Generate locale-aware default name if not provided
        const axisName = name || getDefaultAxisName(state.project.axes.length + 1);
        const newAxis: AxisConfig = {
          id: generateId(),
          name: axisName,
          status: 'CONFIGURING',
          createdAt: new Date().toISOString(),
          input: copyFrom
            ? state.project.axes.find((a: AxisConfig) => a.id === copyFrom)?.input || {}
            : {},
        };

        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: [...state.project.axes, newAxis],
          },
        }));

        return newAxis.id;
      },

      switchAxis: (axisId: string) => {
        const state = get();
        const axis = state.project.axes.find((a: AxisConfig) => a.id === axisId);
        if (!axis) return;

        // Save current axis state before switching
        const currentAxis = state.project.axes.find((a: AxisConfig) => a.id === state.currentAxisId);
        if (currentAxis) {
          set((state: ProjectStore) => ({
            project: {
              ...state.project,
              axes: state.project.axes.map((a: AxisConfig) =>
                a.id === currentAxis.id
                  ? { ...a, input: state.input, result: state.result }
                  : a
              ),
            },
          }));
        }

        // Load new axis state from axis input
        const axisInput = axis.input || {};
        set({
          currentAxisId: axisId,
          currentStep: axis.status === 'COMPLETED' ? 5 : 1,
          isComplete: axis.status === 'COMPLETED',
          input: axisInput,
          result: axis.result,
        });
      },

      deleteAxis: (axisId: string) => {
        const state = get();
        if (state.project.axes.length <= 1) {
          // Don't delete the last axis
          return;
        }

        const newAxes = state.project.axes.filter((a: AxisConfig) => a.id !== axisId);
        set((state: ProjectStore) => ({
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

      updateAxisName: (axisId: string, name: string) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === axisId ? { ...a, name } : a
            ),
          },
        })),

      completeAxis: () =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === state.currentAxisId
                ? {
                    ...a,
                    status: 'COMPLETED' as AxisStatus,
                    completedAt: new Date().toISOString(),
                    // Don't save project info in axis input - it's shared at project level
                    input: { ...state.input, project: undefined },
                    result: state.result,
                  }
                : a
            ),
          },
        })),

      // Wizard operations
      setStep: (step: WizardStep) => set({ currentStep: step }),

      setInput: (input: Partial<SizingInput>) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, ...input },
        })),

      setResult: (result: SizingResult) => set({ result }),

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
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
        const state = get();
        const currentAxisId = state.currentAxisId;

        // Reset only the current axis, preserve project and other axes
        set((state: ProjectStore) => ({
          currentStep: 1 as WizardStep,
          isComplete: false,
          input: {},
          result: undefined,
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === currentAxisId
                ? {
                    ...a,
                    status: 'CONFIGURING' as AxisStatus,
                    input: {},
                    result: undefined,
                    completedAt: undefined,
                  }
                : a
            ),
          },
        }));
      },

      // Individual input setters (for compatibility with existing components)
      setProjectInfo: (projectInfo: ProjectInfo) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            name: projectInfo.name,
            customer: projectInfo.customer,
            salesPerson: projectInfo.salesPerson,
            notes: projectInfo.notes,
          },
          input: { ...state.input, project: projectInfo },
        })),

      setMechanism: (mechanism: MechanismConfig) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, mechanism },
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === state.currentAxisId
                ? { ...a, input: { ...a.input, mechanism } }
                : a
            ),
          },
        })),

      setMotion: (motion: MotionParams) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, motion },
          project: {
            ...state.project,
            axes: state.project.axes.map((a) =>
              a.id === state.currentAxisId
                ? { ...a, input: { ...a.input, motion } }
                : a
            ),
          },
        })),

      setDuty: (duty: DutyConditions) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, duty },
        })),

      setPreferences: (preferences: SystemPreferences) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, preferences },
        })),

      setSelections: (selections: MotorSelections) =>
        set((state: ProjectStore) => ({
          input: { ...state.input, selections },
        })),

      completeWizard: () => set({ isComplete: true }),

      // Re-edit completed axis
      reeditAxis: (axisId: string) => {
        const state = get();
        const axis = state.project.axes.find((a: AxisConfig) => a.id === axisId);
        if (!axis || axis.status !== 'COMPLETED') return;

        // Update axis status back to CONFIGURING
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === axisId
                ? {
                    ...a,
                    status: 'CONFIGURING' as AxisStatus,
                    completedAt: undefined,
                  }
                : a
            ),
          },
        }));

        // Switch to this axis
        get().switchAxis(axisId);
      },

      // Update axis duty conditions (axis-specific only)
      updateAxisDutyConditions: (duty: DutyConditions) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
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
        })),

      // Update axis system preferences (axis-specific only)
      updateAxisPreferences: (preferences: SystemPreferences) =>
        set((state: ProjectStore) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a: AxisConfig) =>
              a.id === state.currentAxisId
                ? {
                    ...a,
                    input: {
                      ...a.input,
                      preferences: preferences,
                    },
                  }
                : a
            ),
          },
        })),

      // Get merged SizingInput
      getSizingInput: () => {
        const state = get();
        const axis = state.project.axes.find((a: AxisConfig) => a.id === state.currentAxisId);
        if (!axis) throw new Error('Axis not found');
        return buildSizingInput(state.project, axis);
      },

      // Queries
      getCurrentAxis: () => {
        const state = get();
        return (
          state.project.axes.find((a: AxisConfig) => a.id === state.currentAxisId) ||
          state.project.axes[0]
        );
      },

      getCompletedAxes: () => {
        const state = get();
        return state.project.axes.filter((a: AxisConfig) => a.status === 'COMPLETED');
      },

      canExportPdf: () => {
        const state = get();
        return state.project.axes.some((a: AxisConfig) => a.status === 'COMPLETED');
      },

      // Project list operations
      loadProjectsList: () => {
        // Ensure storage is migrated
        migrateProjectsStorage();
        const storage = loadProjectsStorage();
        if (storage) {
          set({ projects: storage.projects });
        }
      },

      syncProjectMeta: () => {
        const state = get();
        const meta = extractProjectMeta(state.project);
        updateProjectMeta(state.project.id, meta);
        // Reload project list
        const storage = loadProjectsStorage();
        if (storage) {
          set({ projects: storage.projects });
        }
      },

      saveAndCreateNewProject: (info: ProjectInfo) => {
        const MAX_PROJECTS = 20;
        const state = get();

        // 1. Sync current project metadata (if current project has data)
        if (state.project.id && state.project.axes.length > 0) {
          const currentMeta = extractProjectMeta(state.project);
          updateProjectMeta(state.project.id, currentMeta);
          // Save full project data to independent storage
          saveProjectData(state.project.id, state.project);
        }

        // 2. Load latest project list metadata
        const storage = loadProjectsStorage();
        const projects = storage?.projects || [];

        // 3. FIFO cleanup: if at or over limit, delete oldest projects
        if (projects.length >= MAX_PROJECTS) {
          // Sort by updatedAt, exclude current project being edited
          const otherProjects = projects.filter(p => p.id !== state.project.id);

          // Calculate how many to delete (to make room for new project)
          const toDeleteCount = projects.length - MAX_PROJECTS + 1;

          // Edge case: if no other projects to delete
          if (otherProjects.length === 0) {
            // All projects are current project, delete oldest one
            const oldestProject = [...projects].sort(
              (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            )[0];
            if (oldestProject) {
              deleteProjectMeta(oldestProject.id);
              deleteProjectData(oldestProject.id);
            }
          } else {
            // Sort other projects by updatedAt
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

        // 4. Create new project (existing logic)
        const newProject = createEmptyProject();
        newProject.name = info.name ?? '';
        newProject.customer = info.customer ?? '';
        newProject.salesPerson = info.salesPerson ?? '';
        newProject.notes = info.notes;

        // 5. Add new project to project list
        const newMeta = extractProjectMeta(newProject);
        const updatedStorage = loadProjectsStorage();
        if (updatedStorage) {
          updatedStorage.projects.push(newMeta);
          updatedStorage.currentProjectId = newProject.id;
          saveProjectsStorage(updatedStorage);
        }

        // 6. Update store state
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

      switchProject: (projectId: string) => {
        const state = get();

        // Cannot switch to current project
        if (projectId === state.project.id) {
          return;
        }

        // 1. Save current project to storage
        if (state.project.id && state.project.axes.length > 0) {
          const currentMeta = extractProjectMeta(state.project);
          updateProjectMeta(state.project.id, currentMeta);
          saveProjectData(state.project.id, state.project);
        }

        // 2. Load target project from independent storage
        const targetProject = loadProjectData(projectId);
        if (!targetProject) {
          console.error(`[ProjectStore] Project not found: ${projectId}`);
          // Remove non-existent project from list
          deleteProjectMeta(projectId);
          deleteProjectData(projectId);
          // Refresh project list
          const storage = loadProjectsStorage();
          if (storage) {
            set({ projects: storage.projects });
          }
          return;
        }

        // 3. Update store state
        const firstAxis = targetProject.axes[0];
        set({
          project: targetProject,
          currentAxisId: firstAxis?.id ?? '',
          currentStep: firstAxis?.status === 'COMPLETED' ? 5 : 1,
          isComplete: firstAxis?.status === 'COMPLETED',
          input: firstAxis?.input || {},
          result: firstAxis?.result,
        });

        // 4. Update current project ID (for compatibility)
        setCurrentProjectId(projectId);
      },

      deleteProject: (projectId: string) => {
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
    }),
    {
      name: 'servo-selector-project',
      version: 3,
      skipHydration: true,
      // Only persist project list metadata, not current project details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state: any) => ({
        projects: state.projects,
        // Don't save project, currentAxisId, input, result, etc.
      }),
      migrate: (persistedState: any, version: number) => {
        // Always reset to initial empty state
        return {
          ...initialState,
          projects: persistedState?.projects || [],
        };
      },
    }
  )
);

// ============ Migration ============

/**
 * Migrate legacy single-axis data to new multi-axis format
 * @returns Project object or null if no legacy data exists
 * Complexity: O(1)
 */
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
      commonParams: {
        ambientTemp: 25,
        ipRating: 'IP65',
        communication: 'ETHERCAT',
        cableLength: 5,
        safetyFactor: 1.5,
        maxInertiaRatio: 10,
        targetInertiaRatio: 5,
      },
      axes: [
        {
          id: generateId(),
          name: '轴 1',
          status: parsed.isComplete ? 'COMPLETED' : 'CONFIGURING',
          createdAt: new Date().toISOString(),
          completedAt: parsed.isComplete ? new Date().toISOString() : undefined,
          input: parsed.input || {},
          result: parsed.result,
        },
      ],
    };

    // Clear legacy data after migration
    localStorage.removeItem('servo-selector-wizard');

    return project;
  } catch {
    return null;
  }
}

/**
 * 从旧数据结构迁移到新的共享参数结构
 * @param oldData - 旧格式的项目数据
 * @returns 新格式的 Project 对象
 */
export function migrateToSharedParams(oldData: any): Project | null {
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
