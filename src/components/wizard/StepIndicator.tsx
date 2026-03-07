'use client';

import { WizardStep } from '@/types';
import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  currentStep: WizardStep;
}

// Simplified 4-step wizard (removed projectInfo step)
const stepKeys = ['mechanism', 'motion', 'duty', 'systemConfig'] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations('steps');

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {stepKeys.map((key, index) => {
          const stepId = index + 1;
          const isActive = stepId === currentStep;
          const isCompleted = stepId < currentStep;
          const isLast = index === stepKeys.length - 1;

          return (
            <div key={stepId} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? '✓' : stepId}
                </div>
                <span
                  className={`
                    hidden sm:block mt-2 text-xs font-medium
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}
                >
                  {t(key)}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    flex-1 h-1 mx-2 sm:mx-4 transition-colors duration-200
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
