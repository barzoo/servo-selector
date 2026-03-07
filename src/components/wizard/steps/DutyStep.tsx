'use client';

import { useProjectStore } from '@/stores/project-store';
import { DutyConditions } from '@/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const BRAKE_OPTIONS = [
  { value: false, label: '无刹车', desc: '标准配置，适合水平轴应用' },
  { value: true, label: '带刹车', desc: '抱闸制动，适合垂直轴或需要保持力矩的应用' },
];

export function DutyStep() {
  const { project, currentAxisId, updateAxisDutyConditions, nextStep, prevStep } = useProjectStore();
  const t = useTranslations('duty');
  const commonT = useTranslations('common');

  const currentAxis = project.axes.find(a => a.id === currentAxisId);

  // 电机轴类型选项（使用翻译）
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 标题和提示 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          环境参数（温度 {project.commonParams.ambientTemp}°C，防护等级 {project.commonParams.ipRating}）
          已在项目设置中配置，
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-project-settings'))}
            className="text-blue-600 hover:underline"
          >
            点击修改
          </button>
        </p>
      </div>

      {/* 轴特有参数 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* dutyCycle */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('dutyCycle')} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.dutyCycle}
            onChange={(e) => setFormData({ ...formData, dutyCycle: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          >
            <option value={100}>S1 (100% - 连续工作)</option>
            <option value={60}>S2 (60% - 短时工作)</option>
            <option value={40}>S3 (40% - 间歇工作)</option>
            <option value={25}>S4 (25% - 频繁启停)</option>
          </select>
        </div>

        {/* mountingOrientation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('mountingOrientation')} <span className="text-red-500">*</span>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900 bg-white"
          >
            <option value="HORIZONTAL">{t('orientations.horizontal')}</option>
            <option value="VERTICAL_UP">{t('orientations.verticalUp')}</option>
            <option value="VERTICAL_DOWN">{t('orientations.verticalDown')}</option>
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

      {/* 电机轴类型选项 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('keyShaft')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {keyShaftOptions.map((opt) => (
            <label
              key={opt.value}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.keyShaft === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="keyShaft"
                value={opt.value}
                checked={formData.keyShaft === opt.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keyShaft: e.target.value as 'L' | 'K',
                  })
                }
                className="sr-only"
              />
              <div className={`font-medium text-sm ${formData.keyShaft === opt.value ? 'text-blue-900' : 'text-gray-900'}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1 ${formData.keyShaft === opt.value ? 'text-blue-700' : 'text-gray-500'}`}>
                {opt.desc}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 按钮 */}
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
