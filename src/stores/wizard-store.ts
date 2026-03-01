// Zustand store for wizard state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WizardState,
  WizardStep,
  ProjectInfo,
  MechanismConfig,
  MotionParams,
  DutyConditions,
  SystemPreferences,
  SizingResult,
  MotorSelections,
} from '@/types';

interface WizardStore extends WizardState {
  setStep: (step: WizardStep) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProjectInfo: (info: ProjectInfo) => void;
  setMechanism: (mechanism: MechanismConfig) => void;
  setMotion: (motion: MotionParams) => void;
  setDuty: (duty: DutyConditions) => void;
  setPreferences: (preferences: SystemPreferences) => void;
  setSelections: (selections: MotorSelections) => void;
  setResult: (result: SizingResult) => void;
  completeWizard: () => void;
  reset: () => void;
}

const initialState: WizardState = {
  currentStep: 1,
  input: {},
  isComplete: false,
  result: undefined,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      goToStep: (step) => {
        if (step >= 1 && step <= 6) {
          set({ currentStep: step as WizardStep });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 5) {
          set({ currentStep: (currentStep + 1) as WizardStep });
        }
      },

      prevStep: () => {
        const { currentStep, isComplete } = get();
        if (isComplete) {
          // When coming back from results, just clear isComplete
          set({ isComplete: false });
        } else if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as WizardStep });
        }
      },

      setProjectInfo: (project) =>
        set((state) => ({
          input: { ...state.input, project },
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

      setResult: (result) =>
        set(() => ({
          result,
        })),

      setSelections: (selections) =>
        set((state) => ({
          input: { ...state.input, selections },
        })),

      completeWizard: () =>
        set(() => ({
          isComplete: true,
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'servo-selector-wizard',
    }
  )
);
