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
} from '@/types';

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
 * @param name - Optional axis name (defaults to '轴 1')
 * @returns Initial AxisConfig object
 * Complexity: O(1)
 */
export function createInitialAxis(name: string = '轴-1'): AxisConfig {
  return {
    id: generateId(),
    name,
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
    axes: [createInitialAxis()],
  };
}

// ============ Store Interface ============

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

// ============ Zustand Store ============

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
        // Keep the current project info when switching axes
        const currentProject = get().input.project;
        set({
          currentAxisId: axisId,
          currentStep: axis.status === 'COMPLETED' ? 6 : 1,
          isComplete: axis.status === 'COMPLETED',
          input: { ...axis.input, project: currentProject || axis.input.project },
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
                    // Don't save project info in axis input - it's shared at project level
                    input: { ...state.input, project: undefined },
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

      // Individual input setters (for compatibility with existing components)
      setProjectInfo: (projectInfo) =>
        set((state) => ({
          project: {
            ...state.project,
            name: projectInfo.name,
            customer: projectInfo.customer,
            salesPerson: projectInfo.salesPerson,
            notes: projectInfo.notes,
          },
          input: { ...state.input, project: projectInfo },
        })),

      setMechanism: (mechanism) =>
        set((state) => ({
          input: { ...state.input, mechanism },
        })),

      setMotion: (motion) =>
        set((state) => ({
          input: { ...state.input, motion },
        })),

      setDuty: (duty) =>
        set((state) => ({
          input: { ...state.input, duty },
        })),

      setPreferences: (preferences) =>
        set((state) => ({
          input: { ...state.input, preferences },
        })),

      setSelections: (selections) =>
        set((state) => ({
          input: { ...state.input, selections },
        })),

      completeWizard: () => set({ isComplete: true }),

      // Re-edit completed axis
      reeditAxis: (axisId) => {
        const state = get();
        const axis = state.project.axes.find((a) => a.id === axisId);
        if (!axis || axis.status !== 'COMPLETED') return;

        // Update axis status back to CONFIGURING
        set((state) => ({
          project: {
            ...state.project,
            axes: state.project.axes.map((a) =>
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
