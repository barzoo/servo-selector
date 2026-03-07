'use client';

import { useProjectStore } from '@/stores/project-store';
import { SystemPreferences } from '@/types';
import { useState } from 'react';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { useTranslations } from 'next-intl';

export function SystemConfigStep() {
  const { project, currentAxisId, input, setPreferences, setResult, prevStep, completeWizard } = useProjectStore();
  const currentAxis = project.axes.find(a => a.id === currentAxisId);
  const t = useTranslations('systemConfig');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<SystemPreferences>(
    input.preferences || {
      encoderType: 'BOTH',
      safety: 'NONE',
    }
  );

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Debug logging
    console.log('Form submitted', { input });

    // Check if all required data is present
    // Project info is now at project level (shared)
    if (!project.name) {
      console.error('Missing project info');
      setError('缺少项目信息，请在侧边栏填写');
      return;
    }
    if (!currentAxis?.input.mechanism) {
      console.error('Missing mechanism');
      setError('缺少机械结构信息，请返回第一步填写');
      return;
    }
    if (!currentAxis?.input.motion) {
      console.error('Missing motion');
      setError('缺少运动参数信息，请返回第二步填写');
      return;
    }
    if (!currentAxis?.input.dutyConditions) {
      console.error('Missing duty');
      setError('缺少工作条件信息，请返回第三步填写');
      return;
    }

    // Save preferences
    setPreferences(formData);

    // Execute sizing calculation - merge common params and axis-specific params
    try {
      const engine = new SizingEngine();
      // Build project info from project level
      const projectInfo = {
        name: project.name,
        customer: project.customer,
        salesPerson: project.salesPerson,
        notes: project.notes,
      };
      // Convert dutyConditions to duty format expected by engine
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
          // Common params (shared across all axes)
          safetyFactor: project.commonParams.safetyFactor,
          maxInertiaRatio: project.commonParams.maxInertiaRatio,
          targetInertiaRatio: project.commonParams.targetInertiaRatio,
          communication: project.commonParams.communication,
          cableLength: project.commonParams.cableLength,
          // Axis-specific params
          encoderType: formData.encoderType,
          safety: formData.safety,
        },
      });
      console.log('Calculation result:', result);
      setResult(result);
      completeWizard();
    } catch (err) {
      console.error('Calculation failed:', err);
      setError('选型计算失败，请检查输入参数');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>

      {/* Simplified hint - common params are shown in sidebar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          请确认轴特有的系统配置选项。
          公共参数（安全系数、惯量比、通信协议等）可在侧边栏查看和修改。
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

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
