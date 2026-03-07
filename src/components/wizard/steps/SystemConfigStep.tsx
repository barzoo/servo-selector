'use client';

import { useProjectStore } from '@/stores/project-store';
import { SystemPreferences } from '@/types';
import { useState } from 'react';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { useTranslations } from 'next-intl';

export function SystemConfigStep() {
  const { project, input, setPreferences, setResult, prevStep, completeWizard } = useProjectStore();
  const t = useTranslations('systemConfig');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<SystemPreferences>(
    input.preferences || {
      encoderType: 'BOTH',
      safety: 'NONE',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences(formData);

    // 执行选型计算 - 合并公共参数和轴特有参数
    if (input.project && input.mechanism && input.motion && input.duty) {
      const engine = new SizingEngine();
      const result = engine.calculate({
        project: input.project,
        mechanism: input.mechanism,
        motion: input.motion,
        duty: input.duty,
        preferences: {
          // 公共参数
          safetyFactor: project.commonParams.safetyFactor,
          maxInertiaRatio: project.commonParams.maxInertiaRatio,
          targetInertiaRatio: project.commonParams.targetInertiaRatio,
          communication: project.commonParams.communication,
          cableLength: project.commonParams.cableLength,
          // 轴特有参数
          encoderType: formData.encoderType,
          safety: formData.safety,
        },
      });
      setResult(result);
      completeWizard();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      {/* 公共参数提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>公共参数（所有轴共享）：</strong>
          安全系数 {project.commonParams.safetyFactor}、
          目标惯量比 {project.commonParams.targetInertiaRatio}:1、
          通信协议 {project.commonParams.communication}、
          电缆长度 {typeof project.commonParams.cableLength === 'number' ? `${project.commonParams.cableLength}m` : '仅接线端子'}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-project-settings'))}
            className="ml-2 text-blue-600 hover:underline"
          >
            修改
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('safety')}
          </label>
          <select
            value={formData.safety}
            onChange={(e) =>
              setFormData({ ...formData, safety: e.target.value as 'STO' | 'NONE' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="NONE">{t('safetyOptions.none')}</option>
            <option value="STO">{t('safetyOptions.sto')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            编码器类型
          </label>
          <select
            value={formData.encoderType}
            onChange={(e) =>
              setFormData({ ...formData, encoderType: e.target.value as 'A' | 'B' | 'BOTH' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="BOTH">两者都可 (显示所有选项)</option>
            <option value="A">A型 - 电池盒式多圈 (2.5Mbps)</option>
            <option value="B">B型 - 机械式多圈 (5Mbps)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            A型需要电池维护，B型为机械式免维护但价格较高
          </p>
        </div>
      </div>

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
          {t('startSizing')}
        </button>
      </div>
    </form>
  );
}
