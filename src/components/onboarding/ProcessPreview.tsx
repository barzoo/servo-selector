'use client';

import { useTranslations } from 'next-intl';
import { Folder, Sliders, Cog, Activity, Gauge, CheckCircle, Repeat } from 'lucide-react';

const projectSteps = [
  { key: 'projectInfo', icon: Folder },
  { key: 'commonParams', icon: Sliders },
] as const;

const axisSteps = [
  { key: 'mechanism', icon: Cog },
  { key: 'motion', icon: Activity },
  { key: 'duty', icon: Gauge },
  { key: 'systemConfig', icon: CheckCircle },
] as const;

interface StepItemProps {
  icon: React.ElementType;
  label: string;
  phase: 'project' | 'axis';
}

function StepItem({ icon: Icon, label, phase }: StepItemProps) {
  const colorClass = phase === 'project'
    ? 'bg-[var(--primary-500)]/10 text-[var(--primary-400)] border-[var(--primary-500)]/30'
    : 'bg-[var(--green-500)]/10 text-[var(--green-400)] border-[var(--green-500)]/30';

  return (
    <div className="flex flex-col items-center group">
      <div className={`w-12 h-12 rounded-full ${colorClass} border-2 flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-[var(--foreground-secondary)]">{label}</span>
    </div>
  );
}

export function ProcessPreview() {
  const t = useTranslations('onboarding');

  return (
    <div className="mb-12">
      {/* Phase 1: Project Configuration */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4 text-center">
          {t('process.projectPhase')}
        </h3>
        <div className="flex items-center justify-center gap-4">
          {projectSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-4">
              <StepItem
                icon={step.icon}
                label={t(`process.steps.${step.key}`)}
                phase="project"
              />
              {index < projectSteps.length - 1 && (
                <div className="w-8 h-0.5 bg-[var(--primary-500)]/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px bg-[var(--border-default)] flex-1 max-w-[100px]" />
        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
          <Repeat className="w-3 h-3" />
          <span>{t('process.repeatable')}</span>
        </div>
        <div className="h-px bg-[var(--border-default)] flex-1 max-w-[100px]" />
      </div>

      {/* Phase 2: Axis Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4 text-center">
          {t('process.axisPhase')}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-y-4">
          {axisSteps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <StepItem
                icon={step.icon}
                label={t(`process.steps.${step.key}`)}
                phase="axis"
              />
              {index < axisSteps.length - 1 && (
                <div className="w-6 sm:w-8 h-0.5 bg-[var(--green-500)]/30 mx-2 sm:mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
