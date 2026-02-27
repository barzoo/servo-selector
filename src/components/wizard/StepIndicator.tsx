'use client';

import { WizardStep } from '@/types';

interface StepIndicatorProps {
  currentStep: WizardStep;
}

const steps = [
  { id: 1, label: '项目信息' },
  { id: 2, label: '机械参数' },
  { id: 3, label: '运动参数' },
  { id: 4, label: '工况条件' },
  { id: 5, label: '系统配置' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
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
                  {isCompleted ? '✓' : step.id}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    flex-1 h-1 mx-4 transition-colors duration-200
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
