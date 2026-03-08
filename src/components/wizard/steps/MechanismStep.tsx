'use client';

import { useProjectStore } from '@/stores/project-store';
import {
  MechanismConfig,
  MechanismType,
  BallScrewParams,
  GearboxParams,
  DirectDriveParams,
  BeltParams,
  RackPinionParams,
} from '@/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mechanismDiagrams } from '../mechanism-diagrams';
import { Settings, ArrowRight, ArrowLeft, Info } from 'lucide-react';

const mechanismTypes: { value: MechanismType; labelKey: string; icon: string }[] = [
  { value: 'BALL_SCREW', labelKey: 'ballScrew', icon: '⚙️' },
  { value: 'GEARBOX', labelKey: 'gearbox', icon: '🔧' },
  { value: 'DIRECT_DRIVE', labelKey: 'directDrive', icon: '⚡' },
  { value: 'BELT', labelKey: 'belt', icon: '➰' },
  { value: 'RACK_PINION', labelKey: 'rackPinion', icon: '📏' },
];

const defaultParams = {
  BALL_SCREW: {
    loadMass: 100,
    lead: 10,
    screwDiameter: 20,
    screwLength: 500,
    gearRatio: 1,
    efficiency: 0.9,
    frictionCoeff: 0.05,
    preloadTorque: 0,
  } as BallScrewParams,
  GEARBOX: {
    loadMass: 100,
    loadType: 'TABLE' as const,
    tableDiameter: 300,
    drumDiameter: 200,
    gearRatio: 10,
    efficiency: 0.9,
    frictionTorque: 0,
    gravityArmLength: 0,
  } as GearboxParams,
  DIRECT_DRIVE: {
    driveType: 'ROTARY' as const,
    loadMass: 100,
    tableDiameter: 300,
    stroke: 500,
    efficiency: 0.95,
  } as DirectDriveParams,
  BELT: {
    loadMass: 50,
    pulleyDiameter: 50,
    drivenPulleyDiameter: 50,
    beltLength: 1000,
    beltMassPerMeter: 0.1,
    efficiency: 0.85,
    tensionForce: 0,
  } as BeltParams,
  RACK_PINION: {
    loadMass: 500,
    pinionDiameter: 80,
    gearRatio: 5,
    efficiency: 0.9,
    frictionCoeff: 0.05,
    mountingAngle: 0,
  } as RackPinionParams,
};

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
        <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
    </div>
  );
}

