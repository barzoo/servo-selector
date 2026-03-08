'use client';

import { useProjectStore } from '@/stores/project-store';
import { SystemPreferences } from '@/types';
import { useState } from 'react';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { useTranslations } from 'next-intl';
import { Cpu, ArrowRight, ArrowLeft, AlertCircle, Check, Shield, Hash } from 'lucide-react';

const getSafetyOptions = (t: (key: string) => string) => [
  { value: 'NONE', label: t('safetyOptions.none'), desc: t('safetyOptions.noneDesc') },
  { value: 'STO', label: t('safetyOptions.sto'), desc: t('safetyOptions.stoDesc') },
];

const getEncoderOptions = (t: (key: string) => string) => [
  { value: 'BOTH', label: t('encoderOptions.both'), desc: t('encoderOptions.bothDesc'), icon: '🔀' },
  { value: 'A', label: t('encoderOptions.typeA'), desc: t('encoderOptions.typeADesc'), icon: '🔋' },
  { value: 'B', label: t('encoderOptions.typeB'), desc: t('encoderOptions.typeBDesc'), icon: '⚙️' },
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

export function SystemConfigStep() {
  const { project, currentAxisId, input, setPreferences, setResult, prevStep, completeWizard, updateAxisName } = useProjectStore();
  const currentAxis = project.axes.find(a => a.id === currentAxisId);
  const t = useTranslations('systemConfig');
  const commonT = useTranslations('common');

  const SAFETY_OPTIONS = getSafetyOptions(t);
  const ENCODER_OPTIONS = getEncoderOptions(t);

  const [formData, setFormData] = useState<SystemPreferences>(
    input.preferences || {
      encoderType: 'BOTH',
      safety: 'NONE',
    }
  );
  const [axisName, setAxisName] = useState(currentAxis?.name || '');
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);

    if (!project.name) {
      setError(t('errors.missingProject'));
      setIsCalculating(false);
      return;
    }
    if (!currentAxis?.input.mechanism) {
      setError(t('errors.missingMechanism'));
      setIsCalculating(false);
      return;
    }
    if (!currentAxis?.input.motion) {
      setError(t('errors.missingMotion'));
      setIsCalculating(false);
      return;
    }
    if (!currentAxis?.input.dutyConditions) {
      setError(t('errors.missingDuty'));
      setIsCalculating(false);
      return;
    }

    setPreferences(formData);

    try {
      const engine = new SizingEngine();
      const projectInfo = {
        name: project.name,
        customer: project.customer,
        salesPerson: project.salesPerson,
        notes: project.notes,
      };
      const dutyConditions = currentAxis.input.dutyConditions!;
      const duty = {
        ambientTemp: project.commonParams.ambientTemp,
        dutyCycle: dutyConditions.dutyCycle,
        mountingOrientation: dutyConditions.mountingOrientation,
        ipRating: project.commonParams.ipRating,
        brake: dutyConditions.brake,
        keyShaft: dutyConditions.keyShaft,
      };
      const result = engine.calculate({
        project: projectInfo,
        mechanism: currentAxis.input.mechanism,
        motion: currentAxis.input.motion,
        duty: duty,
        preferences: {
          safetyFactor: project.commonParams.safetyFactor,
          maxInertiaRatio: project.commonParams.maxInertiaRatio,
          targetInertiaRatio: project.commonParams.targetInertiaRatio,
          communication: project.commonParams.communication,
          cableLength: project.commonParams.cableLength,
          encoderType: formData.encoderType,
          safety: formData.safety,
        },
      });
      setResult(result);
      if (axisName.trim() && updateAxisName) {
        updateAxisName(currentAxisId, axisName.trim());
      }
      completeWizard();
    } catch (err) {
      setError(t('errors.calculationFailed'));
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card p-5 bg-gradient-to-r from-[var(--amber-500)]/5 to-transparent border-l-4 border-l-[var(--amber-500)]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--amber-500)]/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[var(--amber-400)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-1">{t('infoCard.title')}</h3>
            <p className="text-sm text-[var(--foreground-secondary)]">
              {t('infoCard.content')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-[var(--red-500)]/5 border-[var(--red-500)]/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--red-400)]" />
            <p className="text-sm text-[var(--red-400)]">{error}</p>
          </div>
        </div>
      )}

      {/* Safety Options */}
      <div className="space-y-3">
        <FormField label={t('safety')} />
        <div className="grid grid-cols-2 gap-3">
          {SAFETY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, safety: opt.value as 'STO' | 'NONE' })}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-left
                ${formData.safety === opt.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-4 h-4 ${formData.safety === opt.value ? 'text-[var(--primary-400)]' : 'text-[var(--foreground-muted)]'}`} />
                <span className={`font-medium ${formData.safety === opt.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                  {opt.label}
                </span>
              </div>
              <p className={`text-xs ${formData.safety === opt.value ? 'text-[var(--primary-200)]' : 'text-[var(--foreground-muted)]'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Encoder Options */}
      <div className="space-y-3">
        <FormField label={t('encoder')} />
        <div className="grid grid-cols-3 gap-3">
          {ENCODER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, encoderType: opt.value as 'A' | 'B' | 'BOTH' })}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-center
                ${formData.encoderType === opt.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <div className={`font-medium mb-1 ${formData.encoderType === opt.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {opt.label}
              </div>
              <p className={`text-xs ${formData.encoderType === opt.value ? 'text-[var(--primary-200)]' : 'text-[var(--foreground-muted)]'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">
          {t('encoderHint')}
        </p>
      </div>

      {/* Axis Name */}
      <div className="card p-5 border-t-4 border-t-[var(--primary-500)]">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-[var(--primary-400)]" />
          <h3 className="font-semibold text-[var(--foreground)]">{t('axisName.title')}</h3>
        </div>
        <FormField label={t('axisName.label')}>
          <input
            type="text"
            value={axisName}
            onChange={(e) => setAxisName(e.target.value)}
            className="w-full px-4 py-2.5"
            placeholder={t('axisName.placeholder')}
          />
        </FormField>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {t('axisName.hint')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={prevStep}
          className="btn btn-secondary"
          disabled={isCalculating}
        >
          <ArrowLeft className="w-4 h-4" />
          {commonT('back')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('calculating')}
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {t('startSizing')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
