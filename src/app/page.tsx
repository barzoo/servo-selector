'use client';

import { useEffect } from 'react';
import { useWizardStore } from '@/stores/wizard-store';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { ProjectInfoStep } from '@/components/wizard/steps/ProjectInfoStep';
import { MechanismStep } from '@/components/wizard/steps/MechanismStep';
import { MotionStep } from '@/components/wizard/steps/MotionStep';
import { DutyStep } from '@/components/wizard/steps/DutyStep';
import { SystemConfigStep } from '@/components/wizard/steps/SystemConfigStep';
import { ResultStep } from '@/components/wizard/steps/ResultStep';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const { currentStep, isComplete, result, reset } = useWizardStore();

  // Auto-reset wizard state when detecting inconsistent state
  // (isComplete=true but result is undefined)
  useEffect(() => {
    if (isComplete && !result) {
      reset();
    }
  }, [isComplete, result, reset]);

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            博世力士乐伺服选型工具
          </h1>
          <p className="mt-2 text-gray-600">XC20 + MC20 伺服系统选型向导</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <StepIndicator currentStep={currentStep} />
          <div className="mt-8">{renderStep()}</div>
        </div>
      </div>
    </main>
  );
}
