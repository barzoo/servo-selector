'use client';

import { useWizardStore } from '@/stores/wizard-store';
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

const mechanismTypes: { value: MechanismType; labelKey: string }[] = [
  { value: 'BALL_SCREW', labelKey: 'ballScrew' },
  { value: 'GEARBOX', labelKey: 'gearbox' },
  { value: 'DIRECT_DRIVE', labelKey: 'directDrive' },
  { value: 'BELT', labelKey: 'belt' },
  { value: 'RACK_PINION', labelKey: 'rackPinion' },
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

export function MechanismStep() {
  const t = useTranslations('mechanism');
  const commonT = useTranslations('common');
  const { input, setMechanism, nextStep, prevStep } = useWizardStore();

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadMass')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.loadMass}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.lead')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.lead}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, lead: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.screwDiameter')}
          </label>
          <input
            type="number"
            value={params.screwDiameter}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, screwDiameter: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.screwLength')}
          </label>
          <input
            type="number"
            value={params.screwLength}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, screwLength: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.gearRatio')}
          </label>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.efficiency')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.frictionCoeff')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.preloadTorque')}
          </label>
          <input
            type="number"
            value={params.preloadTorque}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, preloadTorque: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    );
  };

  const renderGearboxParams = () => {
    const params = formData.params as GearboxParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadMass')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.loadMass}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadType')} <span className="text-red-500">*</span>
          </label>
          <select
            value={params.loadType}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadType: e.target.value as 'TABLE' | 'DRUM' | 'OTHER' },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="TABLE">{t('loadTypes.table')}</option>
            <option value="DRUM">{t('loadTypes.drum')}</option>
            <option value="OTHER">{t('loadTypes.other')}</option>
          </select>
        </div>

        {params.loadType === 'TABLE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('params.tableDiameter')}
            </label>
            <input
              type="number"
              value={params.tableDiameter || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, tableDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
            />
          </div>
        )}

        {params.loadType === 'DRUM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('params.drumDiameter')}
            </label>
            <input
              type="number"
              value={params.drumDiameter || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, drumDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.gearRatio')}
          </label>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.efficiency')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.frictionTorque')}
          </label>
          <input
            type="number"
            value={params.frictionTorque}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, frictionTorque: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.gravityArmLength')}
          </label>
          <input
            type="number"
            value={params.gravityArmLength}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gravityArmLength: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    );
  };

  const renderDirectDriveParams = () => {
    const params = formData.params as DirectDriveParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.driveType')} <span className="text-red-500">*</span>
          </label>
          <select
            value={params.driveType}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, driveType: e.target.value as 'ROTARY' | 'LINEAR' },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="ROTARY">{t('driveTypes.rotary')}</option>
            <option value="LINEAR">{t('driveTypes.linear')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadMass')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.loadMass}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        {params.driveType === 'ROTARY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('params.tableDiameter')}
            </label>
            <input
              type="number"
              value={params.tableDiameter || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, tableDiameter: parseFloat(e.target.value) || 0 },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
            />
          </div>
        )}

        {params.driveType === 'LINEAR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('params.stroke')}
            </label>
            <input
              type="number"
              value={params.stroke || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...params, stroke: parseFloat(e.target.value) || 0 },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.efficiency')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    );
  };

  const renderBeltParams = () => {
    const params = formData.params as BeltParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadMass')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.loadMass}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.pulleyDiameter')}
          </label>
          <input
            type="number"
            value={params.pulleyDiameter}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, pulleyDiameter: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.drivenPulleyDiameter')}
          </label>
          <input
            type="number"
            value={params.drivenPulleyDiameter}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, drivenPulleyDiameter: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.beltLength')}
          </label>
          <input
            type="number"
            value={params.beltLength}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, beltLength: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.beltMassPerMeter')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.efficiency')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.tensionForce')}
          </label>
          <input
            type="number"
            value={params.tensionForce}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, tensionForce: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    );
  };

  const renderRackPinionParams = () => {
    const params = formData.params as RackPinionParams;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.loadMass')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={params.loadMass}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, loadMass: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.pinionDiameter')}
          </label>
          <input
            type="number"
            value={params.pinionDiameter}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, pinionDiameter: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.gearRatio')}
          </label>
          <input
            type="number"
            value={params.gearRatio}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, gearRatio: parseFloat(e.target.value) || 1 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.efficiency')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.frictionCoeff')}
          </label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('params.mountingAngle')}
          </label>
          <input
            type="number"
            value={params.mountingAngle}
            onChange={(e) =>
              setFormData({
                ...formData,
                params: { ...params, mountingAngle: parseFloat(e.target.value) || 0 },
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('type')} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value as MechanismType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
        >
          {mechanismTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {t(`types.${type.labelKey}`)}
            </option>
          ))}
        </select>
      </div>

      {/* 传动机构示意图 */}
      {(() => {
        const DiagramComponent = mechanismDiagrams[formData.type];
        return (
          <div className="bg-gray-50 rounded-lg p-4 flex justify-center border border-gray-200">
            <DiagramComponent className="w-full max-w-md h-auto" />
          </div>
        );
      })()}

      {renderParamsForm()}

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {commonT('back')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {commonT('next')}
        </button>
      </div>
    </form>
  );
}
