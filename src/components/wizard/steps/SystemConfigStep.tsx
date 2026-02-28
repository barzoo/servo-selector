'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { SystemPreferences } from '@/types';
import { useState } from 'react';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { useTranslations } from 'next-intl';

export function SystemConfigStep() {
  const { input, setPreferences, setResult, nextStep, prevStep } = useWizardStore();
  const { t } = useTranslations('systemConfig');

  const [formData, setFormData] = useState<SystemPreferences>(
    input.preferences || {
      safetyFactor: 1.5,
      maxInertiaRatio: 10,
      encoderType: 'MULTI_TURN',
      communication: 'ETHERCAT',
      emcFilter: 'NONE',
      cableLength: 5,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences(formData);

    // 执行选型计算
    if (input.project && input.mechanism && input.motion && input.duty) {
      const engine = new SizingEngine();
      const result = engine.calculate({
        project: input.project,
        mechanism: input.mechanism,
        motion: input.motion,
        duty: input.duty,
        preferences: formData,
      });
      setResult(result);
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('safetyFactor')}
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="3"
            value={formData.safetyFactor}
            onChange={(e) =>
              setFormData({ ...formData, safetyFactor: parseFloat(e.target.value) || 1.5 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">{t('safetyFactorHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('encoderType')}
          </label>
          <select
            value={formData.encoderType}
            onChange={(e) =>
              setFormData({ ...formData, encoderType: e.target.value as 'SINGLE_TURN' | 'MULTI_TURN' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="SINGLE_TURN">{t('encoderTypes.singleTurn')}</option>
            <option value="MULTI_TURN">{t('encoderTypes.multiTurn')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('communication')}
          </label>
          <select
            value={formData.communication}
            onChange={(e) =>
              setFormData({ ...formData, communication: e.target.value as 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="ETHERCAT">{t('communications.ethercat')}</option>
            <option value="PROFINET">{t('communications.profinet')}</option>
            <option value="ETHERNET_IP">{t('communications.ethernetIp')}</option>
            <option value="ANALOG">{t('communications.analog')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('emcFilter')}
          </label>
          <select
            value={formData.emcFilter}
            onChange={(e) =>
              setFormData({ ...formData, emcFilter: e.target.value as 'NONE' | 'C3' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="NONE">{t('emcFilters.none')}</option>
            <option value="C3">{t('emcFilters.c3')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('cableLength')}
          </label>
          <select
            value={formData.cableLength}
            onChange={(e) =>
              setFormData({ ...formData, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value={3}>3m</option>
            <option value={5}>5m</option>
            <option value={10}>10m</option>
            <option value={15}>15m</option>
            <option value={20}>20m</option>
            <option value="TERMINAL_ONLY">{t('cableLengthOptions.terminalOnly')}</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('common:common.back')}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('startSizing')}
        </button>
      </div>
    </form>
  );
}