export function MechanismStep() {
  const t = useTranslations('mechanism');
  const commonT = useTranslations('common');
  const { input, setMechanism, nextStep, prevStep } = useProjectStore();

  const [formData, setFormData] = useState<MechanismConfig>(
    input.mechanism || {
      type: 'BALL_SCREW',
      params: defaultParams.BALL_SCREW,
    }
  );

  const handleTypeChange = (newType: MechanismType) => {
    setFormData({
      type: newType,
      params: defaultParams[newType],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMechanism(formData);
    nextStep();
  };

  const renderBallScrewParams = () => {
    const params = formData.params as BallScrewParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={t('params.loadMass')} required hint={t('hints.loadMass')}>
          <div className="relative">
            <input
              type="number"
              value={params.loadMass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg</span>
          </div>
        </FormField>

        <FormField label={t('params.lead')} required hint={t('hints.lead')}>
          <div className="relative">
            <input
              type="number"
              value={params.lead}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, lead: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.screwDiameter')}>
          <div className="relative">
            <input
              type="number"
              value={params.screwDiameter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, screwDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.screwLength')}>
          <div className="relative">
            <input
              type="number"
              value={params.screwLength}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, screwLength: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.gearRatio')}>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="w-full px-4 py-2.5"
          />
        </FormField>

        <FormField label={t('params.efficiency')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.efficiency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, efficiency: parseFloat(e.target.value) || 0.9 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">%</span>
          </div>
        </FormField>

        <FormField label={t('params.frictionCoeff')}>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={params.frictionCoeff}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, frictionCoeff: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full px-4 py-2.5"
          />
        </FormField>

        <FormField label={t('params.preloadTorque')}>
          <div className="relative">
            <input
              type="number"
              value={params.preloadTorque}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, preloadTorque: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">N·m</span>
          </div>
        </FormField>
      </div>
    );
  };

  const renderGearboxParams = () => {
    const params = formData.params as GearboxParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={t('params.loadMass')} required>
          <div className="relative">
            <input
              type="number"
              value={params.loadMass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg</span>
          </div>
        </FormField>

        <FormField label={t('params.loadType')} required>
          <select
            value={params.loadType}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadType: e.target.value as 'TABLE' | 'DRUM' | 'OTHER' },
              })
            }
            className="w-full px-4 py-2.5"
          >
            <option value="TABLE">{t('loadTypes.table')}</option>
            <option value="DRUM">{t('loadTypes.drum')}</option>
            <option value="OTHER">{t('loadTypes.other')}</option>
          </select>
        </FormField>

        {params.loadType === 'TABLE' && (
          <FormField label={t('params.tableDiameter')}>
            <div className="relative">
              <input
                type="number"
                value={params.tableDiameter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    params: { ...params, tableDiameter: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
            </div>
          </FormField>
        )}

        {params.loadType === 'DRUM' && (
          <FormField label={t('params.drumDiameter')}>
            <div className="relative">
              <input
                type="number"
                value={params.drumDiameter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    params: { ...params, drumDiameter: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
            </div>
          </FormField>
        )}

        <FormField label={t('params.gearRatio')}>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="w-full px-4 py-2.5"
          />
        </FormField>

        <FormField label={t('params.efficiency')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.efficiency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, efficiency: parseFloat(e.target.value) || 0.9 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">%</span>
          </div>
        </FormField>

        <FormField label={t('params.frictionTorque')}>
          <div className="relative">
            <input
              type="number"
              value={params.frictionTorque}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, frictionTorque: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">N·m</span>
          </div>
        </FormField>

        <FormField label={t('params.gravityArmLength')}>
          <div className="relative">
            <input
              type="number"
              value={params.gravityArmLength}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, gravityArmLength: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>
      </div>
    );
  };

  const renderDirectDriveParams = () => {
    const params = formData.params as DirectDriveParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={t('params.driveType')} required>
          <select
            value={params.driveType}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, driveType: e.target.value as 'ROTARY' | 'LINEAR' },
              })
            }
            className="w-full px-4 py-2.5"
          >
            <option value="ROTARY">{t('driveTypes.rotary')}</option>
            <option value="LINEAR">{t('driveTypes.linear')}</option>
          </select>
        </FormField>

        <FormField label={t('params.loadMass')} required>
          <div className="relative">
            <input
              type="number"
              value={params.loadMass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg</span>
          </div>
        </FormField>

        {params.driveType === 'ROTARY' && (
          <FormField label={t('params.tableDiameter')}>
            <div className="relative">
              <input
                type="number"
                value={params.tableDiameter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    params: { ...params, tableDiameter: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
            </div>
          </FormField>
        )}

        {params.driveType === 'LINEAR' && (
          <FormField label={t('params.stroke')}>
            <div className="relative">
              <input
                type="number"
                value={params.stroke || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    params: { ...params, stroke: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
            </div>
          </FormField>
        )}

        <FormField label={t('params.efficiency')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.efficiency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, efficiency: parseFloat(e.target.value) || 0.95 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">%</span>
          </div>
        </FormField>
      </div>
    );
  };

  const renderBeltParams = () => {
    const params = formData.params as BeltParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={t('params.loadMass')} required>
          <div className="relative">
            <input
              type="number"
              value={params.loadMass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg</span>
          </div>
        </FormField>

        <FormField label={t('params.pulleyDiameter')}>
          <div className="relative">
            <input
              type="number"
              value={params.pulleyDiameter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, pulleyDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.drivenPulleyDiameter')}>
          <div className="relative">
            <input
              type="number"
              value={params.drivenPulleyDiameter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, drivenPulleyDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.beltLength')}>
          <div className="relative">
            <input
              type="number"
              value={params.beltLength}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, beltLength: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.beltMassPerMeter')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={params.beltMassPerMeter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, beltMassPerMeter: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg/m</span>
          </div>
        </FormField>

        <FormField label={t('params.efficiency')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.efficiency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, efficiency: parseFloat(e.target.value) || 0.85 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">%</span>
          </div>
        </FormField>

        <FormField label={t('params.tensionForce')}>
          <div className="relative">
            <input
              type="number"
              value={params.tensionForce}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, tensionForce: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">N</span>
          </div>
        </FormField>
      </div>
    );
  };

  const renderRackPinionParams = () => {
    const params = formData.params as RackPinionParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={t('params.loadMass')} required>
          <div className="relative">
            <input
              type="number"
              value={params.loadMass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">kg</span>
          </div>
        </FormField>

        <FormField label={t('params.pinionDiameter')}>
          <div className="relative">
            <input
              type="number"
              value={params.pinionDiameter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, pinionDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">mm</span>
          </div>
        </FormField>

        <FormField label={t('params.gearRatio')}>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="w-full px-4 py-2.5"
          />
        </FormField>

        <FormField label={t('params.efficiency')}>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.efficiency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, efficiency: parseFloat(e.target.value) || 0.9 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">%</span>
          </div>
        </FormField>

        <FormField label={t('params.frictionCoeff')}>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={params.frictionCoeff}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, frictionCoeff: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full px-4 py-2.5"
          />
        </FormField>

        <FormField label={t('params.mountingAngle')}>
          <div className="relative">
            <input
              type="number"
              value={params.mountingAngle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, mountingAngle: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2.5 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-muted)]">°</span>
          </div>
        </FormField>
      </div>
    );
  };

  const renderParamsForm = () => {
    switch (formData.type) {
      case 'BALL_SCREW':
        return renderBallScrewParams();
      case 'GEARBOX':
        return renderGearboxParams();
      case 'DIRECT_DRIVE':
        return renderDirectDriveParams();
      case 'BELT':
        return renderBeltParams();
      case 'RACK_PINION':
        return renderRackPinionParams();
      default:
        return renderBallScrewParams();
    }
  };

  const DiagramComponent = mechanismDiagrams[formData.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
      </div>

      {/* Mechanism Type Selection */}
      <div className="space-y-3">
        <label className="form-label">
          {t('typeLabel')} <span className="text-[var(--red-400)]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {mechanismTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeChange(type.value)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
                ${formData.type === type.value
                  ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/10'
                  : 'bg-[var(--background-tertiary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]'
                }
              `}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className={`text-sm font-medium ${formData.type === type.value ? 'text-[var(--primary-300)]' : 'text-[var(--foreground)]'}`}>
                {t(`types.${type.labelKey}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Diagram */}
      <div className="card p-6 flex justify-center bg-[var(--background-tertiary)]">
        <DiagramComponent className="w-full max-w-md h-auto" />
      </div>

      {/* Parameters Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-[var(--primary-400)] to-[var(--primary-600)] rounded-full"></span>
          {t('paramsTitle')}
        </h3>
        {renderParamsForm()}
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
