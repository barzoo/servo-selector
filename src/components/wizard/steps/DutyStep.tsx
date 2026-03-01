'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { DutyConditions } from '@/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const BRAKE_OPTIONS = [
  { value: false, label: '无刹车', desc: '标准配置，适合水平轴应用' },
  { value: true, label: '带刹车', desc: '抱闸制动，适合垂直轴或需要保持力矩的应用' },
];

export function DutyStep() {
  const { input, setDuty, nextStep, prevStep } = useWizardStore();
  const t = useTranslations('duty');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<DutyConditions>(
    input.duty || {
      ambientTemp: 40,
      dutyCycle: 60,
      mountingOrientation: 'HORIZONTAL',
      ipRating: 'IP65',
      brake: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuty(formData);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('ambientTemp')}
          </label>
          <input
            type="number"
            value={formData.ambientTemp}
            onChange={(e) =>
              setFormData({ ...formData, ambientTemp: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('dutyCycle')}
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.dutyCycle}
            onChange={(e) =>
              setFormData({ ...formData, dutyCycle: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('mountingOrientation')}
          </label>
          <select
            value={formData.mountingOrientation}
            onChange={(e) => {
              const newOrientation = e.target.value as 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
              setFormData({
                ...formData,
                mountingOrientation: newOrientation,
                brake: newOrientation.startsWith('VERTICAL'),
              });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="HORIZONTAL">{t('orientations.horizontal')}</option>
            <option value="VERTICAL_UP">{t('orientations.verticalUp')}</option>
            <option value="VERTICAL_DOWN">{t('orientations.verticalDown')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('ipRating')}
          </label>
          <select
            value={formData.ipRating}
            onChange={(e) =>
              setFormData({ ...formData, ipRating: e.target.value as 'IP54' | 'IP65' | 'IP67' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="IP54">IP54</option>
            <option value="IP65">IP65</option>
            <option value="IP67">IP67</option>
          </select>
        </div>
      </div>

      {/* 刹车选项 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          电机刹车
          {formData.mountingOrientation.startsWith('VERTICAL') && (
            <span className="ml-2 text-xs text-amber-600">(垂直轴建议带刹车)</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {BRAKE_OPTIONS.map((opt) => (
            <label
              key={opt.value ? 'yes' : 'no'}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.brake === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="brake"
                value={opt.value ? 'true' : 'false'}
                checked={formData.brake === opt.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brake: e.target.value === 'true',
                  })
                }
                className="sr-only"
              />
              <div className={`font-medium text-sm ${formData.brake === opt.value ? 'text-blue-900' : 'text-gray-900'}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1 ${formData.brake === opt.value ? 'text-blue-700' : 'text-gray-500'}`}>
                {opt.desc}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {commonT('back')}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {commonT('next')}
        </button>
      </div>
    </form>
  );
}
