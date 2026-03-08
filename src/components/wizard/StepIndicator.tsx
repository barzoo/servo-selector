'use client';

import { WizardStep } from '@/types';
import { useTranslations } from 'next-intl';
import { Settings, Move, Clock, Cpu, Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: WizardStep;
}

const stepConfig = [
  { key: 'mechanism', icon: Settings },
  { key: 'motion', icon: Move },
  { key: 'duty', icon: Clock },
  { key: 'systemConfig', icon: Cpu },
] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations('steps');

  return (
    <div className="w-full py-6 px-4 sm:px-8">
      <div className="flex items-center justify-between">
        {stepConfig.map((step, index) => {
          const stepId = index + 1;
          const isActive = stepId === currentStep;
          const isCompleted = stepId < currentStep;
          const isLast = index === stepConfig.length - 1;
          const Icon = step.icon;

          return (
            <div key={stepId} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    step-dot transition-all duration-300
                    ${isActive
                      ? 'step-dot-active scale-110'
                      : isCompleted
                      ? 'step-dot-completed'
                      : 'step-dot-pending'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`
                    hidden sm:block mt-3 text-xs font-medium transition-colors duration-200
                    ${isActive ? 'text-[var(--primary-300)]' : isCompleted ? 'text-[var(--green-400)]' : 'text-[var(--foreground-muted)]'}
                  `}
                >
                  {t(step.key)}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    step-line mx-2 sm:mx-4 transition-all duration-500
                    ${isCompleted ? 'step-line-completed' : 'step-line-pending'}
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
