'use client';

import { useProjectStore } from '@/stores/project-store';
import { DutyConditions } from '@/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, ArrowRight, ArrowLeft, Thermometer, Shield } from 'lucide-react';

const getBrakeOptions = (t: (key: string) => string) => [
  { value: false, label: t('brake.noBrake'), desc: t('brake.noBrakeDesc'), icon: '○' },
  { value: true, label: t('brake.withBrake'), desc: t('brake.withBrakeDesc'), icon: '◉' },
];

const getDutyCycles = (t: (key: string) => string) => [
  { value: 100, label: 'S1', desc: t('dutyCycles.s1'), color: 'var(--green-400)' },
  { value: 60, label: 'S2', desc: t('dutyCycles.s2'), color: 'var(--primary-400)' },
  { value: 40, label: 'S3', desc: t('dutyCycles.s3'), color: 'var(--amber-400)' },
  { value: 25, label: 'S4', desc: t('dutyCycles.s4'), color: 'var(--red-400)' },
];

const getOrientations = (t: (key: string) => string) => [
  { value: 'HORIZONTAL', label: t('orientations.horizontal'), icon: '═' },
  { value: 'VERTICAL_UP', label: t('orientations.verticalUp'), icon: '↑' },
  { value: 'VERTICAL_DOWN', label: t('orientations.verticalDown'), icon: '↓' },
];

interface FormFieldProps {
  label: string;
  required?: boolean;
  children?: React.ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="form-label">
        {label}
        {required && <span className="text-[var(--red-400)] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export function DutyStep() {
  const { project, currentAxisId, updateAxisDutyConditions, nextStep, prevStep } = useProjectStore();
  const t = useTranslations('duty');
  const commonT = useTranslations('common');

  const currentAxis = project.axes.find(a => a.id === currentAxisId);

  const BRAKE_OPTIONS = getBrakeOptions(t);
  const DUTY_CYCLES = getDutyCycles(t);
  const ORIENTATIONS = getOrientations(t);

  const keyShaftOptions = [
    { value: 'L' as const, label: t('keyShaftOptions.smooth'), desc: t('keyShaftOptions.smoothDesc') },
    { value: 'K' as const, label: t('keyShaftOptions.keyed'), desc: t('keyShaftOptions.keyedDesc') },
  ];

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
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Environment Info Card */}
      <div className="card p-5 bg-gradient-to-r from-[var(--background-tertiary)] to-transparent border-l-4 border-l-[var(--primary-500)]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
            <Thermometer className="w-5 h-5 text-[var(--primary-400)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[var(--foreground)] mb-1">{t('environment.title')}</h3>
            <p className="text-sm text-[var(--foreground-secondary)]">
              {t('environment.temp')}: <span className="text-[var(--foreground)] font-medium">{project.commonParams.ambientTemp}°C</span>
              <span className="mx-2 text-[var(--border-default)]">|</span>
              {t('environment.ipRating')}: <span className="text-[var(--foreground)] font-medium">IP{project.commonParams.ipRating}</span>
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-2">
              {t('environment.hint')}
            </p>
          </div>
        </div>
      </div>

      {/* Duty Cycle Selection */}
      <div className="space-y-3">
        <FormField label={t('dutyCycle')} required />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DUTY_CYCLES.map((cycle) => (
            <button
              key={cycle.value}
              type="button"
              onClick={() => setFormData({ ...formData, dutyCycle: cycle.value })}
              className={`
                relative p-4 rounded-xl border transition-all duration-200 text-left
                ${formData.dutyCycle === cycle.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: formData.dutyCycle === cycle.value ? cycle.color : 'var(--foreground-muted)' }}
                >
                  {cycle.label}
                </span>
                <span className="text-xs font-medium text-[var(--foreground-muted)]">{cycle.value}%</span>
              </div>
              <p className={`text-sm ${formData.dutyCycle === cycle.value ? 'text-[var(--foreground)]' : 'text-[var(--foreground-muted)]'}`}>
                {cycle.desc}
              </p>
              {formData.dutyCycle === cycle.value && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--primary-400)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mounting Orientation */}
      <div className="space-y-3">
        <FormField label={t('mountingOrientation')} required />
        <div className="grid grid-cols-3 gap-3">
          {ORIENTATIONS.map((orientation) => (
            <button
              key={orientation.value}
              type="button"
              onClick={() => {
                const isVertical = orientation.value.startsWith('VERTICAL');
                setFormData({
                  ...formData,
                  mountingOrientation: orientation.value as 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN',
                  brake: isVertical ? true : formData.brake,
                });
              }}
              className={`
                p-4 rounded-xl border transition-all duration-200
                ${formData.mountingOrientation === orientation.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className={`text-2xl mb-2 ${formData.mountingOrientation === orientation.value ? 'text-[var(--primary-400)]' : 'text-[var(--foreground-muted)]'}`}>
                {orientation.icon}
              </div>
              <p className={`text-sm font-medium ${formData.mountingOrientation === orientation.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {orientation.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Brake Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="form-label mb-0">{t('brake.title')}</span>
          {formData.mountingOrientation.startsWith('VERTICAL') && (
            <span className="badge badge-warning text-xs">{t('brake.verticalWarning')}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BRAKE_OPTIONS.map((opt) => (
            <button
              key={opt.value ? 'yes' : 'no'}
              type="button"
              onClick={() => setFormData({ ...formData, brake: opt.value })}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-left
                ${formData.brake === opt.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xl ${formData.brake === opt.value ? 'text-[var(--primary-400)]' : 'text-[var(--foreground-muted)]'}`}>
                  {opt.icon}
                </span>
                <span className={`font-medium ${formData.brake === opt.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                  {opt.label}
                </span>
              </div>
              <p className={`text-xs ${formData.brake === opt.value ? 'text-[var(--primary-200)]' : 'text-[var(--foreground-muted)]'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Key Shaft Selection */}
      <div className="space-y-3">
        <FormField label={t('keyShaft')} />
        <div className="grid grid-cols-2 gap-3">
          {keyShaftOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, keyShaft: opt.value })}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-left
                ${formData.keyShaft === opt.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-4 h-4 ${formData.keyShaft === opt.value ? 'text-[var(--primary-400)]' : 'text-[var(--foreground-muted)]'}`} />
                <span className={`font-medium ${formData.keyShaft === opt.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                  {opt.label}
                </span>
              </div>
              <p className={`text-xs ${formData.keyShaft === opt.value ? 'text-[var(--primary-200)]' : 'text-[var(--foreground-muted)]'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={prevStep}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          {commonT('back')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {commonT('next')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
