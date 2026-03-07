'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { CommonParams } from '@/types';
import { useTranslations } from 'next-intl';

interface CommonParamsEditStepProps {
  onComplete?: () => void;
}

export function CommonParamsEditStep({ onComplete }: CommonParamsEditStepProps) {
  const { project, updateCommonParams } = useProjectStore();
  const t = useTranslations('projectSettings');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<CommonParams>(project.commonParams);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommonParams(formData);
    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">编辑公共参数</h2>
        <p className="mt-2 text-sm text-gray-500">
          修改公共参数，这些参数将应用于所有轴
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('ambientTemp')}
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={formData.ambientTemp}
              onChange={(e) => setFormData({ ...formData, ambientTemp: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            />
            <span className="ml-2 text-gray-500">°C</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('ipRating')}
          </label>
          <select
            value={formData.ipRating}
            onChange={(e) => setFormData({ ...formData, ipRating: e.target.value as CommonParams['ipRating'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          >
            <option value="IP54">IP54</option>
            <option value="IP65">IP65</option>
            <option value="IP67">IP67</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('communication')}
          </label>
          <select
            value={formData.communication}
            onChange={(e) => setFormData({ ...formData, communication: e.target.value as CommonParams['communication'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          >
            <option value="ETHERCAT">EtherCAT</option>
            <option value="PROFINET">PROFINET</option>
            <option value="ETHERNET_IP">EtherNet/IP</option>
            <option value="ANALOG">Analog</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('cableLength')}
          </label>
          <select
            value={formData.cableLength}
            onChange={(e) => setFormData({ ...formData, cableLength: e.target.value === 'TERMINAL_ONLY' ? 'TERMINAL_ONLY' : parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          >
            <option value="TERMINAL_ONLY">{t('terminalOnly')}</option>
            <option value={3}>3m</option>
            <option value={5}>5m</option>
            <option value={10}>10m</option>
            <option value={15}>15m</option>
            <option value={20}>20m</option>
            <option value={25}>25m</option>
            <option value={30}>30m</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('safetyFactor')}
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            value={formData.safetyFactor}
            onChange={(e) => setFormData({ ...formData, safetyFactor: parseFloat(e.target.value) || 1 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('maxInertiaRatio')}
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              value={formData.maxInertiaRatio}
              onChange={(e) => setFormData({ ...formData, maxInertiaRatio: parseInt(e.target.value) || 10 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            />
            <span className="ml-2 text-gray-500">:1</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            目标惯量比
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              value={formData.targetInertiaRatio}
              onChange={(e) => setFormData({ ...formData, targetInertiaRatio: parseInt(e.target.value) || 5 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
            />
            <span className="ml-2 text-gray-500">:1</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {commonT('cancel')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {commonT('save')}
        </button>
      </div>
    </form>
  );
}
