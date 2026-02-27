'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { MotionParams } from '@/types';
import { useState } from 'react';

export function MotionStep() {
  const { input, setMotion, nextStep, prevStep } = useWizardStore();

  const [formData, setFormData] = useState<MotionParams>(
    input.motion || {
      stroke: 500,
      maxVelocity: 500,
      maxAcceleration: 5000,
      profile: 'TRAPEZOIDAL',
      dwellTime: 0.5,
      cycleTime: 3,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMotion(formData);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">运动参数</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            行程 (mm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.stroke}
            onChange={(e) =>
              setFormData({ ...formData, stroke: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            最大速度 (mm/s) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.maxVelocity}
            onChange={(e) =>
              setFormData({ ...formData, maxVelocity: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            最大加速度 (mm/s²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.maxAcceleration}
            onChange={(e) =>
              setFormData({ ...formData, maxAcceleration: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            运动曲线
          </label>
          <select
            value={formData.profile}
            onChange={(e) =>
              setFormData({ ...formData, profile: e.target.value as 'TRAPEZOIDAL' | 'S_CURVE' })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          >
            <option value="TRAPEZOIDAL">梯形曲线</option>
            <option value="S_CURVE">S曲线</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            停顿时间 (s)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.dwellTime}
            onChange={(e) =>
              setFormData({ ...formData, dwellTime: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            循环周期 (s)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.cycleTime}
            onChange={(e) =>
              setFormData({ ...formData, cycleTime: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-gray-900"
          />
        </div>
      </div>

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
