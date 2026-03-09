'use client';

import { useProjectStore } from '@/stores/project-store';
import {
  MotionParams,
  LinearMotionParams,
  RotaryMotionParams,
  BeltMotionParams,
  MechanismType
} from '@/types';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Move, ArrowRight, ArrowLeft, TrendingUp, Activity } from 'lucide-react';
import { buildDefaultMotionParams } from '@/lib/calculations/build-sizing-input';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="form-label">
        {label}
        {required && <span className="text-[var(--red-400)] ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--foreground-muted)]">{hint}</p>
      )}
    </div>
  );
}

/**
 * 根据传动类型获取运动参数类型
 */
function getMotionType(mechanismType: MechanismType): 'LINEAR' | 'ROTARY' | 'BELT' {
  switch (mechanismType) {
    case 'BALL_SCREW':
    case 'RACK_PINION':
      return 'LINEAR';
    case 'GEARBOX':
      return 'ROTARY';
    case 'DIRECT_DRIVE':
      return 'ROTARY'; // 默认旋转，可根据需要调整
    case 'BELT':
      return 'BELT';
    default:
      return 'LINEAR';
  }
}

export function MotionStep() {
  const { input, setMotion, nextStep, prevStep } = useProjectStore();
  const t = useTranslations('motion');
  const commonT = useTranslations('common');

  // 获取当前传动类型
  const mechanismType = input.mechanism?.type || 'BALL_SCREW';
  const motionType = getMotionType(mechanismType);

  // 初始化表单数据
  const [formData, setFormData] = useState<MotionParams>(() => {
    if (input.motion) {
      // 确保现有数据有 motionType
      return {
        ...input.motion,
        motionType: (input.motion as any).motionType || motionType,
      };
    }
    // 使用默认值
    return buildDefaultMotionParams(mechanismType);
  });

  // 当传动类型改变时重置表单
  useEffect(() => {
    const newMotionType = getMotionType(mechanismType);
    if (formData.motionType !== newMotionType) {
      setFormData(buildDefaultMotionParams(mechanismType));
    }
  }, [mechanismType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMotion(formData);
    nextStep();
  };

  // 渲染直线运动参数
  const renderLinearParams = () => {
    const data = formData as LinearMotionParams;
    return (
      <>
        <FormField label={t('stroke')} required hint={t('hints.stroke')}>
          <div className="relative">
            <input
              type="number"
              value={data.stroke}
              onChange={(e) =>
                setFormData({ ...data, stroke: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('maxVelocity')} required hint={t('hints.maxVelocity')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxVelocity}
              onChange={(e) =>
                setFormData({ ...data, maxVelocity: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s</span>
          </div>
        </FormField>

        <FormField label={t('maxAcceleration')} required hint={t('hints.maxAcceleration')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxAcceleration}
              onChange={(e) =>
                setFormData({ ...data, maxAcceleration: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s²</span>
          </div>
        </FormField>
      </>
    );
  };

  // 渲染旋转运动参数
  const renderRotaryParams = () => {
    const data = formData as RotaryMotionParams;
    return (
      <>
        <FormField label={t('rotationAngle')} required hint={t('hints.rotationAngle')}>
          <div className="relative">
            <input
              type="number"
              value={data.rotationAngle}
              onChange={(e) =>
                setFormData({ ...data, rotationAngle: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">°</span>
          </div>
        </FormField>

        <FormField label={t('maxVelocityRotary')} required hint={t('hints.maxVelocityRotary')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxVelocity}
              onChange={(e) =>
                setFormData({ ...data, maxVelocity: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">rpm</span>
          </div>
        </FormField>

        <FormField label={t('maxAccelerationRotary')} required hint={t('hints.maxAccelerationRotary')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxAcceleration}
              onChange={(e) =>
                setFormData({ ...data, maxAcceleration: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">rad/s²</span>
          </div>
        </FormField>
      </>
    );
  };

  // 渲染皮带运动参数（与直线类似）
  const renderBeltParams = () => {
    const data = formData as BeltMotionParams;
    return (
      <>
        <FormField label={t('stroke')} required hint={t('hints.stroke')}>
          <div className="relative">
            <input
              type="number"
              value={data.stroke}
              onChange={(e) =>
                setFormData({ ...data, stroke: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('maxVelocity')} required hint={t('hints.maxVelocity')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxVelocity}
              onChange={(e) =>
                setFormData({ ...data, maxVelocity: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s</span>
          </div>
        </FormField>

        <FormField label={t('maxAcceleration')} required hint={t('hints.maxAcceleration')}>
          <div className="relative">
            <input
              type="number"
              value={data.maxAcceleration}
              onChange={(e) =>
                setFormData({ ...data, maxAcceleration: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm/s²</span>
          </div>
        </FormField>
      </>
    );
  };

  // 根据运动类型渲染对应字段
  const renderMotionParams = () => {
    switch (formData.motionType) {
      case 'LINEAR':
        return renderLinearParams();
      case 'ROTARY':
        return renderRotaryParams();
      case 'BELT':
        return renderBeltParams();
      default:
        return renderLinearParams();
    }
  };

  // 渲染快速统计信息
  const renderQuickStats = () => {
    const isRotary = formData.motionType === 'ROTARY';

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-[var(--primary-400)] mx-auto mb-2" />
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.cycleRate')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {(60 / (formData.cycleTime || 1)).toFixed(1)}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">{t('stats.cyclesPerMinute')}</p>
        </div>
        <div className="card p-4 text-center">
          <Activity className="w-5 h-5 text-[var(--green-400)] mx-auto mb-2" />
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.accelRatio')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {isRotary
              ? (formData.maxAcceleration / 9.8).toFixed(2)  // rad/s² 转 g 近似
              : (formData.maxAcceleration / 9800).toFixed(2)  // mm/s² 转 g
            }
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">g</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--amber-400)] mx-auto mb-2 flex items-center justify-center">
            <span className="text-[10px] text-[var(--amber-400)]">V</span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mb-1">{t('stats.maxSpeed')}</p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {formData.maxVelocity}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {isRotary ? 'rpm' : 'mm/s'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--primary-400)] mx-auto mb-2 flex items-center justify-center">
            <span className="text-[10px] text-[var(--primary-400)]">
              {isRotary ? '°' : 'S'}
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mb-1">
            {isRotary ? t('stats.rotationAngle') : t('stats.stroke')}
          </p>
          <p className="text-lg font-bold number-display text-[var(--foreground)]">
            {isRotary
              ? (formData as RotaryMotionParams).rotationAngle
              : (formData as LinearMotionParams | BeltMotionParams).stroke}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {isRotary ? '°' : 'mm'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
          <Move className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Profile Selection */}
      <div className="space-y-3">
        <label className="form-label">{t('profileLabel')}</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, profile: 'TRAPEZOIDAL' })}
            className={`
              flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200
              ${formData.profile === 'TRAPEZOIDAL'
                ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }
            `}
          >
            <div className="w-16 h-10 relative">
              <svg viewBox="0 0 64 40" className="w-full h-full">
                <path
                  d="M4 36 L20 36 L32 4 L44 36 L60 36"
                  fill="none"
                  stroke={formData.profile === 'TRAPEZOIDAL' ? 'var(--primary-400)' : 'var(--foreground-muted)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <span className={`font-medium ${formData.profile === 'TRAPEZOIDAL' ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {t('profiles.trapezoidal')}
              </span>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">{t('profileDesc.trapezoidal')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, profile: 'S_CURVE' })}
            className={`
              flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200
              ${formData.profile === 'S_CURVE'
                ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }
            `}
          >
            <div className="w-16 h-10 relative">
              <svg viewBox="0 0 64 40" className="w-full h-full">
                <path
                  d="M4 36 Q16 36 20 28 Q24 4 32 4 Q40 4 44 28 Q48 36 60 36"
                  fill="none"
                  stroke={formData.profile === 'S_CURVE' ? 'var(--primary-400)' : 'var(--foreground-muted)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <span className={`font-medium ${formData.profile === 'S_CURVE' ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {t('profiles.sCurve')}
              </span>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">{t('profileDesc.sCurve')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-[var(--primary-400)] to-[var(--primary-600)] rounded-full"></span>
          {t('paramsTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {renderMotionParams()}

          <FormField label={t('dwellTime')} hint={t('hints.dwellTime')}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.dwellTime}
                onChange={(e) =>
                  setFormData({ ...formData, dwellTime: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">s</span>
            </div>
          </FormField>

          <FormField label={t('cycleTime')} hint={t('hints.cycleTime')}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.cycleTime}
                onChange={(e) =>
                  setFormData({ ...formData, cycleTime: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">s</span>
            </div>
          </FormField>
        </div>
      </div>

      {/* Quick Stats */}
      {renderQuickStats()}

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
