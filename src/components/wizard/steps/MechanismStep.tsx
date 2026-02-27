'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { MechanismConfig, MechanismType, BallScrewParams } from '@/types';
import { useState } from 'react';

const mechanismTypes: { value: MechanismType; label: string }[] = [
  { value: 'BALL_SCREW', label: '滚珠丝杠' },
  { value: 'GEARBOX', label: '齿轮/减速机' },
  { value: 'DIRECT_DRIVE', label: '直接驱动' },
  { value: 'BELT', label: '同步带/皮带' },
  { value: 'RACK_PINION', label: '齿条齿轮' },
];

export function MechanismStep() {
  const { input, setMechanism, nextStep, prevStep } = useWizardStore();

  const [formData, setFormData] = useState<MechanismConfig>(
    input.mechanism || {
      type: 'BALL_SCREW',
      params: {
        loadMass: 100,
        lead: 10,
        screwDiameter: 20,
        screwLength: 500,
        gearRatio: 1,
        efficiency: 0.9,
        frictionCoeff: 0.05,
        preloadTorque: 0,
      } as BallScrewParams,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMechanism(formData);
    nextStep();
  };

  const renderParamsForm = () => {
    const params = formData.params as BallScrewParams;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            负载质量 (kg) <span className="text-red-500">*</span>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            丝杠导程 (mm) <span className="text-red-500">*</span>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            丝杠直径 (mm)
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            丝杠长度 (mm)
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            减速比
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            机械效率
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">机械参数</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          传动方式 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              type: e.target.value as MechanismType,
              params: formData.params,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
        >
          {mechanismTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {renderParamsForm()}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          上一步
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          下一步
        </button>
      </div>
    </form>
  );
}
